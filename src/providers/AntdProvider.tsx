 "use client"

import * as React from "react"
import { ConfigProvider, theme as antdTheme } from "antd"
import enUS from "antd/locale/en_US"
import viVN from "antd/locale/vi_VN"
import { useTranslation } from "react-i18next"
import { useTheme } from "next-themes"

export function AntdProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation()
  const { theme } = useTheme()

  const locale = i18n.language === "vi" ? viVN : enUS
  const isDark = theme === "dark"

  return (
    <ConfigProvider
      locale={locale}
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          // Keep tokens minimal; rely on Tailwind/shadcn for layout colors.
          borderRadius: 10,
        },
      }}
    >
      {children}
    </ConfigProvider>
  )
}

