import { create } from "zustand"
import { authService } from "@/services/auth.service"
import { clearAuthStorage, getAccessToken, getStoredUser, setStoredUser } from "@/services/authStorage"
import { resolveUserRole } from "@/utils/authRole"

export type AuthUser = Awaited<ReturnType<typeof authService.getMe>>

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  bootstrap: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  bootstrap: async () => {
    set({ isLoading: true })
    try {
      const persistedToken = getAccessToken()
      const persistedUser = getStoredUser<AuthUser>()

      if (!persistedToken) {
        if (
          persistedUser &&
          resolveUserRole(persistedUser as unknown as Record<string, unknown>) !== "admin"
        ) {
          clearAuthStorage()
        }
        set({ user: null, token: null, isAuthenticated: false, isLoading: false })
        return
      }

      const user = await authService.getMe()
      if (resolveUserRole(user as unknown as Record<string, unknown>) !== "admin") {
        clearAuthStorage()
        set({ user: null, token: null, isAuthenticated: false, isLoading: false })
        return
      }

      setStoredUser(user)
      set({ user, token: persistedToken, isAuthenticated: true, isLoading: false })
    } catch {
      clearAuthStorage()
      set({ user: null, token: null, isAuthenticated: false, isLoading: false })
    }
  },

  login: async (email, password) => {
    const session = await authService.login(email, password)
    set({ user: session.user as AuthUser, token: session.token, isAuthenticated: true, isLoading: false })
  },

  logout: async () => {
    const { token } = get()
    try {
      if (token) {
        await authService.logout()
      }
    } finally {
      clearAuthStorage()
      set({ user: null, token: null, isAuthenticated: false, isLoading: false })
    }
  },
}))
