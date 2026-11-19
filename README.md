# World Evolution V0.8.0 — Living Ecosystem

Boss cập nhật trực tiếp GitHub → Vercel, không cần localhost/npm trên máy. Xem **DEPLOY-VERCEL.md** và **docs/CONFIGURATION.md**.

## Nâng từ V0.7.0

1. Supabase SQL Editor: chạy **một lần** `infra/supabase/migrations/202611190007_living_ecosystem.sql` sau 001–006, trước deploy. TXT V0.8 gửi riêng chứa đúng SQL 007. Không chạy lại migrations cũ, không reset database.
2. Upload toàn bộ nội dung ZIP sau giải nén vào gốc repo/branch đang nối Vercel, ghi đè file trùng. Giữ Environment Variables. Không xóa repo/project.
3. Vercel: Next.js, Root Directory chứa package.json, Node 24.x, Install npm ci, Build npm run build, Output mặc định.
4. Mở world cũ kiểm seed/tick/20 ID/nghề/quy hoạch/cargo/lô/hạn. Chọn **Hệ sinh thái** trên bản đồ; thu gọn bảng để quan sát các đối tượng chuyển động. Bấm Chạy để mô phỏng.

## Nội dung phiên bản

- Catalog Frozen đủ 52 loài/nguồn, 10 sinh cảnh và 14 quan hệ săn mồi có trọng số. Không chỉnh workbook/canonical.
- Lớp sinh thái riêng từ seed, giữ nguyên địa hình we-map-1. Theo dõi quả, củ, hạt, nấm, thảo dược theo từng nguồn; trữ lượng hữu hạn, hạn phục hồi theo loài và đúng mùa.
- Quần thể động vật có ID thật, vị trí/cạnh di chuyển, sinh sản có điều kiện, giới hạn vùng và suy giảm khi thiếu thức ăn. Thú săn mồi chỉ tiêu thụ các loài được liên kết, không tự coi mọi động vật là con mồi.
- Nguồn bản đồ cũ giữ thông tin đã biết; nguồn mới/động vật chưa khảo sát có dấu ?. Đưa cư dân tới gần, khảo sát và xác nhận trước khi giao thu hoạch/săn.
- Thu hoạch thật: giữ chỗ nguồn → cư dân đi/làm → trừ trữ lượng → tạo lô đang mang → mang về bãi. Reload không làm đầy nguồn, nhân con mồi, đổi RNG hay làm mới TTL.
- Săn thật dùng ID con mồi đang tồn tại; hoàn tất mới giảm số con và tạo đúng sản phẩm. **Nghề/công cụ/trại hoạt động vẫn bắt buộc**; thế giới khởi đầu chưa tự mở săn. Săn cơ bản hỗ trợ thỏ/sóc/chim rừng, các loài lớn/nguy hiểm chưa mở săn nhóm.
- Shared stamps theo loài, chunk/viewport culling, giảm chi tiết khi zoom xa, sắp chiều sâu cùng cư dân/nền công trình. Đồ họa không lưu trong Supabase.
- Schema 7/we-sim-5, SQL 007; giữ toàn bộ nền V0.7, nâng đọc 2–6, autosave/backup/history/lease. Mô phỏng trong Worker, không gửi Supabase từng tick.

**Phạm vi dữ liệu:** đọc đủ catalog không có nghĩa mọi loài đã spawn. Runtime có 9 loại nguồn thực vật và 15 loài động vật hoang dã theo các ô/sinh cảnh mà we-map-1 biểu diễn được; mỗi seed có tập con phù hợp. Không tự sinh vật nuôi, sa mạc/đầm lầy chưa có địa hình tương ứng, bệnh động vật hoặc cơ chế thời tiết đầy đủ. Hệ số ngoài Frozen ghi rõ trong **docs/LIVING-ECOSYSTEM.md**.

## Cấu hình và kiểm tra

Giữ các biến `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; `NEXT_PUBLIC_ASSET_BASE_URL` tùy chọn CDN. Không dùng secret/service-role key ở client. Project mới chạy migrations **001 → 002 → 003 → 004 → 005 → 006 → 007**, Email Auth/redirect theo docs/CONFIGURATION.md.

Stack giữ nguyên: Next.js 16.4.6, React 19.3.1, TypeScript 6.0.3, PixiJS 8.23.0, Supabase JS 2.119.0, Node 24.x. Không nâng dependencies ngoài phạm vi.

`src/game/ecology/`: seed/stock/animals/food web/commands/render stamps. `src/components/ecology/`: inspector và catalog PC/mobile. `scripts/ecology.ts`: adapter Frozen. `verify-release.mjs`: kiểm checksum khi build, không chạy importer Excel trên Vercel. Giữ proxy alias tránh lỗi import cũ.

Dành cho lập trình viên: tại thư mục package.json chạy `npm ci`, `npm run check`, `npm run test:http`; `npm run dev` và `npm run ecology:qa` là tùy chọn. Kết quả/giới hạn trong RELEASE-CHECKS.md và docs/VERIFICATION.md. Định mức và dependency nghề vẫn giữ như V0.7, kể cả J092 chưa khớp tên công nghệ.

Chưa push/deploy vào tài khoản thật của Boss. Tiếp theo **V0.9.0 — Construction & Logistics**: thi công bằng vật tư, người xây và tuyến vận chuyển thực tế. Gửi ZIP mới nhất để nâng cấp tiếp.
