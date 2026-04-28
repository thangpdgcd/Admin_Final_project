import { api } from "@/api"
import { normalizeList, unwrapApiData, type NormalizedListResult } from "@/utils/apiResponse"

export interface CategoryEntity {
  _id: string
  name: string
  description?: string
  createdAt: string
  updatedAt?: string
}

export interface CategoryQueryParams {
  page?: number
  limit?: number
  search?: string
}

export interface CategoryPayload {
  name: string
  description?: string
}

export const categoryService = {
  async getAll(params: CategoryQueryParams = {}): Promise<NormalizedListResult<CategoryEntity>> {
    const endpoints = [
      "/admin/categories",
      "/admin/category",
      "/categories",
      "/category",
      "/categories/all",
      "/category/all",
    ]
    let lastError: unknown

    for (const endpoint of endpoints) {
      try {
        const response = await api.get(endpoint, { params })
        return normalizeList<CategoryEntity>(response.data, [
          "categories",
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

  async getById(id: string): Promise<CategoryEntity> {
    const endpoints = [
      `/admin/categories/${id}`,
      `/admin/category/${id}`,
      `/categories/${id}`,
      `/category/${id}`,
    ]
    let lastError: unknown

    for (const endpoint of endpoints) {
      try {
        const response = await api.get(endpoint)
        return unwrapApiData<CategoryEntity>(response.data)
      } catch (error) {
        lastError = error
      }
    }

    throw lastError
  },

  async create(payload: CategoryPayload): Promise<CategoryEntity> {
    const attempts: Array<() => Promise<{ data: unknown }>> = [
      () => api.post("/admin/categories", payload),
      () => api.post("/admin/category", payload),
      () => api.post("/create-categories", payload),
      () => api.post("/categories/create", payload),
      () => api.post("/category/create", payload),
      () => api.post("/categories", payload),
      () => api.post("/category", payload),
    ]

    let lastError: unknown
    for (const attempt of attempts) {
      try {
        const response = await attempt()
        return unwrapApiData<CategoryEntity>(response.data)
      } catch (error) {
        lastError = error
      }
    }

    throw lastError
  },

  async update(id: string, payload: CategoryPayload): Promise<CategoryEntity> {
    const attempts: Array<() => Promise<{ data: unknown }>> = [
      () => api.put(`/admin/categories/${id}`, payload),
      () => api.put(`/admin/category/${id}`, payload),
      () => api.put(`/categories/${id}`, payload),
      () => api.put(`/category/${id}`, payload),
    ]

    let lastError: unknown
    for (const attempt of attempts) {
      try {
        const response = await attempt()
        return unwrapApiData<CategoryEntity>(response.data)
      } catch (error) {
        lastError = error
      }
    }

    throw lastError
  },

  async delete(id: string): Promise<void> {
    const attempts: Array<() => Promise<unknown>> = [
      () => api.delete(`/admin/categories/${id}`),
      () => api.delete(`/admin/category/${id}`),
      () => api.delete(`/categories/${id}`),
      () => api.delete(`/category/${id}`),
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
