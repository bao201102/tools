import { useCallback, useState, useMemo } from 'react'
import { useAdaptiveEditorHeight } from '../../../lib/useAdaptiveEditorHeight'
import { useLocale } from '../../../lib/i18n'
import { useLocalStorageState } from '../../../lib/useLocalStorageState'
import { Button, Textarea } from '../../../components/ui'
import { Copy, Trash2, Sparkles, FileText, CaseSensitive, BookOpen, Volume2 } from 'lucide-react'
import { usePageTitle } from '../../../lib/usePageTitle'

// Helper functions for statistics
const getWordCount = (str: string) => {
  const trimmed = str.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

const getSentenceCount = (str: string) => {
  const trimmed = str.trim()
  if (!trimmed) return 0
  const sentences = trimmed.split(/[.!?]+(?=\s|$)/g)
  return sentences.filter((s) => s.trim().length > 0).length
}

const getParagraphCount = (str: string) => {
  const trimmed = str.trim()
  if (!trimmed) return 0
  return trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length
}

const getLineCount = (str: string) => {
  if (str === '') return 0
  return str.split('\n').length
}

const getCharDensity = (str: string) => {
  const freq: Record<string, number> = {}
  let total = 0
  for (const char of str) {
    if (/\s/.test(char)) continue
    const key = char.toLowerCase()
    freq[key] = (freq[key] || 0) + 1
    total++
  }
  if (total === 0) return []
  return Object.entries(freq)
    .map(([item, count]) => ({
      item,
      count,
      percentage: ((count / total) * 100).toFixed(1) + '%',
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
}

const getWordDensity = (str: string) => {
  // Support latin and vietnamese characters specifically in regex
  const cleanStr = str.toLowerCase().replace(/[^\w\s\u00C0-\u1EF9]/g, ' ')
  const words = cleanStr.split(/\s+/).filter((w) => w.length > 0)
  const freq: Record<string, number> = {}
  const total = words.length
  if (total === 0) return []
  for (const word of words) {
    freq[word] = (freq[word] || 0) + 1
  }
  return Object.entries(freq)
    .map(([item, count]) => ({
      item,
      count,
      percentage: ((count / total) * 100).toFixed(1) + '%',
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
}

// Case transformations
const toTitleCase = (str: string) => {
  return str.replace(/([^\s:\-]+)/g, (match) => {
    return match.charAt(0).toUpperCase() + match.slice(1).toLowerCase()
  })
}

const toSentenceCase = (str: string) => {
  if (!str) return ''
  return str.toLowerCase().replace(/(^\s*|[.!?]\s+)([a-z\u00C0-\u1EF9])/g, (_, p1, p2) => {
    return p1 + p2.toUpperCase()
  })
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: number | string
  icon: any
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-hairline bg-surface-1 p-2 sm:p-4 text-center transition-all duration-300 hover:border-hairline-strong hover:shadow-md hover:-translate-y-0.5 group">
      <div className="mb-1.5 flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-primary/5 text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
        <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
      </div>
      <span className="text-lg sm:text-2xl font-bold tracking-tight text-ink group-hover:text-primary transition-colors leading-none">{value}</span>
      <span className="mt-1 text-[9px] sm:text-xs font-medium text-ink-muted leading-tight">{label}</span>
    </div>
  )
}

function DensityTable({
  title,
  data,
  headers,
}: {
  title: string
  data: { item: string; count: number; percentage: string }[]
  headers: { item: string; count: string; percent: string }
}) {
  const { t } = useLocale()
  return (
    <div className="flex-1 rounded-lg border border-hairline bg-surface-1 p-4 shadow-sm">
      <h4 className="mb-3 text-sm font-semibold text-ink">{title}</h4>
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-xs text-ink-muted">{t('tool.letterCount.density.noData')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-ink-muted">
            <thead>
              <tr className="border-b border-hairline pb-2 font-medium text-ink-subtle">
                <th className="py-1.5 w-12 text-center">#</th>
                <th className="py-1.5">{headers.item}</th>
                <th className="py-1.5 text-right">{headers.count}</th>
                <th className="py-1.5 text-right">{headers.percent}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-surface-2/50 transition-colors">
                  <td className="py-2 text-center font-mono text-ink-tertiary">{idx + 1}</td>
                  <td className="py-2 font-mono font-medium text-ink truncate max-w-[150px]" title={row.item}>
                    {row.item}
                  </td>
                  <td className="py-2 text-right font-mono text-ink font-semibold">{row.count}</td>
                  <td className="py-2 text-right font-mono text-primary font-medium">{row.percentage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export function LetterCountEditor() {
  const { t } = useLocale()
  usePageTitle('tool.letterCount.title')
  const [input, setInput] = useLocalStorageState<string>('letter-count:input', '')
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')

  const editorHeight = useAdaptiveEditorHeight(input)

  // Memoized stats to prevent re-calculations on every render
  const stats = useMemo(() => {
    const chars = input.length
    const charsNoSpaces = input.replace(/\s/g, '').length
    const words = getWordCount(input)
    const sentences = getSentenceCount(input)
    const paragraphs = getParagraphCount(input)
    const lines = getLineCount(input)

    // Average reading time (200 words/min)
    const readingTime = words > 0 ? Math.max(1, Math.round(words / 200)) : 0
    // Average speaking time (130 words/min)
    const speakingTime = words > 0 ? Math.max(1, Math.round(words / 130)) : 0

    const charDensity = getCharDensity(input)
    const wordDensity = getWordDensity(input)

    return {
      chars,
      charsNoSpaces,
      words,
      sentences,
      paragraphs,
      lines,
      readingTime,
      speakingTime,
      charDensity,
      wordDensity,
    }
  }, [input])

  const handleCopy = useCallback(async () => {
    if (!input) return
    try {
      await navigator.clipboard.writeText(input)
      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 2000)
    } catch {
      // Ignore
    }
  }, [input])

  const handleClear = useCallback(() => {
    setInput('')
  }, [setInput])

  const loadSampleText = useCallback(() => {
    setInput(t('tool.letterCount.sample'))
  }, [setInput, t])

  // Transformations
  const handleUppercase = useCallback(() => {
    setInput(input.toUpperCase())
  }, [input, setInput])

  const handleLowercase = useCallback(() => {
    setInput(input.toLowerCase())
  }, [input, setInput])

  const handleTitleCase = useCallback(() => {
    setInput(toTitleCase(input))
  }, [input, setInput])

  const handleSentenceCase = useCallback(() => {
    setInput(toSentenceCase(input))
  }, [input, setInput])

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[1300px] flex-1 flex-col gap-4 px-4 pt-4 pb-20 sm:p-6 lg:p-8 relative">
      {/* Ambient decorative glow */}
      <div className="ambient-glow -left-10 -top-10 opacity-30 dark:opacity-40" />

      <div className="shrink-0 relative z-10">
        <p className="text-sm text-ink-muted">{t('tool.letterCount.desc')}</p>
      </div>

      <div className="grid min-h-0 shrink-0 grid-cols-1 gap-4 w-full lg:grid-cols-2 lg:gap-6 relative z-10">
        {/* Left Column: Input Textarea */}
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          {/* Toolbar: label + action buttons */}
          <div className="flex shrink-0 items-center justify-between gap-2">
            <label htmlFor="letter-count-input" className="shrink-0 text-sm font-medium text-ink">
              {t('tool.letterCount.input')}
            </label>
            {/* Buttons: show text on sm+, icon-only on mobile */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={loadSampleText}
                title={t('tool.json.loadSample')}
                className="flex h-9 items-center justify-center gap-1.5 rounded-md border border-hairline bg-surface-1 px-2 sm:px-3 text-xs font-medium text-primary shadow-sm transition-colors hover:bg-surface-2 hover:border-hairline-strong active:bg-surface-3"
              >
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">{t('tool.json.loadSample')}</span>
              </button>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!input}
                title={t('common.copy')}
                className="flex h-9 items-center justify-center gap-1.5 rounded-md border border-hairline bg-surface-1 px-2 sm:px-3 text-xs font-medium text-ink shadow-sm transition-colors hover:bg-surface-2 hover:border-hairline-strong active:bg-surface-3 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Copy className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">{copyState === 'copied' ? t('common.copied') + '!' : t('common.copy')}</span>
              </button>
              <button
                type="button"
                onClick={handleClear}
                disabled={!input}
                title={t('common.clear')}
                className="flex h-9 items-center justify-center gap-1.5 rounded-md border border-hairline bg-surface-1 px-2 sm:px-3 text-xs font-medium text-error-fg shadow-sm transition-colors hover:bg-error-surface/30 hover:border-error-border/40 active:bg-error-surface/50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">{t('common.clear')}</span>
              </button>
            </div>
          </div>

          <div style={{ height: editorHeight }} className="w-full">
            <Textarea
              id="letter-count-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('tool.letterCount.placeholder')}
              className="h-full w-full resize-none font-mono text-sm leading-relaxed p-3 sm:p-4 shadow-sm"
              spellCheck={false}
            />
          </div>

          {/* Quick text transformations */}
          <div className="mt-1 grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleUppercase}
              disabled={!input}
              className="text-xs font-semibold truncate"
            >
              {t('tool.letterCount.actions.uppercase')}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLowercase}
              disabled={!input}
              className="text-xs font-semibold truncate"
            >
              {t('tool.letterCount.actions.lowercase')}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleTitleCase}
              disabled={!input}
              className="text-xs font-semibold truncate"
            >
              {t('tool.letterCount.actions.titlecase')}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSentenceCase}
              disabled={!input}
              className="text-xs font-semibold truncate"
            >
              {t('tool.letterCount.actions.sentencecase')}
            </Button>
          </div>
        </div>

        {/* Right Column: Statistics Grid */}
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <div className="flex shrink-0 items-center h-9">
            <h3 className="text-sm font-medium text-ink">{t('tool.letterCount.statsTitle')}</h3>
          </div>
          {/* Stats panel — auto height (no fixed), scrollable on overflow */}
          <div className="w-full overflow-y-auto rounded-lg border border-hairline bg-surface-2 p-3 sm:p-4 shadow-sm flex flex-col gap-4">
            {/* Stats Cards Grid: 3 cols on mobile, 3 cols on sm+ */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <StatCard
                label={t('tool.letterCount.stats.chars')}
                value={stats.chars}
                icon={CaseSensitive}
              />
              <StatCard
                label={t('tool.letterCount.stats.charsNoSpaces')}
                value={stats.charsNoSpaces}
                icon={CaseSensitive}
              />
              <StatCard
                label={t('tool.letterCount.stats.words')}
                value={stats.words}
                icon={FileText}
              />
              <StatCard
                label={t('tool.letterCount.stats.sentences')}
                value={stats.sentences}
                icon={FileText}
              />
              <StatCard
                label={t('tool.letterCount.stats.paragraphs')}
                value={stats.paragraphs}
                icon={FileText}
              />
              <StatCard
                label={t('tool.letterCount.stats.lines')}
                value={stats.lines}
                icon={FileText}
              />
            </div>

            {/* Time Estimation */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4 border-t border-hairline pt-4">
              <div className="flex items-center gap-2.5 rounded-lg border border-hairline bg-surface-1 p-3 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-ink">
                    {stats.readingTime} {t('tool.letterCount.timeUnit')}
                  </div>
                  <div className="text-[10px] sm:text-xs text-ink-muted leading-tight">
                    {t('tool.letterCount.stats.readingTime')}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-lg border border-hairline bg-surface-1 p-3 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-ink">
                    {stats.speakingTime} {t('tool.letterCount.timeUnit')}
                  </div>
                  <div className="text-[10px] sm:text-xs text-ink-muted leading-tight">
                    {t('tool.letterCount.stats.speakingTime')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Density Analysis Tables */}
      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 relative z-10">
        <DensityTable
          title={t('tool.letterCount.density.chars')}
          data={stats.charDensity}
          headers={{
            item: t('tool.letterCount.density.item').split(' / ')[0],
            count: t('tool.letterCount.density.count'),
            percent: t('tool.letterCount.density.percent'),
          }}
        />
        <DensityTable
          title={t('tool.letterCount.density.words')}
          data={stats.wordDensity}
          headers={{
            item: t('tool.letterCount.density.item').split(' / ')[1],
            count: t('tool.letterCount.density.count'),
            percent: t('tool.letterCount.density.percent'),
          }}
        />
      </div>

      {/* Extra layout spacing */}
      <div className="h-8 w-full shrink-0" aria-hidden="true" />
      <div className="h-16 w-full shrink-0 lg:hidden" aria-hidden="true" />
    </div>
  )
}
