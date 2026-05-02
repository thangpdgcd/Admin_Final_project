import i18n from "@/locales"
import { toI18nKey } from "@/utils/i18nKey"

type Lang = "vi" | "en"
type Entry = { vi?: string; en?: string }

const STORAGE_KEY = "dynamic_translations_v1"

type Store = {
  products?: Record<string, Entry>
  categories?: Record<string, Entry>
}

const readStore = (): Store => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    return typeof parsed === "object" && parsed !== null ? (parsed as Store) : {}
  } catch {
    return {}
  }
}

const writeStore = (store: Store): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export const getDynamicTranslation = (scope: keyof Store, key: string): string | undefined => {
  const store = readStore()
  const table = store[scope]
  if (!table) return undefined
  const entry = table[key]
  if (!entry) return undefined
  const lng = (i18n.language === "en" ? "en" : "vi") as Lang
  return entry[lng]
}

export const setDynamicTranslation = (scope: keyof Store, key: string, entry: Entry): void => {
  const store = readStore()
  const table = (store[scope] ?? {}) as Record<string, Entry>
  store[scope] = table
  table[key] = { ...(table[key] ?? {}), ...entry }
  writeStore(store)
}

const translateViaLibre = async (text: string, target: Lang): Promise<string> => {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 4500)
  try {
    const res = await fetch("https://libretranslate.com/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text, source: "auto", target, format: "text" }),
      signal: controller.signal,
    })
    if (!res.ok) {
      throw new Error(`Translate failed (${res.status})`)
    }
    const data = (await res.json()) as { translatedText?: string }
    return String(data.translatedText || "").trim()
  } finally {
    window.clearTimeout(timeout)
  }
}

export const ensureDynamicProductTranslation = async (name: string): Promise<void> => {
  const key = toI18nKey(name)
  if (!key) return

  const existing = getDynamicTranslation("products", key)
  if (existing) return

  const lng = (i18n.language === "en" ? "en" : "vi") as Lang
  const other: Lang = lng === "en" ? "vi" : "en"

  setDynamicTranslation("products", key, { [lng]: name })
  try {
    const translated = await translateViaLibre(name, other)
    if (translated) {
      setDynamicTranslation("products", key, { [other]: translated })
    }
  } catch {
    // Ignore: fall back to original text or static locale dictionary
  }
}

