import { Tag } from "antd";
import { cn } from "@/lib/utils";

export function StaffRoleBadge({ className }: { className?: string }) {
  return (
    <Tag
      color="gold"
      className={cn(
        "shrink-0 px-1.5 py-0 text-[10px] font-semibold uppercase tracking-wide",
        className
      )}
    >
      Staff
    </Tag>
  );
}
