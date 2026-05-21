import Editor from '@monaco-editor/react'
import { useCallback, useState, useRef, useEffect } from 'react'
import { Maximize2, Minimize2 } from 'lucide-react'
import { useLocale } from '../../../lib/i18n'
import { useMonacoEditorTheme } from '../../../lib/useMonacoEditorTheme'
import { useMarkdownPreview } from '../hooks/useMarkdownPreview'
import '../styles/markdown-preview.css'

const editorOptions = {
  minimap: { enabled: false },
  fontSize: 14,
  scrollBeyondLastLine: false,
  wordWrap: 'on' as const,
  padding: { top: 12, bottom: 12 },
  automaticLayout: true,
  tabSize: 2,
  lineNumbers: 'on' as const,
}

export function MarkdownPreviewEditor() {
  const { t } = useLocale()
  const editorTheme = useMonacoEditorTheme()
  const { input, output, stats, onInputChange, clear, loadSample } = useMarkdownPreview()

  const [isExpanded, setIsExpanded] = useState(true)
  const [isPreviewMaximized, setIsPreviewMaximized] = useState(false)
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const editorRef = useRef<any>(null)

  // Prevent background scrolling and enable Escape key to dismiss maximized preview
  useEffect(() => {
    if (!isPreviewMaximized) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPreviewMaximized(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isPreviewMaximized])

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor
    editor.onDidBlurEditorText(() => {
      setTimeout(() => {
        // Only auto-collapse if the editor has actually lost focus and there is text entered
        if (editorRef.current && !editorRef.current.hasTextFocus() && editor.getValue().trim() !== '') {
          setIsExpanded(false)
        }
      }, 200)
    })
    editor.onDidFocusEditorText(() => {
      setIsExpanded(true)
    })
  }

  const handleExpand = useCallback(() => {
    setIsExpanded(true)
    setTimeout(() => {
      editorRef.current?.focus()
    }, 50)
  }, [])

  const handleClear = useCallback(() => {
    clear()
    setIsExpanded(true)
    setIsPreviewMaximized(false)
    setTimeout(() => {
      editorRef.current?.focus()
    }, 50)
  }, [clear])

  const handleCopy = useCallback(async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }
    setTimeout(() => setCopyState('idle'), 2000)
  }, [output])

  const copyLabel =
    copyState === 'copied'
      ? t('common.copied') + '!'
      : copyState === 'failed'
      ? t('common.failed')
      : t('tool.markdown.copyHtml')

  const hasInput = input.trim() !== ''

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[1300px] flex-1 flex-col gap-4 p-6 lg:p-8">
      <div className="shrink-0">
        <p className="text-sm text-ink-muted">
          {t('tool.markdown.desc')}
        </p>
      </div>

      {/* Editor Section */}
      <div className="flex flex-col gap-2 shrink-0">
        <div className="flex shrink-0 items-center justify-between">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-sm font-medium text-ink hover:text-primary transition-colors cursor-pointer outline-none focus-visible:ds-focus-ring rounded-md"
          >
            <span>{t('tool.markdown.input')}</span>
            <span className="text-xs text-ink-subtle">
              {isExpanded ? '▼' : '▶'}
            </span>
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClear}
              disabled={!input.trim()}
              className="rounded-md border border-hairline bg-surface-1 px-3 py-1 text-xs font-medium text-ink shadow-sm transition-colors hover:bg-surface-2 hover:border-hairline-strong cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('tool.markdown.clear')}
            </button>
            <button
              type="button"
              onClick={loadSample}
              className="rounded-md border border-hairline bg-surface-1 px-3 py-1 text-xs font-medium text-primary shadow-sm transition-colors hover:bg-surface-2 hover:border-hairline-strong cursor-pointer"
            >
              {t('tool.markdown.loadSample')}
            </button>
          </div>
        </div>

        {isExpanded ? (
          <div
            className="relative overflow-hidden rounded-lg border border-hairline shadow-sm bg-surface-1"
            style={{ height: '280px' }}
          >
            <Editor
              height="280px"
              width="100%"
              language="markdown"
              theme={editorTheme}
              value={input}
              options={editorOptions}
              onChange={(v) => onInputChange(v ?? '')}
              onMount={handleEditorDidMount}
              loading={
                <div className="flex h-full items-center justify-center bg-surface-2 text-sm text-ink-subtle">
                  {t('common.loadingEditor')}
                </div>
              }
            />
          </div>
        ) : (
          <div
            onClick={handleExpand}
            className="flex items-center justify-between rounded-lg border border-dashed border-hairline bg-surface-2/50 px-4 py-3 text-sm text-ink-muted cursor-pointer hover:bg-surface-2 hover:text-ink transition-all duration-200"
          >
            <span className="flex items-center gap-2 font-medium">
              📝 {t('tool.markdown.collapsed')}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleExpand()
              }}
              className="rounded px-2.5 py-1 text-xs font-semibold bg-surface-1 border border-hairline text-primary hover:bg-surface-2 cursor-pointer"
            >
              {t('tool.markdown.edit')}
            </button>
          </div>
        )}
      </div>

      {/* Output / Preview Section */}
      {hasInput ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex shrink-0 items-center justify-between">
              <h3 className="text-sm font-medium text-ink">{t('tool.markdown.output')}</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPreviewMaximized(true)}
                  className="rounded-md border border-hairline bg-surface-1 px-3 py-1 text-xs font-medium text-ink shadow-sm transition-colors hover:bg-surface-2 hover:border-hairline-strong cursor-pointer flex items-center gap-1"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>{t('tool.markdown.maximize')}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!output}
                  className="rounded-md border border-hairline bg-surface-1 px-3 py-1 text-xs font-medium text-ink shadow-sm transition-colors hover:bg-surface-2 hover:border-hairline-strong disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {copyLabel}
                </button>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border border-hairline shadow-sm bg-surface-1 min-h-[300px] max-h-[500px] flex flex-col">
              <div className="flex-1 overflow-auto p-6 bg-surface-1">
                <div
                  className="markdown-body text-ink"
                  dangerouslySetInnerHTML={{ __html: output }}
                />
              </div>
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="rounded-md border border-hairline bg-surface-1 px-4 py-2 text-sm font-medium text-ink shadow-sm transition-colors hover:bg-surface-2 hover:border-hairline-strong cursor-pointer"
            >
              {t('tool.markdown.clear')}
            </button>
          </div>

          {/* Status Bar */}
          <div className="shrink-0 rounded-md px-4 py-3 text-sm font-medium bg-primary/10 text-primary border border-primary/20">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                {t('tool.markdown.stats', {
                  words: stats.words,
                  chars: stats.chars,
                  time: stats.readingTime,
                })}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-hairline bg-surface-2/20 py-16 px-4 text-center">
          <svg className="mx-auto h-12 w-12 text-ink-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-4 text-sm text-ink-muted">
            {t('tool.markdown.placeholder')}
          </p>
        </div>
      )}

      {/* Full Webpage Modal Popup Overlay */}
      {isPreviewMaximized && hasInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-semantic-overlay backdrop-blur-[2px] transition-opacity duration-300 animate-fade-in cursor-pointer"
            onClick={() => setIsPreviewMaximized(false)}
            aria-label={t('tool.markdown.minimize')}
          />
          {/* Modal Panel */}
          <div className="relative z-10 flex h-[90vh] w-[90vw] max-w-[90vw] flex-col rounded-xl border border-hairline-strong bg-surface-1 shadow-2xl overflow-hidden animate-zoom-in">
            {/* Modal Header */}
            <div className="flex shrink-0 items-center justify-between px-6 py-4 border-b border-hairline bg-surface-2/40">
              <h3 className="text-base font-semibold text-ink">{t('tool.markdown.output')}</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!output}
                  className="rounded-md border border-hairline bg-surface-1 px-3 py-1.5 text-xs font-medium text-ink shadow-sm transition-colors hover:bg-surface-2 hover:border-hairline-strong disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {copyLabel}
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewMaximized(false)}
                  className="rounded-md border border-hairline bg-surface-1 px-3 py-1.5 text-xs font-medium text-ink shadow-sm transition-colors hover:bg-surface-2 hover:border-hairline-strong cursor-pointer flex items-center gap-1.5"
                >
                  <Minimize2 className="w-4 h-4" />
                  <span>{t('tool.markdown.minimize')}</span>
                </button>
              </div>
            </div>
            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-4 sm:p-6 bg-surface-1">
              <div
                className="markdown-body text-ink"
                dangerouslySetInnerHTML={{ __html: output }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
