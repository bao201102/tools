import { useTheme } from './ThemeProvider'

export type MonacoEditorTheme = 'vs-dark' | 'vs-light'

export function useMonacoEditorTheme(): MonacoEditorTheme {
  const { resolvedScheme } = useTheme()
  return resolvedScheme === 'dark' ? 'vs-dark' : 'vs-light'
}
