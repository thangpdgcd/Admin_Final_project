import { api } from "@/services/api"
import { unwrapApiData } from "@/utils/apiResponse"

export type VoucherDiscountType = "percentage" | "fixed"
export type VoucherApplicableUsers = "all" | "new_user" | "specific"

export type PromoVoucher = {
  id: number
  code: string
  discountType: VoucherDiscountType
  discountValue: number
  minOrderValue: number | null
  maxDiscountValue: number | null
  quantity: number
  usedCount: number
  startDate: string
  endDate: string
  isActive: boolean
  applicableUsers: VoucherApplicableUsers
  specificUsers: string[]
  createdAt: string
  updatedAt: string
  expired: boolean
}

type ListResponse = { items: PromoVoucher[]; total: number; page: number; pageSize: number }

export type VoucherListQuery = {
  q?: string
  filter?: "all" | "active" | "expired" | "inactive"
  page?: number
  pageSize?: number
}

export type VoucherUpsertInput = {
  code: string
  discountType: VoucherDiscountType
  discountValue: number
  minOrderValue?: number | null
  maxDiscountValue?: number | null
  quantity: number
  startDate: string | Date
  endDate: string | Date
  isActive?: boolean
  applicableUsers: VoucherApplicableUsers
  specificUsers?: string[]
}

export const voucherService = {
  listAdmin: async (query: VoucherListQuery): Promise<ListResponse> => {
    const res = await api.get("/admin/vouchers", { params: query })
    return unwrapApiData<ListResponse>(res.data)
  },
  detailAdmin: async (id: number): Promise<PromoVoucher> => {
    const res = await api.get(`/admin/vouchers/${id}`)
    return unwrapApiData<PromoVoucher>(res.data)
  },
  createAdmin: async (input: VoucherUpsertInput): Promise<PromoVoucher> => {
    const res = await api.post("/admin/vouchers", input)
    return unwrapApiData<PromoVoucher>(res.data)
  },
  updateAdmin: async (id: number, input: Partial<VoucherUpsertInput>): Promise<PromoVoucher> => {
    const res = await api.put(`/admin/vouchers/${id}`, input)
    return unwrapApiData<PromoVoucher>(res.data)
  },
  softDeleteAdmin: async (id: number): Promise<PromoVoucher> => {
    const res = await api.delete(`/admin/vouchers/${id}`)
    return unwrapApiData<PromoVoucher>(res.data)
  },
}

