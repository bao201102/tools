import { useCallback, type ReactNode } from 'react'
import { useLocale } from '../../../lib/i18n'
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
  const { t } = useLocale()
  const { input, output, error, mode, direction, setInput, setMode, setDirection, clear, swap } = useEncoder()

  const handleCopy = useCallback(async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
  }, [output])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-3 sm:p-6 lg:p-8">
      <div className="shrink-0">
        <h1 className="text-xl font-semibold tracking-tight text-slate-100 sm:text-2xl">
          {t('tool.encoder.title')}
        </h1>
        <p className="mt-1 text-sm text-slate-400">{t('tool.encoder.desc')}</p>
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
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t('tool.encoder.mode')}
          </span>
          <div className="flex flex-wrap gap-2">
            <ToggleButton active={mode === 'base64'} onClick={() => setMode('base64')}>
              {t('tool.encoder.mode.base64')}
            </ToggleButton>
            <ToggleButton active={mode === 'url'} onClick={() => setMode('url')}>
              {t('tool.encoder.mode.url')}
            </ToggleButton>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
          <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t('tool.encoder.direction')}
          </span>
          <div className="flex flex-wrap gap-2">
            <ToggleButton active={direction === 'encode'} onClick={() => setDirection('encode')}>
              {t('tool.encoder.direction.encode')}
            </ToggleButton>
            <ToggleButton active={direction === 'decode'} onClick={() => setDirection('decode')}>
              {t('tool.encoder.direction.decode')}
            </ToggleButton>
          </div>
          <div className="flex flex-wrap gap-2 border-t border-slate-800/80 pt-3 sm:ml-auto sm:border-t-0 sm:pt-0">
            <ToolbarButton onClick={swap} disabled={!output}>
              {t('common.swap')}
            </ToolbarButton>
            <ToolbarButton onClick={clear} variant="danger">
              {t('common.clear')}
            </ToolbarButton>
            <ToolbarButton onClick={handleCopy} disabled={!output}>
              {t('common.copy')}
            </ToolbarButton>
          </div>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <label htmlFor="encoder-input" className="shrink-0 text-sm font-medium text-slate-300">
            {t('common.input')}
          </label>
          <textarea
            id="encoder-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            spellCheck={false}
            className="min-h-[200px] w-full flex-1 resize-y rounded-lg border border-slate-700 bg-slate-900/80 p-3 font-mono text-sm leading-relaxed text-slate-100 placeholder:text-slate-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 sm:min-h-[280px] sm:p-4"
            placeholder={t('tool.encoder.input.placeholder')}
            aria-invalid={error ? true : undefined}
          />
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <label htmlFor="encoder-output" className="shrink-0 text-sm font-medium text-slate-300">
            {t('common.output')}
          </label>
          <textarea
            id="encoder-output"
            readOnly
            value={output}
            spellCheck={false}
            className="min-h-[200px] w-full flex-1 resize-y rounded-lg border border-slate-700 bg-slate-950/80 p-3 font-mono text-sm leading-relaxed text-slate-200 focus:outline-none sm:min-h-[280px] sm:p-4"
            placeholder={t('tool.encoder.output.placeholder')}
          />
        </div>
      </div>
    </div>
  )
}
