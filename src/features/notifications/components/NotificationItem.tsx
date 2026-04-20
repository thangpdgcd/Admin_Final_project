"use client";

import { Bell, MessageCircle, ShoppingCart, TicketPercent } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NotificationRow } from "../model/types";

function NotificationIcon({ type, isRead }: { type: NotificationRow["type"]; isRead: boolean }) {
  const Icon =
    type === "order"
      ? ShoppingCart
      : type === "chat"
        ? MessageCircle
        : type === "voucher"
          ? TicketPercent
          : Bell;
  return <Icon className={cn("h-4 w-4", !isRead ? "text-orange-600" : "text-muted-foreground")} />;
}

const formatTime = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });
};

export const NotificationItem = ({
  item,
  onClick,
}: {
  item: NotificationRow;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-md px-3 py-2 text-left transition-colors",
        "hover:bg-muted/60",
        !item.isRead && "bg-muted/40"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 grid h-8 w-8 place-items-center rounded-full border",
            !item.isRead ? "border-orange-500/40 bg-orange-500/10" : "border-border/60 bg-background"
          )}
        >
          <NotificationIcon type={item.type} isRead={item.isRead} />
        </div>
        <div className="min-w-0 flex-1">
          <div className={cn("text-sm leading-snug", !item.isRead ? "font-semibold" : "font-medium")}>
            {item.message}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{formatTime(item.createdAt)}</div>
        </div>
        {!item.isRead && <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-orange-500" />}
      </div>
    </button>
  );
};

