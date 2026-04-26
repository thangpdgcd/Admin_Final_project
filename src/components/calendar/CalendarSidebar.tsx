"use client"

import { Plus } from "lucide-react"
import { Button, Checkbox } from "antd"
import type { CalendarEventCategory } from "@/types/calendar"

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

export interface CategoryFilter {
  personal: boolean
  work: boolean
  family: boolean
}

export interface CalendarSidebarProps {
  currentDate: Date
  onDateChange?: (date: Date) => void
  onAddEvent?: () => void
  categoryFilter: CategoryFilter
  onCategoryFilterChange: (filter: CategoryFilter) => void
  className?: string
}

export const CalendarSidebar = ({
  currentDate,
  onDateChange,
  onAddEvent,
  categoryFilter,
  onCategoryFilterChange,
  className,
}: CalendarSidebarProps) => {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPadding = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  const days: (number | null)[] = []
  for (let i = 0; i < startPadding; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)

  const setCategory = (key: CalendarEventCategory, checked: boolean) => {
    onCategoryFilterChange({ ...categoryFilter, [key]: checked })
  }

  return (
    <div
      className={[
        "flex h-full min-h-0 w-[220px] shrink-0 flex-col overflow-y-auto overflow-x-hidden border-r border-border/50 bg-muted/30",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col gap-3 p-3">
        <Button type="primary" className="w-full" size="small" onClick={onAddEvent}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Event
        </Button>

        <div className="rounded-lg border border-border/50 p-2.5">
          <p className="mb-2 text-center text-xs font-medium text-muted-foreground">
            {new Date(year, month).toLocaleString("default", {
              month: "short",
              year: "numeric",
            })}
          </p>
          <div className="grid grid-cols-7 gap-0.5 text-center text-xs">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-0.5 font-medium text-muted-foreground">
                {d}
              </div>
            ))}
            {days.map((d, i) => (
              <button
                key={i}
                type="button"
                onClick={() => d && onDateChange?.(new Date(year, month, d))}
                className={[
                  "flex h-6 w-6 items-center justify-center rounded-md text-xs",
                  d ? "hover:bg-muted" : "cursor-default text-transparent",
                  d && new Date(year, month, d).getTime() === today.getTime()
                    ? "bg-primary text-primary-foreground"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {d ?? ""}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Event categories</p>
          <div className="flex flex-col gap-1.5">
            {[
              { key: "personal" as const, label: "Personal", color: "bg-blue-500" },
              { key: "work" as const, label: "Work", color: "bg-emerald-500" },
              { key: "family" as const, label: "Family", color: "bg-amber-500" },
            ].map(({ key, label, color }) => (
              <label key={key} className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={categoryFilter[key]}
                  onChange={(e) => setCategory(key, e.target.checked)}
                />
                <span className={["h-3 w-3 rounded-sm", color].join(" ")} />
                {label}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
