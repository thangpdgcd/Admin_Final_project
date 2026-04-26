"use client"

import { ChevronDown } from "lucide-react"
import { Button, Dropdown } from "antd"

export const Dashboard2Header = () => {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Business Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor your business performance and key metrics in real-time
        </p>
      </div>
      <div className="flex gap-2 pt-2 sm:pt-0">
        <Button type="primary" size="small">
          New Sale
        </Button>
        <Dropdown
          trigger={["click"]}
          placement="bottomRight"
          menu={{
            items: [
              { key: "export", label: "Export Data" },
              { key: "print", label: "Print Report" },
              { key: "share", label: "Share" },
            ],
          }}
        >
          <Button size="small">
            Actions
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </Dropdown>
      </div>
    </div>
  )
}
