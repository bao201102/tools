import Editor from '@monaco-editor/react'
import { useCallback, useState, type ReactNode } from 'react'
import { useLocale } from '../../../lib/i18n'
import { useAdaptiveEditorHeight } from '../../../lib/useAdaptiveEditorHeight'
import { useMonacoEditorTheme } from '../../../lib/useMonacoEditorTheme'
import { useTextEscape } from '../hooks/useTextEscape'

const editorOptions = {
  minimap: { enabled: false },
  fontSize: 14,
  scrollBeyondLastLine: false,
  wordWrap: 'on' as const,
  padding: { top: 12, bottom: 12 },
  automaticLayout: true,
  lineNumbers: 'on' as const,
}

const ESCAPE_REFERENCE = [
  { seq: '\\"', labelKey: 'tool.jsonEscape.ref.quote' as const },
  { seq: '\\\\', labelKey: 'tool.jsonEscape.ref.backslash' as const },
  { seq: '\\n', labelKey: 'tool.jsonEscape.ref.newline' as const },
  { seq: '\\t', labelKey: 'tool.jsonEscape.ref.tab' as const },
  { seq: '\\r', labelKey: 'tool.jsonEscape.ref.cr' as const },
  { seq: '\\b', labelKey: 'tool.jsonEscape.ref.backspace' as const },
]

function CopyIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  )
}

function IconCopyButton({
  onClick,
  disabled,
  label,
}: {
  onClick: () => void
  disabled?: boolean
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-hairline bg-surface-1 text-ink-subtle transition-colors hover:bg-surface-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
    >
      <CopyIcon />
    </button>
  )
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
  variant?: 'default' | 'danger' | 'primary'
}) {
  const base =
    'rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 shadow-sm'
  const styles =
    variant === 'danger'
      ? 'border border-error-border bg-error-surface text-error-fg hover:bg-error-surface-strong'
      : variant === 'primary'
        ? 'border border-transparent bg-[var(--ds-color-brand-secure)] text-white hover:opacity-90'
        : 'border border-hairline bg-surface-1 text-ink hover:bg-surface-2 hover:border-hairline-strong'

  return (
    <button type="button" className={`${base} ${styles}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

function EscapeMonacoPane({
  labelId,
  value,
  readOnly,
  onChange,
}: {
  labelId: string
  value: string
  readOnly: boolean
  onChange?: (value: string) => void
}) {
  const { t } = useLocale()
  const editorTheme = useMonacoEditorTheme()
  return (
    <div className="absolute inset-0 min-h-0" aria-labelledby={labelId}>
      <Editor
        height="100%"
        width="100%"
        language="plaintext"
        theme={editorTheme}
        value={value}
        options={{ ...editorOptions, readOnly }}
        onChange={readOnly ? undefined : (v) => onChange?.(v ?? '')}
        loading={
          <div className="flex h-full items-center justify-center bg-surface-2 text-sm text-ink-subtle">
            {t('common.loadingEditor')}
          </div>
        }
      />
    </div>
  )
}

export function JsonEscapeEditor() {
  const { t } = useLocale()
  const {
    input,
    setInput,
    output,
    wrapInQuotes,
    setWrapInQuotes,
    escapeUnicode,
    setEscapeUnicode,
    stats,
    escape,
    clear,
  } = useTextEscape()

  const editorHeight = useAdaptiveEditorHeight(input, output)
  const [copyInputState, setCopyInputState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const [copyOutputState, setCopyOutputState] = useState<'idle' | 'copied' | 'failed'>('idle')

  const charCount = input.length

  const copyText = useCallback(async (text: string, setState: (s: 'idle' | 'copied' | 'failed') => void) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setState('copied')
    } catch {
      setState('failed')
    }
    window.setTimeout(() => setState('idle'), 2000)
  }, [])

  const copyInputLabel =
    copyInputState === 'copied'
      ? t('common.copied')
      : copyInputState === 'failed'
        ? t('common.failed')
        : t('common.copy')

  const copyOutputLabel =
    copyOutputState === 'copied'
      ? t('common.copied')
      : copyOutputState === 'failed'
        ? t('common.failed')
        : t('tool.jsonEscape.copyOutput')

  const statsText =
    stats &&
    t('tool.jsonEscape.stats', {
      quotes: stats.quotes,
      newlines: stats.newlines,
      tabs: stats.tabs,
      backslashes: stats.backslashes,
    })

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[1300px] flex-1 flex-col gap-4 p-6 lg:p-8">
      <div className="shrink-0">
        <p className="text-sm text-ink-muted">{t('tool.jsonEscape.desc')}</p>
      </div>

      <div
        className="grid min-h-0 grid-cols-1 gap-4 w-full lg:grid-cols-2 lg:gap-6"
        style={{ height: editorHeight }}
      >
        <section className="flex min-h-0 flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-baseline gap-2">
              <span id="json-escape-input-label" className="text-sm font-medium text-ink">
                {t('tool.jsonEscape.input')}
              </span>
              <span className="text-xs text-ink-subtle">
                {t('tool.jsonEscape.charCount', { count: charCount })}
              </span>
            </div>
            <IconCopyButton
              onClick={() => copyText(input, setCopyInputState)}
              disabled={!input}
              label={copyInputLabel}
            />
          </div>
          <div className="relative h-full overflow-hidden rounded-lg border border-hairline shadow-sm">
            <EscapeMonacoPane
              labelId="json-escape-input-label"
              value={input}
              readOnly={false}
              onChange={setInput}
            />
          </div>
        </section>

        <section className="flex min-h-0 flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span id="json-escape-output-label" className="text-sm font-medium text-ink">
              {t('tool.jsonEscape.output')}
            </span>
            <ToolbarButton onClick={() => copyText(output, setCopyOutputState)} disabled={!output}>
              {copyOutputLabel}
            </ToolbarButton>
          </div>
          <div className="relative h-full overflow-hidden rounded-lg border border-hairline shadow-sm">
            <EscapeMonacoPane labelId="json-escape-output-label" value={output} readOnly />
          </div>
        </section>
      </div>

      <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={wrapInQuotes}
            onChange={(e) => setWrapInQuotes(e.target.checked)}
            className="h-4 w-4 rounded border-hairline text-primary focus:ring-primary/30"
          />
          {t('tool.jsonEscape.wrapInQuotes')}
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={escapeUnicode}
            onChange={(e) => setEscapeUnicode(e.target.checked)}
            className="h-4 w-4 rounded border-hairline text-primary focus:ring-primary/30"
          />
          {t('tool.jsonEscape.escapeUnicode')}
        </label>
        <div className="flex flex-wrap gap-2 sm:ml-auto">
          <ToolbarButton onClick={escape} disabled={!input} variant="primary">
            {t('tool.jsonEscape.escapeButton')}
          </ToolbarButton>
          <ToolbarButton onClick={clear} variant="danger">
            {t('common.clear')}
          </ToolbarButton>
        </div>
      </div>

      {statsText ? (
        <p className="shrink-0 rounded-md border border-hairline bg-surface-2 px-4 py-3 text-sm text-ink-muted">
          {statsText}
        </p>
      ) : null}

      <section className="shrink-0">
        <h2 className="mb-3 text-sm font-semibold text-ink">{t('tool.jsonEscape.referenceTitle')}</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {ESCAPE_REFERENCE.map((item) => (
            <div
              key={item.seq}
              className="rounded-lg border border-hairline bg-surface-2 px-3 py-3 text-center"
            >
              <code className="text-sm font-semibold text-[var(--ds-color-brand-secure)]">{item.seq}</code>
              <p className="mt-1 text-xs text-ink-subtle">{t(item.labelKey)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
