import { memo } from "react"
import { cn } from "@/utils/utils"

interface ProductBadgeProps {
  type: "bestSeller" | "new"
}

const badgeTextByType: Record<ProductBadgeProps["type"], string> = {
  bestSeller: "Best Seller",
  new: "New",
}

const badgeClassByType: Record<ProductBadgeProps["type"], string> = {
  bestSeller: "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-200",
  new: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200",
}

export const ProductBadge = memo(({ type }: ProductBadgeProps) => {
  return (
    <span
      className={cn("rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-sm", badgeClassByType[type])}
    >
      {badgeTextByType[type]}
    </span>
  )
})
