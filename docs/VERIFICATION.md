# Xác minh V0.6.0 — Survival & Food

Kết quả cuối trong ../RELEASE-CHECKS.md. Nền V0.5.0 giữ nguyên dữ liệu Frozen, bản đồ, assets và migration cũ.

## Kiểm tự động

- Typecheck app/tools/tests, ESLint, data:check, release verifier, production build. Gói bàn giao được giải nén vào thư mục sạch rồi npm ci/build lại.
- 66 tests/subtests: regression Auth/world/proxy/release/map/Canvas/planning/population/simulation và survival mới.
- Hái đi đúng số tick, có thời gian làm, chưa nhập hàng khi còn mang; source stock/cooldown không vô hạn; hủy có cargo bị chặn.
- FEFO qua nhiều lô, nhu cầu vs đã cấp tách riêng, mỗi ID không được cấp quá định mức/ngày; raw water và thịt/cá sống không cấp ăn/uống.
- TTL từng loại, ngày mới, spoilage, kho phù hợp dừng tuổi và ra kho tiếp tục; khoảng gián đoạn lưu/reload không làm mới hạn.
- Fixtures đủ capability: lấy nước theo CFG018, chế biến đúng nguyên liệu và nhiên liệu, công cụ săn không dùng đồng thời; thiếu điều kiện bị từ chối. Đây là kiểm adapter cho tương lai, không phải công trình đã mở trong game.
- Timer batching/x1/x2/x4/pause và checksum decode giữa hoạt động cho cùng state; legacy schema 4 giữ IDs/routes/RNG khi thêm survival.
- SQL 005 giữ raw byte cũ, save/restore giữa đường và **khi mang lô thật**, giữ expiry; ledger quá mức, sai TTL, unsafe delta, downgrade/khác chủ bị từ chối.
- Worker thật qua Node bridge; lease/command/pause và mới thêm giao survival job, chặn lệnh di chuyển khác chiếm người, load lại job.
- Next HTTP + SDK fixture: Auth/SSR/actions, world lifecycle, planning/citizen/full survival snapshot, invalid allocation/survival delta, CSRF, idempotent retries và history restore.

## Giới hạn

Playwright specs trong tests/ui (có survival mới) cần chạy ở máy/CI có Chromium đầy đủ. Môi trường nền chặn browser socket; chưa có kiểm UI thật cho bản này. Chưa kiểm Safari/iPhone/Android, GPU/WebGL/60fps, dịch vụ Supabase/Vercel thật hoặc bị OS đóng ứng dụng. Không cam kết quota Free/hiệu năng thiết bị nếu chưa đo thực tế.

## Nghiệm thu sau deploy

1. Chạy 005 một lần sau 001–004; giữ repo/database/env. Project mới chạy đủ 001→005. Mở thế giới cũ kiểm tick/seed/quy hoạch/20 ID/vị trí.
2. Sinh tồn & thức ăn: nhu cầu 20/40, chưa cấp nếu kho rỗng. Chọn ô quả và một ID đứng yên, Giao việc → Xác nhận; pan/pinch không tự gửi lệnh.
3. Chạy x1/x2/x4/pause; tới nguồn trước, làm đủ mới có lô đang mang; nhập bãi và cấp phát sau giao. Lưu ngay giữa đường, lúc làm và khi mang hàng rồi reload, kiểm không thêm sản phẩm/đổi expiry.
4. Khi người có job, lệnh đổi điểm đến bị từ chối; Nghỉ/Tiếp tục giữ progress; bị chặn dùng Thử giao lại. Không cho đặt nền lên depot/người/cạnh hiện tại.
5. Thử săn/nước/nấu phải hiện điều kiện tech/cơ sở/công cụ chưa đạt, không auto unlock. Bếp planned vẫn bị khóa; nước thô không tính nước uống.
6. UI cuộn xem lô, thiếu/sắp hỏng, dọn lô với xác nhận; xoay dọc/ngang không che nút Hủy/Xác nhận, thu gọn bảng để chọn ô bản đồ.
7. Offline/khóa màn hình/recovery/lease takeover hai máy, restore history và pending retry vẫn giữ cơ chế cũ; đóng app không chạy bù.
8. Đo save size/traffic/FPS/RAM thật sau deploy. Xem dependencies và chính sách kỹ thuật trong SURVIVAL-AND-FOOD.md.
