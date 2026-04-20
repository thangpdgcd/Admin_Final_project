"use client";

import { CheckCheck } from "lucide-react";
import { Button } from "antd";
import type { NotificationRow } from "../model/types";
import { NotificationItem } from "./NotificationItem";

export const NotificationDropdown = ({
  items,
  onItemClick,
  onMarkAllRead,
}: {
  items: NotificationRow[];
  onItemClick: (n: NotificationRow) => void;
  onMarkAllRead: () => void;
}) => {
  return (
    <div className="w-80 max-w-[calc(100vw-2rem)]">
      <div className="flex items-center justify-between px-3 py-2">
        <div className="text-sm font-semibold">Notifications</div>
        <Button type="text" size="small" className="h-8 px-2" onClick={onMarkAllRead}>
          <CheckCheck className="mr-2 h-4 w-4" />
          Mark all
        </Button>
      </div>

      <div className="max-h-[360px] overflow-auto px-2 pb-2">
        {items.length === 0 ? (
          <div className="px-3 py-10 text-center text-sm text-muted-foreground">No notifications</div>
        ) : (
          <div className="space-y-1">
            {items.map((n) => (
              <NotificationItem key={n.id} item={n} onClick={() => onItemClick(n)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

