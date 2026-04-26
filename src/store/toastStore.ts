import { create } from "zustand"

export type ToastKind = "success" | "error" | "info"

export interface AppToast {
  id: string
  kind: ToastKind
  message: string
  createdAt: number
}

interface ToastState {
  toasts: AppToast[]
  push: (kind: ToastKind, message: string) => void
  remove: (id: string) => void
  clear: () => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (kind, message) =>
    set((s) => ({
      toasts: [...s.toasts, { id: crypto.randomUUID(), kind, message, createdAt: Date.now() }],
    })),
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}))
