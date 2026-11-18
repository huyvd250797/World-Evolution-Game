# Xác minh V0.4.0 — Construction & City Planning

- Typecheck app/tools/tests, lint, unit/SQL/Worker/session, data:check, HTTP và production build. Kết quả cuối trong RELEASE-CHECKS.md.
- 166 dòng adapter đối chiếu ID/tên/công dụng/era/technology/BOM với Frozen, footprint tách riêng.
- Preview/rotation, bounds/water/slope/waterfront/quarry, khóa tech/era, occupancy nền/tuyến, L-route contiguous, intersection và giới hạn.
- Migration 003 trên database V0.3 giữ raw head/history byte; decode schema 2 giữ tick/RNG, planning mới full save/delta clock/restore; SQL cấm overlap và direct table access.
- Worker/session thật kiểm plan command, giữ state qua save, kế thừa lost-ACK retry/fencing/offline/local recovery; API HTTP kiểm lưu/tải nền, reject công trình khóa và planning delta.
- Canvas thật kiểm ghost xanh/đỏ khác pixel, culling khi pan và cleanup; composite đã xem có bốn nền và một tuyến. Đây không phải browser screenshot.
- Giữ regression account/world/RLS/revision/Canonical/map/camera/proxy/release verifier.

Chromium đã bị môi trường chặn socket ở phiên kiểm nền trước; V0.4 không coi UI/Playwright/WebGL GPU/Safari/Android đã đạt. Không xác minh Supabase/Vercel thật của Boss. Các fixtures chỉ local, không nhập vào production.

## Checklist nghiệm thu deployment

1. Chạy 003 một lần sau 001/002, giữ data/env. Mở world cũ, đối chiếu tick/seed/map/20 dân.
2. Mở danh mục, tìm/lọc era, xem tech/BOM và khóa. Thử Bãi quan sát/Lều ở; ghost + footprint phải khớp tọa độ khi xác nhận/xoay.
3. Chạm/drag/pinch không tự tạo nền. Mobile cần thử dọc/ngang/mở rộng, Hủy trái/Xác nhận phải; không tràn ngang.
4. Thử nước/mép map/dốc/kho bờ sông/nền đã chiếm/tuyến bị chặn và xem lý do. Đặt tuyến hai điểm, đổi bend, chọn/hủy nền và tuyến có xác nhận.
5. Lưu ngay/Đã lưu → reload/thiết bị khác giữ đúng layout/hướng; lease cũ không ghi đè. Restore mốc trước quy hoạch phải theo xác nhận và tạo revision mới.
6. Mất mạng/localStorage bị chặn/khác revision giữ quy tắc recovery; không reset DB để sửa lỗi.
7. Đo RAM/GPU/FPS/texture/egress thật với nhiều nền/tuyến; không có cam kết 60fps hoặc Free không giới hạn.
