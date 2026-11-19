# V0.8.0 — Living Ecosystem

## Dữ liệu và phạm vi

Master Data V1.2 Frozen giữ nguyên byte. Ecology adapter sao chép 52 loài/nguồn, 10 sinh cảnh, 14 quan hệ săn mồi, sản phẩm và tên tài nguyên. Chỉ chuẩn hóa biểu thức sản phẩm thành ID/số lượng khi tên khớp đúng TAI NGUYEN, không tự bổ sung sản phẩm.

Runtime flora: SP001, SP002, SP004, SP005, SP006, SP007, SP009, SP011, SP014 (quả, hạt, củ, rau, nấm, thảo dược). Fauna: SP015, SP016, SP017, SP018, SP019, SP020, SP021, SP025, SP026, SP032, SP033, SP035, SP037, SP038, SP052. Từng seed có tập con theo địa hình, không bảo đảm có mọi loài. Các loài còn lại vẫn tra cứu trong catalog, không tuyên bố đã mô phỏng toàn bộ.

we-map-1 không có tile sa mạc, đầm lầy hoặc chuồng/làng vận hành, nên không tự tạo sinh cảnh đó/vật nuôi. Không thêm thuần dưỡng, bệnh động vật, xác thối, thiên tai hay thời tiết thực tế. Bản đồ nền/seed/asset cũ giữ nguyên. Lớp sinh thái được tạo riêng, không sửa terrain/resources arrays để đổi lịch sử thế giới.

## Phân bố

Bản đồ chia 64 vùng 32×32; thực vật chia chunk vẽ 16×16. R001/R061 đã có trên map được gắn SP001/SP014 tại đúng vị trí, giữ khả năng nhận biết nguồn cũ. Nguồn bổ sung dùng các ô phù hợp: củ/nấm/hạt dẻ trên đất rừng, hạt cỏ trên đồng cỏ, sung/rau/rễ ẩm ở bờ sông. Đây là phép ánh xạ kỹ thuật từ terrain hiện có, không phải khẳng định mọi tiểu sinh cảnh trong Frozen đã có bản đồ riêng.

Sinh cảnh vùng dựa loại ô trội; rừng ôn đới/cận lạnh dùng HAB08, rừng ẩm/rìa dùng HAB01/02, cỏ HAB03, bờ/nước HAB05, đồi đá HAB06. Các loài được đặt vào microhabitat hợp lệ trong vùng: cá/cá sấu ở nước, chim nước ở bờ, dê ở đồi, sóc/nai/hổ/chim rừng ở rừng; thỏ/sói/cáo/hươu trên đất rừng/cỏ. Không bơi/bay qua mọi ô; chim hiện di chuyển trên các ô sinh cảnh, chưa có độ cao bay.

Vị trí/trữ lượng ban đầu dùng seed+climate và thuật toán eco-v1, không phụ thuộc ID world. Blueprint tĩnh tái lập được, save chỉ giữ các thuộc tính biến đổi. Có tối đa 16384 nguồn (nguồn thực tế nhỏ hơn), 768 động vật, 64 vùng và 20 đặt chỗ. Mỗi vùng tối đa 12 động vật trên vùng đất, 8 ở vùng thiếu đất; khởi đầu khoảng 6–8 nếu có ô hợp lệ. Không lấy con số này từ Frozen: đây là chính sách giới hạn mô phỏng.

## Nguồn, khảo sát và thu hoạch

Mỗi nguồn lưu id ô, stock, readyTick và known; blueprint xác định loài/tọa độ/sức chứa/stock ban đầu. Stock ban đầu nằm trong khoảng sản lượng loài từ Frozen, sức chứa là đầu trên của khoảng. Các nguồn legacy đã thu giữ đúng remaining/readyTick, kể cả lần tái sinh cũ có trữ lượng khác lần đầu. Không làm đầy khi reload.

Nguồn mới phải khảo sát khi có cư dân trong phạm vi Manhattan 2 ô; nút xác nhận chỉ ghi nhận thông tin. Có thể đưa người đến gần bằng chức năng Dân cư. Động vật tự được nhận biết khi ở trong 2 ô của cư dân ở nhịp quan sát 0,1 ngày, hoặc khảo sát thủ công; trước đó chỉ thấy ký hiệu chưa xác định. Catalog vẫn là bách khoa đầy đủ, không có nghĩa mọi loài đã được phát hiện ngoài bản đồ.

Giao thu hoạch chỉ tạo job và đặt chỗ riêng theo jobId/plantId, không trừ stock/tăng kho ngay. Người đi/làm theo engine, dùng hiệu suất nghề V0.7, thu tối đa tải 3. Hoàn tất mới trừ stock và tạo các lô trên người, giữ TTL khi mang, nhập bãi khi thực sự trở về. Hủy trước có hàng giải phóng đặt chỗ, không tạo sản phẩm; đã mang hàng vẫn theo quy tắc V0.6 không được hủy để làm mất hàng.

Sau thu hết, deadline = tick thu + số ngày tái sinh loài. Chỉ phục hồi khi deadline đến, đúng mùa, vị trí không bị công trình chặn. Củ rừng/nấm/hạt/thảo dược có ngày riêng, không dùng chung 12 ngày. Nguồn còn một phần không tự bù đầy mỗi ngày. Chu kỳ kiểm là 180 tick (0,1 ngày), không dùng đồng hồ thực. Mùa suy từ lịch Frozen 120 ngày/4×30 ngày. Không có thời tiết mưa thực, nên điều kiện mùa mưa chỉ ánh xạ B02 S1/S3; không mô phỏng mưa ngẫu nhiên ngoài scope.

Nấm SP011 yêu cầu T100 Nhận biết cây ăn được. F003 cũng kiểm T100 trước chế biến; không tự coi mọi nấm là an toàn. Thảo dược không tính là thức ăn. Hạt/rau/mật/trứng chỉ tính ăn trực tiếp khi BAO QUAN & KHO ghi Có; thịt/cá sống và nước thô không cấp ăn/uống. Lô vẫn tách đúng tài nguyên; không tạo suất ăn giả cho mọi nguyên liệu.

## Động vật, thức ăn và sinh sản

Mỗi động vật có ID tăng đơn điệu, species/region, x/y, next/progress, hunger, bornTick/lastBirthTick và known. Số lượng theo vùng/loài suy trực tiếp từ các cá thể đang sống, không có một số dư khác có thể lệch. Không teleport khi di chuyển; mỗi cạnh có progress tick, chỉ đi vào ô hợp lệ, cạnh cardinal và chênh cao ≤1. Đặt nền đè lên vị trí hoặc cạnh động vật hiện tại bị chặn.

Tốc cơ sở kỹ thuật 90 tick/cạnh, chia hệ số di chuyển sinh cảnh Frozen. Động vật ở trong vùng sinh thái hiện tại; chưa có di cư liên vùng đầy đủ. Thú săn mồi hướng tới loài có cạnh thức ăn hợp lệ trong cùng vùng, không hướng tới loài tùy ý. Khi ăn phải có con mồi ở trong 2 ô và tiếp cận được; trừ đúng một cá thể theo trọng số Frozen. Mỗi cá thể không bị dùng hai lần trong cùng bước. Săn mồi tự nhiên không tự cộng thịt vào kho người chơi.

Sinh khối vùng là lượng cỏ/chồi/tảo/nguồn thức ăn nền được mô hình hóa, không phải tài nguyên kho mới. Sức chứa sinh khối từ diện tích đất phù hợp, hoặc nước/bờ ở vùng sông, tối đa 192. Thú ăn cỏ/ăn tạp/cá tiêu 1/ngày; thiếu thì tăng hunger. Mùa khác đông phục hồi tối đa khoảng 1/15 capacity mỗi ngày; đông không bù. Thú có liên kết săn mồi ăn con mồi thật theo lịch 10 ngày/cá thể khi có thể tiếp cận; không ăn sinh khối thay cho con mồi liên kết. Không tìm được thức ăn 30 ngày thì suy giảm; đây là định mức kỹ thuật cần playtest, không phải dữ liệu khoa học.

Sinh sản kiểm hàng ngày: đã đủ tuổi/cooldown tối thiểu từ regenerationDays, đúng mùa loài, không đói, vùng còn sinh khối và chỗ, RNG 25%; mỗi lần thêm một cá thể và lưu cooldown. Không sinh vượt capacity vùng hoặc cap 768; không tự hồi một loài đã cạn thành số lượng ban đầu. Không có vật nuôi sinh miễn phí.

## Săn của cư dân

Đã bỏ đường main-game tạo thịt từ một ô rừng bất kỳ. Người chơi phải chọn ID con mồi đang tồn tại/đã khảo sát. Vẫn kiểm J002, trại B002 hoàn thành/có nhân lực, công cụ đá độc quyền và tuyến đi. Thế giới hiện chỉ có T001/nền planned chưa tự được săn; các nhánh đủ điều kiện kiểm bằng fixtures, chờ dependencies thi công/đào tạo như roadmap.

Săn cơ bản hỗ trợ SP015/SP016/SP017, tổng sản phẩm ≤ tải 3, đúng sản phẩm từng loài trong Frozen. Các loài lớn/nguy hiểm chưa có logic săn nhóm/chiến đấu nên bị chặn rõ, không cắt bớt sản phẩm để giả vờ vừa tải.

Đặt chỗ con mồi khóa một mục tiêu cho một job. Con mồi hoàn tất cạnh đang di chuyển rồi đứng lại ở mục tiêu săn, không teleport; trong thời gian giữ chỗ không được sinh sản/được tính cho lần săn mồi khác. Chỉ job hoàn tất mới xóa cá thể và tạo lô. Đặt chỗ lưu committed/producedTick; không dùng lại sau reload. Đây là chính sách săn nền tảng, chưa có rượt đuổi/chiến đấu hoặc thương tích.

## Save, hiệu năng và nâng bản

Schema 7/we-sim-5 thêm ecology. Bản 2–6 giữ tick/RNG/seed/citizens/workforce/planning/survival, khởi tạo nội dung mới tại tick đã lưu, không chạy bù lịch sử. Job quả đang làm được gắn với nguồn legacy; cargo đã có không trừ lại stock. Đã lưu schema 7 thì đọc thẳng các stock/deadline/ID/knowledge/cursor, không reinitialize.

RNG sinh thái độc lập được lưu; thứ tự cập nhật cố định trong từng tick và không phụ thuộc số frame vẽ. x1/x2/x4/pause dùng cùng engine. Cập nhật nguồn mỗi 0,1 ngày, sinh học mỗi ngày, movement theo tick. Khi chưa có tick trọn vẹn không clone mô hình; thực vật không đổi dùng chung dữ liệu bất biến trong Worker, chỉ copy khi stock/knowledge thay đổi.

Renderer có chunk index, culling, stamps tái sử dụng theo loài/trạng thái, không tạo texture từng con. Zoom xa chỉ hiện một marker động vật/vùng và ẩn chi tiết cây, không thay số lượng mô phỏng. Sắp chiều sâu flora/fauna cùng cư dân/nền trong overlay. Chỉ duy trì animation khi có nhân vật/động vật di chuyển trong viewport. Asset dùng lúc hiện, không gửi hình vào Supabase.

Session gom save 30 giây/manual, full snapshot khi ecology đổi; API/SQL không nhận ecology qua delta chưa kiểm. Tăng cap save lên 2 MiB, payload typical seed kiểm khoảng 330 kB trước lịch sử/lô lớn; có metrics trong app. Retention 25–32 revisions và local backup/lease giữ nguyên. Snapshot lớn tăng traffic: chưa cam kết Supabase Free đủ cho mọi số world/giờ chơi, cần đo trên project thật. Không có ghi database từng tick.

007 giữ nguyên 001–006 và raw head/history. Validator cũ chỉ được gọi với projection tạm để kiểm trường cũ, payload thật giữ đúng R061/R059/job hunt. Không đổi tài nguyên đã lưu thành tài nguyên khác. Bảng species private có RLS và không cấp quyền đọc trực tiếp. API/Worker còn kiểm blueprint/terrain/food links; đây không phải server replay chống gian lận độc lập.

Sau ghi schema 7, không dùng V0.7 để ghi tiếp; dùng V0.8/hotfix tương thích. Restore lịch sử cũ vẫn qua V0.8 với xác nhận, rồi nâng đọc theo tick lịch sử. Hướng dẫn deploy và kiểm thực tế ở ../DEPLOY-VERCEL.md và VERIFICATION.md.
