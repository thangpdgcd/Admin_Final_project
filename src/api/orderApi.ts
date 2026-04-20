import { orderService, type OrderQueryParams } from "@/services/order.service";

function toLegacyListShape(result: Awaited<ReturnType<typeof orderService.getAll>>) {
  return {
    data: {
      orders: result.items,
      data: result.items,
      results: result.items,
      total: result.total,
      page: result.page,
      limit: result.limit,
    },
  };
}

export const orderApi = {
  async getOrders(params: OrderQueryParams = {}) {
    const result = await orderService.getAll(params);
    return toLegacyListShape(result);
  },

  async getOrder(id: string) {
    return orderService.getById(id);
  },

  async updateOrder(id: string, payload: Record<string, unknown>) {
    return orderService.update(id, payload);
  },

  async deleteOrder(id: string) {
    return orderService.delete(id);
  },

  async markPaid(id: string) {
    return orderService.update(id, {
      status: "confirmed",
    });
  },

  async markDelivered(id: string) {
    return orderService.update(id, {
      status: "delivered",
    });
  },
};

