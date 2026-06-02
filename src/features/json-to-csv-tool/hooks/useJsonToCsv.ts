import { useCallback, useState } from 'react'

function parseErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Invalid JSON'
}

function escapeCSVValue(val: unknown, delimiter: string): string {
  if (val === null || val === undefined) return ''
  let str = typeof val === 'object' ? JSON.stringify(val) : String(val)
  
  // If it contains the delimiter, double quotes, or newlines, we must wrap in double quotes
  const needsQuoting = str.includes(delimiter) || str.includes('"') || str.includes('\n') || str.includes('\r')
  if (needsQuoting) {
    str = '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}

export function useJsonToCsv() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [delimiter, setDelimiter] = useState(',')
  const [includeHeaders, setIncludeHeaders] = useState(true)

  const convertJsonToCsv = useCallback((value: string, currentDelimiter: string, currentIncludeHeaders: boolean) => {
    if (value.trim() === '') {
      setOutput('')
      setError(null)
      return
    }

    try {
      const parsed = JSON.parse(value)
      let items: any[] = []

      if (Array.isArray(parsed)) {
        items = parsed
      } else if (parsed && typeof parsed === 'object') {
        // If it's a root object, check if there is an array property
        const arrayProp = Object.values(parsed).find((val) => Array.isArray(val))
        if (arrayProp && Array.isArray(arrayProp)) {
          items = arrayProp
        } else {
          // If no array property is found, treat the object itself as a single-row array
          items = [parsed]
        }
      } else {
        throw new Error('JSON input must be an array or an object')
      }

      if (items.length === 0) {
        setOutput('')
        setError(null)
        return
      }

      // Collect all unique keys from all objects to use as headers
      const headers = Array.from(
        new Set(
          items.reduce<string[]>((acc, item) => {
            if (item && typeof item === 'object') {
              acc.push(...Object.keys(item))
            }
            return acc
          }, [])
        )
      )

      const csvRows: string[] = []

      // Add header row
      if (currentIncludeHeaders) {
        csvRows.push(headers.map((h) => escapeCSVValue(h, currentDelimiter)).join(currentDelimiter))
      }

      // Add data rows
      for (const item of items) {
        const row = headers.map((header) => {
          const val = item && typeof item === 'object' ? item[header] : ''
          return escapeCSVValue(val, currentDelimiter)
        })
        csvRows.push(row.join(currentDelimiter))
      }

      setOutput(csvRows.join('\n'))
      setError(null)
    } catch (e) {
      setOutput('')
      setError(parseErrorMessage(e))
    }
  }, [])

  const onInputChange = useCallback((value: string) => {
    setInput(value)
    convertJsonToCsv(value, delimiter, includeHeaders)
  }, [delimiter, includeHeaders, convertJsonToCsv])

  const onDelimiterChange = useCallback((value: string) => {
    setDelimiter(value)
    convertJsonToCsv(input, value, includeHeaders)
  }, [input, includeHeaders, convertJsonToCsv])

  const onIncludeHeadersChange = useCallback((value: boolean) => {
    setIncludeHeaders(value)
    convertJsonToCsv(input, delimiter, value)
  }, [input, delimiter, convertJsonToCsv])

  const clear = useCallback(() => {
    setInput('')
    setOutput('')
    setError(null)
  }, [])

  return {
    input,
    output,
    error,
    delimiter,
    includeHeaders,
    onInputChange,
    onDelimiterChange,
    onIncludeHeadersChange,
    clear,
  }
}
