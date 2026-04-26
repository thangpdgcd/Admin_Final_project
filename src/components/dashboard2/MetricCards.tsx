"use client"

import { MetricCard } from "@/components/dashboard/cards/MetricCard"

const cards = [
  {
    title: "Total Revenue",
    value: "$54,230",
    change: "+12%",
    positive: true,
    description: "Trending up this month",
  },
  {
    title: "Active Customers",
    value: "1,234",
    change: "-5%",
    positive: false,
    description: "From last month",
  },
  {
    title: "Total Orders",
    value: "3,456",
    change: "+8%",
    positive: true,
    description: "Strong performance",
  },
  {
    title: "Conversion Rate",
    value: "4.5%",
    change: "+0.5%",
    positive: true,
    description: "Steady increase",
  },
]

export const MetricCards = () => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 min-w-0">
      {cards.map((card) => (
        <MetricCard key={card.title} {...card} />
      ))}
    </div>
  )
}
