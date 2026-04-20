"use client"

import {
  LayoutDashboard,
  Settings,
  Users,
  Package,
  ShoppingCart,
  FolderTree,
  Headphones,
  TicketPercent,
} from "lucide-react"
import { Layout, Menu, Typography } from "antd"
import { useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

export function AppSidebar({
  user,
  onLogout,
  collapsed,
  onCollapsedChange,
}: {
  user: { name: string; email: string; avatar?: string | null }
  onLogout: () => void
  collapsed: boolean
  onCollapsedChange: (v: boolean) => void
}) {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()

  const navGroups = [
    {
      label: t("nav.main"),
      items: [
        { title: t("menu.dashboard"), url: "/system/dashboard-admin", icon: LayoutDashboard },
      ],
    },
    {
      label: t("nav.management"),
      items: [
        { title: t("menu.users"), url: "/system/users", icon: Users },
        { title: t("menu.products"), url: "/system/products", icon: Package },
        { title: t("menu.orders"), url: "/system/orders", icon: ShoppingCart },
        { title: t("menu.categories"), url: "/system/categories", icon: FolderTree },
        { title: t("menu.vouchers"), url: "/admin/vouchers", icon: TicketPercent },
        { title: t("menu.teamChat"), url: "/system/team-chat", icon: Headphones },
      ],
    },
    {
      label: t("nav.settingsGroup"),
      items: [
        // Admin app: Profile page is the settings page.
        { title: t("menu.settings"), url: "/system/profile", icon: Settings },
      ],
    },
  ]

  const flatItems = navGroups.flatMap((g) =>
    g.items.map((it) => ({
      key: it.url,
      icon: <it.icon className="h-4 w-4" />,
      label: it.title,
    }))
  )

  return (
    <Layout.Sider
      collapsible
      collapsed={collapsed}
      onCollapse={(v) => onCollapsedChange(v)}
      breakpoint="lg"
      collapsedWidth={0}
      onBreakpoint={(broken) => onCollapsedChange(broken)}
      width={260}
      theme="dark"
      className="min-h-svh"
    >
      <div className="px-4 py-4">
        <Typography.Text className="text-white font-semibold">
          {t("app.name")}
        </Typography.Text>
        {!collapsed && (
          <div className="mt-1 text-xs text-white/60 truncate">{user.email}</div>
        )}
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={flatItems}
        onClick={(e) => navigate(e.key)}
      />

      <div className="absolute bottom-0 left-0 right-0 p-3">
        <button
          type="button"
          onClick={onLogout}
          className="w-full rounded-md px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10"
        >
          {t("header.logout")}
        </button>
      </div>
    </Layout.Sider>
  )
}
