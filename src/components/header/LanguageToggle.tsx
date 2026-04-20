 "use client"

import { Languages } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button, Dropdown } from "antd"

export function LanguageToggle() {
  const { i18n, t } = useTranslation()
  const current = i18n.language === "vi" ? "VI" : "EN"

  return (
    <Dropdown
      trigger={["click"]}
      placement="bottomRight"
      menu={{
        items: [
          {
            key: "vi",
            label: `Tiếng Việt ${current === "VI" ? "✓" : ""}`,
            onClick: () => i18n.changeLanguage("vi"),
          },
          {
            key: "en",
            label: `English ${current === "EN" ? "✓" : ""}`,
            onClick: () => i18n.changeLanguage("en"),
          },
        ],
      }}
    >
      <Button type="text" aria-label={t("header.switchLanguage")}>
        <Languages className="size-4" />
        <span className="sr-only">{t("header.switchLanguage")}</span>
      </Button>
    </Dropdown>
  )
}

