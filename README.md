# World Evolution V0.4.0 — Construction & City Planning

Quy hoạch khu định cư trên bản đồ isometric: danh mục 166 công trình theo Frozen, ghost/vùng chiếm đất, xoay, kiểm vị trí, đặt nền, tuyến đường dự kiến, chọn/hủy và lưu tiến trình. Kế thừa tài khoản, world/seed/cấu hình/20 dân, camera và Simulation & Save Engine V0.3.0.

## Cập nhật thẳng Vercel từ V0.3.0

Boss không cần localhost hoặc cài npm trên máy. Không xóa repo/project/database.

1. **Supabase → SQL Editor:** chạy một lần `infra/supabase/migrations/202611180003_city_planning.sql`. File TXT gửi riêng chứa đúng SQL 003 để mở/copy nhanh. **Không chạy lại 001/002.**
2. Giải nén ZIP mới, upload **toàn bộ nội dung** vào đúng repo/branch Vercel hiện tại, ghi đè file trùng. Source ở gốc ZIP, cùng cấp `package.json`, `src`, `data`, `public`, `infra`, `verify-release.mjs`.
3. Giữ URL/key Supabase và asset base URL. Vercel: Next.js, Root Directory chứa package.json, Node **24.x**, Install `npm ci`, Build `npm run build`, Output mặc định. Vercel tự chạy các lệnh.
4. Deploy commit mới; khi xử lý cache cũ có thể redeploy không dùng Build Cache.
5. Mở world cũ: clock/RNG/seed/map/20 dân giữ nguyên, quy hoạch ban đầu rỗng. Xây dựng → Bãi quan sát/Lều ở → chọn ô hợp lệ → Xoay → Xác nhận → Lưu ngay/Đã lưu → reload kiểm nền còn đúng vị trí.

Project mới hoàn toàn chạy **001 → 002 → 003** theo tên đầy đủ trong infra/supabase/migrations. Migration 003 giữ head/history cũ nguyên byte, không reset thế giới; schema 2 được đọc nâng thành schema 3 khi dùng code mới. Lưu quy hoạch mới có full snapshot, giữ lease/revision/checksum/history/local recovery.

## Chức năng và phạm vi

- Danh mục tìm/lọc E0–E8, tên/công dụng/công nghệ/vật liệu ID + số lượng từ Frozen, hiện lý do chưa mở. Chỉ T001 đã mở như game hiện có.
- Ghost xanh/đỏ và footprint, kiểm nước/núi/độ dốc/bờ sông/vùng chiếm đất. PC R xoay, Enter đặt, Escape hủy; mobile chạm ô rồi dùng Xoay/Hủy/Xác nhận. Kéo/pinch không đặt nhầm.
- Nền có UUID/loại/tọa độ/hướng/createdTick/trạng thái planned. Chọn để xem và hủy có xác nhận.
- Tuyến dự kiến theo ô, hai điểm đầu/cuối, đổi hướng gấp khúc, không xuyên công trình/nước/núi. Tuyến giao nhau được. Đây là hành lang quy hoạch, chưa tạo Đường mòn vận hành hoặc vượt khóa công nghệ B139.
- Full/delta save, history/recovery, mất mạng giữ bản tạm, một writer bằng lease/epoch kế thừa. Quy hoạch cần quyền điều khiển và không có bản tạm đang chờ đối chiếu.
- Stamp nền/đường dùng chung, phân lớp isometric, chunk index/culling và cleanup, không lưu texture trong Supabase. Bản đồ/atlas/generator giữ nguyên, camera không reset khi clock cập nhật.

**Đây là đặt nền/quy hoạch:** chưa thi công, chưa trừ vật liệu, chưa cấp nhà ở/kho/công suất hoặc cho dân đi lại. Kích thước footprint và quy tắc vị trí nền tảng là cấu hình kỹ thuật `planning-v1` riêng vì Frozen chưa định nghĩa đầy đủ; không sửa workbook. Chi tiết và giới hạn ở [docs/CITY-PLANNING.md](docs/CITY-PLANNING.md).

Clock vẫn x1=180 giây/ngày, x2=90, x4=45; 30 ngày/mùa, 120 ngày/năm. Ẩn/đóng/offline tạm dừng và cố lưu, không bù thời gian offline. Chờ Đã lưu trước khi rời; OS kill có thể làm mất phần sau bản tạm cuối. Camera thuộc phiên, không đồng bộ cloud.

## Cấu hình

Hướng dẫn Auth/email/callback/GitHub/Vercel/CDN đầy đủ: [docs/CONFIGURATION.md](docs/CONFIGURATION.md). Quick deploy: [DEPLOY-VERCEL.md](DEPLOY-VERCEL.md). Save/lease nền tảng: [docs/SIMULATION-AND-SAVE.md](docs/SIMULATION-AND-SAVE.md).

| Biến Vercel | Giá trị |
| --- | --- |
| NEXT_PUBLIC_SUPABASE_URL | Project URL hiện có |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Publishable hoặc legacy anon key cùng project |
| NEXT_PUBLIC_ASSET_BASE_URL | Để trống dùng Vercel CDN; optional HTTPS origin CDN riêng |

Không cần bucket, service-role key, DB password, cron hay server tick riêng. Không expose schema private. Thay public env cần redeploy. Auth Site URL và callback/confirm phải đúng domain HTTPS. Không dùng static export; app cần SSR/Server Actions/Route Handler. ZIP không có secret thật.

## Local/CI tùy chọn

Node 24.x (hỗ trợ 22–24), npm ≥10. Tại thư mục chứa package.json:

```bash
npm ci
cp .env.example .env.local
# Điền URL/key public đúng project, không commit .env.local
npm run dev
```

Mở http://localhost:3000. Boss deploy thẳng Vercel bỏ qua local. Build pipeline giữ Node verifier và catalog xuất sẵn; không gọi importer Excel ở production.

```bash
npm run typecheck
npm run lint
npm test
npm run data:check
npm run test:http
npm run build
npm start
```

`planning:qa` tạo ảnh Canvas composite; `test:ui` dùng Playwright khi môi trường có Chromium đầy đủ. Kết quả/phạm vi trong RELEASE-CHECKS.md và docs/VERIFICATION.md; fixtures không thay Supabase/GPU/mobile thật.

## Source, bảo trì và nâng cấp

Giữ stack/lockfile V0.3: Next.js 16.4.6, React 19.3.1, TypeScript 6.0.3, PixiJS 8.23.0, Supabase JS 2.119.0/SSR 0.12.7.

- src/game/planning, src/components/planning: catalog/model/validation/stamp overlay/editor.
- src/game/simulation, src/components/simulation, src/app/api/simulation: schema 3, Worker/lưu/lease và validation.
- src/game/map, src/game/renderer, public/assets: seed/camera/render/atlas kế thừa.
- data/source và data/generated: Frozen + catalog/summary/asset manifest + planning adapter.
- infra/supabase: 001/002 nguyên byte, 003 mới, queries kiểm cấu hình.
- scripts/planning.ts xuất adapter từ Frozen cùng technical policy; data:check kiểm tái lập. Không chạy lại importer để deploy, không sửa frozen.json để bỏ kiểm tra.

Không thay we-map-1/we-sim-1 hoặc planning-v1 dưới cùng version cho save đã phát hành. Giới hạn hiện tại 256 nền, 128 tuyến/8.192 ô tuyến, payload tối đa 256KiB. UI số byte là payload ứng dụng, không phải số liệu billing Supabase. Theo dõi quota thật và backup project khi có dữ liệu quan trọng.

Sau khi lưu planning schema 3, app V0.3 không đọc được save mới. Nếu cần rollback, giữ database/backup và dùng code V0.4 tương thích; không drop schema/tables hoặc reset 001. Xem CITY-PLANNING.md trước thao tác dữ liệu.

Bàn giao `World-Evolution-V0.4.0-Construction-and-City-Planning.zip` và `World-Evolution-V0.4.0-Migrations.txt` (chỉ SQL 003). GitHub/Supabase/Vercel thật chưa kết nối trong lần bàn giao source. Tiếp theo **V0.5.0 — Population Housing & Pathfinding**: nhà ở, nhu cầu cơ bản, 20 agents và đường đi. Gửi source ZIP mới nhất để nâng cấp tiếp.
