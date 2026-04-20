import { useAuth } from "@/hooks/useAuth"
import { Dashboard1Cards } from "@/components/dashboard-cards/Dashboard1Cards"
import { VisitorsChart } from "@/components/charts/VisitorsChart"
import { DashboardTabs } from "@/components/tabs/DashboardTabs"
import { DashboardDataTable } from "@/components/data-table/DashboardDataTable"

export function Dashboard1() {
  useAuth()

  return (
    <div className="min-w-0 w-full space-y-8 md:space-y-10">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl bg-linear-to-r from-foreground to-foreground/80 bg-clip-text text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Welcome to your admin dashboard. Here&apos;s an overview of your store.
        </p>
      </div>

      <Dashboard1Cards />

      <VisitorsChart />

      <DashboardTabs />

      <DashboardDataTable />
    </div>
  )
}
