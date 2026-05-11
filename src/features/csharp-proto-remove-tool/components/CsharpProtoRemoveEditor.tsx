import Editor from '@monaco-editor/react'
import { useCallback, useState, type ReactNode } from 'react'
import { useLocale } from '../../../lib/i18n'
import { useCsharpProtoRemove } from '../hooks/useCsharpProtoRemove'

const EDITOR_THEME = 'vs-dark'

const editorOptions = {
  minimap: { enabled: false },
  fontSize: 14,
  scrollBeyondLastLine: false,
  wordWrap: 'off' as const,
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
    'rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50'
  const styles =
    variant === 'danger'
      ? 'border border-red-900/60 bg-red-950/40 text-red-200 hover:bg-red-950/70'
      : 'border border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700'

  return (
    <button type="button" className={`${base} ${styles}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
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
  return (
    <div className="absolute inset-0 min-h-0" aria-labelledby={labelId}>
      <Editor
        height="100%"
        width="100%"
        language="csharp"
        theme={EDITOR_THEME}
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
          <div className="flex h-full items-center justify-center bg-slate-900 text-sm text-slate-400">
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
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-6 lg:p-8">
      <div className="shrink-0">
        <h1 className="text-xl font-semibold tracking-tight text-slate-100 sm:text-2xl">
          {t('tool.csharpProtoRemove.title')}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {t('tool.csharpProtoRemove.descBefore')}
          <code className="text-violet-300">[ProtoMember(n)]</code>
          {t('tool.csharpProtoRemove.descAfter')}
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        <ToolbarButton onClick={clear} variant="danger">
          {t('common.clear')}
        </ToolbarButton>
        <ToolbarButton onClick={handleCopyOutput} disabled={!output}>
          {copyLabel}
        </ToolbarButton>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <span id="csharp-proto-remove-input-label" className="shrink-0 text-sm font-medium text-slate-300">
            {t('common.input')}
          </span>
          <div className="relative min-h-[min(36vh,220px)] flex-1 overflow-hidden rounded-lg border border-slate-700 sm:min-h-[min(40vh,280px)]">
            <CsharpMonacoPane
              labelId="csharp-proto-remove-input-label"
              value={input}
              readOnly={false}
              onChange={setInput}
            />
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <span id="csharp-proto-remove-output-label" className="shrink-0 text-sm font-medium text-slate-300">
            {t('common.output')}
          </span>
          <div className="relative min-h-[min(36vh,220px)] flex-1 overflow-hidden rounded-lg border border-slate-700 sm:min-h-[min(40vh,280px)]">
            <CsharpMonacoPane labelId="csharp-proto-remove-output-label" value={output} readOnly />
          </div>
        </div>
      </div>
    </div>
  )
}
