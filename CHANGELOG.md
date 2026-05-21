# Changelog

Tất cả các thay đổi quan trọng của dự án **NUB Portal** sẽ được ghi lại trong file này.

Định dạng dựa trên [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Đang phát triển
- Thêm các công cụ mới theo lộ trình

---

## [0.1.0] - 2026-05-21

### Thêm mới (Added)
- **JSON to YAML** (`/json-to-yaml`): Bổ sung công cụ chuyển đổi định dạng JSON sang YAML với xác thực cú pháp tự động và Monaco Editor đồng bộ giao diện.
- **Tách trang Escape & Unescape**: Tách công cụ xử lý chuỗi JSON thành hai trang riêng biệt để nâng cao trải nghiệm người dùng:
  - `/json-escape`: Escape các ký tự đặc biệt, tuỳ chọn bọc dấu ngoặc kép, escape Unicode (`\uXXXX`), hiển thị thống kê chi tiết và bảng tham chiếu.
  - `/json-unescape`: Giải mã chuỗi JSON đã escape về dạng định dạng JSON chuẩn.
- **JSON Tree View & Field Extraction** (`/json`):
  - Bổ sung tab **Tree View** hiển thị cấu trúc cây phân cấp trực quan của đối tượng JSON với tính năng Mở rộng (Expand All) / Thu gọn (Collapse All).
  - Thêm tính năng **Trích xuất trường cụ thể** (Field Extraction): cho phép người dùng chọn nhanh các trường trong dữ liệu JSON để trích xuất ra một đối tượng JSON mới.
  - Tích hợp thêm **thống kê dữ liệu JSON** (dung lượng, số lượng key, độ sâu, số lượng object và array).
- **Tính năng Scroll-to-Top**: Bổ sung nút cuộn nhanh lên đầu trang ở góc dưới bên phải trang chủ (`HomePage`).

### Cải tiến & Tối ưu hóa (Changed)
- **Giao diện & Trải nghiệm Trang chủ**: Thiết kế lại trang chủ với phong cách hiện đại hơn, bổ sung hiệu ứng viền phát sáng (ambient glow), lưới thẻ (card grid) responsive và hiệu ứng click phản hồi trực quan trên các thẻ công cụ.
- **Đồng bộ giao diện nút bấm**: Đồng nhất kiểu dáng thiết kế của component `Button` trên toàn bộ ứng dụng.
- **Cải tiến Version Check**: Tích hợp thanh thông báo phiên bản mới ở góc dưới màn hình và tự động reload trang khi chuyển route để đảm bảo không bị gián đoạn dữ liệu người dùng đang nhập.

---

## [0.0.0] - 2026-05-12

### Tổng quan dự án
**NUB Portal** là ứng dụng web toolkit tập hợp các công cụ phát triển chạy hoàn toàn trên trình duyệt (client-side), không gửi dữ liệu nhạy cảm lên server.

### Tech Stack
- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4
- **Router:** React Router v7
- **Editor:** Monaco Editor
- **Deployment:** Docker (multi-stage build) + Nginx Alpine
- **CI/CD:** GitHub Actions

---

## Các tính năng đã hoàn thành

### ✅ JSON Tools
- **JSON Formatter & Minifier** (`/json`)
  - Pretty-print JSON real-time
  - Minify với nút bấm
  - Monaco Editor với syntax highlighting
  - Báo lỗi parse rõ ràng

- **JSON Escaper & Unescaper** (`/json-escape`)
  - Chuyển đổi hai chiều JSON escaped ↔ formatted JSON
  - Unwrap chuỗi lồng nhiều lớp
  - Kiểm tra root phải là object/array
  - Hiển thị lỗi trong ô kết quả

- **JSON to C# POCO Generator** (`/json-to-csharp`)
  - Sinh class C# từ JSON
  - Naming theo chuẩn C# (PascalCase)
  - Tự động thêm `[JsonPropertyName("...")]`
  - Hỗ trợ nested objects và arrays

### ✅ YAML Tools (JSON to YAML)
- **JSON to YAML Converter** (`/json-to-yaml`)
  - Chuyển đổi JSON sang YAML tự động
  - Parse YAML bằng `js-yaml`
  - Normalize real-time
  - Báo lỗi cú pháp trực quan

### ✅ C# Tools
- **C# ProtoMember Reindex Tool** (`/csharp-proto`)
  - Đọc mã C# theo từng dòng
  - Regex gỡ `[ProtoMember(n)]` cũ
  - Gán lại số thứ tự từ số bắt đầu tùy chọn
  - Hỗ trợ `{ get; set; }`, `init`, `private set`
  - Giữ nguyên comment và dòng trống

- **C# Remove ProtoMember Tool** (`/csharp-proto-remove`)
  - Xóa tất cả `[ProtoMember(n)]` attributes
  - Hỗ trợ optional digit matching
  - Giữ nguyên cấu trúc code

- **SQL Table to C# POCO Generator** (`/sql-to-csharp`)
  - Parse `CREATE TABLE` (SQL Server/PostgreSQL)
  - Map kiểu dữ liệu SQL → C#
  - Áp dụng nullable `?` cho value types
  - Chuyển tên cột sang PascalCase

### ✅ Encoding Tools
- **Base64 / URL Encoder & Decoder** (`/encoder`)
  - Encode/decode Base64
  - URL encoding/decoding
  - Hỗ trợ Unicode
  - Hiển thị lỗi khi input không hợp lệ

- **JWT Decoder** (`/jwt-decoder`)
  - Decode JWT header/payload cục bộ
  - Parse thành JSON formatted
  - Báo lỗi token không hợp lệ

### ✅ Diff & Comparison Tools
- **Text & Code Diff Checker** (`/diff-checker`)
  - Monaco Diff Editor
  - Chế độ Side-by-side / Inline
  - Chỉnh được cả hai bên
  - Chọn ngôn ngữ highlight
  - Nút Swap và Clear All
  - Auto-detect diff mode
  - Customizable labels
  - Dynamic split widths

---

## Infrastructure & DevOps

### ✅ Docker Setup
- Multi-stage Dockerfile (Node builder + Nginx runtime)
- Multi-architecture support (AMD64 + ARM64)
- Docker Compose configuration
- Nginx SPA fallback cho React Router

### ✅ CI/CD Pipeline
- GitHub Actions workflow (`.github/workflows/deploy.yml`)
- Automated build và push lên Docker Hub
- Deploy trigger trên push to main

### ✅ SEO & Metadata
- Sitemap generation script (`scripts/generate-sitemap.js`)
- `robots.txt` configuration
- Version generation script (`scripts/generate-version.js`)
- Pre-build hooks trong `package.json`

### ✅ Localization
- Multi-language routing support
- Localization infrastructure

### ✅ Version Check
- Client-side version checking (`src/lib/versionCheck.ts`)
- Auto-refresh notification khi có version mới

---

## Roadmap & TODO

### 🔄 Đang xem xét
- [ ] Thêm dark mode toggle
- [ ] Export/Import settings
- [ ] Keyboard shortcuts
- [ ] More language support cho Monaco Editor
- [ ] History/Undo cho các công cụ
- [ ] Share/Export results

### 🎯 Tương lai
- [ ] API testing tool
- [ ] Regex tester
- [ ] Color picker & converter
- [ ] Markdown preview
- [ ] Hash generator (MD5, SHA256, etc.)
- [ ] UUID generator
- [ ] Timestamp converter

---

## Ghi chú kỹ thuật

### Dependencies chính
- `react@19.0.0` & `react-dom@19.0.0`
- `react-router-dom@7.6.0`
- `@monaco-editor/react@4.7.0`
- `monaco-editor@0.55.1`
- `js-yaml@4.1.0`
- `lucide-react@1.14.0`
- `vite@6.3.0`
- `typescript@5.8.0`
- `tailwindcss@4.1.0`

### Cấu trúc thư mục
```
src/
├── features/           # Các công cụ (feature-based structure)
│   ├── json-tool/
│   ├── json-escape-tool/
│   ├── json-to-yaml-tool/
│   ├── csharp-proto-tool/
│   ├── csharp-proto-remove-tool/
│   ├── encoder-tool/
│   ├── diff-checker-tool/
│   ├── poco-generator-tool/
│   ├── sql-to-poco-tool/
│   └── jwt-decoder-tool/
├── lib/               # Utilities (versionCheck, etc.)
└── ...
```

---

**Cập nhật lần cuối:** 2026-05-21
