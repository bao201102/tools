import yaml from 'js-yaml'
import { useCallback, useState } from 'react'

function parseErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Invalid JSON'
}

const dumpOptions: yaml.DumpOptions = {
  indent: 2,
  lineWidth: -1,
  noRefs: true,
}

export function useJsonToYaml() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const onInputChange = useCallback((value: string) => {
    setInput(value)
    if (value.trim() === '') {
      setOutput('')
      setError(null)
      return
    }
    try {
      // Parse as JSON first
      const data = JSON.parse(value)
      // Convert to YAML
      setOutput(yaml.dump(data, dumpOptions))
      setError(null)
    } catch (e) {
      setOutput('')
      setError(parseErrorMessage(e))
    }
  }, [])

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
    clear,
  }
}
