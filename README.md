# NUB Portal — Your Workspace Hub

Ứng dụng web tập hợp các công cụ phát triển và dashboard chạy hoàn toàn trên trình duyệt: nhanh, gọn và không cần máy chủ xử lý dữ liệu nhạy cảm của bạn.

---

## 📌 Giới thiệu

**NUB Portal** là một **ứng dụng web toolkit** dành cho lập trình viên và quản lý workspace, được thiết kế để:

- **Tốc độ cao** — Giao diện SPA nhẹ, xử lý phía client, không tải dữ liệu lên máy chủ.
- **Riêng tư** — Mã nguồn, YAML, JSON và bản gõ C# của bạn **không bắt buộc** phải gửi ra ngoài (trừ khi bạn tự triển khai server riêng).
- **Tiện lợi** — Một nơi duy nhất cho format tài liệu, kiểm tra cú pháp và chuẩn hóa attribute protobuf trong mã C#.

Dự án phù hợp dùng trực tiếp trong trình duyệt khi phát triển, hoặc triển khai tĩnh (Nginx/VPS) để team nội bộ truy cập.

---

## ✨ Tính năng

Các công cụ được nhóm trên **menu** và **trang chủ** thành ba mục: **Tools**, **Convert**, **Utility**. Giao diện dark mặc định, hỗ trợ **EN / VI**.

### Tools
| Công cụ | Route | Mô tả ngắn |
| --- | --- | --- |
| **JSON Formatter** | `/json` | Pretty-print và validate JSON khi gõ; compress, sort keys, thống kê kích thước/cấu trúc. |
| **Text & Code Diff Checker** | `/diff-checker` | So sánh Original vs Modified (Monaco Diff); side-by-side / inline, swap, auto-detect ngôn ngữ. |
| **JWT Decoder** | `/jwt-decoder` | Decode header và payload JWT cục bộ, hiển thị JSON đã format. |
| **JSON Escape** | `/json-escape` | Escape văn bản/JSON (`\"`, `\n`, `\t`, `\\`…); tùy chọn wrap in quotes, escape Unicode, thống kê ký tự. |
| **JSON Unescape** | `/json-unescape` | Chuyển chuỗi JSON escaped về JSON dễ đọc; unwrap nhiều lớp, format pretty-print. |

### Convert
| Công cụ | Route | Mô tả ngắn |
| --- | --- | --- |
| **JSON to YAML** | `/json-to-yaml` | Chuyển đổi JSON sang YAML với `js-yaml`; load example, copy output, báo lỗi cú pháp JSON. |
| **Base64 / URL Encoder & Decoder** | `/encoder` | Encode/decode Base64 và URL trên client; swap input/output. |
| **JSON → C# POCO** | `/json-to-csharp` | Sinh class C# từ JSON, `[JsonPropertyName]`, nested objects/arrays. |
| **SQL Table → C# POCO** | `/sql-to-csharp` | Parse `CREATE TABLE`, map kiểu SQL → C#, nullable an toàn. |
| **C# ProtoMember Reindex** | `/csharp-proto` | Gỡ và đánh lại `[ProtoMember(n)]` tuần tự từ số bắt đầu bạn chọn. |
| **C# Remove ProtoMember** | `/csharp-proto-remove` | Xóa toàn bộ `[ProtoMember(n)]`, giữ nguyên cấu trúc code. |

### Utility (liên kết ngoài)
| Dịch vụ | URL |
| --- | --- |
| **Gold Price Tracker** | https://gold.nub.io.vn/ |
| **n8n Automation** | https://n8n.nub.io.vn/ |

Điều hướng qua **React Router**: thanh menu (dropdown Tools / Convert / Utility) và thẻ trên trang chủ.

---

## 🛠️ Công nghệ sử dụng

### Frontend Stack
- **React 19.0.0** — Giao diện và trạng thái component
- **TypeScript 5.8.0** — Kiểm tra kiểu tĩnh, mã dễ bảo trì
- **Vite 6.3.0** — Dev server nhanh, bundling tối ưu
- **Tailwind CSS 4.1.0** (`@tailwindcss/vite`) — Styling utility-first
- **React Router 7.6.0** — Định tuyến SPA
- **Monaco Editor 0.55.1** (`@monaco-editor/react` 4.7.0) — Code editor với syntax highlighting và diff viewer
- **js-yaml 4.1.0** — Parse & dump YAML
- **lucide-react 1.14.0** — Icon library

### Infrastructure & DevOps
- **Docker** — Multi-stage build (Node 20 Alpine + Nginx Alpine)
- **Nginx Alpine** — Phục vụ bản build tĩnh với SPA fallback
- **GitHub Actions** — CI/CD pipeline tự động build và deploy
- **Multi-architecture support** — AMD64 + ARM64

### SEO & Utilities
- **Sitemap generation** — `scripts/generate-sitemap.js` đọc routes từ `src/App.tsx` → `public/sitemap.xml` (tự động khi thêm `<Route path="...">`)
- **Version checking** — Client-side version detection với auto-refresh notification
- **robots.txt** — SEO configuration
- **i18n** — Tiếng Anh / Tiếng Việt (`src/lib/i18n.ts`)

---

## 💻 Hướng dẫn chạy Local

### Yêu cầu

- [Node.js](https://nodejs.org/) **18+** (khuyến nghị **20 LTS** để khớp Dockerfile)
- npm (đi kèm Node)

### Các bước

```bash
# 1. Clone repository
git clone <URL-repository-của-bạn>.git
cd tools

# 2. Cài dependency
npm install

# 3. Chạy môi trường phát triển (HMR)
npm run dev
```

Mở trình duyệt tại địa chỉ Vite in ra (thường là `http://localhost:5173`).

### Scripts có sẵn

```bash
npm run dev              # Chạy dev server với HMR
npm run build            # Build production (tự động generate sitemap + version)
npm run preview          # Preview bản build production
npm run generate-sitemap # Generate sitemap.xml
npm run generate-version # Generate version.json
```

**Lưu ý:** `npm run build` tự động chạy `prebuild` hook để generate sitemap và version trước khi build.

---

## 🐳 Hướng dẫn triển khai với Docker

Phần này mô tả **build image đa kiến trúc**, **hiểu Dockerfile nhiều giai đoạn** và **chạy trên VPS** bằng Docker Compose.

### Dockerfile nhiều giai đoạn làm gì?


| Giai đoạn       | Image            | Nội dung                                                                                                                                                                     |
| --------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1 – Builder** | `node:20-alpine` | Sao chép `package.json` / `package-lock.json`, chạy `npm ci`, copy mã nguồn, chạy `npm run build` → thư mục `dist/`.                                                         |
| **2 – Runtime** | `nginx:alpine`   | Chỉ copy `**dist/`** từ builder sang `/usr/share/nginx/html`, gắn `nginx.conf` (SPA fallback về `index.html` cho React Router), expose cổng **80**, chạy Nginx ở foreground. |


**Lợi ích:** Image chạy production **nhỏ** (không chứa Node/npm), chỉ còn file tĩnh + Nginx.

---

### Build image đa nền tảng (AMD64 + ARM64) với `docker buildx`

Để một tag image chạy được trên **máy Intel/AMD (linux/amd64)** và **ARM như AWS Graviton / Apple Silicon server (linux/arm64)**, dùng **Docker Buildx**.

#### 1. Tạo builder (một lần)

```bash
docker buildx create --name multiarch --use 2>/dev/null || docker buildx use multiarch
docker buildx inspect --bootstrap
```

#### 2. Build & đẩy lên registry (Docker Hub hoặc registry khác)

Thay `<your-username>` và tên image cho đúng dự án của bạn.

```bash
docker buildx build --platform linux/arm64 -t boris1120/dev-tools:latest --push .
```

- `**--platform linux/amd64,linux/arm64**` — Một manifest liệt kê cả hai kiến trúc.
- `**-t ...**` — Tag đầy đủ trên registry (ví dụ `docker.io/username/repo:tag`).
- `**--push**` — Đẩy manifest + từng layer kiến trúc lên registry (cần `docker login` trước nếu dùng Docker Hub).

Nếu chỉ build cục bộ, không push:

```bash
docker buildx build --platform linux/arm64 -t dev-tools:local --load .
```

> `**--load**` chỉ tải **một** kiến trúc trùng với máy bạn; để có cả hai thường dùng `**--push`** hoặc export qua `docker buildx build ... -o type=docker`.

---

### Triển khai trên VPS với `docker-compose`

Trên VPS (Linux), tạo thư mục dự án (ví dụ `/opt/dev-tools`) và đặt file `**docker-compose.yml`** — có thể **không** cần clone source nếu chỉ dùng image từ registry.

**Ví dụ `docker-compose.yml` (chỉ kéo image, map cổng 8080):**

```yaml
services:
  web-tools:
    image: boris1120/dev-tools:latest
    container_name: dev_tools_app
    restart: always
    ports:
      - "8080:80"
```

- `**8080:80**` — Host `8080` → container Nginx `80` (giống cấu hình mẫu của dự án).
- Đặt **reverse proxy** (Caddy/Traefik/Nginx) trỏ domain về `8080` nếu cần HTTPS.

Khởi tạo / cập nhật lần đầu:

```bash
cd /opt/dev-tools
docker compose pull
docker compose up -d
```

---

### Cập nhật container khi đã có image mới trên registry

Sau khi bạn **push** image tag mới (ví dụ `latest`), trên VPS chạy:

```bash
cd /opt/dev-tools
docker compose up -d --pull always
```

- `**--pull always**` — Luôn kéo image mới nhất theo tag trước khi recreate container.
- `**-d**` — Chạy nền.

Kiểm tra:

```bash
docker compose ps
docker compose logs -f web
```

---

## 📁 Cấu trúc dự án

```
tools/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD pipeline
├── public/
│   ├── sitemap.xml            # Auto-generated sitemap
│   └── robots.txt             # SEO configuration
├── scripts/
│   ├── generate-sitemap.js    # Sitemap generator
│   └── generate-version.js    # Version generator
├── src/
│   ├── features/              # Feature-based structure
│   │   ├── json-tool/
│   │   ├── json-escape-tool/    # Escape + Unescape (pages /json-escape, /json-unescape)
│   │   ├── json-to-yaml-tool/
│   │   ├── csharp-proto-tool/
│   │   ├── csharp-proto-remove-tool/
│   │   ├── encoder-tool/
│   │   ├── diff-checker-tool/
│   │   ├── poco-generator-tool/
│   │   ├── sql-to-poco-tool/
│   │   └── jwt-decoder-tool/
│   ├── lib/                   # Utilities
│   │   └── versionCheck.ts    # Client-side version checking
│   └── ...
├── Dockerfile                 # Multi-stage Docker build
├── docker-compose.yml         # Docker Compose configuration
├── nginx.conf                 # Nginx SPA configuration
└── package.json
```

---

## 🚀 CI/CD Pipeline

Dự án sử dụng **GitHub Actions** để tự động build và deploy:

- **Trigger:** Push to `main` branch
- **Build:** Multi-architecture Docker image (AMD64 + ARM64)
- **Deploy:** Push to Docker Hub (`boris1120/dev-tools:latest`)
- **Workflow file:** `.github/workflows/deploy.yml`

---

## 📄 License & đóng góp

Nếu dự án mở nguồn, hãy bổ sung file `LICENSE` và hướng dẫn đóng góp (CONTRIBUTING). Mọi ý kiến cải thiện công cụ hoặc bản dịch README đều được chào đón.

---

**Phiên bản:** 0.0.0  
**Cập nhật lần cuối:** 2026-05-18

## 📝 Changelog

### 2026-05-18
- Đổi route `/yaml` thành `/json-to-yaml` và di chuyển vào nhóm Convert
- Đổi tên thư mục `yaml-tool` thành `json-to-yaml-tool`
- Thêm nút "Load Example" và "Copy" vào JSON to YAML converter
- Cập nhật logic: Parse JSON input và convert sang YAML output

