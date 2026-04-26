import type { AxiosError } from "axios"

export const getErrorMessage = (err: unknown): string => {
  if (err && typeof err === "object" && "response" in err) {
    const axiosErr = err as AxiosError<{ message?: string }>
    const msg = axiosErr.response?.data?.message
    if (typeof msg === "string") return msg
  }
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message: string }).message)
  }
  return "An unexpected error occurred"
}
