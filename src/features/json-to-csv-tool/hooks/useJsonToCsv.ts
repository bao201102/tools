import { useCallback, useMemo } from 'react'
import { useLocalStorageState } from '../../../lib/useLocalStorageState'
import { useDebouncedValue } from '../../../lib/useDebouncedValue'
import { escapeCsvValue } from '../../../lib/csv'

function parseErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Invalid JSON'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Re-exported so the tool's own tests keep a stable entry point. */
export const escapeCSVValue = escapeCsvValue

/** Find the rows to emit: a top-level array, the first array property, or the object itself. */
function toRows(parsed: unknown): unknown[] {
  if (Array.isArray(parsed)) return parsed

  if (isRecord(parsed)) {
    const arrayProp = Object.values(parsed).find((val): val is unknown[] => Array.isArray(val))
    return arrayProp ?? [parsed]
  }

  throw new Error('JSON input must be an array or an object')
}

export function convertJsonToCsv(
  value: string,
  delimiter: string,
  includeHeaders: boolean,
): { output: string; error: string | null } {
  if (value.trim() === '') return { output: '', error: null }

  try {
    const items = toRows(JSON.parse(value))
    if (items.length === 0) return { output: '', error: null }

    // Union of every object's keys, so rows with missing fields still line up.
    const headers = Array.from(
      new Set(items.flatMap((item) => (isRecord(item) ? Object.keys(item) : []))),
    )

    const csvRows: string[] = []

    if (includeHeaders) {
      csvRows.push(headers.map((h) => escapeCSVValue(h, delimiter)).join(delimiter))
    }

    for (const item of items) {
      const row = headers.map((header) =>
        escapeCSVValue(isRecord(item) ? item[header] : '', delimiter),
      )
      csvRows.push(row.join(delimiter))
    }

    return { output: csvRows.join('\n'), error: null }
  } catch (e) {
    return { output: '', error: parseErrorMessage(e) }
  }
}

export function useJsonToCsv() {
  const [input, setInput] = useLocalStorageState('json-to-csv:input', '')
  const [delimiter, setDelimiter] = useLocalStorageState('json-to-csv:delimiter', ',')
  const [includeHeaders, setIncludeHeaders] = useLocalStorageState(
    'json-to-csv:includeHeaders',
    true,
  )
  const debouncedInput = useDebouncedValue(input)

  const { output, error } = useMemo(
    () => convertJsonToCsv(debouncedInput, delimiter, includeHeaders),
    [debouncedInput, delimiter, includeHeaders],
  )

  const clear = useCallback(() => {
    setInput('')
    setDelimiter(',')
    setIncludeHeaders(true)
  }, [setInput, setDelimiter, setIncludeHeaders])

  return {
    input,
    output,
    error,
    delimiter,
    includeHeaders,
    onInputChange: setInput,
    onDelimiterChange: setDelimiter,
    onIncludeHeadersChange: setIncludeHeaders,
    clear,
  }
}
