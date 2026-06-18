import { useAdaptiveEditorHeight } from '../../../lib/useAdaptiveEditorHeight'
import { useLocale } from '../../../lib/i18n'
import { useJwtDecoder } from '../hooks/useJwtDecoder'
import { Button, Textarea, CopyButton } from '../../../components/ui'
import { usePageTitle } from '../../../lib/usePageTitle'
import { CheckCircle, AlertCircle, Clock, Calendar } from 'lucide-react'

type OutputPaneProps = {
  id: string
  label: string
  value: string
  copyLabel: string
}

function OutputPane({ id, label, value, copyLabel }: OutputPaneProps) {
  const { t } = useLocale()
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
        <CopyButton value={() => value} label={copyLabel} disabled={!value} />
      </div>
      <Textarea
        id={id}
        readOnly
        value={value}
        spellCheck={false}
        className="min-h-[240px] max-h-[80vh] h-[calc(100%-2.5rem)] w-full resize-y bg-surface-2 p-4 font-mono text-sm leading-relaxed text-ink shadow-sm"
        placeholder={t('tool.jwt.placeholder', { label })}
      />
    </div>
  )
}

function formatDate(date: Date): string {
  return date.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

export function JwtDecoderEditor() {
  const { t } = useLocale()
  usePageTitle('tool.jwt.title')
  const { input, setInput, headerOutput, payloadOutput, error, tokenInfo, clear } = useJwtDecoder()
  const editorHeight = useAdaptiveEditorHeight(headerOutput, payloadOutput)

  return (
    <div className="mx-auto flex w-full max-w-[1300px] flex-col gap-4 px-4 pt-4 pb-20 sm:p-6 lg:p-8">
      <div className="shrink-0">
        <p className="text-sm text-ink-muted">{t('tool.jwt.desc')}</p>
      </div>

      {error ? (
        <p
          className="shrink-0 rounded-md border border-error-border bg-error-surface px-3 py-2 text-sm text-error-fg"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="flex min-h-0 flex-col gap-2">
        <label htmlFor="jwt-input" className="text-sm font-medium text-ink">
          {t('tool.jwt.input')}
        </label>
        <Textarea
          id="jwt-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          spellCheck={false}
          className="min-h-[140px] max-h-[50vh] w-full resize-y font-mono text-sm leading-relaxed sm:min-h-[180px] p-3 sm:p-4 shadow-sm"
          placeholder={t('tool.jwt.inputPlaceholder')}
          error={!!error}
        />
      </div>

      {/* Token timing info panel */}
      {tokenInfo && (
        <div className="shrink-0 rounded-lg border border-hairline bg-surface-1 p-4 shadow-sm animate-slide-up-fade">
          <div className="flex flex-wrap items-center gap-3">
            {/* Expiry status badge */}
            {tokenInfo.isExpired !== undefined && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  tokenInfo.isExpired
                    ? 'bg-error-surface text-error-fg border border-error-border'
                    : 'border text-semantic-success'
                }`}
                style={tokenInfo.isExpired ? {} : {
                  background: 'color-mix(in srgb, var(--ds-color-semantic-success) 12%, transparent)',
                  borderColor: 'color-mix(in srgb, var(--ds-color-semantic-success) 30%, transparent)',
                }}
              >
                {tokenInfo.isExpired
                  ? <AlertCircle className="h-3.5 w-3.5" />
                  : <CheckCircle className="h-3.5 w-3.5" />
                }
                {tokenInfo.isExpired ? t('tool.jwt.expired') : t('tool.jwt.valid')}
              </span>
            )}

            {/* Expiry date */}
            {tokenInfo.expiresAt && (
              <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
                <Clock className="h-3.5 w-3.5 shrink-0 text-ink-tertiary" />
                <span className="font-medium text-ink-subtle">{t('tool.jwt.expiresAt')}:</span>
                <span className="font-mono">{formatDate(tokenInfo.expiresAt)}</span>
              </span>
            )}

            {/* Issued at */}
            {tokenInfo.issuedAt && (
              <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
                <Calendar className="h-3.5 w-3.5 shrink-0 text-ink-tertiary" />
                <span className="font-medium text-ink-subtle">{t('tool.jwt.issuedAt')}:</span>
                <span className="font-mono">{formatDate(tokenInfo.issuedAt)}</span>
              </span>
            )}
          </div>
        </div>
      )}

      <div
        className="grid min-h-0 shrink-0 grid-cols-1 gap-4 w-full lg:grid-cols-2 lg:gap-6"
        style={{ minHeight: editorHeight }}
      >
        <OutputPane
          id="jwt-header-output"
          label={t('tool.jwt.header')}
          value={headerOutput}
          copyLabel={t('tool.jwt.copyHeader')}
        />
        <OutputPane
          id="jwt-payload-output"
          label={t('tool.jwt.payload')}
          value={payloadOutput}
          copyLabel={t('tool.jwt.copyPayload')}
        />
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
