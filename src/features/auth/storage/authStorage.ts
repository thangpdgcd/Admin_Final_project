let accessToken: string | null = null
let storedUserJson: string | null = null

// Use namespaced keys to avoid collisions with other apps (staff/customer) on same domain.
export const TOKEN_KEY = "admin:token"
export const USER_KEY = "admin:user"

// Backward compatibility (older builds used generic keys).
const LEGACY_TOKEN_KEY = "token"
const LEGACY_USER_KEY = "user"

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined"

// Hydrate from localStorage to persist sessions across reloads.
if (canUseStorage()) {
  try {
    accessToken = window.localStorage.getItem(TOKEN_KEY)
    storedUserJson = window.localStorage.getItem(USER_KEY)

    // Migrate legacy keys once to the namespaced keys.
    const legacyToken = window.localStorage.getItem(LEGACY_TOKEN_KEY)
    const legacyUser = window.localStorage.getItem(LEGACY_USER_KEY)
    if (!accessToken && legacyToken) {
      accessToken = legacyToken
      window.localStorage.setItem(TOKEN_KEY, legacyToken)
      window.localStorage.removeItem(LEGACY_TOKEN_KEY)
    }
    if (!storedUserJson && legacyUser) {
      storedUserJson = legacyUser
      window.localStorage.setItem(USER_KEY, legacyUser)
      window.localStorage.removeItem(LEGACY_USER_KEY)
    }
  } catch {
    // ignore
  }
}

export const getAccessToken = (): string | null => accessToken

export const setAccessToken = (token: string): void => {
  accessToken = token
  if (canUseStorage()) {
    try {
      window.localStorage.setItem(TOKEN_KEY, token)
    } catch {
      // ignore
    }
  }
}

export const clearAccessToken = (): void => {
  accessToken = null
  if (canUseStorage()) {
    try {
      window.localStorage.removeItem(TOKEN_KEY)
    } catch {
      // ignore
    }
  }
}

export const getStoredUser = <T = unknown>(): T | null => {
  if (!storedUserJson && canUseStorage()) {
    try {
      storedUserJson = window.localStorage.getItem(USER_KEY)
    } catch {
      // ignore
    }
  }
  if (!storedUserJson) return null
  try {
    return JSON.parse(storedUserJson) as T
  } catch {
    storedUserJson = null
    if (canUseStorage()) {
      try {
        window.localStorage.removeItem(USER_KEY)
      } catch {
        // ignore
      }
    }
    return null
  }
}

export const setStoredUser = <T>(user: T): void => {
  storedUserJson = JSON.stringify(user)
  if (canUseStorage()) {
    try {
      window.localStorage.setItem(USER_KEY, storedUserJson)
    } catch {
      // ignore
    }
  }
}

export const clearAuthStorage = (): void => {
  accessToken = null
  storedUserJson = null
  if (canUseStorage()) {
    try {
      window.localStorage.removeItem(TOKEN_KEY)
      window.localStorage.removeItem(USER_KEY)
      // Also clear legacy keys to prevent other apps' sessions being reused here.
      window.localStorage.removeItem(LEGACY_TOKEN_KEY)
      window.localStorage.removeItem(LEGACY_USER_KEY)
    } catch {
      // ignore
    }
  }
}
