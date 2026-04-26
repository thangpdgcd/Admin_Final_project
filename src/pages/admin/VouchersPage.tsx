import * as React from "react"
import { Plus } from "lucide-react"
import { motion } from "framer-motion"
import { Button, Card, Grid, Input, Pagination, Progress, Segmented, Tag, Skeleton } from "antd"
import { Page } from "@/components/layout/Page"
import { Section } from "@/components/layout/Section"
import { VoucherTable } from "@/components/vouchers/VoucherTable"
import { voucherService, type PromoVoucher } from "@/services/voucher.service"
import { toast } from "sonner"
import { VoucherFormModal } from "@/components/vouchers/VoucherFormModal"
import { computeVoucherStatus, formatVoucherWindow } from "@/utils/vouchers"
import { useTranslation } from "react-i18next"

type Filter = "all" | "active" | "expired" | "inactive"

export const VouchersPage = () => {
  const { t } = useTranslation()
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md
  const [q, setQ] = React.useState("")
  const [filter, setFilter] = React.useState<Filter>("all")
  const [page, setPage] = React.useState(1)
  const [pageSize] = React.useState(20)
  const [loading, setLoading] = React.useState(true)
  const [items, setItems] = React.useState<PromoVoucher[]>([])
  const [total, setTotal] = React.useState(0)
  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<PromoVoucher | null>(null)

  const fetchList = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await voucherService.listAdmin({ q, filter, page, pageSize })
      setItems(res.items)
      setTotal(res.total)
    } catch (e) {
      toast.error((e as { message?: string })?.message ?? "Failed to load vouchers")
    } finally {
      setLoading(false)
    }
  }, [q, filter, page, pageSize])

  React.useEffect(() => {
    void fetchList()
  }, [fetchList])

  const openCreate = () => {
    setEditing(null)
    setOpen(true)
  }

  const openEdit = (row: PromoVoucher) => {
    setEditing(row)
    setOpen(true)
  }

  const onDelete = async (row: PromoVoucher) => {
    try {
      await voucherService.softDeleteAdmin(row.id)
      toast.success(t("vouchers.deactivated"))
      void fetchList()
    } catch (e) {
      toast.error((e as { message?: string })?.message ?? "Delete failed")
    }
  }

  return (
    <Page>
      <Section
        title={t("vouchers.title")}
        description={t("vouchers.subtitle")}
        actions={
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button type="primary" onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              {t("vouchers.new")}
            </Button>
          </motion.div>
        }
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-sm">
            <Input
              value={q}
              onChange={(e) => {
                setPage(1)
                setQ(e.target.value)
              }}
              placeholder={t("vouchers.searchPlaceholder")}
            />
          </div>
          <Segmented
            value={filter}
            onChange={(v) => {
              setPage(1)
              setFilter(v as Filter)
            }}
            options={[
              { label: "All", value: "all" },
              { label: "Active", value: "active" },
              { label: "Expired", value: "expired" },
              { label: "Inactive", value: "inactive" },
            ]}
          />
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="rounded-xl border border-border bg-card p-4">
              <Skeleton active paragraph={{ rows: 4 }} />
            </div>
          ) : isMobile ? (
            items.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
                {t("common.noData")}
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((v) => {
                  const status = computeVoucherStatus(v)
                  const usedPct = v.quantity > 0 ? Math.min(100, (v.usedCount / v.quantity) * 100) : 0
                  const statusColor =
                    status === "active"
                      ? "green"
                      : status === "scheduled"
                        ? "blue"
                        : status === "exhausted"
                          ? "gold"
                          : status === "expired"
                            ? "red"
                            : "default"
                  return (
                    <Card key={v.id} size="small" className="rounded-xl border border-border/50">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <code className="rounded bg-muted px-2 py-1 text-xs font-semibold">{v.code}</code>
                          <div className="mt-2 text-sm text-muted-foreground">
                            {v.discountType === "percentage" ? `${v.discountValue}%` : `${v.discountValue}`}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">{formatVoucherWindow(v)}</div>
                        </div>
                        <Tag color={statusColor}>{status}</Tag>
                      </div>

                      <div className="mt-3 space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {v.usedCount}/{v.quantity}
                          </span>
                          <span>{Math.round(usedPct)}%</span>
                        </div>
                        <Progress percent={usedPct} showInfo={false} />
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Button size="small" onClick={() => openEdit(v)}>
                          Edit
                        </Button>
                        <Button danger size="small" onClick={() => onDelete(v)}>
                          Deactivate
                        </Button>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )
          ) : (
            <VoucherTable items={items} onEdit={openEdit} onDelete={onDelete} />
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Total: <span className="font-medium text-foreground">{total}</span>
          </p>
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            showSizeChanger={false}
            onChange={(p) => setPage(p)}
          />
        </div>
      </Section>

      <VoucherFormModal
        open={open}
        onOpenChange={setOpen}
        initial={editing}
        onSuccess={() => {
          setOpen(false)
          void fetchList()
        }}
      />
    </Page>
  )
}
