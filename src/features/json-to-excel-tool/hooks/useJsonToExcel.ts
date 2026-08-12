import { useCallback, useMemo } from 'react'
import * as XLSX from 'xlsx'
import { useLocalStorageState } from '../../../lib/useLocalStorageState'
import { useDebouncedValue } from '../../../lib/useDebouncedValue'

export type SheetRow = Record<string, unknown>

function parseErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Invalid JSON'
}

function isRecord(value: unknown): value is SheetRow {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Collapse nested objects into dotted keys so they fit a flat spreadsheet. */
function flattenObject(value: unknown, prefix = '', res: SheetRow = {}): SheetRow {
  if (!isRecord(value)) return res

  for (const [key, val] of Object.entries(value)) {
    const newKey = prefix ? `${prefix}.${key}` : key
    if (isRecord(val)) {
      flattenObject(val, newKey, res)
    } else {
      res[newKey] = val
    }
  }
  return res
}

type ParseResult = { items: SheetRow[]; error: string | null }

const EMPTY: ParseResult = { items: [], error: null }

function parseJson(value: string): ParseResult {
  if (value.trim() === '') return EMPTY

  try {
    const parsed: unknown = JSON.parse(value)

    if (Array.isArray(parsed)) {
      return { items: parsed.filter(isRecord), error: null }
    }

    if (isRecord(parsed)) {
      const arrayProp = Object.values(parsed).find((val): val is unknown[] => Array.isArray(val))
      return { items: (arrayProp ?? [parsed]).filter(isRecord), error: null }
    }

    throw new Error('JSON input must be an array of objects or an object containing an array')
  } catch (e) {
    return { items: [], error: parseErrorMessage(e) }
  }
}

const PREVIEW_ROW_COUNT = 5

export function useJsonToExcel() {
  const [input, setInput] = useLocalStorageState('json-to-excel:input', '')
  const [sheetName, setSheetName] = useLocalStorageState('json-to-excel:sheetName', 'Sheet1')
  const [flatten, setFlatten] = useLocalStorageState('json-to-excel:flatten', true)
  const debouncedInput = useDebouncedValue(input)

  const { items, error } = useMemo(() => parseJson(debouncedInput), [debouncedInput])

  // Preview is derived, so it can never drift from the input the way a
  // separately-stored copy could.
  const { previewHeaders, previewRows, showPreview } = useMemo(() => {
    if (items.length === 0) {
      return { previewHeaders: [], previewRows: [], showPreview: false }
    }

    const rows = items.slice(0, PREVIEW_ROW_COUNT).map((item) => (flatten ? flattenObject(item) : item))
    const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))))

    return { previewHeaders: headers, previewRows: rows, showPreview: true }
  }, [items, flatten])

  const downloadExcel = useCallback(() => {
    // Read from the live input rather than the debounced copy: the click is an
    // explicit action and should export exactly what is on screen.
    const { items: allItems } = parseJson(input)
    if (allItems.length === 0) return

    const processed = flatten ? allItems.map((item) => flattenObject(item)) : allItems
    const name = sheetName || 'Sheet1'

    const ws = XLSX.utils.json_to_sheet(processed)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, name)
    XLSX.writeFile(wb, `${name}.xlsx`)
  }, [input, flatten, sheetName])

  const clear = useCallback(() => {
    setInput('')
    setSheetName('Sheet1')
    setFlatten(true)
  }, [setInput, setSheetName, setFlatten])

  return {
    input,
    setInput,
    error,
    sheetName,
    setSheetName,
    flatten,
    setFlatten,
    previewHeaders,
    previewRows,
    showPreview,
    downloadExcel,
    clear,
  }
}
