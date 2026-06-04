import yaml from 'js-yaml'
import { useCallback, useEffect, useState } from 'react'
import { useLocalStorageState } from '../../../lib/useLocalStorageState'

function parseErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Invalid JSON'
}

const dumpOptions: yaml.DumpOptions = {
  indent: 2,
  lineWidth: -1,
  noRefs: true,
}

export function useJsonToYaml() {
  const [input, setInput] = useLocalStorageState('json-to-yaml:input', '')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (input.trim() === '') {
      setOutput('')
      setError(null)
      return
    }
    try {
      // Parse as JSON first
      const data = JSON.parse(input)
      // Convert to YAML
      setOutput(yaml.dump(data, dumpOptions))
      setError(null)
    } catch (e) {
      setOutput('')
      setError(parseErrorMessage(e))
    }
  }, [input])

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
