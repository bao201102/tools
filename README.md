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

### JSON Tools
| Công cụ                            | Route | Mô tả ngắn                                                                                                                                                                                                                                  |
| ---------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **JSON Formatter & Minifier**      | `/json` | Pretty-print JSON theo thời gian thực khi gõ, hỗ trợ **minify theo nút bấm**, hiển thị trong Monaco Editor và báo lỗi parse rõ ràng.                                                                                                       |
| **JSON Escaper & Unescaper**       | `/json-escape` | Chuyển đổi hai chiều giữa chuỗi JSON escaped và JSON đã format; hỗ trợ unwrap chuỗi lồng nhiều lớp (thường gặp trong log C#/payload), kiểm tra root phải là object/array, và hiển thị lỗi ngay trong ô kết quả.                           |
| **JSON to C# POCO Generator**      | `/json-to-csharp` | Sinh class C# từ JSON với naming theo chuẩn C# (PascalCase), tự thêm `[JsonPropertyName("...")]` khi cần ánh xạ tên gốc, hỗ trợ nested objects và arrays, giữ output dễ đọc để dùng trực tiếp trong API/client models.                                                                |

### YAML Tools
| Công cụ                            | Route | Mô tả ngắn                                                                                                                                                                                                                                  |
| ---------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **YAML Formatter & Validator**     | `/yaml` | Parse YAML bằng `js-yaml`, normalize theo thời gian thực và báo lỗi cú pháp trực quan.                                                                                                                                                     |

### C# Tools
| Công cụ                            | Route | Mô tả ngắn                                                                                                                                                                                                                                  |
| ---------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **C# ProtoMember Reindex Tool**    | `/csharp-proto` | Đọc mã C# **theo từng dòng**, dùng **Regex** để gỡ `[ProtoMember(n)]` cũ và gán lại số thứ tự từ một **số bắt đầu** bạn chọn; hỗ trợ các property dạng `{ get; set; }`, `init`, `private set`, v.v.; giữ nguyên comment `//` và dòng trống. |
| **C# Remove ProtoMember Tool**     | `/csharp-proto-remove` | Xóa tất cả `[ProtoMember(n)]` attributes, hỗ trợ optional digit matching, giữ nguyên cấu trúc code.                                                                                                                                        |
| **SQL Table to C# POCO Generator** | `/sql-to-csharp` | Parse câu lệnh `CREATE TABLE` (SQL Server/PostgreSQL), map kiểu dữ liệu SQL sang C#, áp dụng nullable `?` cho value type khi cột cho phép `NULL` (riêng `string` luôn giữ nguyên), và chuyển tên cột sang PascalCase.                     |

### Encoding Tools
| Công cụ                            | Route | Mô tả ngắn                                                                                                                                                                                                                                  |
| ---------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Base64 / URL Encoder & Decoder** | `/encoder` | Mã hóa/giải mã nhanh giữa văn bản thường, Base64 và URL encoding ngay trên client; hỗ trợ Unicode và hiển thị lỗi khi input decode không hợp lệ.                                                                                          |
| **JWT Decoder**                    | `/jwt-decoder` | Decode JWT header/payload cục bộ trong trình duyệt, parse thành JSON đã format và báo lỗi khi token không hợp lệ.                                                                                                                          |

### Diff & Comparison Tools
| Công cụ                            | Route | Mô tả ngắn                                                                                                                                                                                                                                  |
| ---------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Text & Code Diff Checker**       | `/diff-checker` | So sánh **Original vs Modified** bằng Monaco Diff Editor; có chế độ **Side-by-side/Inline**, chỉnh được cả hai bên, chọn ngôn ngữ highlight, kèm nút **Swap** và **Clear All**, auto-detect diff mode, customizable labels, dynamic split widths.                               |

Điều hướng giữa các công cụ qua **React Router** (sidebar + thẻ trên trang chủ).

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
- **Sitemap generation** — Auto-generate sitemap.xml
- **Version checking** — Client-side version detection với auto-refresh notification
- **robots.txt** — SEO configuration

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
│   │   ├── json-escape-tool/
│   │   ├── yaml-tool/
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
**Cập nhật lần cuối:** 2026-05-12

