import { DiffEditor } from '@monaco-editor/react'
import { useCallback, useRef, useState, type ReactNode } from 'react'
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
  const { renderSideBySide, toggleView } = useDiffChecker()
  const originalEditorRef = useRef<{
    getValue: () => string
    setValue: (value: string) => void
  } | null>(null)
  const modifiedEditorRef = useRef<{
    getValue: () => string
    setValue: (value: string) => void
  } | null>(null)
  const originalValueRef = useRef('')
  const modifiedValueRef = useRef('')
  const [originalSnapshot, setOriginalSnapshot] = useState('')
  const [modifiedSnapshot, setModifiedSnapshot] = useState('')
  const [language, setLanguage] = useState<DiffLanguage>('plaintext')

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

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-6 lg:p-8">
      <header className="shrink-0 space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-slate-100 sm:text-2xl">
          Text &amp; Code Diff Checker
        </h1>
        <p className="text-sm text-slate-400">
          Compare Original and Modified text with Monaco Diff Editor.
        </p>
      </header>

      <div className="flex shrink-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <ToolbarButton onClick={handleToggleView}>
            {renderSideBySide ? 'Inline View' : 'Side-by-Side View'}
          </ToolbarButton>
          <ToolbarButton onClick={handleSwap}>Swap</ToolbarButton>
          <ToolbarButton onClick={handleClearAll} variant="danger">
            Clear All
          </ToolbarButton>
        </div>
      </div>

      <div className="relative min-h-[min(70vh,680px)] flex-1 overflow-hidden rounded-lg border border-slate-700">
        <DiffEditor
          height="100%"
          width="100%"
          original={originalSnapshot}
          modified={modifiedSnapshot}
          originalLanguage={language}
          modifiedLanguage={language}
          onMount={(editor) => {
            const originalEditor = editor.getOriginalEditor()
            const modifiedEditor = editor.getModifiedEditor()
            originalEditorRef.current = originalEditor
            modifiedEditorRef.current = modifiedEditor

            originalEditor.onDidChangeModelContent(() => {
              originalValueRef.current = originalEditor.getValue()
              updateDetectedLanguage(originalValueRef.current, modifiedValueRef.current)
            })
            modifiedEditor.onDidChangeModelContent(() => {
              modifiedValueRef.current = modifiedEditor.getValue()
              updateDetectedLanguage(originalValueRef.current, modifiedValueRef.current)
            })
          }}
          options={{
            ...editorOptions,
            renderSideBySide,
          }}
          theme={EDITOR_THEME}
          loading={
            <div className="flex h-full items-center justify-center bg-slate-900 text-sm text-slate-400">
              Loading diff editor...
            </div>
          }
        />
      </div>
    </div>
  )
}
