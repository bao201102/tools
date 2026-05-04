# Developer Tools — Bộ công cụ cho lập trình viên

Ứng dụng web tập hợp các công cụ phát triển chạy hoàn toàn trên trình duyệt: nhanh, gọn và không cần máy chủ xử lý dữ liệu nhạy cảm của bạn.

---

## 📌 Giới thiệu

**Developer Tools** là một **ứng dụng web toolkit** dành cho lập trình viên, được thiết kế để:

- **Tốc độ cao** — Giao diện SPA nhẹ, xử lý phía client, không tải dữ liệu lên máy chủ.
- **Riêng tư** — Mã nguồn, YAML, JSON và bản gõ C# của bạn **không bắt buộc** phải gửi ra ngoài (trừ khi bạn tự triển khai server riêng).
- **Tiện lợi** — Một nơi duy nhất cho format tài liệu, kiểm tra cú pháp và chuẩn hóa attribute protobuf trong mã C#.

Dự án phù hợp dùng trực tiếp trong trình duyệt khi phát triển, hoặc triển khai tĩnh (Nginx/VPS) để team nội bộ truy cập.

---

## ✨ Tính năng


| Công cụ                            | Mô tả ngắn                                                                                                                                                                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **JSON Formatter & Minifier**      | Định dạng JSON với thụt dòng chuẩn, thu gọn (minify) và hiển thị trong Monaco Editor với highlight cú pháp.                                                                                                                                 |
| **YAML Formatter & Validator**     | Parse YAML bằng `js-yaml`, format lại và báo lỗi cú pháp trực quan.                                                                                                                                                                         |
| **C# ProtoMember Reindex Tool**    | Đọc mã C# **theo từng dòng**, dùng **Regex** để gỡ `[ProtoMember(n)]` cũ và gán lại số thứ tự từ một **số bắt đầu** bạn chọn; hỗ trợ các property dạng `{ get; set; }`, `init`, `private set`, v.v.; giữ nguyên comment `//` và dòng trống. |
| **Base64 / URL Encoder & Decoder** | Mã hóa/giải mã nhanh giữa văn bản thường, Base64 và URL encoding ngay trên client; hỗ trợ Unicode và hiển thị lỗi khi input decode không hợp lệ.                                                                                            |


Điều hướng giữa các công cụ qua **React Router** (sidebar + thẻ trên trang chủ).

---

## 🛠️ Công nghệ sử dụng

- **React 19** — Giao diện và trạng thái component.
- **TypeScript** — Kiểm tra kiểu tĩnh, mã dễ bảo trì.
- **Vite** — Dev server nhanh, bundling tối ưu.
- **Tailwind CSS (v4 + `@tailwindcss/vite`)** — Styling utility-first.
- **React Router** — Định tuyến SPA (`/`, `/json`, `/yaml`, `/csharp-proto`, `/encoder`).
- **Monaco Editor (`@monaco-editor/react`)** — Soạn thảo code với highlight (JSON / YAML / C#), tùy chọn read-only có `fixedOverflowWidgets` cho vùng output.
- **js-yaml** — Parse & dump YAML trong YAML Formatter.
- **Nginx (Alpine)** — Phục vụ bản build tĩnh trong Docker.

---

## 💻 Hướng dẫn chạy Local

### Yêu cầu

- [Node.js](https://nodejs.org/) **18+** (khuyến nghị **20 LTS** để khớp Dockerfile).
- npm (đi kèm Node).

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

### Build kiểm tra production cục bộ

```bash
npm run build
npm run preview
```

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

## 📄 License & đóng góp

Nếu dự án mở nguồn, hãy bổ sung file `LICENSE` và hướng dẫn đóng góp (CONTRIBUTING). Mọi ý kiến cải thiện công cụ hoặc bản dịch README đều được chào đón.

---

