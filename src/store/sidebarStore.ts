import { create } from "zustand"

interface SidebarState {
  desktopCollapsed: boolean
  mobileOpen: boolean
  setDesktopCollapsed: (collapsed: boolean) => void
  toggleDesktopCollapsed: () => void
  setMobileOpen: (open: boolean) => void
}

export const useSidebarStore = create<SidebarState>((set) => ({
  desktopCollapsed: false,
  mobileOpen: false,
  setDesktopCollapsed: (desktopCollapsed) => set({ desktopCollapsed }),
  toggleDesktopCollapsed: () => set((s) => ({ desktopCollapsed: !s.desktopCollapsed })),
  setMobileOpen: (mobileOpen) => set({ mobileOpen }),
}))
