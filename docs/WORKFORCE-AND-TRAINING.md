# World Evolution V0.7.0 — Workforce & Training

## Dữ liệu Frozen

workforce.json được xuất từ VAI TRO (96 nghề), DINH BIEN NHAN SU, CONG NGHE, CONG TRINH B123 và CFG013. Không sửa workbook/canonical. Mỗi nghề giữ tên, thời đại, số ngày học, hiệu suất tập sự, tên công nghệ gốc, nơi làm việc ví dụ và cơ sở yêu cầu nghề. B123 có 2 chỗ, yêu cầu T104, cần 1 J009 Người nghiên cứu làm hướng dẫn.

J092 có tên công nghệ “Xử lý nước thải công nghiệp”, trong khi danh mục công nghệ không có tên khớp chính xác. Không tự ánh xạ sang T071 (khác tên/thời đại). Adapter giữ tên gốc, technologyId=null, UI nêu lý do khóa. Chỉ sửa liên kết khi có quyết định dữ liệu chính thức; không sửa Frozen để vượt kiểm tra.

## Phạm vi sử dụng hiện tại

| Thành phần | Trạng thái trong source V0.7.0 |
| --- | --- |
| Hồ sơ 20 cư dân | Dùng ngay; giữ đúng ID, không gán nghề/chứng nhận miễn phí |
| Danh mục 96 nghề | Dùng ngay; tìm kiếm, phân trang, điều kiện công nghệ, ngày học/hiệu suất/nơi làm |
| Bảng lao động | Dùng ngay; lọc rảnh/tập sự/làm/đi/nghỉ/chờ, xem điểm đến, job, cơ sở, tiến độ |
| Chọn nhiều người và xác nhận | Dùng ngay; kiểm trước xác nhận và áp dụng nguyên nhóm, không nửa nhóm thành công |
| Định biên blueprint | Hiển thị cần/có mặt/còn thiếu; actual=0, không coi planned là hoàn thành |
| Bắt đầu khóa/phân cơ sở | Có logic thật, nhưng game hiện tại chưa có cơ sở hoàn thành nên bị khóa với lý do |
| Tiến độ/hoàn thành/đổi nghề | Engine đã triển khai và kiểm bằng fixture đủ điều kiện; không mở khóa chỉ bằng nút bấm |
| Sản xuất tập sự | Tích hợp vào bước làm việc Worker bằng credit nguyên 1/100; nhánh cần nghề/cơ sở vẫn giữ điều kiện |
| Thi công và nghiên cứu | Chưa thêm; theo V0.9 và V0.12. Không cấp công nghệ hoặc hướng dẫn viên khởi đầu |

FOUNDATION_LABOR là hook runtime hiện tại: E0, T001, không có cơ sở hoàn thành. LaborContext cho phép các phiên bản thi công/nghiên cứu cung cấp cơ sở vận hành thực tế. Không lấy dữ liệu planning để tạo LaborSite operational=true. Đây là dependency rõ ràng: V0.7 chưa mở trọn chuỗi nghề trong một thế giới khởi đầu, dù logic có thể được kiểm với cơ sở/nhân sự đủ điều kiện.

Không tự tạo người nghiên cứu ban đầu để làm hướng dẫn viên. Cơ chế khởi động nghề/nghiên cứu đầu tiên cần được giải quyết khi nối luồng chơi E0 hoàn chỉnh; không suy diễn một ngoại lệ đào tạo từ dữ liệu hiện tại. Chưa có vòng đời/tuổi mới trong bản này; không gán tuổi hay sinh thêm người.

## Mô hình và quy tắc đào tạo

Mỗi hồ sơ có citizenId, roleId, qualified, assignment, training và laborRemainder. RoleId là nghề đã học hoặc nghề đang tập sự; qualified tách riêng để không coi đang học là nghề chính thức. Một người chỉ có một assignment và một khóa học.

Đăng ký khóa kiểm: nghề/thời đại/công nghệ, cơ sở hoàn thành và vận hành, cơ sở đúng thời đại, tech của cơ sở, hai chỗ học, hướng dẫn viên đã đào tạo/được phân vào cơ sở/có mặt/không bận job khác, tuyến đến lớp. Người hướng dẫn không tự học cùng khóa. Chọn nhóm có một người sai điều kiện thì không thay đổi người nào, không mất tiến độ/vật tư.

B123 là nơi đào tạo có định mức cụ thể trong Frozen nên hỗ trợ các nghề E0. Trường học B050 có tác dụng rút ngắn đào tạo nhưng chưa có định mức số chỗ/hệ số giảm cụ thể: không tự đặt một con số hoặc mở đào tạo các thời đại cao hơn. Danh mục vẫn đủ 96 nghề.

Mỗi tick nguyên sau di chuyển, engine kiểm lại điều kiện và người hướng dẫn. Chỉ người đứng tại lối vào lớp, idle, không có assignment/job khác mới cộng 1 tick học. Tick vừa đến lớp không tính đồng thời là tick di chuyển và tick học. Nghỉ, thiếu hướng dẫn, trường tắt, mất tech hoặc không đúng cơ sở giữ progress và chuyển trạng thái chờ. Đủ trainingDays × 1800 tick mới qualified=true, training=null, ghi một sự kiện tốt nghiệp.

Đổi nghề hay học lại cùng nghề đều bắt đầu đủ N ngày, qualified=false, bỏ phân công cũ và reset credit sản xuất. Hủy khóa bỏ tiến độ và nghề tập sự, không tự khôi phục chứng nhận cũ. Rút phân công giữ nghề đã đào tạo, cho nghỉ; nếu còn khóa học thì dùng Tiếp tục học để quay lại lớp. Mọi thao tác cần xác nhận, Hủy trái/Xác nhận phải.

## Tập sự và sản xuất

Gắn nghề: hái J001, săn J002, lấy nước J072, chế biến chuyên môn J007. Cơ sở phải nhận đúng nghề theo DINH BIEN NHAN SU, không vượt số vị trí. Đang đi đến cơ sở chưa tính là có mặt; effective staffing phân biệt số người và tổng hệ số lao động.

Tập sự có thể được phân vào cơ sở thực hành phù hợp khi khóa đang hợp lệ. Chỗ lớp vẫn được giữ; lúc đi/thực hành không tăng thời gian học trên lớp. Người chơi dùng Tiếp tục học để quay lại lớp. Không cộng một khoảng thời gian thành cả giờ lớp và giờ sản xuất.

Chỉ bước làm việc thật của survival gọi laborTick, sau kiểm cơ sở/công cụ/nguyên liệu. Ví dụ J001 tập sự 80%: mỗi tick làm cộng 80/100 credit; khi đủ 100 mới tăng một đơn vị workDone của job. Credit dư 0–99 được lưu, không làm tròn tạo thêm sản phẩm. Người đã đào tạo có 100%. Điều kiện nghề không đạt thì không tăng workDone. Travel, nghỉ, pause, cargo/delivery không tạo credit sản xuất.

Hái quả tự do và F001/F002 hiện có của người chưa có nghề vẫn giữ hành vi V0.6 để không làm hỏng world/job đang chạy. Đây là hoạt động sinh tồn tự do, không phải cấp nghề J001/J007 hoặc coi người đó đã tốt nghiệp. Khi có hồ sơ nghề, công việc phải phù hợp nghề và assignment; đang có job/hàng sinh tồn thì không được điều chuyển học/làm đến khi xử lý job hợp lệ. Hệ số nghề không làm tăng đầu ra mỗi mẻ vượt công thức, nguyên liệu hay stock nguồn.

Nghỉ/Tiếp tục trong bảng dân cư giữ tiến độ di chuyển. Không cho lệnh move riêng chiếm người đang học/được phân công; điều chuyển qua bảng Nhân sự. Hướng dẫn viên đang làm vai trò khác không được đồng thời hướng dẫn.

## Save và nâng phiên bản

Schema 6/we-sim-4 thêm workforce, giữ planning/citizens/survival và RNG như cũ. Bản 2/3/4/5 được nâng khi đọc, thêm 20 hồ sơ rỗng theo ID hiện có. Không tạo dân, công trình, nghề, hàng hay khóa hoàn thành. Raw cloud head/history không viết lại khi chạy migration 006.

Lưu assignment, role/qualified, cơ sở học, mentor ID, progressTicks, startedTick, phase và laborRemainder; lịch sử nghề giới hạn 100 sự kiện. Mất điều kiện sau load thì khóa chờ, không hoàn thành theo giờ máy hoặc thời gian offline. Chuyển tốc độ/batching không đổi thuật toán tick.

Session gom lưu theo 30 giây/manual và full snapshot khi workforce đổi. API/SQL chặn delta chứa workforce; giữ request idempotent, revision/epoch lease, owner checks, local backup, history restore. SQL 006 kiểm 96 role IDs, đúng 20 cư dân, shape/credit/tiến độ/duration/mentor và tối đa 2 khóa/cơ sở; dữ liệu private không cấp đọc trực tiếp cho client. Các điều kiện vận hành được kiểm ở lệnh Worker/tick; đây chưa phải máy chủ chống gian lận replay độc lập.

Migrations 001–005 giữ nguyên byte, 006 chỉ thêm role lookup/validator và nâng RPC. Sau ghi schema 6, dùng V0.7/hotfix tương thích; không dùng app V0.6 để ghi tiếp. Restore lịch sử cũ vẫn qua V0.7 được.
