import { useAuth } from "@/hooks/useAuth"
import { DashboardCards } from "@/components/dashboard/cards/DashboardCards"
import { SalesChart } from "@/components/dashboard/charts/SalesChart"
import { RevenueDonut } from "@/components/dashboard/charts/RevenueDonut"
import { RecentTransactions } from "@/components/dashboard/tables/RecentTransactions"
import { TopProducts } from "@/components/dashboard/tables/TopProducts"

export const Dashboard = () => {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Welcome back, {user?.name ?? "User"}</h2>
        <p className="text-muted-foreground">Here&apos;s an overview of your coffee shop.</p>
      </div>

      <DashboardCards />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SalesChart />
        <RevenueDonut />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentTransactions />
        <TopProducts />
      </div>
    </div>
  )
}
