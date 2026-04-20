import * as React from "react";
import { Search, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge, Button, Drawer, Input } from "antd";
import { useSupportChat } from "@/features/supportChat/hooks/useSupportChat";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import type { UiConversation, UiMessage } from "@/features/supportChat/model/types";
import { StaffRoleBadge } from "@/components/chat/StaffRoleBadge";
import { isStaffRoleId, STAFF_ROLE_ID } from "@/components/chat/staffRole";
import { resolveUserRole } from "@/utils/authRole";

const ConversationSkeleton = () => {
  return (
    <div className="space-y-2 p-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5"
        >
          <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
            <div className="h-3 w-full rounded bg-muted animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
};

const MessageSkeleton = () => {
  return (
    <div className="space-y-4 px-3 py-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className={cn("flex", i % 2 === 0 ? "justify-start" : "justify-end")}
        >
          <div className="h-10 w-[70%] max-w-[420px] rounded-2xl bg-muted animate-pulse" />
        </div>
      ))}
    </div>
  );
};

const ScrollToBottomOnNewMessages = ({
  containerRef,
  depKey,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  depKey: string;
}) => {
  const lastScrollInfoRef = React.useRef({ key: "", wasNearBottom: true });

  React.useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const thresholdPx = 120;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    lastScrollInfoRef.current = {
      key: depKey,
      wasNearBottom: distanceToBottom < thresholdPx,
    };
  });

  React.useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!lastScrollInfoRef.current.wasNearBottom) return;
    el.scrollTop = el.scrollHeight;
  }, [containerRef, depKey]);

  return null;
};

const SidebarItem = ({
  conv,
  selected,
  unread,
  onClick,
}: {
  conv: UiConversation;
  selected: boolean;
  unread: number;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted/50",
        selected && "bg-muted"
      )}
    >
      <div className="h-9 w-9 shrink-0 rounded-full bg-background/60 border border-border/60 grid place-items-center text-xs font-semibold">
        {conv.avatarText}
      </div>
      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="truncate font-medium" title={conv.title}>
              {conv.title}
            </span>
            {isStaffRoleId(conv.peerRoleId) && <StaffRoleBadge />}
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {conv.timestampLabel}
          </span>
        </div>
        <p className="mt-0.5 line-clamp-2 wrap-break-word text-sm text-muted-foreground" title={conv.preview}>
          {conv.preview}
        </p>
      </div>
      {unread > 0 && (
        <Badge count={unread} size="small" />
      )}
    </button>
  );
};

const MessageBubble = ({ msg }: { msg: UiMessage }) => {
  const outgoing = msg.direction === "outgoing";
  const isFailed = msg.status === "failed";
  const staffSender = isStaffRoleId(msg.senderRoleId);
  return (
    <div className={cn("flex", outgoing ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[92%] min-w-0 rounded-2xl px-4 py-2 overflow-hidden wrap-break-word",
          outgoing ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-muted text-foreground",
          isFailed && "opacity-80"
        )}
      >
        {staffSender && (
          <div className={cn("mb-1.5 flex", outgoing ? "justify-end" : "justify-start")}>
            <StaffRoleBadge
              className={
                outgoing
                  ? "border-primary-foreground/40 bg-primary-foreground/15 text-primary-foreground"
                  : undefined
              }
            />
          </div>
        )}
        <p className="text-sm wrap-break-word">{msg.type === "text" ? msg.text : "Action message"}</p>
        <div className="mt-1 flex items-center justify-end gap-2 text-xs opacity-80">
          {outgoing && msg.status === "sending" && <span>Sending…</span>}
          {outgoing && msg.status === "failed" && <span>Failed</span>}
          <span>{msg.timeLabel}</span>
        </div>
      </div>
    </div>
  );
};

export const SupportChat = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const staffMessagesOnly = import.meta.env.VITE_CHAT_STAFF_MESSAGES_ONLY === "true";
  const {
    connection,
    isLoadingConversations,
    isLoadingMessages,
    conversations,
    selectedConversationId,
    unreadByConversationId,
    messagesByConversationId,
    selectConversation,
    contactSupport,
    sendTextMessage,
    sendVoucher,
  } = useSupportChat();

  const selectedConv = React.useMemo(
    () => conversations.find((c) => c.id === selectedConversationId) ?? null,
    [conversations, selectedConversationId]
  );

  const [search, setSearch] = React.useState("");
  const [input, setInput] = React.useState("");
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const threadRef = React.useRef<HTMLDivElement | null>(null);

  const filteredConversations = React.useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return conversations;
    return conversations.filter((c) => c.title.toLowerCase().includes(s) || c.preview.toLowerCase().includes(s));
  }, [conversations, search]);

  const messages = React.useMemo(() => {
    if (!selectedConversationId) return [];
    return messagesByConversationId[selectedConversationId] ?? [];
  }, [messagesByConversationId, selectedConversationId]);

  const threadMessages = React.useMemo(() => {
    if (!staffMessagesOnly) return messages;
    return messages.filter((m) => {
      if (m.senderRoleId === STAFF_ROLE_ID) return true;
      if (m.direction === "outgoing" && resolveUserRole(user as unknown as Record<string, unknown>) === "staff") return true;
      return false;
    });
  }, [messages, staffMessagesOnly, user?.role]);

  const depKey = `${selectedConversationId ?? "none"}:${threadMessages.length}`;

  const onSend = React.useCallback(() => {
    const text = input.trim();
    if (!text) return;
    // Structured voucher send (compatible with plain text UI):
    // `/voucher CODE optional message...`
    if (text.toLowerCase().startsWith("/voucher ")) {
      const rest = text.slice("/voucher ".length).trim();
      const [code, ...msgParts] = rest.split(/\s+/).filter(Boolean);
      if (code) {
        sendVoucher({ code, message: msgParts.join(" ") });
        setInput("");
        return;
      }
    }

    sendTextMessage({ conversationId: selectedConversationId ?? undefined, text });
    setInput("");
  }, [input, selectedConversationId, sendTextMessage, sendVoucher]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const conversationsPanel = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-col gap-3 p-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold">Support</h2>
          <span className="text-xs text-muted-foreground">{connection}</span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button type="primary" onClick={contactSupport}>
          Contact support
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        {isLoadingConversations ? (
          <ConversationSkeleton />
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">
            No conversations yet. Click <span className="font-medium">Contact support</span> to start.
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredConversations.map((conv) => (
              <SidebarItem
                key={conv.id}
                conv={conv}
                selected={selectedConversationId === conv.id}
                unread={unreadByConversationId[conv.id] ?? conv.unread}
                onClick={() => {
                  setDrawerOpen(false);
                  void selectConversation(conv.id);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-svh w-full min-w-0 overflow-hidden bg-background">
      {isMobile ? (
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          placement="left"
          width={340}
          styles={{ body: { padding: 0 } }}
        >
          <div className="h-full border-r border-border/50 bg-muted/30">{conversationsPanel}</div>
        </Drawer>
      ) : (
        <aside className="flex h-full w-[320px] min-w-[280px] max-w-[420px] shrink-0 flex-col border-r border-border/50 bg-muted/30">
          {conversationsPanel}
        </aside>
      )}

      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/50 px-3 py-2.5">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              {isMobile && (
                <Button
                  size="small"
                  className="mr-1 shrink-0"
                  onClick={() => setDrawerOpen(true)}
                >
                  Conversations
                </Button>
              )}
              <p className="font-semibold truncate">
                {selectedConv?.title ?? (selectedConversationId ? "Conversation" : "New message")}
              </p>
              {selectedConv && isStaffRoleId(selectedConv.peerRoleId) && <StaffRoleBadge />}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedConversationId ? `#${selectedConversationId}` : "Contact support to get started"}
            </p>
          </div>
        </div>

        <div ref={threadRef} className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 pt-3 pb-4">
          <ScrollToBottomOnNewMessages containerRef={threadRef} depKey={depKey} />
          {isLoadingMessages ? (
            <MessageSkeleton />
          ) : !selectedConversationId ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
              <div className="max-w-md space-y-2">
                <p className="text-base font-medium text-foreground">Need help?</p>
                <p className="text-sm">Click “Contact support”, or just send your first message below.</p>
              </div>
            </div>
          ) : threadMessages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              {staffMessagesOnly ? "No staff messages in this conversation yet." : "No messages yet."}
            </div>
          ) : (
            <div className="flex w-full flex-col gap-4 pb-6">
              {threadMessages.map((m) => (
                <MessageBubble key={m.id} msg={m} />
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 border-t border-border/50 px-3 py-3">
          <Input
            placeholder="Type a message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            className="min-w-0 flex-1"
          />
          <Button type="primary" onClick={onSend} aria-label="Send message">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  );
};

