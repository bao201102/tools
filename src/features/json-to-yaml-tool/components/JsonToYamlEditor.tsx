import Editor from '@monaco-editor/react'
import { useCallback, useState, type ReactNode } from 'react'
import { useLocale } from '../../../lib/i18n'
import { useMonacoEditorTheme } from '../../../lib/useMonacoEditorTheme'
import { useJsonToYaml } from '../hooks/useJsonToYaml'

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
    'rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 shadow-sm'
  const styles =
    variant === 'danger'
      ? 'border border-error-border bg-error-surface text-error-fg hover:bg-error-surface-strong'
      : 'border border-hairline bg-surface-1 text-ink hover:bg-surface-2 hover:border-hairline-strong'

  return (
    <button type="button" className={`${base} ${styles}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

function YamlMonacoPane({
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
  const { t } = useLocale()
  const editorTheme = useMonacoEditorTheme()
  return (
    <div
      className="absolute inset-0 min-h-0"
      aria-labelledby={labelId}
      aria-invalid={ariaInvalid}
    >
      <Editor
        height="100%"
        width="100%"
        language="yaml"
        theme={editorTheme}
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
          <div className="flex h-full items-center justify-center bg-surface-2 text-sm text-ink-subtle">
            {t('common.loadingEditor')}
          </div>
        }
      />
    </div>
  )
}

export function JsonToYamlEditor() {
  const { t } = useLocale()
  const { input, output, error, onInputChange, clear } = useJsonToYaml()
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')

  const handleCopy = useCallback(async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }
    window.setTimeout(() => setCopyState('idle'), 2000)
  }, [output])

  const handleLoadExample = useCallback(() => {
    const exampleJson = {
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
    onInputChange(JSON.stringify(exampleJson, null, 2))
  }, [onInputChange])

  const copyLabel =
    copyState === 'copied' ? t('common.copied') : copyState === 'failed' ? t('common.failed') : t('common.copy')

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[1300px] flex-1 flex-col gap-4 p-6 lg:p-8">
      <div className="shrink-0">
        <p className="text-sm text-ink-muted">{t('tool.yaml.desc')}</p>
      </div>

      {error ? (
        <p
          className="shrink-0 rounded-md border border-error-border bg-error-surface px-3 py-2 text-sm text-error-fg"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="grid min-h-0 h-[400px] grid-cols-1 gap-4 w-full lg:grid-cols-2 lg:gap-6">
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <div className="flex items-center justify-between">
            <span id="yaml-input-label" className="shrink-0 text-sm font-medium text-ink">
              {t('common.input')}
            </span>
            <button
              type="button"
              onClick={handleLoadExample}
              className="rounded-md border border-hairline bg-surface-1 px-3 py-1 text-xs font-medium text-primary shadow-sm transition-colors hover:bg-surface-2 hover:border-hairline-strong"
            >
              Load Example
            </button>
          </div>
          <div className="relative h-full overflow-hidden rounded-lg border border-hairline shadow-sm">
            <YamlMonacoPane
              labelId="yaml-input-label"
              value={input}
              readOnly={false}
              onChange={onInputChange}
              aria-invalid={error ? true : undefined}
            />
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <div className="flex items-center justify-between">
            <span id="yaml-output-label" className="shrink-0 text-sm font-medium text-ink">
              {t('common.output')}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!output}
              className="rounded-md border border-hairline bg-surface-1 px-3 py-1 text-xs font-medium text-ink shadow-sm transition-colors hover:bg-surface-2 hover:border-hairline-strong disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copyLabel}
            </button>
          </div>
          <div className="relative h-full overflow-hidden rounded-lg border border-hairline shadow-sm">
            <YamlMonacoPane labelId="yaml-output-label" value={output} readOnly />
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        <ToolbarButton onClick={clear} variant="danger">
          {t('common.clear')}
        </ToolbarButton>
      </div>
    </div>
  )
}
