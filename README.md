# World Evolution V0.3.0 — Simulation & Save Engine

Game web PC/mobile: tài khoản, quản lý thế giới và bản đồ isometric từ seed; bản này thêm đồng hồ mô phỏng trong Web Worker, x1/x2/x4/tạm dừng, lưu tiến trình và khôi phục giữa thiết bị.

## Cập nhật trực tiếp trên Vercel từ V0.2.0

Boss không cần cài Node/npm hoặc chạy localhost. Không xóa repo, project Vercel, database hoặc thế giới.

1. Trong **Supabase → SQL Editor**, chạy một lần `infra/supabase/migrations/202611180002_simulation_save.sql`. File TXT migration gửi riêng có đúng SQL này để mở/copy trên điện thoại. **Không chạy lại 001.**
2. Giải nén ZIP mới và upload toàn bộ nội dung vào **đúng repo/branch Vercel hiện tại**, ghi đè file trùng. Source nằm ngay gốc ZIP, cùng cấp `package.json`, `verify-release.mjs`, `src`, `data`, `public`, `infra`.
3. Giữ nguyên các biến Supabase và asset URL. Vercel: Framework **Next.js**, Root Directory chứa `package.json`, Node **24.x**, Install **npm ci**, Build **npm run build**, Output mặc định. Các lệnh được Vercel chạy tự động.
4. Deploy commit mới. Nếu đang xử lý cache từ bản trước, redeploy không dùng Build Cache.
5. Mở thế giới cũ: giữ seed/khí hậu/cấu hình và 20 dân, bản đồ giống trước; thời gian bắt đầu ngày 1, tạm dừng. Bấm **Chạy**, chọn tốc độ, **Tạm dừng/Lưu ngay**, reload để kiểm tiến trình.

Migration 002 mở rộng ràng buộc ngày và thêm bảng private/RPC; không sửa `initial_state` của thế giới cũ. Master Data V1.2, SQL 001 và generator `we-map-1` giữ nguyên. Logic proxy tương thích ở gốc/src và build Node verifier từ V0.1.2 tiếp tục được giữ.

## Chức năng V0.3.0

| Phần | Hành vi |
| --- | --- |
| Clock | Fixed step 100ms, 1.800 tick/ngày, x1 = 180 giây thực/ngày, x2 = 90 giây, x4 = 45 giây |
| Lịch | 30 ngày/mùa, 120 ngày/năm, S1–S4 theo Frozen; B02 hiện thêm nhãn mưa/khô theo vùng |
| Determinism | `we-sim-1` lưu tick, phần tick, RNG state/cursor, command sequence và active time; không reroll khi mở lại |
| Cloud save | Full head + lịch sử full/delta; tự lưu mỗi 30 giây khi thay đổi, Lưu ngay tạo full; full anchor bắt buộc mỗi 8 revision |
| Trạng thái | Đã lưu / Đang lưu / Chưa đồng bộ / Lưu thất bại và thời điểm xác nhận gần nhất |
| Khôi phục | Kiểm schema/version/identity/SHA-256/chuỗi delta; lịch sử khoảng 25–32 mốc, tìm mốc hợp lệ gần nhất, xác nhận khôi phục thành revision mới |
| Single writer | Lease 75 giây, heartbeat 20 giây, epoch fencing; tiếp quản cần xác nhận; máy mất quyền không thể ghi |
| Bản tạm | Trình duyệt giữ tiến trình theo account/world/tab, tối đa 8 bản/7 ngày. Chỉ khôi phục vào cloud cùng revision; khác revision cho tải JSON và chọn giữ cloud |
| Tiết kiệm dữ liệu | Không ghi mỗi tick, prune lịch sử trong transaction, không cần cron; thống kê payload giữ/ghi/truyền trong phiên |

V0.3.0 vận hành **đồng hồ và nền lưu tiến trình**. 20 dân chưa di chuyển/ăn uống, chưa khai thác/sản xuất/xây dựng, không tự tiến hóa thời đại. Nguồn tự nhiên trên bản đồ chưa biến thành kho tài nguyên. RNG cursor chạy theo tick làm nền cho hệ thống sau, chưa sinh sự kiện khí hậu/nghiên cứu. Chu kỳ mùa có ở đồng hồ; hiệu ứng và tác động thời tiết đầy đủ ở bản sau.

Ẩn trang/khóa màn hình/mất mạng: game tạm dừng và cố lưu, giữ bản tạm gần nhất; **không chạy nền liên tục hoặc bù thời gian offline**. Trình duyệt có thể ngắt ngay nên lần cuối chưa chắc lên cloud. Bản tạm được ghi khoảng mỗi giây khi có thay đổi; tắt đột ngột có thể mất phần tiến trình sau bản tạm cuối. Nên chờ **Đã lưu** trước khi rời. Khi quay lại, game luôn tạm dừng, không tự chạy tiếp.

Camera, minimap, pan/pinch, ±, chọn ô và chunk/LOD kế thừa V0.2.0. Đồng hồ cập nhật không tạo lại scene, nên giữ vị trí camera trong màn đang mở; camera không đồng bộ cloud. Atlas chỉ tải lúc mở map, tài nguyên tĩnh nằm Vercel/CDN, không đưa vào Supabase PostgreSQL/Storage.

## Cấu hình

Hướng dẫn đầy đủ tài khoản, email/callback, GitHub, Vercel, CDN và xử lý lỗi: **[docs/CONFIGURATION.md](docs/CONFIGURATION.md)**. Thiết kế save/lease/offline và giới hạn: **[docs/SIMULATION-AND-SAVE.md](docs/SIMULATION-AND-SAVE.md)**.

| Biến môi trường Vercel | Giá trị |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL Supabase hiện có |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key hoặc legacy anon key, cùng project |
| `NEXT_PUBLIC_ASSET_BASE_URL` | Để trống dùng Vercel CDN; optional HTTPS origin CDN riêng |

Không cần service-role key, database password, bucket hay máy chủ tick riêng. Không chứa secret thật trong ZIP. Biến public thay đổi cần rebuild/redeploy. App cần Next SSR/Server Actions/Route Handler; không dùng static export.

**Project mới hoàn toàn:** chạy migration `001_foundation.sql` trước, rồi `002_simulation_save.sql`; các tên đầy đủ nằm trong `infra/supabase/migrations/`. Bật Email Auth, đặt Site URL và callback/confirm đúng domain HTTPS Vercel theo CONFIGURATION.md. Dùng `verify_setup.sql` và `verify_simulation.sql` để đọc kiểm tra cấu hình.

## Local/CI tùy chọn cho lập trình viên

Tại thư mục giải nén chứa `package.json`, dùng Node 24.x (hỗ trợ 22–24), npm ≥10:

```bash
npm ci
cp .env.example .env.local
# Điền URL/key public; không commit .env.local
npm run dev
```

Mở http://localhost:3000. Lần đầu tạo database/Auth theo hướng dẫn trên. Boss deploy trực tiếp Vercel có thể bỏ qua phần local này.

```bash
npm run typecheck
npm run lint
npm test
npm run data:check
npm run test:http
npm run build
npm start
```

`npm test` kiểm logic/SQL, Worker thật và coordinator với PostgreSQL fixture; `test:http` chạy Next + Supabase SDK với Auth/PostgREST mô phỏng. Không thay cho smoke test Supabase thật. `npm run test:ui` dùng Playwright khi môi trường có Chromium. Phạm vi thực tế ở [RELEASE-CHECKS.md](RELEASE-CHECKS.md) và [docs/VERIFICATION.md](docs/VERIFICATION.md).

## Source và bảo trì

Next.js 16.4.6, React 19.3.1, TypeScript 6.0.3, PixiJS 8.23.0, Supabase JS 2.119.0 / SSR 0.12.7; giữ lockfile và stack của V0.2.0.

- `src/game/simulation/`: engine/calendar, Worker/client, session, API adapter, bản tạm.
- `src/components/simulation/`: điều khiển thời gian/lưu/history/recovery.
- `src/app/api/simulation/`: endpoint owner-authenticated, kiểm Origin, cấu trúc đầu vào, gọi RPC.
- `src/game/map/`, `src/game/renderer/`, `public/assets/`: generator/camera/render/atlas kế thừa.
- `src/app/`, `src/lib/`, `src/components/`: auth, Server Actions và UI thế giới.
- `infra/supabase/`: migration 001 + 002, query kiểm cấu hình.
- `data/source/`, `data/generated/`: workbook Frozen nguyên byte và catalog/summary đã khóa checksum.
- `scripts/`: importer Excel OOXML, SQL baseline, atlas/manifest; production build chỉ chạy Node verifier + Next.
- `tests/`, `docs/`: kiểm thử và cấu hình/kiến trúc/triển khai.

Không sửa workbook hoặc frozen.json để làm kiểm tra pass. `npm run data:import`, `data:sql`, `assets:world` phục vụ bảo trì có chủ đích; không cần chạy khi deploy. Không đổi thuật toán dưới tên `we-map-1` hoặc `we-sim-1` cho save đã phát hành; nâng version và có đường nâng cấp riêng.

## Rollback và tiếp tục

Chạy 002 trước khi dùng V0.3.0. Nếu phải quay lại code V0.2.0, giữ bảng save mới và không hạ/drop schema; V0.2 không tiến clock, danh sách vẫn đọc ngày đã lưu. Không reset SQL 001. Backup database thực trước khi thay đổi thủ công dữ liệu thật; lịch sử ngắn trong app không thay thế backup toàn project.

Gói source: `World-Evolution-V0.3.0-Simulation-and-Save-Engine.zip`. Migration nâng từ V0.2.0: `World-Evolution-V0.3.0-Migrations.txt`. Tiếp theo **V0.4.0 — Construction & City Planning**: đặt công trình, ghost preview, footprint, xoay và đường theo Master Data. Gửi ZIP mới nhất để nâng cấp tiếp. GitHub/Supabase/Vercel thật chưa được kết nối trong lần bàn giao source này.
