"use client"

import * as React from "react"
import { ChatSidebar } from "@/components/chat/ChatSidebar"
import { ChatArea } from "@/components/chat/ChatArea"
import type { Conversation } from "@/types/chat"

const defaultConversation: Conversation = {
  id: "1",
  name: "Sarah Johnson",
  preview: "Sounds good, see you at the standup!",
  unread: 2,
  date: "2m ago",
  online: true,
  peerRoleId: "3",
}

export const Chat = () => {
  const [selected, setSelected] = React.useState<Conversation | null>(defaultConversation)

  return (
    <div className="flex h-full min-h-[400px] w-full min-w-0 overflow-hidden bg-background">
      <ChatSidebar
        selectedId={selected?.id ?? null}
        onSelect={setSelected}
        className="h-full w-[320px] shrink-0"
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <ChatArea conversation={selected} />
      </div>
    </div>
  )
}
