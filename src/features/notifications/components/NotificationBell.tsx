"use client"

import { Bell } from "lucide-react"
import { motion } from "framer-motion"
import { Button, Dropdown } from "antd"
import type { NotificationRow } from "../model/types"
import { NotificationDropdown } from "./NotificationDropdown"

export const NotificationBell = ({
  unreadCount,
  items,
  onItemClick,
  onMarkAllRead,
}: {
  unreadCount: number
  items: NotificationRow[]
  onItemClick: (n: NotificationRow) => void
  onMarkAllRead: () => void
}) => {
  return (
    <Dropdown
      trigger={["click"]}
      placement="bottomRight"
      popupRender={() => (
        <NotificationDropdown items={items} onItemClick={onItemClick} onMarkAllRead={onMarkAllRead} />
      )}
    >
      <Button type="text" className="relative" aria-label="Notifications">
        <Bell className="h-5 w-5" />
        <span className="sr-only">Notifications</span>
        {unreadCount > 0 && (
          <motion.span
            key={unreadCount}
            initial={{ scale: 0.85 }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 0.35 }}
            className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.span>
        )}
      </Button>
    </Dropdown>
  )
}
