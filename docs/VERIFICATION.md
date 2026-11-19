# Xác minh V0.11.0 — Health & Pollution

Kết quả: ../RELEASE-CHECKS.md. Source bắt đầu từ đúng ZIP V0.10.0 Boss đính kèm. Dependencies giữ pinned; Frozen workbook/catalog/adapters trước, migrations001–009, assets/map generator/proxies giữ nguyên byte.

## Kiểm tự động

Data adapters và checksum, Next/app/tools/tests typecheck, lint không warning, 128 tests/subtests đạt, HTTP smoke với real Next/Supabase SDK/PGlite fixtures và production build. Các kiểm health mới gồm dữ liệu Frozen, schema9→10, per-person disease timeline/rest, deterministic batching/speeds/RNG/reload, local transmission/no spontaneous respiratory source, work credits/cargo retention, spoiledfood→real refuse, gated collection/reservation/capacity/path/carry/delivery/mass, chemical provenance/boiling/unsafe water exclusion, malformed state rejection, completed B136 actual care/atomic rollback, F085 actual production/TTL/fuel emission, SQL010 save/history/restore/privacy, Canvas overlay pixels/culling/cache/off/release. Real Worker thêm command health/rest/lease refusal; HTTP thêm snapshot/rest/mass/delta branches.

Regression bao gồm auth/worlds/RLS/seed/map/camera/planning/citizens/pathfinding/survival/lots/workforce/training/ecology/construction/logistics/climate/save/lease/backup/lost ACK/history. Test sinh tồn chọn nguồn gần có đường để kiểm cargo trước thiếu ăn kéo dài, tránh nhầm mô hình sức khỏe mới với lỗi save.

Sau kiểm source: tạo ZIP không chứa dependency/build output, giải nén sang thư mục QA mới, chạy npm ci thật và npm run build (không symlink node_modules). Kiểm ZIP CRC, version0.11.0, package ở gốc, alias proxy, file cần thiết, SQL010=TXT, toàn bộ dữ liệu bảo vệ so byte với ZIP nguồn. Đây là xác minh gói source; không phải deploy cloud.

## Đồ họa

Native Canvas thực thi PollutionRenderer với map Canvas thật; xem ảnh composite, các ô màu khớp lưới isometric, đồ họa không thay RNG. Test đếm pixel/culling/cache/off và giải phóng backing store. Không dùng ảnh tạo bằng AI để thay kiểm renderer. Không gọi đây là browser screenshot hay bằng chứng pinch/mobile/GPU60fps.

## Nghiệm thu sau deploy của Boss

1. Chạy SQL010 một lần sau001–009, trước deploy. verify_health.sql cho12/14/18 và private reads=false. Giữ env/domain/Auth callbacks/repo/database.
2. Mở thế giới cũ: seed/tick/20 IDs/nghề/đào tạo/khí hậu/ecology/công trường/cargo/hạn giữ đúng. Health bắt đầu tại tick đã lưu, không hồi tố thời gian ngoài app.
3. Lưu thủ công, reload và so sức khỏe/bệnh/lịch/RNG/rác/provenance. Restore từ lịch sử cũ tạo revision mới, không xóa lịch sử gốc. Không dùng app V0.10 để ghi lại schema10.
4. Kiểm bảng sức khỏe/lọc/chọn người/nghỉ, chọn ô/lớp phủ/chú giải; PC và mobile ngang/dọc, pan/pinch/zoom/chọn ô vẫn hoạt động. Tắt lớp phủ/thời tiết không đổi tiến trình.
5. Cơ sở có đủ điều kiện mới giao việc. World mới chỉT001 không tự mở clinic/sanitation/training; không sửa DB sản xuất để giả fixture. Kiểm thông báo điều kiện thiếu thay vì kỳ vọng nút chữa tức thời.
6. Khi tuyến mở khóa thực sự có ở phiên bản tiếp: kiểm đủ nhân lực/cơ sở/tech/vật tư tại buffer, tới nơi mới tăng công; thiếu vật tư không trừ một phần; cargo/giao rác/cancel/retry giữ khối lượng, B138 đầy báo rõ.
7. Hai thiết bị: observer không ghi; takeover làm tab cũ mất lease. Mất mạng/ẩn app tạm dừng và giữ bản tạm; xung đột không ghi đè tự động. Theo dõi kích thước full save/lượng truyền thật ở Supabase.

## Chưa xác minh hoặc chưa có tuyến vận hành

Browser/Playwright spec compile nhưng chưa chạy trong môi trường này. Thiết bị thật/GPU/60fps/hosted Supabase/Vercel, billing/quota, chiến dịch240giờ chưa kiểm. Bệnh công nghiệp/vật nuôi/chất thải độc và cơ sở công nghệ cao chưa có nguồn/era/điện thật trong engineE0. Các thông số kỹ thuật ghi trong HEALTH-POLLUTION.md, không phải thay đổi Frozen.
