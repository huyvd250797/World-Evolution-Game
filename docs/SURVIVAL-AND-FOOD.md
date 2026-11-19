# V0.6.0 — Survival & Food

## Dữ liệu và phạm vi thật

Master Data V1.2 giữ nguyên byte. Adapter survival.json chứa CFG004=1 ăn/người/ngày, CFG005=2 nước/người/ngày, CFG018=6 nước thô/người/ngày, MOV001 tải bộ=3; TTL từ TAI NGUYEN, quy tắc BAO QUAN & KHO, công thức và nguyên liệu, SP001/SP015. Đây là dữ liệu tham chiếu; không chỉnh bảng Frozen.

| Hoạt động | Luật đã triển khai | Thế giới V0.5 nâng lên |
| --- | --- | --- |
| Hái quả | Ô resource=R001, tuyến hai chiều, trữ lượng SP001 2–5; mang tối đa 3, tái sinh 12 ngày sau thu hết | Dùng được với 20 ID hiện có |
| Ăn trực tiếp | F001 quả/F002 củ: 1 nguyên liệu thành 1 phần ăn; FEFO có thể cấp trực tiếp theo công thức | Dùng quả thu về; không tự sinh củ |
| Nấm | F003 yêu cầu nhận diện nấm an toàn | Chưa có nguồn được nhận diện, bị chặn |
| Lấy nước | T093, B117 hoàn thành có nhân lực, nguồn nước, ô bờ có đường; thu 3 trong 0,5 ngày làm việc (CFG018) | Bị khóa vì chưa có công nghệ/công trình hoàn thành |
| Săn cơ bản | Trại B002 hoàn thành có nhân lực, công cụ R125 cấp độc quyền, rừng có lối đi; SP015 thịt 1 + da 0,5, cooldown 30 ngày | Bị khóa, không tự cấp trại/công cụ |
| Nấu | F004/F005/F006, T002, bếp B007 hoàn thành có nhân lực, đủ nguyên liệu/củi theo từng công thức | Bị khóa; nền planned không tính là bếp |
| Làm sạch nước | F060/F087, T002 và T102, bếp hoạt động, 2 nước thô + 1 củi → 2 đầu ra tương ứng | Bị khóa, không tự coi nước sông an toàn |
| Kho bảo quản | Capability B010 đã hoàn thành/có nhân lực tạm dừng tuổi lô thực phẩm; rời kho tiếp tục tuổi cũ | Chưa có kho hoàn thành; bãi tập kết luôn ngoài trời |

Capability adapter tách khỏi blueprint; trong game hiện tại dùng FOUNDATION_CAPABILITIES (T001, không cơ sở hoạt động). Các nhánh săn/nước/nấu/kho có kiểm thử bằng fixture có đủ điều kiện. Chưa có đường giao diện cấp những capability này. Khi nối thi công/đào tạo/nghiên cứu phải nâng validator tương ứng; SQL 005 chặn job cần công nghệ/cơ sở chưa tồn tại. Không quảng bá các nhánh đang khóa là gameplay đã mở.

Chưa có mô phỏng sức khỏe/tử vong do thiếu ăn/nước, đào tạo nghề, thiên tai/chất lượng nước theo ô hoặc hệ động vật V0.8. Chưa áp hệ số nóng/rét khi các trạng thái phơi nhiễm chưa có; dùng đúng mức cơ sở 1/2, không tự tăng cho mọi dân.

## Chuỗi hoạt động

Xác nhận giao việc chỉ tạo job. Đi tới nguồn bằng pathfinding Worker, tính đủ thời gian tại nguồn, tạo từng lô trên người, đi về depot, đổi nơi chứa khi thật sự tới. Kho có thể cấp phát không tính hàng mang/hỏng. Pan/pinch không tự giao việc; nút Xác nhận riêng. Nghỉ giữ tiến độ; Tiếp tục hoặc Thử giao lại tính lại tuyến. Có hàng thì không cho hủy để làm mất hàng; phải giao lại. Quy hoạch không được chặn depot hoặc đè cư dân/cạnh đang đi; đích việc mới bị chặn thì job đứng chờ.

Bãi tập kết là tọa độ ngoài trời ở vị trí cư dân đầu tiên khi nâng schema, không cấp miễn phí công trình, vật tư, thùng nước hoặc hiệu ứng kho. Điều kiện nhận là đất đi được, cư dân thực sự tới bãi. Hệ thống cấp phát kiểm dân có đường đến bãi; chưa mô phỏng từng chuyến đi ăn riêng. Khoảng cách di chuyển vẫn tính trong thời gian khai thác thực tế.

SP001 ánh xạ cho nguồn quả R001 có sẵn, lượng deterministic theo seed+tọa độ. Chỉ giữ bản ghi các nguồn đã dùng (tối đa 4096), không tạo toàn bộ sinh thái mới hay thay bản đồ we-map-1. Săn dùng proxy nguồn rừng hữu hạn/cooldown, chưa có động vật di chuyển/sinh sản/thú săn mồi.

## Chính sách kỹ thuật riêng, không phải sửa Frozen

Frozen chưa có thời lượng từng thao tác hái/nấu/săn. V0.6 dùng hái 450 tick (1/4 ngày), xử lý mẻ 150 tick, săn 1800 tick. Tải 3 và tốc đi bộ 12 ô/ngày giữ đúng dữ liệu. Dùng định mức săn bảo thủ SP015 (1 thịt + 0,5 da); chưa có xác suất/chấn thương động vật.

Chế biến tiêu hao nguyên liệu một lần khi xác nhận, không hoàn lại khi hủy; không cộng sản phẩm cho đến hết thời gian làm. Chỉ nhận nguyên liệu đã nhập depot. Bếp future-adapter phải có điểm nhận trùng depot; nếu khác, chặn với lý do cần vận chuyển, không dịch chuyển vật tư đến bếp. Chưa có logistics đầu vào riêng giữa nhiều kho.

F001/F002 có thể được quy đổi trực tiếp lúc cấp phát, không ghi một lô R030 giả vào kho. Các nguyên liệu khác chỉ dùng khi có công thức/nhận diện; thịt/cá tươi không ăn trực tiếp. Nước uống chỉ R067/R213, nước thô R062 không cấp uống. Đun sôi không đồng nghĩa lọc hóa chất.

Cấp phát tối đa mỗi 180 tick (0,1 ngày) và ngay sau giao hàng. Dân có sổ food/water riêng theo ID/ngày; trừ lô và ghi cấp trong cùng bước Worker. FEFO trên toàn bộ loại hàng ăn được, hòa thì tick tạo/ID. Nhu cầu toàn ngày hiển thị ngay, đã cấp là thực tế; thiếu hôm trước lưu trong previous, không lấy lại đồ ăn đã tiêu dùng. Dự trữ = tồn hợp lệ / tổng nhu cầu cơ sở một ngày; không phải bảo đảm mọi lô sống được đủ ngày tương ứng.

## Lô và TTL

Mỗi lô có ID tăng đơn điệu, loại, quantity, createdTick, ageTicks, expiresTick, location, spoiled. Thịt thú 2 ngày, cá 1, nấm 3, củ 12, hạt 35, quả 7, thịt nướng 5, nước đun sôi 2; không có mặc định 7 cho mọi hàng. Tuổi vẫn tăng khi mang hàng. Hỏng không cấp phát; dọn chỉ xóa hàng tại depot và cộng waste, không xóa hàng đang mang. Hư hỏng/tuổi tính bằng tick game, pause/đóng app không làm già hàng, reload không lấy giờ máy để đổi hạn.

Tối đa 1024 lô, 20 việc, 4096 nguồn. Không gộp khác lô/hạn. Lô trống dọn ở ngày mới hoặc thủ công; hàng hỏng còn thấy trước khi dọn. Nếu chạm giới hạn, công việc dừng chờ để không làm mất/nhân sản phẩm.

## Save và tương thích

Schema 5/we-sim-3 thêm survival. Bản 2/3/4 được nâng trong bộ nhớ: đúng ID đã lưu, giữ vị trí/tick/RNG/planning, thêm depot/lô rỗng và sổ bắt đầu ở ngày hiện tại. Không hồi tố nhu cầu/cấp miễn phí thức ăn. Raw head/history cũ giữ nguyên checksum/byte.

Advance lặp tick nguyên để giữ thứ tự arrival → work → cargo → delivery → spoilage/allocation. Cùng state/seed/lệnh tạo cùng kết quả bất kể batching hoặc x1/x2/x4. Job/cargo/nguồn đã thu/tuổi/lô/sổ ngày đều là state. RNG chính giữ thuật toán/cursor cũ; nguồn dùng hash riêng theo seed.

Session tạo full snapshot khi survival thay đổi, gom 30 giây hoặc Lưu ngay, không gửi từng tick. Delta chứa survival bị API/SQL chặn. Giữ nguyên idempotent request retry, owner/auth, fencing revision+epoch, local backup account/world, retention lịch sử. SQL kiểm cấu trúc/phạm vi và quyền sở hữu; API/Worker còn kiểm terrain và trạng thái. Đây không phải máy chủ chống gian lận mô phỏng độc lập.

005 không reset world/head/history; chỉ thay validators/RPC và chặn hạ schema khi lưu bình thường. Restore lịch sử cũ vẫn được, rồi nâng schema ở client. Đã ghi schema 5 thì app cũ không được tiếp tục ghi; dùng V0.6 hoặc hotfix tương thích.
