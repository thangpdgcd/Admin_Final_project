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
    // Backend routes: GET /api/categories
    const response = await api.get("/categories", { params })
    return normalizeList<CategoryEntity>(response.data, [
      "categories",
      "results",
      "items",
      "docs",
      "rows",
      "data",
    ])
  },

  async getById(id: string): Promise<CategoryEntity> {
    // Backend routes: GET /api/categories/:id
    const response = await api.get(`/categories/${id}`)
    return unwrapApiData<CategoryEntity>(response.data)
  },

  async create(payload: CategoryPayload): Promise<CategoryEntity> {
    // Backend routes: POST /api/create-categories (auth required)
    const response = await api.post("/create-categories", payload)
    return unwrapApiData<CategoryEntity>(response.data)
  },

  async update(id: string, payload: CategoryPayload): Promise<CategoryEntity> {
    // Backend routes: PUT /api/categories/:id (auth required)
    const response = await api.put(`/categories/${id}`, payload)
    return unwrapApiData<CategoryEntity>(response.data)
  },

  async delete(id: string): Promise<void> {
    // Backend routes: DELETE /api/categories/:id (auth required)
    await api.delete(`/categories/${id}`)
  },
}
