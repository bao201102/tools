import { useCallback, useMemo } from 'react'
import { useLocalStorageState } from '../../../lib/useLocalStorageState'
import { useDebouncedValue } from '../../../lib/useDebouncedValue'

import { parseCellValue, parseDelimitedText, rowsToObjects } from '../../../lib/csv'

function parseErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Invalid CSV format'
}

/** Re-exported so the tool's own tests keep a stable entry point. */
export const parseCSV = parseDelimitedText
export const parseValue = parseCellValue

export function convertCsvToJson(
  value: string,
  delimiter: string,
  firstRowIsHeaders: boolean,
): { output: string; error: string | null } {
  if (value.trim() === '') return { output: '', error: null }

  try {
    const parsedRows = parseCSV(value, delimiter)
    if (parsedRows.length === 0) return { output: '', error: null }

    const result: Record<string, unknown>[] = firstRowIsHeaders
      ? rowsToObjects(parsedRows)
      : parsedRows.map((row) => {
          const obj: Record<string, unknown> = {}
          row.forEach((cell, index) => {
            obj[`column${index + 1}`] = parseValue(cell)
          })
          return obj
        })

    return { output: JSON.stringify(result, null, 2), error: null }
  } catch (e) {
    return { output: '', error: parseErrorMessage(e) }
  }
}

export function useCsvToJson() {
  const [input, setInput] = useLocalStorageState('csv-to-json:input', '')
  const [delimiter, setDelimiter] = useLocalStorageState('csv-to-json:delimiter', ',')
  const [firstRowIsHeaders, setFirstRowIsHeaders] = useLocalStorageState(
    'csv-to-json:firstRowIsHeaders',
    true,
  )
  const debouncedInput = useDebouncedValue(input)

  const { output, error } = useMemo(
    () => convertCsvToJson(debouncedInput, delimiter, firstRowIsHeaders),
    [debouncedInput, delimiter, firstRowIsHeaders],
  )

  const clear = useCallback(() => {
    setInput('')
    setDelimiter(',')
    setFirstRowIsHeaders(true)
  }, [setInput, setDelimiter, setFirstRowIsHeaders])

  return {
    input,
    output,
    error,
    delimiter,
    firstRowIsHeaders,
    onInputChange: setInput,
    onDelimiterChange: setDelimiter,
    onFirstRowIsHeadersChange: setFirstRowIsHeaders,
    clear,
  }
}
