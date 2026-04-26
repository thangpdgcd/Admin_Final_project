"use client"

import { Card, Typography } from "antd"
import { ProductList, type Product } from "./ProductList"

const mockProducts: Product[] = [
  {
    id: "1",
    rank: 1,
    name: "Espresso Blend",
    category: "Coffee",
    rating: 4.9,
    salesCount: 1247,
    revenue: "$12,470",
    stock: 85,
    maxStock: 100,
    growth: 15.2,
  },
  {
    id: "2",
    rank: 2,
    name: "Croissant",
    category: "Pastries",
    rating: 4.7,
    salesCount: 892,
    revenue: "$4,460",
    stock: 42,
    maxStock: 80,
    growth: 8.5,
  },
  {
    id: "3",
    rank: 3,
    name: "Cold Brew",
    category: "Beverages",
    rating: 4.8,
    salesCount: 756,
    revenue: "$5,670",
    stock: 120,
    maxStock: 150,
    growth: -2.3,
  },
  {
    id: "4",
    rank: 4,
    name: "Cappuccino",
    category: "Coffee",
    rating: 4.6,
    salesCount: 634,
    revenue: "$6,340",
    stock: 95,
    maxStock: 100,
    growth: 22.1,
  },
  {
    id: "5",
    rank: 5,
    name: "Chocolate Muffin",
    category: "Pastries",
    rating: 4.5,
    salesCount: 521,
    revenue: "$2,605",
    stock: 18,
    maxStock: 50,
    growth: 5.0,
  },
]

export const TopProducts = () => {
  return (
    <Card className="rounded-xl border border-border/50 bg-card/95 shadow-sm backdrop-blur-sm">
      <div className="space-y-1">
        <Typography.Title level={5} className="mb-0!">
          Top Products
        </Typography.Title>
        <Typography.Text type="secondary">Best selling products by revenue</Typography.Text>
      </div>
      <div className="mt-4">
        <ProductList products={mockProducts} />
      </div>
    </Card>
  )
}
