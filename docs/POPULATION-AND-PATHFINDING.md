# Population Housing & Pathfinding V0.5.0

## Dữ liệu và nâng cấp

20 ID được lấy từ `world.initial_state.people`, không tạo lại ID khi mở/lưu. Legacy schema 2/3 chưa có vị trí được nâng đọc thành schema 4/we-sim-2: spawn 20 ô đất phân biệt gần focus, deterministic theo map/footprint, giữ nguyên seed, clock/tick/subTick, RNG/cursor và quy hoạch. Chỉ lần nâng từ save chưa có vị trí mới tính spawn; schema 4 mở lại dùng đúng vị trí/path/progress đã lưu. Trước khi tải được head hợp lệ, UI không hiển thị nhóm cư dân tạm của engine.

Mỗi cư dân có ID, ô nguồn x/y, status idle/moving/resting/blocked, homeId, destination, path còn lại và progress 0–149. RNG clock giữ cùng thuật toán/cursor với we-sim-1; we-sim-2 thêm chuyển động. Đổi tên/cấu hình world hoặc giảm population_limit không đổi IDs, không xóa dân; giới hạn chỉnh được vẫn theo CFG048/049. Bản này chưa spawn/sinh/tử nên luôn 20 người.

## Đi đường và lệnh

CFG059 = 12 ô/ngày, ngày có 1.800 tick → 150 tick/cạnh. Một cạnh mất 15 giây thực x1, 7,5 giây x2 hoặc 3,75 giây x4. Đồng hồ và di chuyển dùng cùng fixed steps; pause/offline không tiến. Qua đủ cạnh mới cập nhật ô x/y, lưu progress để giữ phần đi dở. Renderer nội suy giữa ô nguồn và ô kế tiếp, không sửa state theo frame rate.

Navigation là đồ thị 4 cạnh, tránh nước/núi/footprint công trình (kể cả nền quy hoạch), cấm chênh cao cạnh >1. Tuyến đường dự kiến V0.4 chưa tạo tốc độ cộng thêm hoặc cầu. Cư dân hiện có thể dùng chung một ô, chưa có tránh va chạm thân người/đám đông. Không áp hệ số tải/thời tiết/sức khỏe chưa triển khai.

Worker dùng reverse BFS theo đích: một field dùng lại cho cả nhóm 20 người và các lệnh cùng đích; cache tối đa 8 đích/navigation context. Footprint đổi sẽ bỏ context, kiểm lại route. Mỗi field xử lý tối đa 65.536 ô, mỗi path tối đa 512 cạnh. Đích không walkable bị từ chối; đích hợp lệ nhưng không có tuyến hoặc quá dài → blocked, giữ destination và báo rõ. Không dịch chuyển tức thời để che lỗi.

Lệnh move có 1–20 ID và một target, xử lý cả nhóm trong một message. Rest giữ nguyên vị trí phân số/path, Resume tìm lại tuyến khi cần. Đổi đích khi đang giữa cạnh phải giữ phần cạnh đã đi, rồi chuyển tuyến sau ô kế tiếp; không snap về ô nguồn. Khi blueprint mới che ô đang đứng hoặc cạnh đang đi thì từ chối đặt. Che phần route phía sau sẽ tìm lại đường; không có đường thì dừng ở vị trí hiện tại. Hủy nền có thể mở lại route; cư dân đã nghỉ vẫn nghỉ cho tới Resume.

## Sử dụng PC/mobile

Trong map chọn tab **Dân cư & chỗ ở** (mặc định), mở Dân cư để chọn ID; danh sách có trạng thái/ô hiện tại, bấm một người sẽ đưa camera tới gần. Có thể click/chạm trực tiếp sprite để chọn. Thông tin hiện vị trí phân số, homeId, destination và số ô còn lại.

Chọn điểm đến → chạm/click ô → Xác nhận. Kéo/pinch chỉ pan/zoom, không gửi lệnh; có thể giao lệnh lúc world đang pause, bấm Chạy để thực sự đi. Có tùy chọn giao cùng đích cho cả 20 người. Nghỉ/Tiếp tục là trạng thái cá nhân, tách pause toàn world. Tab Quy hoạch giữ các controls V0.4, tránh thao tác xây và giao đích cùng lúc.

## Nhà ở và nhu cầu nền tảng

Adapter `data/generated/population.json` lấy CFG003/053/059 và toàn bộ 8 dòng NHA O & DAN SO từ Frozen. Lều ở B006 có 5 chỗ; các loại nhà khác giữ đúng ID/capacity/điều kiện Canonical. Không suy capacity từ tên hoặc footprint.

Hiện tất cả nền V0.4 vẫn status planned; chưa có thi công hoàn tất. **Sức chứa thực tế = 0, homeId = null**, dù bốn lều có dự kiến 20 chỗ. Panel tách dân số/giới hạn, chỗ thực/dự kiến, số chưa có nhà. Nút phân chỗ thực tế bị khóa và giải thích rõ. Không tạo nhà sẵn, không nâng planned thành completed, không tự cộng giường.

Mô hình `allocateHousing` đã có: chỉ nhà completed, có lối vào và reachable; giữ ưu tiên nhà cũ còn hợp lệ, không vượt capacity. Unit fixtures kiểm nhà hoàn thành/đủ chỗ/bị ngăn đường. Hook này dùng khi lifecycle thi công ở V0.9 thực sự cấp completed; không phải nút hoàn thành giả trong game V0.5. Nhánh save V0.5 từ chối homeId khác null để không cấp giường miễn phí qua payload.

Danh sách nền nhà báo có/không có ô lối vào trống; **Đi tới lối vào** gửi lệnh thật cho người đang chọn. Ô lối vào trống không đảm bảo có tuyến từ vị trí người đó: Worker vẫn tìm đường và có thể báo blocked. Việc kiểm tuyến không phân nhà hoặc phát tài nguyên.

Theo CFG053, từ ngày 10 hiển thị cảnh báo còn người chưa có nhà. Chưa áp đói/khát/sức khỏe/sinh tử, không làm dân chết vì hệ sinh tồn chưa có. V0.6 tiếp tục Survival & Food; job/đào tạo thuộc V0.7.

## Renderer và ngân sách

Dùng chung stamp nhân vật 4 bảng màu × 4 frame × selected/normal, không texture theo từng ID/ bước. Sprite và nền quy hoạch sort theo chiều sâu isometric, vẽ culling vùng nhìn; logic đủ 20 người dù ra ngoài camera. Canvas overlay chạy RAF khi có người đang đi và world đang chạy; ground WebGL/Canvas chỉ vẽ lại khi camera/selection/display thay đổi, không redraw toàn terrain theo mỗi bước chân.

Nội suy cosmetic tối đa 350ms sau Worker frame, dừng ở cuối cạnh và không vượt state logic để tiếp tục offline. Animation chỉ đổi chân/tay/pose, không tự tiến clock. Pause giữ vị trí/pose; không dùng FPS làm tốc độ game. Cache/maps/fields/stamps có giới hạn và cleanup theo scene; chưa benchmark GPU/Safari/Android thật, không cam kết 60fps.

## Save, SQL và quyền

Migration mới `202611190004_population_navigation.sql` sau 001/002/003, không sửa ba file cũ hoặc rewrite legacy payload/history. Đọc schema 2/3 vẫn được; save thường không được downgrade head schema 4. Explicit restore lịch sử cũ vẫn tạo revision mới, rồi code mới nâng đọc lại như trên.

Khi citizens hoặc planning đổi, gửi full snapshot qua API kiểm cấu trúc/terrain/ID từ world ban đầu. Delta chỉ dùng clock/metadata nhỏ khi các phần này không đổi; không ghi vị trí từng frame/tick vào DB. Cap incoming payload 1MiB, path từng người 512 ô. Autogenerated save vẫn 30 giây dirty, Lưu ngay/history/local recovery/lease fencing kế thừa. Keepalive chỉ dùng payload nhỏ hơn 60KB; bản lớn cố gửi request thường và luôn giữ bản tạm, không bảo đảm request cuối khi OS kill.

PostgreSQL kiểm owner/lease/epoch/revision/checksum, 20 IDs đúng set trong initial_state, vị trí/bounds/progress/status/contiguous path, occupancy và homeId null. Terrain/slope cụ thể được kiểm Worker/API, không phải server chống gian lận mô phỏng lại mọi tick khi owner gọi trực tiếp RPC. Không cần service-role, schema/bucket public mới hoặc cron. Số byte UI là payload, không phải hóa đơn quota thực.

Sau khi có schema 4, app V0.4 không đọc được save mới; giữ DB và dùng V0.5/bản sửa tương thích thay vì drop tables/reset migration để rollback. JSON bản tạm khác revision vẫn chỉ export/đối chiếu, không tự merge.

## Xác minh

Unit kiểm adapter Frozen, custom IDs/deterministic spawn 7 climates, reverse BFS/cache/obstacles/slope/no-path, fixed-step/mid-edge/rest/replan, forecast/completed-capacity fixtures, schema/RNG/resume và x1/x2/x4. SQL kiểm migration legacy bytes, 20 IDs, partial path restore, duplicate ID/path/free-bed rejects/downgrade/fencing. Worker/session và HTTP kiểm lệnh/snapshot thực. Native Canvas render/pick/culling/cleanup và composite 20 người/4 nền lều đã kiểm; đây không phải browser screenshot.

Browser/OS lifecycle/Supabase/GPU thiết bị thật cần smoke test theo VERIFICATION.md; không báo Playwright đạt khi môi trường chặn Chromium.
