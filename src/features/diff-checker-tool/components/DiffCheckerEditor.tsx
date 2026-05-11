import { DiffEditor } from '@monaco-editor/react'
import { useCallback, useRef, useState, type ReactNode } from 'react'
import { useLocale } from '../../../lib/i18n'
import { useDiffChecker } from '../hooks/useDiffChecker'

const EDITOR_THEME = 'vs-dark'
type DiffLanguage =
  | 'json'
  | 'plaintext'
  | 'xml'
  | 'yaml'
  | 'javascript'
  | 'typescript'
  | 'csharp'
  | 'sql'

const editorOptions = {
  minimap: { enabled: false },
  fontSize: 13,
  lineHeight: 18,
  scrollBeyondLastLine: false,
  wordWrap: 'off' as const,
  automaticLayout: true,
  renderSideBySideInlineBreakpoint: 0,
  originalEditable: true,
}

function detectLanguageFromText(text: string): DiffLanguage {
  const trimmed = text.trim()
  if (!trimmed) return 'plaintext'

  try {
    JSON.parse(trimmed)
    return 'json'
  } catch {
    // Keep scanning with simple heuristics.
  }

  if (/^<\?xml|^<[\w-]+[\s>]/i.test(trimmed)) return 'xml'
  if (/^---\s*$|^\s*[\w-]+\s*:\s*.+/m.test(trimmed)) return 'yaml'
  if (/\bnamespace\b|\busing\s+[A-Z][\w.]*\s*;|\bpublic\s+class\b/.test(trimmed)) return 'csharp'
  if (/\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bFROM\b|\bWHERE\b/i.test(trimmed)) return 'sql'
  if (/\binterface\b|\btype\b|\benum\b|\bimplements\b|:\s*[A-Z][\w<>\[\]\|& ,]*/.test(trimmed))
    return 'typescript'
  if (/\bfunction\b|\bconst\b|\blet\b|\bvar\b|=>/.test(trimmed)) return 'javascript'

  return 'plaintext'
}

function ToolbarButton({
  children,
  onClick,
  variant = 'default',
}: {
  children: ReactNode
  onClick: () => void
  variant?: 'default' | 'danger'
}) {
  const base = 'rounded-md px-3 py-2 text-sm font-medium transition-colors'
  const styles =
    variant === 'danger'
      ? 'border border-red-900/60 bg-red-950/40 text-red-200 hover:bg-red-950/70'
      : 'border border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700'

  return (
    <button type="button" className={`${base} ${styles}`} onClick={onClick}>
      {children}
    </button>
  )
}

export function DiffCheckerEditor() {
  const { t } = useLocale()
  const { renderSideBySide, toggleView } = useDiffChecker()
  const originalEditorRef = useRef<{
    getValue: () => string
    setValue: (value: string) => void
    getLayoutInfo: () => { width: number }
  } | null>(null)
  const modifiedEditorRef = useRef<{
    getValue: () => string
    setValue: (value: string) => void
    getLayoutInfo: () => { width: number }
  } | null>(null)
  const originalValueRef = useRef('')
  const modifiedValueRef = useRef('')
  const [originalSnapshot, setOriginalSnapshot] = useState('')
  const [modifiedSnapshot, setModifiedSnapshot] = useState('')
  const [language, setLanguage] = useState<DiffLanguage>('plaintext')
  const [originalLabel, setOriginalLabel] = useState(() => t('tool.diff.original'))
  const [modifiedLabel, setModifiedLabel] = useState(() => t('tool.diff.modified'))
  const [splitWidths, setSplitWidths] = useState({ left: 1, right: 1 })

  const updateDetectedLanguage = useCallback((original: string, modified: string) => {
    const source = modified.trim() ? modified : original
    setLanguage(detectLanguageFromText(source))
  }, [])

  const syncSnapshotsFromEditors = useCallback(() => {
    if (originalEditorRef.current) {
      originalValueRef.current = originalEditorRef.current.getValue()
      setOriginalSnapshot(originalValueRef.current)
    }
    if (modifiedEditorRef.current) {
      modifiedValueRef.current = modifiedEditorRef.current.getValue()
      setModifiedSnapshot(modifiedValueRef.current)
    }
  }, [])

  const handleToggleView = useCallback(() => {
    syncSnapshotsFromEditors()
    toggleView()
  }, [syncSnapshotsFromEditors, toggleView])

  const handleSwap = useCallback(() => {
    const currentOriginal = originalEditorRef.current?.getValue() ?? originalValueRef.current
    const currentModified = modifiedEditorRef.current?.getValue() ?? modifiedValueRef.current

    originalValueRef.current = currentModified
    modifiedValueRef.current = currentOriginal

    originalEditorRef.current?.setValue(currentModified)
    modifiedEditorRef.current?.setValue(currentOriginal)

    setOriginalSnapshot(currentModified)
    setModifiedSnapshot(currentOriginal)
    updateDetectedLanguage(currentModified, currentOriginal)
  }, [updateDetectedLanguage])

  const handleClearAll = useCallback(() => {
    originalValueRef.current = ''
    modifiedValueRef.current = ''
    originalEditorRef.current?.setValue('')
    modifiedEditorRef.current?.setValue('')
    setOriginalSnapshot('')
    setModifiedSnapshot('')
    setLanguage('plaintext')
  }, [])

  const syncSplitWidths = useCallback(() => {
    const leftWidth = originalEditorRef.current?.getLayoutInfo().width ?? 0
    const rightWidth = modifiedEditorRef.current?.getLayoutInfo().width ?? 0
    if (leftWidth > 0 && rightWidth > 0) {
      setSplitWidths({ left: leftWidth, right: rightWidth })
    }
  }, [])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-6 lg:p-8">
      <header className="shrink-0 space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-slate-100 sm:text-2xl">
          {t('tool.diff.title')}
        </h1>
        <p className="text-sm text-slate-400">{t('tool.diff.desc')}</p>
      </header>

      <div className="flex shrink-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <ToolbarButton onClick={handleToggleView}>
            {renderSideBySide ? t('tool.diff.inlineView') : t('tool.diff.sideBySideView')}
          </ToolbarButton>
          <ToolbarButton onClick={handleSwap}>{t('common.swap')}</ToolbarButton>
          <ToolbarButton onClick={handleClearAll} variant="danger">
            {t('tool.diff.clearAll')}
          </ToolbarButton>
        </div>
      </div>

      <div
        className="grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
        style={{
          gridTemplateColumns: renderSideBySide ? `${splitWidths.left}fr ${splitWidths.right}fr` : undefined,
        }}
      >
        <input
          type="text"
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          value={originalLabel}
          onChange={(e) => setOriginalLabel(e.target.value)}
          placeholder={t('tool.diff.original')}
        />
        <input
          type="text"
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          value={modifiedLabel}
          onChange={(e) => setModifiedLabel(e.target.value)}
          placeholder={t('tool.diff.modified')}
        />
      </div>

      <div className="relative min-h-[min(70vh,680px)] flex-1 overflow-hidden rounded-lg border border-slate-700">
        <DiffEditor
          height="100%"
          width="100%"
          original={originalSnapshot}
          modified={modifiedSnapshot}
          originalLanguage={language}
          modifiedLanguage={language}
          originalModelPath={`inmemory://model/${originalLabel.trim() || 'original'}.txt`}
          modifiedModelPath={`inmemory://model/${modifiedLabel.trim() || 'modified'}.txt`}
          onMount={(editor) => {
            const originalEditor = editor.getOriginalEditor()
            const modifiedEditor = editor.getModifiedEditor()
            originalEditorRef.current = originalEditor
            modifiedEditorRef.current = modifiedEditor
            syncSplitWidths()

            originalEditor.onDidChangeModelContent(() => {
              originalValueRef.current = originalEditor.getValue()
              updateDetectedLanguage(originalValueRef.current, modifiedValueRef.current)
            })
            originalEditor.onDidLayoutChange(() => {
              syncSplitWidths()
            })
            modifiedEditor.onDidChangeModelContent(() => {
              modifiedValueRef.current = modifiedEditor.getValue()
              updateDetectedLanguage(originalValueRef.current, modifiedValueRef.current)
            })
            modifiedEditor.onDidLayoutChange(() => {
              syncSplitWidths()
            })
          }}
          options={{
            ...editorOptions,
            renderSideBySide,
          }}
          theme={EDITOR_THEME}
          loading={
            <div className="flex h-full items-center justify-center bg-slate-900 text-sm text-slate-400">
              {t('tool.diff.loading')}
            </div>
          }
        />
      </div>
    </div>
  )
}
