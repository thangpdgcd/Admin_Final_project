import { useCallback, useState } from "react";
import {
  userService,
  type UserEntity,
  type UserQueryParams,
  type CreateUserBody,
  type UpdateUserBody,
} from "@/services/user.service";
import { getErrorMessage } from "@/lib/errorUtils";

export function useUsers() {
  const [data, setData] = useState<UserEntity[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async (params: UserQueryParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await userService.getAll(params);
      setData(
        result.items.map((user) => {
          const safeId = String((user as UserEntity & { id?: string })._id || (user as UserEntity & { id?: string }).id || "");
          return {
            ...user,
            _id: safeId,
          };
        })
      );
      setTotal(result.total);
      return result;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: CreateUserBody) => userService.create(payload), []);
  const update = useCallback((id: string, payload: UpdateUserBody) => userService.update(id, payload), []);
  const remove = useCallback((id: string) => userService.delete(id), []);
  const getById = useCallback((id: string) => userService.getById(id), []);

  return {
    data,
    total,
    loading,
    error,
    refetch,
    actions: {
      getAll: refetch,
      getById,
      create,
      update,
      delete: remove,
    },
  };
}

