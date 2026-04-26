import { Copy, Pencil, Trash2 } from "lucide-react"
import * as React from "react"
import { Button, Progress, Table, Tag, Tooltip } from "antd"
import type { ColumnsType } from "antd/es/table"
import type { PromoVoucher } from "@/services/voucher.service"
import { computeVoucherStatus, formatVoucherWindow } from "@/utils/vouchers"
import { toast } from "sonner"

type Props = {
  items: PromoVoucher[]
  onEdit: (row: PromoVoucher) => void
  onDelete: (row: PromoVoucher) => void
}

const statusTag = (status: string) => {
  const color =
    status === "active"
      ? "green"
      : status === "scheduled"
        ? "blue"
        : status === "exhausted"
          ? "gold"
          : status === "expired"
            ? "red"
            : "default"
  return <Tag color={color}>{status}</Tag>
}

export const VoucherTable = ({ items, onEdit, onDelete }: Props) => {
  const columns = React.useMemo<ColumnsType<PromoVoucher>>(
    () => [
      {
        title: "Code",
        dataIndex: "code",
        key: "code",
        width: 220,
        render: (_v, row) => (
          <div className="flex items-center gap-2">
            <code className="rounded bg-muted px-2 py-1 text-xs font-semibold">{row.code}</code>
            <Tooltip title="Copy code">
              <Button
                type="text"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(row.code)
                    toast.success("Copied")
                  } catch {
                    toast.error("Copy failed")
                  }
                }}
                aria-label="Copy code"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </Tooltip>
          </div>
        ),
      },
      {
        title: "Type",
        dataIndex: "discountType",
        key: "discountType",
        width: 120,
        render: (v: PromoVoucher["discountType"]) => <span className="capitalize">{v}</span>,
      },
      {
        title: "Value",
        dataIndex: "discountValue",
        key: "discountValue",
        width: 140,
        render: (_v, row) =>
          row.discountType === "percentage" ? `${row.discountValue}%` : `${row.discountValue}`,
      },
      {
        title: "Window",
        key: "window",
        render: (_v, row) => (
          <span className="text-sm text-muted-foreground">{formatVoucherWindow(row)}</span>
        ),
      },
      {
        title: "Usage",
        key: "usage",
        render: (_v, row) => {
          const usedPct = row.quantity > 0 ? Math.min(100, (row.usedCount / row.quantity) * 100) : 0
          return (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {row.usedCount}/{row.quantity}
                </span>
                <span>{Math.round(usedPct)}%</span>
              </div>
              <Progress percent={usedPct} showInfo={false} />
            </div>
          )
        },
      },
      {
        title: "Status",
        key: "status",
        width: 120,
        render: (_v, row) => statusTag(computeVoucherStatus(row)),
      },
      {
        title: "Actions",
        key: "actions",
        width: 120,
        align: "right",
        render: (_v, row) => (
          <div className="inline-flex items-center gap-1">
            <Button type="text" onClick={() => onEdit(row)} aria-label="Edit">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button type="text" danger onClick={() => onDelete(row)} aria-label="Deactivate">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [onDelete, onEdit],
  )

  return (
    <div className="rounded-xl border border-border bg-card">
      <Table<PromoVoucher>
        rowKey="id"
        columns={columns}
        dataSource={items}
        pagination={false}
        locale={{ emptyText: "No vouchers." }}
        onRow={(row) => {
          const status = computeVoucherStatus(row)
          const faded = status === "expired" || status === "inactive"
          return {
            className: faded ? "opacity-75" : "",
          }
        }}
      />
    </div>
  )
}
