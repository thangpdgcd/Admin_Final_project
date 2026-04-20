"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "antd"
import { useTranslation } from "react-i18next"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const { t } = useTranslation()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isDark = theme === "dark"

  return (
    <Button type="text" onClick={() => setTheme(isDark ? "light" : "dark")}>
      <span className="relative block transition-transform duration-300">
        {isDark ? (
          <Sun className="size-4 rotate-180 transition-transform duration-300" />
        ) : (
          <Moon className="size-4 transition-transform duration-300" />
        )}
      </span>
      <span className="sr-only">
        {isDark ? t("header.switchToLight") : t("header.switchToDark")}
      </span>
    </Button>
  )
}
