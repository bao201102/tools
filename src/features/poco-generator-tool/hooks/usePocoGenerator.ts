import { useCallback, useState } from 'react'
import { generatePocoCode } from '../utils/pocoGenerator'

export function usePocoGenerator() {
  const [input, setInputState] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [rootClassName, setRootClassName] = useState('Root')

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

  const setInput = useCallback(
    (value: string) => {
      setInputState(value)
      applyGenerate(value, rootClassName)
    },
    [applyGenerate, rootClassName],
  )

  const setRootClassNameLive = useCallback(
    (value: string) => {
      setRootClassName(value)
      applyGenerate(input, value)
    },
    [applyGenerate, input],
  )

  const clear = useCallback(() => {
    setInput('')
    setOutput('')
    setError(null)
    setRootClassName('Root')
  }, [])

  return {
    input,
    setInput,
    output,
    error,
    rootClassName,
    setRootClassName: setRootClassNameLive,
    clear,
  }
}
