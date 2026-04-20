"use client"

import * as React from "react"
import { MailSidebar } from "@/components/mail/MailSidebar"
import { EmailList } from "@/components/mail/EmailList"
import { EmailContent } from "@/components/mail/EmailContent"
import type { Email } from "@/components/mail/EmailList"

export function Mail() {
  const [selectedEmail, setSelectedEmail] = React.useState<Email | null>(null)

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 overflow-hidden bg-background">
      <MailSidebar className="h-full shrink-0" />
      <div className="grid min-h-0 min-w-0 flex-1 grid-cols-1 md:grid-cols-2 overflow-hidden">
        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden border-r border-border/50">
          <EmailList
            selectedId={selectedEmail?.id ?? null}
            onSelect={setSelectedEmail}
          />
        </div>
        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
          <EmailContent email={selectedEmail} />
        </div>
      </div>
    </div>
  )
}
