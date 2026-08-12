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

/**
 * `systemScheme` is passed in rather than read here so this stays a pure
 * function of its arguments — callers that memoise on it then have a dependency
 * that actually reflects what the result depends on.
 */
export function resolveColorScheme(
  preference: ThemePreference,
  systemScheme: 'light' | 'dark' = getSystemColorScheme(),
): 'light' | 'dark' {
  return preference === 'system' ? systemScheme : preference
}

export function applyThemeToDocument(
  preference: ThemePreference,
  systemScheme?: 'light' | 'dark',
): void {
  const resolved = resolveColorScheme(preference, systemScheme)
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}
