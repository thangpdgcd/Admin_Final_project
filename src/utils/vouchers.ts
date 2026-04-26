import type { PromoVoucher } from "@/services/voucher.service"

export const formatVoucherWindow = (v: Pick<PromoVoucher, "startDate" | "endDate">) => {
  const s = new Date(v.startDate)
  const e = new Date(v.endDate)
  const fmt = (d: Date) => (Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString())
  return `${fmt(s)} → ${fmt(e)}`
}

export const computeVoucherStatus = (v: PromoVoucher) => {
  const now = Date.now()
  const start = new Date(v.startDate).getTime()
  const end = new Date(v.endDate).getTime()
  if (!v.isActive) return "inactive"
  if (Number.isFinite(end) && end < now) return "expired"
  if (v.quantity > 0 && v.usedCount >= v.quantity) return "exhausted"
  if (Number.isFinite(start) && start > now) return "scheduled"
  return "active"
}
