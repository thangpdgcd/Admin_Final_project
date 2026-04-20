"use client"

import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { LogOut, Menu as MenuIcon, Settings, ShoppingBag } from "lucide-react"
import { motion } from "framer-motion"
import { Button, Divider, Dropdown, Tooltip } from "antd"
import { CommandSearch, SearchTrigger } from "./CommandSearch"
import { ModeToggle } from "./ModeToggle"
import { LanguageToggle } from "./LanguageToggle"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"
import { useCartUiStore } from "@/store/cartUiStore"

const getInitials = (name?: string | null) => {
  const safeName = name?.trim() || "User"
  return safeName
    .split(" ")
    .map((n) => n[0] || "")
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export const SiteHeader = ({
  compactPadding,
  onToggleSidebar,
}: { compactPadding?: boolean; onToggleSidebar?: () => void } = {}) => {
  const [searchOpen, setSearchOpen] = React.useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const cartCount = useCartUiStore((state) => state.count)
  const badgePulseKey = useCartUiStore((state) => state.badgePulseKey)

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

  const userMenu = [
    {
      key: "profile",
      label: (
        <Link to="/system/profile" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          {t("menu.settings")}
        </Link>
      ),
    },
    { type: "divider" as const },
    {
      key: "logout",
      danger: true,
      label: (
        <span className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          {t("header.logout")}
        </span>
      ),
      onClick: handleLogout,
    },
  ]

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-[60px] shrink-0 items-center justify-between gap-4 border-b bg-background pl-2",
        compactPadding ? "pr-3" : "pr-4"
      )}
    >
      <div className="flex flex-1 min-w-0 items-center gap-2">
        <Tooltip title={t("header.toggleMenu")}>
          <Button type="text" onClick={onToggleSidebar} aria-label={t("header.toggleMenu")}>
            <MenuIcon className="h-5 w-5" />
          </Button>
        </Tooltip>
        <div className="w-64 max-w-full min-w-0">
          <SearchTrigger onClick={() => setSearchOpen(true)} />
        </div>
      </div>
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <Button id="header-cart-target" type="text" className="relative" aria-label="Cart">
          <ShoppingBag className="h-5 w-5" />
          <span className="sr-only">Cart</span>
          <motion.span
            key={badgePulseKey}
            initial={{ scale: 0.8 }}
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ duration: 0.35 }}
            className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white"
          >
            {cartCount}
          </motion.span>
        </Button>
        <Divider orientation="vertical" className="mx-1 hidden sm:block" />
        <LanguageToggle />
        <ModeToggle />
        <Dropdown menu={{ items: userMenu }} trigger={["click"]} placement="bottomRight">
          <Button type="text" aria-label={t("header.userMenu")}>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">
              {getInitials(user?.name)}
            </span>
          </Button>
        </Dropdown>
      </div>
      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  )
}
