# V0.10.0 — Seasons & Climate

## Phạm vi và dữ liệu chuẩn

Đọc nguyên Frozen: 4 mùa × 30 ngày, 7 vùng khí hậu, 15 biến cố, 11 dòng nhiệt/phơi nhiễm, 18 trang phục, CFG021–033 và định mức củi B129/B130/B131 (1/2/3 đơn vị/ngày). `scripts/climate.ts` tạo adapter, `--check` đối chiếu catalog. Không sửa workbook/catalog, các adapter cũ hoặc migrations 001–008.

Có thể dùng ngay thời tiết, nhiệt độ, cảnh báo, tác động lên cư dân/hoạt động/nguồn tự nhiên và đồ họa. Không tự cấp trang phục, củi hoặc công nghệ. Các nơi trú/sưởi/hong đồ phải hoàn thành; nghề/cơ sở/công nghệ/sản xuất vật liệu vẫn có dependency của V0.9. Thế giới mới chưa có chuỗi từ số 0 đến toàn bộ công trình/trang phục; bản này không sửa bootstrap Frozen. Các nhánh sưởi/hong/trang phục tiên tiến kiểm bằng fixtures đúng điều kiện ở module, chưa phải đã mở sẵn trong world.

Bản này không có bệnh/tử vong do khí hậu, cháy lan, phá hủy công trình, lũ tràn ô hoặc sạt lở chặn đường. Những phần đó cần mô hình chuyên biệt và định mức thiệt hại/phục hồi; không tự áp số tùy ý như thể Frozen đã có.

## Lịch, nhiệt độ và thời tiết

Giữ clock 1.800 tick/ngày (100 ms/tick, x1 = 180 giây/ngày), 120 ngày/năm, x1/x2/x4/pause. Mùa dùng đúng khoảng S1–S4. B02 hiện mùa mưa S1/S3, khô nóng S2, dịu hơn S4; không ép tuyết vào nhiệt đới. B05 lạnh dài, B06 có hiệu ứng cao độ, B07 chênh ngày/đêm lớn.

Frozen không có chuỗi nhiệt độ số, xác suất hoặc độ dài mỗi cơn thời tiết. Các giá trị **kỹ thuật** dưới đây ở `PROFILES`, không phải chỉnh dữ liệu Frozen:

| Vùng | Nhiệt nền S1 / S2 / S3 / S4 (°C) | Xác suất giáng thủy/ngày S1 / S2 / S3 / S4 (%) | Hạ nhiệt ban đêm |
| --- | --- | --- | --- |
| B01 | 16 / 28 / 14 / 1 | 55 / 25 / 60 / 45 | 6°C |
| B02 | 26 / 32 / 27 / 23 | 85 / 15 / 85 / 35 | 3°C |
| B03 | 22 / 36 / 24 / 17 | 12 / 4 / 15 / 8 | 10°C |
| B04 | 18 / 30 / 20 / 9 | 55 / 35 / 65 / 40 | 5°C |
| B05 | −9 / 5 / −4 / −22 | 40 / 35 / 45 / 55 | 6°C |
| B06 | 7 / 14 / 5 / −8 | 55 / 45 / 60 / 55 | 7°C |
| B07 | 8 / 21 / 10 / −7 | 15 / 8 / 18 / 12 | 12°C |

Mỗi kỳ thời tiết kết thúc ở đầu ngày kế tiếp; kỳ đầu nâng save giữa ngày chỉ dài phần còn lại. Ban đêm: 18:00–06:00. Ngày quang lệch 0..+3°C, có giáng thủy lệch −1..−4°C; B06 trừ 2°C/mức cao độ. Gió 0..3. Nhiệt giới hạn −50..60°C. Đây là mô hình game, không phải dự báo khí tượng thực.

Tuyết chỉ khi nhiệt nền có điều chỉnh <=0 và vùng phù hợp: B01 mùa đông; B05; B06 cao độ >=4 hoặc mùa đông; B07 mùa đông ít giáng thủy. B02/B03/B04 điển hình không sinh tuyết. Gió mạnh + tuyết có tên thời tiết blizzard; sự kiện H13 chỉ hoạt động sau cảnh báo/đủ điều kiện riêng. Không gắn trực tiếp xác suất tuyết cho mọi vùng chỉ vì lịch đang S4.

RNG khí hậu riêng từ seed/vùng/tick bắt đầu, lưu cursor đầy đủ. Weather giữ ID, kind, startsTick/endsTick, rain/wind/offset; lịch sử 32 kỳ. Không dùng `Math.random`, thời gian máy hoặc khung hình render để quyết định thời tiết.

## Thiên tai nền tảng

Các sự kiện lưu ID, loại, announced/start/end tick, phase và danh sách vùng. Thế giới hiện có một khí hậu chung, sự kiện khí hậu bao phủ 64 vùng; nhiệt tại cư dân vẫn khác theo vị trí/cao độ. Không giả lập bản đồ mưa vi mô hoặc dòng chảy thượng nguồn.

| Mã | Điều kiện/ảnh hưởng đang hỗ trợ |
| --- | --- |
| H01 Hạn hán | Khô ít nhất 18 ngày; khi sự kiện hoạt động, hiệu suất khai thác nước còn 80% xuống tối thiểu 30%, giảm 5 điểm %/ngày khô thêm; tăng thời gian phục hồi nguồn qua hệ số phát triển 0,5 |
| H03 Mưa liên tục | Ít nhất 5 ngày mưa lỏng; lô dễ hỏng ngoài nơi bảo quản già nhanh 1,5×, đi/làm còn 70% |
| H05 Rét đậm | Kỹ thuật: nhiệt trung tâm trung bình ngày <5°C trong ít nhất 2 ngày; cảnh báo rét kéo dài, nối hệ nhu cầu nhiệt/phơi nhiễm/đốt củi tại nơi sưởi. Không chồng thêm sát thương hoặc tự tăng định mức củi Frozen |
| H06 Nắng nóng cực đoan | Kỹ thuật: nhiệt trung tâm ban ngày >=32°C ít nhất 3 ngày; hoạt động chậm còn 75%, nước +1/người/ngày |
| H13 Bão tuyết | Tuyết + gió >=2 + nhiệt trung tâm <=−10°C ở vùng phù hợp; hoạt động/đi lại còn 40%, phơi nhiễm tính theo TC |
| H14 Sương giá/đóng băng | Kỹ thuật: trung bình ngày <=0°C ít nhất 2 ngày; khai thác nước mặt còn 50%, phát triển cây ×0,7; nguồn không bị xóa vĩnh viễn |
| H15 Mưa lạnh | Kỹ thuật: mưa lỏng và nhiệt trung tâm 0–10°C ít nhất 2 ngày; theo dõi chuỗi mưa lạnh, wetness/giảm hiệu lực trang phục theo hệ nhiệt, không tự tạo bệnh |

Khi chạm điều kiện: cảnh báo trước 2 ngày (CFG017, áp chung trong bản nền), dự kiến sự kiện kéo dài tối đa 3 ngày. Chỉ bắt đầu nếu điều kiện còn duy trì, có thể hủy hoặc kết thúc sớm khi phục hồi; không bắt buộc năm nào cũng xảy ra. Ngưỡng ngày H05/H06/H14/H15, thời lượng 3 ngày, các hệ số ngoài H01 là chính sách kỹ thuật chưa có số đầy đủ trong Frozen.

H02/H04/H11/H12 vẫn có catalog nhưng chưa phát sinh cơ chế ngập/cháy/phá hủy/sạt lở. H07/H08 bệnh để V0.11. H09/H10 dựa trên các hệ săn/sinh thái đã có, không tạo thêm sự kiện gây thương tích hoặc dịch bệnh trong bản khí hậu.

## Hoạt động, nguồn sống và nước

- Di chuyển cơ sở 12 ô/ngày; mưa/tuyết thường 85%, H03 70%, H13 40%, thiếu nhiệt >=4 điểm tối đa 75%. Dùng credit nguyên 1/100, lưu phần dư, không dịch chuyển tức thời. Renderer nội suy theo tốc độ thực.
- Công việc ngoài trời giảm theo H03/H06/H13 và phơi nhiễm; hái/săn nhân hệ số sinh học mùa đúng Frozen. Tập sự × khí hậu qua hai credit nối tiếp, chỉ áp lên đơn vị lao động thực nhận; đi/nghỉ không kiếm credit sản xuất. Thi công vẫn phải đủ BOM và thợ tại chỗ.
- Tái sinh không sớm hơn deadline tối thiểu từng loài. Hệ số phát triển <1 cộng thời gian chờ; >1 không rút xuống dưới minimum Frozen. Thức ăn sinh cảnh tái tạo theo hệ số phát triển; sinh sản vẫn cần mùa đúng loài, thức ăn và sức chứa. Nguồn theo “sau mưa/mùa mưa” dùng thời tiết thật; hái ngoài mùa bị chặn dù còn stock.
- Nhu cầu nước cơ bản 2 × hệ số mùa; H06 hoặc mặc quá ấm khi >=25°C thêm 1 (không cộng hai lần). Nhu cầu ăn cơ bản 1, thêm 20% chỉ với người thiếu nhiệt >=4 khi <5°C. Mức yêu cầu cao nhất đã gặp trong ngày được giữ theo từng người; ledger actual cấp vẫn tách biệt, không dùng một lượng hàng hai lần. Ngày mới reset nhu cầu/ledger đúng một lần.
- Tồn kho nước dùng được chỉ R067/R213 như trước. Hạn và băng giảm tốc độ lấy nước, không biến sông/nước mưa/nước tan băng thành đồ uống an toàn. Frozen chưa có tuyến thu nước mưa/đun băng được định lượng trong các công thức hiện hỗ trợ, nên không tự sinh nguồn nước mới.
- Lô dưới H03 tăng `ageTicks`, không làm mới `createdTick`. Nhịp 1 tick già thêm 1, tick chẵn già thêm 2 tạo 1,5×; hạn hiển thị là phần tuổi còn lại nếu thời tiết sau đó bình thường, có thể tới sớm hơn nếu tiếp tục bị mưa. Sau hết mưa vẫn giữ tuổi đã tăng; không “trẻ lại”. Kho B010 đủ điều kiện tiếp tục bảo quản đúng quy tắc cũ.

Các hệ số movement/work, quy tắc phát triển ngoài minimum và diễn giải hệ số sinh học thành tốc độ làm là kỹ thuật, không tự sửa sản lượng/định mức sản phẩm Frozen.

## Trang phục, trú ẩn và củi

Mỗi vật phẩm từ lô thật được tách một đơn vị tại điểm cư dân đang đứng, giữ ID cá thể riêng. Không lấy từ nguồn xa hoặc lô đã giữ cho chuyến. Sau lần tách, tháo/mặc lại dùng cùng item ID, độ bền và độ ướt; không đưa lại thành lô “đồ mới”. Đồ để bãi/kho B011 chiếm một đơn vị sức chứa. Có thể mặc rồi đi đến điểm khác và tháo, không teleport vật phẩm.

Một slot dùng một món. Bộ toàn thân không xếp chồng thân/đầu/tay/chân; slot Ngủ dùng chăn hoặc tấm lót, chỉ có tác dụng lúc nghỉ ban đêm. Đồ dưới 25% độ bền không tính bảo vệ. Hao mòn cơ sở 1 điểm/ngày sử dụng; ngủ chỉ hao khi thực sự dùng. Chưa có chức năng sửa đồ/vá vì số độ bền phục hồi mỗi vật tư chưa được định lượng; không tự phục hồi khi reload.

Tăng ướt cơ sở 0,2/ngày, giảm theo chống ướt từng món. Nhu cầu nhiệt lấy bảng TC01–06; TC07 gió lạnh +2, TC08 ướt cao (kỹ thuật >=50%) +3, TC09 ngủ ngoài trời ban đêm +2. Áo/chăn len mất tối đa 55% hiệu lực khi ướt hoàn toàn; các món khác dùng mức kỹ thuật 30%. Áo ngoài/bộ toàn thân quyết định giảm ướt thân người. Bảng TC02 vẫn có yêu cầu 1 điểm ở 15–19°C; CFG021=15°C dùng cho bật sưởi/gió lạnh, không âm thầm sửa một trong hai nguồn Frozen.

B006, B125, B130, B131 chỉ bảo vệ người đã tới điểm vào, có chỗ và được phân nhà/lệnh trú phù hợp. Đây là mô hình điểm vào đại diện phần trong công trình, không phải buff toàn bản đồ. Nhà ở dành chỗ cho người đã được cấp giường; lệnh trú không vượt sức chứa. B129 là điểm dịch vụ hong ngoài trời, không tự coi là mái trú mưa.

B130 có nhiên liệu giảm 4 điểm nhu cầu (TC10), B131 giảm 5 (TC11). Không có củi thì không hưởng sưởi. Củi phải đã giao tới công trình, không hút từ depot/kho xa. Khi có người dùng và cần sưởi/hong trong trời xấu, tiêu thụ đúng 1/2/3 đơn vị để chạy một kỳ 1.800 tick; lưu kỳ nhiên liệu để reload không đốt hai lần. Người rời chỗ không mang buff sưởi theo. Buffer củi kỹ thuật 3 ngày: B129=3, B130=6, B131=9 đơn vị, tách khỏi sức chứa người.

B129 cần đủ staff và điều kiện công nghệ. Trời ấm/quang có thể hong; khi mưa/rét cần kỳ củi hoạt động. Giảm wetness trang phục 0,35/ngày theo CFG030; độ ướt vẫn có thể tăng đồng thời nếu đứng ngoài trời mưa. Hong tự nhiên chậm và hỗ trợ mái trú dùng tốc độ kỹ thuật 0,05/0,20 mỗi ngày. Không coi B129 là điều trị bệnh hay chữa phơi nhiễm tức thời.

## Lưu, đồ họa và giới hạn kiểm tra

Schema 9/`we-sim-7`: thêm climate, weather/history, RNG, counters, hazards, 20 thermal/needs/credits, gear, refuges, fuel. Đọc schema 2–8; chỉ khởi tạo khí hậu tại tick bản cũ đã lưu, không chạy bù quá khứ. Giữ seed/we-map-1/20 ID/ecology/workforce/construction/lô và camera. Tạm dừng/rời app/mất mạng/lease vẫn theo nền V0.9; không có weather cron server tự chạy khi đóng game.

SQL 009 thêm private metadata/validator, giữ raw history cũ. Projection cho validator cũ chỉ chuẩn hóa tuổi/ledger để kiểm, **không sửa payload thật**; actual age, TTL, wetness, RNG giữ nguyên. Mọi climate change cần full snapshot theo autosave hiện có, không ghi Supabase mỗi tick. Cap payload 2 MiB và lịch sử giới hạn giữ như nền.

WeatherRenderer là Canvas screen-space riêng, 24 hạt chế độ nhẹ/84 bình thường, tắt/reduced-motion và pause được. Chất lượng đồ họa lưu cục bộ theo world trên thiết bị, không đổi RNG/kết quả; không thêm ảnh/texture vào Supabase. Culling/depth/chunk bản đồ giữ nguyên, lớp thời tiết không chặn pan/pinch/chọn ô.

Unit/SQL/Worker/session/HTTP/Canvas đã kiểm; xem RELEASE-CHECKS.md. Browser/Safari/iPhone/Android/GPU/cloud thực chưa nghiệm thu. Không coi fixture mở tech/cho vật tư là điều kiện đã có trong world, không cam kết 60fps/quota Free khi chưa đo thực tế. Tiếp theo V0.11 — Health & Pollution.
