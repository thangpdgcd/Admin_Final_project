import { useCallback, useEffect, useState } from "react"
import { Button, Card, Drawer, Grid, Input, Pagination, Skeleton, Space, Table, Tag } from "antd"
import type { PaginationProps } from "antd"
import type { ColumnsType, TablePaginationConfig } from "antd/es/table"
import dayjs from "dayjs"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"

import { orderApi } from "@/api/orderApi"
import { mapOrdersToRows, type BackendOrder, type OrderRow } from "@/features/orders/model/normalizeOrder"

const { Search } = Input

type OrdersApiResponse = { data?: unknown } | Record<string, unknown>

let didLogFirstOrderPayload = false

const extractOrders = (response: OrdersApiResponse): BackendOrder[] => {
  const data = (response as { data?: unknown }).data ?? response
  const payload = data as Record<string, unknown>

  // `orderApi.getOrders()` may return multiple list keys depending on legacy backend shapes.
  const candidates = [payload.orders, payload.data, payload.results]
  const listCandidate = candidates.find((candidate) => Array.isArray(candidate))
  return Array.isArray(listCandidate) ? (listCandidate as BackendOrder[]) : []
}

const extractTotal = (response: OrdersApiResponse, listLength: number): number => {
  const data = (response as { data?: unknown }).data ?? response
  const payload = data as Record<string, unknown>
  return typeof payload.total === "number" ? payload.total : listLength
}

/** Backend stores amounts in VND (whole numbers). */
const formatVnd = (value: number | undefined | null): string => {
  const n = Number(value)
  if (!Number.isFinite(n)) return "—"
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n)
}

export const OrdersPage = () => {
  const { t } = useTranslation()
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const fetchOrders = useCallback(
    async (pageParam = page, pageSizeParam = pageSize, searchParam: string = searchTerm) => {
      try {
        setLoading(true)
        const res = await orderApi.getOrders({
          page: pageParam,
          limit: pageSizeParam,
          search: searchParam || undefined,
        })

        const list = extractOrders(res)
        if (import.meta.env.DEV && !didLogFirstOrderPayload && list.length > 0) {
          didLogFirstOrderPayload = true
          const first = list[0] as Record<string, unknown>
          console.debug("[OrdersPage] First order payload sample:", first)
          console.debug("[OrdersPage] First order payload keys:", Object.keys(first))
        }
        setTotal(extractTotal(res, list.length))
        setOrders(mapOrdersToRows(list))
      } catch {
        toast.error("Failed to fetch orders")
      } finally {
        setLoading(false)
      }
    },
    [page, pageSize, searchTerm],
  )

  useEffect(() => {
    void fetchOrders(1, pageSize)
  }, [fetchOrders, pageSize])

  const handleTableChange = (pagination: TablePaginationConfig) => {
    const current = pagination.current || 1
    const size = pagination.pageSize || 10
    setPage(current)
    setPageSize(size)
    void fetchOrders(current, size)
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setPage(1)
    void fetchOrders(1, pageSize, value)
  }

  const handleView = (record: OrderRow) => {
    setSelectedOrder(record)
    setDetailsOpen(true)
  }

  const columns: ColumnsType<OrderRow> = [
    {
      title: t("orders.fieldCustomer"),
      dataIndex: "customer",
    },
    {
      title: t("orders.fieldTotal"),
      dataIndex: "totalPrice",
      render: (value: number) => formatVnd(value),
    },
    {
      title: t("orders.fieldStatus"),
      render: (_, record) => (
        <Space size="small">
          <Tag color={record.isPaid ? "green" : "orange"}>
            {record.isPaid ? t("orders.paid") : t("orders.unpaid")}
          </Tag>
          <Tag color={record.isDelivered ? "blue" : "default"}>
            {record.isDelivered ? t("orders.delivered") : t("orders.undelivered")}
          </Tag>
        </Space>
      ),
    },
    {
      title: t("orders.date"),
      dataIndex: "date",
      render: (value: string) => dayjs(value).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: t("common.actions"),
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button size="small" onClick={() => handleView(record)}>
            {t("orders.view")}
          </Button>
        </Space>
      ),
    },
  ]

  const pagination: PaginationProps = { current: page, pageSize, total, showSizeChanger: true }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("orders.title")}</h2>
          <p className="text-muted-foreground">{t("orders.subtitle")}</p>
        </div>
        <Search
          placeholder={t("orders.searchPlaceholder")}
          onSearch={handleSearch}
          allowClear
          style={{ maxWidth: 280 }}
        />
      </div>

      {isMobile ? (
        <div className="space-y-3">
          {loading ? (
            <>
              <Skeleton active paragraph={{ rows: 3 }} />
              <Skeleton active paragraph={{ rows: 3 }} />
              <Skeleton active paragraph={{ rows: 3 }} />
            </>
          ) : orders.length === 0 ? (
            <div className="rounded-lg border border-border/50 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
              {t("orders.noOrders")}
            </div>
          ) : (
            orders.map((o) => (
              <Card key={o.key} size="small" className="rounded-xl border border-border/50">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{o.customer}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{formatVnd(o.totalPrice)}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <Space size="small" direction="vertical">
                      <Tag color={o.isPaid ? "green" : "orange"}>
                        {o.isPaid ? t("orders.paid") : t("orders.unpaid")}
                      </Tag>
                      <Tag color={o.isDelivered ? "blue" : "default"}>
                        {o.isDelivered ? t("orders.delivered") : t("orders.undelivered")}
                      </Tag>
                    </Space>
                  </div>
                </div>

                <div className="mt-2 text-xs text-muted-foreground">
                  {o.date ? dayjs(o.date).format("YYYY-MM-DD HH:mm") : "—"}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Button size="small" onClick={() => handleView(o)}>
                    {t("orders.view")}
                  </Button>
                </div>
              </Card>
            ))
          )}

          <div className="pt-2">
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              showSizeChanger
              onChange={(p, ps) => {
                const size = ps || pageSize
                setPage(p)
                setPageSize(size)
                void fetchOrders(p, size)
              }}
            />
          </div>
        </div>
      ) : (
        <Table<OrderRow>
          columns={columns}
          dataSource={orders}
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          rowKey="key"
        />
      )}

      <Drawer
        title={t("orders.detailsTitle")}
        size="default"
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      >
        {selectedOrder && (
          <div className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground">{t("orders.fieldOrderId")}</div>
              <div className="font-mono text-sm">{selectedOrder.id}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{t("orders.fieldCustomer")}</div>
              <div>{selectedOrder.customer}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{t("orders.fieldTotal")}</div>
              <div>{formatVnd(selectedOrder.totalPrice)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{t("orders.fieldStatus")}</div>
              <Space size="small">
                <Tag color={selectedOrder.isPaid ? "green" : "orange"}>
                  {selectedOrder.isPaid ? t("orders.paid") : t("orders.unpaid")}
                </Tag>
                <Tag color={selectedOrder.isDelivered ? "blue" : "default"}>
                  {selectedOrder.isDelivered ? t("orders.delivered") : t("orders.undelivered")}
                </Tag>
              </Space>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{t("orders.fieldCreatedAt")}</div>
              <div>{dayjs(selectedOrder.date).format("YYYY-MM-DD HH:mm")}</div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
