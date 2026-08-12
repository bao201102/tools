import { useCallback, useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import { useLocalStorageState } from '../../../lib/useLocalStorageState'
import { useDebouncedValue } from '../../../lib/useDebouncedValue'
import { parseDelimitedText, rowsToObjects } from '../../../lib/csv'

function parseErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Error processing spreadsheet'
}

type Converted = { output: string; error: string | null }

const EMPTY: Converted = { output: '', error: null }

/** Spreadsheet apps put tab-separated text on the clipboard. */
export function convertPastedTable(text: string): Converted {
  if (text.trim() === '') return EMPTY

  try {
    const rows = parseDelimitedText(text, '\t')
    if (rows.length === 0) return EMPTY

    return { output: JSON.stringify(rowsToObjects(rows), null, 2), error: null }
  } catch (e) {
    return { output: '', error: parseErrorMessage(e) }
  }
}

export function useExcelToJson() {
  const [pastedText, setPastedText] = useLocalStorageState('excel-to-json:pastedText', '')
  const [fileName, setFileName] = useState<string | null>(null)
  // A parsed workbook has no text input to derive from, so it is the one result
  // that genuinely has to be stored.
  const [fileResult, setFileResult] = useState<Converted | null>(null)

  const debouncedPastedText = useDebouncedValue(pastedText)

  const pasteResult = useMemo(
    () => convertPastedTable(debouncedPastedText),
    [debouncedPastedText],
  )

  // Whichever source the user last supplied wins; pasting clears the file result.
  const { output, error } = fileResult ?? pasteResult

  const handleFileUpload = useCallback((file: File) => {
    setFileName(file.name)
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })

        const sheets: Record<string, unknown[]> = {}
        for (const sheetName of workbook.SheetNames) {
          sheets[sheetName] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' })
        }

        // A single-sheet workbook is returned as a bare array — nesting it under
        // its sheet name would just be noise.
        const payload =
          workbook.SheetNames.length === 1 ? sheets[workbook.SheetNames[0]] : sheets

        setFileResult({ output: JSON.stringify(payload, null, 2), error: null })
      } catch (err) {
        setFileResult({ output: '', error: parseErrorMessage(err) })
      }
    }

    reader.onerror = () => {
      setFileResult({ output: '', error: 'Error reading file' })
    }

    reader.readAsArrayBuffer(file)
  }, [])

  const handlePastedTextChange = useCallback(
    (value: React.SetStateAction<string>) => {
      setFileResult(null)
      setFileName(null)
      setPastedText(value)
    },
    [setPastedText],
  )

  const clear = useCallback(() => {
    setFileResult(null)
    setFileName(null)
    setPastedText('')
  }, [setPastedText])

  return {
    output,
    error,
    fileName,
    pastedText,
    setPastedText: handlePastedTextChange,
    handleFileUpload,
    clear,
  }
}
