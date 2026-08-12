import yaml from 'js-yaml'
import { useCallback, useMemo } from 'react'
import { useLocalStorageState } from '../../../lib/useLocalStorageState'
import { useDebouncedValue } from '../../../lib/useDebouncedValue'

function parseErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Invalid JSON'
}

const dumpOptions: yaml.DumpOptions = {
  indent: 2,
  lineWidth: -1,
  noRefs: true,
}

export function convertJsonToYaml(input: string): { output: string; error: string | null } {
  if (input.trim() === '') return { output: '', error: null }

  try {
    return { output: yaml.dump(JSON.parse(input), dumpOptions), error: null }
  } catch (e) {
    return { output: '', error: parseErrorMessage(e) }
  }
}

export function useJsonToYaml() {
  const [input, setInput] = useLocalStorageState('json-to-yaml:input', '')
  const debouncedInput = useDebouncedValue(input)

  // Derived during render rather than pushed into state from an effect: the
  // output is a pure function of the input, so an effect would only add a
  // second render pass in which the screen still shows the previous result.
  const { output, error } = useMemo(() => convertJsonToYaml(debouncedInput), [debouncedInput])

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
