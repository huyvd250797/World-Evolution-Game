# Xác minh V0.5.0 — Population Housing & Pathfinding

Kết quả cuối trong RELEASE-CHECKS.md. Nền nâng cấp là ZIP V0.4.0 Boss đính kèm.

## Kiểm tự động

- Typecheck app/tools/tests, ESLint, production Next/Turbopack build.
- 59 unit/integration tests/subtests: regression Frozen/world/auth/SQL/proxy/release/map/camera/Canvas/planning và population mới.
- Adapter CFG003/053/059 cùng 8 home capacities khớp Frozen; không đổi workbook/canonical/planning adapter/atlas.
- Spawn 20 ID cung cấp từ save ở đủ 7 khí hậu: deterministic, distinct, passable. IDs khác baseline/trùng bị chặn.
- Reverse BFS/cache nhóm/cùng đích, tránh water/mountain/slope/footprint, no-path, LRU bounded; route cardinal/cap512.
- Fixed movement progress, rest/resume, đổi đích và replan giữa cạnh không teleport; chặn nền che người/cạnh đang đi.
- Housing projected/actual, completed-only capacity/allocation/reachability, không cấp giường từ planned, cảnh báo từ ngày10, không xóa dân khi thay cap.
- Schema 2/3 nâng đọc 4 giữ tick/RNG/custom IDs/quy hoạch; lưu partial edge/reload và x1/x2/x4 nhất quán.
- SQL 004 giữ raw legacy head/history; IDs/progress/status/path/free-bed/downgrade/fencing bị kiểm; vẫn không có direct client table grants.
- Worker/session thật qua node worker bridge + PGlite: giao lệnh/di chuyển/save, lost ACK/retry/lease/offline/local recovery kế thừa.
- Next HTTP + Supabase SDK fixture: auth/world lifecycle, sim/planning, full citizens save/load giữa cạnh, no-free-bed reject, CSRF/auth/input.
- Native Canvas pixels/picking/culling/cleanup và bật animation chỉ khi có người đi trong viewport. Đã xem composite 20 người và bốn nền lều; đây không phải browser screenshot.

## Giới hạn xác minh

Môi trường đã chặn Chromium socket ở các bản nền; không coi các Playwright specs đã đạt ở V0.5. Có specs mới/điều chỉnh cho population/planning để chạy ở môi trường có browser đầy đủ. Chưa xác minh GPU/WebGL thực, Safari/iPhone/Android, OS kill/suspend hoặc Supabase/Vercel thật của Boss. Native Canvas/Worker bridge và Auth/PostgREST fixture không thay các kiểm tra đó. Chưa push/deploy vào tài khoản Boss.

## Checklist sau deploy

1. V0.4 đã chạy 001–003: chỉ chạy 004 một lần, giữ DB/env/repo. Project mới chạy 001→002→003→004.
2. Mở world cũ: đúng tick/seed/map/planning/20 IDs, pause; lưu schema4 rồi reload không tạo lại vị trí.
3. Dân cư → chọn người/list/sprite → chọn điểm đến → xác nhận → Chạy. Kiểm không teleport; pause, Lưu ngay giữa cạnh rồi reload còn đúng progress/destination.
4. Chọn nhóm20 cùng đích, Nghỉ/Tiếp tục một người/nhóm; x1/x2/x4 và pause toàn world độc lập. Kiểm no-path/water/mountain/slope và tuyến quá dài.
5. Đặt nền lên người/cạnh đang đi phải từ chối; che tuyến phía sau phải replan/blocked; hủy nền mở lại tuyến, người đang nghỉ không tự chạy.
6. Chỗ ngủ actual0 khi chỉ planned, projected theo capacityFrozen, homeIdnull; Đi tới lối vào dùng route thật. Đến ngày10 thiếu nhà chỉ cảnh báo, không giết dân. Đổi population limit không xóa người.
7. Hai thiết bị lease/takeover, offline/bản tạm/revisionconflict, historyrestore giữa đường và token hết hạn không ghi đè.
8. Mobile dọc/ngang/mở rộng: pan/pinch không gửi move, Hủy trái/Xác nhận phải, target panel không bị che; khóa màn hình quay lại paused, không bù offline.
9. Đo GPU/RAM/FPS/texture/save size/egress trên thiết bị/dịch vụ thật, kiểm người ngoài viewport không vẽ và terrain không redraw từng bước chân. Chưa có cam kết 60fps hoặc Free không giới hạn.
