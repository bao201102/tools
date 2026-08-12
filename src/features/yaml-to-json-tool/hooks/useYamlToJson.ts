import yaml from 'js-yaml'
import { useCallback, useMemo } from 'react'
import { useLocalStorageState } from '../../../lib/useLocalStorageState'
import { useDebouncedValue } from '../../../lib/useDebouncedValue'

function parseErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Invalid YAML'
}

export function convertYamlToJson(value: string): { output: string; error: string | null } {
  if (value.trim() === '') return { output: '', error: null }

  try {
    const parsed = yaml.load(value)
    // A document of only comments parses to undefined — not an error, just nothing to show.
    if (parsed === undefined) return { output: '', error: null }

    return { output: JSON.stringify(parsed, null, 2), error: null }
  } catch (e) {
    return { output: '', error: parseErrorMessage(e) }
  }
}

export function useYamlToJson() {
  const [input, setInput] = useLocalStorageState('yaml-to-json:input', '')
  const debouncedInput = useDebouncedValue(input)

  const { output, error } = useMemo(() => convertYamlToJson(debouncedInput), [debouncedInput])

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
