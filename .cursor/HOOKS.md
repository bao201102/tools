# Cursor Hooks Documentation

## Tổng quan

Dự án này sử dụng **Cursor Hooks** để tự động cập nhật CHANGELOG.md khi có thay đổi quan trọng.

## Hooks đã cấu hình

### 1. `afterFileEdit` Hook
**Trigger:** Sau mỗi lần file được chỉnh sửa

**Chức năng:**
- Tự động phát hiện thay đổi quan trọng
- Đánh giá xem có cần ghi vào CHANGELOG.md không
- Tự động cập nhật CHANGELOG.md với mô tả rõ ràng

**Tiêu chí ghi log:**
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

### 2. `stop` Hook
**Trigger:** Khi agent session kết thúc

**Chức năng:**
- Review toàn bộ công việc đã làm trong session
- Nhóm các thay đổi liên quan lại với nhau
- Tạo changelog entry tổng hợp cho cả session
- Tránh tạo quá nhiều entries nhỏ lẻ

**Lợi ích:**
- Changelog entries có ngữ cảnh đầy đủ hơn
- Nhóm các thay đổi liên quan
- Giảm noise trong changelog

## Cách hoạt động

1. **Tự động phát hiện:** Hook chạy sau mỗi file edit hoặc khi session kết thúc
2. **Đánh giá thông minh:** Sử dụng prompt hook để AI đánh giá mức độ quan trọng
3. **Cập nhật tự động:** Nếu đủ quan trọng, tự động thêm vào CHANGELOG.md
4. **Phân loại:** Tự động xếp vào category phù hợp (Added, Changed, Fixed, etc.)

## Cấu trúc CHANGELOG.md

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

## Kiểm tra Hook hoạt động

1. Mở **Cursor Settings** → **Hooks** tab
2. Xem **Hooks Output Channel** để debug
3. Hook sẽ tự động reload khi `hooks.json` thay đổi

## Tùy chỉnh

Để thay đổi hành vi hook, chỉnh sửa `.cursor/hooks.json`:
- `timeout`: Thời gian chờ tối đa (giây)
- `prompt`: Nội dung hướng dẫn cho AI
- Thêm `matcher` để filter theo pattern cụ thể

## Lưu ý

- Hook sử dụng **prompt-based** approach (không cần script)
- Hoạt động cross-platform (Windows, Linux, macOS)
- Không cần cài đặt dependencies bổ sung
- AI sẽ tự quyết định có nên update CHANGELOG hay không

---

**Tạo ngày:** 2026-05-12
