"use client"

import * as React from "react"
import { CalendarSidebar, type CategoryFilter } from "@/components/calendar/CalendarSidebar"
import { CalendarMain } from "@/components/calendar/CalendarMain"
import { EventModal } from "@/components/calendar/EventModal"
import type { CalendarEvent } from "@/types/calendar"
import type { EventFormValues } from "@/components/calendar/EventModal"

const defaultCategoryFilter: CategoryFilter = {
  personal: true,
  work: true,
  family: true,
}

export function Calendar() {
  const [currentDate, setCurrentDate] = React.useState(() => new Date())
  const [events, setEvents] = React.useState<CalendarEvent[]>([])
  const [categoryFilter, setCategoryFilter] =
    React.useState<CategoryFilter>(defaultCategoryFilter)
  const [modalOpen, setModalOpen] = React.useState(false)
  const [selectedEvent, setSelectedEvent] = React.useState<CalendarEvent | null>(null)
  const [defaultStart, setDefaultStart] = React.useState<Date | undefined>(undefined)

  const filteredEvents = React.useMemo(() => {
    return events.filter((e) => categoryFilter[e.category])
  }, [events, categoryFilter])

  const handleSave = (values: EventFormValues, existingId?: string) => {
    if (existingId) {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === existingId
            ? {
                ...e,
                title: values.title,
                description: values.description || undefined,
                start: values.start,
                end: values.end,
                category: values.category,
              }
            : e
        )
      )
    } else {
      const newEvent: CalendarEvent = {
        id: `evt-${Date.now()}`,
        title: values.title,
        description: values.description || undefined,
        start: values.start,
        end: values.end,
        category: values.category,
      }
      setEvents((prev) => [...prev, newEvent])
    }
  }

  const handleDelete = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  const openCreateModal = (start?: Date) => {
    setSelectedEvent(null)
    setDefaultStart(start ?? currentDate)
    setModalOpen(true)
  }

  const openEditModal = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setDefaultStart(undefined)
    setModalOpen(true)
  }

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 overflow-hidden bg-background">
      <CalendarSidebar
        className="h-full shrink-0"
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onAddEvent={() => openCreateModal()}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
      />
      <CalendarMain
        className="min-h-0 min-w-0 flex-1"
        events={filteredEvents}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onSelectEvent={openEditModal}
      />
      <EventModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        event={selectedEvent}
        defaultStart={defaultStart}
        onSave={handleSave}
        onDelete={selectedEvent ? handleDelete : undefined}
      />
    </div>
  )
}
