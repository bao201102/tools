import { useCallback, useState, type ReactNode } from 'react'
import { useJwtDecoder } from '../hooks/useJwtDecoder'

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

type OutputPaneProps = {
  id: string
  label: string
  value: string
  copyLabel: string
  onCopy: () => void
}

function OutputPane({ id, label, value, copyLabel, onCopy }: OutputPaneProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-slate-300">
          {label}
        </label>
        <ToolbarButton onClick={onCopy} disabled={!value}>
          {copyLabel}
        </ToolbarButton>
      </div>
      <textarea
        id={id}
        readOnly
        value={value}
        spellCheck={false}
        className="min-h-[240px] w-full flex-1 resize-y rounded-lg border border-slate-700 bg-slate-950/80 p-4 font-mono text-sm leading-relaxed text-slate-200 focus:outline-none"
        placeholder={`${label} JSON appears here`}
      />
    </div>
  )
}

export function JwtDecoderEditor() {
  const { input, setInput, headerOutput, payloadOutput, error, clear } = useJwtDecoder()
  const [copyHeaderLabel, setCopyHeaderLabel] = useState('Copy Header')
  const [copyPayloadLabel, setCopyPayloadLabel] = useState('Copy Payload')

  const handleCopyHeader = useCallback(async () => {
    if (!headerOutput) return
    try {
      await navigator.clipboard.writeText(headerOutput)
      setCopyHeaderLabel('Copied')
      window.setTimeout(() => setCopyHeaderLabel('Copy Header'), 2000)
    } catch {
      setCopyHeaderLabel('Failed')
      window.setTimeout(() => setCopyHeaderLabel('Copy Header'), 2000)
    }
  }, [headerOutput])

  const handleCopyPayload = useCallback(async () => {
    if (!payloadOutput) return
    try {
      await navigator.clipboard.writeText(payloadOutput)
      setCopyPayloadLabel('Copied')
      window.setTimeout(() => setCopyPayloadLabel('Copy Payload'), 2000)
    } catch {
      setCopyPayloadLabel('Failed')
      window.setTimeout(() => setCopyPayloadLabel('Copy Payload'), 2000)
    }
  }, [payloadOutput])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 sm:p-6 lg:p-8">
      <div className="shrink-0">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-100">JWT Decoder</h1>
        <p className="mt-1 text-sm text-slate-400">
          Decode JWT header and payload locally in your browser.
        </p>
      </div>

      {error ? (
        <p
          className="shrink-0 rounded-md border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-300"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="flex shrink-0 flex-wrap gap-2">
        <ToolbarButton onClick={clear} variant="danger">
          Clear
        </ToolbarButton>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <label htmlFor="jwt-input" className="text-sm font-medium text-slate-300">
          Input JWT
        </label>
        <textarea
          id="jwt-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          spellCheck={false}
          className="min-h-[180px] w-full resize-y rounded-lg border border-slate-700 bg-slate-900/80 p-4 font-mono text-sm leading-relaxed text-slate-100 placeholder:text-slate-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          placeholder="Paste JWT here (header.payload.signature)"
          aria-invalid={error ? true : undefined}
        />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <OutputPane
          id="jwt-header-output"
          label="Header"
          value={headerOutput}
          copyLabel={copyHeaderLabel}
          onCopy={handleCopyHeader}
        />
        <OutputPane
          id="jwt-payload-output"
          label="Payload"
          value={payloadOutput}
          copyLabel={copyPayloadLabel}
          onCopy={handleCopyPayload}
        />
      </div>
    </div>
  )
}
