import { createContext, useContext } from 'react'

export type Locale = 'en' | 'vi'

export const LOCALE_STORAGE_KEY = 'app:locale'

export const translations = {
  en: {
    // Shell / navigation
    'nav.menu': 'Menu',
    'nav.workspaceHub': 'Your workspace hub',
    'nav.openNavigation': 'Open navigation',
    'nav.closeNavigation': 'Close navigation',
    'nav.openSource': 'Open Source',
    'nav.group.devTools': 'Developer Tools',
    'nav.group.dashboards': 'Dashboards & Services',
    'nav.item.home': 'Home',
    'nav.item.jsonFormatter': 'JSON Formatter',
    'nav.item.jsonEscape': 'JSON Escape / Unescape',
    'nav.item.yamlFormatter': 'YAML Formatter',
    'nav.item.csharpProto': 'C# ProtoMember',
    'nav.item.csharpProtoRemove': 'C# Remove ProtoMember',
    'nav.item.encoder': 'Encoder / Decoder',
    'nav.item.diffChecker': 'Text & Code Diff',
    'nav.item.jsonToCsharp': 'JSON → C# POCO',
    'nav.item.sqlToCsharp': 'SQL Table → C# POCO',
    'nav.item.jwtDecoder': 'JWT Decoder',
    'nav.item.goldPrice': 'Gold Price Tracker',
    'nav.item.n8n': 'n8n Automation',

    // Update banner
    'banner.newVersion': 'A new version is available',
    'banner.reload': 'Reload',
    'banner.dismiss': 'Dismiss',

    // Language switcher
    'lang.label': 'Language',
    'lang.english': 'English',
    'lang.vietnamese': 'Tiếng Việt',

    // Shared
    'common.copy': 'Copy',
    'common.copied': 'Copied',
    'common.failed': 'Failed',
    'common.clear': 'Clear',
    'common.input': 'Input',
    'common.output': 'Output',
    'common.swap': 'Swap',
    'common.loadingEditor': 'Loading editor…',

    // Home page
    'home.title': 'NUB Portal',
    'home.subtitle':
      'Fast, keyboard-friendly utilities for JSON, YAML, encoding, diffs, and codegen. Everything runs locally in your tab.',
    'home.openInNewTab': 'Open in new tab',
    'home.openTool': 'Open tool →',
    'home.section.tools': 'Developer Tools',
    'home.section.dashboards': 'Dashboards & Services',
    'home.tool.json.title': 'JSON Formatter',
    'home.tool.json.desc': 'Pretty-print as you type; minify to one line on demand',
    'home.tool.jsonEscape.title': 'JSON Escaper & Unescaper',
    'home.tool.jsonEscape.desc':
      'Convert escaped string payloads ↔ pretty JSON — bidirectional realtime with smart unwrap.',
    'home.tool.yaml.title': 'YAML Formatter',
    'home.tool.yaml.desc': 'Normalize and validate YAML as you type',
    'home.tool.csharpProto.title': 'C# ProtoMember Reindex',
    'home.tool.csharpProto.desc': 'Re-sequence [ProtoMember] attributes on C# properties',
    'home.tool.csharpProtoRemove.title': 'C# Remove ProtoMember',
    'home.tool.csharpProtoRemove.desc': 'Remove all [ProtoMember] attributes from C# code',
    'home.tool.encoder.title': 'Base64 / URL Encoder & Decoder',
    'home.tool.encoder.desc': 'Encode and decode Base64 or URL-encoded text',
    'home.tool.diff.title': 'Text & Code Diff Checker',
    'home.tool.diff.desc': 'Compare Original vs Modified with side-by-side or inline Monaco diff',
    'home.tool.poco.title': 'JSON to C# POCO Generator',
    'home.tool.poco.desc': 'Generate C# class definitions from JSON input',
    'home.tool.sqlPoco.title': 'SQL Table to C# POCO Generator',
    'home.tool.sqlPoco.desc':
      'Parse CREATE TABLE scripts and generate nullable-safe C# POCO properties',
    'home.tool.jwt.title': 'JWT Decoder',
    'home.tool.jwt.desc': 'Decode JWT header and payload locally',
    'home.dash.gold.title': 'Gold Price Tracker',
    'home.dash.gold.desc': 'Opens the external gold dashboard in a new tab.',
    'home.dash.n8n.title': 'n8n Automation',
    'home.dash.n8n.desc': 'Opens the external n8n automation tool in a new tab.',

    // JSON Formatter tool
    'tool.json.title': 'JSON Formatter',
    'tool.json.desc': 'Pretty-print and validate JSON as you type. Use Minify for a single-line output.',
    'tool.json.minify': 'Minify',
    'tool.json.outputAndSort': 'Output and array sorting',
    'tool.json.itemsDetected': '{count} items detected',
    'tool.json.sortByField': 'Sort by field',
    'tool.json.selectField': 'Select field…',
    'tool.json.sortDirection': 'Sort direction',
    'tool.json.sort': 'Sort',
    'tool.json.error.invalid': 'Invalid JSON',

    // JSON Escaper
    'tool.jsonEscape.title': 'JSON Escaper & Unescaper',
    'tool.jsonEscape.desc':
      "Bidirectional realtime sync: edits in the escaped string update formatted JSON — and vice versa — based on the editor you're typing in (focus/active pane).",
    'tool.jsonEscape.copyEscaped': 'Copy escaped',
    'tool.jsonEscape.copyJson': 'Copy JSON',
    'tool.jsonEscape.escaped': 'Escaped string',
    'tool.jsonEscape.formatted': 'Formatted JSON',
    'tool.jsonEscape.swapAria': 'Swap escaped string and formatted JSON',
    'tool.jsonEscape.errorPrefix': 'Error:\n',

    // YAML Formatter
    'tool.yaml.title': 'YAML Formatter',
    'tool.yaml.desc': 'Normalize and validate YAML as you type.',
    'tool.yaml.error.invalid': 'Invalid YAML',

    // C# ProtoMember Reindex
    'tool.csharpProto.title': 'C# ProtoMember Reindex',
    'tool.csharpProto.descBefore': 'Strip existing ',
    'tool.csharpProto.descAfter':
      ' attributes and assign sequential numbers starting from your chosen index. Output updates as you edit.',
    'tool.csharpProto.startNumber': 'Start Number',
    'tool.csharpProto.copyOutput': 'Copy Output',
    'tool.csharpProtoRemove.title': 'C# Remove ProtoMember',
    'tool.csharpProtoRemove.descBefore': 'Remove all ',
    'tool.csharpProtoRemove.descAfter': ' attributes from your C# code. Output updates as you edit.',
    'tool.csharpProtoRemove.copyOutput': 'Copy Output',

    // Encoder / Decoder
    'tool.encoder.title': 'Encoder / Decoder',
    'tool.encoder.desc': 'Encode or decode text with Base64 and URL transformations.',
    'tool.encoder.mode': 'Mode',
    'tool.encoder.mode.base64': 'Base64',
    'tool.encoder.mode.url': 'URL',
    'tool.encoder.direction': 'Direction',
    'tool.encoder.direction.encode': 'Encode',
    'tool.encoder.direction.decode': 'Decode',
    'tool.encoder.input.placeholder': 'Enter text to encode or decode',
    'tool.encoder.output.placeholder': 'Output appears here',
    'tool.encoder.error.invalid': 'Unable to process input',

    // Diff Checker
    'tool.diff.title': 'Text & Code Diff Checker',
    'tool.diff.desc': 'Compare Original and Modified text with Monaco Diff Editor.',
    'tool.diff.original': 'Original',
    'tool.diff.modified': 'Modified',
    'tool.diff.inlineView': 'Inline View',
    'tool.diff.sideBySideView': 'Side-by-Side View',
    'tool.diff.clearAll': 'Clear All',
    'tool.diff.loading': 'Loading diff editor...',

    // JSON to C# POCO
    'tool.poco.title': 'JSON to C# POCO Generator',
    'tool.poco.descBefore': 'Generate C# class models from JSON; adds ',
    'tool.poco.descAfter': ' only when the JSON key can’t match the property name as-is.',
    'tool.poco.copyCsharp': 'Copy C# Code',
    'tool.poco.rootClassName': 'Root Class Name',
    'tool.poco.rootPlaceholder': 'Root',
    'tool.poco.inputJson': 'Input JSON',
    'tool.poco.generatedCsharp': 'Generated C#',
    'tool.poco.error.invalid': 'Invalid JSON',

    // SQL Table to C# POCO
    'tool.sqlPoco.title': 'SQL Table to C# POCO Generator',
    'tool.sqlPoco.desc':
      'Parse CREATE TABLE scripts (SQL Server/PostgreSQL) and generate nullable-safe C# POCO properties.',
    'tool.sqlPoco.copyCsharp': 'Copy C# Code',
    'tool.sqlPoco.classOverride': 'Class Name Override',
    'tool.sqlPoco.classPlaceholder': '(Optional) Generated from table name',
    'tool.sqlPoco.inputSql': 'Input SQL (CREATE TABLE)',
    'tool.sqlPoco.generatedCsharp': 'Generated C#',
    'tool.sqlPoco.error.invalid': 'Invalid SQL',

    // JWT Decoder
    'tool.jwt.title': 'JWT Decoder',
    'tool.jwt.desc': 'Decode JWT header and payload locally in your browser.',
    'tool.jwt.input': 'Input JWT',
    'tool.jwt.inputPlaceholder': 'Paste JWT here (header.payload.signature)',
    'tool.jwt.header': 'Header',
    'tool.jwt.payload': 'Payload',
    'tool.jwt.copyHeader': 'Copy Header',
    'tool.jwt.copyPayload': 'Copy Payload',
    'tool.jwt.placeholder': '{label} JSON appears here',
    'tool.jwt.error.invalid': 'Invalid JWT',
  },
  vi: {
    // Shell / navigation
    'nav.menu': 'Menu',
    'nav.workspaceHub': 'Your workspace hub',
    'nav.openNavigation': 'Mở menu',
    'nav.closeNavigation': 'Đóng menu',
    'nav.openSource': 'Mã nguồn mở',
    'nav.group.devTools': 'Công cụ Developer',
    'nav.group.dashboards': 'Dashboards & Dịch vụ',
    'nav.item.home': 'Trang chủ',
    'nav.item.jsonFormatter': 'Định dạng JSON',
    'nav.item.jsonEscape': 'Escape / Unescape JSON',
    'nav.item.yamlFormatter': 'Định dạng YAML',
    'nav.item.csharpProto': 'C# ProtoMember',
    'nav.item.csharpProtoRemove': 'C# Xoá ProtoMember',
    'nav.item.encoder': 'Mã hoá / Giải mã',
    'nav.item.diffChecker': 'So sánh văn bản & code',
    'nav.item.jsonToCsharp': 'JSON → C# POCO',
    'nav.item.sqlToCsharp': 'SQL Table → C# POCO',
    'nav.item.jwtDecoder': 'Giải mã JWT',
    'nav.item.goldPrice': 'Theo dõi giá vàng',
    'nav.item.n8n': 'Tự động hoá n8n',

    // Update banner
    'banner.newVersion': 'Có phiên bản mới',
    'banner.reload': 'Tải lại',
    'banner.dismiss': 'Bỏ qua',

    // Language switcher
    'lang.label': 'Ngôn ngữ',
    'lang.english': 'English',
    'lang.vietnamese': 'Tiếng Việt',

    // Shared
    'common.copy': 'Sao chép',
    'common.copied': 'Đã sao chép',
    'common.failed': 'Thất bại',
    'common.clear': 'Xoá',
    'common.input': 'Đầu vào',
    'common.output': 'Kết quả',
    'common.swap': 'Hoán đổi',
    'common.loadingEditor': 'Đang tải trình soạn thảo…',

    // Home page
    'home.title': 'NUB Portal',
    'home.subtitle':
      'Bộ công cụ nhanh, thân thiện bàn phím cho JSON, YAML, mã hoá, so sánh và sinh code. Mọi thứ chạy cục bộ trong tab của bạn.',
    'home.openInNewTab': 'Mở trong tab mới',
    'home.openTool': 'Mở công cụ →',
    'home.section.tools': 'Công cụ Developer',
    'home.section.dashboards': 'Dashboards & Dịch vụ',
    'home.tool.json.title': 'Định dạng JSON',
    'home.tool.json.desc': 'Tự định dạng khi gõ; nén về 1 dòng khi cần',
    'home.tool.jsonEscape.title': 'Escape & Unescape JSON',
    'home.tool.jsonEscape.desc':
      'Chuyển đổi chuỗi escape ↔ JSON định dạng — đồng bộ 2 chiều theo thời gian thực, tự nhận escape.',
    'home.tool.yaml.title': 'Định dạng YAML',
    'home.tool.yaml.desc': 'Chuẩn hoá và kiểm tra YAML khi bạn gõ',
    'home.tool.csharpProto.title': 'Đánh lại số [ProtoMember]',
    'home.tool.csharpProto.desc': 'Đánh lại thứ tự thuộc tính [ProtoMember] cho các property C#',
    'home.tool.csharpProtoRemove.title': 'C# Xoá ProtoMember',
    'home.tool.csharpProtoRemove.desc': 'Xoá toàn bộ [ProtoMember] khỏi mã C#',
    'home.tool.encoder.title': 'Mã hoá / Giải mã Base64 & URL',
    'home.tool.encoder.desc': 'Mã hoá và giải mã văn bản Base64 hoặc URL',
    'home.tool.diff.title': 'So sánh văn bản & code',
    'home.tool.diff.desc': 'So sánh Bản gốc và Bản sửa bằng Monaco diff (song song hoặc inline)',
    'home.tool.poco.title': 'Sinh C# POCO từ JSON',
    'home.tool.poco.desc': 'Sinh các lớp C# từ JSON đầu vào',
    'home.tool.sqlPoco.title': 'Sinh C# POCO từ bảng SQL',
    'home.tool.sqlPoco.desc':
      'Phân tích CREATE TABLE và sinh thuộc tính C# POCO an toàn với nullable',
    'home.tool.jwt.title': 'Giải mã JWT',
    'home.tool.jwt.desc': 'Giải mã phần header và payload của JWT ngay tại trình duyệt',
    'home.dash.gold.title': 'Theo dõi giá vàng',
    'home.dash.gold.desc': 'Mở dashboard giá vàng ở tab mới.',
    'home.dash.n8n.title': 'Tự động hoá n8n',
    'home.dash.n8n.desc': 'Mở công cụ tự động hoá n8n ở tab mới.',

    // JSON Formatter tool
    'tool.json.title': 'Định dạng JSON',
    'tool.json.desc':
      'Định dạng và kiểm tra JSON khi bạn gõ. Dùng Minify để xuất 1 dòng.',
    'tool.json.minify': 'Nén',
    'tool.json.outputAndSort': 'Kết quả và sắp xếp mảng',
    'tool.json.itemsDetected': 'Phát hiện {count} mục',
    'tool.json.sortByField': 'Sắp xếp theo trường',
    'tool.json.selectField': 'Chọn trường…',
    'tool.json.sortDirection': 'Hướng sắp xếp',
    'tool.json.sort': 'Sắp xếp',
    'tool.json.error.invalid': 'JSON không hợp lệ',

    // JSON Escaper
    'tool.jsonEscape.title': 'Escape & Unescape JSON',
    'tool.jsonEscape.desc':
      'Đồng bộ 2 chiều theo thời gian thực: sửa ở chuỗi escape sẽ cập nhật JSON định dạng — và ngược lại — dựa vào ô soạn thảo bạn đang gõ (focus).',
    'tool.jsonEscape.copyEscaped': 'Sao chép chuỗi escape',
    'tool.jsonEscape.copyJson': 'Sao chép JSON',
    'tool.jsonEscape.escaped': 'Chuỗi escape',
    'tool.jsonEscape.formatted': 'JSON định dạng',
    'tool.jsonEscape.swapAria': 'Hoán đổi chuỗi escape và JSON định dạng',
    'tool.jsonEscape.errorPrefix': 'Lỗi:\n',

    // YAML Formatter
    'tool.yaml.title': 'Định dạng YAML',
    'tool.yaml.desc': 'Chuẩn hoá và kiểm tra YAML khi bạn gõ.',
    'tool.yaml.error.invalid': 'YAML không hợp lệ',

    // C# ProtoMember Reindex
    'tool.csharpProto.title': 'Đánh lại số [ProtoMember]',
    'tool.csharpProto.descBefore': 'Loại bỏ các ',
    'tool.csharpProto.descAfter':
      ' hiện có và đánh số tuần tự từ chỉ số bạn chọn. Kết quả cập nhật theo từng thay đổi.',
    'tool.csharpProto.startNumber': 'Số bắt đầu',
    'tool.csharpProto.copyOutput': 'Sao chép kết quả',
    'tool.csharpProtoRemove.title': 'C# Xoá ProtoMember',
    'tool.csharpProtoRemove.descBefore': 'Xoá toàn bộ ',
    'tool.csharpProtoRemove.descAfter': ' khỏi mã C#. Kết quả cập nhật theo từng thay đổi.',
    'tool.csharpProtoRemove.copyOutput': 'Sao chép kết quả',

    // Encoder / Decoder
    'tool.encoder.title': 'Mã hoá / Giải mã',
    'tool.encoder.desc': 'Mã hoá hoặc giải mã văn bản với Base64 và URL.',
    'tool.encoder.mode': 'Chế độ',
    'tool.encoder.mode.base64': 'Base64',
    'tool.encoder.mode.url': 'URL',
    'tool.encoder.direction': 'Hướng',
    'tool.encoder.direction.encode': 'Mã hoá',
    'tool.encoder.direction.decode': 'Giải mã',
    'tool.encoder.input.placeholder': 'Nhập văn bản để mã hoá hoặc giải mã',
    'tool.encoder.output.placeholder': 'Kết quả hiển thị tại đây',
    'tool.encoder.error.invalid': 'Không thể xử lý đầu vào',

    // Diff Checker
    'tool.diff.title': 'So sánh văn bản & code',
    'tool.diff.desc': 'So sánh nội dung Bản gốc và Bản sửa bằng Monaco Diff Editor.',
    'tool.diff.original': 'Bản gốc',
    'tool.diff.modified': 'Bản sửa',
    'tool.diff.inlineView': 'Chế độ inline',
    'tool.diff.sideBySideView': 'Chế độ song song',
    'tool.diff.clearAll': 'Xoá tất cả',
    'tool.diff.loading': 'Đang tải trình so sánh...',

    // JSON to C# POCO
    'tool.poco.title': 'Sinh C# POCO từ JSON',
    'tool.poco.descBefore': 'Sinh các lớp C# từ JSON; chỉ thêm ',
    'tool.poco.descAfter': ' khi khoá JSON không khớp tên property.',
    'tool.poco.copyCsharp': 'Sao chép code C#',
    'tool.poco.rootClassName': 'Tên lớp gốc',
    'tool.poco.rootPlaceholder': 'Root',
    'tool.poco.inputJson': 'JSON đầu vào',
    'tool.poco.generatedCsharp': 'C# đã sinh',
    'tool.poco.error.invalid': 'JSON không hợp lệ',

    // SQL Table to C# POCO
    'tool.sqlPoco.title': 'Sinh C# POCO từ bảng SQL',
    'tool.sqlPoco.desc':
      'Phân tích CREATE TABLE (SQL Server/PostgreSQL) và sinh thuộc tính C# POCO an toàn với nullable.',
    'tool.sqlPoco.copyCsharp': 'Sao chép code C#',
    'tool.sqlPoco.classOverride': 'Ghi đè tên lớp',
    'tool.sqlPoco.classPlaceholder': '(Tuỳ chọn) Sinh từ tên bảng',
    'tool.sqlPoco.inputSql': 'SQL đầu vào (CREATE TABLE)',
    'tool.sqlPoco.generatedCsharp': 'C# đã sinh',
    'tool.sqlPoco.error.invalid': 'SQL không hợp lệ',

    // JWT Decoder
    'tool.jwt.title': 'Giải mã JWT',
    'tool.jwt.desc': 'Giải mã phần header và payload của JWT ngay trong trình duyệt.',
    'tool.jwt.input': 'JWT đầu vào',
    'tool.jwt.inputPlaceholder': 'Dán JWT vào đây (header.payload.signature)',
    'tool.jwt.header': 'Header',
    'tool.jwt.payload': 'Payload',
    'tool.jwt.copyHeader': 'Sao chép Header',
    'tool.jwt.copyPayload': 'Sao chép Payload',
    'tool.jwt.placeholder': '{label} JSON hiển thị tại đây',
    'tool.jwt.error.invalid': 'JWT không hợp lệ',
  },
} as const satisfies Record<Locale, Record<string, string>>

export type TranslationKey = keyof (typeof translations)['en']

export function isLocale(value: unknown): value is Locale {
  return value === 'en' || value === 'vi'
}

export function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'en'
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    if (isLocale(stored)) return stored
  } catch {
    // localStorage may be unavailable (private mode, etc.) — fall through.
  }
  return 'en'
}

export function interpolate(str: string, params?: Record<string, string | number>): string {
  if (!params) return str
  return str.replace(/\{(\w+)\}/g, (_, k: string) =>
    Object.prototype.hasOwnProperty.call(params, k) ? String(params[k]) : `{${k}}`
  )
}

export type Translator = (key: TranslationKey, params?: Record<string, string | number>) => string

export type LocaleContextValue = {
  locale: Locale
  setLocale: (l: Locale) => void
  t: Translator
}

export const LocaleContext = createContext<LocaleContextValue | null>(null)

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}
