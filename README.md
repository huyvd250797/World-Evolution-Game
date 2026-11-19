# World Evolution V0.7.0 — Workforce & Training

Boss cập nhật trực tiếp GitHub → Vercel; không cần chạy localhost/npm trên máy. Hướng dẫn từng bước: **DEPLOY-VERCEL.md**, **docs/CONFIGURATION.md**.

## Nâng từ V0.6.0

1. Trong Supabase SQL Editor chạy **một lần** `infra/supabase/migrations/202611190006_workforce_training.sql` sau 001–005 và trước deploy. TXT gửi riêng chứa đúng SQL 006. Không chạy lại migration cũ, không reset database.
2. Giải nén ZIP rồi upload toàn bộ nội dung vào gốc repo đang liên kết Vercel, ghi đè file trùng. Giữ Environment Variables hiện tại. Không xóa repo/project.
3. Vercel: Framework Next.js, Root Directory chứa package.json, Node 24.x, Install `npm ci`, Build `npm run build`, Output mặc định.
4. Mở world cũ, kiểm đúng seed/tick/20 ID/quy hoạch/hàng đang mang/lô/hạn. Bảng **Nhân sự & đào tạo** nằm ngay dưới bản đồ; mở Lao động / Danh mục nghề / Định biên công trình.

## Nội dung V0.7.0

- Danh mục đủ 96 nghề Frozen, thời đại/công nghệ/ngày học/hiệu suất tập sự/nơi làm/công dụng; tìm kiếm và phân trang.
- Hồ sơ riêng đúng 20 ID; nghề và chứng nhận tách riêng, khóa học/progress/mentor, nơi làm, công việc/điểm đến, bộ lọc trạng thái và chọn nhiều người.
- Đào tạo, đổi nghề, phân cơ sở, rút phân công, hủy hoặc tiếp tục khóa có xác nhận. Giao dịch nhóm thất bại toàn nhóm nếu có người không đạt điều kiện.
- Engine kiểm cơ sở hoàn thành, công nghệ, người hướng dẫn có mặt và hai chỗ B123; chỉ thời gian thực học mới tăng tiến độ. Học lại nghề cũ vẫn đủ N ngày; không tốt nghiệp khi bấm hoặc reload.
- Tập sự áp hệ số đúng nghề bằng credit 1/100 được lưu, chỉ trong bước sản xuất thực tế; giữ công cụ/nguyên liệu/cơ sở/stock của V0.6. Hái tự do không tự cấp chứng nhận nghề.
- Schema 6/we-sim-4, SQL 006; nâng đọc 2–5, giữ byte save/history cũ, autosave/local recovery/history/lease. Full snapshot khi đổi workforce, không request Supabase từng tick.

**Phạm vi hiện tại:** bảng hồ sơ/catalog/định biên dùng ngay. Bắt đầu học và phân cơ sở vẫn bị khóa trong thế giới khởi đầu, vì mới có T001 và các nền planned, chưa có công trình hoàn thành hoặc hướng dẫn viên. Logic đủ điều kiện được kiểm bằng fixture; không cấp nghề/công nghệ/cơ sở miễn phí. Thi công thuộc V0.9, nghiên cứu V0.12. Xem **docs/WORKFORCE-AND-TRAINING.md** để biết luồng, dependencies và chính sách chi tiết.

**Dữ liệu cần đối chiếu:** J092 có tên công nghệ không khớp CONG NGHE. Bản này giữ nguyên Frozen, hiển thị lý do khóa thay vì tự ánh xạ sang một công nghệ khác.

## Cấu hình và kiến trúc

Stack giữ nguyên từ ZIP V0.6: Next.js 16.4.6, React 19.3.1, TypeScript 6.0.3, PixiJS 8.23.0, Supabase JS 2.119.0. Node 24.x. Không nâng dependencies ngoài phạm vi.

Giữ `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; `NEXT_PUBLIC_ASSET_BASE_URL` tùy chọn CDN. Không dùng khóa đặc quyền trong public env. Đồ họa phục vụ từ Vercel/CDN, không đưa vào Supabase. Project mới chạy **001 → 002 → 003 → 004 → 005 → 006**, cấu hình Email Auth/redirect theo docs/CONFIGURATION.md.

`src/game/workforce/model.ts`: nghề/đào tạo/phân công/định biên/hiệu suất. `simulation.worker.ts`: điều phối tick/lệnh. `src/components/workforce/`: bảng giao diện PC/mobile. `scripts/workforce.ts`: xuất adapter từ Frozen, `verify-release.mjs` kiểm checksum lúc production build. Proxy entries và build không phụ thuộc chạy importer Excel trên Vercel.

Dành cho lập trình viên: tại thư mục package.json chạy `npm ci`, `npm run check`, `npm run test:http`; `npm run dev` là tùy chọn, không cần cho Boss khi dùng Vercel. `.env.example` không chứa secret. README cấu hình đầy đủ/GitHub/error/recovery: docs/CONFIGURATION.md.

Kiểm chứng và giới hạn: RELEASE-CHECKS.md, docs/VERIFICATION.md. Chưa push/deploy vào tài khoản thật của Boss. Bản tiếp theo **V0.8.0 — Living Ecosystem**: nguồn thực vật, động vật/quần thể, tái sinh, săn mồi và phân bố theo sinh cảnh. Gửi ZIP mới nhất để nâng cấp tiếp.
