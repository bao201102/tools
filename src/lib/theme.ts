export type ThemePreference = 'light' | 'dark' | 'system'

export const THEME_STORAGE_KEY = 'app:theme'

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system'
}

export function detectThemePreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system'
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (isThemePreference(stored)) return stored
  } catch {
    // localStorage may be unavailable — fall through.
  }
  return 'system'
}

export function getSystemColorScheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function resolveColorScheme(preference: ThemePreference): 'light' | 'dark' {
  if (preference === 'system') return getSystemColorScheme()
  return preference
}

export function applyThemeToDocument(preference: ThemePreference): void {
  const resolved = resolveColorScheme(preference)
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}
