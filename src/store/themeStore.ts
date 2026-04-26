import { create } from "zustand"

export type ThemeMode = "light" | "dark"

const STORAGE_KEY = "theme"

interface ThemeState {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  toggle: () => void
}

const readInitial = (): ThemeMode => {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw === "light" || raw === "dark" ? raw : "dark"
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: readInitial(),
  setMode: (mode) => {
    localStorage.setItem(STORAGE_KEY, mode)
    set({ mode })
  },
  toggle: () => {
    const next: ThemeMode = get().mode === "dark" ? "light" : "dark"
    localStorage.setItem(STORAGE_KEY, next)
    set({ mode: next })
  },
}))
