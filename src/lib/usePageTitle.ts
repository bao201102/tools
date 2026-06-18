import { useEffect } from 'react'
import { useLocale, type TranslationKey } from './i18n'

/**
 * Sets the document <title> dynamically for each tool page.
 * Falls back gracefully if the key doesn't exist.
 */
export function usePageTitle(titleKey: TranslationKey) {
  const { t } = useLocale()

  useEffect(() => {
    const toolTitle = t(titleKey)
    document.title = `${toolTitle} — NUB Portal`
    return () => {
      document.title = 'NUB Portal'
    }
  }, [titleKey, t])
}
