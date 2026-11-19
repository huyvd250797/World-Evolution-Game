# World Evolution V0.9.0 — Construction & Logistics

Boss cập nhật thẳng GitHub → Vercel, không cần cài npm/chạy localhost. Hướng dẫn đầy đủ: **DEPLOY-VERCEL.md**, **docs/CONFIGURATION.md**. ZIP chứa package.json ngay ở gốc.

## Cập nhật từ V0.8.0

1. Supabase SQL Editor: chạy **một lần** `infra/supabase/migrations/202611190008_construction_logistics.sql` sau 001–007, trước deploy. TXT V0.9 gửi riêng chứa đúng SQL 008. Không chạy lại migration cũ, không xóa/reset database.
2. Giải nén ZIP và upload toàn bộ nội dung vào repo/branch đang kết nối Vercel, ghi đè file trùng. Giữ repo/project/env đang dùng.
3. Vercel: Next.js, Root Directory chứa package.json, Node 24.x, Install `npm ci`, Build `npm run build`, Output mặc định. Push branch đã nối để tự deploy.
4. Mở world cũ kiểm tick/seed/20 ID/nghề/đào tạo/hệ sinh thái/lô. Bảng **Thi công & hậu cần** nằm dưới bản đồ. Chọn nền → xem BOM → tạo công trường; chọn dân/lô/nơi nhận → xác nhận vận chuyển. Bấm Chạy để cư dân thực hiện.

## Nội dung đã xây

- Công trường tham chiếu nền, yêu cầu đúng BOM Frozen, lối tiếp cận và nghề J008. Thi công chỉ tăng khi đủ vật tư, thợ thực sự có mặt; tiêu thụ một lần khi hoàn tất. Pause/resume/cancel/thu hồi giữ vật tư thực.
- Vận chuyển đi bộ tối đa 3 đơn vị/chuyến: giữ chỗ → đi lấy → tách lô → mang hàng → giao. Không teleport hoặc đổi tuổi/hạn lô. Chuyến blocked/cargo còn nguyên để xử lý.
- Bãi ngoài trời 60 đơn vị, kho B010 150, B011 250, B118 120 và buffer bếp B007 30. Chỉ kho hoàn thành, đúng hàng và đủ nhân sự mới có bảo quản tương ứng. Kho đầy hoặc mất đường được báo rõ.
- Nhà hoàn thành mới cấp giường theo Frozen; cơ sở hoàn thành mới tham gia điều kiện đào tạo/nghề/sinh tồn. Chế biến tại bếp dùng nguyên liệu đã vận chuyển tới bếp.
- Bảng PC/mobile có xác nhận Hủy trái/Xác nhận phải; renderer shared stamps phân biệt nền/khung thi công/hoàn thành và marker bãi, giữ chunk/culling/depth.
- Schema 8/we-sim-6, migration 008, đọc schema 2–7, giữ 20 ID/map/seed/RNG/nghề/đào tạo/lô/ecology. Worker/fixed tick/x1/x2/x4/pause/autosave/local recovery/history/lease kế thừa, không ghi DB từng bước chân.

**Giới hạn gameplay quan trọng:** thế giới khởi đầu chỉ có T001, chưa có thợ xây đã đào tạo, công nghệ đào tạo và tuyến cung cấp đủ nguyên liệu xây dựng. Vì vậy chưa thể tự chơi từ số 0 đến công trình hoàn thành. Bản này không tự cấp nghề, mentor, công nghệ hoặc vật tư để vượt Frozen. Luồng xây hoàn thành được kiểm với fixture đủ điều kiện; bãi và vận chuyển hàng đã thu dùng được ngay. Xem **docs/CONSTRUCTION-LOGISTICS.md** cho phụ thuộc và mọi thông số kỹ thuật ngoài Frozen. Chưa có phá dỡ, xe tải, đường tăng tốc hay artwork riêng từng công trình.

## Cấu hình

| Biến Vercel | Giá trị |
| --- | --- |
| NEXT_PUBLIC_SUPABASE_URL | Project URL Supabase hiện tại |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Publishable key; hoặc legacy anon key nếu project cũ |
| NEXT_PUBLIC_ASSET_BASE_URL | Trống để dùng asset/CDN Vercel; hoặc origin HTTPS CDN riêng |

Không đưa secret/service-role key vào biến public. Database mới chạy migrations 001 → 008 theo thứ tự; bản V0.8 đã chạy 001–007 chỉ chạy 008. Email Auth, Site URL và callback/confirm của đúng domain theo docs/CONFIGURATION.md. Không có Storage bucket mới; đồ họa nằm public/assets/CDN, Supabase lưu trạng thái game.

Stack giữ nguyên pinned Next.js 16.4.6, React 19.3.1, TypeScript 6.0.3, PixiJS 8.23.0, Supabase JS 2.119.0, Node 24.x. Build dùng `node verify-release.mjs && next build`; không gọi importer Excel. Hai proxy entry cùng dùng alias @/lib/supabase/proxy để tránh lỗi import cũ.

## Cho lập trình viên (tùy chọn)

Tại thư mục có package.json:

```bash
npm ci
npm run data:check
npm run typecheck
npm run lint
npm test
npm run test:http
npm run build
```

Chạy local nếu cần: copy `.env.example` thành `.env.local`, điền hai biến Supabase, chạy `npm run dev`, mở http://localhost:3000. Boss không cần thực hiện bước này khi dùng Vercel. Push GitHub/repo cũ và xử lý fetch-first theo docs/CONFIGURATION.md, không force push hoặc xóa repo.

`src/game/construction/`: model/commands/haul/thi công/validation/contexts; `src/components/construction/`: bảng điều khiển; `scripts/construction.ts`: adapter Frozen. Checks và giới hạn nghiệm thu trong RELEASE-CHECKS.md, docs/VERIFICATION.md. Chưa push/deploy vào tài khoản Boss.

Sau khi đã lưu schema 8, app V0.8 không đọc được save mới. Quay lại bằng hotfix V0.9 tương thích hoặc phục hồi bản lịch sử cũ qua V0.9; không rollback SQL/xóa bảng để bỏ construction. Sao lưu database trước nâng cấp.

Tiếp theo: **V0.10.0 — Seasons & Climate**, mùa theo vùng, tác động khí hậu/thời tiết và cảnh báo. Gửi ZIP mới nhất để nâng cấp tiếp.
