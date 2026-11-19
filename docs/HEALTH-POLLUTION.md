# V0.11.0 — Health & Pollution

## Phạm vi và dữ liệu

Nâng trực tiếp source V0.10.0 Boss đính kèm. Không sửa workbook Canonical, catalog Frozen V1.2 hoặc migration 001–009. health.json là adapter mới, trích 12 bệnh, 14 ô nhiễm, 18 nguồn phát thải, cơ sở/định biên/công nghệ, 5 công thức liên quan và CFG055/056/057/058/063. `npm run data:check` đối chiếu adapter và metadata SQL. Không tự mở thời đại, công nghệ, nghề hoặc cấp vật tư.

Schema 10/we-sim-8 đọc schema 2–9. Khi nâng, sức khỏe bắt đầu tại tick đã lưu, giữ nguyên đúng ID cư dân, địa hình, RNG nền/khí hậu, nghề/đào tạo, hệ sinh thái, cargo/lô/hạn, công trường và lease. `legacyWaste` giữ số liệu hàng hỏng đã dọn ở bản cũ, không giả tái tạo vị trí đã mất. Không chạy bù sức khỏe khi đóng game.

## Cá nhân, bệnh và lao động

Mỗi người có sức khỏe 0–100 (lưu số nguyên phần trăm của điểm), trạng thái nghỉ bệnh, bộ đếm rét/nóng/bẩn/tiếp xúc/thiếu ăn/thiếu nước/chấn thương, danh sách bệnh, lịch phơi nhiễm/khởi phát/kết thúc/hồi phục và tiến độ chăm sóc riêng. Theo dõi phơi nhiễm mỗi tick, kiểm rủi ro sau ngày đầu tiên hoàn chỉnh. RNG xorshift riêng lưu trong health, thứ tự ID ổn định; x1/x2/x4 chỉ thay nhịp, pause ngừng mọi tiến trình.

- D001: nguy cơ khi thực sự ở nơi săn/thi công, không tính người chỉ đi ngang.
- D002: tiếp xúc nước/đất bẩn tại ô đang đứng hoặc lượng nước có vi sinh đã được cấp thực tế. Lô từ ngưỡng cảnh báo trở lên bị chặn cấp uống.
- D004: phơi nhiễm thiếu bảo vệ nhiệt theo engine khí hậu, có xét nhà/nơi trú đã hoàn thành.
- D005: chỉ khi có người đang có triệu chứng D005 trong phạm vi Manhattan 1 ô. Không tự sinh ca chỉ vì có 20 dân. Không lây D004/D006 qua hô hấp. Chưa có nguồn nhập mầm bệnh bên ngoài bản đồ, vì vậy thế giới sạch có thể chưa có D005.
- D006: nóng kèm thiếu nước; thiếu ăn/uống kéo dài làm giảm sức khỏe riêng từng người.
- D003 không phát ngẫu nhiên khi tồn kho đã chặn thức ăn hỏng/nấm chưa xác định; D007–D012 cần thời đại, vật nuôi/công nghiệp/nguồn bệnh tương ứng chưa được triển khai. Danh mục vẫn hiển thị đủ, không giả lập các nguồn chưa có.

Ủ bệnh được lấy số ngày nguyên trong đúng khoảng Frozen; kết thúc = khởi phát + thời gian bệnh Frozen. Không quay lại RNG khi reload. Có giai đoạn hồi phục thêm một ngày kỹ thuật để theo dõi. Nghỉ/chăm sóc không đẩy ngày hết bệnh về hiện tại. Sức khỏe thấp giảm tốc di chuyển/hiệu suất; nghỉ bệnh ngừng sản xuất, vẫn cho đi chậm để giao hàng đã mang. Không xóa việc/lô/cargo; chuyến chưa lấy hàng ngừng khi nghỉ; cargo đã lấy vẫn được giao thực tế. Đào tạo có áp hiệu suất sức khỏe, thời gian đi không thành thời gian học.

## Chăm sóc, vật tư và sản xuất

Lệnh luôn có bước Hủy/Xác nhận và được kiểm tra lại trong Worker với lease. Chăm sóc B136 cần công trình hoàn thành, T115, J011/J081 đã đào tạo và có mặt, tối đa 4 bệnh nhân. Người hỗ trợ và bệnh nhân phải được rút khỏi các việc khác, không mang hàng; cả hai đi tới lều bằng pathfinding. Nhân sự chính vẫn phải ở cơ sở. Chưa có cơ sở/đường/vật tư thì không được tự chữa.

Một lượt chăm sóc mất một ngày làm thực tế; tại hoàn tất, giao dịch trừ 1 R067 + 1 R030 + 1 R061 tại lều; D001 đang bệnh cần thêm 1 R211. Kiểm đủ toàn bộ trước khi ghi nhận; thiếu một loại giữ nguyên tất cả vật tư và chuyển blocked. Lượt chăm sóc hỗ trợ sức khỏe, không thay lịch khỏi bệnh. Đây là định mức kỹ thuật V0.11, vì Frozen chỉ liệt kê đầu vào mà chưa quy định liều điều trị.

F085 tại B012: J011, T005, nhân sự cơ sở, R061×1 + R067×1 + R167×1 → R212×2; hạn 3 ngày Frozen. F086 tại B128: đúng nghề/nhân lực/công nghệ, R058×1 + R050×2 → R211×3. F094 tại B149: R065×3 + R180×2 → R229×4; công nghệ/thời đại E1 vẫn bị khóa trong engine E0. Chỉ tạo sản phẩm/trừ đầu vào ở bước hoàn tất, không cộng khi bấm. Không dùng R208 thay R180 hay thay công thức ủ phân. R212 là hỗ trợ, không phải thuốc trị mọi bệnh.

B012/B128/B136 có buffer thao tác 24 đơn vị; B137/B138 có buffer dụng cụ 4. Đây là dung lượng kỹ thuật, không phải sức chứa dân/công suất Frozen. Vận chuyển đầu vào/đầu ra qua bảng Thi công & Logistics. B138 nhận rác riêng tối đa 70 đơn vị, không trộn sức chứa dụng cụ. B149 có 120 đơn vị. Không coi buffer là kho bảo quản miễn hạn.

## Rác và ô nhiễm

Rác vật lý lưu theo điểm/loại/nơi chứa/tick tạo, đơn vị nội bộ milli để tránh sai số: 0,25/người/ngày (CFG057), 20 dân = 5/ngày. Hàng hỏng chuyển thành R208 tại đúng nơi lô đã nhập, không được dùng làm thực phẩm. Lệnh dọn không đụng cargo hoặc hàng đã giữ cho chuyến và không xóa rác khỏi thế giới.

Thu gom cần J082 đã đào tạo, B138 hoàn thành/T116/đủ nhân sự, dụng cụ R214 thật tại bãi, đường hai chiều và sức chứa còn trống. Giữ chỗ tại nguồn và đích, tối đa 3 đơn vị/chuyến theo MOV001. Người tới nguồn, làm theo CFG058 = 4 đơn vị/ngày thực sự làm việc, rồi mới lấy và mang về. Khi đi không tăng công thu gom. Nhặt giảm nguồn đúng một lần; giao tăng nơi nhận đúng một lần. Hủy khi đang mang bị chặn; thử lại giữ cargo và công đã làm. B138 chỉ tập kết; rác ở bãi tiếp tục phát thải, không biến mất sau thu gom.

B137 chỉ giảm nguồn phân thải ở phạm vi gần khi đã hoàn thành, đúng công nghệ, đủ nhân sự và có R214. Khói phát khi thực sự tiêu hao củi ở lệnh chế biến, sắc thảo mộc hoặc chu kỳ sưởi, không phát chỉ vì có một nền bếp. Chưa mô phỏng sản xuất công nghiệp nên không tự phát EMS007–018 khi đặt công trình. Mưa lan bẩn sang ô kề hợp lệ; nước lan trong ô nước kề, không giả lập thủy văn/dòng chảy toàn lưu vực.

Mỗi ô tích lũy có air/water/soil và dấu vết hóa chất/kim loại riêng, 0–100; tối đa 4096 ô thưa. Đối tượng rác không phải điểm ô nhiễm. Bảo toàn `generated = rác tại nguồn + rác tại bãi + cargo + processed`; V0.11 không tiêu hủy R208 nên `processed` bắt buộc bằng 0. F094 dùng đúng đầu vào Frozen trong kho, không tự xóa rác sinh hoạt để thay nguyên liệu. Các cơ sở B153/B159/B160/B161/B165, điện, công nghiệp và xử lý hóa chất chỉ có metadata/khóa điều kiện, chưa có tuyến vận hành sản xuất ở engine E0; không có nút làm sạch tức thời.

## Nước

Thu nước R062 ghi ô nguồn và chất lượng lúc hoàn tất lấy nước. Khi F060/F087 chế biến, lưu chất lượng nguyên liệu đã thực sự tiêu thụ vào kế hoạch công việc; đầu ra loại bỏ vi sinh nhưng giữ nồng độ hóa chất/kim loại lớn nhất của nguyên liệu. Tách lô khi vận chuyển sao chép provenance, không làm mới hạn. Nước thô không cấp uống. R067/R213 có vi sinh hoặc hóa chất từ 40/100 trở lên không được cấp uống; dùng FEFO và sổ cấp phát cũ để không dùng hai lần. Vật tư nước chăm sóc cũng bị kiểm chất lượng.

Lô cũ trước nâng cấp không có thông tin nguồn: giữ nguyên phân loại R062/R067/R213 và hạn cũ, không giả đo lại lịch sử. R067/R213 cũ kế thừa trạng thái dùng được của bản trước; UI báo chưa có provenance. Lô nước mới qua xử lý thiếu kế hoạch bị đánh dấu hóa chất không xác định 100/100 và chặn dùng, không ngầm coi an toàn.

## Chính sách kỹ thuật, không phải thay đổi Frozen

Frozen chưa có định lượng xác suất theo cường độ phơi nhiễm, thiệt hại sức khỏe, liều chăm sóc, thời gian chế biến/y tế hoặc thuật toán lan/suy giảm. V0.11 ghi công khai các lựa chọn:

- Nguy cơ ngày = rủi ro cơ sở bệnh × min(1, số tick phơi nhiễm/1800); không có nguồn thì không quay RNG.
- Bệnh có triệu chứng: lao động/đi tối đa 50%; sức khỏe dưới 60 còn 75%, ≤25 còn 25% di chuyển và dừng việc. Nghỉ bệnh: lao động 0%, di chuyển 25%. Nhân tiếp với thời tiết và hiệu suất nghề qua credit nguyên lưu lại.
- Mỗi 180 tick: có triệu chứng giảm 0,6 điểm (nghỉ 0,3); không bệnh hồi 0,3 (nghỉ 0,8). Thiếu ăn/nước đầy ngày giảm tối đa 5 điểm mỗi nhu cầu. Một lượt chăm sóc cộng 3 điểm, không rút ngắn bệnh. Sàn sức khỏe 10: chưa bật tử vong khi chưa đủ quy tắc/cân bằng.
- F085/F086: 450 tick thực làm; F094: 3 ngày thực làm; chăm sóc: 1 ngày. Các liều và thời gian này là policy phiên bản, không viết ngược Excel.
- EMS001 = 0,2 điểm/người/ngày, tác động nước/đất tại vị trí; B137 đủ điều kiện giảm nguồn còn 25% trong 2 ô. Rác phát thải theo khối lượng thực. Khói 1,5 điểm/củi theo EMS003; sắc thảo mộc tạo 0,1 đơn vị tro kỹ thuật/củi.
- Không khí suy giảm 10%/ngày, nước 3%, đất/hóa chất 1%; lan bảo toàn phần chuyển khỏi nguồn: không khí 8% sang ô kề, nước 4% chỉ sang ô nước kề. Đây là mô hình nền, chưa có gió hướng/dòng chảy thật. Ngưỡng 40 cho nước/không khí theo CFG; ngưỡng đất 40 và màu cao 70 là UI policy.
- Vùng thưa tối đa 4096 ô, 4096 điểm rác, 20 nhiệm vụ, 1024 provenance và 20 kế hoạch; chạm giới hạn vùng không mở rộng vô hạn. Chưa benchmark chiến dịch 240 giờ hoặc dân số lớn; xem kiểm thử và giới hạn phía dưới.

## Điều kiện còn khóa kế thừa

Engine hiện vẫn khởi đầu chỉ T001, chưa có nghiên cứu/đào tạo bootstrap từ số 0. Vì vậy B012/B128/B136/B137/B138 và nghề tương ứng chưa thể tự mở trong thế giới E0 mới; hệ thống trả rõ thiếu công nghệ/cơ sở/nghề. Luồng chăm sóc/sắc thuốc/thu gom đã kiểm bằng fixture có điều kiện hợp lệ, không coi fixture là người chơi đã được cấp điều kiện. Các công trình E1 trở đi vẫn cần engine thời đại/research tương lai. Không chỉnh DB sản xuất để giả hoàn thành hoặc lách validator. V0.12 Research & Discovery tiếp tục giải quyết luồng mở khóa, không sửa Frozen trong bản này.

## Giao diện và lưu

Bảng Sức khỏe & môi trường dưới bản đồ: lọc tất cả/bệnh/hồi phục/nguy cơ, chi tiết riêng ID/vị trí/bệnh/thời gian/hiệu suất, nghỉ bệnh, phân công có xác nhận, nhiệm vụ blocked/thử lại/hủy, chất lượng lô nước, điểm chứa và danh mục Frozen. Ô bản đồ có số đo/chú giải. Lớp phủ Không khí/Nước/Đất dùng Canvas riêng, pointer-events none, culling theo vùng nhìn, cache frame tĩnh; tắt lớp phủ không đổi simulation. Tốc độ hình nhân dùng tốc độ khí hậu × sức khỏe.

health là một phần snapshot đầy đủ có SHA-256, không gửi Supabase mỗi tick. Lease, autosave, bản tạm, mất ACK, giới hạn lịch sử, chuyển thiết bị và xung đột dùng engine cũ. Delta chứa health bị chặn ở API/SQL. Migration 010 thêm metadata/validation không sửa dữ liệu cũ; đọc được schema 2–9, lần lưu mới ghi schema10. Sau đó cần V0.11 hoặc bản tương thích để ghi tiếp.

Kiểm thử chi tiết ở RELEASE-CHECKS.md. Browser/mobile/GPU/cloud và quota thật chưa được xác minh trong môi trường này.
