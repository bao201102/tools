import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  applyThemeToDocument,
  detectThemePreference,
  getSystemColorScheme,
  resolveColorScheme,
  THEME_STORAGE_KEY,
  type ThemePreference,
} from './theme'

export type ThemeContextValue = {
  preference: ThemePreference
  resolvedScheme: 'light' | 'dark'
  setPreference: (preference: ThemePreference) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(detectThemePreference)
  const [systemScheme, setSystemScheme] = useState<'light' | 'dark'>(getSystemColorScheme)

  useEffect(() => {
    applyThemeToDocument(preference)
  }, [preference, systemScheme])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setSystemScheme(media.matches ? 'dark' : 'light')
    onChange()
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({
      preference,
      resolvedScheme: resolveColorScheme(preference),
      setPreference: (next) => {
        try {
          window.localStorage.setItem(THEME_STORAGE_KEY, next)
        } catch {
          // Ignore storage errors; in-memory state still updates.
        }
        setPreferenceState(next)
      },
    }),
    [preference, systemScheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
