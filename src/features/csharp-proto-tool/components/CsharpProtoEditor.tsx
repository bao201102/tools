import Editor from '@monaco-editor/react'
import { useCallback, useState, type ReactNode } from 'react'
import { useCsharpProto } from '../hooks/useCsharpProto'

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
            Loading editor…
          </div>
        }
      />
    </div>
  )
}

export function CsharpProtoEditor() {
  const { input, setInput, output, startNumber, setStartNumber, clear } = useCsharpProto()
  const [copyLabel, setCopyLabel] = useState('Copy Output')

  const handleCopyOutput = useCallback(async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopyLabel('Copied')
      window.setTimeout(() => setCopyLabel('Copy Output'), 2000)
    } catch {
      setCopyLabel('Failed')
      window.setTimeout(() => setCopyLabel('Copy Output'), 2000)
    }
  }, [output])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-6 lg:p-8">
      <div className="shrink-0">
        <h1 className="text-xl font-semibold tracking-tight text-slate-100 sm:text-2xl">
          C# ProtoMember Reindex
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Strip existing <code className="text-violet-300">[ProtoMember(n)]</code> attributes and assign
          sequential numbers starting from your chosen index. Output updates as you edit.
        </p>
      </div>

      <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="flex flex-col gap-1">
          <label htmlFor="proto-start-number" className="text-xs font-medium text-slate-400">
            Start Number
          </label>
          <input
            id="proto-start-number"
            type="number"
            min={1}
            step={1}
            value={startNumber}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10)
              setStartNumber(Number.isNaN(v) ? 1 : v)
            }}
            className="w-full max-w-[8rem] rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 sm:w-28 sm:max-w-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <ToolbarButton onClick={clear} variant="danger">
            Clear
          </ToolbarButton>
          <ToolbarButton onClick={handleCopyOutput} disabled={!output}>
            {copyLabel}
          </ToolbarButton>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <span id="csharp-proto-input-label" className="shrink-0 text-sm font-medium text-slate-300">
            Input
          </span>
          <div className="relative min-h-[min(36vh,220px)] flex-1 overflow-hidden rounded-lg border border-slate-700 sm:min-h-[min(40vh,280px)]">
            <CsharpMonacoPane
              labelId="csharp-proto-input-label"
              value={input}
              readOnly={false}
              onChange={setInput}
            />
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <span id="csharp-proto-output-label" className="shrink-0 text-sm font-medium text-slate-300">
            Output
          </span>
          <div className="relative min-h-[min(36vh,220px)] flex-1 overflow-hidden rounded-lg border border-slate-700 sm:min-h-[min(40vh,280px)]">
            <CsharpMonacoPane labelId="csharp-proto-output-label" value={output} readOnly />
          </div>
        </div>
      </div>
    </div>
  )
}
