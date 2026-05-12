# Cursor Hooks Documentation

## Tổng quan

Dự án này sử dụng **Cursor Hooks** để tự động cập nhật **CHANGELOG.md** và **README.md** khi có thay đổi quan trọng.

## Hooks đã cấu hình

### 1. `afterFileEdit` Hook
**Trigger:** Sau mỗi lần file được chỉnh sửa

**Chức năng:**
- Tự động phát hiện thay đổi quan trọng
- Cập nhật CHANGELOG.md với các thay đổi đáng kể
- **Tự động cập nhật README.md khi có tính năng mới**

**Tiêu chí cập nhật CHANGELOG.md:**
✅ **GHI:**
- Tính năng mới (components, tools, functionality)
- Bug fixes quan trọng
- Breaking changes hoặc refactoring lớn
- Thay đổi infrastructure (CI/CD, Docker, configs)
- Dependency updates quan trọng

❌ **KHÔNG GHI:**
- Sửa typo nhỏ
- Format code hoặc style changes
- Chỉ update comments
- Refactoring trivial

**Tiêu chí cập nhật README.md:**
✅ **CẬP NHẬT:**
- Tool/tính năng mới được thêm vào
- Thêm vào bảng features (## ✨ Tính năng)
- Cập nhật danh sách routes
- Mô tả rõ ràng chức năng và khả năng

❌ **KHÔNG CẬP NHẬT:**
- Bug fixes
- Cải tiến nhỏ cho tính năng có sẵn
- Refactoring nội bộ
- Thay đổi infrastructure

### 2. `stop` Hook
**Trigger:** Khi agent session kết thúc

**Chức năng:**
- Review toàn bộ công việc đã làm trong session
- Nhóm các thay đổi liên quan lại với nhau
- **Cập nhật cả CHANGELOG.md và README.md**
- Tạo documentation entries tổng hợp cho cả session
- Tránh tạo quá nhiều entries nhỏ lẻ

**Lợi ích:**
- Documentation entries có ngữ cảnh đầy đủ hơn
- Nhóm các thay đổi liên quan
- Giảm noise trong changelog
- **Đảm bảo README.md luôn sync với features mới**

## Cách hoạt động

1. **Tự động phát hiện:** Hook chạy sau mỗi file edit hoặc khi session kết thúc
2. **Đánh giá thông minh:** Sử dụng prompt hook để AI đánh giá mức độ quan trọng
3. **Cập nhật song song:** 
   - **CHANGELOG.md**: Ghi lại tất cả thay đổi quan trọng
   - **README.md**: Cập nhật khi có tính năng mới
4. **Phân loại tự động:** Xếp vào category phù hợp (Added, Changed, Fixed, etc.)
5. **Đồng bộ documentation:** Đảm bảo README luôn phản ánh đúng features hiện tại

## Cấu trúc Documentation

### CHANGELOG.md
```markdown
## [Unreleased]

### Added
- Tính năng mới

### Changed
- Thay đổi existing features

### Fixed
- Bug fixes

### Infrastructure
- CI/CD, Docker, configs

### Dependencies
- Package updates
```

### README.md
Hook sẽ tự động cập nhật các phần:

1. **Bảng tính năng (## ✨ Tính năng)**
   - Thêm row mới cho tool mới
   - Format: `| **Tool Name** | Mô tả chi tiết chức năng và khả năng |`

2. **Danh sách routes (React Router section)**
   - Thêm route mới vào danh sách
   - Format: `/route-name`

3. **Tech stack (nếu cần)**
   - Cập nhật dependencies mới
   - Thêm công nghệ mới sử dụng

## Kiểm tra Hook hoạt động

1. Mở **Cursor Settings** → **Hooks** tab
2. Xem **Hooks Output Channel** để debug
3. Hook sẽ tự động reload khi `hooks.json` thay đổi

## Tùy chỉnh

Để thay đổi hành vi hook, chỉnh sửa `.cursor/hooks.json`:
- `timeout`: Thời gian chờ tối đa (giây)
  - `afterFileEdit`: 45s (đủ để cập nhật cả 2 files)
  - `stop`: 60s (review toàn bộ session)
- `prompt`: Nội dung hướng dẫn cho AI
- Thêm `matcher` để filter theo pattern cụ thể

## Ví dụ workflow

### Khi thêm tool mới:
1. ✅ Tạo feature folder mới (vd: `src/features/new-tool/`)
2. ✅ Implement components, hooks, utils
3. ✅ Add route vào router
4. 🤖 **Hook tự động:**
   - Phát hiện tính năng mới
   - Thêm vào CHANGELOG.md → `### Added`
   - Cập nhật README.md → Bảng tính năng + routes
   - Mô tả rõ ràng chức năng

### Khi fix bug:
1. ✅ Fix code
2. 🤖 **Hook tự động:**
   - Thêm vào CHANGELOG.md → `### Fixed`
   - KHÔNG cập nhật README.md (không cần thiết)

### Khi cải tiến feature có sẵn:
1. ✅ Enhance existing feature
2. 🤖 **Hook tự động:**
   - Thêm vào CHANGELOG.md → `### Changed`
   - Cập nhật README.md nếu mô tả cũ không còn chính xác

## Lưu ý

- Hook sử dụng **prompt-based** approach (không cần script)
- Hoạt động cross-platform (Windows, Linux, macOS)
- Không cần cài đặt dependencies bổ sung
- AI sẽ tự quyết định có nên update documentation hay không
- **Cập nhật 2 files song song**: CHANGELOG.md (luôn) + README.md (khi cần)
- Hook chỉ trigger khi có thay đổi thực sự quan trọng
- Timeout đủ dài để AI có thể đọc và cập nhật cả 2 files

## Troubleshooting

### Hook không chạy?
1. Kiểm tra **Cursor Settings** → **Hooks** tab
2. Xem **Hooks Output Channel** để debug
3. Restart Cursor nếu cần
4. Verify `.cursor/hooks.json` syntax đúng

### README.md không được cập nhật?
- Hook chỉ cập nhật README khi có **tính năng mới**
- Bug fixes và improvements nhỏ không trigger README update
- Kiểm tra timeout có đủ không (hiện tại: 45s cho afterFileEdit, 60s cho stop)

### CHANGELOG.md bị duplicate entries?
- Hook `stop` sẽ review toàn bộ session và nhóm changes
- Nếu `afterFileEdit` đã ghi, `stop` hook sẽ tránh duplicate
- AI tự động detect và merge related changes

---

**Tạo ngày:** 2026-05-12  
**Cập nhật:** 2026-05-12 - Thêm tự động cập nhật README.md
