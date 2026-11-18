# Construction & City Planning V0.4.0

## Chức năng và thao tác

Mở world → Xây dựng → chọn công trình đã mở → di chuột xem ghost, click/chạm để chốt ô → R/nút Xoay → kiểm lý do vị trí → Xác nhận. Click/chạm mới đổi anchor; sau khi chốt, ghost và tọa độ xác nhận cùng một vị trí. Enter xác nhận, Escape hủy. Vuốt/pinch/kéo chỉ di chuyển camera, không đặt nền; nền chỉ được tạo khi bấm Xác nhận. Chế độ đặt tự kết thúc sau một lần thành công, tránh nhân đôi khi chạm tiếp.

Danh mục có 166 công trình lấy nguyên tên, thời đại, công dụng, công nghệ và BOM từ Frozen. Mặc định lọc E0, hỗ trợ tìm kiếm và xem E0–E8. Chưa nghiên cứu hoặc chưa đạt thời đại thì không chọn để đặt; vẫn xem được vật liệu và lý do. Hiện chỉ T001 Khởi nguyên được mở như state ban đầu; không tự mở công nghệ mới cho bản này.

Quy hoạch đường là **hành lang/tuyến dự kiến**, chưa phải công trình B139 Đường mòn đang bị khóa bởi công nghệ riêng. Chọn ô đầu, ô cuối, đổi hướng gấp khúc X-trước/Y-trước bằng R hoặc nút Đổi hướng; xem tuyến trước khi xác nhận. Tuyến đã đặt không tăng tốc di chuyển, không cấp logistics và không tiêu hao vật liệu. Tối đa 256 ô/tuyến, 128 tuyến, 8.192 ô tuyến tổng cộng; các tuyến có thể giao nhau, không xuyên nền công trình.

Chọn ô có nền/tuyến để xem tên, ID, tọa độ/hướng, trạng thái quy hoạch và hủy có xác nhận. Nền chưa thi công, không tự cấp nhà ở/kho/công suất/nhân sự, không tạo tài nguyên hoặc trừ BOM. Công nhân/vật liệu/thi công thực thuộc V0.9; dân đi lại và nhà ở bắt đầu ở V0.5.

## Canonical và cấu hình kỹ thuật

Workbook/canonical/summary không thay đổi byte. `scripts/planning.ts` xuất `data/generated/planning.json` từ CONG TRINH + CONG NGHE + DINH MUC XAY DUNG, kiểm qua `data:check` và tests. Adapter có SHA-256 trong package/verifier để phát hiện upload thiếu/khác file.

Canonical chưa cung cấp footprint ô cụ thể. `planning-v1` là cấu hình kỹ thuật riêng, không phải số liệu Frozen: mặc định 2×2, một số nền E0 3×2, lều 2×1, bãi quan sát/điểm vận chuyển/bãi lấy nước 1×1. Toàn bộ kích thước hiển thị trong danh mục, đồng bộ với catalog private trong migration 003. Sau phát hành không thay footprint dưới cùng version vì sẽ làm đổi vùng chiếm đất cũ.

Kiểm vị trí: bounds, occupancy của nền và tuyến, cấm nước; nền thông thường cấm núi đá và chênh cao >1. Bến đánh cá/Bãi lấy nước cần đất tiếp giáp nước. Bãi khai thác đá được gần đồi/đá, cho chênh cao tối đa 3. Kho không đặt trên bờ sông. Đây là quy tắc đặt nền nền tảng; chưa mô phỏng ngập theo mùa, tuổi rừng, mật độ quần thể, độ màu mỡ, tuyến vật liệu hoặc ô nhiễm. Không diễn giải mọi ghi chú Frozen thành gameplay đã vận hành.

## Engine, renderer, lưu

Worker có lệnh plan: đặt nền/đặt tuyến/hủy. UUID được cấp trước khi gửi lệnh để định danh ổn định; Worker kiểm lease, cấu trúc, catalog, vùng chiếm đất, địa hình và giới hạn trước khi áp. Lệnh thành công tăng commandSeq và gắn createdTick; không thay tick/RNG ngoài bước clock đang chạy. Map deterministic được cache trong Worker khi cần quy hoạch.

State schema 3 thêm `planning.version=1`, buildings và roads. Decode schema 2 tự thêm planning rỗng, giữ seed/clock/subTick/RNG/20 dân; DB không rewrite head/history cũ khi chạy migration. Save quy hoạch gửi full snapshot để API kiểm identity/cấu trúc/địa hình; delta clock vẫn nhỏ và không gửi lại planning chưa đổi. API từ chối patch planning/schemaVersion và yêu cầu full. PostgreSQL kiểm owner/lease/epoch/revision/checksum, bounds/overlap/path/catalog/unlock; kiểm địa hình noise cụ thể nằm ở Worker/API, không phải server chống gian lận toàn bộ game khi owner gọi trực tiếp RPC.

003 giữ 001/002 nguyên byte, thêm private planning_catalog và nâng validator/RPC để chấp nhận schema 2/3, cap payload 256KiB. Clock/RNG vẫn we-sim-1, map we-map-1. Sau khi head đã ở schema 3, save thông thường không được downgrade về 2. Restore lịch sử schema 2 vẫn hợp lệ và tạo mốc mới, bỏ phần quy hoạch mới theo xác nhận. Giữ autosave, history/full/delta, local recovery và lease fencing của V0.3; mở/ẩn/offline vẫn tạm dừng như trước.

Overlay Canvas trong suốt dùng chung cho nền WebGL hoặc Canvas fallback. Stamp nền cọc/mặt bằng và tuyến được sinh một lần/loại/trạng thái, dùng lại cho mọi ô; không nhân bản ảnh theo instance. Chunk index 16×16, chỉ lấy vùng nhìn để sort/vẽ theo chiều sâu isometric; ghost xanh/đỏ cùng phép chiếu/cao độ/LOD với renderer nền. Overlay là lớp quy hoạch nổi rõ trên cây/cỏ, không phải cây đã bị chặt. Cache/canvas/chunk được giải phóng khi thoát scene. Clock đổi không reset camera.

## Kiểm tra

`npm run planning:qa` tạo composite bằng renderer Canvas thật, không phải screenshot browser. Test pixel phân biệt ghost hợp lệ/không hợp lệ, pan culling và cleanup. Unit/SQL/Worker/HTTP kiểm Frozen adapter, rotate, bounds/water/slope/site/locked/overlap, L-route, schema migration giữ byte, save/restore và fencing. Chromium bị môi trường chặn socket, chưa xác minh UI/GPU/touch thiết bị thật; checklist ở VERIFICATION.md.

## Triển khai và giới hạn rollback

V0.3.0 đã có 001/002: chỉ chạy 003 mới một lần trước deploy. Project mới chạy 001 → 002 → 003. Không reset worlds hoặc sửa hai migration trước. Không expose schema private và không thêm service-role key. File TXT riêng chứa đúng 003.

Sau khi lưu schema 3 không quay về app V0.3 để tiếp tục mô phỏng vì client cũ không đọc planning. Giữ database/backup và dùng V0.4 hoặc bản sửa tương thích; không drop migration/tables để rollback. JSON bản tạm khác revision vẫn chỉ tải xuống/đối chiếu, không tự merge vào cloud.
