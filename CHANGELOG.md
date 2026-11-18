# Changelog

## V0.1.2 — Proxy Path Compatibility Fix — 18/11/2026

- Root proxy và src proxy dùng cùng entry alias, thay đường dẫn tương đối phụ thuộc vị trí.
- Tách refreshSession vào src/lib/supabase/proxy.ts; giữ nguyên xác thực và quyền dữ liệu.
- Typecheck bao gồm proxy ở gốc, thêm regression kiểm import ở cả hai vị trí và rà toàn bộ import nội bộ runtime.
- Kiểm tra lại source sạch và tình huống cập nhật trên repo có proxy cũ ở gốc.
- Không thay đổi Master Data/database, không cần migration mới.


## V0.1.1 — Vercel Deployment Hotfix — 18/11/2026

- Build Vercel dùng catalog JSON đã xuất sẵn; loại bỏ phụ thuộc chạy scripts/catalog.ts trong production build.
- Giữ kiểm SHA-256 Canonical và asset bằng verify-release.mjs ở gốc source.
- Tách typecheck ứng dụng và công cụ; build không biên dịch các bài test/importer.
- Thêm vercel.json, đóng ZIP ở gốc để upload GitHub dễ chọn đúng Root Directory.
- Giữ đầy đủ script import, workbook Frozen, tests và kiểm dữ liệu trong CI.
- Không thay database, không cần migration mới. Gameplay tiếp theo vẫn V0.2.0.


## V0.1.0 — Cross-Platform Foundation — 18/11/2026

- Khởi tạo Next.js/TypeScript, App Router, game/core, game/data và renderer adapter.
- Supabase SSR Auth, đăng ký/đăng nhập, xác nhận, recovery, đổi mật khẩu và đăng xuất.
- Tạo/mở/tìm/đổi tên/cấu hình/xóa thế giới; snapshot 20 dân từ catalog, seed và khí hậu.
- SQL atomic create, idempotency, owner checks, RLS, table write restrictions và revision conflicts.
- Import Canonical 38 sheet, 5.984 references và checksum Frozen; source workbook nguyên byte.
- UI PC/mobile, safe area, dialog, thứ tự Hủy/Lưu thống nhất, lỗi/loading/empty state.
- Asset manifest có byte size/checksum, HTTPS CDN base URL và cache phiên bản.
- README và hướng dẫn cấu hình Supabase/Vercel, roadmap23, test logic/SQL/HTTP.

Migration lần đầu: `202611180001_foundation.sql`, chạy một lần trên project mới trước khi dùng app. Không chạy lại trên dữ liệu đang có.

Chưa có bản đồ tương tác, camera, simulation, xây dựng, di chuyển hoặc offline gameplay. SVG dùng để minh họa. Không có secret thật; chưa push/deploy hay kết nối tài khoản cloud của chủ dự án.
