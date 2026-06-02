import yaml from 'js-yaml'
import { useCallback, useState } from 'react'

function parseErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Invalid YAML'
}

export function useYamlToJson() {
  const [input, setInput] = useState('')
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

  const onInputChange = useCallback((value: string) => {
    setInput(value)
    convertYamlToJson(value)
  }, [convertYamlToJson])

  const clear = useCallback(() => {
    setInput('')
    setOutput('')
    setError(null)
  }, [])

  return {
    input,
    output,
    error,
    onInputChange,
    clear,
  }
}
