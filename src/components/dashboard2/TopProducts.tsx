"use client"

import { ProductList } from "@/components/dashboard/tables/ProductList"
import type { Product } from "@/components/dashboard/tables/ProductList"
import { Card, Typography } from "antd"

const mockProducts: Product[] = [
  {
    id: "1",
    rank: 1,
    name: "Premium Dashboard",
    category: "Software",
    rating: 4.9,
    salesCount: 1240,
    revenue: "$24,800",
    stock: 95,
    maxStock: 100,
    growth: 12,
  },
  {
    id: "2",
    rank: 2,
    name: "Analytics Pro",
    category: "Software",
    rating: 4.8,
    salesCount: 890,
    revenue: "$17,800",
    stock: 78,
    maxStock: 100,
    growth: 8,
  },
  {
    id: "3",
    rank: 3,
    name: "Mobile App Suite",
    category: "Software",
    rating: 4.7,
    salesCount: 756,
    revenue: "$15,120",
    stock: 82,
    maxStock: 100,
    growth: 15,
  },
  {
    id: "4",
    rank: 4,
    name: "Enterprise License",
    category: "License",
    rating: 4.9,
    salesCount: 234,
    revenue: "$46,800",
    stock: 45,
    maxStock: 50,
    growth: 5,
  },
  {
    id: "5",
    rank: 5,
    name: "Basic Subscription",
    category: "Subscription",
    rating: 4.5,
    salesCount: 1560,
    revenue: "$7,800",
    stock: 100,
    maxStock: 100,
    growth: 22,
  },
]

export function TopProducts() {
  return (
    <Card className="rounded-xl border border-border/50 shadow-sm">
      <div className="space-y-1">
        <Typography.Title level={5} className="mb-0!">Top Products</Typography.Title>
        <Typography.Text type="secondary">Best performing products by revenue</Typography.Text>
      </div>
      <div className="mt-4">
        <ProductList products={mockProducts} />
      </div>
    </Card>
  )
}
