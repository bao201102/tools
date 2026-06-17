import { DiffEditor } from '@monaco-editor/react'
import { useCallback, useRef, useState } from 'react'
import { useLocalStorageState } from '../../../lib/useLocalStorageState'
import { useLocale } from '../../../lib/i18n'
import { useAdaptiveEditorHeightWithOptions } from '../../../lib/useAdaptiveEditorHeight'
import { useMonacoEditorTheme } from '../../../lib/useMonacoEditorTheme'
import { useDiffChecker } from '../hooks/useDiffChecker'
import { Button, Input } from '../../../components/ui'

type DiffLanguage =
  | 'json'
  | 'plaintext'
  | 'xml'
  | 'yaml'
  | 'javascript'
  | 'typescript'
  | 'csharp'
  | 'sql'

const LANGUAGE_LABELS: Record<DiffLanguage, string> = {
  json: 'JSON',
  plaintext: 'Text',
  xml: 'XML',
  yaml: 'YAML',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  csharp: 'C#',
  sql: 'SQL',
}

const BASE_EDITOR_OPTIONS = {
  minimap: { enabled: false },
  fontSize: 13,
  lineHeight: 18,
  scrollBeyondLastLine: false,
  wordWrap: 'off' as const,
  automaticLayout: true,
  renderSideBySideInlineBreakpoint: 0,
  originalEditable: true,
  fixedOverflowWidgets: true,
  diffAlgorithm: 'advanced' as const,
  autoIndent: 'full' as const,
}

function detectLanguageFromText(text: string): DiffLanguage {
  const trimmed = text.trim()
  if (!trimmed) return 'plaintext'
  try {
    JSON.parse(trimmed)
    return 'json'
  } catch { /* fall through */ }
  if (/^<\?xml|^<[\w-]+[\s>]/i.test(trimmed)) return 'xml'
  if (/^---\s*$|^\s*[\w-]+\s*:\s*.+/m.test(trimmed)) return 'yaml'
  if (/\bnamespace\b|\busing\s+[A-Z][\w.]*\s*;|\bpublic\s+class\b/.test(trimmed)) return 'csharp'
  if (/\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bFROM\b|\bWHERE\b/i.test(trimmed)) return 'sql'
  if (/\binterface\b|\btype\b|\benum\b|\bimplements\b|:\s*[A-Z][\w<>\[\]\|& ,]*/.test(trimmed)) return 'typescript'
  if (/\bfunction\b|\bconst\b|\blet\b|\bvar\b|=>/.test(trimmed)) return 'javascript'
  return 'plaintext'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function computeStats(changes: any[]) {
  let added = 0
  let removed = 0
  for (const c of changes) {
    if (c.modifiedEndLineNumber >= c.modifiedStartLineNumber && c.modifiedStartLineNumber > 0)
      added += c.modifiedEndLineNumber - c.modifiedStartLineNumber + 1
    if (c.originalEndLineNumber >= c.originalStartLineNumber && c.originalStartLineNumber > 0)
      removed += c.originalEndLineNumber - c.originalStartLineNumber + 1
  }
  return { added, removed }
}

/** Write a value to localStorage without triggering React state updates. */
function persistLS(key: string, value: string) {
  try { localStorage.setItem(`tools-app:${key}`, JSON.stringify(value)) } catch { /* ignore */ }
}

export function DiffCheckerEditor() {
  const { t } = useLocale()
  const editorTheme = useMonacoEditorTheme()
  const { renderSideBySide, toggleView } = useDiffChecker()

  // ── Editor refs ──────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const diffEditorRef = useRef<any>(null)
  const originalEditorRef = useRef<{
    getValue: () => string
    setValue: (value: string) => void
    getLayoutInfo: () => { width: number }
  } | null>(null)
  const modifiedEditorRef = useRef<{
    getValue: () => string
    setValue: (value: string) => void
    getLayoutInfo: () => { width: number }
    revealLineInCenter: (lineNumber: number) => void
  } | null>(null)

  // ── Initial values (read once from localStorage; only change on swap/clear) ──
  // These are what the DiffEditor receives as props.
  // We do NOT update them on every keystroke — that would reset the Monaco model
  // and destroy undo history. Instead we use `editorKey` to force a remount only
  // when the user explicitly swaps or clears content.
  const [savedOriginal] = useLocalStorageState('diff-checker:originalSnapshot', '')
  const [savedModified] = useLocalStorageState('diff-checker:modifiedSnapshot', '')
  const initOriginalRef = useRef(savedOriginal)
  const initModifiedRef = useRef(savedModified)

  // Live value refs — always reflect current editor content without React state
  const originalValueRef = useRef(savedOriginal)
  const modifiedValueRef = useRef(savedModified)

  // Incrementing this forces a DiffEditor remount (swap / clear)
  const [editorKey, setEditorKey] = useState(0)

  // ── Visual state ─────────────────────────────────────────────────────────
  const [language, setLanguage] = useState<DiffLanguage>(() =>
    detectLanguageFromText(savedModified.trim() ? savedModified : savedOriginal),
  )
  const [originalLabel, setOriginalLabel] = useLocalStorageState(
    'diff-checker:originalLabel', () => t('tool.diff.original'),
  )
  const [modifiedLabel, setModifiedLabel] = useLocalStorageState(
    'diff-checker:modifiedLabel', () => t('tool.diff.modified'),
  )
  const [splitWidths, setSplitWidths] = useState({ left: 1, right: 1 })
  const [copyOriginalState, setCopyOriginalState] = useState<'idle' | 'copied'>('idle')
  const [copyModifiedState, setCopyModifiedState] = useState<'idle' | 'copied'>('idle')

  // Diff navigation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [lineChanges, setLineChanges] = useState<any[]>([])
  const [currentDiffIndex, setCurrentDiffIndex] = useState(-1)

  // Display options (persisted)
  const [hideUnchanged, setHideUnchanged] = useLocalStorageState('diff-checker:hideUnchanged', true)
  const [ignoreWhitespace, setIgnoreWhitespace] = useLocalStorageState('diff-checker:ignoreWhitespace', true)

  // For adaptive height: track content lengths without causing Monaco model resets.
  // This state may update every keystroke, but it ONLY changes the container height —
  // it does not affect the DiffEditor's `original`/`modified` props.
  const [contentForHeight, setContentForHeight] = useState([savedOriginal, savedModified])
  const editorHeight = useAdaptiveEditorHeightWithOptions(
    contentForHeight,
    { wordWrap: false, lineHeightPx: 18 },
  )

  const stats = computeStats(lineChanges)
  const hasContent = !!(contentForHeight[0] || contentForHeight[1])
  const hasDiffs = lineChanges.length > 0

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleCopy = useCallback(async (getValue: () => string, pane: 'original' | 'modified') => {
    const text = getValue()
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      if (pane === 'original') {
        setCopyOriginalState('copied')
        setTimeout(() => setCopyOriginalState('idle'), 2000)
      } else {
        setCopyModifiedState('copied')
        setTimeout(() => setCopyModifiedState('idle'), 2000)
      }
    } catch { /* ignore */ }
  }, [])

  const updateDetectedLanguage = useCallback((original: string, modified: string) => {
    const source = modified.trim() ? modified : original
    setLanguage(detectLanguageFromText(source))
  }, [])

  const updateLineChanges = useCallback(() => {
    if (diffEditorRef.current) {
      const changes = diffEditorRef.current.getLineChanges() ?? []
      setLineChanges(changes)
      setCurrentDiffIndex((prev) => (prev >= changes.length ? -1 : prev))
    }
  }, [])

  const navigateDiff = useCallback((direction: 'next' | 'prev') => {
    if (lineChanges.length === 0 || !modifiedEditorRef.current) return
    let nextIndex = direction === 'next' ? currentDiffIndex + 1 : currentDiffIndex - 1
    if (nextIndex >= lineChanges.length) nextIndex = 0
    if (nextIndex < 0) nextIndex = lineChanges.length - 1

    const change = lineChanges[nextIndex]
    const targetLine = change.modifiedStartLineNumber > 0
      ? change.modifiedStartLineNumber
      : change.originalStartLineNumber

    modifiedEditorRef.current.revealLineInCenter(targetLine)
    setCurrentDiffIndex(nextIndex)
  }, [lineChanges, currentDiffIndex])

  const handleToggleView = useCallback(() => {
    toggleView()
  }, [toggleView])

  const handleSwap = useCallback(() => {
    const orig = originalValueRef.current
    const mod = modifiedValueRef.current

    // Update init refs so the remounted DiffEditor gets swapped content
    initOriginalRef.current = mod
    initModifiedRef.current = orig
    originalValueRef.current = mod
    modifiedValueRef.current = orig

    persistLS('diff-checker:originalSnapshot', mod)
    persistLS('diff-checker:modifiedSnapshot', orig)
    setContentForHeight([mod, orig])
    updateDetectedLanguage(mod, orig)
    setEditorKey((k) => k + 1)
  }, [updateDetectedLanguage])

  const handleClearAll = useCallback(() => {
    initOriginalRef.current = ''
    initModifiedRef.current = ''
    originalValueRef.current = ''
    modifiedValueRef.current = ''

    persistLS('diff-checker:originalSnapshot', '')
    persistLS('diff-checker:modifiedSnapshot', '')
    setContentForHeight(['', ''])
    setLanguage('plaintext')
    setLineChanges([])
    setCurrentDiffIndex(-1)
    setEditorKey((k) => k + 1)
  }, [])

  const syncSplitWidths = useCallback(() => {
    const leftWidth = originalEditorRef.current?.getLayoutInfo().width ?? 0
    const rightWidth = modifiedEditorRef.current?.getLayoutInfo().width ?? 0
    if (leftWidth > 0 && rightWidth > 0) {
      setSplitWidths({ left: leftWidth, right: rightWidth })
    }
  }, [])

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[1300px] flex-1 flex-col gap-4 px-4 pt-4 pb-20 sm:p-6 lg:p-8">
      <div className="shrink-0">
        <p className="text-sm text-ink-muted">{t('tool.diff.desc')}</p>
      </div>

      {/* ── Panel header row ── */}
      <div
        className="grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
        style={{
          gridTemplateColumns: renderSideBySide
            ? `${splitWidths.left}fr ${splitWidths.right}fr`
            : undefined,
        }}
      >
        {/* Original panel header */}
        <div className="flex gap-2">
          <div className="relative flex flex-1 items-center">
            <span
              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
              style={{ background: 'var(--ds-color-error-fg)' }}
              aria-hidden="true"
            />
            <Input
              type="text"
              className="flex-1 min-h-10 pl-3"
              value={originalLabel}
              onChange={(e) => setOriginalLabel(e.target.value)}
              placeholder={t('tool.diff.original')}
            />
          </div>
          <Button
            onClick={() => handleCopy(() => originalValueRef.current, 'original')}
            disabled={!contentForHeight[0]}
            className="text-xs whitespace-nowrap"
          >
            {copyOriginalState === 'copied' ? t('common.copied') : t('common.copy')}
          </Button>
        </div>

        {/* Modified panel header */}
        <div className="flex gap-2">
          <div className="relative flex flex-1 items-center">
            <span
              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
              style={{ background: 'var(--ds-color-semantic-success)' }}
              aria-hidden="true"
            />
            <Input
              type="text"
              className="flex-1 min-h-10 pl-3"
              value={modifiedLabel}
              onChange={(e) => setModifiedLabel(e.target.value)}
              placeholder={t('tool.diff.modified')}
            />
          </div>
          <Button
            onClick={() => handleCopy(() => modifiedValueRef.current, 'modified')}
            disabled={!contentForHeight[1]}
            className="text-xs whitespace-nowrap"
          >
            {copyModifiedState === 'copied' ? t('common.copied') : t('common.copy')}
          </Button>
        </div>
      </div>

      {/* ── Stats bar ── */}
      {hasContent && (
        <div className="flex shrink-0 items-center gap-3 px-1 animate-slide-up-fade">
          {hasDiffs ? (
            <>
              {/* Insertions */}
              <span className="inline-flex items-center gap-1 text-xs font-medium">
                <span
                  className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-mono font-semibold"
                  style={{
                    background: 'color-mix(in srgb, var(--ds-color-semantic-success) 12%, transparent)',
                    color: 'var(--ds-color-semantic-success)',
                  }}
                >
                  <span>+</span>
                  <span>{stats.added}</span>
                </span>
                <span className="text-ink-tertiary hidden sm:inline">{t('tool.diff.stats.linesAdded')}</span>
              </span>

              {/* Deletions */}
              <span className="inline-flex items-center gap-1 text-xs font-medium">
                <span
                  className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-mono font-semibold"
                  style={{
                    background: 'color-mix(in srgb, var(--ds-color-error-fg) 12%, transparent)',
                    color: 'var(--ds-color-error-fg)',
                  }}
                >
                  <span>−</span>
                  <span>{stats.removed}</span>
                </span>
                <span className="text-ink-tertiary hidden sm:inline">{t('tool.diff.stats.linesRemoved')}</span>
              </span>

              <span className="text-hairline-strong hidden sm:inline" aria-hidden="true">|</span>

              <span className="text-xs text-ink-muted hidden sm:inline">
                {t('tool.diff.stats.blocks', { count: lineChanges.length })}
              </span>
            </>
          ) : (
            <span
              className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full"
              style={{
                background: 'color-mix(in srgb, var(--ds-color-semantic-success) 12%, transparent)',
                color: 'var(--ds-color-semantic-success)',
              }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M1.5 5.5L3.5 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t('tool.diff.stats.noChanges')}
            </span>
          )}

          {/* Language badge */}
          <span
            className="ml-auto inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full border"
            style={{
              background: 'var(--ds-color-surface-3)',
              color: 'var(--ds-color-ink-muted)',
              borderColor: 'var(--ds-color-hairline)',
            }}
          >
            {LANGUAGE_LABELS[language]}
          </span>
        </div>
      )}

      {/* ── Monaco Diff Editor ── */}
      <div
        className="relative overflow-hidden rounded-lg border border-hairline shadow-sm"
        style={{ height: editorHeight }}
      >
        <DiffEditor
          key={editorKey}
          height="100%"
          width="100%"
          original={initOriginalRef.current}
          modified={initModifiedRef.current}
          originalLanguage={language}
          modifiedLanguage={language}
          originalModelPath="inmemory://model/original.txt"
          modifiedModelPath="inmemory://model/modified.txt"
          onMount={(editor) => {
            diffEditorRef.current = editor
            const originalEditor = editor.getOriginalEditor()
            const modifiedEditor = editor.getModifiedEditor()
            originalEditorRef.current = originalEditor
            modifiedEditorRef.current = modifiedEditor
            syncSplitWidths()

            editor.onDidUpdateDiff(() => updateLineChanges())

            originalEditor.onDidChangeModelContent(() => {
              const newValue = originalEditor.getValue()
              originalValueRef.current = newValue
              // Persist without React state → no model reset, undo history preserved
              persistLS('diff-checker:originalSnapshot', newValue)
              updateDetectedLanguage(newValue, modifiedValueRef.current)
              // Only update height tracker (does NOT touch original/modified props)
              setContentForHeight([newValue, modifiedValueRef.current])
            })
            originalEditor.onDidLayoutChange(() => syncSplitWidths())

            modifiedEditor.onDidChangeModelContent(() => {
              const newValue = modifiedEditor.getValue()
              modifiedValueRef.current = newValue
              persistLS('diff-checker:modifiedSnapshot', newValue)
              updateDetectedLanguage(originalValueRef.current, newValue)
              setContentForHeight([originalValueRef.current, newValue])
            })
            modifiedEditor.onDidLayoutChange(() => syncSplitWidths())
          }}
          options={{
            ...BASE_EDITOR_OPTIONS,
            renderSideBySide,
            ignoreTrimWhitespace: ignoreWhitespace,
            hideUnchangedRegions: {
              enabled: hideUnchanged,
              minimumLineCount: 3,
              contextLineCount: 3,
            },
          }}
          theme={editorTheme}
          loading={
            <div className="flex h-full items-center justify-center bg-surface-2 text-sm text-ink-subtle">
              {t('tool.diff.loading')}
            </div>
          }
        />
      </div>

      {/* ── Toolbar ── */}
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Button onClick={handleToggleView}>
          {renderSideBySide ? t('tool.diff.inlineView') : t('tool.diff.sideBySideView')}
        </Button>
        <Button onClick={handleSwap}>{t('common.swap')}</Button>
        <Button onClick={handleClearAll}>{t('tool.diff.clearAll')}</Button>

        {/* Display option toggles */}
        <Button
          variant={hideUnchanged ? 'primary' : 'secondary'}
          onClick={() => setHideUnchanged((v) => !v)}
          title={hideUnchanged ? t('tool.diff.opt.showAllTitle') : t('tool.diff.opt.hideUnchangedTitle')}
          size="sm"
        >
          {hideUnchanged ? t('tool.diff.opt.showAll') : t('tool.diff.opt.hideUnchanged')}
        </Button>
        <Button
          variant={ignoreWhitespace ? 'primary' : 'secondary'}
          onClick={() => setIgnoreWhitespace((v) => !v)}
          title={ignoreWhitespace ? t('tool.diff.opt.showWhitespaceTitle') : t('tool.diff.opt.ignoreWhitespaceTitle')}
          size="sm"
        >
          {ignoreWhitespace ? t('tool.diff.opt.showWhitespace') : t('tool.diff.opt.ignoreWhitespace')}
        </Button>

        {/* Navigation pill */}
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant={hasDiffs ? 'primary' : 'secondary'}
            onClick={() => navigateDiff('prev')}
            disabled={!hasDiffs}
            title={t('tool.diff.nav.prevTitle')}
            size="sm"
            className="px-3 rounded-r-none border-r-0"
          >
            ↑
          </Button>

          <span
            className="inline-flex min-w-[52px] items-center justify-center px-2 py-1 text-xs font-semibold tabular-nums select-none border-y"
            style={{
              minHeight: '36px',
              background: hasDiffs
                ? 'color-mix(in srgb, var(--ds-color-primary) 8%, var(--ds-color-surface-1))'
                : 'var(--ds-color-surface-2)',
              borderColor: hasDiffs ? 'var(--ds-color-primary)' : 'var(--ds-color-hairline)',
              color: hasDiffs ? 'var(--ds-color-primary)' : 'var(--ds-color-ink-tertiary)',
            }}
          >
            {hasDiffs
              ? currentDiffIndex >= 0
                ? `${currentDiffIndex + 1} / ${lineChanges.length}`
                : lineChanges.length
              : '—'}
          </span>

          <Button
            variant={hasDiffs ? 'primary' : 'secondary'}
            onClick={() => navigateDiff('next')}
            disabled={!hasDiffs}
            title={t('tool.diff.nav.nextTitle')}
            size="sm"
            className="px-3 rounded-l-none border-l-0"
          >
            ↓
          </Button>
        </div>
      </div>

      <div className="h-16 w-full shrink-0 lg:hidden" aria-hidden="true" />
    </div>
  )
}
