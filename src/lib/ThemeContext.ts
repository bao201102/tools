import { createContext, useContext } from 'react'
import type { ThemePreference } from './theme'

export type ThemeContextValue = {
  preference: ThemePreference
  resolvedScheme: 'light' | 'dark'
  setPreference: (preference: ThemePreference) => void
}

/**
 * Kept apart from ThemeProvider.tsx: a module that exports both a component and
 * non-component values loses Fast Refresh, so every theme change during
 * development would reload the whole tree instead of hot-swapping.
 */
export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
