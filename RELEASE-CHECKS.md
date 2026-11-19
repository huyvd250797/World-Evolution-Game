# World Evolution V0.6.0 — Release checks

Ngày kiểm tra: 19/11/2026. Nền source: ZIP V0.5.0 Boss đính kèm (hai file đính kèm có cùng SHA-256).

| Kiểm tra | Kết quả |
| --- | --- |
| Typecheck app + tools/tests | Đạt |
| ESLint | Đạt |
| Unit/integration | 66 tests/subtests đạt, 0 lỗi |
| Frozen adapter | Nhu cầu, TTL từng loại, công thức/nguyên liệu, tải và SP001/SP015 khớp catalog |
| Gameplay mới | Hái quả đi/làm/mang/giao; không nhận ngay, nguồn hữu hạn; FEFO và sổ ngày không cấp trùng |
| Bảo quản | TTL cá/thịt/nấm/củ/hạt riêng, carried vẫn già; kho phù hợp dừng tuổi, ra kho tiếp tục tuổi cũ |
| Điều kiện sản xuất | Nước/săn/nấu bị chặn nếu thiếu tech/cơ sở/công cụ; adapter đủ điều kiện được kiểm bằng fixture |
| Save | Schema 2/3/4 nâng đọc 5; raw legacy head/history giữ nguyên; snapshot thật khi đang mang hàng qua SQL/đọc lại giữ lô/hạn |
| Worker | Worker source thật qua bridge: lease, tick/pause, giao việc, không cho lệnh move khác chiếm người, reload job |
| SQL 005 | PGlite chạy chuỗi migrations, owner/fence/restore/downgrade, malformed lot/ledger và survival delta bị chặn |
| HTTP | Next SSR/actions/API + Auth/PostgREST fixture, Supabase SDK, save/retry/history/restore; schema 5 và allocation/delta validation đạt |
| Production | Next/Turbopack build đạt; kiểm cài sạch/build lại từ ZIP bàn giao |
| Bảo toàn nền | Workbook/catalog/planning/population/asset cũ, migrations 001–004, proxy entries và generator we-map-1 giữ nguyên byte |

Playwright có spec survival mới nhưng **chưa chạy được browser trong môi trường này** (Chromium socket bị chặn ở môi trường nền). Chưa xác minh Safari/iPhone/Android, WebGL/GPU, Supabase/Vercel thật hoặc OS kill/suspend. Không coi fixture hoặc Canvas thay thế nghiệm thu thiết bị thật. Chưa push/deploy vào tài khoản Boss.

Gameplay hiện tại dùng được hái quả/cấp ăn/bãi ngoài trời. Săn, lấy nước, bếp, kho bảo quản còn bị khóa bởi dependencies thi công/đào tạo/nghiên cứu; không tự mở công nghệ hoặc biến blueprint thành công trình hoạt động. Chi tiết trong docs/SURVIVAL-AND-FOOD.md.
