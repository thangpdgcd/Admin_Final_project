"use client"

import * as React from "react"
import { MoreHorizontal } from "lucide-react"
import { Button, Dropdown, Table, Tag } from "antd"
import type { ColumnsType } from "antd/es/table"

export type TableStatus = "active" | "draft" | "pending" | "archived"

export interface TableRowData {
  id: string
  header: string
  sectionType: string
  status: TableStatus
  target: string
  limit: string
  reviewer: string
}

const mockData: TableRowData[] = [
  { id: "1", header: "Executive Summary", sectionType: "Overview", status: "active", target: "Q1 2025", limit: "5 pages", reviewer: "Jane Smith" },
  { id: "2", header: "Market Analysis", sectionType: "Research", status: "draft", target: "Q2 2025", limit: "10 pages", reviewer: "John Doe" },
  { id: "3", header: "Financial Projections", sectionType: "Finance", status: "pending", target: "Q1 2025", limit: "8 pages", reviewer: "Jane Smith" },
  { id: "4", header: "Risk Assessment", sectionType: "Compliance", status: "active", target: "Q3 2025", limit: "6 pages", reviewer: "Bob Wilson" },
  { id: "5", header: "Technical Requirements", sectionType: "Engineering", status: "archived", target: "Q4 2024", limit: "12 pages", reviewer: "John Doe" },
  { id: "6", header: "Marketing Strategy", sectionType: "Marketing", status: "draft", target: "Q2 2025", limit: "7 pages", reviewer: "Jane Smith" },
  { id: "7", header: "Operations Plan", sectionType: "Operations", status: "pending", target: "Q1 2025", limit: "9 pages", reviewer: "Bob Wilson" },
  { id: "8", header: "HR Policies", sectionType: "Legal", status: "active", target: "Q2 2025", limit: "4 pages", reviewer: "John Doe" },
]

export function DashboardDataTable() {
  const columns = React.useMemo<ColumnsType<TableRowData>>(
    () => [
      { title: "Header", dataIndex: "header", key: "header" },
      { title: "Section Type", dataIndex: "sectionType", key: "sectionType" },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (value: TableStatus) => {
          const color =
            value === "active"
              ? "green"
              : value === "draft"
                ? "gold"
                : value === "pending"
                  ? "blue"
                  : "default"
          return <Tag color={color}>{value}</Tag>
        },
      },
      { title: "Target", dataIndex: "target", key: "target" },
      { title: "Limit", dataIndex: "limit", key: "limit" },
      { title: "Reviewer", dataIndex: "reviewer", key: "reviewer" },
      {
        title: "",
        key: "actions",
        align: "right",
        render: () => (
          <Dropdown
            trigger={["click"]}
            placement="bottomRight"
            menu={{
              items: [
                { key: "view", label: "View" },
                { key: "edit", label: "Edit" },
                { key: "duplicate", label: "Duplicate" },
                { key: "delete", label: "Delete", danger: true },
              ],
            }}
          >
            <Button type="text" aria-label="Open menu">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </Dropdown>
        ),
      },
    ],
    []
  )

  return (
    <div className="min-w-0 space-y-4">
      <Table<TableRowData>
        rowKey="id"
        columns={columns}
        dataSource={mockData}
        pagination={{ pageSize: 10 }}
        rowSelection={{}}
      />
    </div>
  )
}
