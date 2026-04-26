import { useCallback, useState } from "react"
import { orderService, type OrderEntity, type OrderQueryParams } from "@/services/order.service"
import { getErrorMessage } from "@/types/lib/errorUtils"

export const useOrders = () => {
  const [data, setData] = useState<OrderEntity[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async (params: OrderQueryParams = {}) => {
    setLoading(true)
    setError(null)
    try {
      const result = await orderService.getAll(params)
      setData(result.items)
      setTotal(result.total)
      return result
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getById = useCallback((id: string) => orderService.getById(id), [])
  const create = useCallback((payload: Record<string, unknown>) => orderService.create(payload), [])
  const update = useCallback(
    (id: string, payload: { status?: string }) => orderService.update(id, payload),
    [],
  )
  const remove = useCallback((id: string) => orderService.delete(id), [])

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
  }
}
