import Editor from '@monaco-editor/react'
import { useCallback, useEffect, useState } from 'react'
import { useLocale } from '../../../lib/i18n'
import { useMonacoEditorTheme } from '../../../lib/useMonacoEditorTheme'

const editorOptions = {
  minimap: { enabled: false },
  fontSize: 14,
  scrollBeyondLastLine: false,
  wordWrap: 'on' as const,
  padding: { top: 12, bottom: 12 },
  automaticLayout: true,
  tabSize: 2,
  lineNumbers: 'on' as const,
}

type JsonStats = {
  size: number
  keys: number
  depth: number
  objects: number
  arrays: number
}

function calculateJsonStats(json: string): JsonStats {
  try {
    const parsed = JSON.parse(json)
    
    const countKeys = (obj: any): number => {
      if (typeof obj !== 'object' || obj === null) return 0
      let count = 0
      for (const key in obj) {
        count++
        count += countKeys(obj[key])
      }
      return count
    }

    const countDepth = (obj: any, current = 1): number => {
      if (typeof obj !== 'object' || obj === null) return current
      let maxDepth = current
      for (const key in obj) {
        const depth = countDepth(obj[key], current + 1)
        maxDepth = Math.max(maxDepth, depth)
      }
      return maxDepth
    }

    const countTypes = (obj: any): { objects: number; arrays: number } => {
      let objects = 0
      let arrays = 0
      
      if (Array.isArray(obj)) {
        arrays++
        obj.forEach(item => {
          const counts = countTypes(item)
          objects += counts.objects
          arrays += counts.arrays
        })
      } else if (typeof obj === 'object' && obj !== null) {
        objects++
        Object.values(obj).forEach(value => {
          const counts = countTypes(value)
          objects += counts.objects
          arrays += counts.arrays
        })
      }
      
      return { objects, arrays }
    }

    const types = countTypes(parsed)
    
    return {
      size: new Blob([json]).size,
      keys: countKeys(parsed),
      depth: countDepth(parsed) - 1,
      objects: types.objects,
      arrays: types.arrays,
    }
  } catch {
    return { size: 0, keys: 0, depth: 0, objects: 0, arrays: 0 }
  }
}

export function JsonEditor() {
  const { t } = useLocale()
  const editorTheme = useMonacoEditorTheme()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<JsonStats>({ size: 0, keys: 0, depth: 0, objects: 0, arrays: 0 })
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')

  // Auto-validate and format
  useEffect(() => {
    if (!input.trim()) {
      setError(null)
      setOutput('')
      setStats({ size: 0, keys: 0, depth: 0, objects: 0, arrays: 0 })
      return
    }

    try {
      const parsed = JSON.parse(input)
      setError(null)
      
      const formatted = JSON.stringify(parsed, null, 2)
      setOutput(formatted)
      setStats(calculateJsonStats(formatted))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON')
      setOutput('')
      setStats({ size: new Blob([input]).size, keys: 0, depth: 0, objects: 0, arrays: 0 })
    }
  }, [input])

  const handleClear = useCallback(() => {
    setInput('')
    setOutput('')
    setError(null)
    setStats({ size: 0, keys: 0, depth: 0, objects: 0, arrays: 0 })
  }, [])

  const handleCompress = useCallback(() => {
    if (!input) return
    try {
      const parsed = JSON.parse(input)
      const compressed = JSON.stringify(parsed)
      setOutput(compressed)
    } catch {
      // Already has error
    }
  }, [input])

  const handlePrettify = useCallback(() => {
    if (!input) return
    try {
      const parsed = JSON.parse(input)
      const prettified = JSON.stringify(parsed, null, 2)
      setOutput(prettified)
    } catch {
      // Already has error
    }
  }, [input])

  const handleSortKeys = useCallback(() => {
    if (!input) return
    try {
      const parsed = JSON.parse(input)
      const sortObject = (obj: any): any => {
        if (Array.isArray(obj)) {
          return obj.map(sortObject)
        }
        if (typeof obj === 'object' && obj !== null) {
          return Object.keys(obj)
            .sort()
            .reduce((result: any, key) => {
              result[key] = sortObject(obj[key])
              return result
            }, {})
        }
        return obj
      }
      const sorted = sortObject(parsed)
      setOutput(JSON.stringify(sorted, null, 2))
    } catch {
      // Already has error
    }
  }, [input])

  const handleStringify = useCallback(() => {
    if (!input) return
    try {
      const parsed = JSON.parse(input)
      // Stringify to compact JSON, then stringify again to escape it as a string
      const compactJson = JSON.stringify(parsed)
      const escapedString = JSON.stringify(compactJson)
      setOutput(escapedString)
    } catch {
      // Already has error
    }
  }, [input])

  const handleCopy = useCallback(async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 2000)
    } catch {
      // Ignore
    }
  }, [output])

  const handleLoadSample = useCallback(() => {
    const sample = {
      name: "John Doe",
      age: 30,
      email: "john@example.com",
      address: {
        street: "123 Main St",
        city: "New York",
        country: "USA"
      },
      hobbies: ["reading", "coding", "traveling"]
    }
    setInput(JSON.stringify(sample, null, 2))
  }, [])

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[1300px] flex-1 flex-col gap-4 p-6 lg:p-8">
      <div className="shrink-0">
        <p className="text-sm text-ink-muted">
          Paste your JSON in the left editor to format and validate it:
        </p>
      </div>

      {/* Two Editors Side by Side */}
      <div className="grid min-h-0 h-[400px] grid-cols-1 gap-4 w-full lg:grid-cols-2 lg:gap-6">
        {/* Left Editor - Input (Original) */}
        <div className="flex min-h-0 flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-ink">Original JSON</h3>
            <button
              type="button"
              onClick={handleLoadSample}
              className="rounded-md border border-hairline bg-surface-1 px-3 py-1 text-xs font-medium text-primary shadow-sm transition-colors hover:bg-surface-2 hover:border-hairline-strong"
            >
              Load Sample
            </button>
          </div>
          <div className="relative h-full overflow-hidden rounded-lg border border-hairline shadow-sm">
            <Editor
              height="100%"
              width="100%"
              language="json"
              theme={editorTheme}
              value={input}
              options={editorOptions}
              onChange={(v) => setInput(v ?? '')}
              loading={
                <div className="flex h-full items-center justify-center bg-surface-2 text-sm text-ink-subtle">
                  {t('common.loadingEditor')}
                </div>
              }
            />
          </div>
        </div>

        {/* Right Editor - Output (Formatted) */}
        <div className="flex min-h-0 flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-ink">Formatted JSON</h3>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!output}
              className="rounded-md border border-hairline bg-surface-1 px-3 py-1 text-xs font-medium text-ink shadow-sm transition-colors hover:bg-surface-2 hover:border-hairline-strong disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copyState === 'copied' ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="relative h-full overflow-hidden rounded-lg border border-hairline shadow-sm">
            <Editor
              height="100%"
              width="100%"
              language="json"
              theme={editorTheme}
              value={output}
              options={{ ...editorOptions, readOnly: false }}
              onChange={(v) => setOutput(v ?? '')}
              loading={
                <div className="flex h-full items-center justify-center bg-surface-2 text-sm text-ink-subtle">
                  {t('common.loadingEditor')}
                </div>
              }
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex shrink-0 flex-wrap gap-2">
        <button
          type="button"
          onClick={handleClear}
          className="rounded-md border border-hairline bg-surface-1 px-4 py-2 text-sm font-medium text-ink shadow-sm transition-colors hover:bg-surface-2 hover:border-hairline-strong"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={handlePrettify}
          disabled={!!error || !input}
          className="rounded-md border border-hairline bg-surface-1 px-4 py-2 text-sm font-medium text-ink shadow-sm transition-colors hover:bg-surface-2 hover:border-hairline-strong disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Prettify
        </button>
        <button
          type="button"
          onClick={handleCompress}
          disabled={!!error || !input}
          className="rounded-md border border-hairline bg-surface-1 px-4 py-2 text-sm font-medium text-ink shadow-sm transition-colors hover:bg-surface-2 hover:border-hairline-strong disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Compress
        </button>
        <button
          type="button"
          onClick={handleSortKeys}
          disabled={!!error || !input}
          className="rounded-md border border-hairline bg-surface-1 px-4 py-2 text-sm font-medium text-ink shadow-sm transition-colors hover:bg-surface-2 hover:border-hairline-strong disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Sort Keys
        </button>
        <button
          type="button"
          onClick={handleStringify}
          disabled={!!error || !input}
          className="rounded-md border border-hairline bg-surface-1 px-4 py-2 text-sm font-medium text-ink shadow-sm transition-colors hover:bg-surface-2 hover:border-hairline-strong disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Stringify
        </button>
      </div>

      {/* Status Bar */}
      <div
        className={`shrink-0 rounded-md px-4 py-3 text-sm font-medium ${
          error
            ? 'bg-error-surface text-error-fg border border-error-border'
            : 'bg-primary/10 text-primary border border-primary/20'
        }`}
      >
        {error ? (
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Error: {error}</span>
          </div>
        ) : output ? (
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Valid JSON • {formatBytes(stats.size)} • {stats.keys} keys • depth {stats.depth} • {stats.objects} objects • {stats.arrays} arrays
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Paste JSON to get started</span>
          </div>
        )}
      </div>
    </div>
  )
}
