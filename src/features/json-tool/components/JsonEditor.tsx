import Editor from '@monaco-editor/react'
import { useCallback, useState, type ReactNode } from 'react'
import { Button } from '../../../components/ui/Button'
import { useJson } from '../hooks/useJson'

const EDITOR_THEME = 'vs-dark'

const editorOptions = {
  minimap: { enabled: false },
  fontSize: 14,
  scrollBeyondLastLine: false,
  wordWrap: 'on' as const,
  padding: { top: 8, bottom: 8 },
  automaticLayout: true,
  tabSize: 2,
}

function ToolbarButton({
  children,
  onClick,
  disabled,
  variant = 'default',
}: {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
  variant?: 'default' | 'danger'
}) {
  const base =
    'rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50'
  const styles =
    variant === 'danger'
      ? 'border border-red-900/60 bg-red-950/40 text-red-200 hover:bg-red-950/70'
      : 'border border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700'

  return (
    <button type="button" className={`${base} ${styles}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

function JsonMonacoPane({
  labelId,
  value,
  readOnly,
  onChange,
  'aria-invalid': ariaInvalid,
}: {
  labelId: string
  value: string
  readOnly: boolean
  onChange?: (value: string) => void
  'aria-invalid'?: boolean
}) {
  return (
    <div
      className="absolute inset-0 min-h-0"
      aria-labelledby={labelId}
      aria-invalid={ariaInvalid}
    >
      <Editor
        height="100%"
        width="100%"
        language="json"
        theme={EDITOR_THEME}
        value={value}
        options={{
          ...editorOptions,
          readOnly,
          ...(readOnly
            ? {
                readOnly: true,
                fixedOverflowWidgets: true,
                wordWrap: 'on' as const,
              }
            : {}),
        }}
        onChange={readOnly ? undefined : (v) => onChange?.(v ?? '')}
        loading={
          <div className="flex h-full items-center justify-center bg-slate-900 text-sm text-slate-400">
            Loading editor…
          </div>
        }
      />
    </div>
  )
}

export function JsonEditor() {
  const {
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
  } = useJson()
  const [copyLabel, setCopyLabel] = useState('Copy')

  const handleCopy = useCallback(async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopyLabel('Copied')
      window.setTimeout(() => setCopyLabel('Copy'), 2000)
    } catch {
      setCopyLabel('Failed')
      window.setTimeout(() => setCopyLabel('Copy'), 2000)
    }
  }, [output])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-6 lg:p-8">
      <div className="shrink-0">
        <h1 className="text-xl font-semibold tracking-tight text-slate-100 sm:text-2xl">JSON Formatter</h1>
        <p className="mt-1 text-sm text-slate-400">
          Pretty-print and validate JSON as you type. Use Minify for a single-line output.
        </p>
      </div>

      {error ? (
        <p
          className="shrink-0 rounded-md border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-300"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="flex shrink-0 flex-wrap gap-2">
        <ToolbarButton onClick={minify}>Minify</ToolbarButton>
        <ToolbarButton onClick={clear} variant="danger">
          Clear
        </ToolbarButton>
        <ToolbarButton onClick={handleCopy} disabled={!output}>
          {copyLabel}
        </ToolbarButton>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <div className="flex min-h-10 shrink-0 items-center">
            <span id="json-input-label" className="text-sm font-medium text-slate-300">
              Input
            </span>
          </div>
          <div className="relative min-h-[min(36vh,220px)] flex-1 overflow-hidden rounded-lg border border-slate-700 sm:min-h-[min(40vh,280px)]">
            <JsonMonacoPane
              labelId="json-input-label"
              value={input}
              readOnly={false}
              onChange={onInputChange}
              aria-invalid={error ? true : undefined}
            />
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <div
            className="flex min-h-10 shrink-0 flex-wrap items-center justify-between gap-x-[var(--ds-spacing-md)] gap-y-[var(--ds-spacing-xs)] lg:flex-nowrap lg:gap-y-0"
            aria-label={arrayInspection ? 'Output and array sorting' : undefined}
          >
            <div className="flex min-h-10 shrink-0 items-center">
              <span id="json-output-label" className="text-sm font-medium text-slate-300">
                Output
              </span>
            </div>
            {arrayInspection ? (
              <div className="flex min-h-10 min-w-0 flex-1 flex-wrap items-center justify-end gap-[var(--ds-spacing-xs)] lg:flex-nowrap">
                <span className="shrink-0 text-caption text-ink-muted" aria-live="polite">
                  <span className="text-ink">{arrayInspection.itemCount}</span>
                  {' items detected'}
                </span>
                <label className="sr-only" htmlFor="json-array-sort-field">
                  Sort by field
                </label>
                <select
                  id="json-array-sort-field"
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value)}
                  className={[
                    'min-h-10 min-w-[6.5rem] max-w-[12rem] shrink cursor-pointer rounded-md border border-hairline',
                    'bg-surface-1 px-3 py-2 text-body text-ink outline-none transition-colors',
                    'hover:border-hairline-strong focus-visible:border-hairline-strong focus-visible:ds-focus-ring',
                  ].join(' ')}
                >
                  <option value="">Select field…</option>
                  {arrayInspection.keys.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
                <label className="sr-only" htmlFor="json-array-sort-direction">
                  Sort direction
                </label>
                <select
                  id="json-array-sort-direction"
                  value={sortDirection}
                  onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
                  className={[
                    'min-h-10 w-[5.75rem] shrink-0 cursor-pointer rounded-md border border-hairline',
                    'bg-surface-1 px-3 py-2 text-body text-ink outline-none transition-colors',
                    'hover:border-hairline-strong focus-visible:border-hairline-strong focus-visible:ds-focus-ring',
                  ].join(' ')}
                >
                  <option value="asc">ASC</option>
                  <option value="desc">DESC</option>
                </select>
                <Button type="button" variant="primary" disabled={!sortKey} onClick={applySort}>
                  Sort
                </Button>
              </div>
            ) : null}
          </div>
          <div className="relative min-h-[min(36vh,220px)] flex-1 overflow-hidden rounded-lg border border-slate-700 sm:min-h-[min(40vh,280px)]">
            <JsonMonacoPane labelId="json-output-label" value={output} readOnly />
          </div>
        </div>
      </div>
    </div>
  )
}
