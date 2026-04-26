import { Dashboard2Header } from "@/components/dashboard2/Dashboard2Header"
import { MetricCards } from "@/components/dashboard2/MetricCards"
import { SalesChart } from "@/components/dashboard2/SalesChart"
import { RevenueBreakdown } from "@/components/dashboard2/RevenueBreakdown"
import { RecentTransactions } from "@/components/dashboard2/RecentTransactions"
import { TopProducts } from "@/components/dashboard2/TopProducts"
import { CustomerInsights } from "@/components/dashboard2/CustomerInsights"

export const Dashboard2 = () => {
  return (
    <div className="space-y-6">
      <Dashboard2Header />
      <MetricCards />
      <div className="grid gap-6 lg:grid-cols-2">
        <SalesChart />
        <RevenueBreakdown />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentTransactions />
        <TopProducts />
      </div>
      <CustomerInsights />
    </div>
  )
}
