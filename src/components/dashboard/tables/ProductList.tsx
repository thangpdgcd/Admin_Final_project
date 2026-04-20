"use client"

import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { Progress, Tag } from "antd"

export interface Product {
  id: string
  rank: number
  name: string
  category: string
  rating: number
  salesCount: number
  revenue: string
  stock: number
  maxStock: number
  growth: number
}

export interface ProductListProps {
  products: Product[]
  className?: string
}

export function ProductList({ products, className }: ProductListProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {products.map((product) => (
        <div
          key={product.id}
          className="rounded-lg border border-border/50 px-4 py-3 transition-colors hover:bg-muted/50"
        >
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold">
                #{product.rank}
              </span>
              <div className="min-w-0">
                <p className="font-medium truncate">{product.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Tag className="text-xs">{product.category}</Tag>
                  <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {product.rating}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0 text-sm">
              <span className="font-medium tabular-nums">{product.revenue}</span>
              <span className="text-xs text-muted-foreground">
                {product.salesCount.toLocaleString()} sales
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex-1 min-w-0">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Stock</span>
                <span>
                  {product.stock}/{product.maxStock}
                </span>
              </div>
              <Progress
                percent={(product.stock / product.maxStock) * 100}
                showInfo={false}
              />
            </div>
            <span
              className={cn(
                "text-sm font-medium shrink-0 tabular-nums",
                product.growth >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
              )}
            >
              {product.growth >= 0 ? "+" : ""}
              {product.growth}%
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
