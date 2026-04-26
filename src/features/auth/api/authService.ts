import { api } from "@/api"
import { clearAuthStorage, setAccessToken, setStoredUser } from "@/features/auth/storage/authStorage"
import { resolveUserRole } from "@/utils/authRole"
import { unwrapApiData } from "@/utils/apiResponse"

export interface AuthUser {
  _id: string
  email: string
  name: string
  role: "admin" | "staff" | "user"
  avatar?: string
  roleID?: string | number
  roleId?: string | number
}

export interface AuthSession {
  user: AuthUser
  token: string
}

export interface ChangePasswordPayload {
  oldPassword: string
  newPassword: string
}

type AuthPayload = {
  user?: AuthUser | Record<string, unknown>
  token?: string
  accessToken?: string
}

const normalizeSession = (payload: AuthPayload): AuthSession => {
  const token = payload.token || payload.accessToken
  if (!token || !payload.user || typeof payload.user !== "object") {
    throw new Error("Invalid auth response")
  }

  const normalizedUser: AuthUser = {
    ...(payload.user as AuthUser),
    role: resolveUserRole(payload.user as Record<string, unknown>),
  }

  return {
    user: normalizedUser,
    token,
  }
}

export const authService = {
  async login(email: string, password: string): Promise<AuthSession> {
    const candidates = ["/login", "/auth/login", "/auth/signin"]
    let lastError: unknown

    for (const endpoint of candidates) {
      try {
        const response = await api.post(endpoint, { email, password })
        const payload = unwrapApiData<AuthPayload>(response.data)
        const session = normalizeSession(payload)
        setAccessToken(session.token)
        setStoredUser(session.user)
        return session
      } catch (err) {
        lastError = err
        continue
      }
    }

    throw lastError
  },

  async register(fullName: string, email: string, password: string): Promise<AuthSession> {
    const body = {
      name: fullName,
      fullName,
      email,
      password,
      role: "user",
      // Backend mapping: 1=user, 2=admin, 3=staff
      roleID: 1,
      roleId: 1,
    }

    const candidates = ["/register", "/auth/register", "/auth/signup"]
    let lastError: unknown

    for (const endpoint of candidates) {
      try {
        const response = await api.post(endpoint, body)
        const payload = unwrapApiData<AuthPayload>(response.data)
        const session = normalizeSession(payload)
        setAccessToken(session.token)
        setStoredUser(session.user)
        return session
      } catch (err) {
        lastError = err
        continue
      }
    }

    throw lastError
  },

  async refresh(): Promise<string> {
    const response = await api.post("/auth/refresh", {})
    const payload = unwrapApiData<{ token?: string; accessToken?: string }>(response.data)
    const token = payload.token || payload.accessToken
    if (!token) throw new Error("Refresh token response missing access token")
    setAccessToken(token)
    return token
  },

  async logout(): Promise<void> {
    try {
      const candidates = ["/auth/logout", "/logout", "/auth/signout"]
      for (const endpoint of candidates) {
        try {
          await api.post(endpoint, {})
          break
        } catch {
          // try next candidate; still clear local storage in finally
        }
      }
    } finally {
      clearAuthStorage()
    }
  },

  async getMe(): Promise<AuthUser> {
    const response = await api.get("/users/me")
    const user = unwrapApiData<Record<string, unknown>>(response.data)
    return {
      ...(user as unknown as AuthUser),
      role: resolveUserRole(user),
    }
  },

  async updateProfile(payload: { name: string; avatar?: string }): Promise<AuthUser> {
    const response = await api.put("/users/me", payload)
    const user = unwrapApiData<Record<string, unknown>>(response.data)
    const normalizedUser: AuthUser = {
      ...(user as unknown as AuthUser),
      role: resolveUserRole(user),
    }
    setStoredUser(normalizedUser)
    return normalizedUser
  },

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await api.post("/auth/change-password", payload)
  },
}
