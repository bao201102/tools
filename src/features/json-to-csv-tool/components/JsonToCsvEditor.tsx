import Editor from '@monaco-editor/react'
import { useCallback } from 'react'
import { useLocale } from '../../../lib/i18n'
import { useAdaptiveEditorHeight } from '../../../lib/useAdaptiveEditorHeight'
import { useMonacoEditorTheme } from '../../../lib/useMonacoEditorTheme'
import { useJsonToCsv } from '../hooks/useJsonToCsv'
import { Button, CopyButton } from '../../../components/ui'

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

function MonacoPane({
  labelId,
  language,
  value,
  readOnly,
  onChange,
  'aria-invalid': ariaInvalid,
}: {
  labelId: string
  language: string
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

export function JsonToCsvEditor() {
  const { t } = useLocale()
  const {
    input,
    output,
    error,
    delimiter,
    includeHeaders,
    onInputChange,
    onDelimiterChange,
    onIncludeHeadersChange,
    clear,
  } = useJsonToCsv()
  
  const editorHeight = useAdaptiveEditorHeight(input, output)
  const handleDownload = useCallback(() => {
    if (!output) return
    const blob = new Blob([output], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'converted.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [output])

  const handleLoadExample = useCallback(() => {
    const exampleJson = [
      { name: "Alice", email: "alice@example.com", age: 30 },
      { name: "Bob", email: "bob@example.com", age: 25 },
      { name: "Charlie", email: "charlie@example.com", age: 35 }
    ]
    onInputChange(JSON.stringify(exampleJson, null, 2))
  }, [onInputChange])


  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[1300px] flex-1 flex-col gap-4 px-4 pt-4 pb-20 sm:p-6 lg:p-8">
      <div className="shrink-0">
        <p className="text-sm text-ink-muted">{t('tool.jsonToCsv.desc')}</p>
      </div>

      {/* Control bar */}
      <div className="flex shrink-0 flex-wrap items-center gap-6 rounded-lg border border-hairline bg-surface-2 p-3 px-4 text-sm text-ink">
        <div className="flex items-center gap-2">
          <label htmlFor="delimiter-select" className="font-medium text-ink-muted">
            Delimiter:
          </label>
          <select
            id="delimiter-select"
            value={delimiter}
            onChange={(e) => onDelimiterChange(e.target.value)}
            className="rounded border border-hairline bg-surface-1 px-2.5 py-1 text-sm text-ink outline-none focus-visible:ds-focus-ring cursor-pointer"
          >
            <option value=",">Comma (,)</option>
            <option value=";">Semicolon (;)</option>
            <option value="&#9;">Tab (\t)</option>
            <option value="|">Pipe (|)</option>
          </select>
        </div>

        <label className="flex cursor-pointer items-center gap-2 font-medium">
          <input
            type="checkbox"
            checked={includeHeaders}
            onChange={(e) => onIncludeHeadersChange(e.target.checked)}
            className="h-4 w-4 rounded border-hairline text-primary focus:ring-primary/30 cursor-pointer"
          />
          Include headers
        </label>
      </div>

      {error ? (
        <p
          className="shrink-0 rounded-md border border-error-border bg-error-surface px-3 py-2 text-sm text-error-fg"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div
        className="grid min-h-0 shrink-0 grid-cols-1 gap-4 w-full lg:grid-cols-2 lg:gap-6"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-2" style={{ height: editorHeight }}>
          <div className="flex items-center justify-between">
            <span id="json-input-label" className="shrink-0 text-sm font-medium text-ink">
              JSON Input
            </span>
            <Button
              onClick={handleLoadExample}
              size="sm"
              className="text-primary hover:text-primary-hover"
            >
              {t('tool.json.loadSample')}
            </Button>
          </div>
          <div className="relative h-full overflow-hidden rounded-lg border border-hairline shadow-sm">
            <MonacoPane
              labelId="json-input-label"
              language="json"
              value={input}
              readOnly={false}
              onChange={onInputChange}
              aria-invalid={error ? true : undefined}
            />
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-2" style={{ height: editorHeight }}>
          <div className="flex items-center justify-between">
            <span id="csv-output-label" className="shrink-0 text-sm font-medium text-ink">
              {t('common.csvOutput')}
            </span>
            <div className="flex gap-2">
              <CopyButton value={() => output} disabled={!output} />
              <Button
                onClick={handleDownload}
                disabled={!output}
                size="sm"
              >
                {t('common.download')}
              </Button>
            </div>
          </div>
          <div className="relative h-full overflow-hidden rounded-lg border border-hairline shadow-sm bg-surface-1">
            {output ? (
              <MonacoPane labelId="csv-output-label" language="plaintext" value={output} readOnly />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-ink-muted">
                CSV output will appear here...
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        <Button onClick={clear}>
          Clear
        </Button>
      </div>
      <div className="h-16 w-full shrink-0 lg:hidden" aria-hidden="true" />
    </div>
  )
}
