import { useCallback, useState } from 'react'
import { useAdaptiveEditorHeight } from '../../../lib/useAdaptiveEditorHeight'
import { useLocale } from '../../../lib/i18n'
import { useEncoder } from '../hooks/useEncoder'
import { Button, Textarea } from '../../../components/ui'

export function EncoderEditor() {
  const { t } = useLocale()
  const { input, output, error, mode, direction, setInput, setMode, setDirection, clear, swap } = useEncoder()
  const editorHeight = useAdaptiveEditorHeight(input, output)
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')

  const handleCopy = useCallback(async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 2000)
    } catch {
      // Ignore
    }
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
            <Button variant={mode === 'base64' ? 'primary' : 'secondary'} size="sm" onClick={() => setMode('base64')}>
              {t('tool.encoder.mode.base64')}
            </Button>
            <Button variant={mode === 'url' ? 'primary' : 'secondary'} size="sm" onClick={() => setMode('url')}>
              {t('tool.encoder.mode.url')}
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
          <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
            {t('tool.encoder.direction')}
          </span>
          <div className="flex flex-wrap gap-2">
            <Button variant={direction === 'encode' ? 'primary' : 'secondary'} size="sm" onClick={() => setDirection('encode')}>
              {t('tool.encoder.direction.encode')}
            </Button>
            <Button variant={direction === 'decode' ? 'primary' : 'secondary'} size="sm" onClick={() => setDirection('decode')}>
              {t('tool.encoder.direction.decode')}
            </Button>
          </div>
        </div>
      </div>

      <div
        className="grid min-h-0 grid-cols-1 gap-4 w-full lg:grid-cols-2 lg:gap-6"
        style={{ height: editorHeight }}
      >
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <label htmlFor="encoder-input" className="shrink-0 text-sm font-medium text-ink">
            {t('common.input')}
          </label>
          <Textarea
            id="encoder-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            spellCheck={false}
            className="h-full w-full resize-none font-mono text-sm leading-relaxed p-3 sm:p-4 shadow-sm"
            placeholder={t('tool.encoder.input.placeholder')}
            error={!!error}
          />
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <div className="flex shrink-0 items-center justify-between">
            <label htmlFor="encoder-output" className="text-sm font-medium text-ink">
              {t('common.output')}
            </label>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!output}
              className="rounded-md border border-hairline bg-surface-1 px-3 py-1 text-xs font-medium text-ink shadow-sm transition-colors hover:bg-surface-2 hover:border-hairline-strong disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copyState === 'copied' ? t('common.copied') + '!' : t('common.copy')}
            </button>
          </div>
          <Textarea
            id="encoder-output"
            readOnly
            value={output}
            spellCheck={false}
            className="h-full w-full resize-none bg-surface-2 font-mono text-sm leading-relaxed p-3 sm:p-4 shadow-sm"
            placeholder={t('tool.encoder.output.placeholder')}
          />
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        <Button onClick={swap} disabled={!output}>
          {t('common.swap')}
        </Button>
        <Button onClick={clear}>
          {t('common.clear')}
        </Button>
      </div>
    </div>
  )
}
