import Editor from '@monaco-editor/react'
import { useCallback, useState, type ReactNode } from 'react'
import { useSqlToPoco } from '../hooks/useSqlToPoco'

const EDITOR_THEME = 'vs-dark'

const editorOptions = {
  minimap: { enabled: false },
  fontSize: 14,
  scrollBeyondLastLine: false,
  wordWrap: 'off' as const,
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

function EditorPane({
  labelId,
  language,
  value,
  readOnly,
  onChange,
  'aria-invalid': ariaInvalid,
}: {
  labelId: string
  language: 'sql' | 'csharp'
  value: string
  readOnly: boolean
  onChange?: (value: string) => void
  'aria-invalid'?: boolean
}) {
  return (
    <div className="absolute inset-0 min-h-0" aria-labelledby={labelId} aria-invalid={ariaInvalid}>
      <Editor
        height="100%"
        width="100%"
        language={language}
        theme={EDITOR_THEME}
        value={value}
        options={{
          ...editorOptions,
          readOnly,
          ...(readOnly
            ? {
                readOnly: true,
                fixedOverflowWidgets: true,
                wordWrap: 'off' as const,
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

export function SqlToPocoEditor() {
  const { input, setInput, output, error, className, setClassName, clear } = useSqlToPoco()
  const [copyLabel, setCopyLabel] = useState('Copy C# Code')

  const handleCopy = useCallback(async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopyLabel('Copied')
      window.setTimeout(() => setCopyLabel('Copy C# Code'), 2000)
    } catch {
      setCopyLabel('Failed')
      window.setTimeout(() => setCopyLabel('Copy C# Code'), 2000)
    }
  }, [output])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-6 lg:p-8">
      <div className="shrink-0">
        <h1 className="text-xl font-semibold tracking-tight text-slate-100 sm:text-2xl">
          SQL Table to C# POCO Generator
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Parse CREATE TABLE scripts (SQL Server/PostgreSQL) and generate nullable-safe C# POCO
          properties.
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

      <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="flex flex-col gap-1">
          <label htmlFor="sql-poco-class-name" className="text-xs font-medium text-slate-400">
            Class Name Override
          </label>
          <input
            id="sql-poco-class-name"
            type="text"
            value={className}
            onChange={(event) => setClassName(event.target.value)}
            className="w-full max-w-xs rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 sm:w-56 sm:max-w-none"
            placeholder="(Optional) Generated from table name"
          />
        </div>

        <div className="flex flex-wrap gap-2 sm:ml-auto">
          <ToolbarButton onClick={clear} variant="danger">
            Clear
          </ToolbarButton>
          <ToolbarButton onClick={handleCopy} disabled={!output}>
            {copyLabel}
          </ToolbarButton>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <span id="sql-input-label" className="shrink-0 text-sm font-medium text-slate-300">
            Input SQL (CREATE TABLE)
          </span>
          <div className="relative min-h-[min(36vh,220px)] flex-1 overflow-hidden rounded-lg border border-slate-700 sm:min-h-[min(40vh,280px)]">
            <EditorPane
              labelId="sql-input-label"
              language="sql"
              value={input}
              readOnly={false}
              onChange={setInput}
              aria-invalid={error ? true : undefined}
            />
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <span id="sql-output-label" className="shrink-0 text-sm font-medium text-slate-300">
            Generated C#
          </span>
          <div className="relative min-h-[min(36vh,220px)] flex-1 overflow-hidden rounded-lg border border-slate-700 sm:min-h-[min(40vh,280px)]">
            <EditorPane labelId="sql-output-label" language="csharp" value={output} readOnly />
          </div>
        </div>
      </div>
    </div>
  )
}
