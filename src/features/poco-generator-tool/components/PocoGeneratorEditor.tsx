import Editor from '@monaco-editor/react'
import { useLocale } from '../../../lib/i18n'
import { useAdaptiveEditorHeight } from '../../../lib/useAdaptiveEditorHeight'
import { useMonacoEditorTheme } from '../../../lib/useMonacoEditorTheme'
import { usePocoGenerator } from '../hooks/usePocoGenerator'
import { Button, Input, CopyButton } from '../../../components/ui'

const editorOptions = {
  minimap: { enabled: false },
  fontSize: 14,
  scrollBeyondLastLine: false,
  wordWrap: 'on' as const,
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
  language: 'json' | 'csharp'
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

export function PocoGeneratorEditor() {
  const { t } = useLocale()
  const { input, setInput, output, error, rootClassName, setRootClassName, clear } = usePocoGenerator()
  const editorHeight = useAdaptiveEditorHeight(input, output)

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[1300px] flex-1 flex-col gap-4 px-4 pt-4 pb-20 sm:p-6 lg:p-8">
      <div className="shrink-0">
        <p className="text-sm text-ink-muted">
          {t('tool.poco.descBefore')}
          <code className="text-primary font-semibold">[JsonPropertyName]</code>
          {t('tool.poco.descAfter')}
        </p>
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
          <label htmlFor="root-class-name" className="text-xs font-medium text-ink-muted">
            {t('tool.poco.rootClassName')}
          </label>
          <Input
            id="root-class-name"
            type="text"
            value={rootClassName}
            onChange={(event) => setRootClassName(event.target.value)}
            className="w-full max-w-xs sm:w-56 sm:max-w-none min-h-10 text-sm shadow-sm"
            placeholder={t('tool.poco.rootPlaceholder')}
          />
        </div>
      </div>

      <div
        className="grid min-h-0 shrink-0 grid-cols-1 gap-4 w-full lg:grid-cols-2 lg:gap-6"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-2" style={{ height: editorHeight }}>
          <span id="poco-input-label" className="shrink-0 text-sm font-medium text-ink">
            {t('tool.poco.inputJson')}
          </span>
          <div className="relative h-full overflow-hidden rounded-lg border border-hairline shadow-sm bg-surface-1">
            <EditorPane
              labelId="poco-input-label"
              language="json"
              value={input}
              readOnly={false}
              onChange={setInput}
              aria-invalid={error ? true : undefined}
            />
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2" style={{ height: editorHeight }}>
          <div className="flex shrink-0 items-center justify-between">
            <span id="poco-output-label" className="text-sm font-medium text-ink">
              {t('tool.poco.generatedCsharp')}
            </span>
            <CopyButton value={() => output} disabled={!output} />
          </div>
          <div className="relative h-full overflow-hidden rounded-lg border border-hairline shadow-sm bg-surface-1">
            <EditorPane labelId="poco-output-label" language="csharp" value={output} readOnly />
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        <Button onClick={clear}>
          {t('common.clear')}
        </Button>
      </div>
      <div className="h-16 w-full shrink-0 lg:hidden" aria-hidden="true" />
    </div>
  )
}
