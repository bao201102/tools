import { useCallback, useMemo } from 'react'
import { doubledQuotedPayloadToJson } from '../utils/jsonStringEscape'
import { ERROR_PANEL_PREFIX } from '../constants'
import { useLocalStorageState } from '../../../lib/useLocalStorageState'
import { useDebouncedValue } from '../../../lib/useDebouncedValue'

export function unquoteJsonPayload(input: string): string {
  if (input.trim() === '') return ''

  const result = doubledQuotedPayloadToJson(input)
  return result.ok ? result.json : `${ERROR_PANEL_PREFIX}${result.message}`
}

export function useJsonUnquote() {
  const [input, setInput] = useLocalStorageState('json-unquote:input', '')
  const debouncedInput = useDebouncedValue(input)

  const output = useMemo(() => unquoteJsonPayload(debouncedInput), [debouncedInput])

  const clear = useCallback(() => {
    setInput('')
  }, [setInput])

  return { input, output, setInput, clear }
}
