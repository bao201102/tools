import { useCallback, useState } from 'react'

function parseErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Invalid CSV format'
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
          // Escaped double quote
          field += '"'
          i++ // skip next quote
        } else {
          // Closing quote
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
          i++ // skip \n
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
  
  // If it's a number, convert it. Avoid converting strings with leading zeros (except '0' itself)
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    if (trimmed.length > 1 && trimmed.startsWith('0') && !trimmed.startsWith('0.')) {
      return trimmed // phone number or zip code
    }
    const num = Number(trimmed)
    if (!isNaN(num)) return num
  }
  
  return val
}

export function useCsvToJson() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [delimiter, setDelimiter] = useState(',')
  const [firstRowIsHeaders, setFirstRowIsHeaders] = useState(true)

  const convertCsvToJson = useCallback((value: string, currentDelimiter: string, currentFirstRowIsHeaders: boolean) => {
    if (value.trim() === '') {
      setOutput('')
      setError(null)
      return
    }

    try {
      const parsedRows = parseCSV(value, currentDelimiter)
      if (parsedRows.length === 0) {
        setOutput('')
        setError(null)
        return
      }

      let result: any

      if (currentFirstRowIsHeaders) {
        const headers = parsedRows[0].map((h) => h.trim())
        const dataRows = parsedRows.slice(1)

        result = dataRows.map((row) => {
          const obj: Record<string, any> = {}
          headers.forEach((header, index) => {
            if (header) {
              const cellValue = index < row.length ? row[index] : ''
              obj[header] = parseValue(cellValue)
            }
          })
          return obj
        })
      } else {
        result = parsedRows.map((row) => {
          const obj: Record<string, any> = {}
          row.forEach((cell, index) => {
            obj[`column${index + 1}`] = parseValue(cell)
          })
          return obj
        })
      }

      setOutput(JSON.stringify(result, null, 2))
      setError(null)
    } catch (e) {
      setOutput('')
      setError(parseErrorMessage(e))
    }
  }, [])

  const onInputChange = useCallback((value: string) => {
    setInput(value)
    convertCsvToJson(value, delimiter, firstRowIsHeaders)
  }, [delimiter, firstRowIsHeaders, convertCsvToJson])

  const onDelimiterChange = useCallback((value: string) => {
    setDelimiter(value)
    convertCsvToJson(input, value, firstRowIsHeaders)
  }, [input, firstRowIsHeaders, convertCsvToJson])

  const onFirstRowIsHeadersChange = useCallback((value: boolean) => {
    setFirstRowIsHeaders(value)
    convertCsvToJson(input, delimiter, value)
  }, [input, delimiter, convertCsvToJson])

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
    firstRowIsHeaders,
    onInputChange,
    onDelimiterChange,
    onFirstRowIsHeadersChange,
    clear,
  }
}
