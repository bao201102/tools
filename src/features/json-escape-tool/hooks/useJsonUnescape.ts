import { useCallback, useState } from 'react'
import { escapedPayloadToStructuredJson } from '../utils/jsonStringEscape'
import { ERROR_PANEL_PREFIX } from '../constants'

export function useJsonUnescape() {
  const [input, setInputState] = useState('')
  const [output, setOutput] = useState('')

  const setInput = useCallback((value: string) => {
    setInputState(value)
    if (value.trim() === '') {
      setOutput('')
      return
    }
    const result = escapedPayloadToStructuredJson(value)
    if (result.ok) {
      setOutput(result.json === '' ? '' : result.json)
    } else {
      setOutput(`${ERROR_PANEL_PREFIX}${result.message}`)
    }
  }, [])

  const clear = useCallback(() => {
    setInputState('')
    setOutput('')
  }, [])

  return { input, output, setInput, clear }
}
