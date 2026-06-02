import { useCallback, useState } from 'react'
import * as XLSX from 'xlsx'

function parseErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Invalid JSON'
}

function flattenObject(obj: any, prefix = '', res: any = {}): any {
  if (obj === null || obj === undefined) return res
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const val = obj[key]
      const newKey = prefix ? `${prefix}.${key}` : key
      if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
        flattenObject(val, newKey, res)
      } else {
        res[newKey] = val
      }
    }
  }
  return res
}

export function useJsonToExcel() {
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sheetName, setSheetName] = useState('Sheet1')
  const [flatten, setFlatten] = useState(true)
  
  // States for preview
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([])
  const [previewRows, setPreviewRows] = useState<any[]>([])
  const [showPreview, setShowPreview] = useState(false)

  const parseJson = useCallback((value: string): any[] | null => {
    if (value.trim() === '') {
      setError(null)
      return null
    }
    try {
      const parsed = JSON.parse(value)
      let items: any[] = []
      if (Array.isArray(parsed)) {
        items = parsed
      } else if (parsed && typeof parsed === 'object') {
        const arrayProp = Object.values(parsed).find((val) => Array.isArray(val))
        if (arrayProp && Array.isArray(arrayProp)) {
          items = arrayProp
        } else {
          items = [parsed]
        }
      } else {
        throw new Error('JSON input must be an array of objects or an object containing an array')
      }
      setError(null)
      return items
    } catch (e) {
      setError(parseErrorMessage(e))
      return null
    }
  }, [])

  const generatePreview = useCallback(() => {
    const items = parseJson(input)
    if (!items || items.length === 0) {
      setPreviewHeaders([])
      setPreviewRows([])
      setShowPreview(false)
      return
    }

    // Process first 5 rows for preview
    const first5 = items.slice(0, 5)
    const processed = flatten 
      ? first5.map(item => flattenObject(item))
      : first5

    const headers = Array.from(
      new Set(
        processed.reduce<string[]>((acc, item) => {
          if (item && typeof item === 'object') {
            acc.push(...Object.keys(item))
          }
          return acc
        }, [])
      )
    )

    setPreviewHeaders(headers)
    setPreviewRows(processed)
    setShowPreview(true)
  }, [input, flatten, parseJson])

  const downloadExcel = useCallback(() => {
    const items = parseJson(input)
    if (!items || items.length === 0) return

    const processed = flatten
      ? items.map(item => flattenObject(item))
      : items

    const ws = XLSX.utils.json_to_sheet(processed)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, sheetName || 'Sheet1')
    XLSX.writeFile(wb, `${sheetName || 'Sheet1'}.xlsx`)
  }, [input, flatten, sheetName, parseJson])

  const clear = useCallback(() => {
    setInput('')
    setError(null)
    setPreviewHeaders([])
    setPreviewRows([])
    setShowPreview(false)
  }, [])

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
    generatePreview,
    downloadExcel,
    clear,
  }
}
