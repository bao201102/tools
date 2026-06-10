import Editor from '@monaco-editor/react'
import { useCallback } from 'react'
import { useLocale } from '../../../lib/i18n'
import { useAdaptiveEditorHeight } from '../../../lib/useAdaptiveEditorHeight'
import { useMonacoEditorTheme } from '../../../lib/useMonacoEditorTheme'
import { useJsonToExcel } from '../hooks/useJsonToExcel'
import { Button } from '../../../components/ui'

const editorOptions = {
  minimap: { enabled: false },
  fontSize: 14,
  scrollBeyondLastLine: false,
  wordWrap: 'on' as const,
  padding: { top: 8, bottom: 8 },
  automaticLayout: true,
  tabSize: 2,
  fixedOverflowWidgets: true,
}

function MonacoPane({
  labelId,
  language,
  value,
  readOnly,
  onChange,
  'aria-invalid': ariaInvalid,
}: {
  labelId: string
  language: string
  value: string
  readOnly: boolean
  onChange?: (value: string) => void
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
                wordWrap: 'off' as const,
              }
            : {}),
        }}
        onChange={readOnly ? undefined : (v) => onChange?.(v ?? '')}
        loading={
          <div className="flex h-full items-center justify-center bg-surface-2 text-sm text-ink-subtle">
            {t('common.loadingEditor')}
          </div>
        }
      />
    </div>
  )
}

export function JsonToExcelEditor() {
  const { t, locale } = useLocale()
  const {
    input,
    setInput,
    error,
    sheetName,
    setSheetName,
    flatten,
    setFlatten,
    previewHeaders,
    previewRows,
    showPreview,
    generatePreview,
    downloadExcel,
    clear,
  } = useJsonToExcel()

  const isVi = locale === 'vi'
  const editorHeight = useAdaptiveEditorHeight(input, previewRows.length > 0 ? 'rows' : '')

  const handleLoadExample = useCallback(() => {
    const exampleJson = [
      {
        name: "Alice Johnson",
        age: 30,
        department: "Engineering",
        salary: 95000,
        active: true,
        address: {
          city: "New York",
          country: "USA"
        }
      },
      {
        name: "Bob Smith",
        age: 25,
        department: "Marketing",
        salary: 65000,
        active: true,
        address: {
          city: "London",
          country: "UK"
        }
      },
      {
        name: "Carol Williams",
        age: 35,
        department: "Engineering",
        salary: 105000,
        active: false,
        address: {
          city: "Paris",
          country: "France"
        }
      }
    ]
    setInput(JSON.stringify(exampleJson, null, 2))
  }, [setInput])

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[1300px] flex-1 flex-col gap-4 px-4 pt-4 pb-20 sm:p-6 lg:p-8">
      <div className="shrink-0">
        <p className="text-sm text-ink-muted">{t('tool.jsonToExcel.desc')}</p>
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
        className="grid min-h-0 shrink-0 grid-cols-1 gap-4 w-full lg:grid-cols-2 lg:gap-6"
      >
        {/* Left column - JSON Input */}
        <div className="flex min-h-0 flex-1 flex-col gap-2" style={{ height: editorHeight }}>
          <div className="flex items-center justify-between">
            <span id="json-input-label" className="shrink-0 text-sm font-medium text-ink">
              JSON Input (array of objects)
            </span>
            <Button
              onClick={handleLoadExample}
              size="sm"
              className="text-primary hover:text-primary-hover"
            >
              {t('tool.json.loadSample')}
            </Button>
          </div>
          <div className="relative h-full overflow-hidden rounded-lg border border-hairline shadow-sm">
            <MonacoPane
              labelId="json-input-label"
              language="json"
              value={input}
              readOnly={false}
              onChange={setInput}
              aria-invalid={error ? true : undefined}
            />
          </div>
        </div>

        {/* Right column - Preview table */}
        <div className="flex min-h-0 flex-1 flex-col gap-2" style={{ height: editorHeight }}>
          <div className="flex items-center justify-between">
            <span id="excel-preview-label" className="shrink-0 text-sm font-medium text-ink">
              {isVi ? 'Xem trước (5 dòng đầu)' : 'Preview (first 5 rows)'}
            </span>
          </div>
          <div className="relative h-full overflow-hidden rounded-lg border border-hairline shadow-sm bg-surface-1">
            {showPreview && previewHeaders.length > 0 ? (
              <div className="absolute inset-0 overflow-auto p-4">
                <table className="min-w-full divide-y divide-hairline text-left text-xs font-normal">
                  <thead>
                    <tr className="bg-surface-2">
                      {previewHeaders.map((header) => (
                        <th
                          key={header}
                          className="px-3 py-2 text-left font-semibold text-ink-subtle uppercase tracking-wider whitespace-nowrap border-b border-hairline"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {previewRows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-surface-2 transition-colors">
                        {previewHeaders.map((header) => {
                          const val = row[header]
                          const renderedVal =
                            val === null || val === undefined
                              ? ''
                              : typeof val === 'object'
                              ? JSON.stringify(val)
                              : String(val)
                          return (
                            <td
                              key={header}
                              className="px-3 py-2 text-ink whitespace-nowrap max-w-xs overflow-hidden text-ellipsis"
                              title={renderedVal}
                            >
                              {renderedVal}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-ink-muted">
                {isVi ? 'Nhấp vào "Xem trước" để cấu trúc bảng' : 'Click "Preview" to see table structure'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Options bar */}
      <div className="flex shrink-0 flex-wrap items-center gap-4 rounded-lg border border-hairline bg-surface-2 p-3 px-4 text-sm text-ink">
        <div className="flex items-center gap-2">
          <label htmlFor="sheet-name" className="font-medium text-ink-muted">
            {isVi ? 'Tên sheet:' : 'Sheet name:'}
          </label>
          <input
            id="sheet-name"
            type="text"
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
            className="rounded border border-hairline bg-surface-1 px-2.5 py-1 text-sm text-ink outline-none focus-visible:ds-focus-ring w-32"
          />
        </div>

        <label className="flex cursor-pointer items-center gap-2 font-medium">
          <input
            type="checkbox"
            checked={flatten}
            onChange={(e) => setFlatten(e.target.checked)}
            className="h-4 w-4 rounded border-hairline text-primary focus:ring-primary/30 cursor-pointer"
          />
          {isVi ? 'Làm phẳng các đối tượng lồng nhau' : 'Flatten nested objects'}
        </label>

        <div className="flex gap-2 sm:ml-auto">
          <Button
            variant="secondary"
            onClick={generatePreview}
            disabled={!input}
          >
            {isVi ? 'Xem trước' : 'Preview'}
          </Button>
          <Button
            variant="primary"
            onClick={downloadExcel}
            disabled={!input}
          >
            {isVi ? 'Tải xuống Excel' : 'Download Excel'}
          </Button>
        </div>
      </div>

      {/* Tip box */}
      <div className="rounded-lg border border-hairline bg-surface-2 p-3 px-4 flex items-start gap-2 text-xs text-ink-muted shrink-0">
        <span>💡</span>
        <p>
          {isVi
            ? 'Gợi ý: JSON của bạn nên là một mảng các đối tượng trong đó mỗi đối tượng sẽ trở thành một dòng. Các đối tượng lồng nhau sẽ được làm phẳng thành ký hiệu dấu chấm (ví dụ: address.city).'
            : 'Tip: Your JSON should be an array of objects where each object becomes a row. Nested objects will be flattened to dot notation (e.g., address.city).'}
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        <Button onClick={clear}>
          {t('common.clear')}
        </Button>
      </div>
      <div className="h-16 w-full shrink-0 lg:hidden" aria-hidden="true" />
    </div>
  )
}
