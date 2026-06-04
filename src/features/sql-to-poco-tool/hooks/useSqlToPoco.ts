import { useCallback, useEffect, useState } from 'react'
import { generateSqlToPoco } from '../utils/sqlToPoco'
import { useLocalStorageState } from '../../../lib/useLocalStorageState'

export function useSqlToPoco() {
  const [input, setInputState] = useLocalStorageState('sql-to-poco:input', '')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [className, setClassNameState] = useLocalStorageState('sql-to-poco:className', '')

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

  useEffect(() => {
    applyGenerate(input, className)
  }, [input, className, applyGenerate])

  const clear = useCallback(() => {
    setInputState('')
    setClassNameState('')
  }, [setInputState, setClassNameState])

  return {
    input,
    setInput: setInputState,
    output,
    error,
    className,
    setClassName: setClassNameState,
    clear,
  }
}
