export type CalendarEventCategory = "personal" | "work" | "family";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  category: CalendarEventCategory;
  createdBy?: string;
}

export interface CalendarEventFormValues {
  title: string;
  description: string;
  start: Date;
  end: Date;
  category: CalendarEventCategory;
}
