import { api } from "@/services/api";
import { normalizeList, unwrapApiData, type NormalizedListResult } from "@/utils/apiResponse";

export interface CategoryEntity {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CategoryPayload {
  name: string;
  description?: string;
}

export const categoryService = {
  async getAll(params: CategoryQueryParams = {}): Promise<NormalizedListResult<CategoryEntity>> {
    const endpoints = ["/categories",];
    let lastError: unknown;

    for (const endpoint of endpoints) {
      try {
        const response = await api.get(endpoint, { params });
        return normalizeList<CategoryEntity>(response.data, ["categories", "results", "items", "docs", "rows", "data"]);
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError;
  },

  async getById(id: string): Promise<CategoryEntity> {
    const response = await api.get(`/categories/${id}`);
    return unwrapApiData<CategoryEntity>(response.data);
  },

  async create(payload: CategoryPayload): Promise<CategoryEntity> {
    const response = await api.post("/categories", payload);
    return unwrapApiData<CategoryEntity>(response.data);
  },

  async update(id: string, payload: CategoryPayload): Promise<CategoryEntity> {
    const response = await api.put(`/categories/${id}`, payload);
    return unwrapApiData<CategoryEntity>(response.data);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};

