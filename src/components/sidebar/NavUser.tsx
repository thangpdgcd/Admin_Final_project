"use client"

import { LogOut, User } from "lucide-react"
import { Link } from "react-router-dom"
import { Button, Dropdown } from "antd"

export function NavUser({
  user,
  onLogout,
}: {
  user?: { name?: string; email?: string; avatar?: string | null } | null
  onLogout: () => void
}) {
  const name = user?.name?.trim() || "User"
  const email = user?.email?.trim() || "No email"
  const initials = name
    .split(" ")
    .map((n) => n[0] || "")
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <Dropdown
      trigger={["click"]}
      placement="bottomRight"
      menu={{
        items: [
          {
            key: "profile",
            label: (
              <Link to="/system/profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </Link>
            ),
          },
          {
            key: "logout",
            danger: true,
            label: (
              <span className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Log out
              </span>
            ),
            onClick: onLogout,
          },
        ],
      }}
    >
      <Button type="text" className="w-full justify-start">
        <span className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-md bg-muted text-xs font-semibold">
          {initials}
        </span>
        <span className="min-w-0 flex-1 text-left">
          <span className="block truncate font-semibold">{name}</span>
          <span className="block truncate text-xs text-muted-foreground">{email}</span>
        </span>
      </Button>
    </Dropdown>
  )
}
