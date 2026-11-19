# V0.6.0 — Survival & Food (19/11/2026)

- Thêm survival adapter từ Frozen: nhu cầu ăn/nước, TTL, công thức, nguyên liệu, tải bộ và nguồn cơ bản.
- Worker jobs đi/làm/mang về, nguồn quả hữu hạn và tái sinh; tồn theo từng lô, FEFO, sổ cấp phát từng ID/ngày, cảnh báo thiếu/sắp hỏng.
- Giao việc có xác nhận, xem tiến độ/lô trên PC/mobile. Bảo vệ depot, giữ hàng mang khi bị chặn, không cho lệnh di chuyển ngoài chiếm cư dân đang có việc.
- Schema 5/we-sim-3, SQL 005; nâng đọc bản cũ, giữ checksum lịch sử, lưu đầy đủ cargo/tuổi/sổ ngày; giữ lease/autosave/local recovery.
- Enforce công nghệ/công trình/nhân lực/công cụ thật cho săn/lấy nước/nấu; không mở miễn phí. Các nhánh này vẫn khóa ở thế giới khởi đầu; docs/SURVIVAL-AND-FOOD.md mô tả adapter và dependencies.

# V0.5.0 — Population Housing & Pathfinding — 19/11/2026

- Schema 4/we-sim-2 giữ 20 IDs từ initial_state; legacy 2/3 nâng đọc có vị trí deterministic, không đổi clock/RNG/quy hoạch.
- Worker reverse BFS cache 8 đích, batch 1–20 IDs, 4 cạnh, tránh water/mountain/slope/footprint, no-path rõ, max512 cạnh.
- CFG059 12 ô/ngày, progress 0–149; move/rest/resume, đổi đích giữa cạnh, replan khi vùng chặn đổi; không đặt nền lên người/cạnh đang đi.
- Sprite/stamp chung, sort isometric/culling, nội suy cosmetic; RAF overlay khi cần, không redraw terrain mỗi frame nhân vật. Chọn sprite/list, focus, thông tin/đích/xác nhận/group command.
- 8 home capacities + CFG053 từ Frozen; actual/projected/homeless/cap, kiểm đường tới lối vào; completed-only allocation model. Không tặng nhà/giường từ planned, không áp chết đói/bệnh khi hệ chưa có.
- Full citizen snapshots/partial progress/recovery; SQL 004 kiểm IDs/path/occupancy/fencing, cap1MiB. Giữ 001–003/Frozen/assets/map byte-for-byte.
- Unit/SQL/Worker/session/HTTP/native Canvas tests, source/README/deploy/migration/rollback docs.

# V0.4.0 — Construction & City Planning — 18/11/2026

- 166 công trình từ Frozen: ID/tên/era/công dụng/tech/BOM; tìm/lọc/hiện khóa. Footprint và placement policy tách planning-v1.
- Ghost nền xanh/đỏ, chốt anchor, xoay footprint, bounds/nước/núi/slope/site/occupancy; xác nhận mới đặt, R/Enter/Escape.
- Blueprint ID/tọa độ/hướng/createdTick/planned; chọn thông tin/hủy có xác nhận.
- Tuyến hành lang dự kiến theo L-route, kiểm contiguous/slope/bounds/overlap; chưa tiêu hao vật liệu hoặc tạo công trình đường hoạt động.
- Worker plan command, schema 3, nâng đọc schema 2 không đổi RNG/tick; quy hoạch full-save qua API validation, clock delta giữ nhỏ, history/local recovery/lease kế thừa.
- Migration 003 mới, giữ 001/002/Frozen/map/atlas byte-for-byte; payload cap 256KiB, catalog private và SQL checks.
- Canvas overlay dùng stamp chung, chunk index/depth sort/viewport culling, cleanup, không reset camera khi clock đổi.
- Unit/SQL/Worker/session/HTTP/Canvas QA, hướng dẫn migration/deploy/rollback schema 3.

# V0.3.0 — Simulation & Save Engine — 18/11/2026

- Worker mô phỏng bước 100ms, x1/x2/x4/tạm dừng, 180 giây/ngày ở x1; lịch 30 ngày/mùa và 120 ngày/năm theo Frozen.
- `we-sim-1`, snapshot schema 2 giữ tick/sub-tick, RNG state/cursor, tốc độ, pause, command sequence và thời gian hoạt động; load luôn tạm dừng.
- Full head cho mở nhanh; delta giữa các lần lưu, full anchor mỗi 8 revision, lịch sử 25–32 mốc. Checksum SHA-256 payload/chuỗi, đọc kiểm tra và tìm mốc hợp lệ gần nhất; khôi phục tạo full revision mới.
- Lease server 75 giây, gia hạn 20 giây, epoch fencing, tiếp quản có xác nhận; retry request ID không nhân đôi revision.
- Tự lưu 30 giây khi thay đổi, Lưu ngay, trạng thái/thời điểm lưu; bản tạm kiểm checksum theo account/world/tab, tối đa 8 bản/7 ngày, khôi phục khi cùng cloud revision, tải JSON khi xung đột.
- Ẩn trang/mất mạng tạm dừng và cố lưu; Worker tự pause khi lease quá hạn, không mô phỏng offline hoặc chạy bù thời gian bị suspend.
- Panel PC/mobile, lịch sử và số byte payload ghi/giữ/truyền trong phiên; đồ họa vẫn ở Vercel/CDN.
- Migration 202611180002_simulation_save.sql, giữ 001/Canonical/atlas/generator nguyên byte. Nâng cấp không xóa bảng hoặc dữ liệu.
- Kiểm SQL leases/history, Worker thật và phối hợp session qua PostgreSQL; giữ regression foundation/map/build.

# V0.2.0 — Isometric World & Camera — 18/11/2026

- Generator `we-map-1`: 256 × 256 ô từ seed + khí hậu, rừng/sông/đồi/núi/tuyết và tài nguyên E0 gắn ID Canonical.
- PixiJS WebGL, atlas tự tạo, phân lớp nền/đối tượng; Canvas 2D khi WebGL không khả dụng.
- Chuột kéo/cuộn, touch pan/pinch, ±, Home, xem toàn bản đồ, mở rộng; drag/pinch không chọn nhầm ô.
- Minimap vùng nhìn + điều hướng; chọn ô xem tọa độ, địa hình, cao độ và nguồn tự nhiên; lưới và marker tài nguyên tùy chọn.
- Worker riêng sinh map, chunk 16 × 16, culling, LOD, texture dùng chung, cache chunk giới hạn và cleanup. Chỉ render khi camera/lựa chọn/kích thước thay đổi.
- Giữ tài khoản, RPC/RLS, revision, seed/cấu hình, 20 dân và checksum Frozen. Không migration mới. Camera không ghi cloud; simulation vẫn tạm dừng.
- Thêm kiểm thử deterministic/hash, khí hậu/tài nguyên, camera, picking, culling/LOD, gesture và render Canvas. Giữ sửa lỗi proxy/build Vercel trước đó.

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
