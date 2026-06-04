import { useCallback, useEffect, useState } from 'react'
import { escapedPayloadToStructuredJson } from '../utils/jsonStringEscape'
import { ERROR_PANEL_PREFIX } from '../constants'
import { useLocalStorageState } from '../../../lib/useLocalStorageState'

export function useJsonUnescape() {
  const [input, setInput] = useLocalStorageState('json-unescape:input', '')
  const [output, setOutput] = useState('')

  useEffect(() => {
    if (input.trim() === '') {
      setOutput('')
      return
    }
    const result = escapedPayloadToStructuredJson(input)
    if (result.ok) {
      setOutput(result.json === '' ? '' : result.json)
    } else {
      setOutput(`${ERROR_PANEL_PREFIX}${result.message}`)
    }
  }, [input])

  const clear = useCallback(() => {
    setInput('')
  }, [setInput])

  return { input, output, setInput, clear }
}
