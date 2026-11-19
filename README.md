# World Evolution V0.11.0 — Health & Pollution

Boss có thể cập nhật GitHub và deploy thẳng Vercel, không cần cài npm hoặc chạy localhost.

## Cập nhật từ V0.10.0

1. Trong Supabase SQL Editor, chạy **202611190010_health_pollution.sql** một lần, sau 001–009. File TXT gửi riêng chứa đúng SQL này. Giữ database/repo/Environment Variables hiện tại, không chạy lại các migration cũ.
2. Giải nén ZIP, upload **toàn bộ nội dung** vào cùng cấp package.json trong repo hiện tại, ghi đè file trùng. Không xóa repo hay project Vercel. Nếu có sửa riêng, tích hợp trước khi ghi đè.
3. Vercel: Next.js, Root Directory `.`, Node 24.x, Install `npm ci`, Build `npm run build`, Output mặc định. Push branch đã nối để deploy.
4. Đăng nhập, mở thế giới cũ, kiểm tick/20 ID/nghề/lô/cargo. Bảng **Sức khỏe & môi trường** dưới bản đồ; lớp phủ ô nhiễm trong bản đồ. Lưu thủ công và reload để kiểm tiến trình.

## Nội dung phiên bản

- Sức khỏe, phơi nhiễm, ủ bệnh/triệu chứng/hồi phục, nghỉ bệnh và hiệu suất riêng từng cư dân; RNG riêng, clock cố định, không chữa tức thời khi reload.
- Đọc đủ 12 bệnh và 14 ô nhiễm Frozen; chỉ tạo nguy cơ khi có nguồn và điều kiện hỗ trợ. Lây hô hấp trong phạm vi tiếp xúc, không lây toàn bản đồ.
- Rác 0,25/người/ngày, hàng hỏng thành điểm rác thật; thu gom J082 có thời gian, pathfinding, sức mang, giữ chỗ và nơi nhận hữu hạn. B138 tập kết không tiêu hủy.
- Chăm sóc B136 cần công nghệ/công trình/nhân sự/vật tư thật; F085/F086 sản xuất theo công thức Frozen, đầu ra có hạn; thiếu vật tư không trừ một phần. F094 vẫn khóa E1.
- Chất lượng nước gắn nguồn và lô; đun sôi không loại hóa chất/kim loại, tách lô vận chuyển giữ provenance. Nước không đạt ngưỡng không cấp uống.
- Ô nhiễm nước/đất/không khí theo ô, nguồn thực tế, suy giảm/lan nền; lớp phủ màu có chú giải, culling và cache, chọn ô xem số đo.
- Schema10/we-sim-8, SQL010, đọc schema2–9; giữ tài khoản/thế giới/khí hậu/sinh thái/công trường/lô và cơ chế autosave/offline/history/lease.

**Điều kiện còn khóa:** thế giới mới vẫn chỉ có T001 như V0.10. Chưa có nghiên cứu/đào tạo bootstrap nên cơ sở y tế/vệ sinh và nghề cần mở khóa vẫn trả rõ điều kiện thiếu. Luồng có điều kiện được kiểm bằng fixture; không tự cấp công nghệ/nghề/vật tư. Công nghiệp/điện/y tế tiên tiến, bệnh E1–E8 chưa có nguồn thực tế và tử vong chưa bật. Định mức kỹ thuật ngoài Frozen, phạm vi đã làm và giới hạn ghi rõ ở [docs/HEALTH-POLLUTION.md](docs/HEALTH-POLLUTION.md).

## Cấu hình

| Biến Vercel | Giá trị |
| --- | --- |
| NEXT_PUBLIC_SUPABASE_URL | Project URL Supabase |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Publishable key hoặc legacy anon key |
| NEXT_PUBLIC_ASSET_BASE_URL | Để trống dùng Vercel CDN, hoặc HTTPS origin CDN riêng |

Không dùng service-role/secret key trong biến public. Database mới chạy **001 → 010** theo thứ tự. Auth Site URL là HTTPS domain; thêm `/auth/callback` và `/auth/confirm` vào Redirect URLs. Không expose schema private. Chi tiết giữ ở docs/CONFIGURATION.md và DEPLOY-VERCEL.md.

Đồ họa nằm trong public/assets/manifest và Vercel/CDN; Supabase chỉ lưu tài khoản/thế giới/tiến trình. Không tạo bucket đồ họa mới. Giữ pinned dependencies của V0.10: Next16.4.6, React19.3.1, TypeScript6.0.3, Pixi8.23.0, SupabaseJS2.119.0, Node24.x. Production build kiểm release bằng JavaScript rồi next build, không gọi script nhập Excel. Root proxy.ts và src/proxy.ts cùng alias @/lib/supabase/proxy.

## Kiểm tra và phát triển tùy chọn

Các lệnh bên dưới dành cho CI/developer, Boss không cần chạy trên máy:

```bash
npm ci
npm run data:check
npm run typecheck
npm run lint
npm test
npm run test:http
npm run build
```

Build/typecheck/lint/data/tests và kiểm ZIP sạch được ghi trong RELEASE-CHECKS.md. Chưa kiểm deploy vào tài khoản Boss, browser/mobile/GPU/60fps/quota thật.

## Mã nguồn

- src/game/health: mô hình/validation/command/overlay; data/generated/health.json: adapter Frozen.
- src/game/simulation: Worker, clock, RNG, save/lease/offline recovery.
- src/game/{map,planning,population,survival,workforce,ecology,construction,climate}: các module kế thừa.
- src/components/health: bảng sức khỏe, phân công/xác nhận và thông tin ô nhiễm.
- infra/supabase/migrations: SQL001–010; verify_health.sql: kiểm cấu hình chỉ đọc.
- data/source: workbook Frozen; scripts: importer/adapter/checksum; public/assets: tài nguyên đồ họa dùng chung.

Sau lưu schema10, dùng V0.11 hoặc hotfix tương thích để ghi tiếp. Không rollback SQL/xóa bảng để quay lại; có thể khôi phục lịch sử cũ qua app V0.11. Phiên bản tiếp theo: **V0.12.0 — Research & Discovery**.
