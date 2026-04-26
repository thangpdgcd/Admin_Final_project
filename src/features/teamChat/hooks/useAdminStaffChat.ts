import * as React from "react"
import { chatSocket } from "@/features/supportChat/socket/chatSocket"
import { chatSocketDebug } from "@/features/supportChat/socket/chatSocketDebug"
import { api } from "@/api"
import { normalizeList } from "@/utils/apiResponse"
import { useAuth } from "@/hooks/useAuth"

const pickNumericUserId = (user: Record<string, unknown> | null | undefined): number | null => {
  if (!user) return null
  const raw = user.userId ?? user.user_ID ?? user._id ?? user.id
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

const normalizeConversationEvent = (
  evt: Record<string, unknown>,
  myAdminId: number | null,
  activeConversationId: string | number | null,
  peerIncomingRole = "staff",
) => {
  const convId = (evt?.conversationId ?? evt?.roomId) as string | number | undefined
  if (convId == null) return null
  if (activeConversationId != null && String(convId) !== String(activeConversationId)) return null

  const rawMsg = evt?.message as Record<string, unknown> | undefined
  if (!rawMsg || typeof rawMsg !== "object") return null

  const plain = (rawMsg.dataValues ??
    (typeof rawMsg.toJSON === "function" ? rawMsg.toJSON() : rawMsg) ??
    rawMsg) as Record<string, unknown>
  const senderUserId = plain.senderUserId ?? plain.sender_user_id ?? plain.senderUserID
  if (senderUserId == null || senderUserId === "") return null

  const text = String(plain.text ?? plain.content ?? "")
  const me = myAdminId != null && Number(senderUserId) === Number(myAdminId)
  const role = me ? "admin" : peerIncomingRole

  const ts =
    plain.createdAt != null
      ? typeof plain.createdAt === "number"
        ? plain.createdAt
        : new Date(String(plain.createdAt)).getTime()
      : Date.now()

  return {
    from: { userId: senderUserId, role },
    message: { type: "text" as const, content: text, ...(plain.id != null ? { id: plain.id } : {}) },
    ts,
    conversationId: convId,
  }
}

const mapApiMessageRow = (
  row: unknown,
  myAdminId: number | null,
  convId: number,
  peerIncomingRole = "staff",
) => {
  const plain =
    (row as { dataValues?: Record<string, unknown> }).dataValues ?? (row as Record<string, unknown>)
  const senderUserId = plain.senderUserId ?? plain.sender_user_id
  if (senderUserId == null || senderUserId === "") return null
  const text = String(plain.text ?? plain.content ?? "")
  const me = myAdminId != null && Number(senderUserId) === Number(myAdminId)
  const ts =
    plain.createdAt != null
      ? typeof plain.createdAt === "number"
        ? plain.createdAt
        : new Date(String(plain.createdAt)).getTime()
      : Date.now()
  return {
    from: { userId: senderUserId, role: me ? "admin" : peerIncomingRole },
    message: { type: "text" as const, content: text, ...(plain.id != null ? { id: plain.id } : {}) },
    ts,
    conversationId: convId,
  }
}

export type TeamChatMsg = {
  from: { userId: unknown; role: string }
  message: { type: string; content: string; id?: unknown }
  ts: number
  conversationId?: string | number
}

export const useAdminStaffChat = (selectedStaffId: string) => {
  const { user, token } = useAuth()
  const myAdminId = React.useMemo(() => pickNumericUserId(user as unknown as Record<string, unknown>), [user])

  const [messages, setMessages] = React.useState<TeamChatMsg[]>([])
  const [isTyping, setIsTyping] = React.useState(false)
  const [onlineMap, setOnlineMap] = React.useState<Record<string, boolean>>({})
  const [conversationId, setConversationId] = React.useState<number | null>(null)

  const selectedStaffIdRef = React.useRef(selectedStaffId)
  const conversationIdRef = React.useRef<number | null>(null)
  const historyLoadedForConvRef = React.useRef<number | null>(null)
  const seenRef = React.useRef(new Set<string>())
  const typingTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    selectedStaffIdRef.current = selectedStaffId
  }, [selectedStaffId])

  React.useEffect(() => {
    conversationIdRef.current = conversationId
  }, [conversationId])

  const buildKey = React.useCallback((evt: TeamChatMsg) => {
    const id = evt?.message?.id
    if (id != null) return `msg:${String(id)}`
    return `${evt?.ts ?? ""}:${evt?.from?.role ?? ""}:${String(evt?.from?.userId ?? "")}:${evt?.message?.content ?? ""}`
  }, [])

  React.useEffect(() => {
    if (!token) return
    chatSocket.connect("admin")
    const s = chatSocket.get()
    if (!s) return

    const syncOnline = async () => {
      try {
        const res = await api.get("/users/online", { suppressErrorToast: true })
        const { items } = normalizeList<{ userId?: number | string }>(res.data, [
          "data",
          "items",
          "rows",
          "users",
        ])
        const next: Record<string, boolean> = {}
        items.forEach((u) => {
          const id = u?.userId
          if (id != null && String(id)) next[String(id)] = true
        })
        setOnlineMap((prev) => ({ ...prev, ...next }))
      } catch {
        // ignore: presence list is an enhancement; socket events still update onlineMap.
      }
    }

    const rejoinIfNeeded = () => {
      const peerId = selectedStaffIdRef.current
      if (!peerId) return
      s.emit(
        "join_room",
        { recipientUserId: Number(peerId) },
        (res: { ok?: boolean; conversationId?: number }) => {
          chatSocketDebug("admin join_room ack", { peerId, res })
          if (res?.ok && res?.conversationId != null) {
            conversationIdRef.current = res.conversationId
            setConversationId(res.conversationId)
          }
        },
      )
    }

    // On first mount (and after any reconnect), refresh presence + rejoin active thread.
    const onConnect = () => {
      void syncOnline()
      rejoinIfNeeded()
    }
    s.on("connect", onConnect)
    // If already connected, run immediately.
    if (s.connected) onConnect()

    const onReceive = (evt: unknown) => {
      const e = evt as Record<string, unknown>
      const sel = selectedStaffIdRef.current
      const conv = conversationIdRef.current

      let normalized: TeamChatMsg | null = null
      if (e?.roomId != null || e?.conversationId != null) {
        normalized = normalizeConversationEvent(e, myAdminId, conv, "staff") as TeamChatMsg | null
        if (!normalized && sel) {
          const rawMsg = e?.message as Record<string, unknown> | undefined
          const plain = (rawMsg?.dataValues ??
            (rawMsg && typeof (rawMsg as { toJSON?: () => unknown }).toJSON === "function"
              ? (rawMsg as { toJSON: () => unknown }).toJSON()
              : rawMsg) ??
            rawMsg) as Record<string, unknown>
          const sid = plain?.senderUserId ?? plain?.sender_user_id
          if (sid != null && String(sid) === String(sel)) {
            normalized = normalizeConversationEvent(e, myAdminId, null, "staff") as TeamChatMsg | null
          }
        }
        if (normalized && conv == null && (e?.conversationId != null || e?.roomId != null)) {
          const rid = (e.conversationId ?? e.roomId) as number | undefined
          if (rid != null) {
            conversationIdRef.current = rid
            setConversationId(rid)
          }
        }
      } else {
        return
      }

      if (!normalized) return
      const key = buildKey(normalized)
      if (seenRef.current.has(key)) return
      seenRef.current.add(key)
      setMessages((prev) => [...prev, normalized!])
    }

    s.on("receive_message", onReceive)

    const onTyping = (payload: unknown) => {
      const p = payload as Record<string, unknown>
      const id = p?.userId ?? p?.fromUserId ?? (p?.from as Record<string, unknown>)?.userId
      if (String(id ?? "") !== String(selectedStaffIdRef.current ?? "")) return
      setIsTyping(true)
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
      typingTimerRef.current = setTimeout(() => setIsTyping(false), 2000)
    }

    const onPresence = (payload: unknown) => {
      const p = payload as Record<string, unknown>
      const uid = String(p?.userId ?? "")
      if (!uid) return
      setOnlineMap((prev) => ({ ...prev, [uid]: Boolean(p?.online) }))
    }

    s.on("chat:typing", onTyping)
    s.on("presence:update", onPresence)

    return () => {
      s.off("connect", onConnect)
      s.off("receive_message", onReceive)
      s.off("chat:typing", onTyping)
      s.off("presence:update", onPresence)
    }
  }, [token, myAdminId, buildKey])

  React.useEffect(() => {
    if (!token) return
    chatSocket.connect("admin")
    const s = chatSocket.get()
    if (!selectedStaffId) {
      conversationIdRef.current = null
      historyLoadedForConvRef.current = null
      setConversationId(null)
      setMessages([])
      seenRef.current.clear()
      return
    }
    conversationIdRef.current = null
    historyLoadedForConvRef.current = null
    setConversationId(null)
    setMessages([])
    seenRef.current.clear()

    if (!s) return
    s.emit(
      "join_room",
      { recipientUserId: Number(selectedStaffId) },
      (res: { ok?: boolean; conversationId?: number }) => {
        chatSocketDebug("admin join_room (peer chọn) ack", { selectedStaffId, res })
        if (res?.ok && res?.conversationId != null) {
          conversationIdRef.current = res.conversationId
          setConversationId(res.conversationId)
        }
      },
    )
  }, [selectedStaffId, token])

  React.useEffect(() => {
    if (!conversationId || !myAdminId || !selectedStaffId) return
    if (historyLoadedForConvRef.current === conversationId) return

    let cancelled = false
    const cid = conversationId
    historyLoadedForConvRef.current = cid

    void (async () => {
      try {
        const res = await api.get(`/messages/${cid}`, { params: { limit: 80, offset: 0 } })
        const { items: rows } = normalizeList(res.data, ["messages", "items", "data", "rows"])
        if (cancelled) return
        const chronological = [...rows].reverse()
        const mapped = chronological
          .map((r) => mapApiMessageRow(r, myAdminId, cid, "staff"))
          .filter(Boolean) as TeamChatMsg[]
        mapped.forEach((m) => seenRef.current.add(buildKey(m)))
        if (mapped.length === 0) return
        setMessages(mapped)
      } catch {
        historyLoadedForConvRef.current = null
      }
    })()

    return () => {
      cancelled = true
    }
  }, [conversationId, myAdminId, selectedStaffId, buildKey])

  const sendMessage = React.useCallback(
    (text: string) => {
      const trimmed = String(text ?? "").trim()
      const s = chatSocket.get()
      const peerId = Number(selectedStaffId)
      if (!s || !selectedStaffId || !Number.isFinite(peerId) || !trimmed) return false

      // Server `chat:message` resolves conversation via `recipientUserId` + JWT (findOrCreate),
      // so sending works even if `join_room` ack was delayed / throttled / missing conversationId.
      const payload: {
        conversationId?: number
        roomId?: string
        recipientUserId: number
        message: { type: "text"; content: string }
      } = {
        recipientUserId: peerId,
        message: { type: "text", content: trimmed },
      }
      const cid = conversationId ?? conversationIdRef.current
      if (cid != null) {
        payload.conversationId = cid
        payload.roomId = String(cid)
      }

      s.emit("chat:message", payload, (res: { ok?: boolean; conversationId?: number; message?: string }) => {
        if (res?.ok === false) console.warn(res?.message ?? "chat:message failed")
        if (res?.conversationId != null) {
          conversationIdRef.current = res.conversationId
          setConversationId(res.conversationId)
        }
      })
      return true
    },
    [selectedStaffId, conversationId],
  )

  const emitTyping = React.useCallback(() => {
    const s = chatSocket.get()
    if (!s || !selectedStaffId) return
    const payload: Record<string, unknown> = { toUserId: Number(selectedStaffId) }
    if (conversationId != null) payload.conversationId = conversationId
    s.emit("chat:typing", payload)
  }, [selectedStaffId, conversationId])

  return {
    messages,
    isTyping,
    onlineMap,
    sendMessage,
    emitTyping,
    conversationId,
  }
}
