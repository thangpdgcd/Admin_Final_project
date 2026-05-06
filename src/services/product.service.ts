import { api } from "@/api"
import { normalizeList, unwrapApiData, type NormalizedListResult } from "@/utils/apiResponse"

export interface ProductQueryParams {
  page?: number
  limit?: number
  search?: string
  category?: string
}

export interface ProductEntity {
  _id?: string
  id?: string
  productId?: string | number
  productsId?: string | number
  name?: string
  title?: string
  name_vi?: string
  name_en?: string
  category?: {
    _id: string
    name: string
  }
  price?: number
  stock?: number
  quantity?: number
  image?: string
  imageCover?: string
  imageUrl?: string
  images?: Array<string | { url?: string; secure_url?: string }>
  createdAt: string
}

export interface ProductPayload {
  name?: string
  title?: string
  name_vi?: string
  name_en?: string
  price?: number | string
  stock?: number | string
  quantity?: number | string
  category?: string | number
  categoryId?: string | number
  categoriesId?: string | number
  userId?: string | number
  image?: string
}

const resolveProductId = (value: string | number | undefined | null): string => String(value ?? "").trim()

export const productService = {
  async getAll(params: ProductQueryParams = {}): Promise<NormalizedListResult<ProductEntity>> {
    const endpoints = ["/products", "/product", "/products/all"]
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
        return normalizeList<ProductEntity>(response.data, [
          "products",
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

  async getById(id: string): Promise<ProductEntity> {
    const normalizedId = resolveProductId(id)
    if (!normalizedId) {
      throw new Error("Missing product id")
    }

    const endpoints = [`/products/${normalizedId}`, `/product/${normalizedId}`]
    let lastError: unknown

    for (const endpoint of endpoints) {
      try {
        const response = await api.get(endpoint)
        return unwrapApiData<ProductEntity>(response.data)
      } catch (error) {
        lastError = error
      }
    }

    throw lastError
  },

  async create(payload: ProductPayload): Promise<ProductEntity> {
    const normalizedPayload: ProductPayload = {
      name: String(payload.name || payload.title || "").trim(),
      name_vi: payload.name_vi ? String(payload.name_vi).trim() : undefined,
      name_en: payload.name_en ? String(payload.name_en).trim() : undefined,
      price: payload.price !== undefined ? Number(payload.price) : undefined,
      stock: payload.stock !== undefined ? Number(payload.stock) : Number(payload.quantity ?? 0),
      categoriesId: payload.categoriesId ?? payload.categoryId ?? payload.category,
      userId: payload.userId,
      image: payload.image,
    }

    const attempts: Array<() => Promise<{ data: unknown }>> = [
      () => api.post("/create-products", normalizedPayload),
      () => api.post("/products", normalizedPayload),
    ]

    let lastError: unknown
    for (const attempt of attempts) {
      try {
        const response = await attempt()
        return unwrapApiData<ProductEntity>(response.data)
      } catch (error) {
        lastError = error
      }
    }

    throw lastError
  },

  async update(id: string, payload: ProductPayload): Promise<ProductEntity> {
    const normalizedId = resolveProductId(id)
    if (!normalizedId) {
      throw new Error("Missing product id")
    }

    const normalizedPayload: ProductPayload = {
      name: String(payload.name || payload.title || "").trim(),
      name_vi: payload.name_vi ? String(payload.name_vi).trim() : undefined,
      name_en: payload.name_en ? String(payload.name_en).trim() : undefined,
      price: payload.price !== undefined ? Number(payload.price) : undefined,
      stock: payload.stock !== undefined ? Number(payload.stock) : Number(payload.quantity ?? 0),
      categoriesId: payload.categoriesId ?? payload.categoryId ?? payload.category,
      image: payload.image,
    }

    const attempts: Array<() => Promise<{ data: unknown }>> = [
      () => api.put(`/products/${normalizedId}`, normalizedPayload),
    ]

    let lastError: unknown
    for (const attempt of attempts) {
      try {
        const response = await attempt()
        return unwrapApiData<ProductEntity>(response.data)
      } catch (error) {
        lastError = error
      }
    }

    throw lastError
  },

  async delete(id: string): Promise<void> {
    const normalizedId = resolveProductId(id)
    if (!normalizedId) {
      throw new Error("Missing product id")
    }

    const endpoints = [`/products/${normalizedId}`, `/product/${normalizedId}`]
    let lastError: unknown
    for (const endpoint of endpoints) {
      try {
        await api.delete(endpoint)
        return
      } catch (error) {
        lastError = error
      }
    }

    throw lastError
  },

  // Backward-compatible aliases used by existing pages/hooks.
  async list(params: ProductQueryParams = {}): Promise<NormalizedListResult<ProductEntity>> {
    return this.getAll(params)
  },

  async remove(id: string): Promise<void> {
    return this.delete(id)
  },
}
