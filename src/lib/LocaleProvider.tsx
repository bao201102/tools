import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  LOCALE_STORAGE_KEY,
  LocaleContext,
  detectLocale,
  interpolate,
  translations,
  type Locale,
  type LocaleContextValue,
} from './i18n'

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale)

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale: (l) => {
        try {
          window.localStorage.setItem(LOCALE_STORAGE_KEY, l)
        } catch {
          // Ignore storage errors; in-memory state still updates.
        }
        setLocaleState(l)
      },
      t: (key, params) => interpolate(translations[locale][key] ?? key, params),
    }),
    [locale]
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}
