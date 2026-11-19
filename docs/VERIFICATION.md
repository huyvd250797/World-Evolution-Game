# Xác minh V0.9.0 — Construction & Logistics

Kết quả: ../RELEASE-CHECKS.md. Source nền đúng ZIP V0.8.0 Boss gửi. Frozen workbook/catalog, adapters cũ, assets, map generator, proxies và SQL 001–007 giữ nguyên byte; không nâng dependencies.

## Tự động

Typecheck app/tools/tests, lint không warning, data:check và release checksum. 96 tests/subtests gồm Auth/world/map/render/planning/population/survival/workforce/ecology/save/Worker/session và 12 construction/SQL/render tests. Kiểm exact BOM, cargo conservation/TTL/spoil, busy IDs, Frozen locks, material shortage, work-on-site, finite capacity, full build/homes, cancel/recovery, batching/speeds/reload. SQL 008 thực thi PGlite, giữ raw schema 7/history, lưu/khôi phục thật material cargo và completed home; từ chối ID/cargo/home/progress/capacity/delta không hợp lệ.

HTTP Next và Supabase SDK fixture: login/SSR/CRUD/CSRF/owner, save/restore/history/retry, schema 8 in-transit material payload, duplicate yard và construction delta. Production build, sau đó giải nén đúng ZIP vào thư mục mới, npm ci sạch và npm run build lại. Không yêu cầu Boss chạy local.

Renderer Native Canvas vẽ pixel thật của nền, worksite, nhà hoàn thành, marker bãi và culling; đã xem ảnh QA composite. Đây không phải ảnh UI/trình duyệt. Browser/mobile/desktop GPU và cloud thật chưa được nghiệm thu; các specs Playwright có sẵn để chạy trong môi trường Chromium đầy đủ.

## Sau deploy

1. Chạy chỉ 008 sau 001–007; verify_construction.sql: 166 buildings/230 resources, private client reads=false. Giữ env/Auth callback/domain/project cũ.
2. Mở thế giới cũ: seed/tick/20 IDs/nghề/đào tạo/ecology/cargo/lô/hạn không đổi sai. Lưu schema 8 rồi reload và chuyển thiết bị; readonly/lease/takeover như cũ.
3. Dọc/ngang PC/mobile: bảng Thi công dưới map, không tràn ngang, table cuộn nội bộ, cancel trái/confirm phải; chọn nền xem BOM và trạng thái.
4. Khởi đầu thiếu thợ/tech/vật tư phải báo đúng, không tăng tiến độ hoặc tạo free houses. Xem CONSTRUCTION-LOGISTICS.md về dependencies; không sửa save sản xuất để giả công nghệ/nhân sự.
5. Lấy lô đã thu bằng hệ sinh thái, đặt bãi ở ô hợp lệ, giao người rảnh mang hàng. Trước pickup còn tại nguồn, sau pickup cargo, đến nơi mới nhập; giữ TTL khi reload giữa cạnh. Kho đầy/mất lối giữ cargo và báo lỗi; chọn lại điểm nhận để retry.
6. Hủy chuyến chưa lấy hàng giải phóng giữ chỗ; chuyến đang mang phải giao/thu hồi. Hủy công trường không hoàn hàng vào depot; giữ buffer và thu hồi rồi mới xóa nền. Không có phá dỡ completed building ở bản này.
7. Trong môi trường test có đủ điều kiện: vận chuyển đủ BOM, J008 tới entrance mới cộng work, pause giữ work, complete consume một lần; nhà cấp đúng giường; kho/bếp/training vẫn kiểm tech/staff/input/tool/mentor.
8. Kiểm offline/local recovery/history và lost ACK trên thiết bị thật; đo payload/traffic/RAM/FPS thực tế. Không hứa quota Free hoặc 60fps trước khi đo.
