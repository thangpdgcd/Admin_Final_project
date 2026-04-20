"use client"

import * as React from "react"
import {
  Reply,
  Forward,
  MoreHorizontal,
  Send,
  VolumeX,
} from "lucide-react"
import { Button, Dropdown, Input } from "antd"
import type { Email } from "./EmailList"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export interface EmailContentProps {
  email: Email | null
}

export function EmailContent({ email }: EmailContentProps) {
  const [reply, setReply] = React.useState("")
  const [mute, setMute] = React.useState(false)

  if (!email) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Select an email to read
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="border-b border-border/50 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted font-semibold">
              {getInitials(email.sender)}
            </span>
            <div className="min-w-0">
              <p className="font-semibold">{email.sender}</p>
              <p className="text-sm text-muted-foreground truncate">
                Reply to {email.sender.toLowerCase().replace(" ", ".")}@example.com
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button type="text">
              <Reply className="h-4 w-4" />
            </Button>
            <Button type="text">
              <Forward className="h-4 w-4" />
            </Button>
            <Dropdown
              trigger={["click"]}
              placement="bottomRight"
              menu={{
                items: [
                  { key: "archive", label: "Archive" },
                  { key: "spam", label: "Report spam" },
                  { key: "delete", label: "Delete" },
                ],
              }}
            >
              <Button type="text" aria-label="More actions">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </Dropdown>
          </div>
        </div>
        <h3 className="mt-4 text-lg font-semibold">{email.subject}</h3>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {email.preview}
        </p>
        <p className="mt-4 text-sm leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
          veniam, quis nostrud exercitation ullamco laboris.
        </p>
        <p className="mt-4 text-sm leading-relaxed">
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
          dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
          proident.
        </p>
      </div>

      <div className="border-t border-border/50 p-4">
        <Input.TextArea
          placeholder="Reply..."
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          autoSize={{ minRows: 3, maxRows: 6 }}
        />
        <div className="mt-3 flex items-center justify-between gap-2">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={mute}
              onChange={(e) => setMute(e.target.checked)}
              className="rounded border-input"
            />
            <VolumeX className="h-4 w-4" />
            Mute thread
          </label>
          <Button type="primary">
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}
