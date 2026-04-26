"use client"

import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import { Button, Input } from "antd"
import { cn } from "@/utils/utils"

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export interface CalendarEvent {
  id: string
  title: string
  date: Date
  color: string
  calendar?: "personal" | "work" | "family"
}

const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: "1",
    title: "Team Standup",
    date: new Date(2025, 2, 10),
    color: "bg-blue-500",
    calendar: "work",
  },
  {
    id: "2",
    title: "Design Review",
    date: new Date(2025, 2, 12),
    color: "bg-emerald-500",
    calendar: "work",
  },
  {
    id: "3",
    title: "Product Launch",
    date: new Date(2025, 2, 15),
    color: "bg-amber-500",
    calendar: "work",
  },
  {
    id: "4",
    title: "Client Presentation",
    date: new Date(2025, 2, 18),
    color: "bg-violet-500",
    calendar: "work",
  },
  {
    id: "5",
    title: "Birthday Party",
    date: new Date(2025, 2, 22),
    color: "bg-pink-500",
    calendar: "personal",
  },
  {
    id: "6",
    title: "Sprint Planning",
    date: new Date(2025, 2, 5),
    color: "bg-blue-500",
    calendar: "work",
  },
  {
    id: "7",
    title: "Family Dinner",
    date: new Date(2025, 2, 8),
    color: "bg-amber-500",
    calendar: "family",
  },
]

export interface CalendarGridProps {
  currentDate: Date
  onDateChange?: (date: Date) => void
  className?: string
}

export const CalendarGrid = ({ currentDate, onDateChange, className }: CalendarGridProps) => {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPadding = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  const cells: (number | null)[] = []
  for (let i = 0; i < startPadding; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const rows = Math.ceil(cells.length / 7)
  const paddedCells = [...cells]
  while (paddedCells.length < rows * 7) paddedCells.push(null)

  const eventsForDate = (d: number) =>
    MOCK_EVENTS.filter(
      (e) => e.date.getFullYear() === year && e.date.getMonth() === month && e.date.getDate() === d,
    )

  const goPrev = () => onDateChange?.(new Date(year, month - 1, 1))
  const goNext = () => onDateChange?.(new Date(year, month + 1, 1))
  const goToday = () => onDateChange?.(new Date())

  return (
    <div className={cn("flex flex-1 flex-col", className)}>
      <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Button onClick={goPrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button onClick={goNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button size="small" onClick={goToday}>
            Today
          </Button>
        </div>
        <h2 className="text-xl font-semibold">
          {new Date(year, month).toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-48">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search events" className="pl-9" />
          </div>
          <Button size="small">Month view</Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 pt-0">
        <div className="grid min-w-[600px] grid-cols-7 border border-border/50 rounded-lg">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="border-b border-border/50 bg-muted/30 px-2 py-2 text-center text-sm font-medium text-muted-foreground"
            >
              {d}
            </div>
          ))}
          {paddedCells.map((d, i) => {
            const isToday = d && new Date(year, month, d).getTime() === today.getTime()
            const dayEvents = d ? eventsForDate(d) : []
            return (
              <div
                key={i}
                className={cn(
                  "min-h-[100px] border-b border-r border-border/50 p-2",
                  i % 7 === 6 && "border-r-0",
                )}
              >
                <button
                  type="button"
                  className={cn(
                    "mb-1 flex h-7 w-7 items-center justify-center rounded-md text-sm",
                    d ? "cursor-pointer hover:bg-muted" : "cursor-default text-transparent",
                    isToday && "bg-primary text-primary-foreground",
                  )}
                  onClick={() => d && onDateChange?.(new Date(year, month, d))}
                >
                  {d ?? ""}
                </button>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((e) => (
                    <div
                      key={e.id}
                      className={cn("truncate rounded px-2 py-0.5 text-xs font-medium text-white", e.color)}
                    >
                      {e.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <p className="text-xs text-muted-foreground">+{dayEvents.length - 3} more</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
