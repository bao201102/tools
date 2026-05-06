import { useCallback, useState } from 'react'
import { generateSqlToPoco } from '../utils/sqlToPoco'

export function useSqlToPoco() {
  const [input, setInputState] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [className, setClassNameState] = useState('')

  const applyGenerate = useCallback((nextInput: string, nextClassName: string) => {
    if (nextInput.trim() === '') {
      setOutput('')
      setError(null)
      return
    }

    try {
      const result = generateSqlToPoco(nextInput, nextClassName)
      setOutput(result)
      setError(null)
    } catch (err) {
      setOutput('')
      setError(err instanceof Error ? err.message : 'Invalid SQL')
    }
  }, [])

  const setInput = useCallback(
    (value: string) => {
      setInputState(value)
      applyGenerate(value, className)
    },
    [applyGenerate, className],
  )

  const setClassName = useCallback(
    (value: string) => {
      setClassNameState(value)
      applyGenerate(input, value)
    },
    [applyGenerate, input],
  )

  const clear = useCallback(() => {
    setInputState('')
    setOutput('')
    setError(null)
    setClassNameState('')
  }, [])

  return {
    input,
    setInput,
    output,
    error,
    className,
    setClassName,
    clear,
  }
}
