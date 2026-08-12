import Editor from '@monaco-editor/react'
import { useCallback, useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { useLocalStorageState } from '../../../lib/useLocalStorageState'
import { useDebouncedValue } from '../../../lib/useDebouncedValue'
import {
  analyseJson,
  extractFields,
  sortObjectKeys,
  type JsonValue,
} from '../utils/jsonAnalysis'
import { useLocale } from '../../../lib/i18n'
import {
  getMonacoPaneHeight,
  useAdaptiveEditorHeight,
} from '../../../lib/useAdaptiveEditorHeight'
import { useMonacoEditorTheme } from '../../../lib/useMonacoEditorTheme'
import { Button, Input, CopyButton } from '../../../components/ui'

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

function JsonTreeView({ data }: { data: JsonValue }) {
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
    const collectPaths = (obj: JsonValue, currentPath: string) => {
      if (typeof obj === 'object' && obj !== null) {
        allPaths.add(currentPath)
        if (Array.isArray(obj)) {
          obj.forEach((item, index) => {
            collectPaths(item, `${currentPath}[${index}]`)
          })
        } else {
          Object.entries(obj).forEach(([key, child]) => {
            collectPaths(child, `${currentPath}.${key}`)
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

  const getValueType = (value: JsonValue): string => {
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

  const renderValue = (value: JsonValue, path: string, key?: string, depth: number = 0): React.ReactElement => {
    const type = getValueType(value)
    const isExpanded = expandedPaths.has(path)
    const indent = depth * 20

    if (type === 'object' || type === 'array') {
      const container = value as JsonValue[] | { [key: string]: JsonValue }
      const count = Array.isArray(container) ? container.length : Object.keys(container).length
      const isEmpty = count === 0
      const preview = type === 'array' ? `Array(${count})` : `Object{${count}}`

      return (
        <div key={path} style={{ marginLeft: `${indent}px` }}>
          <div className="flex items-center gap-1 py-0.5 hover:bg-surface-2 rounded px-1 -mx-1">
            {!isEmpty && (
              <button
                onClick={() => togglePath(path)}
                aria-expanded={isExpanded}
                aria-label={isExpanded ? t('tool.json.tree.collapse') : t('tool.json.tree.expand')}
                className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-ink-muted hover:text-ink outline-none focus-visible:ds-focus-ring rounded-sm"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                )}
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
                {Array.isArray(container)
                  ? container.map((item, index) =>
                    renderValue(item, `${path}[${index}]`, undefined, depth + 1)
                  )
                  : Object.entries(container).map(([k, v]) =>
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

const SAMPLE_JSON = JSON.stringify(
  {
    name: 'John Doe',
    age: 30,
    email: 'john@example.com',
    address: {
      street: '123 Main St',
      city: 'New York',
      country: 'USA',
    },
    hobbies: ['reading', 'coding', 'traveling'],
  },
  null,
  2,
)

/**
 * An alternate rendering of the current document (minified, sorted, stringified)
 * produced by one of the toolbar buttons. Tagged with the input it was made
 * from so the next edit invalidates it without an effect.
 */
type OutputOverride = { forInput: string; value: string } | null

export function JsonEditor() {
  const { t } = useLocale()
  const editorTheme = useMonacoEditorTheme()

  const [editorValue, setEditorValue] = useLocalStorageState('json:editorValue', '')
  const debouncedInput = useDebouncedValue(editorValue)

  const [viewMode, setViewMode] = useState<ViewMode>('editor')
  const [fieldSearchQuery, setFieldSearchQuery] = useState('')
  const [outputOverride, setOutputOverride] = useState<OutputOverride>(null)
  const [extraction, setExtraction] = useState<OutputOverride>(null)

  // Everything about the document is a pure function of its text.
  const { parsed: parsedData, formatted, error, stats, fields: detectedFields } = useMemo(
    () => analyseJson(debouncedInput),
    [debouncedInput],
  )

  const output = outputOverride?.forInput === debouncedInput ? outputOverride.value : formatted
  const extractedOutput = extraction?.forInput === debouncedInput ? extraction.value : ''

  const editorHeight = useAdaptiveEditorHeight(debouncedInput, output)
  const monacoPaneHeight = getMonacoPaneHeight(editorHeight)

  const [selectedFieldsArray, setSelectedFieldsArray] = useLocalStorageState<string[]>('json:selectedFields', [])

  // Intersecting with the fields actually present means a selection survives an
  // edit that keeps the same shape, and silently drops fields that disappear —
  // no reset-on-change effect required.
  const selectedFields = useMemo(() => {
    const available = new Set(detectedFields)
    return new Set(selectedFieldsArray.filter((field) => available.has(field)))
  }, [selectedFieldsArray, detectedFields])

  const filteredFields = useMemo(
    () => detectedFields.filter((field) => field.toLowerCase().includes(fieldSearchQuery.toLowerCase())),
    [detectedFields, fieldSearchQuery],
  )

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      setEditorValue(value ?? '')
    },
    [setEditorValue],
  )

  const handleClear = useCallback(() => {
    setEditorValue('')
    setSelectedFieldsArray([])
    setOutputOverride(null)
    setExtraction(null)
    setFieldSearchQuery('')
  }, [setEditorValue, setSelectedFieldsArray])

  /** Re-render the document a different way without changing the source text. */
  const overrideOutput = useCallback(
    (render: (parsed: JsonValue) => string) => {
      if (!editorValue) return
      try {
        setOutputOverride({ forInput: editorValue, value: render(JSON.parse(editorValue) as JsonValue) })
      } catch {
        // Invalid JSON already surfaces through `error`.
      }
    },
    [editorValue],
  )

  const handleCompress = useCallback(
    () => overrideOutput((parsed) => JSON.stringify(parsed)),
    [overrideOutput],
  )

  const handleSortKeys = useCallback(
    () => overrideOutput((parsed) => JSON.stringify(sortObjectKeys(parsed), null, 2)),
    [overrideOutput],
  )

  const handleStringify = useCallback(
    () => overrideOutput((parsed) => JSON.stringify(JSON.stringify(parsed))),
    [overrideOutput],
  )

  // Prettify rewrites the source itself, so the derived output follows along.
  const handlePrettify = useCallback(() => {
    if (!editorValue) return
    try {
      setEditorValue(JSON.stringify(JSON.parse(editorValue), null, 2))
      setOutputOverride(null)
    } catch {
      // Invalid JSON already surfaces through `error`.
    }
  }, [editorValue, setEditorValue])

  const handleLoadSample = useCallback(() => {
    setEditorValue(SAMPLE_JSON)
  }, [setEditorValue])

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
    if (parsedData === null || selectedFields.size === 0) return

    setExtraction({
      forInput: debouncedInput,
      value: JSON.stringify(extractFields(parsedData, selectedFields), null, 2),
    })
  }, [parsedData, selectedFields, debouncedInput])

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[1300px] flex-1 flex-col gap-4 px-4 pt-4 pb-20 sm:p-6 lg:p-8">
      <div className="shrink-0">
        <p className="text-sm text-ink-muted">
          {t('tool.json.pastePrompt')}
        </p>
      </div>

      {/* Two Editors Side by Side */}
      <div
        className="grid min-h-0 shrink-0 grid-cols-1 gap-4 w-full lg:grid-cols-2 lg:gap-6"
      >
        {/* Left Editor - Input (Original) */}
        <div className="flex min-h-0 flex-col gap-2" style={{ height: editorHeight }}>
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
        <div className="flex min-h-0 flex-col gap-2" style={{ height: editorHeight }}>
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
              <CopyButton value={() => output} disabled={!output} />
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
          <div className="flex items-center gap-2" role="alert">
            <AlertCircle className="h-5 w-5 shrink-0" aria-hidden />
            <span>{t('common.error')}: {error}</span>
          </div>
        ) : output ? (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden />
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
            <Info className="h-5 w-5 shrink-0" aria-hidden />
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
            <CopyButton value={() => extractedOutput} />
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
      <div className="h-16 w-full shrink-0 lg:hidden" aria-hidden="true" />
    </div>
  )
}
