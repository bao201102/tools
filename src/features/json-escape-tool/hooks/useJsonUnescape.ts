import { useCallback, useMemo } from 'react'
import { escapedPayloadToStructuredJson } from '../utils/jsonStringEscape'
import { ERROR_PANEL_PREFIX } from '../constants'
import { useLocalStorageState } from '../../../lib/useLocalStorageState'
import { useDebouncedValue } from '../../../lib/useDebouncedValue'

export function unescapeJsonPayload(input: string): string {
  if (input.trim() === '') return ''

  const result = escapedPayloadToStructuredJson(input)
  return result.ok ? result.json : `${ERROR_PANEL_PREFIX}${result.message}`
}

export function useJsonUnescape() {
  const [input, setInput] = useLocalStorageState('json-unescape:input', '')
  const debouncedInput = useDebouncedValue(input)

  const output = useMemo(() => unescapeJsonPayload(debouncedInput), [debouncedInput])

  const clear = useCallback(() => {
    setInput('')
  }, [setInput])

  return { input, output, setInput, clear }
}
