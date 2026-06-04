# NUB Portal — Your Workspace Hub

Ứng dụng web tập hợp các công cụ phát triển và dashboard chạy hoàn toàn trên trình duyệt: nhanh, gọn, bảo mật và không cần máy chủ xử lý dữ liệu nhạy cảm của bạn.

---

## 📌 Giới thiệu

**NUB Portal** là một **ứng dụng web toolkit** dành cho lập trình viên và quản lý workspace, được thiết kế với các tiêu chí:

- **Tốc độ cao & Client-side** — Giao diện SPA nhẹ, toàn bộ logic xử lý dữ liệu được thực hiện trực tiếp phía client (trên trình duyệt của bạn), đảm bảo tốc độ phản hồi tức thì.
- **Riêng tư & Bảo mật** — Mã nguồn C#, SQL, chuỗi JWT, JSON, CSV hay tệp Excel của bạn **không bao giờ** bị tải lên bất kỳ máy chủ nào bên ngoài.
- **Hiện đại & Trực quan** — Giao diện tối (Dark mode) mặc định theo phong cách Linear/JSONLint cao cấp, hỗ trợ bật/tắt chế độ tràn màn hình (Full Width), cấu hình song ngữ **EN / VI**.

Dự án có thể chạy trực tiếp trên máy cá nhân khi phát triển, hoặc dễ dàng triển khai tĩnh (Nginx/VPS) để toàn bộ team nội bộ truy cập nhanh chóng.

---

## ✨ Tính năng & Phân hệ

Các công cụ trong ứng dụng được tổ chức khoa học trên thanh menu điều hướng và trang chủ thành ba mục chính: **Tools**, **Convert** và **Utility**.

### 🛠️ Tools (Công cụ phân tích & Định dạng)

| Công cụ | Route | Mô tả ngắn |
| --- | --- | --- |
| **JSON Formatter** | `/json` | Làm đẹp (prettify) và validate JSON real-time; nén dòng (minify); hỗ trợ cấu trúc cây trực quan (Tree View); sắp xếp mảng theo trường và trích xuất các trường mong muốn (Field Extraction). |
| **Text & Code Diff Checker** | `/diff-checker` | So sánh chi tiết hai văn bản/mã nguồn (Original vs Modified) sử dụng Monaco Diff Editor; hỗ trợ đổi chiều, xem dạng song song (Side-by-Side) hoặc lồng dòng (Inline), tự nhận diện ngôn ngữ. |
| **JWT Decoder** | `/jwt-decoder` | Giải mã cục bộ token JWT; hiển thị thông tin Header và Payload dưới dạng cấu trúc JSON đã được định dạng và tô màu cú pháp. |
| **JSON Escape** | `/json-escape` | Chèn ký tự escape (`\"`, `\n`, `\t`, `\\`...) cho chuỗi văn bản hoặc JSON; hỗ trợ bọc dấu ngoặc kép, escape Unicode (`\uXXXX`) và cung cấp bảng ký tự tham chiếu. |
| **JSON Unescape** | `/json-unescape` | Giải mã ngược chuỗi JSON đã bị escape về định dạng JSON gốc chuẩn hóa, unwrap lồng nhiều lớp tiện lợi. |
| **Markdown Preview** | `/markdown-preview` | Soạn thảo mã nguồn Markdown (có Monaco Editor hỗ trợ) và xem trước HTML kết xuất thời gian thực; tính năng tự thu gọn editor (auto-collapse); xem toàn trang (Full Page modal); hỗ trợ sơ đồ Mermaid và thống kê số từ/ký tự. |

### 🔄 Convert (Bộ chuyển đổi định dạng & Code Generator)

| Công cụ | Route | Mô tả ngắn |
| --- | --- | --- |
| **JSON to YAML** | `/json-to-yaml` | Chuyển đổi dữ liệu JSON sang định dạng YAML bằng thư viện `js-yaml`, hiển thị lỗi cú pháp trực quan. |
| **YAML to JSON** | `/yaml-to-json` | Chuyển đổi cấu trúc YAML sang JSON định dạng đẹp mắt, hỗ trợ xác thực cú pháp và phát hiện lỗi. |
| **JSON to CSV** | `/json-to-csv` | Đổi mảng JSON sang dữ liệu CSV phẳng, hỗ trợ tùy biến dấu phân cách (dấu phẩy, chấm phẩy, tab) và tự xác định danh sách cột tiêu đề. |
| **CSV to JSON** | `/csv-to-json` | Đọc dữ liệu dạng CSV thô để chuyển đổi thành mảng đối tượng hoặc đối tượng JSON có cấu trúc, tự động nhận diện kiểu dữ liệu số/boolean. |
| **JSON to Excel** | `/json-to-excel` | Xuất dữ liệu mảng JSON thành tệp tin bảng tính Excel (`.xlsx`), tự động làm phẳng (flatten) các cấu trúc đối tượng lồng nhau thành các cột phẳng. |
| **Excel to JSON** | `/excel-to-json` | Đọc tệp tin Excel tải lên (`.xlsx`, `.xls`) hoặc dữ liệu bảng tính copy-paste từ Excel/Google Sheets rồi chuyển đổi thành mảng JSON. |
| **Encoder / Decoder** | `/encoder` | Mã hóa và giải mã văn bản hai chiều theo chuẩn Base64 hoặc URL Encoding, hỗ trợ đầy đủ ký tự Unicode tiếng Việt. |
| **JSON → C# POCO** | `/json-to-csharp` | Sinh tự động lớp mô hình C# POCO từ chuỗi JSON đầu vào; tự chuẩn hóa thuộc tính sang dạng PascalCase và gắn kèm thuộc tính `[JsonPropertyName("...")]` khi cần thiết. |
| **SQL Table → C# POCO** | `/sql-to-csharp` | Đọc và phân tích câu lệnh `CREATE TABLE` (SQL Server, PostgreSQL, MySQL) để sinh ra mã nguồn thuộc tính C# tương ứng, tự động xử lý kiểu nullable an toàn. |
| **C# ProtoMember Reindex** | `/csharp-proto` | Gỡ bỏ các chỉ số `[ProtoMember(n)]` cũ và đánh lại chuỗi chỉ số tuần tự tăng dần từ một số bắt đầu tự chọn trong tệp mã nguồn C#. |
| **C# Remove ProtoMember** | `/csharp-proto-remove` | Quét và loại bỏ nhanh toàn bộ các thuộc tính `[ProtoMember(n)]` khỏi mã nguồn C# nhưng vẫn giữ nguyên cấu trúc code. |

### 🔗 Utility (Tiện ích & Dashboard liên kết ngoài)

| Tiện ích | URL | Mô tả |
| --- | --- | --- |
| **Gold Price Tracker** | https://gold.nub.io.vn/ | Dashboard theo dõi trực quan giá vàng trong nước và thế giới thời gian thực. |
| **VPS Monitoring** | https://vps-monitoring.nub.io.vn/ | Hệ thống giám sát tài nguyên và trạng thái hoạt động của các máy chủ VPS. |
| **n8n Automation** | https://n8n.nub.io.vn/ | Nền tảng tự động hóa quy trình nghiệp vụ và tích hợp hệ thống qua n8n. |

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

### Frontend Stack
- **React 19.0.0** — Thư viện xây dựng giao diện người dùng component-based.
- **TypeScript 5.8.0** — Ngôn ngữ gõ tĩnh bảo đảm an toàn mã nguồn khi phát triển.
- **Vite 6.3.0** — Công cụ đóng gói (bundler) cực nhanh tích hợp Hot Module Replacement (HMR).
- **Tailwind CSS 4.1.0** (`@tailwindcss/vite`) — Framework CSS utility-first biên dịch trực tiếp qua plugin Vite thế hệ mới.
- **React Router 7.6.0** (`react-router-dom`) — Bộ định tuyến Single Page Application (SPA).
- **Monaco Editor 0.55.1** (`@monaco-editor/react` 4.7.0) — Trình soạn thảo mã nguồn mạnh mẽ của VS Code chạy trên web, cung cấp tính năng tô màu cú pháp (syntax highlighting) và so sánh diff.
- **js-yaml 4.1.0** — Thư viện phân tích và biên dịch YAML chất lượng cao.
- **xlsx 0.18.5** — Thư viện đọc/ghi và xử lý bảng tính Excel nâng cao.
- **marked 12.0.0** & **mermaid 11.0.0** — Thư viện chuyển đổi Markdown sang HTML và kết xuất sơ đồ, biểu đồ trực tiếp trên trình duyệt.
- **lucide-react 1.14.0** — Bộ sưu tập icon thiết kế dạng vector sắc nét, tải nhẹ.

### Infrastructure & DevOps
- **Docker** — Quy trình build đa giai đoạn (Multi-stage build) sử dụng `node:20-alpine` làm môi trường build và `nginx:alpine` phục vụ môi trường chạy thực tế (Runtime).
- **Nginx Alpine** — Web server siêu nhẹ phục vụ phân phối tệp tĩnh tĩnh, tích hợp cấu hình SPA fallback để React Router hoạt động trơn tru.
- **GitHub Actions** — Pipeline CI/CD tự động xây dựng mã nguồn và đẩy lên Docker Hub mỗi khi nhánh `main` được cập nhật.
- **Kiến trúc đa nền tảng (Multi-arch)** — Hỗ trợ cả hai dòng chip máy chủ phổ biến: `linux/amd64` và `linux/arm64`.

### SEO & Tiện ích bổ sung
- **Tự động sinh Sitemap** — Script `scripts/generate-sitemap.js` tự động quét các tuyến đường `<Route path="...">` khai báo trong `src/App.tsx` để ghi ra `public/sitemap.xml` trong mỗi lần build.
- **Kiểm tra phiên bản tự động** — Phiên bản được sinh tự động thông qua `scripts/generate-version.js` ghi vào `public/version.json`. Phía client sẽ thăm dò định kỳ và hiển thị thông báo yêu cầu tải lại trang nếu phát hiện phiên bản mới hơn trên server.
- **Bản địa hóa (Localization)** — Cơ chế dịch đa ngôn ngữ linh hoạt bằng cấu trúc key-value (Việt / Anh) tại `src/lib/i18n.ts`.

---

## 💻 Hướng dẫn chạy Local

### Yêu cầu hệ thống
- Máy tính đã cài đặt [Node.js](https://nodejs.org/) phiên bản **18.x trở lên** (khuyến nghị sử dụng **20 LTS**).
- Công cụ quản lý gói `npm` (thường đi kèm khi cài Node.js).

### Các bước thực hiện
```bash
# 1. Clone repository về máy cá nhân
git clone https://github.com/bao201102/tools.git
cd tools

# 2. Cài đặt các gói phụ thuộc (dependencies)
npm install

# 3. Khởi động máy chủ phát triển local (HMR)
npm run dev
```
Trình duyệt sẽ tự động mở hoặc bạn có thể truy cập thủ công thông qua địa chỉ mặc định: `http://localhost:5173`.

### Các script có sẵn trong dự án
```bash
npm run dev              # Khởi động dev server cục bộ
npm run build            # Biên dịch dự án cho production (tự sinh sitemap & tệp phiên bản trước khi đóng gói)
npm run preview          # Chạy thử bản build production cục bộ
npm run generate-sitemap # Chạy thủ công script tự sinh sitemap.xml
npm run generate-version # Chạy thủ công script tạo tệp version.json
```
*Lưu ý: Lệnh `npm run build` đã được cấu hình chạy kèm hook `prebuild` nhằm tự động cập nhật sitemap và version.json trước.*

---

## 🐳 Triển khai dự án với Docker

Cấu trúc Docker của dự án tối ưu hóa dung lượng lưu trữ nhờ cơ chế Multi-stage build: chỉ đóng gói các tệp tĩnh đã biên dịch cùng với web server Nginx mà không mang theo bộ cài Node.js hay thư mục `node_modules`.

### Sơ đồ hoạt động của Dockerfile
1. **Giai đoạn 1 (Builder):** Sử dụng base image `node:20-alpine`. Thực hiện copy `package.json`, chạy `npm ci` để cài dependencies sạch, copy source code và chạy lệnh `npm run build` để xuất kết quả ra thư mục `/dist`.
2. **Giai đoạn 2 (Runtime):** Sử dụng base image `nginx:alpine`. Chỉ copy thư mục `/dist` từ giai đoạn trước vào thư mục chứa tệp tĩnh của Nginx (`/usr/share/nginx/html`). Đồng thời ghi đè cấu hình `nginx.conf` tùy chỉnh để hỗ trợ cơ chế định tuyến SPA fallback.

### Build image đa nền tảng (AMD64 + ARM64) với `docker buildx`

Để ứng dụng có thể chạy mượt mà trên cả máy chủ Intel/AMD truyền thống và máy chủ ARM (như Apple Silicon hay AWS Graviton), bạn nên dùng Docker Buildx để đóng gói:

#### 1. Khởi tạo builder (chỉ cần làm một lần duy nhất)
```bash
docker buildx create --name multiarch --use 2>/dev/null || docker buildx use multiarch
docker buildx inspect --bootstrap
```

#### 2. Xây dựng và đẩy trực tiếp image lên Docker Hub
Hãy thay thế tên tài khoản `boris1120` bằng tài khoản Docker Hub của bạn:
```bash
# Build và push song song hai kiến trúc lên Docker Hub
docker buildx build --platform linux/amd64,linux/arm64 -t boris1120/dev-tools:latest --push .
```

Nếu bạn chỉ muốn build và chạy thử trên chính máy tính cá nhân của mình (không push lên registry):
```bash
docker buildx build --platform linux/arm64 -t dev-tools:local --load .
```
*(Tham số `--load` sẽ nạp image vừa build trực tiếp vào Docker daemon nội bộ của máy bạn).*

---

### Triển khai trên VPS sử dụng Docker Compose

Trên máy chủ Linux VPS, bạn chỉ cần tải/tạo file `docker-compose.yml` mà không cần clone toàn bộ mã nguồn của dự án về máy chủ.

**Nội dung tệp cấu hình mẫu `docker-compose.yml`:**
```yaml
services:
  web-tools:
    image: boris1120/dev-tools:latest
    container_name: dev_tools_app
    restart: always
    ports:
      - "8080:80"
```
Cấu hình trên sẽ chuyển hướng cổng `8080` của máy chủ VPS vào cổng `8`0 bên trong container Nginx. Bạn có thể sử dụng thêm reverse proxy (như Nginx, Caddy, Cloudflare Tunnel) trỏ vào cổng `8080` để gán SSL/HTTPS.

**Lệnh khởi chạy container:**
```bash
# Khởi chạy dịch vụ chạy ẩn
docker compose up -d
```

### Cập nhật ứng dụng khi có phiên bản mới trên Docker Hub
Mỗi khi bạn đẩy một bản build mới lên Docker Hub, trên VPS chỉ cần thực thi lệnh sau để cập nhật tức thì:
```bash
docker compose up -d --pull always
```
Tham số `--pull always` ép buộc docker-compose truy vấn và tải về các layer mới nhất của tag `:latest` trên registry trước khi khởi động lại container.

---

## 📁 Cấu trúc thư mục dự án

```text
tools/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Pipeline CI/CD tự động build Docker
├── public/
│   ├── favicon.png            # Biểu tượng ứng dụng
│   ├── robots.txt             # Cấu hình thân thiện với bộ máy tìm kiếm (SEO)
│   └── sitemap.xml            # Sitemap của ứng dụng (Tự sinh khi build)
├── scripts/
│   ├── generate-sitemap.js    # Script tự quét Route để sinh sitemap
│   └── generate-version.js    # Script sinh mã version.json
├── src/
│   ├── assets/                # Hình ảnh và tệp tài nguyên tĩnh
│   ├── components/            # Các UI component dùng chung (như ThemeSwitcher)
│   ├── config/                # Các tệp cấu hình dự án
│   ├── features/              # Cấu trúc tổ chức mã nguồn theo chức năng (Feature-based)
│   │   ├── csharp-proto-remove-tool/   # Công cụ xóa [ProtoMember]
│   │   ├── csharp-proto-tool/          # Công cụ đánh chỉ số [ProtoMember]
│   │   ├── csv-to-json-tool/           # Công cụ chuyển CSV -> JSON
│   │   ├── diff-checker-tool/          # Công cụ so sánh mã nguồn
│   │   ├── encoder-tool/               # Công cụ Encode/Decode Base64 & URL
│   │   ├── excel-to-json-tool/         # Công cụ chuyển Excel -> JSON
│   │   ├── json-escape-tool/           # Công cụ Escape & Unescape JSON
│   │   ├── json-to-csv-tool/           # Công cụ chuyển JSON -> CSV
│   │   ├── json-to-excel-tool/         # Công cụ chuyển JSON -> Excel
│   │   ├── json-to-yaml-tool/          # Công cụ chuyển JSON -> YAML
│   │   ├── json-tool/                  # Định dạng JSON chính (Formatter, Tree View...)
│   │   ├── jwt-decoder-tool/           # Bộ giải mã Token JWT
│   │   ├── markdown-preview-tool/      # Bộ soạn thảo & Xem trước Markdown
│   │   ├── poco-generator-tool/        # Công cụ sinh C# POCO từ JSON
│   │   ├── sql-to-poco-tool/           # Công cụ sinh C# POCO từ SQL
│   │   └── yaml-to-json-tool/          # Công cụ chuyển YAML -> JSON
│   ├── layouts/
│   │   └── MainLayout.tsx     # Bố cục khung chính ứng dụng (thanh menu, sidebar)
│   ├── lib/
│   │   ├── cn.ts              # Hàm tiện ích gộp class CSS (clsx + tailwind-merge)
│   │   ├── i18n.ts            # Hệ thống quản lý đa ngôn ngữ Việt - Anh
│   │   └── versionCheck.ts    # Logic thăm dò và kiểm tra phiên bản mới
│   ├── pages/                 # Các trang wrapper cho các feature-tools
│   ├── routes/                # Cấu hình định tuyến
│   ├── types/                 # Các định nghĩa kiểu TypeScript dùng chung
│   ├── utils/                 # Các hàm trợ giúp dùng chung
│   ├── App.tsx                # Khai báo các Route chính
│   ├── index.css              # Tệp CSS cấu trúc hệ thống thiết kế (Design Tokens)
│   └── main.tsx               # Điểm khởi chạy React của ứng dụng
├── Dockerfile                 # Quy trình đóng gói Docker multi-stage
├── docker-compose.yml         # Cấu hình docker compose chạy nhanh
├── nginx.conf                 # Cấu hình Nginx điều phối SPA
├── package.json               # Quản lý dependencies và script dự án
└── tsconfig.json              # Cấu hình trình biên dịch TypeScript
```

---

## 🚀 CI/CD Pipeline

Dự án được tích hợp sẵn quy trình Tích hợp và Triển khai liên tục (CI/CD) qua **GitHub Actions**:

- **Sự kiện kích hoạt:** Khi có hành động `push` mã nguồn vào nhánh `main`.
- **Nhiệm vụ:**
  - Thiết lập môi trường Docker Buildx.
  - Đăng nhập vào Docker Hub sử dụng thông tin bảo mật lưu trữ trong GitHub Secrets (`DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`).
  - Tự động đóng gói Docker Image đa nền tảng (`linux/amd64` và `linux/arm64`) và đẩy thẳng lên Docker Hub với nhãn tag `:latest`.
- **Tệp định nghĩa pipeline:** `.github/workflows/deploy.yml`.

---

## 📄 Bản quyền (License)

Dự án được phân phối dưới dạng mã nguồn mở theo các điều khoản của [MIT License](file:///d:/Project%20Test/tools/LICENSE). Bạn hoàn toàn có thể tự do sao chép, sửa đổi, phân phối hoặc sử dụng cho mục đích cá nhân và thương mại.