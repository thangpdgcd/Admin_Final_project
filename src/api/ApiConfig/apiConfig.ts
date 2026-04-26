import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios"
import { clearAuthStorage, getAccessToken, setAccessToken } from "@/features/auth/storage/authStorage"
import { normalizeApiError, notifyApiError } from "@/utils/errors"

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
  _retryCount?: number
  suppressErrorToast?: boolean
}

const rawBaseURL = import.meta.env.VITE_API_URL

if (!rawBaseURL) {
  throw new Error("Missing VITE_API_URL")
}

// Backend mounts REST routes under `/api`. Accept either:
// - https://host/api  (preferred)
// - https://host      (we will append `/api`)
const baseURL = (() => {
  const trimmed = String(rawBaseURL).replace(/\/+$/, "")
  return /\/api$/i.test(trimmed) ? trimmed : `${trimmed}/api`
})()

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

let isRefreshing = false
let refreshSubscribers: Array<(token: string | null) => void> = []
const MAX_RETRY_ATTEMPTS = 1
const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504])

const subscribeTokenRefresh = (callback: (token: string | null) => void): void => {
  refreshSubscribers.push(callback)
}

const notifyRefreshSubscribers = (token: string | null): void => {
  refreshSubscribers.forEach((callback) => callback(token))
  refreshSubscribers = []
}

const forceLogout = (): void => {
  clearAuthStorage()
  if (window.location.pathname !== "/login") {
    window.location.href = "/login"
  }
}

const isRetryableRequest = (error: AxiosError<unknown>): boolean => {
  const status = error.response?.status
  if (status && RETRYABLE_STATUS_CODES.has(status)) {
    return true
  }
  return !error.response
}

const refreshAccessToken = async (): Promise<string> => {
  const trimmedBase = String(baseURL).replace(/\/+$/, "")
  const hasApiSuffix = /\/api$/i.test(trimmedBase)
  const candidates = hasApiSuffix
    ? [`${trimmedBase}/auth/refresh`, `${trimmedBase}/refresh-token`]
    : [`${trimmedBase}/api/auth/refresh`, `${trimmedBase}/api/refresh-token`, `${trimmedBase}/auth/refresh`]

  let lastError: unknown
  for (const url of candidates) {
    try {
      const response = await axios.post(
        url,
        {},
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        },
      )

      const payload = response.data as Record<string, unknown>
      const firstData = payload.data as Record<string, unknown> | undefined
      const secondData = firstData?.data as Record<string, unknown> | undefined
      const token =
        (typeof payload.token === "string" && payload.token) ||
        (typeof payload.accessToken === "string" && payload.accessToken) ||
        (typeof firstData?.token === "string" && firstData.token) ||
        (typeof firstData?.accessToken === "string" && firstData.accessToken) ||
        (typeof secondData?.token === "string" && secondData.token) ||
        (typeof secondData?.accessToken === "string" && secondData.accessToken)

      if (!token) {
        throw new Error("Refresh token response missing access token")
      }

      setAccessToken(token)
      return token
    } catch (err) {
      lastError = err
      continue
    }
  }

  throw lastError
}

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<unknown>) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined
    const isUnauthorized = error.response?.status === 401
    const isRefreshRequest = originalRequest?.url?.includes("/auth/refresh")

    if (isUnauthorized && originalRequest && !originalRequest._retry && !isRefreshRequest) {
      originalRequest._retry = true

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token) => {
            if (!token) {
              reject(normalizeApiError(error))
              return
            }
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(apiClient(originalRequest as AxiosRequestConfig))
          })
        })
      }

      isRefreshing = true
      try {
        const newToken = await refreshAccessToken()
        notifyRefreshSubscribers(newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest as AxiosRequestConfig)
      } catch (refreshError) {
        notifyRefreshSubscribers(null)
        forceLogout()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    if (originalRequest && !isRefreshRequest && isRetryableRequest(error)) {
      const retryCount = originalRequest._retryCount ?? 0
      if (retryCount < MAX_RETRY_ATTEMPTS) {
        originalRequest._retryCount = retryCount + 1
        return apiClient(originalRequest as AxiosRequestConfig)
      }
    }

    const normalizedError = normalizeApiError(error)
    if (!originalRequest?.suppressErrorToast) {
      notifyApiError(normalizedError)
    }
    return Promise.reject(normalizedError)
  },
)
