export interface BackendOrder {
  _id?: string
  id?: string
  orderId?: string
  idOrder?: string
  user?: {
    name?: string
    email?: string
  }
  totalOrderPrice?: number
  isPaid?: boolean
  isDelivered?: boolean
  createdAt?: string
  [key: string]: unknown
}

export interface OrderRow {
  key: string
  id: string
  customer: string
  totalPrice: number
  isPaid: boolean
  isDelivered: boolean
  date: string
  raw: BackendOrder
}

const pickNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const n = Number(value)
    if (Number.isFinite(n)) return n
  }
  return undefined
}

const pickString = (...values: Array<unknown>): string | undefined => {
  for (const v of values) {
    if (typeof v === "string") {
      const s = v.trim()
      if (s) return s
    }
  }
  return undefined
}

const pickId = (...values: Array<unknown>): string | undefined => {
  const s = pickString(...values)
  if (s) return s

  for (const v of values) {
    if (typeof v === "number" && Number.isFinite(v)) return String(v)
    if (typeof v === "bigint") return String(v)
  }

  return undefined
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

const resolveCustomer = (o: BackendOrder): string => {
  const raw = o as Record<string, unknown>
  const userName = o.user?.name
  const userEmail = o.user?.email
  const usersObj = raw.users as { name?: unknown; email?: unknown } | undefined
  const userId = raw.userId as { name?: unknown; email?: unknown } | undefined
  const customerId = raw.customerId as { name?: unknown; email?: unknown } | undefined
  const customer = (o as { customer?: { name?: string; email?: string } })?.customer
  const customerName = (o as { customerName?: string }).customerName
  const customerEmail = (o as { customerEmail?: string }).customerEmail
  const username = (o as { userName?: string }).userName
  const customerFallback = (o as { customer?: string }).customer

  return (
    pickString(
      userName,
      userEmail,
      usersObj?.name,
      usersObj?.email,
      userId?.name,
      userId?.email,
      customerId?.name,
      customerId?.email,
      customer?.name,
      customer?.email,
      customerName,
      customerEmail,
      username,
      customerFallback,
    ) ?? "N/A"
  )
}

const resolveTotalPrice = (o: BackendOrder): number => {
  const raw = o as Record<string, unknown>

  const candidates: Array<number | undefined> = [
    pickNumber(raw.totalOrderPrice),
    pickNumber(raw.totalAmount),
    pickNumber(raw.total_amount),
    pickNumber(raw.total_Amount),
    pickNumber(raw.totalPrice),
    pickNumber(raw.total),
    pickNumber(raw.amount),
    pickNumber(raw.grandTotal),
    pickNumber(raw.total_order_price),
  ]

  const found = candidates.find((n): n is number => typeof n === "number")
  return found ?? 0
}

const resolveIsPaid = (o: BackendOrder): boolean => {
  const raw = o as Record<string, unknown>
  const status = typeof raw.status === "string" ? raw.status.toLowerCase() : undefined

  if (typeof raw.isPaid === "boolean") return raw.isPaid
  if (status && ["confirmed", "preparing", "delivered", "paid"].includes(status)) return true
  return false
}

const resolveIsDelivered = (o: BackendOrder): boolean => {
  const raw = o as Record<string, unknown>
  const status = typeof raw.status === "string" ? raw.status.toLowerCase() : undefined

  if (typeof raw.isDelivered === "boolean") return raw.isDelivered
  if (status && status === "delivered") return true
  return false
}

const resolveDate = (o: BackendOrder): string => {
  const raw = o as Record<string, unknown>
  return pickString(o.createdAt, raw.date, raw.orderDate, raw.created_at) ?? ""
}

export const mapOrdersToRows = (orders: BackendOrder[]): OrderRow[] => {
  return orders.map((o, index) => {
    const raw = o as Record<string, unknown>
    const nestedOrder = isRecord(raw.order) ? raw.order : undefined
    const id =
      pickId(
        o._id,
        o.id,
        (o as { orderId?: string }).orderId,
        (o as { idOrder?: string }).idOrder,
        raw._id,
        raw.order_id,
        raw.orders_id,
        raw.ordersId,
        raw.orderID,
        raw.orderId,
        raw.id,
        nestedOrder?.id,
        nestedOrder?._id,
      ) ?? ""

    return {
      // Ensure uniqueness even when backend returns duplicate/missing ids.
      key: id ? `${id}-${index}` : `order-${o.createdAt || "na"}-${index}`,
      id,
      customer: resolveCustomer(o),
      totalPrice: resolveTotalPrice(o),
      isPaid: resolveIsPaid(o),
      isDelivered: resolveIsDelivered(o),
      date: resolveDate(o),
      raw: o,
    }
  })
}
