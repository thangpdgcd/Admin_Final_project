"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts"

import { Card, Typography } from "antd"

const chartData = [
  { source: "Subscriptions", revenue: 18520, fill: "var(--chart-1)" },
  { source: "One-time Sales", revenue: 14230, fill: "var(--chart-2)" },
  { source: "Services", revenue: 10200, fill: "var(--chart-3)" },
  { source: "Partnerships", revenue: 5780, fill: "var(--chart-4)" },
]

const formatVnd = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n)

export function RevenueBreakdown() {
  const total = chartData.reduce((sum, item) => sum + item.revenue, 0)

  return (
    <Card className="rounded-xl border border-border/50 shadow-sm">
      <div className="space-y-1">
        <Typography.Title level={5} className="mb-0!">Revenue Breakdown</Typography.Title>
        <Typography.Text type="secondary">Revenue distribution by source</Typography.Text>
      </div>
      <div className="mt-4">
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          <div className="h-[220px] w-full max-w-[220px]">
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
                  nameKey="source"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 w-full space-y-3">
            {chartData.map((item) => {
              const pct = total ? ((item.revenue / total) * 100).toFixed(1) : "0"
              return (
                <div
                  key={item.source}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-sm shrink-0"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="text-sm font-medium">{item.source}</span>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <span className="text-sm font-medium tabular-nums">
                      {formatVnd(item.revenue)}
                    </span>
                    <span className="text-xs text-muted-foreground w-12">
                      {pct}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Card>
  )
}
