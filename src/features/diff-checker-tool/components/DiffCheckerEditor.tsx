import { DiffEditor } from '@monaco-editor/react'
import { useCallback, useRef, useState, type ReactNode } from 'react'
import { type DiffLanguage, useDiffChecker } from '../hooks/useDiffChecker'

const EDITOR_THEME = 'vs-dark'

const editorOptions = {
  minimap: { enabled: false },
  fontSize: 14,
  scrollBeyondLastLine: false,
  wordWrap: 'on' as const,
  automaticLayout: true,
  renderSideBySideInlineBreakpoint: 0,
  originalEditable: true,
}

const languages: { value: DiffLanguage; label: string }[] = [
  { value: 'json', label: 'JSON' },
  { value: 'plaintext', label: 'Plain Text' },
  { value: 'xml', label: 'XML' },
  { value: 'yaml', label: 'YAML' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'csharp', label: 'C#' },
  { value: 'sql', label: 'SQL' },
]

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
  const {
    language,
    renderSideBySide,
    setLanguage,
    toggleView,
  } = useDiffChecker()
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

  const handleChangeLanguage = useCallback(
    (next: DiffLanguage) => {
      syncSnapshotsFromEditors()
      setLanguage(next)
    },
    [setLanguage, syncSnapshotsFromEditors],
  )

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
  }, [])

  const handleClearAll = useCallback(() => {
    originalValueRef.current = ''
    modifiedValueRef.current = ''
    originalEditorRef.current?.setValue('')
    modifiedEditorRef.current?.setValue('')
    setOriginalSnapshot('')
    setModifiedSnapshot('')
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
        <div className="grid grid-cols-1 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-400">Language</span>
            <select
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              value={language}
              onChange={(e) => handleChangeLanguage(e.target.value as DiffLanguage)}
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </label>
        </div>

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
            })
            modifiedEditor.onDidChangeModelContent(() => {
              modifiedValueRef.current = modifiedEditor.getValue()
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
