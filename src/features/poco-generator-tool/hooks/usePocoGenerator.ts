import { useCallback, useEffect, useState } from 'react'
import { generatePocoCode } from '../utils/pocoGenerator'
import { useLocalStorageState } from '../../../lib/useLocalStorageState'

export function usePocoGenerator() {
  const [input, setInputState] = useLocalStorageState('poco-generator:input', '')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [rootClassName, setRootClassName] = useLocalStorageState('poco-generator:rootClassName', 'Root')

  const applyGenerate = useCallback((nextInput: string, nextRootClassName: string) => {
    if (nextInput.trim() === '') {
      setOutput('')
      setError(null)
      return
    }

    try {
      const result = generatePocoCode(nextInput, nextRootClassName.trim() || 'Root')
      setOutput(result)
      setError(null)
    } catch (err) {
      setOutput('')
      setError(err instanceof Error ? err.message : 'Invalid JSON')
    }
  }, [])

  useEffect(() => {
    applyGenerate(input, rootClassName)
  }, [input, rootClassName, applyGenerate])

  const clear = useCallback(() => {
    setInputState('')
    setRootClassName('Root')
  }, [setInputState, setRootClassName])

  return {
    input,
    setInput: setInputState,
    output,
    error,
    rootClassName,
    setRootClassName,
    clear,
  }
}
