"use client"

import type { LucideIcon } from "lucide-react"
import { TrendingDown, TrendingUp } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, Tag, Typography } from "antd"

export interface MetricCardProps {
  title: string
  value: string
  change: string
  positive: boolean
  description?: string
  footer?: string
  icon?: LucideIcon
  iconClassName?: string
}

export function MetricCard({
  title,
  value,
  change,
  positive,
  description,
  footer,
  icon: Icon,
  iconClassName,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        "group rounded-xl border border-border/60 bg-card/95 shadow-sm backdrop-blur-sm",
        "transition-all duration-200 hover:shadow-md hover:border-border/80",
        "dark:bg-card/90 dark:hover:bg-card"
      )}
    >
      <div className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                "bg-primary/10 text-primary",
                iconClassName
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
          )}
          <Typography.Text className="text-sm font-medium text-muted-foreground">
            {title}
          </Typography.Text>
        </div>
        <Tag color={positive ? "green" : "red"} className="flex items-center gap-1">
          {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {change}
        </Tag>
      </div>
      <div className="pt-1">
        <div className="text-2xl font-bold tracking-tight md:text-3xl">
          {value}
        </div>
        {description && (
          <Typography.Text type="secondary" className="mt-1.5 block">
            {description}
          </Typography.Text>
        )}
      </div>
      {footer && (
        <div className="pt-0 text-xs text-muted-foreground">{footer}</div>
      )}
    </Card>
  )
}
