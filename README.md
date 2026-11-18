# World Evolution V0.5.0 — Population Housing & Pathfinding

20 cư dân xuất hiện trên bản đồ, giữ ID đã lưu, có trạng thái/vị trí, đi theo lệnh qua đường tìm được trong Worker. Kế thừa tài khoản, thế giới/seed/cấu hình, quy hoạch V0.4 và cloud save/lease/history/local recovery.

## Nâng cấp thẳng Vercel từ V0.4.0

Boss không cần localhost hoặc cài npm trên máy, không xóa repo/project/database.

1. Trong **Supabase → SQL Editor**, chạy một lần `infra/supabase/migrations/202611190004_population_navigation.sql`. File TXT gửi riêng có đúng SQL 004 để mở/copy. **Không chạy lại 001/002/003.**
2. Giải nén ZIP, upload **toàn bộ nội dung** vào đúng repo/branch Vercel đang dùng, ghi đè file trùng. Source nằm ở gốc ZIP, cùng cấp package.json, src, data, public, infra và verify-release.mjs.
3. Giữ URL/key Supabase và asset base URL. Vercel: Next.js, Root Directory chứa package.json, Node **24.x**, Install `npm ci`, Build `npm run build`, Output mặc định. Vercel tự chạy các lệnh.
4. Deploy commit mới; nếu cần xử lý cache cũ, redeploy không dùng Build Cache.
5. Mở world cũ, chờ engine/map tải: giữ tick/RNG/seed/map/quy hoạch, hiện đúng 20 IDs. Game tạm dừng. Chọn tab **Dân cư & chỗ ở**, mở Dân cư/chọn một người, Chọn điểm đến → chạm ô → Xác nhận → Chạy. Pause/Lưu ngay, chờ Đã lưu rồi reload kiểm vị trí và đường đi giữ nguyên.

Project mới hoàn toàn chạy **001 → 002 → 003 → 004** theo tên đầy đủ trong infra/supabase/migrations. 004 không rewrite head/history cũ. Legacy schema 2/3 được nâng đọc thành schema 4/we-sim-2, chỉ tính vị trí spawn nếu save chưa có; schema 4 mở lại giữ nguyên vị trí/progress/path đã lưu.

## Đã xây dựng

- Lấy đúng 20 IDs từ world.initial_state.people, không phát sinh ID mới, không nhân đôi khi mở/lưu/đổi thiết bị.
- Sprite nhân vật dùng stamp chung, phân lớp isometric, nội suy bước đi và culling vùng nhìn; ground không redraw mỗi bước chân.
- Chọn từ danh sách/click nhân vật, đưa camera tới gần; xem ID, tọa độ, trạng thái, homeId, destination và số ô còn lại.
- Tìm đường 4 cạnh trong Worker bằng reverse BFS, cache dùng lại cho nhóm/cùng đích. Tránh nước, núi, dốc và footprint; không có tuyến hoặc >512 ô thì báo blocked, không teleport.
- CFG059 = 12 ô/ngày, 150 tick/cạnh: x1 mất 15 giây/cạnh, x2 7,5 giây, x4 3,75 giây. Pause toàn world hoặc Nghỉ riêng cư dân không tiến vị trí.
- Chọn đích có xác nhận, giao một người hoặc cả nhóm 20; giữ tiến độ giữa cạnh khi đổi đích/nghỉ/lưu. Quy hoạch đổi sẽ kiểm route; không cho đặt nền lên người hoặc cạnh người đang đi.
- Nhà ở theo 8 dòng Canonical: tách giường thực tế/dự kiến, dân chưa có nhà và population limit. Kiểm tra đường tới ô lối vào bằng lệnh di chuyển thật.
- Lưu/restore vị trí, route/progress/status, giữ lease fencing/revision/SHA-256/history/bản tạm. Không gửi vị trí mỗi frame/tick lên Supabase.

**Giới hạn nhà ở:** V0.4 chỉ tạo nền planned, chưa có nhà hoàn thành. Vì vậy giường thực tế vẫn **0**, homeId vẫn **null**; 4 nền Lều ở có **20 chỗ dự kiến**, chưa phải chỗ ngủ đã sử dụng được. Mô hình phân chỗ đã kiểm capacity/reachability cho nhà hoàn thành, nhưng nút phân chỗ trong game hiện khóa rõ lý do; thi công đầy đủ ở V0.9. Không tặng nhà hoặc sửa trạng thái planned để cấp giường giả.

Từ ngày 10 có cảnh báo thiếu nhà theo CFG053. Chưa áp đói/khát/bệnh/sinh tử/nghề nghiệp hoặc xóa dân vì giảm giới hạn. Giới hạn chỉnh được vẫn theo Frozen, 20–100.000; V0.5 chỉ mô phỏng 20 người, không phải benchmark 100.000 dân. Đường quy hoạch chưa tạo tốc độ logistics/cầu. Cư dân có thể đứng chung ô, chưa có crowd collision.

Ẩn trang/khóa màn hình/offline: pause và cố lưu/bản tạm, không chạy nền liên tục hoặc bù thời gian offline. Tắt đột ngột có thể mất phần sau bản tạm cuối; chờ Đã lưu trước khi rời. Camera thuộc phiên, không đồng bộ cloud.

## Cấu hình

Xem [DEPLOY-VERCEL.md](DEPLOY-VERCEL.md), [docs/CONFIGURATION.md](docs/CONFIGURATION.md), [docs/POPULATION-AND-PATHFINDING.md](docs/POPULATION-AND-PATHFINDING.md). Kiến trúc nền/save/plan giữ trong docs.

| Biến môi trường Vercel | Giá trị |
| --- | --- |
| NEXT_PUBLIC_SUPABASE_URL | Project URL hiện có |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Publishable hoặc legacy anon key cùng project |
| NEXT_PUBLIC_ASSET_BASE_URL | Để trống dùng Vercel CDN; optional HTTPS origin CDN riêng |

Không cần service-role key, DB password, bucket mới, server tick hoặc cron. Không expose schema private. Cấu hình Email Auth, Site URL và callback/confirm đúng domain HTTPS; thay public env phải redeploy. App cần SSR/Server Actions/API, không static export. ZIP không có secret thật.

## Local/CI tùy chọn

Node 24.x (hỗ trợ 22–24), npm ≥10. Tại thư mục chứa package.json:

```bash
npm ci
cp .env.example .env.local
# Điền URL/key public đúng project, không commit .env.local
npm run dev
```

Mở http://localhost:3000. Boss deploy trực tiếp Vercel có thể bỏ qua local.

```bash
npm run typecheck
npm run lint
npm test
npm run data:check
npm run test:http
npm run build
npm start
```

`population:qa` tạo composite Canvas thật, không phải browser screenshot. `test:ui` cần môi trường có Chromium đầy đủ. Kết quả và giới hạn thật nằm ở RELEASE-CHECKS.md và docs/VERIFICATION.md; fixtures không thay Supabase/GPU/Safari/Android thật. Build vẫn dùng Node verifier + catalog xuất sẵn, không gọi importer Excel.

## Source và dữ liệu

Giữ stack V0.4: Next.js 16.4.6, React 19.3.1, TypeScript 6.0.3, PixiJS 8.23.0, Supabase JS 2.119.0/SSR 0.12.7. Thêm src/game/population (schema/navigation/housing/stamps), src/components/population (giao diện), scripts/population.ts (adapter Frozen) và migration 004. Giữ map/camera/render nền, toàn bộ asset, workbook/catalog/summary và migration 001–003 nguyên byte.

State mới schema 4/we-sim-2; RNG clock tương thích we-sim-1, map vẫn we-map-1, planning-v1 không đổi. Không sửa workbook/frozen.json hoặc footprint dưới cùng version cho save đã phát hành. data:check kiểm Frozen/SQL/assets/planning/population adapter. Payload cap 1MiB, route mỗi cư dân tối đa 512 cạnh, cache target tối đa 8/navigation context. Theo dõi byte payload trong UI và quota thật; không coi số byte ứng dụng là hóa đơn Supabase.

## Rollback và bản kế tiếp

Sau khi lưu schema 4, V0.4 không đọc được save mới. Giữ DB/backup và dùng V0.5 hoặc hotfix tương thích; không drop tables/reset 001 để quay lại. Chỉ restore lịch sử cũ bằng chức năng có xác nhận, không tự merge JSON bản tạm khác revision. Backup toàn project khi có dữ liệu quan trọng; lịch sử ngắn không thay thế backup.

Bàn giao `World-Evolution-V0.5.0-Population-Housing-and-Pathfinding.zip` + `World-Evolution-V0.5.0-Migrations.txt` (chỉ SQL 004). Chưa push GitHub hoặc deploy vào tài khoản thật của Boss trong lần bàn giao source. Tiếp theo **V0.6.0 — Survival & Food**: hái/săn/nước, phần ăn, kho và hư hỏng theo lô. Gửi ZIP mới nhất để nâng cấp tiếp.
