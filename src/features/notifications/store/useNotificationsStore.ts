import { create } from "zustand"
import type { NotificationRow } from "../model/types"

type State = {
  items: NotificationRow[]
  hydrated: boolean
}

type Actions = {
  hydrate: (items: NotificationRow[]) => void
  addIncoming: (n: NotificationRow) => void
  markReadLocal: (id: number) => void
  markAllReadLocal: () => void
  clear: () => void
}

const sortDesc = (a: NotificationRow, b: NotificationRow) => {
  const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
  const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
  return tb - ta
}

export const useNotificationsStore = create<State & Actions>((set) => ({
  items: [],
  hydrated: false,

  hydrate: (items) => set({ items: [...items].sort(sortDesc), hydrated: true }),

  addIncoming: (n) =>
    set((prev) => {
      const id = Number(n?.id)
      if (!Number.isFinite(id)) return prev
      const next = prev.items.filter((x) => Number(x.id) !== id)
      next.unshift({ ...n, id })
      return { ...prev, items: next.sort(sortDesc) }
    }),

  markReadLocal: (id) =>
    set((prev) => ({
      ...prev,
      items: prev.items.map((x) => (Number(x.id) === Number(id) ? { ...x, isRead: true } : x)),
    })),

  markAllReadLocal: () =>
    set((prev) => ({
      ...prev,
      items: prev.items.map((x) => ({ ...x, isRead: true })),
    })),

  clear: () => set({ items: [], hydrated: true }),
}))

export const selectUnreadCount = (items: NotificationRow[]) =>
  items.reduce((acc, n) => acc + (n.isRead ? 0 : 1), 0)
