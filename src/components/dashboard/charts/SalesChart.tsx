"use client"

import * as React from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
} from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import { Card, Select, Typography } from "antd"

const chartData = [
  { date: "2024-01", sales: 186 },
  { date: "2024-02", sales: 305 },
  { date: "2024-03", sales: 237 },
  { date: "2024-04", sales: 412 },
  { date: "2024-05", sales: 348 },
  { date: "2024-06", sales: 521 },
  { date: "2024-07", sales: 439 },
  { date: "2024-08", sales: 498 },
  { date: "2024-09", sales: 567 },
  { date: "2024-10", sales: 612 },
  { date: "2024-11", sales: 589 },
  { date: "2024-12", sales: 678 },
]

const formatVnd = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n)

export const SalesChart = () => {
  const isMobile = useIsMobile()
  const [range, setRange] = React.useState("12m")

  const filteredData = React.useMemo(() => {
    const months = range === "6m" ? 6 : range === "3m" ? 3 : 12
    return chartData.slice(-months)
  }, [range])

  return (
    <Card className="rounded-xl border border-border/50 bg-card/95 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Typography.Title level={5} className="mb-0!">
            Sales Performance
          </Typography.Title>
          <Typography.Text type="secondary">Monthly sales trend</Typography.Text>
        </div>
        <Select
          value={range}
          onChange={setRange}
          style={{ width: 170 }}
          options={[
            { value: "3m", label: "Last 3 months" },
            { value: "6m", label: "Last 6 months" },
            { value: "12m", label: "Last 12 months" },
          ]}
        />
      </div>
      <div className="mt-4 h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={filteredData}
            margin={
              isMobile ? { top: 8, right: 8, bottom: 8, left: 8 } : { top: 8, right: 16, bottom: 8, left: 16 }
            }
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                new Date(value + "-01").toLocaleDateString("en-US", {
                  month: "short",
                  year: "2-digit",
                })
              }
            />
            <RechartsTooltip
              cursor={false}
              formatter={(value: unknown) => formatVnd(Number(value))}
              labelFormatter={(value: unknown) =>
                new Date(String(value) + "-01").toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })
              }
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#60a5fa"
              fill="#60a5fa"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
