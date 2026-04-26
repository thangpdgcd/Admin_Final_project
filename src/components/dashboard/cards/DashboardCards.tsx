import { MetricCard } from "./MetricCard"

const cards = [
  {
    title: "Total Revenue",
    value: "$1,250.00",
    change: "+12.5%",
    positive: true,
    description: "Trending up this month",
    footer: "Visitors for the last 6 months",
  },
  {
    title: "Active Customers",
    value: "1,234",
    change: "-20%",
    positive: false,
    description: "Down 20% this period",
    footer: "Acquisition needs attention",
  },
  {
    title: "Total Orders",
    value: "45,678",
    change: "+12.5%",
    positive: true,
    description: "Strong user retention",
    footer: "Engagement exceeds targets",
  },
  {
    title: "Conversion Rate",
    value: "4.5%",
    change: "+4.5%",
    positive: true,
    description: "Steady performance increase",
    footer: "Meets growth projections",
  },
]

export const DashboardCards = () => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <MetricCard key={card.title} {...card} />
      ))}
    </div>
  )
}
