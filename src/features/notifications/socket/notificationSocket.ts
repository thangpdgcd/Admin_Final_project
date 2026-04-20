import { io, type Socket } from "socket.io-client";
import { getAccessToken } from "@/services/authStorage";

type ServerToClientEvents = {
  receive_notification: (payload: unknown) => void;
  error: (err: unknown) => void;
  connect_error: (err: unknown) => void;
};

type ClientToServerEvents = {
  join_room: (payload: { userId?: number | string }, ack?: (res: { ok?: boolean; message?: string }) => void) => void;
};

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
let lastHandshakeToken: string | null = null;

const getSocketUrl = (): string => {
  const explicit = import.meta.env.VITE_SOCKET_URL as string | undefined;
  const raw = explicit ?? (import.meta.env.VITE_API_URL as string | undefined);
  if (!raw) throw new Error("Missing VITE_API_URL (or VITE_SOCKET_URL)");
  const trimmed = raw.replace(/\/+$/, "");
  return trimmed.replace(/\/api$/i, "");
};

export const notificationSocket = {
  connect(): Socket<ServerToClientEvents, ClientToServerEvents> | null {
    const token = getAccessToken();
    if (!token) return null;

    if (socket && lastHandshakeToken != null && lastHandshakeToken !== token) {
      socket.disconnect();
      socket = null;
      lastHandshakeToken = null;
    }

    if (!socket) {
      socket = io(getSocketUrl(), {
        path: "/socket.io/",
        auth: { token },
        withCredentials: true,
        transports: ["websocket", "polling"],
        autoConnect: false,
      });
      lastHandshakeToken = token;
    } else {
      socket.auth = { token };
      lastHandshakeToken = token;
    }

    if (!socket.connected) socket.connect();
    return socket;
  },

  disconnect() {
    if (!socket) return;
    socket.disconnect();
    socket = null;
    lastHandshakeToken = null;
  },

  get() {
    return socket;
  },
};

