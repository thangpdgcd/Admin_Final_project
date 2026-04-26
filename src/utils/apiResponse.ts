export interface NormalizedListResult<T> {
  items: T[]
  total: number
  page?: number
  limit?: number
}

type AnyObject = Record<string, unknown>

const isObject = (value: unknown): value is AnyObject => typeof value === "object" && value !== null

export const unwrapApiData = <T>(payload: unknown): T => {
  if (!isObject(payload)) return payload as T

  let current: unknown = payload
  while (isObject(current) && "data" in current) {
    const next = (current as AnyObject).data
    if (next === undefined || next === null) break
    current = next
  }

  return current as T
}

export const normalizeList = <T>(
  payload: unknown,
  keys: string[] = ["results", "items", "products", "categories", "orders", "docs", "rows", "data"],
): NormalizedListResult<T> => {
  const data = unwrapApiData<AnyObject | T[]>(payload)
  let items: T[] = []

  if (Array.isArray(data)) {
    items = data as T[]
  } else {
    for (const key of keys) {
      const candidate = data[key]
      if (Array.isArray(candidate)) {
        items = candidate as T[]
        break
      }

      if (isObject(candidate)) {
        for (const nestedKey of keys) {
          const nested = (candidate as AnyObject)[nestedKey]
          if (Array.isArray(nested)) {
            items = nested as T[]
            break
          }
        }
      }

      if (items.length > 0) {
        break
      }
    }
  }

  const objectData = Array.isArray(data) ? ({} as AnyObject) : data
  const total = Number(
    objectData.total ??
      objectData.count ??
      objectData.totalDocs ??
      (isObject(objectData.meta) ? (objectData.meta as AnyObject).total : undefined) ??
      items.length ??
      0,
  )
  const page =
    typeof objectData.page === "number"
      ? objectData.page
      : typeof objectData.currentPage === "number"
        ? objectData.currentPage
        : undefined
  const limit =
    typeof objectData.limit === "number"
      ? objectData.limit
      : typeof objectData.perPage === "number"
        ? objectData.perPage
        : undefined

  return { items, total, page, limit }
}
