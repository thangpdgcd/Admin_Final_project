"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { Avatar, Badge, Input } from "antd"
import { cn } from "@/lib/utils"
import type { Conversation } from "@/types/chat"
import { StaffRoleBadge } from "@/components/chat/StaffRoleBadge"
import { isStaffRoleId } from "@/components/chat/staffRole"

const mockConversations: Conversation[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    preview: "Sounds good, see you at the standup!",
    unread: 2,
    date: "2m ago",
    online: true,
    peerRoleId: "3",
  },
  {
    id: "2",
    name: "Michael Chen",
    preview: "Thanks for the update on the project",
    unread: 0,
    date: "1h ago",
    online: true,
  },
  {
    id: "3",
    name: "Design Team",
    preview: "The new mockups are ready for review",
    unread: 5,
    date: "3h ago",
    online: false,
    status: "away",
  },
  {
    id: "4",
    name: "Emily Davis",
    preview: "Can we schedule a call tomorrow?",
    unread: 0,
    date: "Yesterday",
    online: false,
  },
  {
    id: "5",
    name: "James Wilson",
    preview: "Invoice attached for your review",
    unread: 0,
    date: "Nov 15",
    online: false,
  },
]

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export interface ChatSidebarProps {
  selectedId?: string | null
  onSelect?: (conv: Conversation) => void
  className?: string
}

export function ChatSidebar({
  selectedId,
  onSelect,
  className,
}: ChatSidebarProps) {
  const [search, setSearch] = React.useState("")

  const filtered = React.useMemo(() => {
    if (!search) return mockConversations
    const s = search.toLowerCase()
    return mockConversations.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.preview.toLowerCase().includes(s)
    )
  }, [search])

  return (
    <div
      className={cn(
        "flex h-full w-[320px] min-w-[280px] max-w-[400px] shrink-0 flex-col border-r border-border/50 bg-muted/30",
        className
      )}
    >
      <div className="flex flex-col gap-3 p-3">
        <h2 className="text-lg font-bold">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <div className="space-y-1 p-2">
          {filtered.map((conv) => (
            <button
              key={conv.id}
              type="button"
              onClick={() => onSelect?.(conv)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted/50",
                selectedId === conv.id && "bg-muted"
              )}
            >
              <Avatar size={36} className="shrink-0">{getInitials(conv.name)}</Avatar>
              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span className="truncate font-medium" title={conv.name}>{conv.name}</span>
                    {isStaffRoleId(conv.peerRoleId) && <StaffRoleBadge />}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {conv.date}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {conv.online ? (
                    <span className="text-emerald-500">Online</span>
                  ) : (
                    <span>Offline</span>
                  )}
                </p>
                <p className="mt-0.5 line-clamp-2 break-words text-sm text-muted-foreground" title={conv.preview}>
                  {conv.preview}
                </p>
              </div>
              {conv.unread > 0 && (
                <Badge count={conv.unread} size="small" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
