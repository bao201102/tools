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
    'nav.group.tools': 'Tools',
    'nav.group.convert': 'Convert',
    'nav.group.utility': 'Utility',
    'nav.item.home': 'Home',
    'nav.item.jsonFormatter': 'JSON Formatter',
    'nav.item.jsonEscape': 'JSON Escape',
    'nav.item.jsonUnescape': 'JSON Unescape',
    'nav.item.yamlFormatter': 'JSON to YAML',
    'nav.item.csharpProto': 'C# ProtoMember',
    'nav.item.csharpProtoRemove': 'C# Remove ProtoMember',
    'nav.item.encoder': 'Encoder / Decoder',
    'nav.item.diffChecker': 'Text & Code Diff',
    'nav.item.jwtDecoder': 'JWT Decoder',
    'nav.item.jsonToCsharp': 'JSON → C# POCO',
    'nav.item.sqlToCsharp': 'SQL Table → C# POCO',
    'nav.item.allTools': 'All Tools',
    'nav.item.goldPrice': 'Gold Price Tracker',
    'nav.item.n8n': 'n8n Automation',
    'nav.item.markdownPreview': 'Markdown Preview',

    // Update banner
    'banner.newVersion': 'A new version is available',
    'banner.reload': 'Reload',
    'banner.dismiss': 'Dismiss',

    // Language switcher
    'lang.label': 'Language',
    'lang.english': 'English',
    'lang.vietnamese': 'Tiếng Việt',

    // Theme switcher
    'theme.label': 'Theme',
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'theme.system': 'System',

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
    'home.section.tools': 'Tools',
    'home.section.convert': 'Convert',
    'home.tool.json.title': 'JSON Formatter',
    'home.tool.json.desc': 'Pretty-print as you type; minify to one line on demand',
    'home.tool.jsonEscape.title': 'JSON Escape',
    'home.tool.jsonEscape.desc':
      'Escape quotes, newlines, tabs, and backslashes in text or JSON strings.',
    'home.tool.jsonUnescape.title': 'JSON Unescape',
    'home.tool.jsonUnescape.desc':
      'Convert an escaped JSON string back to readable, formatted JSON.',
    'home.tool.yaml.title': 'JSON to YAML',
    'home.tool.yaml.desc': 'Convert JSON to YAML format with syntax validation',
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
    'home.tool.markdownPreview.title': 'Markdown Preview',
    'home.tool.markdownPreview.desc': 'Compile and preview markdown documents with custom styles.',

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
    'tool.json.pastePrompt': 'Paste your JSON in the left editor to format and validate it:',
    'tool.json.original': 'Original JSON',
    'tool.json.loadSample': 'Load Sample',
    'tool.json.editor': 'Editor',
    'tool.json.treeView': 'Tree View',
    'tool.json.enterValid': 'Enter valid JSON to view tree',
    'tool.json.prettify': 'Prettify',
    'tool.json.compress': 'Compress',
    'tool.json.sortKeys': 'Sort Keys',
    'tool.json.stringify': 'Stringify',
    'tool.json.pasteToStart': 'Paste JSON to get started',
    'tool.json.extractFields': 'Extract Specific Fields',
    'tool.json.selectAll': 'Select All',
    'tool.json.deselectAll': 'Deselect All',
    'tool.json.extractSelected': 'Extract Selected ({count})',
    'tool.json.extractPrompt': 'Click on fields to select/deselect them, then click "Extract Selected" to generate a new JSON.',
    'tool.json.extractedOutput': 'Extracted JSON Output',
    'tool.json.stats': 'Valid JSON • {size} • {keys} keys • depth {depth} • {objects} objects • {arrays} arrays',
    'tool.json.expandAll': 'Expand All',
    'tool.json.collapseAll': 'Collapse All',

    // JSON Escape
    'tool.jsonEscape.desc':
      'Paste text below, choose options, then click Escape Text to get an escaped string.',
    'tool.jsonEscape.input': 'Input Text',
    'tool.jsonEscape.output': 'Escaped Output',
    'tool.jsonEscape.charCount': '{count} chars',
    'tool.jsonEscape.wrapInQuotes': 'Wrap in quotes',
    'tool.jsonEscape.escapeUnicode': 'Escape Unicode (\\uXXXX)',
    'tool.jsonEscape.escapeButton': 'Escape Text',
    'tool.jsonEscape.copyOutput': 'Copy',
    'tool.jsonEscape.stats':
      'Characters escaped: {quotes} quotes, {newlines} newlines, {tabs} tabs, {backslashes} backslashes',
    'tool.jsonEscape.referenceTitle': 'Escape Reference',
    'tool.jsonEscape.ref.quote': 'Quote',
    'tool.jsonEscape.ref.backslash': 'Backslash',
    'tool.jsonEscape.ref.newline': 'Newline',
    'tool.jsonEscape.ref.tab': 'Tab',
    'tool.jsonEscape.ref.cr': 'CR',
    'tool.jsonEscape.ref.backspace': 'Backspace',
    // JSON Unescape
    'tool.jsonUnescape.desc':
      'Paste your escaped JSON string below to convert it back to readable JSON.',
    'tool.jsonUnescape.input': 'Escaped JSON string',
    'tool.jsonUnescape.output': 'Unescaped JSON',
    'tool.jsonUnescape.outputPlaceholder': 'Output will appear here…',
    'tool.jsonUnescape.copyOutput': 'Copy JSON',

    // YAML Formatter
    'tool.yaml.title': 'JSON to YAML',
    'tool.yaml.desc': 'Convert JSON to YAML format. Paste your JSON in the input editor.',
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

    // Markdown Preview tool
    'tool.markdown.title': 'Markdown Preview',
    'tool.markdown.desc': 'Write or paste Markdown in the editor above and see the rendered HTML preview below.',
    'tool.markdown.input': 'Markdown Source',
    'tool.markdown.output': 'HTML Preview',
    'tool.markdown.stats': 'Words: {words} • Chars: {chars} • Read time: {time} min',
    'tool.markdown.copyHtml': 'Copy HTML',
    'tool.markdown.clear': 'Clear',
    'tool.markdown.loadSample': 'Load Sample',
    'tool.markdown.edit': 'Edit Markdown',
    'tool.markdown.collapsed': 'Editor is collapsed (click to expand)',
    'tool.markdown.placeholder': 'Start typing Markdown above to see the preview...',
    'tool.markdown.maximize': 'Full Page',
    'tool.markdown.minimize': 'Normal View',
  },
  vi: {
    // Shell / navigation
    'nav.menu': 'Menu',
    'nav.workspaceHub': 'Không gian làm việc của bạn',
    'nav.openNavigation': 'Mở menu điều hướng',
    'nav.closeNavigation': 'Đóng menu điều hướng',
    'nav.openSource': 'Mã nguồn mở',
    'nav.group.tools': 'Công cụ',
    'nav.group.convert': 'Chuyển đổi',
    'nav.group.utility': 'Tiện ích',
    'nav.item.home': 'Trang chủ',
    'nav.item.jsonFormatter': 'Định dạng JSON',
    'nav.item.jsonEscape': 'Escape JSON',
    'nav.item.jsonUnescape': 'Unescape JSON',
    'nav.item.yamlFormatter': 'JSON sang YAML',
    'nav.item.csharpProto': 'Đánh lại số C# Proto',
    'nav.item.csharpProtoRemove': 'Xoá C# Proto',
    'nav.item.encoder': 'Mã hoá / Giải mã',
    'nav.item.diffChecker': 'So sánh văn bản & Code',
    'nav.item.jwtDecoder': 'Giải mã JWT',
    'nav.item.jsonToCsharp': 'JSON → C# POCO',
    'nav.item.sqlToCsharp': 'SQL Table → C# POCO',
    'nav.item.allTools': 'Tất cả công cụ',
    'nav.item.goldPrice': 'Theo dõi giá vàng',
    'nav.item.n8n': 'Tự động hoá n8n',
    'nav.item.markdownPreview': 'Xem trước Markdown',

    // Update banner
    'banner.newVersion': 'Có phiên bản mới sẵn có',
    'banner.reload': 'Tải lại trang',
    'banner.dismiss': 'Bỏ qua',

    // Language switcher
    'lang.label': 'Ngôn ngữ',
    'lang.english': 'English',
    'lang.vietnamese': 'Tiếng Việt',

    // Theme switcher
    'theme.label': 'Giao diện',
    'theme.light': 'Sáng',
    'theme.dark': 'Tối',
    'theme.system': 'Hệ thống',

    // Shared
    'common.copy': 'Sao chép',
    'common.copied': 'Đã sao chép',
    'common.failed': 'Thất bại',
    'common.clear': 'Xoá',
    'common.input': 'Dữ liệu nguồn',
    'common.output': 'Kết quả đầu ra',
    'common.swap': 'Hoán đổi',
    'common.loadingEditor': 'Đang tải trình soạn thảo…',

    // Home page
    'home.title': 'NUB Portal',
    'home.subtitle':
      'Bộ công cụ nhanh, tối ưu hóa phím tắt dành cho JSON, YAML, mã hoá, so sánh và sinh code. Chạy trực tiếp và bảo mật trên trình duyệt của bạn.',
    'home.openInNewTab': 'Mở trong tab mới',
    'home.section.tools': 'Công cụ',
    'home.section.convert': 'Chuyển đổi',
    'home.tool.json.title': 'Định dạng JSON',
    'home.tool.json.desc': 'Làm đẹp (prettify), xác thực cú pháp JSON trực tiếp khi gõ và nén dòng (minify) nhanh chóng.',
    'home.tool.jsonEscape.title': 'Escape JSON',
    'home.tool.jsonEscape.desc':
      'Chèn ký tự escape cho các dấu ngoặc kép, xuống dòng, tab và gạch chéo ngược trong chuỗi văn bản hoặc JSON.',
    'home.tool.jsonUnescape.title': 'Unescape JSON',
    'home.tool.jsonUnescape.desc':
      'Giải mã (unescape) chuỗi ký tự JSON đã escape về định dạng JSON chuẩn dễ đọc.',
    'home.tool.yaml.title': 'JSON sang YAML',
    'home.tool.yaml.desc': 'Chuyển đổi dữ liệu từ định dạng JSON sang YAML với xác thực cú pháp tự động.',
    'home.tool.csharpProto.title': 'Đánh lại chỉ số [ProtoMember]',
    'home.tool.csharpProto.desc': 'Đánh lại chỉ số tuần tự cho thuộc tính [ProtoMember] của các lớp (class) C#.',
    'home.tool.csharpProtoRemove.title': 'Xóa thuộc tính [ProtoMember]',
    'home.tool.csharpProtoRemove.desc': 'Xóa bỏ toàn bộ thuộc tính [ProtoMember] khỏi mã nguồn C# chỉ với một cú nhấp.',
    'home.tool.encoder.title': 'Mã hoá / Giải mã Base64 & URL',
    'home.tool.encoder.desc': 'Mã hóa và giải mã văn bản nhanh chóng dưới dạng chuỗi Base64 hoặc URL mã hóa.',
    'home.tool.diff.title': 'So sánh văn bản & code',
    'home.tool.diff.desc': 'So sánh chi tiết sự khác biệt giữa hai văn bản hoặc đoạn code bằng Monaco Diff Editor.',
    'home.tool.poco.title': 'Sinh C# POCO từ JSON',
    'home.tool.poco.desc': 'Tạo tự động các định nghĩa lớp (class model) C# POCO từ dữ liệu JSON đầu vào.',
    'home.tool.sqlPoco.title': 'Sinh C# POCO từ bảng SQL',
    'home.tool.sqlPoco.desc':
      'Phân tích cú pháp câu lệnh CREATE TABLE (SQL Server/Postgre) để sinh class C# POCO an toàn với kiểu nullable.',
    'home.tool.jwt.title': 'Giải mã JWT',
    'home.tool.jwt.desc': 'Giải mã và phân tích nội dung phần Header và Payload của token JWT ngay tại trình duyệt.',
    'home.dash.gold.title': 'Theo dõi giá vàng',
    'home.dash.gold.desc': 'Theo dõi giá vàng trong nước và quốc tế trực quan thời gian thực ở tab mới.',
    'home.dash.n8n.title': 'Tự động hoá n8n',
    'home.dash.n8n.desc': 'Truy cập công cụ tự động hóa quy trình (workflow automation) n8n ở tab mới.',
    'home.tool.markdownPreview.title': 'Xem trước Markdown',
    'home.tool.markdownPreview.desc': 'Biên dịch và xem trước tài liệu Markdown với định dạng đẹp mắt.',

    // JSON Formatter tool
    'tool.json.title': 'Định dạng JSON',
    'tool.json.desc':
      'Làm đẹp (prettify), xác thực cú pháp JSON trực tiếp khi gõ và nén dòng (minify) nhanh chóng.',
    'tool.json.minify': 'Nén một dòng',
    'tool.json.outputAndSort': 'Cấu hình đầu ra & Sắp xếp mảng',
    'tool.json.itemsDetected': 'Phát hiện {count} phần tử',
    'tool.json.sortByField': 'Sắp xếp theo trường',
    'tool.json.selectField': 'Chọn trường…',
    'tool.json.sortDirection': 'Chiều sắp xếp',
    'tool.json.sort': 'Sắp xếp',
    'tool.json.error.invalid': 'Dữ liệu JSON không hợp lệ',
    'tool.json.pastePrompt': 'Dán dữ liệu JSON vào trình soạn thảo bên trái để định dạng và kiểm tra xác thực:',
    'tool.json.original': 'JSON gốc',
    'tool.json.loadSample': 'Dùng JSON mẫu',
    'tool.json.editor': 'Trình soạn thảo',
    'tool.json.treeView': 'Cấu trúc cây',
    'tool.json.enterValid': 'Nhập JSON hợp lệ để xem cấu trúc cây trực quan',
    'tool.json.prettify': 'Làm đẹp (Format)',
    'tool.json.compress': 'Nén JSON',
    'tool.json.sortKeys': 'Sắp xếp Key',
    'tool.json.stringify': 'Chuyển thành chuỗi (Stringify)',
    'tool.json.pasteToStart': 'Dán dữ liệu JSON vào để bắt đầu',
    'tool.json.extractFields': 'Trích xuất các trường cụ thể',
    'tool.json.selectAll': 'Chọn tất cả',
    'tool.json.deselectAll': 'Bỏ chọn tất cả',
    'tool.json.extractSelected': 'Trích xuất mục đã chọn ({count})',
    'tool.json.extractPrompt': 'Chọn/bỏ chọn các trường bên dưới, sau đó nhấn "Trích xuất đã chọn" để tạo JSON mới.',
    'tool.json.extractedOutput': 'Dữ liệu JSON sau trích xuất',
    'tool.json.stats': 'JSON hợp lệ • Dung lượng: {size} • {keys} keys • Độ sâu: {depth} • {objects} object • {arrays} mảng',
    'tool.json.expandAll': 'Mở rộng tất cả',
    'tool.json.collapseAll': 'Thu gọn tất cả',

    // JSON Escape
    'tool.jsonEscape.desc':
      'Chèn ký tự escape cho các dấu ngoặc kép, xuống dòng, tab và gạch chéo ngược trong chuỗi văn bản hoặc JSON.',
    'tool.jsonEscape.input': 'Văn bản nguồn đầu vào',
    'tool.jsonEscape.output': 'Kết quả sau khi escape',
    'tool.jsonEscape.charCount': '{count} ký tự',
    'tool.jsonEscape.wrapInQuotes': 'Bọc trong dấu ngoặc kép ("")',
    'tool.jsonEscape.escapeUnicode': 'Escape ký tự Unicode (\\uXXXX)',
    'tool.jsonEscape.escapeButton': 'Thực hiện Escape',
    'tool.jsonEscape.copyOutput': 'Sao chép kết quả',
    'tool.jsonEscape.stats':
      'Ký tự đã escape: {quotes} dấu ngoặc kép, {newlines} dòng mới, {tabs} tab, {backslashes} gạch chéo ngược (backslash)',
    'tool.jsonEscape.referenceTitle': 'Bảng tham chiếu ký tự Escape',
    'tool.jsonEscape.ref.quote': 'Dấu ngoặc kép (")',
    'tool.jsonEscape.ref.backslash': 'Dấu gạch ngược (\\)',
    'tool.jsonEscape.ref.newline': 'Xuống dòng (\\n)',
    'tool.jsonEscape.ref.tab': 'Tab (\\t)',
    'tool.jsonEscape.ref.cr': 'Dấu về đầu dòng (\\r)',
    'tool.jsonEscape.ref.backspace': 'Phím xóa ngược (\\b)',

    // JSON Unescape
    'tool.jsonUnescape.desc':
      'Giải mã (unescape) chuỗi ký tự JSON đã escape về định dạng JSON chuẩn dễ đọc.',
    'tool.jsonUnescape.input': 'Chuỗi ký tự JSON đã escape',
    'tool.jsonUnescape.output': 'JSON gốc sau giải mã (Unescaped)',
    'tool.jsonUnescape.outputPlaceholder': 'Dữ liệu JSON gốc sẽ xuất hiện tại đây…',
    'tool.jsonUnescape.copyOutput': 'Sao chép JSON',

    // YAML Formatter
    'tool.yaml.title': 'JSON sang YAML',
    'tool.yaml.desc': 'Chuyển đổi dữ liệu từ định dạng JSON sang YAML với xác thực cú pháp tự động. Dán dữ liệu JSON vào bên trái.',
    'tool.yaml.error.invalid': 'Cú pháp YAML không hợp lệ',

    // C# ProtoMember Reindex
    'tool.csharpProto.title': 'Đánh lại chỉ số [ProtoMember]',
    'tool.csharpProto.descBefore': 'Tự động gỡ bỏ các thuộc tính ',
    'tool.csharpProto.descAfter':
      ' hiện tại và đánh lại chỉ số tuần tự bắt đầu từ giá trị được chọn. Kết quả tự động cập nhật khi bạn gõ.',
    'tool.csharpProto.startNumber': 'Chỉ mục bắt đầu',
    'tool.csharpProto.copyOutput': 'Sao chép mã nguồn',
    'tool.csharpProtoRemove.title': 'Xóa thuộc tính [ProtoMember]',
    'tool.csharpProtoRemove.descBefore': 'Xóa bỏ toàn bộ thuộc tính ',
    'tool.csharpProtoRemove.descAfter': ' khỏi mã nguồn C# của bạn. Kết quả tự động cập nhật khi bạn gõ.',
    'tool.csharpProtoRemove.copyOutput': 'Sao chép mã nguồn',

    // Encoder / Decoder
    'tool.encoder.title': 'Mã hoá / Giải mã',
    'tool.encoder.desc': 'Mã hóa hoặc giải mã văn bản nhanh chóng sử dụng thuật toán Base64 hoặc URL mã hóa.',
    'tool.encoder.mode': 'Thuật toán mã hóa',
    'tool.encoder.mode.base64': 'Base64',
    'tool.encoder.mode.url': 'URL Encode',
    'tool.encoder.direction': 'Tác vụ',
    'tool.encoder.direction.encode': 'Mã hoá dữ liệu',
    'tool.encoder.direction.decode': 'Giải mã dữ liệu',
    'tool.encoder.input.placeholder': 'Nhập nội dung cần thực hiện mã hoá hoặc giải mã...',
    'tool.encoder.output.placeholder': 'Kết quả đầu ra sẽ hiển thị tại đây...',
    'tool.encoder.error.invalid': 'Dữ liệu đầu vào không hợp lệ hoặc không thể xử lý.',

    // Diff Checker
    'tool.diff.title': 'So sánh văn bản & code',
    'tool.diff.desc': 'So sánh chi tiết sự khác biệt giữa hai văn bản hoặc đoạn mã nguồn bằng Monaco Diff Editor.',
    'tool.diff.original': 'Bản gốc (Original)',
    'tool.diff.modified': 'Bản sửa đổi (Modified)',
    'tool.diff.inlineView': 'Xem dạng trực tiếp (Inline)',
    'tool.diff.sideBySideView': 'Xem dạng song song (Side-by-side)',
    'tool.diff.clearAll': 'Xoá sạch dữ liệu',
    'tool.diff.loading': 'Đang khởi tạo trình so sánh diff...',

    // JSON to C# POCO
    'tool.poco.title': 'Sinh C# POCO từ JSON',
    'tool.poco.descBefore': 'Tự động tạo các lớp C# model từ cấu trúc dữ liệu JSON; chỉ thêm thuộc tính ',
    'tool.poco.descAfter': ' khi khóa JSON không khớp hoàn toàn với tên thuộc tính C#.',
    'tool.poco.copyCsharp': 'Sao chép Class C#',
    'tool.poco.rootClassName': 'Tên Class gốc (Root)',
    'tool.poco.rootPlaceholder': 'RootObject',
    'tool.poco.inputJson': 'Dữ liệu JSON đầu vào',
    'tool.poco.generatedCsharp': 'Mã nguồn C# POCO được sinh ra',
    'tool.poco.error.invalid': 'Cú pháp JSON không hợp lệ',

    // SQL Table to C# POCO
    'tool.sqlPoco.title': 'Sinh C# POCO từ bảng SQL',
    'tool.sqlPoco.desc':
      'Phân tích cú pháp câu lệnh CREATE TABLE (SQL Server, PostgreSQL, MySQL) và tự động sinh class C# POCO tương ứng an toàn với kiểu nullable.',
    'tool.sqlPoco.copyCsharp': 'Sao chép Class C#',
    'tool.sqlPoco.classOverride': 'Tên lớp tùy chỉnh',
    'tool.sqlPoco.classPlaceholder': '(Tuỳ chọn) Tự động lấy theo tên bảng',
    'tool.sqlPoco.inputSql': 'Câu lệnh SQL nguồn (CREATE TABLE...)',
    'tool.sqlPoco.generatedCsharp': 'Mã nguồn C# POCO được sinh ra',
    'tool.sqlPoco.error.invalid': 'Câu lệnh SQL không hợp lệ hoặc không được hỗ trợ',

    // JWT Decoder
    'tool.jwt.title': 'Giải mã JWT',
    'tool.jwt.desc': 'Giải mã và phân tích chi tiết nội dung phần Header và Payload của token JWT trực tiếp tại trình duyệt.',
    'tool.jwt.input': 'Nhập token JWT nguồn',
    'tool.jwt.inputPlaceholder': 'Dán token JWT vào đây (dạng header.payload.signature)',
    'tool.jwt.header': 'Header (Đầu mục)',
    'tool.jwt.payload': 'Payload (Dữ liệu)',
    'tool.jwt.copyHeader': 'Sao chép Header',
    'tool.jwt.copyPayload': 'Sao chép Payload',
    'tool.jwt.placeholder': 'Dữ liệu JSON của {label} sẽ hiển thị tại đây',
    'tool.jwt.error.invalid': 'Token JWT không hợp lệ hoặc bị lỗi định dạng',

    // Markdown Preview tool
    'tool.markdown.title': 'Xem trước Markdown',
    'tool.markdown.desc': 'Soạn thảo hoặc dán mã Markdown vào editor phía trên để xem trước HTML hiển thị phía dưới.',
    'tool.markdown.input': 'Mã nguồn Markdown',
    'tool.markdown.output': 'Bản xem trước HTML',
    'tool.markdown.stats': '{words} từ • {chars} ký tự • Đọc: {time} phút',
    'tool.markdown.copyHtml': 'Sao chép HTML',
    'tool.markdown.clear': 'Xóa',
    'tool.markdown.loadSample': 'Tài liệu mẫu',
    'tool.markdown.edit': 'Chỉnh sửa Markdown',
    'tool.markdown.collapsed': 'Trình soạn thảo đang thu gọn (nhấp để mở rộng)',
    'tool.markdown.placeholder': 'Bắt đầu nhập Markdown ở trên để xem bản xem trước...',
    'tool.markdown.maximize': 'Toàn trang',
    'tool.markdown.minimize': 'Thu nhỏ',
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
