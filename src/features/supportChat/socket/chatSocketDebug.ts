/** Bật log socket/chat: dev mặc định, hoặc `VITE_DEBUG_CHAT=true` trong `.env` (cả bản build). */
export const isChatSocketDebug =
  Boolean(import.meta.env.DEV) || import.meta.env.VITE_DEBUG_CHAT === "true";

export function chatSocketDebug(...args: unknown[]): void {
  if (!isChatSocketDebug) return;
  console.log("[chatSocket]", ...args);
}

export function chatSocketDebugWarn(...args: unknown[]): void {
  if (!isChatSocketDebug) return;
  console.warn("[chatSocket]", ...args);
}
