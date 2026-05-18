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
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<JsonStats>({ size: 0, keys: 0, depth: 0, objects: 0, arrays: 0 })
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')
  const [isCompressed, setIsCompressed] = useState(false)

  // Auto-validate and format
  useEffect(() => {
    if (!input.trim()) {
      setError(null)
      setStats({ size: 0, keys: 0, depth: 0, objects: 0, arrays: 0 })
      return
    }

    try {
      const parsed = JSON.parse(input)
      setError(null)
      
      // Check if compressed (single line)
      const hasNewlines = input.includes('\n')
      setIsCompressed(!hasNewlines)
      
      const formatted = JSON.stringify(parsed, null, 2)
      setStats(calculateJsonStats(formatted))
      
      // Auto-format only if not compressed and different
      if (!isCompressed && input !== formatted) {
        setInput(formatted)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON')
      setStats({ size: new Blob([input]).size, keys: 0, depth: 0, objects: 0, arrays: 0 })
    }
  }, [input, isCompressed])

  const handleClear = useCallback(() => {
    setInput('')
    setError(null)
    setStats({ size: 0, keys: 0, depth: 0, objects: 0, arrays: 0 })
    setIsCompressed(false)
  }, [])

  const handleCompress = useCallback(() => {
    if (!input.trim()) return
    try {
      const parsed = JSON.parse(input)
      setInput(JSON.stringify(parsed))
      setIsCompressed(true)
    } catch {
      // Already has error
    }
  }, [input])

  const handlePrettify = useCallback(() => {
    if (!input.trim()) return
    try {
      const parsed = JSON.parse(input)
      setInput(JSON.stringify(parsed, null, 2))
      setIsCompressed(false)
    } catch {
      // Already has error
    }
  }, [input])

  const handleSortKeys = useCallback(() => {
    if (!input.trim()) return
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
      setInput(JSON.stringify(sorted, null, 2))
    } catch {
      // Already has error
    }
  }, [input])

  const handleCopy = useCallback(async () => {
    if (!input) return
    try {
      await navigator.clipboard.writeText(input)
      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 2000)
    } catch {
      // Ignore
    }
  }, [input])

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
          To format and validate your JSON, just copy + paste it below:
        </p>
      </div>

      {/* Editor */}
      <div className="relative h-[400px] w-[70%] overflow-hidden rounded-lg border border-hairline shadow-sm">
        <Editor
          height="400px"
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

      {/* Action Buttons */}
      <div className="flex shrink-0 flex-wrap gap-2 w-[70%]">
        <button
          type="button"
          onClick={handleClear}
          className="rounded-md border border-hairline bg-surface-1 px-4 py-2 text-sm font-medium text-ink shadow-sm transition-colors hover:bg-surface-2 hover:border-hairline-strong"
        >
          Clear
        </button>
        {isCompressed ? (
          <button
            type="button"
            onClick={handlePrettify}
            disabled={!!error || !input}
            className="rounded-md border border-hairline bg-surface-1 px-4 py-2 text-sm font-medium text-ink shadow-sm transition-colors hover:bg-surface-2 hover:border-hairline-strong disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Prettify
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCompress}
            disabled={!!error || !input}
            className="rounded-md border border-hairline bg-surface-1 px-4 py-2 text-sm font-medium text-ink shadow-sm transition-colors hover:bg-surface-2 hover:border-hairline-strong disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Compress
          </button>
        )}
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
          onClick={handleCopy}
          disabled={!input}
          className="rounded-md border border-hairline bg-surface-1 px-4 py-2 text-sm font-medium text-ink shadow-sm transition-colors hover:bg-surface-2 hover:border-hairline-strong disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {copyState === 'copied' ? 'Copied!' : 'Copy'}
        </button>
        <button
          type="button"
          onClick={handleLoadSample}
          className="rounded-md border border-hairline bg-surface-1 px-4 py-2 text-sm font-medium text-primary shadow-sm transition-colors hover:bg-surface-2 hover:border-hairline-strong"
        >
          Load Sample
        </button>
      </div>

      {/* Status Bar */}
      <div
        className={`shrink-0 rounded-md px-4 py-3 text-sm font-medium w-[70%] ${
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
        ) : (
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Valid JSON • {formatBytes(stats.size)} • {stats.keys} keys • depth {stats.depth} • {stats.objects} objects • {stats.arrays} arrays
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
