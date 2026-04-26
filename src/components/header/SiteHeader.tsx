"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { LogOut, Menu as MenuIcon } from "lucide-react"
import { Divider, Tooltip } from "antd"
import { CommandSearch, SearchTrigger } from "./CommandSearch"
import { ModeToggle } from "./ModeToggle"
import { LanguageToggle } from "./LanguageToggle"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/utils/utils"
import { useTranslation } from "react-i18next"
import { AppButton } from "@/components/common/AppButton"

export const SiteHeader = ({
  compactPadding,
  onToggleSidebar,
}: { compactPadding?: boolean; onToggleSidebar?: () => void } = {}) => {
  const [searchOpen, setSearchOpen] = React.useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <header
      className={cn(
        "site-header sticky top-0 z-40 flex h-[60px] shrink-0 items-center justify-between gap-4 border-b bg-background pl-2",
        compactPadding ? "pr-3" : "pr-4",
      )}
    >
      <div className="flex flex-1 min-w-0 items-center gap-2">
        <Tooltip title={t("header.toggleMenu")}>
          <AppButton type="text" onClick={onToggleSidebar} aria-label={t("header.toggleMenu")}>
            <MenuIcon className="h-5 w-5" />
          </AppButton>
        </Tooltip>
        <div className="w-64 max-w-full min-w-0">
          <SearchTrigger onClick={() => setSearchOpen(true)} />
        </div>
      </div>
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <Divider orientation="vertical" className="mx-1 hidden sm:block" />
        <LanguageToggle />
        <ModeToggle />
        <AppButton type="text" onClick={handleLogout} aria-label={t("header.logout")}>
          <span className="inline-flex items-center gap-2 text-sm font-medium">
            <LogOut className="h-4 w-4" />
            {t("header.logout")}
          </span>
        </AppButton>
      </div>
      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  )
}
