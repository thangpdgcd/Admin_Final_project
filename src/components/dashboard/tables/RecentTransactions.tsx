"use client"

import {
  Card,
  Typography,
} from "antd"
import { TransactionList, type Transaction } from "./TransactionList"

const mockTransactions: Transaction[] = [
  {
    id: "1",
    userName: "Alice Johnson",
    email: "alice@example.com",
    status: "completed",
    amount: "$42.50",
    time: "2 min ago",
  },
  {
    id: "2",
    userName: "Bob Smith",
    email: "bob@example.com",
    status: "pending",
    amount: "$18.00",
    time: "5 min ago",
  },
  {
    id: "3",
    userName: "Carol Williams",
    email: "carol@example.com",
    status: "failed",
    amount: "$95.00",
    time: "12 min ago",
  },
  {
    id: "4",
    userName: "David Brown",
    email: "david@example.com",
    status: "completed",
    amount: "$28.75",
    time: "18 min ago",
  },
  {
    id: "5",
    userName: "Eve Davis",
    email: "eve@example.com",
    status: "completed",
    amount: "$156.00",
    time: "25 min ago",
  },
]

export function RecentTransactions() {
  return (
    <Card className="rounded-xl border border-border/50 bg-card/95 shadow-sm backdrop-blur-sm">
      <div className="space-y-1">
        <Typography.Title level={5} className="mb-0!">Recent Transactions</Typography.Title>
        <Typography.Text type="secondary">Latest customer transactions</Typography.Text>
      </div>
      <div className="mt-4">
        <TransactionList transactions={mockTransactions} />
      </div>
    </Card>
  )
}
