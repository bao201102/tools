import Editor from '@monaco-editor/react'
import { useCallback, useEffect, useState } from 'react'
import { useLocale } from '../../../lib/i18n'
import {
  getMonacoPaneHeight,
  useAdaptiveEditorHeight,
} from '../../../lib/useAdaptiveEditorHeight'
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

type ViewMode = 'editor' | 'tree'

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

function JsonTreeView({ data }: { data: any }) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())
  const [allExpanded, setAllExpanded] = useState(false)

  const togglePath = (path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  const expandAll = () => {
    const allPaths = new Set<string>()
    const collectPaths = (obj: any, currentPath: string) => {
      if (typeof obj === 'object' && obj !== null) {
        allPaths.add(currentPath)
        if (Array.isArray(obj)) {
          obj.forEach((item, index) => {
            collectPaths(item, `${currentPath}[${index}]`)
          })
        } else {
          Object.keys(obj).forEach(key => {
            collectPaths(obj[key], `${currentPath}.${key}`)
          })
        }
      }
    }
    collectPaths(data, 'root')
    setExpandedPaths(allPaths)
    setAllExpanded(true)
  }

  const collapseAll = () => {
    setExpandedPaths(new Set())
    setAllExpanded(false)
  }

  const getValueType = (value: any): string => {
    if (value === null) return 'null'
    if (Array.isArray(value)) return 'array'
    return typeof value
  }

  const getValueColor = (type: string): string => {
    switch (type) {
      case 'string': return 'text-green-600 dark:text-green-400'
      case 'number': return 'text-blue-600 dark:text-blue-400'
      case 'boolean': return 'text-purple-600 dark:text-purple-400'
      case 'null': return 'text-purple-600 dark:text-purple-400'
      default: return 'text-ink'
    }
  }

  const renderValue = (value: any, path: string, key?: string, depth: number = 0): React.ReactElement => {
    const type = getValueType(value)
    const isExpanded = expandedPaths.has(path)
    const indent = depth * 20

    if (type === 'object' || type === 'array') {
      const isEmpty = type === 'array' ? value.length === 0 : Object.keys(value).length === 0
      const count = type === 'array' ? value.length : Object.keys(value).length
      const preview = type === 'array' ? `Array(${count})` : `Object{${count}}`

      return (
        <div key={path} style={{ marginLeft: `${indent}px` }}>
          <div className="flex items-center gap-1 py-0.5 hover:bg-surface-2 rounded px-1 -mx-1">
            {!isEmpty && (
              <button
                onClick={() => togglePath(path)}
                className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-ink-muted hover:text-ink"
              >
                {isExpanded ? '▼' : '▶'}
              </button>
            )}
            {isEmpty && <span className="w-4" />}
            {key !== undefined && (
              <span className="text-red-600 dark:text-red-400 font-medium">"{key}":</span>
            )}
            <span className="text-ink-muted">{type === 'array' ? '[' : '{'}</span>
            {!isExpanded && (
              <>
                <span className="text-ink-subtle text-xs">{preview}</span>
                <span className="text-ink-muted">{type === 'array' ? ']' : '}'}</span>
              </>
            )}
          </div>
          {isExpanded && (
            <>
              <div>
                {type === 'array'
                  ? value.map((item: any, index: number) =>
                      renderValue(item, `${path}[${index}]`, undefined, depth + 1)
                    )
                  : Object.entries(value).map(([k, v]) =>
                      renderValue(v, `${path}.${k}`, k, depth + 1)
                    )}
              </div>
              <div style={{ marginLeft: `${indent}px` }} className="text-ink-muted py-0.5 px-1">
                {type === 'array' ? ']' : '}'}
              </div>
            </>
          )}
        </div>
      )
    }

    // Primitive values
    return (
      <div key={path} style={{ marginLeft: `${indent}px` }} className="flex items-center gap-1 py-0.5 hover:bg-surface-2 rounded px-1 -mx-1">
        <span className="w-4" />
        {key !== undefined && (
          <span className="text-red-600 dark:text-red-400 font-medium">"{key}":</span>
        )}
        <span className={getValueColor(type)}>
          {type === 'string' ? `"${value}"` : String(value)}
        </span>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-hairline">
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            disabled={allExpanded}
            className="rounded-md border border-hairline bg-surface-1 px-3 py-1.5 text-xs font-medium text-ink shadow-sm transition-colors hover:bg-surface-2 hover:border-hairline-strong disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            disabled={expandedPaths.size === 0}
            className="rounded-md border border-hairline bg-surface-1 px-3 py-1.5 text-xs font-medium text-ink shadow-sm transition-colors hover:bg-surface-2 hover:border-hairline-strong disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Collapse All
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto font-mono text-sm">
        {renderValue(data, 'root')}
      </div>
    </div>
  )
}

export function JsonEditor() {
  const { t } = useLocale()
  const editorTheme = useMonacoEditorTheme()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<JsonStats>({ size: 0, keys: 0, depth: 0, objects: 0, arrays: 0 })
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')
  const [viewMode, setViewMode] = useState<ViewMode>('editor')
  const [parsedData, setParsedData] = useState<any>(null)
  const editorHeight = useAdaptiveEditorHeight(input, output)
  const monacoPaneHeight = getMonacoPaneHeight(editorHeight)
  const [detectedFields, setDetectedFields] = useState<string[]>([])
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set())
  const [extractedOutput, setExtractedOutput] = useState('')

  // Auto-validate and format
  useEffect(() => {
    if (!input.trim()) {
      setError(null)
      setOutput('')
      setStats({ size: 0, keys: 0, depth: 0, objects: 0, arrays: 0 })
      setParsedData(null)
      setDetectedFields([])
      setSelectedFields(new Set())
      return
    }

    try {
      const parsed = JSON.parse(input)
      setError(null)
      setParsedData(parsed)
      
      // Detect all fields (normalize array indices to generic pattern)
      const fields = new Set<string>()
      const detectFields = (obj: any, prefix = '') => {
        if (typeof obj === 'object' && obj !== null) {
          if (Array.isArray(obj)) {
            // For arrays, analyze first item to get structure
            if (obj.length > 0) {
              detectFields(obj[0], prefix)
            }
          } else {
            Object.keys(obj).forEach(key => {
              const path = prefix ? `${prefix}.${key}` : key
              fields.add(path)
              detectFields(obj[key], path)
            })
          }
        }
      }
      detectFields(parsed)
      setDetectedFields(Array.from(fields).sort())
      
      const formatted = JSON.stringify(parsed, null, 2)
      setOutput(formatted)
      setStats(calculateJsonStats(formatted))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON')
      setOutput('')
      setParsedData(null)
      setDetectedFields([])
      setSelectedFields(new Set())
      setStats({ size: new Blob([input]).size, keys: 0, depth: 0, objects: 0, arrays: 0 })
    }
  }, [input])

  const handleClear = useCallback(() => {
    setInput('')
    setOutput('')
    setError(null)
    setStats({ size: 0, keys: 0, depth: 0, objects: 0, arrays: 0 })
    setParsedData(null)
    setDetectedFields([])
    setSelectedFields(new Set())
    setExtractedOutput('')
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

  const toggleFieldSelection = (field: string) => {
    setSelectedFields(prev => {
      const next = new Set(prev)
      
      if (next.has(field)) {
        // Deselecting: remove this field and all its children
        next.delete(field)
        detectedFields.forEach(f => {
          if (f.startsWith(field + '.')) {
            next.delete(f)
          }
        })
        
        // Also deselect all parent fields
        const parts = field.split('.')
        for (let i = parts.length - 1; i > 0; i--) {
          const parentPath = parts.slice(0, i).join('.')
          next.delete(parentPath)
        }
      } else {
        // Selecting: add this field and all its children
        next.add(field)
        detectedFields.forEach(f => {
          if (f.startsWith(field + '.')) {
            next.add(f)
          }
        })
        
        // Check if all siblings are selected, then select parent
        const parts = field.split('.')
        for (let i = parts.length - 1; i > 0; i--) {
          const parentPath = parts.slice(0, i).join('.')
          const childrenFields = detectedFields.filter(f => {
            const fParts = f.split('.')
            return fParts.length === i + 1 && f.startsWith(parentPath + '.')
          })
          
          // Check if all direct children are selected
          const allChildrenSelected = childrenFields.every(child => next.has(child))
          
          if (allChildrenSelected && childrenFields.length > 0) {
            next.add(parentPath)
          }
        }
      }
      
      return next
    })
  }

  const selectAllFields = () => {
    setSelectedFields(new Set(detectedFields))
  }

  const deselectAllFields = () => {
    setSelectedFields(new Set())
  }

  const handleExtractFields = useCallback(() => {
    if (!parsedData || selectedFields.size === 0) return

    const extractFieldsFromObject = (obj: any, selectedPaths: Set<string>): any => {
      const result: any = {}
      
      // Get only top-level selected fields (not children if parent is selected)
      const topLevelFields = Array.from(selectedPaths).filter(path => {
        return !Array.from(selectedPaths).some(other => 
          other !== path && path.startsWith(other + '.')
        )
      })
      
      topLevelFields.forEach(path => {
        const parts = path.split('.')
        let current = obj
        let resultCurrent = result
        
        // Navigate through the path
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i]
          
          if (i === parts.length - 1) {
            // Last part - set the value (could be primitive or object)
            if (current && current[part] !== undefined) {
              resultCurrent[part] = current[part]
            }
          } else {
            // Intermediate part - create structure
            if (current && current[part] !== undefined) {
              if (!resultCurrent[part]) {
                resultCurrent[part] = Array.isArray(current[part]) ? [] : {}
              }
              current = current[part]
              resultCurrent = resultCurrent[part]
            } else {
              break
            }
          }
        }
      })
      
      return result
    }

    let result: any
    
    // Check if root is an array
    if (Array.isArray(parsedData)) {
      result = parsedData.map(item => extractFieldsFromObject(item, selectedFields))
    } else {
      result = extractFieldsFromObject(parsedData, selectedFields)
    }

    setExtractedOutput(JSON.stringify(result, null, 2))
  }, [parsedData, selectedFields])

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
      <div
        className="grid min-h-0 shrink-0 grid-cols-1 gap-4 w-full lg:grid-cols-2 lg:gap-6"
        style={{ height: editorHeight }}
      >
        {/* Left Editor - Input (Original) */}
        <div className="flex min-h-0 flex-col gap-2">
          <div className="flex shrink-0 items-center justify-between">
            <h3 className="text-sm font-medium text-ink">Original JSON</h3>
            <button
              type="button"
              onClick={handleLoadSample}
              className="rounded-md border border-hairline bg-surface-1 px-3 py-1 text-xs font-medium text-primary shadow-sm transition-colors hover:bg-surface-2 hover:border-hairline-strong"
            >
              Load Sample
            </button>
          </div>
          <div
            className="relative overflow-hidden rounded-lg border border-hairline shadow-sm"
            style={{ height: monacoPaneHeight }}
          >
            <Editor
              height={monacoPaneHeight}
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

        {/* Right Panel - Output (Formatted or Tree View) */}
        <div className="flex min-h-0 flex-col gap-2">
          <div className="flex shrink-0 items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('editor')}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  viewMode === 'editor'
                    ? 'bg-primary text-white'
                    : 'bg-surface-1 text-ink border border-hairline hover:bg-surface-2'
                }`}
              >
                Editor
              </button>
              <button
                type="button"
                onClick={() => setViewMode('tree')}
                disabled={!parsedData}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  viewMode === 'tree'
                    ? 'bg-primary text-white'
                    : 'bg-surface-1 text-ink border border-hairline hover:bg-surface-2'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Tree View
              </button>
            </div>
            {viewMode === 'editor' && (
              <button
                type="button"
                onClick={handleCopy}
                disabled={!output}
                className="rounded-md border border-hairline bg-surface-1 px-3 py-1 text-xs font-medium text-ink shadow-sm transition-colors hover:bg-surface-2 hover:border-hairline-strong disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copyState === 'copied' ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>
          <div
            className="relative overflow-hidden rounded-lg border border-hairline shadow-sm bg-surface-1"
            style={{ height: monacoPaneHeight }}
          >
            {viewMode === 'editor' ? (
              <Editor
                height={monacoPaneHeight}
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
            ) : parsedData ? (
              <div className="overflow-auto p-4" style={{ height: monacoPaneHeight }}>
                <JsonTreeView data={parsedData} />
              </div>
            ) : (
              <div
                className="flex items-center justify-center text-sm text-ink-subtle"
                style={{ height: monacoPaneHeight }}
              >
                Enter valid JSON to view tree
              </div>
            )}
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

      {/* Field Selector */}
      {detectedFields.length > 0 && (
        <div className="shrink-0 rounded-lg border border-hairline bg-surface-1 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-ink">Extract Specific Fields</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAllFields}
                className="rounded-md border border-hairline bg-surface-1 px-3 py-1 text-xs font-medium text-ink shadow-sm transition-colors hover:bg-surface-2 hover:border-hairline-strong"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={deselectAllFields}
                className="rounded-md border border-hairline bg-surface-1 px-3 py-1 text-xs font-medium text-ink shadow-sm transition-colors hover:bg-surface-2 hover:border-hairline-strong"
              >
                Deselect All
              </button>
              <button
                type="button"
                onClick={handleExtractFields}
                disabled={selectedFields.size === 0}
                className="rounded-md border border-hairline bg-primary px-3 py-1 text-xs font-medium text-white shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Extract Selected ({selectedFields.size})
              </button>
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto rounded border border-hairline bg-surface-2 p-3">
            <div className="flex flex-wrap gap-2">
              {detectedFields.map(field => (
                <button
                  key={field}
                  type="button"
                  onClick={() => toggleFieldSelection(field)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    selectedFields.has(field)
                      ? 'bg-primary text-white shadow-sm hover:bg-primary/90'
                      : 'bg-surface-1 text-ink border border-hairline hover:bg-surface-2 hover:border-hairline-strong'
                  }`}
                  title={field}
                >
                  <span>{field}</span>
                  {selectedFields.has(field) && (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-2 text-xs text-ink-muted">
            Click on fields to select/deselect them, then click "Extract Selected" to generate a new JSON.
          </p>
        </div>
      )}

      {/* Extracted Output Editor */}
      {extractedOutput && (
        <div className="shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-ink">Extracted JSON Output</h3>
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(extractedOutput)
                } catch {
                  // Ignore
                }
              }}
              className="rounded-md border border-hairline bg-surface-1 px-3 py-1 text-xs font-medium text-ink shadow-sm transition-colors hover:bg-surface-2 hover:border-hairline-strong"
            >
              Copy
            </button>
          </div>
          <div className="relative h-[300px] overflow-hidden rounded-lg border border-hairline shadow-sm">
            <Editor
              height="100%"
              width="100%"
              language="json"
              theme={editorTheme}
              value={extractedOutput}
              options={{ ...editorOptions, readOnly: false }}
              onChange={(v) => setExtractedOutput(v ?? '')}
              loading={
                <div className="flex h-full items-center justify-center bg-surface-2 text-sm text-ink-subtle">
                  {t('common.loadingEditor')}
                </div>
              }
            />
          </div>
        </div>
      )}
    </div>
  )
}
