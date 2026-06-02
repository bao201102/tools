import { useCallback, useState } from 'react'
import * as XLSX from 'xlsx'

function parseErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Error processing spreadsheet'
}

function parseCSV(text: string, delimiter: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const nextChar = text[i + 1]

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === delimiter) {
        row.push(field)
        field = ''
      } else if (char === '\r' || char === '\n') {
        row.push(field)
        field = ''
        if (row.length > 0 || (row.length === 1 && row[0] !== '')) {
          rows.push(row)
        }
        row = []
        if (char === '\r' && nextChar === '\n') {
          i++
        }
      } else {
        field += char
      }
    }
  }

  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows.filter((r) => r.length > 0)
}

function parseValue(val: string): unknown {
  const trimmed = val.trim()
  if (trimmed === 'true') return true
  if (trimmed === 'false') return false
  if (trimmed === 'null') return null
  if (trimmed === '') return ''
  
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    if (trimmed.length > 1 && trimmed.startsWith('0') && !trimmed.startsWith('0.')) {
      return trimmed
    }
    const num = Number(trimmed)
    if (!isNaN(num)) return num
  }
  
  return val
}

export function useExcelToJson() {
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [pastedText, setPastedText] = useState('')

  const handleFileUpload = useCallback((file: File) => {
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        
        const result: Record<string, any[]> = {}
        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName]
          const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" })
          result[sheetName] = json
        })

        if (workbook.SheetNames.length === 1) {
          setOutput(JSON.stringify(result[workbook.SheetNames[0]], null, 2))
        } else {
          setOutput(JSON.stringify(result, null, 2))
        }
        setError(null)
      } catch (err) {
        setOutput('')
        setError(parseErrorMessage(err))
      }
    }
    reader.onerror = () => {
      setOutput('')
      setError('Error reading file')
    }
    reader.readAsArrayBuffer(file)
  }, [])

  const handlePasteConvert = useCallback((text: string) => {
    if (text.trim() === '') {
      setOutput('')
      setError(null)
      return
    }

    try {
      const rows = parseCSV(text, '\t')
      if (rows.length === 0) {
        setOutput('')
        setError(null)
        return
      }

      const headers = rows[0].map(h => h.trim())
      const dataRows = rows.slice(1)

      const result = dataRows.map(row => {
        const obj: Record<string, any> = {}
        headers.forEach((header, index) => {
          if (header) {
            const cellValue = index < row.length ? row[index] : ''
            obj[header] = parseValue(cellValue)
          }
        })
        return obj
      })

      setOutput(JSON.stringify(result, null, 2))
      setError(null)
    } catch (e) {
      setOutput('')
      setError(parseErrorMessage(e))
    }
  }, [])

  const clear = useCallback(() => {
    setOutput('')
    setError(null)
    setFileName(null)
    setPastedText('')
  }, [])

  return {
    output,
    error,
    fileName,
    pastedText,
    setPastedText,
    handleFileUpload,
    handlePasteConvert,
    clear,
  }
}
