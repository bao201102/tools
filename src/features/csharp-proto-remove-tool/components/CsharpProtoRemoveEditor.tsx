import Editor from '@monaco-editor/react'
import { useCallback, useState, type ReactNode } from 'react'
import { useLocale } from '../../../lib/i18n'
import { useAdaptiveEditorHeight } from '../../../lib/useAdaptiveEditorHeight'
import { useMonacoEditorTheme } from '../../../lib/useMonacoEditorTheme'
import { useCsharpProtoRemove } from '../hooks/useCsharpProtoRemove'
import { Button } from '../../../components/ui'

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

export function CsharpProtoRemoveEditor() {
  const { t } = useLocale()
  const { input, setInput, output, clear } = useCsharpProtoRemove()
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

  const copyLabel =
    copyState === 'copied'
      ? t('common.copied')
      : copyState === 'failed'
        ? t('common.failed')
        : t('tool.csharpProtoRemove.copyOutput')

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[1300px] flex-1 flex-col gap-4 p-6 lg:p-8">
      <div className="shrink-0">
        <p className="text-sm text-ink-muted">
          {t('tool.csharpProtoRemove.descBefore')}
          <code className="text-primary font-semibold">[ProtoMember(n)]</code>
          {t('tool.csharpProtoRemove.descAfter')}
        </p>
      </div>

      <div
        className="grid min-h-0 grid-cols-1 gap-4 w-full lg:grid-cols-2 lg:gap-6"
        style={{ height: editorHeight }}
      >
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <span id="csharp-proto-remove-input-label" className="shrink-0 text-sm font-medium text-ink">
            {t('common.input')}
          </span>
          <div className="relative h-full overflow-hidden rounded-lg border border-hairline shadow-sm">
            <CsharpMonacoPane
              labelId="csharp-proto-remove-input-label"
              value={input}
              readOnly={false}
              onChange={setInput}
            />
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <span id="csharp-proto-remove-output-label" className="shrink-0 text-sm font-medium text-ink">
            {t('common.output')}
          </span>
          <div className="relative h-full overflow-hidden rounded-lg border border-hairline shadow-sm">
            <CsharpMonacoPane labelId="csharp-proto-remove-output-label" value={output} readOnly />
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        <Button onClick={clear}>
          {t('common.clear')}
        </Button>
        <Button onClick={handleCopyOutput} disabled={!output}>
          {copyLabel}
        </Button>
      </div>
    </div>
  )
}
