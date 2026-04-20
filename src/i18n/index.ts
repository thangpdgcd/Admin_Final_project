import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import vi from "./locales/vi.json";

export const LANGUAGE_KEY = "language";

const resources = {
  en: { translation: en },
  vi: { translation: vi },
} as const;

const getInitialLanguage = () => {
  const stored = localStorage.getItem(LANGUAGE_KEY);
  if (stored === "vi" || stored === "en") return stored;
  return "vi";
};

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (lng) => {
  localStorage.setItem(LANGUAGE_KEY, lng);
});

export default i18n;

