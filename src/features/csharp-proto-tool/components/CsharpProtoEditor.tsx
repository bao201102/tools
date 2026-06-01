import Editor from '@monaco-editor/react'
import { useCallback, useState } from 'react'
import { useLocale } from '../../../lib/i18n'
import { useAdaptiveEditorHeight } from '../../../lib/useAdaptiveEditorHeight'
import { useMonacoEditorTheme } from '../../../lib/useMonacoEditorTheme'
import { useCsharpProto } from '../hooks/useCsharpProto'
import { Button, Input } from '../../../components/ui'

const editorOptions = {
  minimap: { enabled: false },
  fontSize: 14,
  scrollBeyondLastLine: false,
  wordWrap: 'off' as const,
  padding: { top: 8, bottom: 8 },
  automaticLayout: true,
  tabSize: 2,
}

function CsharpMonacoPane({
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
        language="csharp"
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

export function CsharpProtoEditor() {
  const { t } = useLocale()
  const { input, setInput, output, startNumber, setStartNumber, clear } = useCsharpProto()
  const editorHeight = useAdaptiveEditorHeight(input, output)
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')

  const handleCopyOutput = useCallback(async () => {
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
        <p className="text-sm text-ink-muted">
          {t('tool.csharpProto.descBefore')}
          <code className="text-primary font-semibold">[ProtoMember(n)]</code>
          {t('tool.csharpProto.descAfter')}
        </p>
      </div>

      <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="flex flex-col gap-1">
          <label htmlFor="proto-start-number" className="text-xs font-medium text-ink-muted">
            {t('tool.csharpProto.startNumber')}
          </label>
          <Input
            id="proto-start-number"
            type="number"
            min={1}
            step={1}
            value={startNumber}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10)
              setStartNumber(Number.isNaN(v) ? 1 : v)
            }}
            className="w-full max-w-[8rem] sm:w-28 sm:max-w-none min-h-10 text-sm shadow-sm"
          />
        </div>
      </div>

      <div
        className="grid min-h-0 grid-cols-1 gap-4 w-full lg:grid-cols-2 lg:gap-6"
        style={{ height: editorHeight }}
      >
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <span id="csharp-proto-input-label" className="shrink-0 text-sm font-medium text-ink">
            {t('common.input')}
          </span>
          <div className="relative h-full overflow-hidden rounded-lg border border-hairline shadow-sm bg-surface-1">
            <CsharpMonacoPane
              labelId="csharp-proto-input-label"
              value={input}
              readOnly={false}
              onChange={setInput}
            />
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <div className="flex shrink-0 items-center justify-between">
            <span id="csharp-proto-output-label" className="text-sm font-medium text-ink">
              {t('common.output')}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyOutput}
              disabled={!output}
            >
              {copyState === 'copied' ? t('common.copied') + '!' : copyState === 'failed' ? t('common.failed') : t('common.copy')}
            </Button>
          </div>
          <div className="relative h-full overflow-hidden rounded-lg border border-hairline shadow-sm bg-surface-1">
            <CsharpMonacoPane labelId="csharp-proto-output-label" value={output} readOnly />
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
