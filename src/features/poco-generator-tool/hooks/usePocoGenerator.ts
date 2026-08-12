import { useCallback, useMemo } from 'react'
import { generatePocoCode } from '../utils/pocoGenerator'
import { useLocalStorageState } from '../../../lib/useLocalStorageState'
import { useDebouncedValue } from '../../../lib/useDebouncedValue'

function generate(input: string, rootClassName: string): { output: string; error: string | null } {
  if (input.trim() === '') return { output: '', error: null }

  try {
    return { output: generatePocoCode(input, rootClassName.trim() || 'Root'), error: null }
  } catch (err) {
    return { output: '', error: err instanceof Error ? err.message : 'Invalid JSON' }
  }
}

export function usePocoGenerator() {
  const [input, setInputState] = useLocalStorageState('poco-generator:input', '')
  const [rootClassName, setRootClassName] = useLocalStorageState(
    'poco-generator:rootClassName',
    'Root',
  )
  const debouncedInput = useDebouncedValue(input)

  const { output, error } = useMemo(
    () => generate(debouncedInput, rootClassName),
    [debouncedInput, rootClassName],
  )

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
