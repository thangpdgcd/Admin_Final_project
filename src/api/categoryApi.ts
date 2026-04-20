import { categoryService, type CategoryQueryParams } from "@/services/category.service";

function toLegacyListShape(result: Awaited<ReturnType<typeof categoryService.getAll>>) {
  return {
    data: {
      categories: result.items,
      data: result.items,
      results: result.items,
      total: result.total,
      page: result.page,
      limit: result.limit,
    },
  };
}

export const categoryApi = {
  async getCategories(params: CategoryQueryParams = {}) {
    const result = await categoryService.getAll(params);
    return toLegacyListShape(result);
  },

  async getCategory(id: string) {
    return categoryService.getById(id);
  },

  async createCategory(data: FormData | Record<string, unknown>) {
    if (data instanceof FormData) {
      const payload = Object.fromEntries(data.entries()) as Record<string, string>;
      return categoryService.create({
        name: payload.name ?? "",
        description: payload.description,
      });
    }
    return categoryService.create(data as { name: string; description?: string });
  },

  async updateCategory(id: string, data: FormData | Record<string, unknown>) {
    if (data instanceof FormData) {
      const payload = Object.fromEntries(data.entries()) as Record<string, string>;
      return categoryService.update(id, {
        name: payload.name ?? "",
        description: payload.description,
      });
    }
    return categoryService.update(id, data as { name: string; description?: string });
  },

  async deleteCategory(id: string) {
    return categoryService.delete(id);
  },
};

