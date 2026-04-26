"use client"

import * as React from "react"
import { Calendar as BigCalendar, dateFnsLocalizer, type View } from "react-big-calendar"
import { format, parse, startOfWeek, getDay } from "date-fns"
import { enUS } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import { Button, Input, Select } from "antd"
import { cn } from "@/utils/utils"
import type { CalendarEvent, CalendarEventCategory } from "@/types/calendar"
import "react-big-calendar/lib/css/react-big-calendar.css"

const locales = { "en-US": enUS }
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
})

export interface CalendarMainProps {
  events: CalendarEvent[]
  currentDate: Date
  onDateChange: (date: Date) => void
  onSelectEvent: (event: CalendarEvent) => void
  onNavigate?: (date: Date) => void
  className?: string
}

const categoryColors: Record<CalendarEventCategory, string> = {
  personal: "#3b82f6",
  work: "#10b981",
  family: "#f59e0b",
}

export const CalendarMain = ({
  events,
  currentDate,
  onDateChange,
  onSelectEvent,
  onNavigate,
  className,
}: CalendarMainProps) => {
  const [view, setView] = React.useState<View>("month")
  const [search, setSearch] = React.useState("")

  const filteredEvents = React.useMemo(() => {
    if (!search.trim()) return events
    const s = search.toLowerCase()
    return events.filter(
      (e) => e.title.toLowerCase().includes(s) || (e.description?.toLowerCase().includes(s) ?? false),
    )
  }, [events, search])

  const rbcEvents = React.useMemo(
    () =>
      filteredEvents.map((e) => ({
        ...e,
        start: e.start instanceof Date ? e.start : new Date(e.start),
        end: e.end instanceof Date ? e.end : new Date(e.end),
      })),
    [filteredEvents],
  )

  const goPrev = () => {
    const d = new Date(currentDate)
    if (view === "month") d.setMonth(d.getMonth() - 1)
    else d.setDate(d.getDate() - 7)
    onDateChange(d)
    onNavigate?.(d)
  }

  const goNext = () => {
    const d = new Date(currentDate)
    if (view === "month") d.setMonth(d.getMonth() + 1)
    else d.setDate(d.getDate() + 7)
    onDateChange(d)
    onNavigate?.(d)
  }

  const goToday = () => {
    const d = new Date()
    onDateChange(d)
    onNavigate?.(d)
  }

  const eventStyleGetter = (event: CalendarEvent) => {
    const color = categoryColors[event.category] ?? "#6b7280"
    return {
      style: {
        backgroundColor: color,
        borderLeft: `4px solid ${color}`,
      },
    }
  }

  return (
    <div className={cn("flex min-w-0 flex-1 flex-col overflow-hidden", className)}>
      <div className="flex shrink-0 flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
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
        <h2 className="text-xl font-semibold">{format(currentDate, "MMMM yyyy", { locale: enUS })}</h2>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-48">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search events"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={view}
            onChange={(v) => setView(v as View)}
            style={{ width: 120 }}
            options={[
              { value: "month", label: "Month" },
              { value: "week", label: "Week" },
              { value: "day", label: "Day" },
              { value: "agenda", label: "Agenda" },
            ]}
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-4 pb-4">
        <BigCalendar
          localizer={localizer}
          events={rbcEvents}
          startAccessor="start"
          endAccessor="end"
          date={currentDate}
          onNavigate={(d: Date) => {
            onDateChange(d)
            onNavigate?.(d)
          }}
          onSelectEvent={(e: CalendarEvent) => onSelectEvent(e)}
          view={view}
          onView={setView}
          eventPropGetter={eventStyleGetter}
          style={{ height: "100%", minHeight: 400 }}
        />
      </div>
    </div>
  )
}
