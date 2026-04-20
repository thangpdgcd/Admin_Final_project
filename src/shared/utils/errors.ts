import type { AxiosError } from "axios";
import { toast } from "sonner";

export interface AppError extends Error {
  status?: number;
  data?: unknown;
  original?: unknown;
}

export const normalizeApiError = (error: AxiosError<unknown>): AppError => {
  const status = error.response?.status;
  const data = error.response?.data as Record<string, unknown> | undefined;

  let message =
    (typeof data?.message === "string" && data.message) ||
    (typeof data?.error === "string" && data.error) ||
    error.message ||
    "Something went wrong";

  if (error.code === "ECONNABORTED") {
    message = "Request timed out. Please try again.";
  } else if (!error.response) {
    message = "Network error. Please check your connection.";
  }

  const appError = new Error(message) as AppError;
  appError.status = status;
  appError.data = data;
  appError.original = error;
  return appError;
};

export const notifyApiError = (error: AppError): void => {
  if (error.status && error.status >= 400) {
    toast.error(error.message);
  }
};

