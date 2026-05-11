import { useCallback, useState, type ReactNode } from 'react'
import { useLocale } from '../../../lib/i18n'
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
  const { t } = useLocale()
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
        placeholder={t('tool.jwt.placeholder', { label })}
      />
    </div>
  )
}

type CopyState = 'idle' | 'copied' | 'failed'

export function JwtDecoderEditor() {
  const { t } = useLocale()
  const { input, setInput, headerOutput, payloadOutput, error, clear } = useJwtDecoder()
  const [copyHeaderState, setCopyHeaderState] = useState<CopyState>('idle')
  const [copyPayloadState, setCopyPayloadState] = useState<CopyState>('idle')

  const handleCopyHeader = useCallback(async () => {
    if (!headerOutput) return
    try {
      await navigator.clipboard.writeText(headerOutput)
      setCopyHeaderState('copied')
    } catch {
      setCopyHeaderState('failed')
    }
    window.setTimeout(() => setCopyHeaderState('idle'), 2000)
  }, [headerOutput])

  const handleCopyPayload = useCallback(async () => {
    if (!payloadOutput) return
    try {
      await navigator.clipboard.writeText(payloadOutput)
      setCopyPayloadState('copied')
    } catch {
      setCopyPayloadState('failed')
    }
    window.setTimeout(() => setCopyPayloadState('idle'), 2000)
  }, [payloadOutput])

  const copyHeaderLabel =
    copyHeaderState === 'copied'
      ? t('common.copied')
      : copyHeaderState === 'failed'
        ? t('common.failed')
        : t('tool.jwt.copyHeader')

  const copyPayloadLabel =
    copyPayloadState === 'copied'
      ? t('common.copied')
      : copyPayloadState === 'failed'
        ? t('common.failed')
        : t('tool.jwt.copyPayload')

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-6 lg:p-8">
      <div className="shrink-0">
        <h1 className="text-xl font-semibold tracking-tight text-slate-100 sm:text-2xl">{t('tool.jwt.title')}</h1>
        <p className="mt-1 text-sm text-slate-400">{t('tool.jwt.desc')}</p>
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
          {t('common.clear')}
        </ToolbarButton>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <label htmlFor="jwt-input" className="text-sm font-medium text-slate-300">
          {t('tool.jwt.input')}
        </label>
        <textarea
          id="jwt-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          spellCheck={false}
          className="min-h-[140px] w-full resize-y rounded-lg border border-slate-700 bg-slate-900/80 p-3 font-mono text-sm leading-relaxed text-slate-100 placeholder:text-slate-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 sm:min-h-[180px] sm:p-4"
          placeholder={t('tool.jwt.inputPlaceholder')}
          aria-invalid={error ? true : undefined}
        />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <OutputPane
          id="jwt-header-output"
          label={t('tool.jwt.header')}
          value={headerOutput}
          copyLabel={copyHeaderLabel}
          onCopy={handleCopyHeader}
        />
        <OutputPane
          id="jwt-payload-output"
          label={t('tool.jwt.payload')}
          value={payloadOutput}
          copyLabel={copyPayloadLabel}
          onCopy={handleCopyPayload}
        />
      </div>
    </div>
  )
}
