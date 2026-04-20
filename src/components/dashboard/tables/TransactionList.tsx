"use client"

import { cn } from "@/lib/utils"
import { Avatar, Tag } from "antd"

export type TransactionStatus = "completed" | "pending" | "failed"

export interface Transaction {
  id: string
  userName: string
  email: string
  status: TransactionStatus
  amount: string
  time: string
}

const statusColor: Record<TransactionStatus, string> = {
  completed: "green",
  pending: "gold",
  failed: "red",
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export interface TransactionListProps {
  transactions: Transaction[]
  className?: string
}

export function TransactionList({ transactions, className }: TransactionListProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className="flex items-center justify-between gap-4 rounded-lg border border-border/50 px-4 py-3 transition-colors hover:bg-muted/50"
        >
          <div className="flex items-center gap-4 min-w-0">
            <Avatar size={36} className="shrink-0">{getInitials(tx.userName)}</Avatar>
            <div className="min-w-0">
              <p className="font-medium truncate">{tx.userName}</p>
              <p className="text-xs text-muted-foreground truncate">{tx.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <Tag color={statusColor[tx.status]} className="capitalize">{tx.status}</Tag>
            <span className="font-medium tabular-nums">{tx.amount}</span>
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {tx.time}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
