"use client"

import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button, Input, Modal, Select, Typography } from "antd"
import type { CalendarEvent, CalendarEventCategory } from "@/types/calendar"

const toDatetimeLocal = (d: Date): string => {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const fromDatetimeLocal = (s: string): Date => new Date(s)

const eventSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string(),
    start: z.date(),
    end: z.date(),
    category: z.enum(["personal", "work", "family"]),
  })
  .refine((data) => data.end > data.start, {
    message: "End must be after start",
    path: ["end"],
  })

export type EventFormValues = z.infer<typeof eventSchema>

export interface EventModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: CalendarEvent | null
  defaultStart?: Date
  onSave: (values: EventFormValues, existingId?: string) => void
  onDelete?: (id: string) => void
}

const EMPTY_EVENT_VALUES: EventFormValues = {
  title: "",
  description: "",
  start: new Date(0),
  end: new Date(0),
  category: "work",
}

export const EventModal = ({
  open,
  onOpenChange,
  event,
  defaultStart,
  onSave,
  onDelete,
}: EventModalProps) => {
  const isEdit = !!event
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: EMPTY_EVENT_VALUES,
  })

  React.useEffect(() => {
    if (open) {
      if (event) {
        form.reset({
          title: event.title,
          description: event.description ?? "",
          start: event.start,
          end: event.end,
          category: event.category,
        })
      } else {
        const start = defaultStart ? new Date(defaultStart) : new Date()
        start.setMinutes(0, 0, 0)
        const end = new Date(start.getTime() + 60 * 60 * 1000)
        form.reset({
          title: "",
          description: "",
          start,
          end,
          category: "work",
        })
      }
    }
  }, [open, event, defaultStart, form])

  const onSubmit = (values: EventFormValues) => {
    onSave(values, isEdit && event ? event.id : undefined)
    onOpenChange(false)
  }

  const handleDelete = () => {
    if (isEdit && event && onDelete) {
      onDelete(event.id)
      onOpenChange(false)
    }
  }

  const categoryOptions: { value: CalendarEventCategory; label: string }[] = [
    { value: "personal", label: "Personal" },
    { value: "work", label: "Work" },
    { value: "family", label: "Family" },
  ]

  return (
    <Modal
      open={open}
      onCancel={() => onOpenChange(false)}
      title={isEdit ? "Edit event" : "New event"}
      footer={null}
      destroyOnHidden
    >
      <Typography.Paragraph type="secondary" className="mt-0">
        {isEdit ? "Update event details." : "Add a new event to your calendar."}
      </Typography.Paragraph>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <Typography.Text strong>Title</Typography.Text>
          <Input placeholder="Event title" {...form.register("title")} />
          {form.formState.errors.title?.message && (
            <Typography.Text type="danger" className="text-xs">
              {form.formState.errors.title.message}
            </Typography.Text>
          )}
        </div>

        <div className="space-y-1">
          <Typography.Text strong>Description (optional)</Typography.Text>
          <Input placeholder="Description" {...form.register("description")} />
        </div>

        <div className="space-y-1">
          <Typography.Text strong>Start</Typography.Text>
          <Controller
            control={form.control}
            name="start"
            render={({ field }) => (
              <Input
                type="datetime-local"
                value={toDatetimeLocal(field.value)}
                onChange={(e) => field.onChange(fromDatetimeLocal(e.target.value))}
              />
            )}
          />
          {form.formState.errors.start?.message && (
            <Typography.Text type="danger" className="text-xs">
              {form.formState.errors.start.message}
            </Typography.Text>
          )}
        </div>

        <div className="space-y-1">
          <Typography.Text strong>End</Typography.Text>
          <Controller
            control={form.control}
            name="end"
            render={({ field }) => (
              <Input
                type="datetime-local"
                value={toDatetimeLocal(field.value)}
                onChange={(e) => field.onChange(fromDatetimeLocal(e.target.value))}
              />
            )}
          />
          {form.formState.errors.end?.message && (
            <Typography.Text type="danger" className="text-xs">
              {form.formState.errors.end.message}
            </Typography.Text>
          )}
        </div>

        <div className="space-y-1">
          <Typography.Text strong>Category</Typography.Text>
          <Controller
            control={form.control}
            name="category"
            render={({ field }) => (
              <Select value={field.value} onChange={field.onChange} options={categoryOptions} />
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          {isEdit && onDelete && (
            <Button danger className="mr-auto" onClick={handleDelete}>
              Delete
            </Button>
          )}
          <Button onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            {isEdit ? "Save" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
