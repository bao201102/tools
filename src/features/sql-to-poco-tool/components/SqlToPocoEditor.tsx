import Editor from '@monaco-editor/react'
import { useCallback, useState } from 'react'
import { useLocale } from '../../../lib/i18n'
import { useAdaptiveEditorHeight } from '../../../lib/useAdaptiveEditorHeight'
import { useMonacoEditorTheme } from '../../../lib/useMonacoEditorTheme'
import { useSqlToPoco } from '../hooks/useSqlToPoco'
import { Button, Input } from '../../../components/ui'

const editorOptions = {
  minimap: { enabled: false },
  fontSize: 14,
  scrollBeyondLastLine: false,
  wordWrap: 'off' as const,
  padding: { top: 8, bottom: 8 },
  automaticLayout: true,
  tabSize: 2,
  fixedOverflowWidgets: true,
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
  const { t } = useLocale()
  const editorTheme = useMonacoEditorTheme()
  return (
    <div className="absolute inset-0 min-h-0" aria-labelledby={labelId} aria-invalid={ariaInvalid}>
      <Editor
        height="100%"
        width="100%"
        language={language}
        theme={editorTheme}
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
          <div className="flex h-full items-center justify-center bg-surface-2 text-sm text-ink-subtle">
            {t('common.loadingEditor')}
          </div>
        }
      />
    </div>
  )
}

export function SqlToPocoEditor() {
  const { t } = useLocale()
  const { input, setInput, output, error, className, setClassName, clear } = useSqlToPoco()
  const editorHeight = useAdaptiveEditorHeight(input, output)
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

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[1300px] flex-1 flex-col gap-4 p-6 lg:p-8">
      <div className="shrink-0">
        <p className="text-sm text-ink-muted">{t('tool.sqlPoco.desc')}</p>
      </div>

      {error ? (
        <p
          className="shrink-0 rounded-md border border-error-border bg-error-surface px-3 py-2 text-sm text-error-fg"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="flex flex-col gap-1">
          <label htmlFor="sql-poco-class-name" className="text-xs font-medium text-ink-muted">
            {t('tool.sqlPoco.classOverride')}
          </label>
          <Input
            id="sql-poco-class-name"
            type="text"
            value={className}
            onChange={(event) => setClassName(event.target.value)}
            className="w-full max-w-xs sm:w-56 sm:max-w-none min-h-10 text-sm shadow-sm"
            placeholder={t('tool.sqlPoco.classPlaceholder')}
          />
        </div>
      </div>

      <div
        className="grid min-h-0 grid-cols-1 gap-4 w-full lg:grid-cols-2 lg:gap-6"
        style={{ height: editorHeight }}
      >
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <span id="sql-input-label" className="shrink-0 text-sm font-medium text-ink">
            {t('tool.sqlPoco.inputSql')}
          </span>
          <div className="relative h-full overflow-hidden rounded-lg border border-hairline shadow-sm bg-surface-1">
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
          <div className="flex shrink-0 items-center justify-between">
            <span id="sql-output-label" className="text-sm font-medium text-ink">
              {t('tool.sqlPoco.generatedCsharp')}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopy}
              disabled={!output}
            >
              {copyState === 'copied' ? t('common.copied') + '!' : copyState === 'failed' ? t('common.failed') : t('common.copy')}
            </Button>
          </div>
          <div className="relative h-full overflow-hidden rounded-lg border border-hairline shadow-sm bg-surface-1">
            <EditorPane labelId="sql-output-label" language="csharp" value={output} readOnly />
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        <Button onClick={clear}>
          {t('common.clear')}
        </Button>
      </div>
    </div>
  )
}
