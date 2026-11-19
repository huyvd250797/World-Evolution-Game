# V0.9.0 — Construction & Logistics

## Dữ liệu và trạng thái

`construction` version 1 nằm trong save schema 8, engine `we-sim-6`. Nâng đọc schema 2–7, không ghi lại raw head/history trước khi người chơi lưu. Giữ các ID dân, seed/we-map-1, RNG, nghề, đào tạo, nguồn/động vật, lô và camera. Migrations 001–007 không chỉnh sửa; chỉ thêm 008.

Adapter `construction.json` lấy nguyên BOM 166 công trình, sức chứa số, nhóm nơi chứa của 230 tài nguyên và MOV001 (mang 3 đơn vị/chuyến). `scripts/construction.ts --check` đối chiếu canonical. Workbook/catalog Frozen giữ byte và SHA. Không suy đoán số từ phần sức chứa dạng mô tả.

Công trường tham chiếu ID nền đã lưu; lưu entrance, trạng thái active/paused/complete/cancelled, workDone/workRequired, createdTick/completedTick. UI suy ra chờ vật liệu/nhân công từ dữ liệu thực. Blueprint vẫn có status planned để tương thích bản nền, trạng thái hoàn thành thuộc construction, không suy ra từ ảnh.

## Thi công

Tạo công trường yêu cầu nền hợp lệ, công nghệ mở công trình và lối vào tiếp cận từ bãi tập kết. Đây là hàng chờ chuẩn bị, chưa tăng tiến độ hoặc hoạt động khi thiếu vật tư/nhân công. UI hiển thị cần/đã giao/đang chuyển/có tại kho bãi/còn thiếu theo từng dòng BOM. Chỉ hàng tươi hợp lệ ở chính công trường được tính đủ. Vật tư ở kho hoặc đang mang chưa đủ điều kiện xây.

Phân công thợ cần đúng J008 đã hoàn tất đào tạo và công nghệ nghề tương ứng; không dùng dân chưa đào tạo/tập sự để tự cấp thợ. Mỗi người một nhiệm vụ, không đồng thời học/nghề ở cơ sở/sinh tồn/haul/xây. Hai thợ tối đa mỗi công trường là giới hạn kỹ thuật. Đi tới entrance bằng pathfinding; tick vừa đi tới không được tính làm. Nghỉ, di chuyển, thiếu vật tư hoặc khóa công nghệ không tăng công.

Frozen chưa có số ngày thi công: chính sách kỹ thuật công-tick = max(180, tổng lượng BOM × 180), một thợ có mặt đóng góp 1/tick; tick 100 ms. Hai thợ thực sự có mặt đóng góp 2. Đây không phải định mức cân bằng Frozen hoặc thời gian cam kết cho mọi thời đại. Chỉ tiêu thụ toàn bộ BOM đúng một lần khi hoàn thành; trước đó hàng ở buffer công trường bị giữ, chưa tính là chi phí đã dùng. Không hoàn vật liệu đã dùng.

Tạm dừng giữ thợ, vật tư, tiến độ; chuyến đã giao lệnh vẫn chạy. Hủy công trường rút thợ, giữ vật tư tại chỗ. Người chơi phải vận chuyển thu hồi về bãi; hàng đang mang phải đổi điểm giao, không biến ngay thành số dư kho. Chỉ xóa nền đã hủy sau khi không còn hàng/chuyến tham chiếu. Chưa có phá dỡ công trình hoàn thành.

## Vận chuyển và nơi chứa

Giữ chỗ lượng có thật trong một lô, không trừ ở lúc bấm. Cư dân tới nguồn rồi mới tách lô và lấy tối đa 3 đơn vị; đi tiếp đến nơi nhận mới nhập hàng. ID lô mới dùng sequence chung; createdTick, ageTicks, expiresTick và spoiled kế thừa, không làm mới hạn. Không thêm bước di chuyển thứ hai trong tick. Tới nơi/nhận/giao là các bước riêng, không teleport.

Lô có giữ chỗ tạm loại khỏi FEFO, chế biến, cấp công cụ; toàn lô được khóa dù chuyến chỉ lấy một phần. Chuyến khác có thể giữ phần chưa giữ nhưng tổng không vượt lượng. Hủy chuyến chưa lấy hàng chỉ giải phóng giữ chỗ. Sau lấy hàng không được hủy để làm mất cargo: chọn nơi nhận rồi thử giao lại. Nguồn hỏng trước lấy → blocked và hủy; cargo hỏng vẫn được thu hồi về bãi rồi Dọn hàng hỏng, không ăn/uống.

| Nơi chứa | Sức chứa / nhận hàng | Bảo quản |
| --- | --- | --- |
| Bãi tập kết ban đầu | Giữ tương thích V0.8, giới hạn kỹ thuật tổng 1.024 × 100.000 đơn vị và tối đa 1.024 lô | Ngoài trời |
| Điểm giao nhận ngoài trời | 60 đơn vị/bãi, tối đa 32 bãi; ô đi được và có đường từ bãi ban đầu | Không; đây là dấu vị trí, không tạo nhà kho miễn phí |
| Công trường | Tổng BOM; chỉ đúng loại và lượng còn cần, tính cả chuyến giữ chỗ | Ngoài trời |
| B010 hoàn thành | 150; tài nguyên có nhóm kho lương thực theo Frozen | Chỉ khi đủ nhân sự vận hành |
| B011 hoàn thành | 250; hàng không hỏng | Không thay đổi tuổi lô |
| B118 hoàn thành | 120; chỉ nước đã đun R213 | Chỉ khi đủ nhân sự; không biến nước thô thành nước uống |
| B007 hoàn thành | Buffer nguyên liệu kỹ thuật 30 đơn vị, chỉ input các công thức được hỗ trợ | Không; không tính là kho bảo quản |

B007 có buffer kỹ thuật riêng vì Frozen không định lượng sức chứa bếp. Các công trình khác chưa có adapter nơi chứa không nhận hàng tùy ý chỉ vì có trường công suất số. Sức chứa và BOM được giữ chỗ trước khi giao; kho đầy, không phù hợp hoặc mất lối → báo lỗi/blocked và giữ cargo. Điểm vào/bãi không được nền mới chồng lên; tuyến bị cắt khiến người đi bị blocked, cần thử giao lại sau khi mở đường. Đường quy hoạch tiếp tục là hành lang dự thảo, chưa tự tăng tốc vận chuyển.

## Kết nối vận hành

Nhà hoàn thành mới cấp giường theo population adapter; phân bổ tối đa sức chứa, giữ ID nhà trước nếu còn hợp lệ và có đường. Thay quy hoạch kiểm tra lại đường/chỗ ở. Giới hạn dân số tách biệt sức chứa nhà, không tạo/xóa dân.

LaborContext chỉ gồm cơ sở hoàn thành, đạt công nghệ; đào tạo và staffing vẫn có điều kiện riêng. Capabilities sinh tồn đọc đúng cơ sở hoàn thành và nhân lực thực. Nhân sự hoạt động ngoài hiện trường của cơ sở được tính khi có job đúng nghề, không bị blocked; không tính người học bị khóa hoặc kiêm nhiệm thi công. Bếp tiêu thụ nguyên liệu đã mang tới chính buffer bếp, không hút nguyên liệu từ kho xa. Sản phẩm sau khi làm xong vẫn thành cargo mang về bãi. FEFO có thể cấp từ kho hoạt động mà cư dân tiếp cận được; không dùng nguyên liệu ở công trường làm thức ăn.

## Phạm vi có thể chơi ngay và các dependency còn thiếu

Có thể đặt bãi ngoài trời, vận chuyển các lô đã thu về, xem kho/cargo, tạo công trường từ nền đang mở, xem BOM/khóa và lưu/khôi phục. Không có menu cheat, vật tư tặng, công nghệ/mentor/nhân lực tự cấp.

**Thế giới mới chỉ có T001 và 20 dân chưa đào tạo. Chưa có tuyến tạo đủ toàn bộ vật liệu xây dựng (ví dụ R046/R047/R102) hay hệ nghiên cứu mở công nghệ. J008 cần Đường giao thông; đào tạo B123 cần T104/mentor. Vì vậy chưa thể chơi từ số 0 đến ngôi nhà hoàn thành trong bản này.** Các nhánh thi công/vận hành được kiểm bằng fixture đã cung cấp đúng điều kiện, không phải đã mở sẵn trong world sản xuất. Không tự sửa Frozen để bỏ vòng phụ thuộc này. Nghiên cứu nằm V0.12, hoàn thiện chuỗi E0/khởi đầu cần chốt trong giai đoạn tuning V0.13/V1.0. Nếu muốn mở sớm chuỗi khởi đầu, cần quyết định riêng về quy tắc bootstrap, không gọi đó là dữ liệu Frozen hiện có.

## Lưu, hiệu năng và xác minh

Construction/hauls/builders làm snapshot đầy đủ, không delta đối tượng lớn, không ghi Supabase mỗi tick. Kế thừa lease, request retry idempotent, revision/epoch, history/restore, bản tạm, offline và pause khi rời trang. SQL 008 kiểm shape/ID/tiến độ/BOM/capacity/cargo/giường/giữ chỗ; private metadata không cấp client SELECT. Projection chỉ dùng để gọi validator schema cũ, không sửa payload thật.

Renderer dùng stamp Canvas chung cho nền/khung thi công/công trình/bãi, depth-sort cùng người và động vật, chunk/viewport culling; không có ảnh riêng từng công trình, không đưa ảnh vào Supabase. Đây là bộ hình khối 2.5D dùng chung, chưa phải artwork riêng cho 166 công trình. Giao diện bảng dưới bản đồ, bảng rộng cuộn trong vùng, PC/mobile dùng cùng xác nhận Hủy trái/Xác nhận phải. Browser/device/cloud thật phải nghiệm thu sau deploy; xem RELEASE-CHECKS.md.
