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
import { Card, Segmented, Typography } from "antd"
import { cn } from "@/utils/utils"

type RangeFilter = "3m" | "30d" | "7d"

const allChartData = [
  { date: "Oct 1", visitors: 420 },
  { date: "Oct 2", visitors: 380 },
  { date: "Oct 3", visitors: 510 },
  { date: "Oct 4", visitors: 445 },
  { date: "Oct 5", visitors: 390 },
  { date: "Oct 6", visitors: 520 },
  { date: "Oct 7", visitors: 480 },
  { date: "Oct 8", visitors: 550 },
  { date: "Oct 9", visitors: 490 },
  { date: "Oct 10", visitors: 610 },
  { date: "Oct 11", visitors: 540 },
  { date: "Oct 12", visitors: 580 },
  { date: "Oct 13", visitors: 520 },
  { date: "Oct 14", visitors: 670 },
  { date: "Oct 15", visitors: 620 },
  { date: "Oct 16", visitors: 590 },
  { date: "Oct 17", visitors: 710 },
  { date: "Oct 18", visitors: 650 },
  { date: "Oct 19", visitors: 680 },
  { date: "Oct 20", visitors: 720 },
  { date: "Oct 21", visitors: 690 },
  { date: "Oct 22", visitors: 750 },
  { date: "Oct 23", visitors: 710 },
  { date: "Oct 24", visitors: 780 },
  { date: "Oct 25", visitors: 740 },
  { date: "Oct 26", visitors: 820 },
  { date: "Oct 27", visitors: 770 },
  { date: "Oct 28", visitors: 800 },
  { date: "Oct 29", visitors: 850 },
  { date: "Oct 30", visitors: 810 },
  { date: "Oct 31", visitors: 880 },
  { date: "Nov 1", visitors: 920 },
  { date: "Nov 2", visitors: 870 },
  { date: "Nov 3", visitors: 950 },
  { date: "Nov 4", visitors: 890 },
  { date: "Nov 5", visitors: 910 },
  { date: "Nov 6", visitors: 980 },
  { date: "Nov 7", visitors: 940 },
  { date: "Nov 8", visitors: 1020 },
  { date: "Nov 9", visitors: 970 },
  { date: "Nov 10", visitors: 1050 },
  { date: "Nov 11", visitors: 990 },
  { date: "Nov 12", visitors: 1080 },
  { date: "Nov 13", visitors: 1030 },
  { date: "Nov 14", visitors: 1120 },
  { date: "Nov 15", visitors: 1060 },
  { date: "Nov 16", visitors: 1100 },
  { date: "Nov 17", visitors: 1150 },
  { date: "Nov 18", visitors: 1090 },
  { date: "Nov 19", visitors: 1180 },
  { date: "Nov 20", visitors: 1140 },
  { date: "Nov 21", visitors: 1200 },
  { date: "Nov 22", visitors: 1160 },
  { date: "Nov 23", visitors: 1220 },
  { date: "Nov 24", visitors: 1190 },
  { date: "Nov 25", visitors: 1250 },
  { date: "Nov 26", visitors: 1210 },
  { date: "Nov 27", visitors: 1280 },
  { date: "Nov 28", visitors: 1240 },
  { date: "Nov 29", visitors: 1300 },
  { date: "Nov 30", visitors: 1270 },
  { date: "Dec 1", visitors: 1320 },
  { date: "Dec 2", visitors: 1290 },
  { date: "Dec 3", visitors: 1350 },
  { date: "Dec 4", visitors: 1310 },
  { date: "Dec 5", visitors: 1380 },
  { date: "Dec 6", visitors: 1340 },
  { date: "Dec 7", visitors: 1400 },
]

export const VisitorsChart = () => {
  const isMobile = useIsMobile()
  const [range, setRange] = React.useState<RangeFilter>("3m")

  const filteredData = React.useMemo(() => {
    if (range === "7d") return allChartData.slice(-7)
    if (range === "30d") return allChartData.slice(-30)
    return allChartData // Last 3 months
  }, [range])

  const subtitle =
    range === "7d"
      ? "Total for the last 7 days"
      : range === "30d"
        ? "Total for the last 30 days"
        : "Total for the last 3 months"

  return (
    <Card
      className={cn(
        "rounded-xl border border-border/60 bg-card/95 shadow-sm backdrop-blur-sm",
        "dark:bg-card/90",
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between space-y-0">
        <div>
          <Typography.Title level={5} className="mb-0!">
            Total Visitors
          </Typography.Title>
          <Typography.Text type="secondary" className="mt-0.5 block">
            {subtitle}
          </Typography.Text>
        </div>
        <Segmented
          value={range}
          onChange={(v) => setRange(v as RangeFilter)}
          options={[
            { value: "3m", label: "Last 3 months" },
            { value: "30d", label: "Last 30 days" },
            { value: "7d", label: "Last 7 days" },
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
            <defs>
              <linearGradient id="fillVisitors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/60" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value}
              tick={{ fontSize: 12 }}
            />
            <RechartsTooltip
              cursor={false}
              formatter={(value: unknown) => `${Number(value).toLocaleString()} visitors`}
            />
            <Area
              type="monotone"
              dataKey="visitors"
              stroke="#60a5fa"
              fill="url(#fillVisitors)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
