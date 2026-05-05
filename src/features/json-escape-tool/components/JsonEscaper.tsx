import Editor from '@monaco-editor/react'
import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { ERROR_PANEL_PREFIX, useJsonEscape } from '../hooks/useJsonEscape'

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

function SwapIcon() {
  return (
    <svg
      className="h-5 w-5 text-slate-200"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  )
}

type MonacoLang = 'plaintext' | 'json'

function EscapeMonacoPane({
  labelId,
  value,
  language,
  onChange,
  onEditorFocus,
}: {
  labelId: string
  value: string
  language: MonacoLang
  onChange: (value: string) => void
  onEditorFocus?: () => void
}) {
  return (
    <div className="absolute inset-0 min-h-0" aria-labelledby={labelId}>
      <Editor
        height="100%"
        width="100%"
        language={language}
        theme={EDITOR_THEME}
        value={value}
        options={editorOptions}
        onChange={(v) => onChange(v ?? '')}
        onMount={(editor) => {
          editor.onDidFocusEditorWidget(() => {
            onEditorFocus?.()
          })
        }}
        loading={
          <div className="flex h-full items-center justify-center bg-slate-900 text-sm text-slate-400">
            Loading editor…
          </div>
        }
      />
    </div>
  )
}

export function JsonEscaper() {
  const {
    escaped,
    formatted,
    setActivePane,
    setEscapedFromUser,
    setFormattedFromUser,
    clear,
    swap,
  } = useJsonEscape()

  const [copyEscapedLabel, setCopyEscapedLabel] = useState('Copy escaped')
  const [copyFormattedLabel, setCopyFormattedLabel] = useState('Copy JSON')

  const formattedLanguage: MonacoLang = useMemo(() => {
    return formatted.startsWith(ERROR_PANEL_PREFIX) ? 'plaintext' : 'json'
  }, [formatted])

  const copyEscaped = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(escaped)
      setCopyEscapedLabel('Copied')
      window.setTimeout(() => setCopyEscapedLabel('Copy escaped'), 2000)
    } catch {
      setCopyEscapedLabel('Failed')
      window.setTimeout(() => setCopyEscapedLabel('Copy escaped'), 2000)
    }
  }, [escaped])

  const copyFormatted = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(formatted)
      setCopyFormattedLabel('Copied')
      window.setTimeout(() => setCopyFormattedLabel('Copy JSON'), 2000)
    } catch {
      setCopyFormattedLabel('Failed')
      window.setTimeout(() => setCopyFormattedLabel('Copy JSON'), 2000)
    }
  }, [formatted])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-6 lg:p-8">
      <header className="shrink-0 space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-slate-100 sm:text-2xl">
          JSON Escaper &amp; Unescaper
        </h1>
        <p className="text-sm text-slate-400">
          Bidirectional realtime sync: edits in the escaped string update formatted JSON — and vice
          versa — based on the editor you&apos;re typing in (focus/active pane).
        </p>
      </header>

      <div className="flex shrink-0 flex-wrap gap-2">
        <ToolbarButton onClick={clear} variant="danger">
          Clear
        </ToolbarButton>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[1fr_minmax(auto,72px)_1fr] lg:gap-6">
        <section className="flex min-h-0 flex-col gap-2 lg:col-start-1 lg:col-end-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span id="json-escaped-label" className="text-sm font-medium text-slate-300">
              Escaped string
            </span>
            <ToolbarButton onClick={copyEscaped} disabled={!escaped}>
              {copyEscapedLabel}
            </ToolbarButton>
          </div>
          <div className="relative min-h-[min(36vh,220px)] flex-1 overflow-hidden rounded-lg border border-slate-700 sm:min-h-[min(40vh,280px)]">
            <EscapeMonacoPane
              labelId="json-escaped-label"
              value={escaped}
              language="plaintext"
              onChange={setEscapedFromUser}
              onEditorFocus={() => setActivePane('escaped')}
            />
          </div>
        </section>

        <div className="flex shrink-0 items-center justify-center py-2 lg:col-start-2 lg:col-end-3 lg:flex-col lg:self-stretch lg:justify-center lg:py-0">
          <button
            type="button"
            onClick={swap}
            className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-700 lg:w-full lg:justify-center"
            aria-label="Swap escaped string and formatted JSON"
          >
            <SwapIcon />
            <span className="hidden sm:inline">Swap</span>
          </button>
        </div>

        <section className="flex min-h-0 flex-col gap-2 lg:col-start-3 lg:col-end-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span id="json-formatted-label" className="text-sm font-medium text-slate-300">
              Formatted JSON
            </span>
            <ToolbarButton onClick={copyFormatted} disabled={!formatted}>
              {copyFormattedLabel}
            </ToolbarButton>
          </div>
          <div className="relative min-h-[min(36vh,220px)] flex-1 overflow-hidden rounded-lg border border-slate-700 sm:min-h-[min(40vh,280px)]">
            <EscapeMonacoPane
              labelId="json-formatted-label"
              value={formatted}
              language={formattedLanguage}
              onChange={setFormattedFromUser}
              onEditorFocus={() => setActivePane('formatted')}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
