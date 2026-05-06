import { api } from "@/api"
import { normalizeList, unwrapApiData, type NormalizedListResult } from "@/utils/apiResponse"

export interface OrderQueryParams {
  page?: number
  limit?: number
  status?: string
  search?: string
}

export interface OrderEntity {
  _id: string
  user?: {
    _id?: string
    name?: string
    email?: string
  }
  totalOrderPrice?: number
  totalAmount?: number
  status?: string
  isPaid?: boolean
  isDelivered?: boolean
  createdAt?: string
  [key: string]: unknown
}

export interface UpdateOrderPayload {
  status?: string
  [key: string]: unknown
}

export const orderService = {
  async getAll(params: OrderQueryParams = {}): Promise<NormalizedListResult<OrderEntity>> {
    const endpoints = ["/orders", "/order"]
    let lastError: unknown

    // Backend search parameter names vary across deployments.
    // We keep `search` and also provide common aliases (`name`, `q`, `keyword`).
    const searchValue = params.search && String(params.search).trim() !== "" ? String(params.search).trim() : ""
    const query: Record<string, unknown> = searchValue
      ? { ...params, name: searchValue, q: searchValue, keyword: searchValue }
      : { ...params }

    for (const endpoint of endpoints) {
      try {
        const response = await api.get(endpoint, { params: query })
        return normalizeList<OrderEntity>(response.data, [
          "orders",
          "order",
          "results",
          "items",
          "docs",
          "rows",
          "data",
        ])
      } catch (error) {
        lastError = error
      }
    }

    throw lastError
  },

  async getById(id: string): Promise<OrderEntity> {
    const response = await api.get(`/orders/${id}`)
    return unwrapApiData<OrderEntity>(response.data)
  },

  async getByUserId(userId: string, params: OrderQueryParams = {}): Promise<OrderEntity[]> {
    const response = await api.get(`/users/${userId}/orders`, { params })
    const data: unknown = response.data
    if (Array.isArray(data)) return data as OrderEntity[]
    if (data && typeof data === "object") {
      const r = data as Record<string, unknown>
      if (Array.isArray(r.data)) return r.data as OrderEntity[]
      if (Array.isArray(r.orders)) return r.orders as OrderEntity[]
      if (Array.isArray(r.result)) return r.result as OrderEntity[]
    }
    return []
  },

  async create(payload: Record<string, unknown>): Promise<OrderEntity> {
    const response = await api.post("/orders", payload)
    return unwrapApiData<OrderEntity>(response.data)
  },

  async update(id: string, payload: UpdateOrderPayload): Promise<OrderEntity> {
    const status = String(payload.status || "").toLowerCase()

    // Backends differ in resource naming (`/orders` vs `/order`) and update semantics.
    // We keep a fallback list to maximize compatibility across deployments.
    const quiet = { suppressErrorToast: true }
    const attempts: Array<() => Promise<unknown>> = [
      // preferred
      () => api.put(`/orders/${id}/status`, payload, quiet),
      () => api.patch(`/orders/${id}/status`, payload, quiet),
      () => api.put(`/orders/${id}`, payload, quiet),
      () => api.patch(`/orders/${id}`, payload, quiet),

      // legacy singular
      () => api.put(`/order/${id}/status`, payload, quiet),
      () => api.patch(`/order/${id}/status`, payload, quiet),
      () => api.put(`/order/${id}`, payload, quiet),
      () => api.patch(`/order/${id}`, payload, quiet),

      // common "update" style endpoints
      () => api.put(`/orders/update/${id}`, payload, quiet),
      () => api.patch(`/orders/update/${id}`, payload, quiet),
      () => api.put(`/order/update/${id}`, payload, quiet),
      () => api.patch(`/order/update/${id}`, payload, quiet),

      // admin-scoped (some deployments)
      () => api.put(`/admin/orders/${id}/status`, payload, quiet),
      () => api.patch(`/admin/orders/${id}/status`, payload, quiet),
      () => api.put(`/admin/orders/${id}`, payload, quiet),
      () => api.patch(`/admin/orders/${id}`, payload, quiet),
    ]

    if (status === "confirmed" || status === "paid") {
      attempts.push(() => api.put(`/orders/${id}/pay`, {}, quiet))
      attempts.push(() => api.put(`/order/${id}/pay`, {}, quiet))
      attempts.push(() => api.put(`/admin/orders/${id}/pay`, {}, quiet))
    }
    if (status === "delivered") {
      attempts.push(() => api.put(`/orders/${id}/deliver`, {}, quiet))
      attempts.push(() => api.put(`/order/${id}/deliver`, {}, quiet))
      attempts.push(() => api.put(`/admin/orders/${id}/deliver`, {}, quiet))
    }
    if (status === "cancelled" || status === "canceled") {
      attempts.push(() => api.put(`/orders/${id}/cancel`, {}, quiet))
      attempts.push(() => api.patch(`/orders/${id}/cancel`, {}, quiet))
      attempts.push(() => api.put(`/orders/cancel/${id}`, {}, quiet))
      attempts.push(() => api.patch(`/orders/cancel/${id}`, {}, quiet))

      attempts.push(() => api.put(`/order/${id}/cancel`, {}, quiet))
      attempts.push(() => api.patch(`/order/${id}/cancel`, {}, quiet))
      attempts.push(() => api.put(`/order/cancel/${id}`, {}, quiet))
      attempts.push(() => api.patch(`/order/cancel/${id}`, {}, quiet))

      attempts.push(() => api.put(`/admin/orders/${id}/cancel`, {}, quiet))
      attempts.push(() => api.patch(`/admin/orders/${id}/cancel`, {}, quiet))
    }

    let lastError: unknown
    for (const attempt of attempts) {
      try {
        const response = (await attempt()) as { data: unknown }
        return unwrapApiData<OrderEntity>(response.data)
      } catch (error) {
        lastError = error
      }
    }

    throw lastError
  },

  async delete(id: string): Promise<void> {
    // Prefer plural `/orders/:id` (current backend). Keep fallbacks for legacy deployments.
    const quiet = { suppressErrorToast: true }
    const attempts: Array<() => Promise<unknown>> = [
      () => api.delete(`/orders/${id}`, quiet),
      () => api.delete(`/orders/delete/${id}`, quiet),
      () => api.delete(`/orders/remove/${id}`, quiet),
      () => api.delete(`/orders/${id}/delete`, quiet),
      () => api.delete(`/orders/${id}/remove`, quiet),

      () => api.delete(`/order/${id}`, quiet),
      () => api.delete(`/order/delete/${id}`, quiet),
      () => api.delete(`/order/remove/${id}`, quiet),
      () => api.delete(`/order/${id}/delete`, quiet),
      () => api.delete(`/order/${id}/remove`, quiet),

      // admin-scoped (some deployments)
      () => api.delete(`/admin/orders/${id}`, quiet),
      () => api.delete(`/admin/orders/delete/${id}`, quiet),
      () => api.delete(`/admin/orders/remove/${id}`, quiet),
    ]

    let lastError: unknown
    for (const attempt of attempts) {
      try {
        await attempt()
        return
      } catch (error) {
        lastError = error
      }
    }

    throw lastError
  },
}
