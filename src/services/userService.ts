import {
  userService as userCrudService,
  type UserEntity as User,
  type UserRole,
  type CreateUserBody,
  type UpdateUserBody,
} from "@/services/user.service"

export type { User, UserRole, CreateUserBody, UpdateUserBody }

export interface PaginatedUsers {
  users: User[]
  total: number
  page: number
  limit: number
}

export interface GetUsersParams {
  page?: number
  limit?: number
  role?: UserRole | ""
  search?: string
}

export const userService = {
  async getUsers(params: GetUsersParams = {}): Promise<PaginatedUsers> {
    const { items, total, page = 1, limit = 10 } = await userCrudService.getAll(params)
    return { users: items, total, page, limit }
  },

  async getUserById(id: string): Promise<User> {
    return userCrudService.getById(id)
  },

  async createUser(body: CreateUserBody): Promise<User> {
    return userCrudService.create(body)
  },

  async updateUser(id: string, body: UpdateUserBody): Promise<User> {
    return userCrudService.update(id, body)
  },

  async deleteUser(id: string): Promise<void> {
    await userCrudService.delete(id)
  },
}
