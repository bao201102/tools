import Editor from '@monaco-editor/react'
import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { useLocalStorageState } from '../../../lib/useLocalStorageState'
import { useLocale } from '../../../lib/i18n'
import {
  getMonacoPaneHeight,
  useAdaptiveEditorHeight,
} from '../../../lib/useAdaptiveEditorHeight'
import { useMonacoEditorTheme } from '../../../lib/useMonacoEditorTheme'
import { Button, Input } from '../../../components/ui'

const editorOptions = {
  minimap: { enabled: false },
  fontSize: 14,
  scrollBeyondLastLine: false,
  wordWrap: 'on' as const,
  padding: { top: 12, bottom: 12 },
  automaticLayout: true,
  tabSize: 2,
  lineNumbers: 'on' as const,
  fixedOverflowWidgets: true,
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
  const { t } = useLocale()
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
                className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-ink-muted hover:text-ink outline-none focus-visible:ds-focus-ring rounded-sm"
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
          <Button
            variant="secondary"
            size="sm"
            onClick={expandAll}
            disabled={allExpanded}
          >
            {t('tool.json.expandAll')}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={collapseAll}
            disabled={expandedPaths.size === 0}
          >
            {t('tool.json.collapseAll')}
          </Button>
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

  const [editorValue, setEditorValue] = useLocalStorageState('json:editorValue', '')
  const [debouncedInput, setDebouncedInput] = useLocalStorageState('json:debouncedInput', '')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<JsonStats>({ size: 0, keys: 0, depth: 0, objects: 0, arrays: 0 })
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')
  const [viewMode, setViewMode] = useState<ViewMode>('editor')
  const [parsedData, setParsedData] = useState<any>(null)

  // Optimizing: Calculate height based on debounced input to prevent recalculations on every keystroke
  const editorHeight = useAdaptiveEditorHeight(debouncedInput, output)
  const monacoPaneHeight = getMonacoPaneHeight(editorHeight)
  const [detectedFields, setDetectedFields] = useState<string[]>([])
  const [selectedFieldsArray, setSelectedFieldsArray] = useLocalStorageState<string[]>('json:selectedFields', [])
  const selectedFields = useMemo(() => new Set(selectedFieldsArray), [selectedFieldsArray])
  const [extractedOutput, setExtractedOutput] = useLocalStorageState('json:extractedOutput', '')
  const [fieldSearchQuery, setFieldSearchQuery] = useState('')

  const currentValueRef = useRef(editorValue)
  const debounceTimerRef = useRef<any>(null)

  const filteredFields = detectedFields.filter(field =>
    field.toLowerCase().includes(fieldSearchQuery.toLowerCase())
  )

  const handleEditorChange = useCallback((value: string | undefined) => {
    const val = value ?? ''
    currentValueRef.current = val

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedInput(val)
      setEditorValue(val)
    }, 300)
  }, [setDebouncedInput, setEditorValue])

  // Sync editorValue with debouncedInput on mount if they are out of sync
  useEffect(() => {
    if (debouncedInput && debouncedInput !== editorValue) {
      setEditorValue(debouncedInput)
      currentValueRef.current = debouncedInput
    }
  }, [])

  // Auto-validate and format based on debounced input
  useEffect(() => {
    if (!debouncedInput.trim()) {
      setError(null)
      setOutput('')
      setStats({ size: 0, keys: 0, depth: 0, objects: 0, arrays: 0 })
      setParsedData(null)
      setDetectedFields([])
      setSelectedFieldsArray([])
      setFieldSearchQuery('')
      setExtractedOutput('')
      return
    }

    try {
      const parsed = JSON.parse(debouncedInput)
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
      setSelectedFieldsArray([])
      setExtractedOutput('')
      setStats({ size: new Blob([debouncedInput]).size, keys: 0, depth: 0, objects: 0, arrays: 0 })
    }
  }, [debouncedInput, setSelectedFieldsArray, setExtractedOutput])

  // Clear debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  const handleClear = useCallback(() => {
    setEditorValue('')
    setDebouncedInput('')
    currentValueRef.current = ''
    setOutput('')
    setError(null)
    setStats({ size: 0, keys: 0, depth: 0, objects: 0, arrays: 0 })
    setParsedData(null)
    setDetectedFields([])
    setSelectedFieldsArray([])
    setExtractedOutput('')
    setFieldSearchQuery('')
  }, [setEditorValue, setDebouncedInput, setSelectedFieldsArray, setExtractedOutput])

  const handleCompress = useCallback(() => {
    const current = currentValueRef.current
    if (!current) return
    try {
      const parsed = JSON.parse(current)
      const compressed = JSON.stringify(parsed)
      setOutput(compressed)
    } catch {
      // Already has error
    }
  }, [])

  const handlePrettify = useCallback(() => {
    const current = currentValueRef.current
    if (!current) return
    try {
      const parsed = JSON.parse(current)
      const prettified = JSON.stringify(parsed, null, 2)
      setEditorValue(prettified)
      setDebouncedInput(prettified)
      currentValueRef.current = prettified
      setOutput(prettified)
    } catch {
      // Already has error
    }
  }, [])

  const handleSortKeys = useCallback(() => {
    const current = currentValueRef.current
    if (!current) return
    try {
      const parsed = JSON.parse(current)
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
  }, [])

  const handleStringify = useCallback(() => {
    const current = currentValueRef.current
    if (!current) return
    try {
      const parsed = JSON.parse(current)
      const compactJson = JSON.stringify(parsed)
      const escapedString = JSON.stringify(compactJson)
      setOutput(escapedString)
    } catch {
      // Already has error
    }
  }, [])

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
    const sampleStr = JSON.stringify(sample, null, 2)
    setEditorValue(sampleStr)
    setDebouncedInput(sampleStr)
    currentValueRef.current = sampleStr
  }, [])

  const toggleFieldSelection = (field: string) => {
    setSelectedFieldsArray(prev => {
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

      return Array.from(next)
    })
  }

  const selectAllFields = () => {
    if (fieldSearchQuery) {
      setSelectedFieldsArray(prev => {
        const next = new Set(prev)
        filteredFields.forEach(f => next.add(f))
        return Array.from(next)
      })
    } else {
      setSelectedFieldsArray(detectedFields)
    }
  }

  const deselectAllFields = () => {
    if (fieldSearchQuery) {
      setSelectedFieldsArray(prev => {
        const next = new Set(prev)
        filteredFields.forEach(f => next.delete(f))
        return Array.from(next)
      })
    } else {
      setSelectedFieldsArray([])
    }
  }

  const handleExtractFields = useCallback(() => {
    if (!parsedData || selectedFields.size === 0) return

    // Get only top-level selected fields (not children if parent is selected)
    const topLevelFields = Array.from(selectedFields).filter(path => {
      return !Array.from(selectedFields).some(other =>
        other !== path && path.startsWith(other + '.')
      )
    })

    // Build a tree of paths from topLevelFields
    const tree: any = {}
    topLevelFields.forEach(path => {
      const parts = path.split('.')
      let current = tree
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          if (!current[part]) {
            current[part] = true
          }
        } else {
          if (current[part] === true || !current[part]) {
            current[part] = {}
          }
          current = current[part]
        }
      })
    })

    // Recursively extract values based on the tree node structure
    const extractValue = (val: any, treeNode: any): any => {
      if (val === null || val === undefined) return val
      if (treeNode === true) return val

      if (Array.isArray(val)) {
        return val.map(item => extractValue(item, treeNode))
      }

      if (typeof val === 'object') {
        const res: any = {}
        Object.keys(treeNode).forEach(key => {
          if (val[key] !== undefined) {
            res[key] = extractValue(val[key], treeNode[key])
          }
        })
        return res
      }

      return val
    }

    const result = extractValue(parsedData, tree)
    setExtractedOutput(JSON.stringify(result, null, 2))
  }, [parsedData, selectedFields, setExtractedOutput])

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
          {t('tool.json.pastePrompt')}
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
            <h3 className="text-sm font-medium text-ink">{t('tool.json.original')}</h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLoadSample}
              className="text-primary hover:text-primary-hover"
            >
              {t('tool.json.loadSample')}
            </Button>
          </div>
          <div
            className="relative overflow-hidden rounded-lg border border-hairline shadow-sm bg-surface-1"
            style={{ height: monacoPaneHeight }}
          >
            <Editor
              height={monacoPaneHeight}
              width="100%"
              language="json"
              theme={editorTheme}
              value={editorValue}
              options={editorOptions}
              onChange={handleEditorChange}
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
              <Button
                variant={viewMode === 'editor' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setViewMode('editor')}
              >
                {t('tool.json.editor')}
              </Button>
              <Button
                variant={viewMode === 'tree' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setViewMode('tree')}
                disabled={!parsedData}
              >
                {t('tool.json.treeView')}
              </Button>
            </div>
            {viewMode === 'editor' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopy}
                disabled={!output}
              >
                {copyState === 'copied' ? t('common.copied') + '!' : t('common.copy')}
              </Button>
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
                options={{ ...editorOptions, readOnly: true }}
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
                {t('tool.json.enterValid')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex shrink-0 flex-wrap gap-2">
        <Button onClick={handleClear}>
          {t('common.clear')}
        </Button>
        <Button
          onClick={handlePrettify}
          disabled={!!error || !debouncedInput}
        >
          {t('tool.json.prettify')}
        </Button>
        <Button
          onClick={handleCompress}
          disabled={!!error || !debouncedInput}
        >
          {t('tool.json.compress')}
        </Button>
        <Button
          onClick={handleSortKeys}
          disabled={!!error || !debouncedInput}
        >
          {t('tool.json.sortKeys')}
        </Button>
        <Button
          onClick={handleStringify}
          disabled={!!error || !debouncedInput}
        >
          {t('tool.json.stringify')}
        </Button>
      </div>

      {/* Status Bar */}
      <div
        className={`shrink-0 rounded-md px-4 py-3 text-sm font-medium ${error
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
              {t('tool.json.stats', {
                size: formatBytes(stats.size),
                keys: stats.keys,
                depth: stats.depth,
                objects: stats.objects,
                arrays: stats.arrays,
              })}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{t('tool.json.pasteToStart')}</span>
          </div>
        )}
      </div>

      {/* Field Selector */}
      {detectedFields.length > 0 && (
        <div className="shrink-0 rounded-lg border border-hairline bg-surface-1 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-ink">{t('tool.json.extractFields')}</h3>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={selectAllFields}
              >
                {t('tool.json.selectAll')}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={deselectAllFields}
              >
                {t('tool.json.deselectAll')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleExtractFields}
                disabled={selectedFields.size === 0}
              >
                {t('tool.json.extractSelected', { count: selectedFields.size })}
              </Button>
            </div>
          </div>
          <div className="mb-3">
            <Input
              type="text"
              placeholder={t('tool.json.searchFields')}
              value={fieldSearchQuery}
              onChange={(e) => setFieldSearchQuery(e.target.value)}
              className="!min-h-[38px] py-1.5 text-sm"
            />
          </div>
          <div className="max-h-48 overflow-y-auto rounded border border-hairline bg-surface-2 p-3">
            {filteredFields.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {filteredFields.map(field => (
                  <button
                    key={field}
                    type="button"
                    onClick={() => toggleFieldSelection(field)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all outline-none focus-visible:ds-focus-ring ${selectedFields.has(field)
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
            ) : (
              <div className="text-sm text-ink-subtle text-center py-4">
                {t('tool.json.noFieldsFound')}
              </div>
            )}
          </div>
          <p className="mt-2 text-xs text-ink-muted">
            {t('tool.json.extractPrompt')}
          </p>
        </div>
      )}

      {/* Extracted Output Editor */}
      {extractedOutput && (
        <div className="shrink-0 pb-12">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-ink">{t('tool.json.extractedOutput')}</h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(extractedOutput)
                } catch {
                  // Ignore
                }
              }}
            >
              {t('common.copy')}
            </Button>
          </div>
          <div className="relative h-[300px] overflow-hidden rounded-lg border border-hairline shadow-sm">
            <Editor
              height="100%"
              width="100%"
              language="json"
              theme={editorTheme}
              value={extractedOutput}
              options={{ ...editorOptions, readOnly: true }}
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
