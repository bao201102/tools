import { useCallback, useRef, useState } from 'react'
import {
  inspectArrayOfObjects,
  isPlainObject,
  sortObjectArrayByKey,
  type ArrayOfObjectsInspection,
  type PlainObjectRecord,
} from '../utils/arrayInspection'

function parseErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Invalid JSON'
}

export function useJson() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [arrayInspection, setArrayInspection] = useState<ArrayOfObjectsInspection | null>(null)
  const [sortKey, setSortKey] = useState('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const lastParsedRef = useRef<unknown>(undefined)

  const resetParseDerivedState = useCallback(() => {
    lastParsedRef.current = undefined
    setArrayInspection(null)
    setSortKey('')
    setSortDirection('asc')
    setOutput('')
    setError(null)
  }, [])

  const applyParsedJson = useCallback((parsed: unknown, formatOutput: (p: unknown) => string) => {
    lastParsedRef.current = parsed
    setSortKey('')
    setSortDirection('asc')
    setError(null)
    setOutput(formatOutput(parsed))
    setArrayInspection(inspectArrayOfObjects(parsed))
  }, [])

  const onInputChange = useCallback(
    (value: string) => {
      setInput(value)
      const trimmed = value.trim()
      if (trimmed === '') {
        resetParseDerivedState()
        return
      }
      try {
        const parsed = JSON.parse(value)
        applyParsedJson(parsed, (p) => JSON.stringify(p, null, 2))
      } catch (e) {
        lastParsedRef.current = undefined
        setArrayInspection(null)
        setSortKey('')
        setSortDirection('asc')
        setOutput('')
        setError(parseErrorMessage(e))
      }
    },
    [applyParsedJson, resetParseDerivedState],
  )

  const minify = useCallback(() => {
    const trimmed = input.trim()
    if (trimmed === '') {
      resetParseDerivedState()
      return
    }
    try {
      const parsed = JSON.parse(trimmed)
      applyParsedJson(parsed, (p) => JSON.stringify(p))
    } catch (e) {
      setError(parseErrorMessage(e))
    }
  }, [applyParsedJson, input, resetParseDerivedState])

  const clear = useCallback(() => {
    setInput('')
    resetParseDerivedState()
  }, [resetParseDerivedState])

  const applySort = useCallback(() => {
    if (!sortKey) return
    const parsed = lastParsedRef.current
    if (
      !Array.isArray(parsed) ||
      parsed.length === 0 ||
      !parsed.every(isPlainObject)
    ) {
      return
    }
    const sorted = sortObjectArrayByKey(
      parsed as PlainObjectRecord[],
      sortKey,
      sortDirection,
    )
    setOutput(JSON.stringify(sorted, null, 2))
  }, [sortDirection, sortKey])

  return {
    input,
    output,
    error,
    arrayInspection,
    sortKey,
    setSortKey,
    sortDirection,
    setSortDirection,
    applySort,
    onInputChange,
    minify,
    clear,
  }
}
