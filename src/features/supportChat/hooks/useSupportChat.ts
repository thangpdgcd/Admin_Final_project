import * as React from "react";
import { useAuth } from "@/hooks/useAuth";
import { resolveUserRole } from "@/utils/authRole";
import { chatApi } from "../api/chatApi";
import { normalizeConversation, normalizeMessage, toConversationTimestampLabel, toTimeLabel } from "../model/normalize";
import type { MessageDto, UiMessage } from "../model/types";
import { chatSocket } from "../socket/chatSocket";
import { useSupportChatStore } from "../store/useSupportChatStore";

const STAFF_ROLE_ID = "3";

const guessDirection = (msg: MessageDto, currentUserId?: string): UiMessage["direction"] => {
  const sender = typeof msg.senderUserId === "number" ? String(msg.senderUserId) : undefined;
  if (!currentUserId || !sender) return "incoming";
  return sender === currentUserId ? "outgoing" : "incoming";
};

const extractMessageDto = (payload: unknown): MessageDto | null => {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;
  const msg = (p.message ?? p) as Record<string, unknown>;
  const id = msg.id;
  const conversationId = msg.conversationId;
  const type = msg.type;
  if (typeof conversationId !== "number") return null;
  if (type !== "text" && type !== "action") return null;
  if (typeof id !== "number") return null;

  const senderRoleRaw = msg.senderRoleId ?? p.senderRoleId;
  const senderRoleId =
    senderRoleRaw !== undefined && senderRoleRaw !== null ? String(senderRoleRaw) : undefined;

  const base = msg as unknown as MessageDto;
  return {
    ...base,
    senderRoleId,
    content: base.content ?? base.text ?? (typeof msg.text === "string" ? msg.text : undefined),
  };
};

const extractVoucherPayload = (payload: unknown) => {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;
  const code = typeof p.code === "string" ? p.code.trim() : "";
  const message = typeof p.message === "string" ? p.message.trim() : "";
  const userIdRaw = p.userId;
  const userId = userIdRaw != null ? String(userIdRaw).trim() : "";
  if (!code) return null;
  return { code, message, userId };
};

export function useSupportChat() {
  const { user } = useAuth();
  const store = useSupportChatStore();

  const selectedConversationId = useSupportChatStore((s) => s.selectedConversationId);
  const conversations = useSupportChatStore((s) => s.conversations);
  const unreadByConversationId = useSupportChatStore((s) => s.unreadByConversationId);
  const messagesByConversationId = useSupportChatStore((s) => s.messagesByConversationId);

  const loadConversations = React.useCallback(async () => {
    store.setIsLoadingConversations(true);
    try {
      const dtos = await chatApi.listConversations();
      const convs = dtos
        .map((d) => normalizeConversation(d, { currentUserId: user?._id }))
        .sort((a, b) => b.updatedAtMs - a.updatedAtMs);
      store.setConversations(convs);
    } catch (e) {
      store.setError(e instanceof Error ? e.message : "Failed to load conversations");
    } finally {
      store.setIsLoadingConversations(false);
    }
  }, [store, user?._id]);

  const loadMessages = React.useCallback(
    async (conversationId: number) => {
      store.setIsLoadingMessages(true);
      try {
        const msgs = await chatApi.getMessages(conversationId, { limit: 50, offset: 0 });
        const ui = msgs
          .slice()
          .sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""))
          .map((m) => normalizeMessage(m, { direction: guessDirection(m, user?._id) }));
        store.setMessages(conversationId, ui);
      } catch (e) {
        store.setError(e instanceof Error ? e.message : "Failed to load messages");
      } finally {
        store.setIsLoadingMessages(false);
      }
    },
    [store, user?._id]
  );

  const connectSocket = React.useCallback(() => {
    store.setConnection("connecting");
    const s = chatSocket.connect();
    if (!s) {
      store.setConnection("disconnected");
      return;
    }
    s.on("connect", () => store.setConnection("connected"));
    s.on("disconnect", () => store.setConnection("disconnected"));
    s.on("error", (err) => {
      const msg = err instanceof Error ? err.message : "Socket error";
      store.setError(msg);
    });

    const handleIncoming = (payload: unknown) => {
      const dto = extractMessageDto(payload);
      if (!dto) return;
      const convId = dto.conversationId;
      const ui = normalizeMessage(dto, { direction: guessDirection(dto, user?._id) });

      // optimistic reconciliation: replace a pending outgoing with same text if any
      const existing = useSupportChatStore.getState().messagesByConversationId[convId] ?? [];
      const pendingIdx =
        ui.direction === "outgoing"
          ? existing.findIndex(
              (m) =>
                m.status === "sending" &&
                m.type === "text" &&
                ui.type === "text" &&
                (m.text ?? "") === (ui.text ?? "") &&
                Math.abs(m.createdAtMs - ui.createdAtMs) < 30_000
            )
          : -1;

      if (pendingIdx >= 0) {
        const next = [...existing];
        next[pendingIdx] = ui;
        useSupportChatStore.getState().setMessages(convId, next);
      } else {
        store.appendMessage(convId, ui);
      }

      // sidebar preview + unread
      store.upsertConversationPreview(convId, {
        preview: ui.type === "text" ? ui.text ?? "" : "Updated details",
        updatedAtMs: ui.createdAtMs,
        timestampLabel: toConversationTimestampLabel(ui.createdAtMs),
      });

      const selected = useSupportChatStore.getState().selectedConversationId;
      if (selected === null) {
        store.selectConversation(convId);
        store.markRead(convId);
        void loadMessages(convId);
      } else if (selected !== convId) {
        const current = useSupportChatStore.getState().unreadByConversationId[convId] ?? 0;
        store.setUnread(convId, current + 1);
      }
    };

    s.on("receive_message", handleIncoming);
    s.on("chat:message", handleIncoming);

    const handleVoucher = (payload: unknown) => {
      const v = extractVoucherPayload(payload);
      if (!v) return;
      const convId = useSupportChatStore.getState().selectedConversationId;
      if (convId == null) return;
      const now = Date.now();
      const ui: UiMessage = {
        id: `voucher-${now}-${Math.random().toString(16).slice(2)}`,
        conversationId: convId,
        type: "action",
        text: `Voucher code: ${v.code}${v.message ? ` — ${v.message}` : ""}`,
        createdAtMs: now,
        timeLabel: toTimeLabel(now),
        direction: "incoming",
        status: "sent",
      };
      store.appendMessage(convId, ui);
      store.upsertConversationPreview(convId, {
        preview: ui.text ?? "",
        updatedAtMs: ui.createdAtMs,
        timestampLabel: toConversationTimestampLabel(ui.createdAtMs),
      });
    };

    s.on("send_voucher", handleVoucher);
  }, [store, user?._id]);

  React.useEffect(() => {
    void loadConversations();
    connectSocket();
    return () => {
      chatSocket.disconnect();
    };
  }, [connectSocket, loadConversations]);

  const selectConversation = React.useCallback(
    async (conversationId: number) => {
      store.selectConversation(conversationId);
      store.markRead(conversationId);
      const s = chatSocket.get() ?? chatSocket.connect();
      if (!s) {
        store.setError("Socket not connected");
        return;
      }
      s.emit("join_room", { conversationId });
      await loadMessages(conversationId);
    },
    [loadMessages, store]
  );

  const contactSupport = React.useCallback(() => {
    const s = chatSocket.get() ?? chatSocket.connect();
    if (!s) {
      store.setError("Socket not connected");
      return;
    }
    s.emit("join_room", {});
  }, [store]);

  const sendVoucher = React.useCallback(
    (args: { code: string; message?: string }) => {
      const code = String(args.code ?? "").trim();
      const message = String(args.message ?? "").trim();
      if (!code) return;

      const convId = useSupportChatStore.getState().selectedConversationId;
      if (convId == null) {
        store.setError("Select a conversation first");
        return;
      }
      const conv = useSupportChatStore.getState().conversations.find((c) => c.id === convId);
      const userId = conv?.peerUserId;
      if (typeof userId !== "number") {
        store.setError("Missing recipient userId");
        return;
      }

      const s = chatSocket.get() ?? chatSocket.connect();
      if (!s) {
        store.setError("Socket not connected");
        return;
      }

      s.emit("send_voucher", { userId, code, message: message || undefined });
    },
    [store]
  );

  const sendTextMessage = React.useCallback(
    (args: { conversationId?: number; recipientUserId?: number; text: string }) => {
      const text = args.text.trim();
      if (!text) return;
      const now = Date.now();
      const convId = args.conversationId ?? selectedConversationId ?? undefined;
      const nonce = `${now}-${Math.random().toString(16).slice(2)}`;

      const optimistic: UiMessage = {
        id: `client-${nonce}`,
        conversationId: convId,
        type: "text",
        text,
        senderRoleId: resolveUserRole(user as unknown as Record<string, unknown>) === "staff" ? STAFF_ROLE_ID : undefined,
        createdAtMs: now,
        timeLabel: toTimeLabel(now),
        direction: "outgoing",
        status: "sending",
        clientNonce: nonce,
      };

      if (convId) {
        store.appendMessage(convId, optimistic);
        store.upsertConversationPreview(convId, {
          preview: text,
          updatedAtMs: now,
          timestampLabel: toConversationTimestampLabel(now),
        });
      }

      try {
        const s = chatSocket.get() ?? chatSocket.connect();
        if (!s) {
          throw new Error("Socket not connected");
        }
        // Express backend persists conversation messages on `chat:message` (see chat.socket.js).
        if (convId != null) {
          s.emit("chat:message", {
            conversationId: convId,
            recipientUserId: args.recipientUserId,
            message: { type: "text", content: text },
          });
        } else {
          s.emit("send_message", {
            conversationId: args.conversationId,
            recipientUserId: args.recipientUserId,
            message: { type: "text", content: text },
          });
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to send";
        store.setError(msg);
        if (convId) {
          // mark last optimistic as failed
          const existing = useSupportChatStore.getState().messagesByConversationId[convId] ?? [];
          const idx = existing.findIndex((m) => m.id === optimistic.id);
          if (idx >= 0) {
            const next = [...existing];
            next[idx] = { ...next[idx], status: "failed" };
            store.setMessages(convId, next);
          }
        }
      }
    },
    [selectedConversationId, store, user?.role]
  );

  return {
    connection: useSupportChatStore((s) => s.connection),
    isLoadingConversations: useSupportChatStore((s) => s.isLoadingConversations),
    isLoadingMessages: useSupportChatStore((s) => s.isLoadingMessages),
    error: useSupportChatStore((s) => s.error),

    conversations,
    selectedConversationId,
    unreadByConversationId,
    messagesByConversationId,

    loadConversations,
    selectConversation,
    contactSupport,
    sendTextMessage,
    sendVoucher,
  };
}

