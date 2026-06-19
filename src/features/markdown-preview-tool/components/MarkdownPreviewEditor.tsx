import Editor from '@monaco-editor/react'
import { useCallback, useState, useRef, useEffect } from 'react'
import { Maximize2, Minimize2, X } from 'lucide-react'
import { useLocale } from '../../../lib/i18n'
import { useMonacoEditorTheme } from '../../../lib/useMonacoEditorTheme'
import { useMarkdownPreview } from '../hooks/useMarkdownPreview'
import '../styles/markdown-preview.css'
import { Button } from '../../../components/ui'

const editorOptions = {
  minimap: { enabled: false },
  fontSize: 14,
  scrollBeyondLastLine: false,
  wordWrap: 'on' as const,
  padding: { top: 12, bottom: 12 },
  automaticLayout: true,
  tabSize: 2,
  lineNumbers: 'on' as const,
  fixedOverflowWidgets: true,
}

// ─── Image Lightbox ───────────────────────────────────────────────────────────
function ImageLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-semantic-overlay backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-[90vw] max-h-[90vh] animate-zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain"
        />
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full border border-hairline bg-surface-1 shadow-md text-ink hover:bg-surface-2 cursor-pointer transition-colors outline-none focus-visible:ds-focus-ring"
        >
          <X className="w-4 h-4" />
        </button>
        {alt && (
          <p className="mt-2 text-center text-sm text-ink-muted">{alt}</p>
        )}
      </div>
    </div>
  )
}

// ─── Preview Container (handles image click delegation + diagram zoom/pan) ───
function PreviewContent({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null)
  const zoomStatesRef = useRef<Map<string, { scale: number; x: number; y: number }>>(new Map())

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // ─── 1. Restore zoom/pan transformations for rendered charts ───
    const wrappers = el.querySelectorAll('.mermaid-wrapper')
    wrappers.forEach((wrapper, index) => {
      const id = wrapper.getAttribute('data-id') || `chart-${index}`
      const content = wrapper.querySelector('.mermaid-content') as HTMLElement | null
      const viewport = wrapper.querySelector('.mermaid-viewport') as HTMLElement | null
      if (content) {
        const state = zoomStatesRef.current.get(id) || { scale: 1, x: 0, y: 0 }
        content.style.transform = `translate(${state.x}px, ${state.y}px) scale(${state.scale})`
      }
      if (viewport) {
        viewport.style.cursor = 'grab'
      }
    })

    // ─── 2. Click Handler (Lightbox + Copy Code + Mermaid Controls) ───
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      // Lightbox click delegation
      const img = target.closest('img') as HTMLImageElement | null
      if (img) {
        e.preventDefault()
        setLightbox({ src: img.src, alt: img.alt ?? '' })
        return
      }

      // Copy Code button click delegation
      const copyBtn = target.closest('.md-copy-btn') as HTMLButtonElement | null
      if (copyBtn) {
        e.preventDefault()
        const codeBlock = copyBtn.closest('.md-code-block') as HTMLDivElement | null
        const encodedCode = codeBlock?.getAttribute('data-code')
        if (encodedCode) {
          const rawCode = decodeURIComponent(encodedCode)
          navigator.clipboard.writeText(rawCode).then(() => {
            copyBtn.classList.add('copied')
            setTimeout(() => {
              copyBtn.classList.remove('copied')
            }, 2000)
          }).catch((err) => {
            console.error('Failed to copy code', err)
          })
        }
        return
      }

      // Mermaid Control Buttons click delegation
      const controlBtn = target.closest('.mermaid-control-btn') as HTMLButtonElement | null
      if (controlBtn) {
        e.preventDefault()
        e.stopPropagation()
        const wrapper = controlBtn.closest('.mermaid-wrapper') as HTMLElement | null
        if (!wrapper) return
        const id = wrapper.getAttribute('data-id') ?? ''
        const content = wrapper.querySelector('.mermaid-content') as HTMLElement | null
        if (!content) return

        const state = zoomStatesRef.current.get(id) || { scale: 1, x: 0, y: 0 }
        let { scale, x, y } = state

        if (controlBtn.classList.contains('zoom-in')) {
          scale = Math.min(scale * 1.25, 10)
        } else if (controlBtn.classList.contains('zoom-out')) {
          scale = Math.max(scale * 0.8, 0.15)
        } else if (controlBtn.classList.contains('zoom-reset')) {
          scale = 1
          x = 0
          y = 0
        }

        content.style.transition = 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)'
        content.style.transform = `translate(${x}px, ${y}px) scale(${scale})`
        zoomStatesRef.current.set(id, { scale, x, y })
      }
    }

    // ─── 3. Wheel Zoom Handler delegation ───
    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return

      const viewport = (e.target as HTMLElement).closest('.mermaid-viewport') as HTMLElement | null
      if (!viewport) return

      e.preventDefault()
      e.stopPropagation()

      const wrapper = viewport.closest('.mermaid-wrapper') as HTMLElement | null
      const content = viewport.querySelector('.mermaid-content') as HTMLElement | null
      if (!wrapper || !content) return

      const id = wrapper.getAttribute('data-id') ?? ''
      const state = zoomStatesRef.current.get(id) || { scale: 1, x: 0, y: 0 }
      const oldScale = state.scale

      const factor = e.deltaY < 0 ? 1.15 : 0.85
      const scale = Math.min(Math.max(oldScale * factor, 0.15), 10)

      const rect = viewport.getBoundingClientRect()
      const cx = e.clientX - rect.left
      const cy = e.clientY - rect.top

      const x = cx - (cx - state.x) * (scale / oldScale)
      const y = cy - (cy - state.y) * (scale / oldScale)

      content.style.transition = 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)'
      content.style.transform = `translate(${x}px, ${y}px) scale(${scale})`
      zoomStatesRef.current.set(id, { scale, x, y })
    }

    // ─── 4. Mousedown Drag Handler delegation (Pan) ───
    let activeDrag: {
      id: string
      viewport: HTMLElement
      content: HTMLElement
      startX: number
      startY: number
      lastX: number
      lastY: number
    } | null = null

    const handleMouseMove = (ev: MouseEvent) => {
      if (!activeDrag) return
      const dx = ev.clientX - activeDrag.startX
      const dy = ev.clientY - activeDrag.startY
      const x = activeDrag.lastX + dx
      const y = activeDrag.lastY + dy

      const state = zoomStatesRef.current.get(activeDrag.id) || { scale: 1, x: 0, y: 0 }
      activeDrag.content.style.transition = 'none'
      activeDrag.content.style.transform = `translate(${x}px, ${y}px) scale(${state.scale})`

      zoomStatesRef.current.set(activeDrag.id, { scale: state.scale, x, y })
    }

    const handleMouseUp = () => {
      if (!activeDrag) return
      activeDrag.viewport.style.cursor = 'grab'
      activeDrag = null
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return // Left click only
      const target = e.target as HTMLElement
      
      // Do not initiate drag if clicking control buttons
      if (target.closest('.mermaid-controls')) return

      const viewport = target.closest('.mermaid-viewport') as HTMLElement | null
      if (!viewport) return

      const wrapper = viewport.closest('.mermaid-wrapper') as HTMLElement | null
      const content = viewport.querySelector('.mermaid-content') as HTMLElement | null
      if (!wrapper || !content) return

      e.preventDefault()
      const id = wrapper.getAttribute('data-id') ?? ''
      const state = zoomStatesRef.current.get(id) || { scale: 1, x: 0, y: 0 }

      activeDrag = {
        id,
        viewport,
        content,
        startX: e.clientX,
        startY: e.clientY,
        lastX: state.x,
        lastY: state.y
      }
      viewport.style.cursor = 'grabbing'

      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    // ─── 5. Double Click Reset delegation ───
    const handleDblClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const viewport = target.closest('.mermaid-viewport') as HTMLElement | null
      if (!viewport) return

      const wrapper = viewport.closest('.mermaid-wrapper') as HTMLElement | null
      const content = viewport.querySelector('.mermaid-content') as HTMLElement | null
      if (!wrapper || !content) return

      e.preventDefault()
      const id = wrapper.getAttribute('data-id') ?? ''
      content.style.transition = 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)'
      content.style.transform = 'translate(0px, 0px) scale(1)'
      zoomStatesRef.current.set(id, { scale: 1, x: 0, y: 0 })
    }

    // Bind event listeners to parent container using Event Delegation
    el.addEventListener('click', handleClick)
    el.addEventListener('wheel', handleWheel, { passive: false })
    el.addEventListener('mousedown', handleMouseDown)
    el.addEventListener('dblclick', handleDblClick)

    return () => {
      el.removeEventListener('click', handleClick)
      el.removeEventListener('wheel', handleWheel)
      el.removeEventListener('mousedown', handleMouseDown)
      el.removeEventListener('dblclick', handleDblClick)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [html])

  return (
    <>
      <div
        ref={containerRef}
        className="markdown-body text-ink"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {lightbox && (
        <ImageLightbox
          src={lightbox.src}
          alt={lightbox.alt}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function MarkdownPreviewEditor() {
  const { t } = useLocale()
  const editorTheme = useMonacoEditorTheme()
  const { input, output, stats, onInputChange, clear, loadSample } = useMarkdownPreview()

  const [isExpanded, setIsExpanded] = useState(true)
  const [isPreviewMaximized, setIsPreviewMaximized] = useState(false)
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const [syncScroll, setSyncScroll] = useState(true)
  const [editorInstance, setEditorInstance] = useState<any>(null)

  const editorRef = useRef<any>(null)
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const previewScrollContainerRef = useRef<HTMLDivElement>(null)

  const scrollAnchorsRef = useRef<{ e: number; p: number }[] | null>(null)

  // Body scroll-lock + Escape dismiss for full-page modal
  useEffect(() => {
    if (!isPreviewMaximized) return
    const orig = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsPreviewMaximized(false) }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = orig
      window.removeEventListener('keydown', onKey)
    }
  }, [isPreviewMaximized])

  // Bi-directional Scroll Sync (Dense Element-based Local Interpolation with Dynamic State Lock)
  useEffect(() => {
    const editor = editorInstance
    const previewContainer = previewScrollContainerRef.current

    if (!editor || !previewContainer || !syncScroll) return

    // Reset cache when dependencies change
    scrollAnchorsRef.current = null

    const handleResize = () => {
      scrollAnchorsRef.current = null
    }
    window.addEventListener('resize', handleResize)

    // ─── Scroll-source lock ───
    // Whichever pane the user actively scrolls becomes the "owner" for a short
    // window. Programmatic scrolls triggered on the other pane are ignored so
    // they don't bounce back and fight the user. This replaces the fragile
    // hover/focus heuristics and makes sync work reliably while typing too.
    let lockedBy: 'editor' | 'preview' | null = null
    let unlockTimer: number | undefined
    const unlockSoon = () => {
      if (unlockTimer !== undefined) clearTimeout(unlockTimer)
      unlockTimer = window.setTimeout(() => { lockedBy = null }, 80)
    }

    // Generates mapping anchors between Editor lines and Preview elements
    const getScrollAnchors = () => {
      const editorScrollHeight = editor.getScrollHeight()
      const editorLayoutHeight = editor.getLayoutInfo().height
      const editorMaxScroll = editorScrollHeight - editorLayoutHeight

      const previewMaxScroll = previewContainer.scrollHeight - previewContainer.clientHeight

      // If we have cached element anchors, copy them and append the live end anchor
      if (scrollAnchorsRef.current) {
        const anchors = [...scrollAnchorsRef.current]
        const last = anchors[anchors.length - 1]
        if (!last || last.e < editorMaxScroll || last.p < previewMaxScroll) {
          anchors.push({ e: editorMaxScroll, p: previewMaxScroll })
        }
        return { anchors, editorMaxScroll, previewMaxScroll }
      }

      const elementAnchors: { e: number; p: number }[] = [{ e: 0, p: 0 }]

      if (editorMaxScroll <= 0 || previewMaxScroll <= 0) {
        return { anchors: elementAnchors, editorMaxScroll, previewMaxScroll }
      }

      const elementsHTML = Array.from(previewContainer.querySelectorAll('[data-line]')) as HTMLElement[]
      const previewContainerRect = previewContainer.getBoundingClientRect()
      const rawAnchors: { e: number; p: number }[] = []

      for (const el of elementsHTML) {
        const lineAttr = el.getAttribute('data-line')
        if (!lineAttr) continue
        const lineNum = parseInt(lineAttr, 10)
        if (isNaN(lineNum) || lineNum <= 0) continue

        let eTop = editor.getTopForLineNumber(lineNum)
        const elRect = el.getBoundingClientRect()
        let pTop = elRect.top - previewContainerRect.top + previewContainer.scrollTop

        if (typeof eTop === 'number' && !isNaN(eTop) && typeof pTop === 'number' && !isNaN(pTop)) {
          // Clamp coordinates to max scroll ranges to handle bottom-most elements accurately
          if (eTop > editorMaxScroll) eTop = editorMaxScroll
          if (pTop > previewMaxScroll) pTop = previewMaxScroll
          rawAnchors.push({ e: eTop, p: pTop })
        }
      }

      // Ensure monotonic ordering
      rawAnchors.sort((a, b) => a.e - b.e)

      // Filter to ensure strict monotonicity (both e and p must increase)
      for (const curr of rawAnchors) {
        const last = elementAnchors[elementAnchors.length - 1]
        if (curr.e > last.e && curr.p > last.p) {
          elementAnchors.push(curr)
        }
      }

      // Cache element anchors (without the final end anchor to prevent stale heights)
      scrollAnchorsRef.current = elementAnchors

      // Create final return anchors array with the live end anchor
      const anchors = [...elementAnchors]
      const last = anchors[anchors.length - 1]
      if (!last || last.e < editorMaxScroll || last.p < previewMaxScroll) {
        anchors.push({ e: editorMaxScroll, p: previewMaxScroll })
      }

      return { anchors, editorMaxScroll, previewMaxScroll }
    }

    const handleEditorScroll = () => {
      // Ignore scrolls that are the programmatic reaction to preview scrolling.
      if (lockedBy === 'preview') { unlockSoon(); return }
      lockedBy = 'editor'
      unlockSoon()

      const editorScrollTop = editor.getScrollTop()
      const { anchors, editorMaxScroll, previewMaxScroll } = getScrollAnchors()

      if (editorMaxScroll > 0 && previewMaxScroll > 0) {
        const snapThreshold = Math.min(25, editorMaxScroll / 4)
        const snapTopThreshold = Math.min(5, editorMaxScroll / 10)

        // 1. Boundary hard snaps
        if (editorScrollTop <= snapTopThreshold) {
          previewContainer.scrollTop = 0
          return
        }
        if (editorScrollTop >= editorMaxScroll - snapThreshold) {
          previewContainer.scrollTop = previewMaxScroll
          return
        }

        // 2. Local element interpolation
        let a1 = anchors[0]
        let a2 = anchors[anchors.length - 1]

        for (let i = 0; i < anchors.length - 1; i++) {
          if (anchors[i].e <= editorScrollTop && editorScrollTop <= anchors[i + 1].e) {
            a1 = anchors[i]
            a2 = anchors[i + 1]
            break
          }
        }

        let pct = 0
        const eDiff = a2.e - a1.e
        if (eDiff > 0) {
          pct = (editorScrollTop - a1.e) / eDiff
        }
        const interpolatedScrollTop = a1.p + pct * (a2.p - a1.p)
        let targetScrollTop = interpolatedScrollTop

        // 3. Adaptive boundary blending
        const blendTopZone = Math.min(50, editorMaxScroll / 5)
        const blendBottomZone = Math.min(60, editorMaxScroll / 3)

        if (editorScrollTop < blendTopZone && blendTopZone > 0) {
          const t = editorScrollTop / blendTopZone
          targetScrollTop = t * interpolatedScrollTop
        } else if (editorScrollTop > editorMaxScroll - blendBottomZone && blendBottomZone > 0) {
          const t = (editorScrollTop - (editorMaxScroll - blendBottomZone)) / blendBottomZone
          const clampedT = Math.min(Math.max(t, 0), 1)
          targetScrollTop = (1 - clampedT) * interpolatedScrollTop + clampedT * previewMaxScroll
        }

        previewContainer.scrollTop = targetScrollTop
      }
    }

    const handlePreviewScroll = () => {
      // Ignore scrolls that are the programmatic reaction to editor scrolling.
      if (lockedBy === 'editor') { unlockSoon(); return }
      lockedBy = 'preview'
      unlockSoon()

      const previewScrollTop = previewContainer.scrollTop
      const { anchors, editorMaxScroll, previewMaxScroll } = getScrollAnchors()

      if (editorMaxScroll > 0 && previewMaxScroll > 0) {
        const snapThreshold = Math.min(30, previewMaxScroll / 4)
        const snapTopThreshold = Math.min(5, previewMaxScroll / 10)

        // 1. Boundary hard snaps
        if (previewScrollTop <= snapTopThreshold) {
          editor.setScrollTop(0)
          return
        }
        if (previewScrollTop >= previewMaxScroll - snapThreshold) {
          editor.setScrollTop(editorMaxScroll)
          return
        }

        // 2. Local element interpolation
        let a1 = anchors[0]
        let a2 = anchors[anchors.length - 1]

        for (let i = 0; i < anchors.length - 1; i++) {
          if (anchors[i].p <= previewScrollTop && previewScrollTop <= anchors[i + 1].p) {
            a1 = anchors[i]
            a2 = anchors[i + 1]
            break
          }
        }

        let pct = 0
        const pDiff = a2.p - a1.p
        if (pDiff > 0) {
          pct = (previewScrollTop - a1.p) / pDiff
        }
        const interpolatedScrollTop = a1.e + pct * (a2.e - a1.e)
        let targetScrollTop = interpolatedScrollTop

        // 3. Adaptive boundary blending
        const blendTopZone = Math.min(60, previewMaxScroll / 5)
        const blendBottomZone = Math.min(80, previewMaxScroll / 3)

        if (previewScrollTop < blendTopZone && blendTopZone > 0) {
          const t = previewScrollTop / blendTopZone
          targetScrollTop = t * interpolatedScrollTop
        } else if (previewScrollTop > previewMaxScroll - blendBottomZone && blendBottomZone > 0) {
          const t = (previewScrollTop - (previewMaxScroll - blendBottomZone)) / blendBottomZone
          const clampedT = Math.min(Math.max(t, 0), 1)
          targetScrollTop = (1 - clampedT) * interpolatedScrollTop + clampedT * editorMaxScroll
        }

        editor.setScrollTop(targetScrollTop)
      }
    }

    const disposable = editor.onDidScrollChange(handleEditorScroll)
    previewContainer.addEventListener('scroll', handlePreviewScroll)

    return () => {
      disposable.dispose()
      previewContainer.removeEventListener('scroll', handlePreviewScroll)
      window.removeEventListener('resize', handleResize)
      if (unlockTimer !== undefined) clearTimeout(unlockTimer)
    }
  }, [editorInstance, isExpanded, syncScroll, output])

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor
    setEditorInstance(editor)
  }

  const handleExpand = useCallback(() => {
    setIsExpanded(true)
    setTimeout(() => editorRef.current?.focus(), 50)
  }, [])

  const handleClear = useCallback(() => {
    clear()
    setIsExpanded(true)
    setIsPreviewMaximized(false)
    setTimeout(() => editorRef.current?.focus(), 50)
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
    copyState === 'copied' ? t('common.copied') + '!'
    : copyState === 'failed' ? t('common.failed')
    : t('tool.markdown.copyHtml')

  const hasInput = input.trim() !== ''

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[1300px] flex-1 flex-col gap-4 p-4 pb-20 sm:p-6 lg:p-8 lg:pb-28">
      <div className="shrink-0">
        <p className="text-sm text-ink-muted">{t('tool.markdown.desc')}</p>
      </div>

      {isExpanded ? (
        <div className="flex flex-col gap-4 flex-1 min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 flex-1 min-h-[400px] max-h-[calc(100dvh-200px)]">
            {/* Left Pane: Editor */}
            <div className="flex flex-col h-full gap-2 min-h-0">
              <div className="flex shrink-0 items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="flex items-center gap-1.5 text-sm font-medium text-ink hover:text-primary transition-colors cursor-pointer outline-none focus-visible:ds-focus-ring rounded-md"
                >
                  <span>{t('tool.markdown.input')}</span>
                  <span className="text-xs text-ink-subtle">▼</span>
                </button>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs text-ink-muted cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={syncScroll}
                      onChange={(e) => setSyncScroll(e.target.checked)}
                      className="accent-primary rounded border-hairline w-3.5 h-3.5"
                    />
                    <span>Sync Scroll</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleClear}
                      disabled={!input.trim()}
                      className="cursor-pointer"
                    >
                      {t('tool.markdown.clear')}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={loadSample}
                      className="cursor-pointer text-primary hover:text-primary-hover"
                    >
                      {t('tool.markdown.loadSample')}
                    </Button>
                  </div>
                </div>
              </div>

              <div ref={editorContainerRef} className="flex-1 min-h-0 relative overflow-hidden rounded-lg border border-hairline shadow-sm bg-surface-1" style={{ touchAction: 'pan-y' }}>
                <Editor
                  height="100%"
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
            </div>

            {/* Right Pane: Preview */}
            <div className="flex flex-col h-full gap-2 min-h-0">
              <div className="flex shrink-0 items-center justify-between h-[28px]">
                <h3 className="text-sm font-medium text-ink">{t('tool.markdown.output')}</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsPreviewMaximized(true)}
                    className="cursor-pointer flex items-center gap-1"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>{t('tool.markdown.maximize')}</span>
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCopy}
                    disabled={!output}
                    className="cursor-pointer"
                  >
                    {copyLabel}
                  </Button>
                </div>
              </div>

              <div className="flex-1 min-h-0 relative overflow-hidden rounded-lg border border-hairline shadow-sm bg-surface-1 flex flex-col">
                <div ref={previewScrollContainerRef} className="flex-1 overflow-auto p-6 bg-surface-1">
                  {hasInput ? (
                    <PreviewContent html={output} />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-center py-20">
                      <svg className="mx-auto h-12 w-12 text-ink-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="mt-4 text-sm text-ink-muted">{t('tool.markdown.placeholder')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Collapsed Editor and Full Width Preview */
        <div className="flex flex-col gap-4">
          <div
            onClick={handleExpand}
            className="flex items-center justify-between rounded-lg border border-dashed border-hairline bg-surface-2/50 px-4 py-3 text-sm text-ink-muted cursor-pointer hover:bg-surface-2 hover:text-ink transition-all duration-200"
          >
            <span className="flex items-center gap-2 font-medium">📝 {t('tool.markdown.collapsed')}</span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleExpand() }}
              className="rounded px-2.5 py-1 text-xs font-semibold bg-surface-1 border border-hairline text-primary hover:bg-surface-2 cursor-pointer outline-none focus-visible:ds-focus-ring"
            >
              {t('tool.markdown.edit')}
            </button>
          </div>

          {hasInput ? (
            <div className="flex flex-col gap-2">
              <div className="flex shrink-0 items-center justify-between">
                <h3 className="text-sm font-medium text-ink">{t('tool.markdown.output')}</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsPreviewMaximized(true)}
                    className="cursor-pointer flex items-center gap-1"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>{t('tool.markdown.maximize')}</span>
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCopy}
                    disabled={!output}
                    className="cursor-pointer"
                  >
                    {copyLabel}
                  </Button>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-lg border border-hairline shadow-sm bg-surface-1 min-h-[400px] max-h-[600px] flex flex-col">
                <div ref={previewScrollContainerRef} className="flex-1 overflow-auto p-6 bg-surface-1">
                  <PreviewContent html={output} />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-hairline bg-surface-2/20 py-16 px-4 text-center">
              <svg className="mx-auto h-12 w-12 text-ink-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-4 text-sm text-ink-muted">{t('tool.markdown.placeholder')}</p>
            </div>
          )}
        </div>
      )}

      {/* Stats Bar (spanning full width below both panes, rendered if there is input) */}
      {hasInput && (
        <div className="shrink-0 rounded-md px-4 py-3 text-sm font-medium bg-primary/10 text-primary border border-primary/20 mt-4 animate-fade-in">
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
      )}

      {/* Spacer to prevent content from touching page bottom in flex overflow layouts */}
      <div className="h-16 w-full shrink-0" aria-hidden="true" />

      {/* ── Full-Page Modal ── */}
      {isPreviewMaximized && hasInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-semantic-overlay backdrop-blur-[2px] animate-fade-in cursor-pointer"
            onClick={() => setIsPreviewMaximized(false)}
          />
          {/* Panel */}
          <div className="relative z-10 flex h-[90vh] w-[90vw] max-w-[90vw] flex-col rounded-xl border border-hairline-strong bg-surface-1 shadow-2xl overflow-hidden animate-zoom-in">
            {/* Modal Header */}
            <div className="flex shrink-0 items-center justify-between px-6 py-4 border-b border-hairline bg-surface-2/40">
              <h3 className="text-base font-semibold text-ink">{t('tool.markdown.output')}</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopy}
                  disabled={!output}
                  className="cursor-pointer"
                >
                  {copyLabel}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsPreviewMaximized(false)}
                  className="cursor-pointer flex items-center gap-1.5"
                >
                  <Minimize2 className="w-4 h-4" />
                  <span>{t('tool.markdown.minimize')}</span>
                </Button>
              </div>
            </div>
            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-4 sm:p-6 bg-surface-1">
              <PreviewContent html={output} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
