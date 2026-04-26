import { useEffect, useMemo, useState } from "react"
import { Card, Segmented, Statistic, Table, Tag, Typography } from "antd"
import type { ColumnsType } from "antd/es/table"
import { useTranslation } from "react-i18next"
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Area,
  AreaChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts"
import { useOrders } from "@/hooks/useOrders"
import { useUsers } from "@/hooks/useUsers"
import { useProducts } from "@/hooks/useProducts"
import { getErrorMessage } from "@/utils/errorUtils"
import { resolveUserRole } from "@/utils/authRole"

type AnalyticsMode = "week" | "month" | "year"

type AnalyticsPoint = { label: string; orders: number; users: number }

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

const ChartTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2 text-xs shadow-sm">
      <div className="font-semibold">{String(label ?? "")}</div>
      <div className="mt-1 space-y-0.5">
        {payload.map((p) => (
          <div key={String(p.dataKey)} className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">{String(p.name ?? p.dataKey)}</span>
            <span className="font-medium">
              {typeof p.value === "number"
                ? p.dataKey === "revenue"
                  ? formatCurrency(p.value)
                  : p.value.toLocaleString("vi-VN")
                : String(p.value ?? "")}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const toMonthKey = (value?: string): string => {
  if (!value) return "N/A"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "N/A"
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

const toDateKey = (value?: string): string => {
  if (!value) return "N/A"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "N/A"
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

// Used for analytics bucketing.

export const DashboardPage = () => {
  const { t } = useTranslation()
  const [error, setError] = useState<string | null>(null)
  const [latestOrders, setLatestOrders] = useState<
    Array<{ id: string; customer: string; total: number; status: string; createdAt?: string }>
  >([])
  const [latestUsers, setLatestUsers] = useState<
    Array<{ id: string; name: string; email: string; role: string; createdAt?: string }>
  >([])
  const [analyticsMode, setAnalyticsMode] = useState<AnalyticsMode>("week")
  const [analyticsByMode, setAnalyticsByMode] = useState<Record<AnalyticsMode, AnalyticsPoint[]>>({
    week: [],
    month: [],
    year: [],
  })
  const [revenue, setRevenue] = useState(0)
  const [summary, setSummary] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
  })

  const ordersHook = useOrders()
  const usersHook = useUsers()
  const productsHook = useProducts()
  const { refetch: refetchOrders } = ordersHook
  const { refetch: refetchUsers } = usersHook
  const { refetch: refetchProducts } = productsHook

  useEffect(() => {
    const load = async () => {
      try {
        setError(null)
        const [ordersResult, usersResult, productsResult] = await Promise.all([
          refetchOrders({ page: 1, limit: 500 }),
          refetchUsers({ page: 1, limit: 200 }),
          refetchProducts({ page: 1, limit: 1 }),
        ])

        const totalRevenue = ordersResult.items.reduce((sum, order) => {
          return sum + Number(order.totalOrderPrice ?? order.totalAmount ?? 0)
        }, 0)
        setRevenue(totalRevenue)

        setLatestOrders(
          ordersResult.items.slice(0, 5).map((order, index) => ({
            id: String(
              (order as Record<string, unknown>)._id ??
                (order as Record<string, unknown>).id ??
                (order as Record<string, unknown>).orderId ??
                (order as Record<string, unknown>).order_ID ??
                `order-${index}`,
            ),
            customer:
              order.user?.name ||
              order.user?.email ||
              ((order as Record<string, unknown>).users as { name?: string; email?: string } | undefined)
                ?.name ||
              ((order as Record<string, unknown>).users as { name?: string; email?: string } | undefined)
                ?.email ||
              "N/A",
            total: Number(
              (order.totalOrderPrice ??
                order.totalAmount ??
                (order as Record<string, unknown>).total_Amount ??
                0) as number,
            ),
            status: String(
              order.status || (order.isDelivered ? "delivered" : order.isPaid ? "confirmed" : "pending"),
            ),
            createdAt: order.createdAt,
          })),
        )

        setLatestUsers(
          usersResult.items.slice(0, 5).map((user, index) => ({
            id: String(
              (
                user as typeof user & {
                  id?: string
                  userId?: string | number
                  usersId?: string | number
                }
              )._id ||
                (
                  user as typeof user & {
                    id?: string
                    userId?: string | number
                    usersId?: string | number
                  }
                ).id ||
                (
                  user as typeof user & {
                    id?: string
                    userId?: string | number
                    usersId?: string | number
                  }
                ).userId ||
                (
                  user as typeof user & {
                    id?: string
                    userId?: string | number
                    usersId?: string | number
                  }
                ).usersId ||
                `user-${index}`,
            ),
            name: user.name,
            email: user.email,
            role: resolveUserRole(user as unknown as Record<string, unknown>),
            createdAt: user.createdAt,
          })),
        )

        const usersByDate = new Map<string, number>()
        for (const user of usersResult.items) {
          const date = toDateKey(user.createdAt)
          if (date === "N/A") continue
          usersByDate.set(date, (usersByDate.get(date) || 0) + 1)
        }

        const ordersByDate = new Map<string, number>()
        for (const order of ordersResult.items) {
          const date = toDateKey(order.createdAt)
          if (date === "N/A") continue
          ordersByDate.set(date, (ordersByDate.get(date) || 0) + 1)
        }

        const now = new Date()
        const makeDateKey = (d: Date) =>
          `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

        const buildLastNDays = (days: number): AnalyticsPoint[] => {
          const points: AnalyticsPoint[] = []
          for (let i = days - 1; i >= 0; i -= 1) {
            const d = new Date(now)
            d.setDate(now.getDate() - i)
            const key = makeDateKey(d)
            const label =
              days <= 7
                ? new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(d)
                : new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit" }).format(d)
            points.push({
              label,
              orders: ordersByDate.get(key) || 0,
              users: usersByDate.get(key) || 0,
            })
          }
          return points
        }

        const buildLast12Months = (): AnalyticsPoint[] => {
          const points: AnalyticsPoint[] = []
          const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`

          const usersByMonth = new Map<string, number>()
          for (const user of usersResult.items) {
            const k = toMonthKey(user.createdAt)
            if (k === "N/A") continue
            usersByMonth.set(k, (usersByMonth.get(k) || 0) + 1)
          }

          const ordersByMonth = new Map<string, number>()
          for (const order of ordersResult.items) {
            const k = toMonthKey(order.createdAt)
            if (k === "N/A") continue
            ordersByMonth.set(k, (ordersByMonth.get(k) || 0) + 1)
          }

          for (let i = 11; i >= 0; i -= 1) {
            const d = new Date(now)
            d.setMonth(now.getMonth() - i)
            const k = monthKey(d)
            points.push({
              label: new Intl.DateTimeFormat("en-US", { month: "short" }).format(d),
              orders: ordersByMonth.get(k) || 0,
              users: usersByMonth.get(k) || 0,
            })
          }
          return points
        }

        setAnalyticsByMode({
          week: buildLastNDays(7),
          month: buildLastNDays(30),
          year: buildLast12Months(),
        })

        setSummary({
          totalUsers: usersResult.total,
          totalProducts: productsResult.total,
          totalOrders: ordersResult.total,
        })
      } catch (err) {
        setError(getErrorMessage(err))
      }
    }
    void load()
  }, [refetchOrders, refetchUsers, refetchProducts])

  const loading = ordersHook.loading || usersHook.loading || productsHook.loading
  const analyticsSubtitle = useMemo(() => {
    if (analyticsMode === "year") return "Orders and users over the last 12 months"
    if (analyticsMode === "month") return "Orders and users over the last 30 days"
    return "Orders and users over the last 7 days"
  }, [analyticsMode])

  const renderedAnalyticsSeries = useMemo(
    () => analyticsByMode[analyticsMode] ?? [],
    [analyticsByMode, analyticsMode],
  )

  const latestOrdersColumns = useMemo<ColumnsType<(typeof latestOrders)[number]>>(
    () => [
      { title: "Customer", dataIndex: "customer", key: "customer" },
      {
        title: "Total",
        dataIndex: "total",
        key: "total",
        render: (v: number) => formatCurrency(Number(v || 0)),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (v: string) => {
          const s = String(v || "").toLowerCase()
          const color = s.includes("deliver")
            ? "blue"
            : s.includes("paid") || s.includes("confirm")
              ? "green"
              : "orange"
          const label = s.includes("deliver")
            ? "Đã giao"
            : s.includes("paid") || s.includes("confirm")
              ? "Đã thanh toán"
              : "Chưa thanh toán"
          return <Tag color={color}>{label}</Tag>
        },
      },
    ],
    [],
  )

  const latestUsersColumns = useMemo<ColumnsType<(typeof latestUsers)[number]>>(
    () => [
      { title: t("users.columns.user"), dataIndex: "name", key: "name" },
      { title: t("users.columns.email"), dataIndex: "email", key: "email" },
      { title: t("users.columns.role"), dataIndex: "role", key: "role", render: (v: string) => <Tag>{String(v)}</Tag> },
    ],
    [t],
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t("dashboard.title")}</h2>
        <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <Statistic title={t("dashboard.totalUsers")} value={summary.totalUsers} />
        </Card>
        <Card>
          <Statistic title={t("dashboard.totalProducts")} value={summary.totalProducts} />
        </Card>
        <Card>
          <Statistic title={t("dashboard.totalOrders")} value={summary.totalOrders} />
        </Card>
        <Card>
          <Statistic title={t("dashboard.totalRevenue")} value={formatCurrency(revenue)} />
        </Card>
      </div>

      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <Typography.Title level={5} className="mb-0!">
              Activity Analytics
            </Typography.Title>
            <Typography.Text type="secondary">{analyticsSubtitle}</Typography.Text>
          </div>
          <Segmented
            value={analyticsMode}
            onChange={(v) => setAnalyticsMode(v as AnalyticsMode)}
            options={[
              { value: "week", label: "Weekly" },
              { value: "month", label: "Monthly" },
              { value: "year", label: "Yearly" },
            ]}
          />
        </div>

        <div className="mt-4">
          {renderedAnalyticsSeries.length === 0 ? (
            <div className="flex h-[260px] items-center justify-center rounded-lg border border-border/60 bg-background/20 text-sm text-muted-foreground">
              Không có dữ liệu.
            </div>
          ) : (
            <div className="h-[260px] rounded-xl border border-border/60 bg-background/20 px-2 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={renderedAnalyticsSeries} margin={{ top: 8, right: 12, bottom: 8, left: 4 }}>
                  <defs>
                    <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.25} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    minTickGap={18}
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={32}
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <RechartsTooltip content={<ChartTooltip />} />

                  <Area
                    type="monotone"
                    name="Orders"
                    dataKey="orders"
                    stroke="#6366f1"
                    fill="url(#ordersGradient)"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    name="Users"
                    dataKey="users"
                    stroke="#a855f7"
                    fill="url(#usersGradient)"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
        <Card>
          <Typography.Title level={5} className="mb-4!">
            Latest orders
          </Typography.Title>
          <Table
            rowKey="id"
            columns={latestOrdersColumns}
            dataSource={latestOrders}
            pagination={false}
            loading={loading}
            locale={{ emptyText: loading ? "Loading..." : "No orders found" }}
            size="small"
          />
        </Card>

        <Card>
          <Typography.Title level={5} className="mb-4!">
            Latest users
          </Typography.Title>
          <Table
            rowKey="id"
            columns={latestUsersColumns}
            dataSource={latestUsers}
            pagination={false}
            loading={loading}
            locale={{ emptyText: loading ? "Loading..." : "No users found" }}
            size="small"
          />
        </Card>
      </div>
    </div>
  )
}
