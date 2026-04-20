"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input, Segmented, Tag } from "antd"

export interface Email {
  id: string
  sender: string
  subject: string
  preview: string
  tags: string[]
  time: string
}

const mockEmails: Email[] = [
  {
    id: "1",
    sender: "Sarah Johnson",
    subject: "Project Update - Q4 Review",
    preview: "Hi team, please find the attached Q4 review document for your feedback...",
    tags: ["work", "important"],
    time: "9:42 AM",
  },
  {
    id: "2",
    sender: "Michael Chen",
    subject: "Lunch tomorrow?",
    preview: "Hey! Are we still on for lunch at the usual spot? Let me know...",
    tags: ["personal"],
    time: "Yesterday",
  },
  {
    id: "3",
    sender: "Design Team",
    subject: "Re: New brand guidelines",
    preview: "The updated brand guidelines have been approved. You can access them here...",
    tags: ["work", "meeting"],
    time: "Yesterday",
  },
  {
    id: "4",
    sender: "Notifications",
    subject: "Your weekly digest",
    preview: "Here's what you missed this week. 12 new updates across your projects...",
    tags: [],
    time: "Nov 15",
  },
  {
    id: "5",
    sender: "Emily Davis",
    subject: "Invoice #1042",
    preview: "Please find the attached invoice for the services rendered in October...",
    tags: ["work"],
    time: "Nov 14",
  },
]

export interface EmailListProps {
  selectedId?: string | null
  onSelect?: (email: Email) => void
}

export function EmailList({ selectedId, onSelect }: EmailListProps) {
  const [filter, setFilter] = React.useState<string>("all")
  const [search, setSearch] = React.useState("")

  const filteredEmails = React.useMemo(() => {
    let list = mockEmails
    if (filter === "unread") {
      list = list.filter((_, i) => i % 2 === 0)
    }
    if (search) {
      const s = search.toLowerCase()
      list = list.filter(
        (e) =>
          e.sender.toLowerCase().includes(s) ||
          e.subject.toLowerCase().includes(s) ||
          e.preview.toLowerCase().includes(s)
      )
    }
    return list
  }, [filter, search])

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden border-r border-border/50">
      <div className="shrink-0 flex flex-col gap-4 p-4">
        <h2 className="text-lg font-semibold">Inbox</h2>
        <div className="flex gap-2">
          <Segmented
            value={filter}
            onChange={(v) => setFilter(String(v))}
            options={[
              { value: "all", label: "All mail" },
              { value: "unread", label: "Unread" },
            ]}
          />
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        <div className="space-y-1 p-2">
          {filteredEmails.map((email) => (
            <button
              key={email.id}
              type="button"
              onClick={() => onSelect?.(email)}
              className={cn(
                "w-full rounded-lg border px-4 py-3 text-left transition-colors hover:bg-muted/50",
                selectedId === email.id
                  ? "border-border bg-muted/80"
                  : "border-transparent"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="truncate font-medium">{email.sender}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {email.time}
                </span>
              </div>
              <p className="mt-0.5 truncate text-sm font-medium">{email.subject}</p>
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                {email.preview}
              </p>
              {email.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {email.tags.map((tag) => (
                    <Tag key={tag} className="text-xs">
                      {tag}
                    </Tag>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
