"use client"

import * as React from "react"
import {
  Search,
  Phone,
  Video,
  Info,
  Paperclip,
  Smile,
  Mic,
  Send,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, Button, Input } from "antd"
import type { Conversation } from "@/types/chat"
import { useChat } from "@/hooks/useChat"
import { StaffRoleBadge } from "@/components/chat/StaffRoleBadge"
import { isStaffRoleId } from "@/components/chat/staffRole"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function getStatusLabel(conv: Conversation): string {
  if (conv.status === "away") return "Away"
  return conv.online ? "Online" : "Offline"
}

function getStatusClass(conv: Conversation): string {
  if (conv.status === "away") return "bg-amber-500"
  return conv.online ? "bg-emerald-500" : "bg-muted-foreground"
}

export interface ChatAreaProps {
  conversation: Conversation | null
}

export function ChatArea({ conversation }: ChatAreaProps) {
  const [input, setInput] = React.useState("")
  const { messages, sendMessage, loading } = useChat(conversation?.id ?? null)

  const handleSend = () => {
    const text = input.trim()
    if (text) {
      sendMessage(text)
      setInput("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!conversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
        <p>Select a conversation to start messaging</p>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/50 px-3 py-2.5">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar size={40}>{getInitials(conversation.name)}</Avatar>
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <p className="font-semibold truncate">{conversation.name}</p>
              {isStaffRoleId(conversation.peerRoleId) && <StaffRoleBadge />}
            </div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className={cn("h-2 w-2 rounded-full shrink-0", getStatusClass(conversation))}
              />
              {getStatusLabel(conversation)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button type="text">
            <Search className="h-4 w-4" />
          </Button>
          <Button type="text">
            <Phone className="h-4 w-4" />
          </Button>
          <Button type="text">
            <Video className="h-4 w-4" />
          </Button>
          <Button type="text">
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 pt-3 pb-4"
        style={{ minHeight: 0 }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="flex w-full flex-col gap-4 pb-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex",
                  msg.isOutgoing ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[92%] min-w-0 rounded-2xl px-4 py-2 overflow-hidden break-words",
                    msg.isOutgoing
                      ? "rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md bg-muted text-foreground"
                  )}
                >
                  {isStaffRoleId(msg.senderRoleId) && (
                    <div className={cn("mb-1.5 flex", msg.isOutgoing ? "justify-end" : "justify-start")}>
                      <StaffRoleBadge
                        className={
                          msg.isOutgoing
                            ? "border-primary-foreground/40 bg-primary-foreground/15 text-primary-foreground"
                            : undefined
                        }
                      />
                    </div>
                  )}
                  <p className="text-sm break-words">{msg.text}</p>
                  <p className="mt-1 text-xs opacity-80 shrink-0">
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 border-t border-border/50 px-3 py-3">
        <Button type="text">
          <Paperclip className="h-4 w-4" />
        </Button>
        <Input
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-w-0 flex-1"
        />
        <Button type="text">
          <Smile className="h-4 w-4" />
        </Button>
        <Button type="text">
          <Mic className="h-4 w-4" />
        </Button>
        <Button type="primary" onClick={handleSend}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
