import yaml from 'js-yaml'
import { useCallback, useState } from 'react'

function parseErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Invalid YAML'
}

const dumpOptions: yaml.DumpOptions = {
  indent: 2,
  lineWidth: -1,
  noRefs: true,
}

export function useYaml() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const onInputChange = useCallback((value: string) => {
    setInput(value)
    if (value.trim() === '') {
      setError(null)
      return
    }
    try {
      yaml.load(value)
      setError(null)
    } catch (e) {
      setError(parseErrorMessage(e))
    }
  }, [])

  const format = useCallback(() => {
    if (input.trim() === '') {
      setOutput('')
      setError(null)
      return
    }
    try {
      const data = yaml.load(input)
      setOutput(yaml.dump(data, dumpOptions))
      setError(null)
    } catch (e) {
      setError(parseErrorMessage(e))
    }
  }, [input])

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
    format,
    clear,
  }
}
