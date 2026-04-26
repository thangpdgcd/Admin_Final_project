"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts"

import { Card, Typography } from "antd"

const chartData = [
  { category: "Coffee", revenue: 4520, fill: "var(--chart-1)" },
  { category: "Pastries", revenue: 2380, fill: "var(--chart-2)" },
  { category: "Merchandise", revenue: 1890, fill: "var(--chart-3)" },
  { category: "Beverages", revenue: 1420, fill: "var(--chart-4)" },
  { category: "Other", revenue: 790, fill: "var(--chart-5)" },
]

const formatVnd = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n)

export const RevenueDonut = () => {
  const total = chartData.reduce((sum, item) => sum + item.revenue, 0)

  return (
    <Card className="rounded-xl border border-border/50 bg-card/95 shadow-sm backdrop-blur-sm">
      <div className="space-y-1">
        <Typography.Title level={5} className="mb-0!">
          Revenue Breakdown
        </Typography.Title>
        <Typography.Text type="secondary">Revenue distribution by category</Typography.Text>
      </div>
      <div className="mx-auto mt-4 h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <RechartsTooltip
              formatter={(value: unknown) => {
                const v = Number(value)
                const pct = total ? ((v / total) * 100).toFixed(1) : "0"
                return `${formatVnd(v)} (${pct}%)`
              }}
            />
            <Pie
              data={chartData}
              dataKey="revenue"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
