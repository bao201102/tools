import { useCallback, useMemo } from 'react'
import { generateSqlToPoco } from '../utils/sqlToPoco'
import { useLocalStorageState } from '../../../lib/useLocalStorageState'
import { useDebouncedValue } from '../../../lib/useDebouncedValue'

function generate(input: string, className: string): { output: string; error: string | null } {
  if (input.trim() === '') return { output: '', error: null }

  try {
    return { output: generateSqlToPoco(input, className), error: null }
  } catch (err) {
    return { output: '', error: err instanceof Error ? err.message : 'Invalid SQL' }
  }
}

export function useSqlToPoco() {
  const [input, setInputState] = useLocalStorageState('sql-to-poco:input', '')
  const [className, setClassNameState] = useLocalStorageState('sql-to-poco:className', '')
  const debouncedInput = useDebouncedValue(input)

  const { output, error } = useMemo(
    () => generate(debouncedInput, className),
    [debouncedInput, className],
  )

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
