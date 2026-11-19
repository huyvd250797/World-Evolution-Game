# World Evolution V0.6.0 — Survival & Food

Boss có thể cập nhật trực tiếp GitHub → Vercel; không cần cài npm hoặc chạy localhost trên máy. Xem **DEPLOY-VERCEL.md** và **docs/CONFIGURATION.md**.

## Cập nhật từ V0.5.0

1. Trong Supabase SQL Editor, chạy **một lần** `infra/supabase/migrations/202611190005_survival_food.sql` trước deploy. TXT gửi riêng chứa đúng SQL 005. Giữ nguyên 001–004 và dữ liệu cũ.
2. Upload toàn bộ nội dung ZIP vào gốc repo đang liên kết Vercel; ghi đè file trùng, không xóa repo/database. Giữ biến môi trường hiện tại.
3. Vercel: Next.js, Root Directory chứa package.json, Node 24.x, Install `npm ci`, Build `npm run build`, Output mặc định.
4. Sau deploy, mở thế giới → **Sinh tồn & thức ăn** → chọn ô Quả rừng → chọn cư dân → Giao việc → Xác nhận → Chạy. Thu gọn bảng để chọn ô nếu cần. Cư dân đi đến nguồn, làm việc, mang về bãi, sau đó mới cấp phát.

## Nội dung phát hành

- Nhu cầu cơ sở mỗi ngày: 1 suất ăn và 2 nước sử dụng được/người; 20 dân cần 20 ăn/40 nước. Sổ cấp phát riêng mỗi ID/ngày; phân biệt nhu cầu, đã cấp và dự trữ.
- Hái quả ở nguồn đã sinh trên bản đồ, trữ lượng hữu hạn, tái sinh theo SP001; tải bộ 3 đơn vị theo MOV001. Không sinh tài nguyên khi bấm.
- Công việc đi/làm/mang về/bị chặn; nghỉ/tiếp tục theo engine; không đổi điểm đến thủ công khi đang có việc sinh tồn. Giữ nguyên 20 ID, vị trí, tiến độ cạnh và camera.
- Lô tách riêng tài nguyên/số lượng/tick tạo/tuổi/hạn/nơi chứa/hỏng. Bãi tập kết ngoài trời có tọa độ và lối đi, không phải kho bảo quản. Hàng mang không tính vào tồn có thể cấp phát.
- TTL theo từng tài nguyên Frozen; FEFO cho ăn/uống, không ăn thịt sống hoặc uống nước sông. Quả/củ có công thức trực tiếp F001/F002; không coi toàn bộ nguyên liệu là suất ăn.
- Nền tảng săn, lấy nước, chế biến và bảo quản được triển khai với kiểm tra điều kiện. **Thế giới khởi đầu chưa có trại/bếp/kho hoạt động, công cụ hoặc công nghệ mới. Những hoạt động cần các điều kiện này vẫn bị khóa trong gameplay hiện tại.** Adapter vận hành dành cho các bản đào tạo, thi công và nghiên cứu tiếp theo; không có nút tự hoàn thành nền nhà hay cấp miễn phí công nghệ.
- Schema 5/we-sim-3, nâng bản lưu 2/3/4 khi đọc, không ghi lại lịch sử cũ. Lưu jobs, cargo, tuổi lô, sổ ngày; tiếp tục dùng autosave/full snapshot, local backup, checksum, lease, lịch sử và phục hồi. Không chạy mô phỏng trên Supabase mỗi tick.

Chi tiết điều kiện và các chính sách kỹ thuật nằm ở **docs/SURVIVAL-AND-FOOD.md**. Chưa có sức khỏe/tử vong vì thiếu ăn, thời tiết nóng/lạnh, quần thể động vật đầy đủ hoặc xây dựng hoàn thành; các hệ thống này theo roadmap.

## Cấu hình

Giữ `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` của project hiện tại. Không dùng secret/service-role key. `NEXT_PUBLIC_ASSET_BASE_URL` để trống khi ảnh phục vụ từ Vercel; hoặc dùng HTTPS CDN origin riêng. Đồ họa không lưu trong Supabase.

Project mới: chạy migrations **001 → 002 → 003 → 004 → 005**, cấu hình Email Auth và redirect URL theo docs/CONFIGURATION.md. Không chạy lại migrations đã áp dụng. Không expose schema private.

## Kiến trúc và kiểm tra

`src/game/survival/model.ts`: logic thu gom/lô/TTL/FEFO và capability adapter. `simulation.worker.ts`: chạy mô phỏng; `session.ts`: gom lưu 30 giây và giữ pending request để retry idempotent. `src/components/survival/`: bảng giao việc/lô hàng PC/mobile. `scripts/survival.ts`: xuất adapter từ catalog Frozen, kiểm tra checksum khi phát hành. Production build không cần chạy importer Excel.

Dành cho lập trình viên: `npm ci`, `npm run check`, `npm run test:http`. Kết quả và giới hạn kiểm chứng trong **RELEASE-CHECKS.md**, **docs/VERIFICATION.md**. Giữ nguyên Master Data V1.2 Frozen, generator we-map-1 và assets cũ.

Tiếp theo: **V0.7.0 — Workforce & Training**. Source chưa được push/deploy vào tài khoản thật trong lần bàn giao ZIP này.
