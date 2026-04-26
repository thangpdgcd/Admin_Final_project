import * as React from "react"
import { toast } from "sonner"
import { notificationService } from "../services/notification.service"
import { notificationSocket } from "../socket/notificationSocket"
import type { NotificationRow, NotificationType } from "../model/types"
import { selectUnreadCount, useNotificationsStore } from "../store/useNotificationsStore"

const normalizeType = (raw: unknown): NotificationType => {
  const t = String(raw ?? "")
    .trim()
    .toLowerCase()
  if (t === "order" || t === "chat" || t === "system" || t === "voucher") return t
  return "system"
}

const toNotificationRow = (raw: unknown): NotificationRow | null => {
  if (!raw || typeof raw !== "object") return null
  const r = raw as Record<string, unknown>
  const id = Number(r.id)
  const userId = Number(r.userId)
  const message = String(r.message ?? "").trim()
  if (!Number.isFinite(id) || !Number.isFinite(userId) || !message) return null
  return {
    id,
    userId,
    message,
    type: normalizeType(r.type),
    isRead: Boolean(r.isRead),
    createdAt: r.createdAt ? String(r.createdAt) : undefined,
    updatedAt: r.updatedAt ? String(r.updatedAt) : undefined,
  }
}

export const useNotifications = (opts: { userId?: string | number | null } = {}) => {
  const userIdNum = Number(opts.userId)
  const items = useNotificationsStore((s) => s.items)
  const hydrated = useNotificationsStore((s) => s.hydrated)
  const hydrate = useNotificationsStore((s) => s.hydrate)
  const addIncoming = useNotificationsStore((s) => s.addIncoming)
  const markReadLocal = useNotificationsStore((s) => s.markReadLocal)
  const markAllReadLocal = useNotificationsStore((s) => s.markAllReadLocal)

  const unreadCount = React.useMemo(() => selectUnreadCount(items), [items])

  React.useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (hydrated) return
      try {
        const res = await notificationService.list({ limit: 50, offset: 0 })
        if (cancelled) return
        hydrate(res.items)
      } catch {
        // keep UI usable even if notifications API is not ready
        hydrate([])
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [hydrated, hydrate])

  React.useEffect(() => {
    const socket = notificationSocket.connect()
    if (!socket) return

    const uid = Number.isFinite(userIdNum) && userIdNum > 0 ? userIdNum : null
    if (uid) {
      socket.emit("join_room", { userId: uid }, () => {})
    }

    const onReceive = (payload: unknown) => {
      const row = toNotificationRow(payload)
      if (!row) return
      addIncoming(row)
      toast(row.message)
    }

    // Prevent duplicate listeners.
    socket.off("receive_notification", onReceive)
    socket.on("receive_notification", onReceive)

    return () => {
      socket.off("receive_notification", onReceive)
    }
  }, [addIncoming, userIdNum])

  const markRead = React.useCallback(
    async (id: number) => {
      markReadLocal(id)
      try {
        await notificationService.markRead(id)
      } catch {
        // optimistic UI; ignore API error
      }
    },
    [markReadLocal],
  )

  const markAllRead = React.useCallback(async () => {
    markAllReadLocal()
    try {
      await notificationService.markAllRead()
    } catch {
      // ignore
    }
  }, [markAllReadLocal])

  return { items, unreadCount, markRead, markAllRead }
}
