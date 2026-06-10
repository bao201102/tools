import { useCallback, useState } from 'react'
import { useAdaptiveEditorHeight } from '../../../lib/useAdaptiveEditorHeight'
import { useLocale } from '../../../lib/i18n'
import { useJwtDecoder } from '../hooks/useJwtDecoder'
import { Button, Textarea } from '../../../components/ui'

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
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
        <Button onClick={onCopy} disabled={!value} size="sm">
          {copyLabel}
        </Button>
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

type CopyState = 'idle' | 'copied' | 'failed'

export function JwtDecoderEditor() {
  const { t } = useLocale()
  const { input, setInput, headerOutput, payloadOutput, error, clear } = useJwtDecoder()
  const editorHeight = useAdaptiveEditorHeight(headerOutput, payloadOutput)
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
    <div className="mx-auto flex w-full max-w-[1300px] flex-col gap-4 p-4 sm:p-6 lg:p-8">
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

      <div
        className="grid min-h-0 grid-cols-1 gap-4 w-full lg:grid-cols-2 lg:gap-6"
        style={{ minHeight: editorHeight }}
      >
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

      <div className="flex shrink-0 flex-wrap gap-2">
        <Button onClick={clear}>
          {t('common.clear')}
        </Button>
      </div>
    </div>
  )
}
