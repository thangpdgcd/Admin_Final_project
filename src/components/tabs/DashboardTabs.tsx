"use client"

import { Tabs } from "antd"

export const DashboardTabs = () => {
  return (
    <Tabs
      defaultActiveKey="outline"
      items={[
        {
          key: "outline",
          label: "Outline",
          children: (
            <div className="rounded-xl border border-border/50 bg-card/95 p-6 shadow-sm backdrop-blur-sm">
              <p className="text-sm text-muted-foreground">
                Outline content. Add your project overview and key objectives here.
              </p>
            </div>
          ),
        },
        {
          key: "past-performance",
          label: "Past Performance (3)",
          children: (
            <div className="rounded-xl border border-border/50 bg-card/95 p-6 shadow-sm backdrop-blur-sm">
              <p className="text-sm text-muted-foreground">Past Performance content. 3 items available.</p>
            </div>
          ),
        },
        {
          key: "key-personnel",
          label: "Key Personnel (2)",
          children: (
            <div className="rounded-xl border border-border/50 bg-card/95 p-6 shadow-sm backdrop-blur-sm">
              <p className="text-sm text-muted-foreground">Key Personnel content. 2 items available.</p>
            </div>
          ),
        },
        {
          key: "focus-documents",
          label: "Focus Documents",
          children: (
            <div className="rounded-xl border border-border/50 bg-card/95 p-6 shadow-sm backdrop-blur-sm">
              <p className="text-sm text-muted-foreground">Focus Documents content.</p>
            </div>
          ),
        },
      ]}
    />
  )
}
