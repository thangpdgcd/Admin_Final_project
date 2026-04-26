import { io, type Socket } from "socket.io-client"
import { getAccessToken } from "@/services/authStorage"
import {
  chatSocketDebug,
  chatSocketDebugWarn,
  isChatSocketDebug,
} from "@/features/supportChat/socket/chatSocketDebug"
import type { SupportMessageContent } from "../model/types"

type ServerToClientEvents = {
  receive_message: (payload: unknown) => void
  "chat:message": (payload: unknown) => void
  "chat:typing": (payload: unknown) => void
  "presence:update": (payload: unknown) => void
  send_voucher: (payload: unknown) => void
  error: (err: unknown) => void
  connect_error: (err: unknown) => void
}

type ClientToServerEvents = {
  join_room: (
    payload: { conversationId?: number; recipientUserId?: number } | Record<string, never>,
    ack?: (res: { ok?: boolean; conversationId?: number; message?: string }) => void,
  ) => void
  send_message: (payload: {
    conversationId?: number
    recipientUserId?: number
    message: SupportMessageContent
  }) => void
  /** Express backend: persists to DB in chat.socket.js */
  "chat:message": (
    payload: {
      roomId?: string
      conversationId?: number
      recipientUserId?: number
      message: SupportMessageContent
    },
    ack?: (res: { ok?: boolean; message?: string }) => void,
  ) => void
  "chat:typing": (payload: Record<string, unknown>) => void
  /** Send voucher to a user; backend emits `send_voucher` to target user room. */
  send_voucher: (payload: { userId: number; code: string; message?: string }) => void
}

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null
/** Last JWT used for a successful Socket.IO handshake (detect token refresh / account switch). */
let lastHandshakeToken: string | null = null

const debugAttached = new WeakSet<object>()

const attachLifecycleDebug = (s: Socket<ServerToClientEvents, ClientToServerEvents>) => {
  if (!isChatSocketDebug || debugAttached.has(s)) return
  debugAttached.add(s)
  s.on("connect", () => {
    chatSocketDebug("đã kết nối", { id: s.id, url: getSocketUrl() })
  })
  s.on("disconnect", (reason) => {
    chatSocketDebug("ngắt kết nối", reason)
  })
  s.on("connect_error", (err) => {
    console.error("[chatSocket] connect_error (kiểm tra JWT, CORS, backend chạy đúng port):", err)
  })
}

const getSocketUrl = (): string => {
  const raw = import.meta.env.VITE_API_URL as string | undefined
  if (!raw) throw new Error("Missing VITE_API_URL")

  // Accept either origin (`http://localhost:8080`) or API base (`http://localhost:8080/api`).
  // Socket.IO server lives on the origin.
  const trimmed = raw.replace(/\/+$/, "")
  const withoutApi = trimmed.replace(/\/api$/i, "")
  return withoutApi
}

const setSocketAuth = (
  s: Socket<ServerToClientEvents, ClientToServerEvents>,
  token: string,
  role?: "admin" | "staff" | "user",
) => {
  // Socket.IO reads `auth` during (re)connect. Set it right before calling connect().
  s.auth = role ? { token, role } : { token }
}

export const chatSocket = {
  /**
   * Connect using the latest in-memory access token.
   * Returns `null` if token isn't available yet.
   */
  connect(role?: "admin" | "staff" | "user"): Socket<ServerToClientEvents, ClientToServerEvents> | null {
    const token = getAccessToken()
    if (!token) {
      chatSocketDebugWarn("chưa có access token — bỏ qua connect (đăng nhập / refresh session trước)")
      return null
    }

    // Socket.IO only applies `auth` on connect — after refresh/login we must reconnect.
    if (socket && lastHandshakeToken != null && lastHandshakeToken !== token) {
      chatSocketDebug("token đổi → disconnect socket cũ")
      socket.disconnect()
      socket = null
      lastHandshakeToken = null
    }

    if (!socket) {
      socket = io(getSocketUrl(), {
        path: "/socket.io/",
        auth: role ? { token, role } : { token },
        withCredentials: true,
        transports: ["websocket", "polling"],
        autoConnect: false,
      })
      lastHandshakeToken = token
      attachLifecycleDebug(socket)
      chatSocketDebug("tạo socket mới", { role: role ?? "(default)" })
    } else {
      setSocketAuth(socket, token, role)
      lastHandshakeToken = token
    }

    if (!socket.connected) {
      chatSocketDebug("đang gọi connect()…")
      socket.connect()
    }

    return socket
  },

  disconnect(): void {
    if (!socket) return
    chatSocketDebug("disconnect() được gọi")
    socket.disconnect()
    socket = null
    lastHandshakeToken = null
  },

  get(): Socket<ServerToClientEvents, ClientToServerEvents> | null {
    return socket
  },
}
