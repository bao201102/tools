import Editor from '@monaco-editor/react'
import { useCallback, useMemo, useState } from 'react'
import { useLocale, type TranslationKey } from '../../../lib/i18n'
import { useAdaptiveEditorHeight } from '../../../lib/useAdaptiveEditorHeight'
import { useMonacoEditorTheme } from '../../../lib/useMonacoEditorTheme'
import { ERROR_PANEL_PREFIX } from '../constants'
import { Button } from '../../../components/ui'

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

type MonacoLang = 'plaintext' | 'json'

function MonacoPane({
  labelId,
  value,
  language,
  readOnly,
  onChange,
}: {
  labelId: string
  value: string
  language: MonacoLang
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
        language={language}
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

export type JsonStringToolEditorProps = {
  descKey: TranslationKey
  inputLabelKey: TranslationKey
  outputLabelKey: TranslationKey
  copyOutputKey: TranslationKey
  outputPlaceholderKey?: TranslationKey
  input: string
  output: string
  onInputChange: (value: string) => void
  onClear: () => void
  inputLanguage: MonacoLang
  outputLanguage: MonacoLang
}

export function JsonStringToolEditor({
  descKey,
  inputLabelKey,
  outputLabelKey,
  copyOutputKey,
  outputPlaceholderKey,
  input,
  output,
  onInputChange,
  onClear,
  inputLanguage,
  outputLanguage,
}: JsonStringToolEditorProps) {
  const { t } = useLocale()
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const editorHeight = useAdaptiveEditorHeight(input, output)

  const resolvedOutputLanguage: MonacoLang = useMemo(() => {
    if (output.startsWith(ERROR_PANEL_PREFIX)) return 'plaintext'
    return outputLanguage
  }, [output, outputLanguage])

  const copyOutput = useCallback(async () => {
    if (!output || output.startsWith(ERROR_PANEL_PREFIX)) return
    try {
      await navigator.clipboard.writeText(output)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }
    window.setTimeout(() => setCopyState('idle'), 2000)
  }, [output])

  const copyLabel =
    copyState === 'copied'
      ? t('common.copied')
      : copyState === 'failed'
        ? t('common.failed')
        : t(copyOutputKey)

  const outputPlaceholder = outputPlaceholderKey ? t(outputPlaceholderKey) : undefined
  const showOutputEditor = Boolean(output) || !outputPlaceholder

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[1300px] flex-1 flex-col gap-4 p-6 lg:p-8">
      <div className="shrink-0">
        <p className="text-sm text-ink-muted">{t(descKey)}</p>
      </div>

      <div
        className="grid min-h-0 grid-cols-1 gap-4 w-full lg:grid-cols-2 lg:gap-6"
        style={{ height: editorHeight }}
      >
        <section className="flex min-h-0 flex-col gap-2">
          <span id="json-tool-input-label" className="text-sm font-medium text-ink">
            {t(inputLabelKey)}
          </span>
          <div className="relative h-full overflow-hidden rounded-lg border border-hairline shadow-sm">
            <MonacoPane
              labelId="json-tool-input-label"
              value={input}
              language={inputLanguage}
              readOnly={false}
              onChange={onInputChange}
            />
          </div>
        </section>

        <section className="flex min-h-0 flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span id="json-tool-output-label" className="text-sm font-medium text-ink">
              {t(outputLabelKey)}
            </span>
            <Button onClick={copyOutput} disabled={!output || output.startsWith(ERROR_PANEL_PREFIX)} size="sm">
              {copyLabel}
            </Button>
          </div>
          <div className="relative h-full overflow-hidden rounded-lg border border-hairline shadow-sm">
            {showOutputEditor ? (
              <MonacoPane
                labelId="json-tool-output-label"
                value={output}
                language={resolvedOutputLanguage}
                readOnly
              />
            ) : (
              <div
                className="flex h-full items-center justify-center bg-surface-2 p-4 text-center text-sm text-ink-subtle"
                aria-labelledby="json-tool-output-label"
              >
                {outputPlaceholder}
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        <Button onClick={onClear}>
          {t('common.clear')}
        </Button>
      </div>
    </div>
  )
}
