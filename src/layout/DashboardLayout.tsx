"use client"

import { AnimatePresence } from "framer-motion"
import { Outlet, useLocation } from "react-router-dom"
import { AppSidebar } from "@/components/sidebar/AppSidebar"
import { SiteHeader } from "@/components/header/SiteHeader"
import { useAuth } from "@/hooks/useAuth"
import { useIsMobile } from "@/hooks/use-mobile"
import { useSidebarStore } from "@/store/sidebarStore"
import { Page } from "@/components/layout/Page"
import { Section } from "@/components/layout/Section"
import { MotionPage } from "@/components/motion/MotionPage"
import { Layout } from "antd"

interface DashboardLayoutProps {
  title?: string
  description?: string
}

// Routes that should use full-bleed padding (content starts right next to the sidebar)
const FULL_BLEED_PATHS = [
  "/chat",
  "/mail",
  "/calendar",
  "/system/settings",
  "/settings",
  "/tasks",
  "/system/team-chat",
]

export const DashboardLayout = ({ title, description }: DashboardLayoutProps) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const isFullBleed = FULL_BLEED_PATHS.some((p) => location.pathname.startsWith(p))
  const isMobile = useIsMobile()
  const desktopCollapsed = useSidebarStore((s) => s.desktopCollapsed)
  const mobileOpen = useSidebarStore((s) => s.mobileOpen)
  const setDesktopCollapsed = useSidebarStore((s) => s.setDesktopCollapsed)
  const setMobileOpen = useSidebarStore((s) => s.setMobileOpen)

  if (!user) {
    return null
  }

  return (
    <Layout className="min-h-svh">
      <AppSidebar
        user={{
          name: user.name,
          email: user.email,
          avatar: user.avatar ?? "",
        }}
        onLogout={logout}
        isMobile={isMobile}
        desktopCollapsed={desktopCollapsed}
        onDesktopCollapsedChange={setDesktopCollapsed}
        mobileOpen={mobileOpen}
        onMobileOpenChange={setMobileOpen}
      />
      <Layout>
        <SiteHeader
          compactPadding={isFullBleed}
          onToggleSidebar={() => (isMobile ? setMobileOpen(true) : setDesktopCollapsed(!desktopCollapsed))}
        />
        <Page fullBleed={isFullBleed} className="overflow-y-auto overflow-x-hidden">
          {(title || description) && <Section title={title} description={description} />}
          <div className="min-h-0 min-w-0 w-full flex-1">
            <AnimatePresence mode="wait" initial={false}>
              <MotionPage motionKey={location.pathname}>
                <Outlet />
              </MotionPage>
            </AnimatePresence>
          </div>
        </Page>
      </Layout>
    </Layout>
  )
}
