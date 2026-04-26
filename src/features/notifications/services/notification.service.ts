import { api } from "@/api"
import { unwrapApiData } from "@/utils/apiResponse"
import type { ListNotificationsResponse, NotificationRow } from "../model/types"

export const notificationService = {
  async list(
    params: { limit?: number; offset?: number; unreadOnly?: boolean } = {},
  ): Promise<ListNotificationsResponse> {
    const response = await api.get("/notifications", { params })
    const payload = unwrapApiData<unknown>(response.data)
    const r = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {}
    return {
      items: Array.isArray(r.items) ? (r.items as NotificationRow[]) : [],
      total: Number(r.total ?? 0) || 0,
      limit: Number(r.limit ?? params.limit ?? 50) || 50,
      offset: Number(r.offset ?? params.offset ?? 0) || 0,
    }
  },

  async markRead(id: number): Promise<NotificationRow> {
    const response = await api.patch(`/notifications/${id}/read`, {})
    return unwrapApiData<NotificationRow>(response.data)
  },

  async markAllRead(): Promise<{ updated: number }> {
    const response = await api.patch(`/notifications/read-all`, {})
    return unwrapApiData<{ updated: number }>(response.data)
  },
}
