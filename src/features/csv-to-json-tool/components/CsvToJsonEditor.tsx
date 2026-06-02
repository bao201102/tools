import Editor from '@monaco-editor/react'
import { useCallback, useState } from 'react'
import { useLocale } from '../../../lib/i18n'
import { useAdaptiveEditorHeight } from '../../../lib/useAdaptiveEditorHeight'
import { useMonacoEditorTheme } from '../../../lib/useMonacoEditorTheme'
import { useCsvToJson } from '../hooks/useCsvToJson'
import { Button } from '../../../components/ui'

const editorOptions = {
  minimap: { enabled: false },
  fontSize: 14,
  scrollBeyondLastLine: false,
  wordWrap: 'on' as const,
  padding: { top: 8, bottom: 8 },
  automaticLayout: true,
  tabSize: 2,
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

export function CsvToJsonEditor() {
  const { t } = useLocale()
  const {
    input,
    output,
    error,
    delimiter,
    firstRowIsHeaders,
    onInputChange,
    onDelimiterChange,
    onFirstRowIsHeadersChange,
    clear,
  } = useCsvToJson()

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

  const handleDownload = useCallback(() => {
    if (!output) return
    const blob = new Blob([output], { type: 'application/json;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'converted.json')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [output])

  const handleLoadExample = useCallback(() => {
    const exampleCsv = [
      'name,email,age',
      'Alice,alice@example.com,30',
      'Bob,bob@example.com,25',
      'Charlie,charlie@example.com,35'
    ].join('\n')
    onInputChange(exampleCsv)
  }, [onInputChange])

  const copyLabel =
    copyState === 'copied' ? t('common.copied') : copyState === 'failed' ? t('common.failed') : t('common.copy')

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[1300px] flex-1 flex-col gap-4 p-6 lg:p-8">
      <div className="shrink-0">
        <p className="text-sm text-ink-muted">{t('tool.csvToJson.desc')}</p>
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
            checked={firstRowIsHeaders}
            onChange={(e) => onFirstRowIsHeadersChange(e.target.checked)}
            className="h-4 w-4 rounded border-hairline text-primary focus:ring-primary/30 cursor-pointer"
          />
          First row is headers
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
        className="grid min-h-0 grid-cols-1 gap-4 w-full lg:grid-cols-2 lg:gap-6"
        style={{ height: editorHeight }}
      >
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <div className="flex items-center justify-between">
            <span id="csv-input-label" className="shrink-0 text-sm font-medium text-ink">
              CSV Input
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
              labelId="csv-input-label"
              language="plaintext"
              value={input}
              readOnly={false}
              onChange={onInputChange}
              aria-invalid={error ? true : undefined}
            />
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <div className="flex items-center justify-between">
            <span id="json-output-label" className="shrink-0 text-sm font-medium text-ink">
              JSON Output
            </span>
            <div className="flex gap-2">
              <Button
                onClick={handleCopy}
                disabled={!output}
                size="sm"
              >
                {copyLabel}
              </Button>
              <Button
                onClick={handleDownload}
                disabled={!output}
                size="sm"
              >
                Download
              </Button>
            </div>
          </div>
          <div className="relative h-full overflow-hidden rounded-lg border border-hairline shadow-sm bg-surface-1">
            {output ? (
              <MonacoPane labelId="json-output-label" language="json" value={output} readOnly />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-ink-muted">
                JSON output will appear here...
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
    </div>
  )
}
