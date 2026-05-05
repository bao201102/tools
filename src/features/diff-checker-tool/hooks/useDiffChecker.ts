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
  const [original, setOriginal] = useState('')
  const [modified, setModified] = useState('')
  const [language, setLanguage] = useState<DiffLanguage>('json')
  const [renderSideBySide, setRenderSideBySide] = useState(true)

  const swap = useCallback(() => {
    setOriginal(modified)
    setModified(original)
  }, [modified, original])

  const clearAll = useCallback(() => {
    setOriginal('')
    setModified('')
  }, [])

  return {
    original,
    modified,
    language,
    renderSideBySide,
    setOriginal,
    setModified,
    setLanguage,
    setRenderSideBySide,
    swap,
    clearAll,
  }
}
