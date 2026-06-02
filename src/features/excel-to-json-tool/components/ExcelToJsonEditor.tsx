import Editor from '@monaco-editor/react'
import { useCallback, useState, useRef } from 'react'
import { Upload, FileSpreadsheet } from 'lucide-react'
import { useLocale } from '../../../lib/i18n'
import { useAdaptiveEditorHeight } from '../../../lib/useAdaptiveEditorHeight'
import { useMonacoEditorTheme } from '../../../lib/useMonacoEditorTheme'
import { useExcelToJson } from '../hooks/useExcelToJson'
import { Button } from '../../../components/ui'

const editorOptions = {
  minimap: { enabled: false },
  fontSize: 14,
  scrollBeyondLastLine: false,
  wordWrap: 'on' as const,
  padding: { top: 8, bottom: 8 },
  automaticLayout: true,
  tabSize: 2,
}

function MonacoPane({
  labelId,
  language,
  value,
  readOnly,
  'aria-invalid': ariaInvalid,
}: {
  labelId: string
  language: string
  value: string
  readOnly: boolean
  'aria-invalid'?: boolean
}) {
  const { t } = useLocale()
  const editorTheme = useMonacoEditorTheme()
  return (
    <div
      className="absolute inset-0 min-h-0"
      aria-labelledby={labelId}
      aria-invalid={ariaInvalid}
    >
      <Editor
        height="100%"
        width="100%"
        language={language}
        theme={editorTheme}
        value={value}
        options={{
          ...editorOptions,
          readOnly,
          ...(readOnly
            ? {
                readOnly: true,
                fixedOverflowWidgets: true,
                wordWrap: 'on' as const,
              }
            : {}),
        }}
        loading={
          <div className="flex h-full items-center justify-center bg-surface-2 text-sm text-ink-subtle">
            {t('common.loadingEditor')}
          </div>
        }
      />
    </div>
  )
}

export function ExcelToJsonEditor() {
  const { t, locale } = useLocale()
  const {
    output,
    error,
    fileName,
    pastedText,
    setPastedText,
    handleFileUpload,
    handlePasteConvert,
    clear,
  } = useExcelToJson()

  const isVi = locale === 'vi'
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const [isDragOver, setIsDragOver] = useState(false)

  const editorHeight = useAdaptiveEditorHeight(pastedText, output)

  const handleCopy = useCallback(async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }
    window.setTimeout(() => setCopyState('idle'), 2000)
  }, [output])

  const handleDownload = useCallback(() => {
    if (!output) return
    const blob = new Blob([output], { type: 'application/json;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'converted.json')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [output])

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }, [handleFileUpload])

  const copyLabel =
    copyState === 'copied' ? t('common.copied') : copyState === 'failed' ? t('common.failed') : t('common.copy')

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[1300px] flex-1 flex-col gap-4 p-6 lg:p-8">
      <div className="shrink-0">
        <p className="text-sm text-ink-muted">{t('tool.excelToJson.desc')}</p>
      </div>

      {error ? (
        <p
          className="shrink-0 rounded-md border border-error-border bg-error-surface px-3 py-2 text-sm text-error-fg"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div
        className="grid min-h-0 grid-cols-1 gap-4 w-full lg:grid-cols-2 lg:gap-6"
        style={{ height: editorHeight }}
      >
        {/* Left Column - Excel Upload & Paste */}
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <span className="shrink-0 text-sm font-medium text-ink">
            {isVi ? 'Tải lên hoặc Dán dữ liệu' : 'Upload or Paste Data'}
          </span>
          
          {/* File Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer flex flex-col items-center justify-center gap-2 group transition-all ${
              isDragOver
                ? 'border-primary bg-primary/5'
                : 'border-hairline bg-surface-2/35 hover:bg-surface-2/70 hover:border-hairline-strong'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv,.tsv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileUpload(e.target.files[0])
                }
              }}
            />
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-1 border border-hairline text-primary group-hover:scale-110 transition-transform">
              {fileName ? <FileSpreadsheet className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-sm font-medium text-ink">
                {fileName ? fileName : (isVi ? 'Nhấp để tải lên tệp Excel' : 'Click to upload Excel file')}
              </p>
              <p className="text-xs text-ink-muted mt-1">
                {fileName ? (isVi ? 'Tệp đã tải lên thành công' : 'File uploaded successfully') : 'Supports .xlsx, .xls, .csv, .tsv files'}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-hairline"></div>
            </div>
            <div className="relative bg-canvas px-3 text-xs font-medium uppercase tracking-wider text-ink-subtle">
              {isVi ? '— hoặc dán trực tiếp dữ liệu từ Excel —' : '— or paste data directly from Excel —'}
            </div>
          </div>

          {/* Paste Text Area */}
          <div className="flex min-h-0 flex-1 flex-col gap-2">
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder={isVi ? 'Sao chép các ô từ Excel và dán vào đây (Ctrl+V / Cmd+V)' : 'Copy cells from Excel and paste here (Ctrl+V / Cmd+V)'}
              className="w-full flex-1 min-h-[120px] rounded-lg border border-hairline bg-surface-1 px-3 py-2 text-sm text-ink outline-none transition-colors hover:border-hairline-strong focus:border-hairline-strong focus:ds-focus-ring placeholder:text-ink-tertiary font-mono resize-none"
            />
            <div className="flex shrink-0">
              <Button
                onClick={() => handlePasteConvert(pastedText)}
                disabled={!pastedText}
                size="sm"
              >
                {isVi ? 'Chuyển đổi dữ liệu đã dán' : 'Convert Pasted Data'}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column - JSON Output */}
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <div className="flex items-center justify-between">
            <span id="json-output-label" className="shrink-0 text-sm font-medium text-ink">
              JSON Output
            </span>
            <div className="flex gap-2">
              <Button
                onClick={handleCopy}
                disabled={!output}
                size="sm"
              >
                {copyLabel}
              </Button>
              <Button
                onClick={handleDownload}
                disabled={!output}
                size="sm"
              >
                Download
              </Button>
            </div>
          </div>
          <div className="relative h-full overflow-hidden rounded-lg border border-hairline shadow-sm bg-surface-1">
            {output ? (
              <MonacoPane labelId="json-output-label" language="json" value={output} readOnly />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-ink-muted">
                JSON output will appear here...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Privacy note */}
      <div className="rounded-lg border border-hairline bg-surface-2 p-3 px-4 flex items-start gap-2 text-xs text-ink-muted shrink-0">
        <span>💡</span>
        <p>
          {isVi
            ? 'Bảo mật: Tệp của bạn được xử lý hoàn toàn trong trình duyệt của bạn. Không có dữ liệu nào được tải lên máy chủ.'
            : 'Privacy: Your file is processed entirely in your browser. No data is uploaded to any server.'}
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        <Button onClick={clear}>
          {t('common.clear')}
        </Button>
      </div>
    </div>
  )
}
