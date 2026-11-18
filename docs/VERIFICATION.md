# Xác minh V0.3.0 — Simulation & Save Engine

## Đã kiểm bằng source và fixtures

- Typecheck app + công cụ/tests, ESLint, production Next/Turbopack build (có `/api/simulation` và Proxy).
- Frozen workbook/catalog/summary, 38 sheet, 5.984 tham chiếu, SQL 001 và asset checksum giữ nguyên.
- Regression map, camera/gesture/LOD, Canvas pixel render, world input/20 dân, auth/proxy/runtime import/release verifier.
- Engine: CFG001/002/008/035 và season ranges khớp Frozen; x1/x2/x4 có cùng tick/RNG ở cùng thời điểm mô phỏng; pause không tiến active time, partial tick/RNG tiếp tục đúng sau deserialize; sai schema/identity/checksum bị từ chối.
- Worker thật qua node worker_threads + Web Worker bridge: load/control/pause, x4, lease-expiry tự pause, snapshot/cursor giữ nguyên. Không dùng Worker giả để thay phần engine trong test này.
- Coordinator thật + Worker thật + PGlite: server commit nhưng mất ACK rồi retry không nhân đôi; reconnect vẫn có bản tạm; offline/visibility pause; takeover fence writer cũ; khôi phục local cùng revision; corrupt cloud head sửa từ history; cloud vẫn lưu khi localStorage bị chặn.
- SQL migration 001→002 trên PostgreSQL engine: owner/anonymous/privileges, full/delta checksum, request idempotency, conflicts, expiry/epoch/takeover/release, malicious payload, bounded retention và mọi chain còn giữ reconstruct được, không tái sinh revision 0, corrupt/restore và cascade delete.
- HTTP qua Next Route Handler/Server Actions + Supabase SDK + Auth/PostgREST fixture: login/session/world lifecycle; open lease, save sang ngày 2, retry, history, restore, Origin/unauth/input checks.

Kết quả cuối ở RELEASE-CHECKS.md. PGlite là PostgreSQL local; Auth/PostgREST fixture không được import vào production. Không chứng minh project Supabase thật/SMTP/email của Boss.

## Trình duyệt và thiết bị

Đã thử 5 Playwright specs bằng system Chromium; cả 5 bị chặn **trước khi vào trang** do môi trường không cho socket của Chromium (`Operation not permitted`). Không coi đây là 5 test app đạt hoặc lỗi nghiệp vụ app; không vượt sandbox để chạy tiếp. Specs được giữ cho môi trường có Chromium đầy đủ.

Chưa xác minh WebGL GPU thật, Safari/iPhone/Android hoặc app bị OS kill/suspend thực. Worker bridge/native Canvas không thay được các kiểm tra này. Chưa push GitHub hoặc deploy/kết nối Supabase/Vercel thật của Boss trong lần bàn giao source.

## Checklist sau deploy

1. Database V0.2.0: chạy 002 một lần, không chạy lại 001/reset. Dùng verify_setup.sql và verify_simulation.sql; private schema không exposed, không có direct client table grant.
2. Deploy source đầy đủ và giữ env. Đăng nhập, mở world cũ: seed/climate/config/20 dân/bản đồ giữ nguyên, engine nhận lease và bắt đầu tạm dừng ngày 1.
3. PC: x1/x2/x4/pause, Lưu ngay/Đã lưu, reload thời gian/RNG giữ đúng; thao tác camera không reset khi clock cập nhật. Kiểm bản đồ/atlas/Worker không lỗi 404.
4. Mobile dọc/ngang: pan/pinch/±, clock controls, lịch sử cuộn, modal Hủy trái/Xác nhận phải, không tràn ngang; khóa màn hình và quay lại phải pause, không bù offline.
5. Hai tab/thiết bị cùng account: một writer, một viewer; Tiếp quản có xác nhận, writer cũ không ghi được; mở lại đúng cloud save.
6. Mất mạng khi đang chạy/lưu: pause, thông báo lỗi và local recovery; Thử lưu lại khi có mạng. Khi lease hết hạn dùng Kết nối lại/đối chiếu; khác revision không tự ghi đè, có tải JSON.
7. History: restore mốc cũ tạo full revision mới/paused; tìm bản hợp lệ gần nhất kiểm checksum/chain. Kiểm retention bằng nhiều lần lưu và đo payload/egress ở Dashboard thật.
8. Test account khác không truy cập worlds/save. Đăng xuất/đăng nhập lại, hết token, browser storage bị chặn/đầy, đóng đột ngột. Chờ Đã lưu trước khi rời dữ liệu quan trọng.
9. Đo tải lạnh/ấm, FPS/RAM/GPU/texture trên thiết bị thật; không có cam kết 60fps hoặc phục vụ không giới hạn trên Free trước số đo.
