import Editor from '@monaco-editor/react'
import { useLocale } from '../../../lib/i18n'
import { useAdaptiveEditorHeight } from '../../../lib/useAdaptiveEditorHeight'
import { useMonacoEditorTheme } from '../../../lib/useMonacoEditorTheme'
import { useCsharpProtoRemove } from '../hooks/useCsharpProtoRemove'
import { Button, CopyButton } from '../../../components/ui'

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

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[1300px] flex-1 flex-col gap-4 px-4 pt-4 pb-20 sm:p-6 lg:p-8">
      <div className="shrink-0">
        <p className="text-sm text-ink-muted">
          {t('tool.csharpProtoRemove.descBefore')}
          <code className="text-primary font-semibold">[ProtoMember(n)]</code>
          {t('tool.csharpProtoRemove.descAfter')}
        </p>
      </div>

      <div
        className="grid min-h-0 shrink-0 grid-cols-1 gap-4 w-full lg:grid-cols-2 lg:gap-6"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-2" style={{ height: editorHeight }}>
          <span id="csharp-proto-remove-input-label" className="shrink-0 text-sm font-medium text-ink">
            {t('common.input')}
          </span>
          <div className="relative h-full overflow-hidden rounded-lg border border-hairline shadow-sm bg-surface-1">
            <CsharpMonacoPane
              labelId="csharp-proto-remove-input-label"
              value={input}
              readOnly={false}
              onChange={setInput}
            />
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-2" style={{ height: editorHeight }}>
          <div className="flex shrink-0 items-center justify-between">
            <span id="csharp-proto-remove-output-label" className="text-sm font-medium text-ink">
              {t('common.output')}
            </span>
            <CopyButton value={() => output} disabled={!output} />
          </div>
          <div className="relative h-full overflow-hidden rounded-lg border border-hairline shadow-sm bg-surface-1">
            <CsharpMonacoPane labelId="csharp-proto-remove-output-label" value={output} readOnly />
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
