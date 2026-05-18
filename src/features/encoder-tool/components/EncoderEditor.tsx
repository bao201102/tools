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
        'rounded-md border px-3 py-2 text-sm font-medium transition-colors shadow-sm',
        active
          ? 'border-primary bg-primary text-on-primary'
          : 'border-hairline bg-surface-1 text-ink hover:bg-surface-2 hover:border-hairline-strong',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function ToolbarButton({ children, onClick, disabled, variant = 'default' }: ToolbarButtonProps) {
  const base =
    'rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 shadow-sm'
  const styles =
    variant === 'danger'
      ? 'border border-error-border bg-error-surface text-error-fg hover:bg-error-surface-strong'
      : 'border border-hairline bg-surface-1 text-ink hover:bg-surface-2 hover:border-hairline-strong'

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
    <div className="mx-auto flex min-h-0 w-full max-w-[1300px] flex-1 flex-col gap-4 p-6 lg:p-8">
      <div className="shrink-0">
        <p className="text-sm text-ink-muted">{t('tool.encoder.desc')}</p>
      </div>

      {error ? (
        <p
          className="shrink-0 rounded-md border border-error-border bg-error-surface px-3 py-2 text-sm text-error-fg"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="flex shrink-0 flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
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
          <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
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
        </div>
      </div>

      <div className="grid min-h-0 h-[400px] grid-cols-1 gap-4 w-full lg:grid-cols-2 lg:gap-6">
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <label htmlFor="encoder-input" className="shrink-0 text-sm font-medium text-ink">
            {t('common.input')}
          </label>
          <textarea
            id="encoder-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            spellCheck={false}
            className="h-full w-full resize-none rounded-lg border border-hairline bg-surface-1 p-3 font-mono text-sm leading-relaxed text-ink placeholder:text-ink-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:p-4 shadow-sm"
            placeholder={t('tool.encoder.input.placeholder')}
            aria-invalid={error ? true : undefined}
          />
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <label htmlFor="encoder-output" className="shrink-0 text-sm font-medium text-ink">
            {t('common.output')}
          </label>
          <textarea
            id="encoder-output"
            readOnly
            value={output}
            spellCheck={false}
            className="h-full w-full resize-none rounded-lg border border-hairline bg-surface-2 p-3 font-mono text-sm leading-relaxed text-ink focus:outline-none sm:p-4 shadow-sm"
            placeholder={t('tool.encoder.output.placeholder')}
          />
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
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
  )
}
