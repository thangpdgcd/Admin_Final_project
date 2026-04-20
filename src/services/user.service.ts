import { api } from "@/services/api";
import { normalizeList, unwrapApiData, type NormalizedListResult } from "@/utils/apiResponse";

export type UserRole = "admin" | "staff" | "user";

export interface UserEntity {
  _id?: string;
  id?: string;
  userId?: string | number;
  usersId?: string | number;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  role?: UserRole | "";
  search?: string;
}

export interface CreateUserBody {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserBody {
  name?: string;
  email?: string;
  role?: UserRole;
  roleId?: string | number;
  roleID?: string | number;
  avatar?: string;
}

/** Backend `Users.roleID`: "1" user, "2" admin, "3" staff */
export function mapRoleToRoleId(role: UserRole): string {
  if (role === "admin") return "2";
  if (role === "staff") return "3";
  return "1";
}

function resolveUserId(value: string | number | undefined | null): string {
  return String(value ?? "").trim();
}

export const userService = {
  async getAll(params: UserQueryParams = {}): Promise<NormalizedListResult<UserEntity>> {
    const response = await api.get("/users", { params });
    return normalizeList<UserEntity>(response.data, ["users", "results", "items", "data"]);
  },

  async getById(id: string): Promise<UserEntity> {
    const normalizedId = resolveUserId(id);
    if (!normalizedId) {
      throw new Error("Missing user id");
    }

    const endpoints = [`/users/${normalizedId}`, `/user/${normalizedId}`];
    let lastError: unknown;
    for (const endpoint of endpoints) {
      try {
        const response = await api.get(endpoint);
        return unwrapApiData<UserEntity>(response.data);
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError;
  },

  async create(payload: CreateUserBody): Promise<UserEntity> {
    const roleID = mapRoleToRoleId(payload.role);
    const normalizedPayload: Record<string, unknown> = {
      ...payload,

       roleID: roleID,
    };

    // Backend variants seen in this project:
    // - /register (used by authService)
    // - /users (common REST)
    // - /user (legacy)
    const endpoints = ["/register", "/users", "/user"];
    let lastError: unknown;

    for (let i = 0; i < endpoints.length; i++) {
      const endpoint = endpoints[i];
      const isLastAttempt = i === endpoints.length - 1;
      try {
        const response = await api.post(endpoint, normalizedPayload, {
          suppressErrorToast: !isLastAttempt,
        });
        return unwrapApiData<UserEntity>(response.data);
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError;
  },

  async update(id: string, payload: UpdateUserBody): Promise<UserEntity> {
    const normalizedId = resolveUserId(id);
    if (!normalizedId) {
      throw new Error("Missing user id");
    }

    const body: Record<string, unknown> = {};
    if (payload.name !== undefined) body.name = payload.name;
    if (payload.email !== undefined) body.email = payload.email;
    if (payload.avatar !== undefined) body.avatar = payload.avatar;
    const rawRole = payload.role ?? payload.roleId ?? payload.roleID;
    if (rawRole !== undefined && rawRole !== null && `${rawRole}`.trim() !== "") {
      const r = `${rawRole}`.trim().toLowerCase();
      if (r === "admin" || r === "staff" || r === "user") {
        body.roleID = mapRoleToRoleId(r as UserRole);
      } else if (/^[123]$/.test(r)) {
        body.roleID = r;
      }
    }

    const attempts: Array<() => Promise<{ data: unknown }>> = [
      () => api.put(`/users/${normalizedId}`, body),
      () => api.patch(`/users/${normalizedId}`, body),
      () => api.put(`/user/${normalizedId}`, body),
      () => api.patch(`/user/${normalizedId}`, body),
      () => api.put(`/users/update/${normalizedId}`, body),
      () => api.patch(`/users/update/${normalizedId}`, body),
    ];

    let lastError: unknown;
    for (const attempt of attempts) {
      try {
        const response = await attempt();
        return unwrapApiData<UserEntity>(response.data);
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError;
  },

  async delete(id: string): Promise<void> {
    const normalizedId = resolveUserId(id);
    if (!normalizedId) {
      throw new Error("Missing user id");
    }

    const endpoints = [`/users/${normalizedId}`, `/user/${normalizedId}`];
    let lastError: unknown;
    for (const endpoint of endpoints) {
      try {
        await api.delete(endpoint);
        return;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError;
  },
};

