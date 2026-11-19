# Xác minh V0.7.0 — Workforce & Training

Kết quả cuối: ../RELEASE-CHECKS.md. Giữ bản nền V0.6, không chỉnh Frozen hoặc migration cũ.

## Kiểm tự động

- Typecheck app/tools/tests, ESLint, data:check, release checksum, production build và cài sạch/build lại từ ZIP.
- 73 tests/subtests: toàn bộ regression Auth/world/proxy/map/Canvas/planning/population/survival/simulation và workforce mới.
- Adapter đủ 96 nghề, giữ tên/era/ngày học/hiệu suất/công nghệ/nơi làm/công dụng; staffing theo Frozen, B123=2 chỗ + 1 J009. J092 chưa khớp technologyId được khóa rõ lý do.
- Cơ sở hoàn thành, tech T104, mentor qualified/present/unoccupied, tuyến đi và capacity; batch có một người sai thì không thay đổi người nào.
- Tiến độ không tăng khi đang đi/nghỉ/thiếu mentor/cơ sở tắt, tick vừa đến lớp không tính hai lần; đủ chính xác 5 ngày J001 mới tốt nghiệp; học lại cùng nghề reset đủ N ngày.
- Phân công độc quyền, vị trí theo định biên, tập sự không thay hướng dẫn viên, effective staffing tính riêng hệ số. Thực hành ngoài lớp không cộng giờ lớp.
- Survival hooks: credit 80/100 chỉ ở actual work tick, job đầu ra chưa xuất hiện khi chưa làm đủ, phần dư được serialize/parse rồi tiếp tục không tăng sai sản lượng.
- Schema 5 thêm 20 hồ sơ rỗng giữ citizens/cargo/TTL; checksum reload giữ progress/credit và thiếu điều kiện thì chờ, không tốt nghiệp theo wall clock.
- SQL 006 giữ raw schema 5/history, full workforce state save/restore, malformed progress/IDs/credit bị chặn; owner/downgrade/private-table grants và delta guard.
- Worker source thật + session bridge: workforce command, missing-facility rejection/no-free-role, rút phân công/nghỉ, snapshot/save; giữ offline/retry/history/lease regression.
- HTTP với Next SSR/actions và Supabase SDK fixture: schema 6, invalid worker ID và unsafe workforce delta bị chặn, Auth/CSRF/save/retry/restore/các luồng cũ đạt.

## Giới hạn

Không xác nhận UI browser/Playwright đã đạt. tests/ui/workforce.spec.ts có sẵn nhưng cần môi trường Chromium hoạt động; các lần nền bị chặn socket. Chưa kiểm Safari/Android/iPhone/GPU và tài khoản dịch vụ thật của Boss. Source build/fixture không chứng minh deploy cloud hoặc tốc độ thiết bị thật.

Nghiệm thu nhánh đào tạo đủ điều kiện hiện dùng LaborContext fixtures: game chưa có cơ sở hoàn thành/hướng dẫn viên/công nghệ T104. Không báo đã mở gameplay đào tạo trong world khởi đầu. Chưa có bootstrap nghề nghiên cứu hoặc đào tạo đời cao thiếu định mức; không tự thêm ngoại lệ vào Frozen.

## Checklist sau deploy

1. Chạy 006 một lần sau 001–005, giữ repo/project/env/worlds; verify_workforce.sql phải có 96 roles và các private grants=false.
2. Mở world cũ giữ đúng seed/tick/map/20 IDs/cargo/lô/hạn, world pause. Bảng nhân sự dưới bản đồ có 20 profile chưa cấp nghề.
3. Lao động: lọc rảnh/đang học/làm/đi/nghỉ, chọn một hoặc nhiều người, xem cơ sở/điểm đến/job. Pan/pinch bản đồ vẫn như cũ.
4. Đào tạo/đổi nghề: Confirm không khả dụng nếu thiếu cơ sở hoàn thành/tech/hướng dẫn; hiện rõ điều kiện, không tự hoàn thành nền. Hủy bên trái/Xác nhận bên phải.
5. Danh mục 96 nghề: tìm kiếm, phân trang, chữ đủ trên PC/mobile; J001=5 ngày/80%, J092 giữ tên công nghệ gốc và lý do khóa.
6. Định biên planned: số có mặt thực=0, thiếu đúng định mức. Không cho claim có người làm từ các nền quy hoạch.
7. Manual save/reload/history/local recovery/hai thiết bị lease và takeover giữ đúng ID/profile/tiến độ, không nhân sản phẩm hoặc cấp nghề. Khóa màn hình không chạy bù offline.
8. Kiểm layout dọc/ngang, đọc nguyên tên nghề/công nghệ/cơ sở, thao tác chọn nhóm và confirm, đo RAM/FPS/save/traffic trên deployment/thiết bị thật.
