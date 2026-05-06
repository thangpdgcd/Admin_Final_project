import { productService, type ProductPayload, type ProductQueryParams } from "@/services/product.service"

const toLegacyListShape = (result: Awaited<ReturnType<typeof productService.list>>) => ({
  data: {
    products: result.items,
    total: result.total,
    page: result.page,
    limit: result.limit,
  },
})

export const productApi = {
  async getProducts(params: ProductQueryParams = {}) {
    const result = await productService.list(params)
    return toLegacyListShape(result)
  },

  async getProduct(id: string) {
    return productService.getById(id)
  },

  async createProduct(payload: ProductPayload) {
    return productService.create(payload)
  },

  async updateProduct(id: string, payload: ProductPayload) {
    return productService.update(id, payload)
  },

  async deleteProduct(id: string) {
    return productService.remove(id)
  },
}
