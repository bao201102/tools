import { useCallback, useState } from 'react'

function parseErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Invalid JSON'
}

export function useJson() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const onInputChange = useCallback((value: string) => {
    setInput(value)
    const trimmed = value.trim()
    if (trimmed === '') {
      setOutput('')
      setError(null)
      return
    }
    try {
      const parsed = JSON.parse(value)
      setOutput(JSON.stringify(parsed, null, 2))
      setError(null)
    } catch (e) {
      setOutput('')
      setError(parseErrorMessage(e))
    }
  }, [])

  const format = useCallback(() => {
    const trimmed = input.trim()
    if (trimmed === '') {
      setOutput('')
      setError(null)
      return
    }
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed, null, 2))
      setError(null)
    } catch (e) {
      setError(parseErrorMessage(e))
    }
  }, [input])

  const minify = useCallback(() => {
    const trimmed = input.trim()
    if (trimmed === '') {
      setOutput('')
      setError(null)
      return
    }
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed))
      setError(null)
    } catch (e) {
      setError(parseErrorMessage(e))
    }
  }, [input])

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
    format,
    minify,
    clear,
  }
}
