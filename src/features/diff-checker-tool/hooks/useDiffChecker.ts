import { useCallback, useState } from 'react'

export type DiffLanguage =
  | 'json'
  | 'plaintext'
  | 'xml'
  | 'yaml'
  | 'javascript'
  | 'typescript'
  | 'csharp'
  | 'sql'

export function useDiffChecker() {
  const [language, setLanguage] = useState<DiffLanguage>('json')
  const [renderSideBySide, setRenderSideBySide] = useState(true)

  const toggleView = useCallback(() => {
    setRenderSideBySide((prev) => !prev)
  }, [])

  return {
    language,
    renderSideBySide,
    setLanguage,
    toggleView,
  }
}
