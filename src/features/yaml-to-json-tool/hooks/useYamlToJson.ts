import yaml from 'js-yaml'
import { useCallback, useEffect, useState } from 'react'
import { useLocalStorageState } from '../../../lib/useLocalStorageState'

function parseErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Invalid YAML'
}

export function useYamlToJson() {
  const [input, setInput] = useLocalStorageState('yaml-to-json:input', '')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const convertYamlToJson = useCallback((value: string) => {
    if (value.trim() === '') {
      setOutput('')
      setError(null)
      return
    }
    try {
      const parsed = yaml.load(value)
      if (parsed === undefined) {
        setOutput('')
        setError(null)
        return
      }
      setOutput(JSON.stringify(parsed, null, 2))
      setError(null)
    } catch (e) {
      setOutput('')
      setError(parseErrorMessage(e))
    }
  }, [])

  useEffect(() => {
    convertYamlToJson(input)
  }, [input, convertYamlToJson])

  const clear = useCallback(() => {
    setInput('')
  }, [setInput])

  return {
    input,
    output,
    error,
    onInputChange: setInput,
    clear,
  }
}
