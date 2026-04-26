"use client"

import { Link } from "react-router-dom"
import { Button, Card, Typography } from "antd"
import { TransactionList } from "@/components/dashboard/tables/TransactionList"
import type { Transaction } from "@/components/dashboard/tables/TransactionList"

const mockTransactions: Transaction[] = [
  {
    id: "1",
    userName: "Sarah Johnson",
    email: "sarah@example.com",
    status: "completed",
    amount: "$249.00",
    time: "2 min ago",
  },
  {
    id: "2",
    userName: "Michael Chen",
    email: "michael@example.com",
    status: "pending",
    amount: "$89.50",
    time: "15 min ago",
  },
  {
    id: "3",
    userName: "Emily Davis",
    email: "emily@example.com",
    status: "completed",
    amount: "$156.00",
    time: "1 hr ago",
  },
  {
    id: "4",
    userName: "James Wilson",
    email: "james@example.com",
    status: "failed",
    amount: "$42.99",
    time: "2 hrs ago",
  },
  {
    id: "5",
    userName: "Olivia Brown",
    email: "olivia@example.com",
    status: "completed",
    amount: "$312.00",
    time: "3 hrs ago",
  },
]

export const RecentTransactions = () => {
  return (
    <Card className="rounded-xl border border-border/50 shadow-sm">
      <div className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <Typography.Title level={5} className="mb-0!">
            Recent Transactions
          </Typography.Title>
          <Typography.Text type="secondary">Latest activity from your customers</Typography.Text>
        </div>
        <Link to="/system/orders">
          <Button type="text" size="small">
            View All
          </Button>
        </Link>
      </div>
      <div className="mt-4">
        <TransactionList transactions={mockTransactions} />
      </div>
    </Card>
  )
}
