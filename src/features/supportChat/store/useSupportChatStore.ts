import { create } from "zustand"
import { toast } from "sonner"
import type { UiConversation, UiMessage } from "../model/types"

type ConnectionState = "disconnected" | "connecting" | "connected"

type SupportChatState = {
  connection: ConnectionState
  conversations: UiConversation[]
  selectedConversationId: number | null
  messagesByConversationId: Record<number, UiMessage[]>
  unreadByConversationId: Record<number, number>
  isLoadingConversations: boolean
  isLoadingMessages: boolean
  error: string | null

  setConnection: (s: ConnectionState) => void
  setConversations: (convs: UiConversation[]) => void
  upsertConversationPreview: (convId: number, patch: Partial<UiConversation>) => void
  selectConversation: (convId: number | null) => void
  setMessages: (convId: number, messages: UiMessage[]) => void
  appendMessage: (convId: number, message: UiMessage) => void
  markRead: (convId: number) => void
  setUnread: (convId: number, count: number) => void
  setIsLoadingConversations: (v: boolean) => void
  setIsLoadingMessages: (v: boolean) => void
  setError: (msg: string | null) => void
}

export const useSupportChatStore = create<SupportChatState>((set) => ({
  connection: "disconnected",
  conversations: [],
  selectedConversationId: null,
  messagesByConversationId: {},
  unreadByConversationId: {},
  isLoadingConversations: false,
  isLoadingMessages: false,
  error: null,

  setConnection: (s) => set({ connection: s }),

  setConversations: (convs) =>
    set((prev) => {
      const unread: Record<number, number> = { ...prev.unreadByConversationId }
      for (const c of convs) unread[c.id] = unread[c.id] ?? c.unread ?? 0
      return { conversations: convs, unreadByConversationId: unread }
    }),

  upsertConversationPreview: (convId, patch) =>
    set((prev) => {
      const idx = prev.conversations.findIndex((c) => c.id === convId)
      const next = [...prev.conversations]
      if (idx === -1) {
        next.push({
          id: convId,
          title: patch.title ?? "Support",
          avatarText: patch.avatarText ?? "S",
          preview: patch.preview ?? "",
          timestampLabel: patch.timestampLabel ?? "",
          updatedAtMs: patch.updatedAtMs ?? Date.now(),
          unread: patch.unread ?? 0,
        })
      } else {
        next[idx] = { ...next[idx], ...patch }
      }
      next.sort((a, b) => b.updatedAtMs - a.updatedAtMs)
      return { conversations: next }
    }),

  selectConversation: (convId) => set({ selectedConversationId: convId }),

  setMessages: (convId, messages) =>
    set((prev) => ({
      messagesByConversationId: { ...prev.messagesByConversationId, [convId]: messages },
    })),

  appendMessage: (convId, message) =>
    set((prev) => {
      const current = prev.messagesByConversationId[convId] ?? []
      return {
        messagesByConversationId: { ...prev.messagesByConversationId, [convId]: [...current, message] },
      }
    }),

  markRead: (convId) =>
    set((prev) => ({
      unreadByConversationId: { ...prev.unreadByConversationId, [convId]: 0 },
    })),

  setUnread: (convId, count) =>
    set((prev) => ({
      unreadByConversationId: { ...prev.unreadByConversationId, [convId]: Math.max(0, count) },
    })),

  setIsLoadingConversations: (v) => set({ isLoadingConversations: v }),
  setIsLoadingMessages: (v) => set({ isLoadingMessages: v }),

  setError: (msg) => {
    set({ error: msg })
    if (msg) toast.error(msg)
  },
}))
