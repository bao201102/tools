import { useCallback, type ReactNode } from 'react'
import { useEncoder } from '../hooks/useEncoder'

type ToggleButtonProps = {
  children: ReactNode
  active: boolean
  onClick: () => void
}

type ToolbarButtonProps = {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
  variant?: 'default' | 'danger'
}

function ToggleButton({ children, active, onClick }: ToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-md border px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'border-violet-600/50 bg-violet-600/20 text-violet-300'
          : 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function ToolbarButton({ children, onClick, disabled, variant = 'default' }: ToolbarButtonProps) {
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

export function EncoderEditor() {
  const { input, output, error, mode, direction, setInput, setMode, setDirection, clear, swap } = useEncoder()

  const handleCopy = useCallback(async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
  }, [output])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 sm:p-6 lg:p-8">
      <div className="shrink-0">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-100">Encoder / Decoder</h1>
        <p className="mt-1 text-sm text-slate-400">
          Encode or decode text with Base64 and URL transformations.
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

      <div className="flex shrink-0 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mode</span>
          <ToggleButton active={mode === 'base64'} onClick={() => setMode('base64')}>
            Base64
          </ToggleButton>
          <ToggleButton active={mode === 'url'} onClick={() => setMode('url')}>
            URL
          </ToggleButton>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Direction</span>
          <ToggleButton active={direction === 'encode'} onClick={() => setDirection('encode')}>
            Encode
          </ToggleButton>
          <ToggleButton active={direction === 'decode'} onClick={() => setDirection('decode')}>
            Decode
          </ToggleButton>
          <div className="ml-auto flex flex-wrap gap-2">
            <ToolbarButton onClick={swap} disabled={!output}>
              Swap
            </ToolbarButton>
            <ToolbarButton onClick={clear} variant="danger">
              Clear
            </ToolbarButton>
            <ToolbarButton onClick={handleCopy} disabled={!output}>
              Copy
            </ToolbarButton>
          </div>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <label htmlFor="encoder-input" className="shrink-0 text-sm font-medium text-slate-300">
            Input
          </label>
          <textarea
            id="encoder-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            spellCheck={false}
            className="min-h-[280px] w-full flex-1 resize-y rounded-lg border border-slate-700 bg-slate-900/80 p-4 font-mono text-sm leading-relaxed text-slate-100 placeholder:text-slate-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            placeholder="Enter text to encode or decode"
            aria-invalid={error ? true : undefined}
          />
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <label htmlFor="encoder-output" className="shrink-0 text-sm font-medium text-slate-300">
            Output
          </label>
          <textarea
            id="encoder-output"
            readOnly
            value={output}
            spellCheck={false}
            className="min-h-[280px] w-full flex-1 resize-y rounded-lg border border-slate-700 bg-slate-950/80 p-4 font-mono text-sm leading-relaxed text-slate-200 focus:outline-none"
            placeholder="Output appears here"
          />
        </div>
      </div>
    </div>
  )
}
