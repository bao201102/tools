import { DiffEditor } from '@monaco-editor/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocalStorageState } from '../../../lib/useLocalStorageState'
import { useLocale } from '../../../lib/i18n'
import { useAdaptiveEditorHeightWithOptions } from '../../../lib/useAdaptiveEditorHeight'
import { useMonacoEditorTheme } from '../../../lib/useMonacoEditorTheme'
import { useDiffChecker } from '../hooks/useDiffChecker'
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

import { Button, Input } from '../../../components/ui'

export function DiffCheckerEditor() {
  const { t } = useLocale()
  const editorTheme = useMonacoEditorTheme()
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
  const [originalSnapshot, setOriginalSnapshot] = useLocalStorageState('diff-checker:originalSnapshot', '')
  const [modifiedSnapshot, setModifiedSnapshot] = useLocalStorageState('diff-checker:modifiedSnapshot', '')
  const [language, setLanguage] = useState<DiffLanguage>('plaintext')
  const [originalLabel, setOriginalLabel] = useLocalStorageState('diff-checker:originalLabel', () => t('tool.diff.original'))
  const [modifiedLabel, setModifiedLabel] = useLocalStorageState('diff-checker:modifiedLabel', () => t('tool.diff.modified'))
  const [splitWidths, setSplitWidths] = useState({ left: 1, right: 1 })
  const [copyOriginalState, setCopyOriginalState] = useState<'idle' | 'copied'>('idle')
  const [copyModifiedState, setCopyModifiedState] = useState<'idle' | 'copied'>('idle')
  const editorHeight = useAdaptiveEditorHeightWithOptions(
    [originalSnapshot, modifiedSnapshot],
    { wordWrap: false, lineHeightPx: 18 },
  )

  const handleCopy = useCallback(async (text: string, pane: 'original' | 'modified') => {
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
    } catch {
      // ignore
    }
  }, [])

  const updateDetectedLanguage = useCallback((original: string, modified: string) => {
    const source = modified.trim() ? modified : original
    setLanguage(detectLanguageFromText(source))
  }, [])

  useEffect(() => {
    updateDetectedLanguage(originalSnapshot, modifiedSnapshot)
  }, [originalSnapshot, modifiedSnapshot, updateDetectedLanguage])

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
    <div className="mx-auto flex min-h-0 w-full max-w-[1300px] flex-1 flex-col gap-4 p-6 lg:p-8">
      <div className="shrink-0">
        <p className="text-sm text-ink-muted">{t('tool.diff.desc')}</p>
      </div>

      <div
        className="grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
        style={{
          gridTemplateColumns: renderSideBySide ? `${splitWidths.left}fr ${splitWidths.right}fr` : undefined,
        }}
      >
        <div className="flex gap-2">
          <Input
            type="text"
            className="flex-1 min-h-10"
            value={originalLabel}
            onChange={(e) => setOriginalLabel(e.target.value)}
            placeholder={t('tool.diff.original')}
          />
          <Button
            onClick={() => handleCopy(originalSnapshot, 'original')}
            disabled={!originalSnapshot}
            className="text-xs whitespace-nowrap"
          >
            {copyOriginalState === 'copied' ? t('common.copied') : t('common.copy')}
          </Button>
        </div>
        <div className="flex gap-2">
          <Input
            type="text"
            className="flex-1 min-h-10"
            value={modifiedLabel}
            onChange={(e) => setModifiedLabel(e.target.value)}
            placeholder={t('tool.diff.modified')}
          />
          <Button
            onClick={() => handleCopy(modifiedSnapshot, 'modified')}
            disabled={!modifiedSnapshot}
            className="text-xs whitespace-nowrap"
          >
            {copyModifiedState === 'copied' ? t('common.copied') : t('common.copy')}
          </Button>
        </div>
      </div>

      <div
        className="relative overflow-hidden rounded-lg border border-hairline shadow-sm"
        style={{ height: editorHeight }}
      >
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
              const newValue = originalEditor.getValue()
              originalValueRef.current = newValue
              setOriginalSnapshot(newValue)
              updateDetectedLanguage(newValue, modifiedValueRef.current)
            })
            originalEditor.onDidLayoutChange(() => {
              syncSplitWidths()
            })
            modifiedEditor.onDidChangeModelContent(() => {
              const newValue = modifiedEditor.getValue()
              modifiedValueRef.current = newValue
              setModifiedSnapshot(newValue)
              updateDetectedLanguage(originalValueRef.current, newValue)
            })
            modifiedEditor.onDidLayoutChange(() => {
              syncSplitWidths()
            })
          }}
          options={{
            ...editorOptions,
            renderSideBySide,
          }}
          theme={editorTheme}
          loading={
            <div className="flex h-full items-center justify-center bg-surface-2 text-sm text-ink-subtle">
              {t('tool.diff.loading')}
            </div>
          }
        />
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        <Button onClick={handleToggleView}>
          {renderSideBySide ? t('tool.diff.inlineView') : t('tool.diff.sideBySideView')}
        </Button>
        <Button onClick={handleSwap}>{t('common.swap')}</Button>
        <Button onClick={handleClearAll}>
          {t('tool.diff.clearAll')}
        </Button>
      </div>
    </div>
  )
}
