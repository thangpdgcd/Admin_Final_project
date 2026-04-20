import { api } from "@/services/api";
import { normalizeList, unwrapApiData, type NormalizedListResult } from "@/utils/apiResponse";

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface OrderEntity {
  _id: string;
  user?: {
    _id?: string;
    name?: string;
    email?: string;
  };
  totalOrderPrice?: number;
  totalAmount?: number;
  status?: string;
  isPaid?: boolean;
  isDelivered?: boolean;
  createdAt?: string;
  [key: string]: unknown;
}

export interface UpdateOrderPayload {
  status?: string;
  [key: string]: unknown;
}

export const orderService = {
  async getAll(params: OrderQueryParams = {}): Promise<NormalizedListResult<OrderEntity>> {
    const endpoints = ["/orders", "/order"];
    let lastError: unknown;

    for (const endpoint of endpoints) {
      try {
        const response = await api.get(endpoint, { params });
        return normalizeList<OrderEntity>(response.data, [
          "orders",
          "order",
          "results",
          "items",
          "docs",
          "rows",
          "data",
        ]);
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError;
  },

  async getById(id: string): Promise<OrderEntity> {
    const response = await api.get(`/orders/${id}`);
    return unwrapApiData<OrderEntity>(response.data);
  },

  async getByUserId(userId: string, params: OrderQueryParams = {}): Promise<OrderEntity[]> {
    const response = await api.get(`/users/${userId}/orders`, { params });
    const data: unknown = response.data;
    if (Array.isArray(data)) return data as OrderEntity[];
    if (data && typeof data === "object") {
      const r = data as Record<string, unknown>;
      if (Array.isArray(r.data)) return r.data as OrderEntity[];
      if (Array.isArray(r.orders)) return r.orders as OrderEntity[];
      if (Array.isArray(r.result)) return r.result as OrderEntity[];
    }
    return [];
  },

  async create(payload: Record<string, unknown>): Promise<OrderEntity> {
    const response = await api.post("/orders", payload);
    return unwrapApiData<OrderEntity>(response.data);
  },

  async update(id: string, payload: UpdateOrderPayload): Promise<OrderEntity> {
    const status = String(payload.status || "").toLowerCase();

    const attempts: Array<() => Promise<unknown>> = [
      () => api.put(`/orders/${id}/status`, payload),
      () => api.patch(`/orders/${id}/status`, payload),
      () => api.put(`/orders/${id}`, payload),
    ];

    if (status === "confirmed" || status === "paid") {
      attempts.push(() => api.put(`/orders/${id}/pay`, {}));
    }
    if (status === "delivered") {
      attempts.push(() => api.put(`/orders/${id}/deliver`, {}));
    }

    let lastError: unknown;
    for (const attempt of attempts) {
      try {
        const response = (await attempt()) as { data: unknown };
        return unwrapApiData<OrderEntity>(response.data);
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError;
  },

  async delete(id: string): Promise<void> {
    // Prefer plural `/orders/:id` (current backend). Keep fallbacks for legacy deployments.
    const attempts: Array<() => Promise<unknown>> = [
      () => api.delete(`/orders/${id}`),
      () => api.delete(`/orders/delete/${id}`),
      () => api.delete(`/order/${id}`),
    ];

    let lastError: unknown;
    for (const attempt of attempts) {
      try {
        await attempt();
        return;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError;
  },
};

