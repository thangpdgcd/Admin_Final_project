"use client"

import { DollarSign, Users, UserPlus, TrendingUp } from "lucide-react"
import { MetricCard } from "@/components/dashboard/cards/MetricCard"

const cards = [
  {
    title: "Total Revenue",
    value: "$1,250.00",
    change: "+12.5%",
    positive: true,
    description: "Trending up this month",
    footer: "Visitors for the last 6 months",
    icon: DollarSign,
  },
  {
    title: "New Customers",
    value: "1,234",
    change: "-20%",
    positive: false,
    description: "Down 20% this period",
    footer: "Acquisition needs attention",
    icon: UserPlus,
  },
  {
    title: "Active Accounts",
    value: "45,678",
    change: "+12.5%",
    positive: true,
    description: "Strong user retention",
    footer: "Engagement exceed targets",
    icon: Users,
  },
  {
    title: "Growth Rate",
    value: "4.5%",
    change: "+4.5%",
    positive: true,
    description: "Steady performance increase",
    footer: "Meets growth projections",
    icon: TrendingUp,
  },
]

export const Dashboard1Cards = () => {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <MetricCard key={card.title} {...card} />
      ))}
    </div>
  )
}
