"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import { Card, Tabs, Typography } from "antd"
import { MetricCard } from "@/components/dashboard/cards/MetricCard"

const growthData = [
  { month: "Jan", new: 120, returning: 85 },
  { month: "Feb", new: 145, returning: 92 },
  { month: "Mar", new: 130, returning: 110 },
  { month: "Apr", new: 165, returning: 98 },
  { month: "May", new: 152, returning: 125 },
  { month: "Jun", new: 178, returning: 142 },
]

export const CustomerInsights = () => {
  const isMobile = useIsMobile()

  return (
    <Card className="rounded-xl border border-border/50 shadow-sm">
      <div className="space-y-1">
        <Typography.Title level={5} className="mb-0!">
          Customer Insights
        </Typography.Title>
        <Typography.Text type="secondary">Understand your customer base and growth trends</Typography.Text>
      </div>
      <div className="mt-4">
        <Tabs
          defaultActiveKey="growth"
          items={[
            {
              key: "growth",
              label: "Growth",
              children: (
                <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={growthData}
                        margin={
                          isMobile
                            ? { top: 8, right: 8, bottom: 8, left: 8 }
                            : { top: 8, right: 16, bottom: 8, left: 16 }
                        }
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} />
                        <RechartsTooltip cursor={false} />
                        <Legend />
                        <Bar dataKey="new" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="returning" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Customer Growth Trends</h4>
                    <MetricCard
                      title="Total Customers"
                      value="1,234"
                      change="+12%"
                      positive={true}
                      description="Active this month"
                    />
                    <MetricCard
                      title="Retention Rate"
                      value="78%"
                      change="+3%"
                      positive={true}
                      description="Returning customers"
                    />
                    <MetricCard
                      title="Avg LTV"
                      value="$892"
                      change="+5%"
                      positive={true}
                      description="Lifetime value"
                    />
                  </div>
                </div>
              ),
            },
            {
              key: "demographics",
              label: "Demographics",
              children: (
                <div className="mt-6 flex h-[200px] items-center justify-center rounded-lg border border-dashed border-border/50 bg-muted/30 text-muted-foreground">
                  Demographics content coming soon
                </div>
              ),
            },
            {
              key: "regions",
              label: "Regions",
              children: (
                <div className="mt-6 flex h-[200px] items-center justify-center rounded-lg border border-dashed border-border/50 bg-muted/30 text-muted-foreground">
                  Regions content coming soon
                </div>
              ),
            },
          ]}
        />
      </div>
    </Card>
  )
}
