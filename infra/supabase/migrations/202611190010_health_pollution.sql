-- World Evolution V0.11.0 — Health & Pollution
-- Run once after 001–009, before deploying V0.11.0. No reset required.
-- Old snapshots/history remain byte-for-byte intact.
begin;
create table private.health_catalog(id integer primary key check(id=1),spec jsonb not null);
alter table private.health_catalog enable row level security;
revoke all on private.health_catalog from public,anon,authenticated;
insert into private.health_catalog values(1,'{
  "version": 1,
  "diseases": [
    {
      "id": "D001",
      "name": "Nhiễm trùng vết thương",
      "era": "E0",
      "source": "Vết thương khi săn/xây",
      "transmission": "Vết thương nhiễm bẩn",
      "incubation": "2–5",
      "durationDays": 8,
      "risk": 0.35,
      "effects": "Giảm sức khỏe, mất ngày lao động",
      "basicCare": "Băng bó, nước sạch, nghỉ và chăm sóc sơ khai",
      "advancedCare": "Thầy thuốc, vệ sinh vết thương và vật tư y tế",
      "note": "Có thể nặng/tử vong nếu không được chăm sóc"
    },
    {
      "id": "D002",
      "name": "Tiêu chảy do nước bẩn",
      "era": "E0",
      "source": "Uống nước nhiễm bẩn",
      "transmission": "Nước/tiếp xúc",
      "incubation": "1–3",
      "durationDays": 6,
      "risk": 0.42,
      "effects": "Mất nước, giảm năng suất",
      "basicCare": "Đun nước, cung cấp nước sạch, nghỉ",
      "advancedCare": "Cấp nước tập trung, kiểm dịch và điều trị",
      "note": "Nước đun sôi không loại bỏ mọi chất độc hóa học"
    },
    {
      "id": "D003",
      "name": "Ngộ độc thực phẩm",
      "era": "E0",
      "source": "Ăn thực phẩm hư, nấm độc",
      "transmission": "Thực phẩm",
      "incubation": "0–2",
      "durationDays": 4,
      "risk": 0.55,
      "effects": "Ngừng làm việc, mất nước",
      "basicCare": "Ngừng thực phẩm nghi hỏng, nghỉ, uống nước an toàn",
      "advancedCare": "Kiểm tra nguồn thực phẩm, chăm sóc y tế",
      "note": "Không dùng nấm chưa được xác định an toàn"
    },
    {
      "id": "D004",
      "name": "Nhiễm lạnh",
      "era": "E0",
      "source": "Rét lâu, quần áo ướt",
      "transmission": "Không lây trực tiếp",
      "incubation": "1–2",
      "durationDays": 5,
      "risk": 0.38,
      "effects": "Mất nhiệt, giảm thể lực",
      "basicCare": "Nơi trú khô, sưởi và quần áo ấm",
      "advancedCare": "Nhà ở tốt, đồ bảo hộ",
      "note": "Không phải mọi trường hợp lạnh đều là nhiễm khuẩn"
    },
    {
      "id": "D005",
      "name": "Sốt hô hấp",
      "era": "E0",
      "source": "Tiếp xúc người bệnh",
      "transmission": "Hô hấp/tiếp xúc gần",
      "incubation": "2–5",
      "durationDays": 10,
      "risk": 0.25,
      "effects": "Mệt, sốt, giảm hiệu suất",
      "basicCare": "Nghỉ, nước sạch, giảm tiếp xúc, thông gió",
      "advancedCare": "Cách ly, y tế và vật tư phù hợp",
      "note": "Xác suất lây tùy mật độ và môi trường"
    },
    {
      "id": "D006",
      "name": "Mất nước và kiệt sức",
      "era": "E0",
      "source": "Làm nặng trong nắng nóng",
      "transmission": "Không lây",
      "incubation": "0–1",
      "durationDays": 4,
      "risk": 0.48,
      "effects": "Giảm tốc di chuyển, ngừng hoạt động",
      "basicCare": "Nghỉ, bóng mát, cung cấp nước uống an toàn",
      "advancedCare": "Cấp nước và quy trình an toàn lao động",
      "note": "Là trạng thái sức khỏe, không phải bệnh truyền nhiễm"
    },
    {
      "id": "D007",
      "name": "Bệnh lây từ động vật",
      "era": "E1",
      "source": "Tiếp xúc thú bệnh và chất thải",
      "transmission": "Tiếp xúc/động vật",
      "incubation": "3–8",
      "durationDays": 14,
      "risk": 0.22,
      "effects": "Giảm sức khỏe người và đàn thú",
      "basicCare": "Vệ sinh chuồng, giảm tiếp xúc với con bệnh",
      "advancedCare": "Thú y, kiểm dịch, sát khuẩn",
      "note": "Tỷ lệ phụ thuộc loài và tình trạng thú"
    },
    {
      "id": "D008",
      "name": "Dịch bệnh cộng đồng",
      "era": "E1",
      "source": "Lây lan trong nhà ở đông đúc",
      "transmission": "Hô hấp/nước/tiếp xúc",
      "incubation": "2–6",
      "durationDays": 18,
      "risk": 0.19,
      "effects": "Nhiều người mất khả năng làm việc",
      "basicCare": "Thông gió, nước sạch, tách chỗ nghỉ",
      "advancedCare": "Khu cách ly, chăm sóc chuyên môn",
      "note": "Bùng phát có điều kiện, không tạo tự động mỗi năm"
    },
    {
      "id": "D009",
      "name": "Bệnh đường ruột do vệ sinh",
      "era": "E1",
      "source": "Không xử lý phân và nước thải",
      "transmission": "Nước/tiếp xúc",
      "incubation": "2–5",
      "durationDays": 12,
      "risk": 0.3,
      "effects": "Suy giảm năng suất và dân số",
      "basicCare": "Khu vệ sinh, không đổ chất thải lên nguồn nước",
      "advancedCare": "Xử lý nước thải",
      "note": "Liên quan trực tiếp chỉ số ô nhiễm nước/đất"
    },
    {
      "id": "D010",
      "name": "Bệnh bụi và khói",
      "era": "E2",
      "source": "Khói lò, bụi mỏ và tro",
      "transmission": "Hít phải kéo dài",
      "incubation": "8–30",
      "durationDays": 40,
      "risk": 0.15,
      "effects": "Giảm năng lực thợ mỏ, luyện kim",
      "basicCare": "Giảm tiếp xúc, thông gió, rời vùng khói",
      "advancedCare": "Quan trắc, lọc khí công nghiệp",
      "note": "Tích lũy phơi nhiễm, không bùng ngẫu nhiên"
    },
    {
      "id": "D011",
      "name": "Tai nạn lao động công nghiệp",
      "era": "E6",
      "source": "Máy móc, thiếu bảo hộ",
      "transmission": "Không lây",
      "incubation": "0",
      "durationDays": 25,
      "risk": 0.18,
      "effects": "Thương tật, mất nhân lực",
      "basicCare": "Đào tạo, bảo trì, nghỉ ngơi",
      "advancedCare": "Bệnh viện, bảo hộ lao động",
      "note": "Rủi ro theo mức độ hoạt động và an toàn"
    },
    {
      "id": "D012",
      "name": "Ảnh hưởng độc chất môi trường",
      "era": "E6",
      "source": "Nước/đất bị ô nhiễm công nghiệp",
      "transmission": "Nước/không khí/đất",
      "incubation": "5–25",
      "durationDays": 35,
      "risk": 0.12,
      "effects": "Tổn hại sức khỏe kéo dài",
      "basicCare": "Di dời khỏi điểm nhiễm, ngừng khai thác nguồn bẩn",
      "advancedCare": "Giám sát, xử lý nước và chất thải nguy hại",
      "note": "Không thể chữa bằng thảo dược E0"
    }
  ],
  "pollutants": [
    {
      "id": "POLL001",
      "name": "Phân thải sinh hoạt",
      "era": "E0",
      "source": "Nhà ở, người dân, gia súc",
      "media": "Đất, nước",
      "pointsPerDay": 3,
      "spread": "Ô dân cư, 1–2 ô lân cận",
      "effects": "Tiêu chảy, môi trường bẩn",
      "prevention": "Vệ sinh trại, khu vệ sinh tách sông",
      "treatment": "Bãi xử lý rác, thoát nước",
      "rule": "Rủi ro bệnh theo mức ô nhiễm nước; mưa tăng lan truyền"
    },
    {
      "id": "POLL002",
      "name": "Rác hữu cơ phân hủy",
      "era": "E0",
      "source": "Bếp, thực phẩm hỏng",
      "media": "Đất, mùi",
      "pointsPerDay": 2.5,
      "spread": "Bãi rác và vùng kề",
      "effects": "Thú gặm nhấm, dịch bệnh",
      "prevention": "Thu gom và đặt bãi xa nhà ở",
      "treatment": "Ủ phân đúng điều kiện, bãi rác kiểm soát",
      "rule": "Thu gom không làm biến mất khối lượng rác"
    },
    {
      "id": "POLL003",
      "name": "Khói đốt lửa",
      "era": "E0",
      "source": "Bếp lửa, đốt than",
      "media": "Không khí",
      "pointsPerDay": 1.5,
      "spread": "Theo hướng gió",
      "effects": "Hô hấp, giảm thoải mái",
      "prevention": "Thông gió, đặt bếp xa lều ngủ",
      "treatment": "Lọc bụi, thiết kế lò hiệu quả",
      "rule": "Phát thải tăng theo nhiên liệu đốt thực tế"
    },
    {
      "id": "POLL004",
      "name": "Nước bẩn sinh hoạt",
      "era": "E0",
      "source": "Bếp, khu ở, sơ chế thực phẩm",
      "media": "Nước",
      "pointsPerDay": 2,
      "spread": "Theo dòng nước",
      "effects": "Ô nhiễm sông, bệnh đường ruột",
      "prevention": "Thoát nước ra nơi an toàn cách giếng",
      "treatment": "Xử lý nước thải",
      "rule": "Không tự biến thành nước sạch khi đi qua hố lắng"
    },
    {
      "id": "POLL005",
      "name": "Phân gia súc",
      "era": "E1",
      "source": "Chuồng trâu, ngựa, chăn nuôi",
      "media": "Đất, nước, mùi",
      "pointsPerDay": 3,
      "spread": "Từ chuồng và nước mưa",
      "effects": "Bệnh động vật, ô nhiễm nước",
      "prevention": "Dọn chuồng, thu gom định kỳ",
      "treatment": "Ủ phân đạt quy trình",
      "rule": "Bãi ủ quá tải tăng phát thải và nước rỉ"
    },
    {
      "id": "POLL006",
      "name": "Xói mòn đất",
      "era": "E1",
      "source": "Phá rừng, canh tác quá mức",
      "media": "Đất, nước",
      "pointsPerDay": 1.5,
      "spread": "Sườn dốc và lưu vực",
      "effects": "Mất độ phì, bùn sông",
      "prevention": "Giữ cây rừng, canh tác luân phiên",
      "treatment": "Trồng phục hồi, thủy lợi",
      "rule": "Không phải rác có thể xóa ngay bằng vệ sinh"
    },
    {
      "id": "POLL007",
      "name": "Khói và bụi luyện kim",
      "era": "E2",
      "source": "Lò luyện đồng/sắt, mỏ",
      "media": "Không khí, đất",
      "pointsPerDay": 5,
      "spread": "Theo gió và khoảng cách",
      "effects": "Ảnh hưởng hô hấp, giảm sức khỏe",
      "prevention": "Đặt lò xa dân cư, thông gió",
      "treatment": "Quan trắc và lọc khí",
      "rule": "Tăng theo sản lượng, chỉ số làm việc thực tế"
    },
    {
      "id": "POLL008",
      "name": "Nước rỉ từ khai mỏ",
      "era": "E2",
      "source": "Mỏ quặng, bãi thải",
      "media": "Nước, đất",
      "pointsPerDay": 4.5,
      "spread": "Theo dòng nước",
      "effects": "Nước không phù hợp cho sinh hoạt",
      "prevention": "Bố trí mỏ xa đầu nguồn, ngăn dòng bẩn",
      "treatment": "Xử lý chất thải công nghiệp",
      "rule": "Không thể khử kim loại nặng chỉ bằng đun sôi"
    },
    {
      "id": "POLL009",
      "name": "Rác đô thị",
      "era": "E3",
      "source": "Chợ, nhà ở, vận tải",
      "media": "Đất, nước",
      "pointsPerDay": 3,
      "spread": "Tập trung khu dân cư",
      "effects": "Dịch bệnh, suy giảm chất lượng sống",
      "prevention": "Thu gom theo tuyến",
      "treatment": "Bãi xử lý rác",
      "rule": "Cần nhân sự và tải trọng vận chuyển"
    },
    {
      "id": "POLL010",
      "name": "Ô nhiễm công nghiệp",
      "era": "E6",
      "source": "Nhà máy, lọc dầu",
      "media": "Không khí, nước, đất",
      "pointsPerDay": 7,
      "spread": "Nhiều ô phụ thuộc gió/dòng chảy",
      "effects": "Ngộ độc, giảm năng suất",
      "prevention": "Giảm công suất, dịch chuyển dân",
      "treatment": "Quan trắc, lọc khí, xử lý nước",
      "rule": "Công trình tắt không phát thải sản xuất; tồn lưu vẫn có"
    },
    {
      "id": "POLL011",
      "name": "Nước thải công nghiệp",
      "era": "E6",
      "source": "Nhà máy hóa chất, cơ khí",
      "media": "Nước",
      "pointsPerDay": 7.5,
      "spread": "Theo sông và địa hình",
      "effects": "Nguy cơ cao cho nguồn nước và cá",
      "prevention": "Chặn xả thẳng, chứa tạm",
      "treatment": "Nhà máy xử lý nước thải",
      "rule": "Cần xử lý đủ công suất, có bùn thải"
    },
    {
      "id": "POLL012",
      "name": "Bụi mịn đô thị",
      "era": "E7",
      "source": "Nhiệt điện, xe và nhà máy",
      "media": "Không khí",
      "pointsPerDay": 4.5,
      "spread": "Theo hướng gió",
      "effects": "Ảnh hưởng sức khỏe cộng đồng",
      "prevention": "Giảm nguồn đốt, quy hoạch vùng ở",
      "treatment": "Lọc bụi, năng lượng sạch",
      "rule": "Không tự biến mất sau 1 ngày"
    },
    {
      "id": "POLL013",
      "name": "Chất thải y tế",
      "era": "E6",
      "source": "Bệnh viện, khu điều trị",
      "media": "Đất, nước",
      "pointsPerDay": 5,
      "spread": "Tại điểm tập kết",
      "effects": "Nguy cơ phơi nhiễm",
      "prevention": "Tách riêng, không trộn rác thường",
      "treatment": "Xử lý chất thải nguy hại",
      "rule": "Không đưa vào chuỗi ủ phân"
    },
    {
      "id": "POLL014",
      "name": "Rác điện tử và hóa chất",
      "era": "E8",
      "source": "Máy tính, điện tử, pin",
      "media": "Đất, nước",
      "pointsPerDay": 6,
      "spread": "Nơi tập kết và thấm đất",
      "effects": "Ô nhiễm dài hạn",
      "prevention": "Thu gom riêng",
      "treatment": "Nhà máy tái chế + xử lý nguy hại",
      "rule": "Tái chế tạo ra phụ phẩm cần xử lý"
    }
  ],
  "emissions": [
    {
      "id": "EMS001",
      "type": "Dân số",
      "buildingId": null,
      "pollutant": "POLL001",
      "name": "Phân thải sinh hoạt",
      "points": 0.2,
      "basis": "theo người/ngày",
      "treatment": "B137",
      "source": "Nhà ở, sông",
      "condition": "Không có khu vệ sinh hoặc khu vệ sinh quá tải"
    },
    {
      "id": "EMS002",
      "type": "Dân số",
      "buildingId": null,
      "pollutant": "POLL002",
      "name": "Rác hữu cơ phân hủy",
      "points": 0.25,
      "basis": "theo người/ngày",
      "treatment": "B138",
      "source": "Nhà ở, bếp",
      "condition": "Thực phẩm hư tăng rác hữu cơ"
    },
    {
      "id": "EMS003",
      "type": "Công trình",
      "buildingId": "B007",
      "pollutant": "POLL003",
      "name": "Khói đốt lửa",
      "points": 1.5,
      "basis": "theo 1 củi/ngày",
      "treatment": "B161",
      "source": "Không khí",
      "condition": "Bếp có lửa đang đốt"
    },
    {
      "id": "EMS004",
      "type": "Công trình",
      "buildingId": "B017",
      "pollutant": "POLL005",
      "name": "Phân gia súc",
      "points": 2,
      "basis": "theo 1 chuồng/ngày",
      "treatment": "B149",
      "source": "Chuồng chăn nuôi",
      "condition": "Chuồng có vật nuôi; mật độ ảnh hưởng"
    },
    {
      "id": "EMS005",
      "type": "Công trình",
      "buildingId": "B144",
      "pollutant": "POLL005",
      "name": "Phân gia súc",
      "points": 2.5,
      "basis": "theo 1 chuồng/ngày",
      "treatment": "B149",
      "source": "Chuồng trâu kéo",
      "condition": "Chuồng có trâu đang ở"
    },
    {
      "id": "EMS006",
      "type": "Công trình",
      "buildingId": "B145",
      "pollutant": "POLL005",
      "name": "Phân gia súc",
      "points": 2.2,
      "basis": "theo 1 chuồng/ngày",
      "treatment": "B149",
      "source": "Chuồng ngựa",
      "condition": "Chuồng có ngựa đang ở"
    },
    {
      "id": "EMS007",
      "type": "Công trình",
      "buildingId": "B035",
      "pollutant": "POLL007",
      "name": "Khói và bụi luyện kim",
      "points": 4.5,
      "basis": "theo 1 ca luyện",
      "treatment": "B161",
      "source": "Lò luyện đồng",
      "condition": "Cần lò đang luyện, có nhiên liệu"
    },
    {
      "id": "EMS008",
      "type": "Công trình",
      "buildingId": "B041",
      "pollutant": "POLL007",
      "name": "Khói và bụi luyện kim",
      "points": 5.5,
      "basis": "theo 1 ca luyện",
      "treatment": "B161",
      "source": "Lò luyện sắt",
      "condition": "Cần lò đang luyện, có nhiên liệu"
    },
    {
      "id": "EMS009",
      "type": "Công trình",
      "buildingId": "B070",
      "pollutant": "POLL010",
      "name": "Ô nhiễm công nghiệp",
      "points": 7,
      "basis": "theo 1 ca luyện",
      "treatment": "B161",
      "source": "Nhà máy thép",
      "condition": "Theo công suất và nhiên liệu"
    },
    {
      "id": "EMS010",
      "type": "Công trình",
      "buildingId": "B074",
      "pollutant": "POLL011",
      "name": "Nước thải công nghiệp",
      "points": 7,
      "basis": "theo 1 ca lọc",
      "treatment": "B159",
      "source": "Nhà máy lọc dầu",
      "condition": "Theo khối lượng dầu lọc"
    },
    {
      "id": "EMS011",
      "type": "Công trình",
      "buildingId": "B081",
      "pollutant": "POLL012",
      "name": "Bụi mịn đô thị",
      "points": 6,
      "basis": "theo 1 ca phát điện",
      "treatment": "B161",
      "source": "Nhà máy nhiệt điện",
      "condition": "Không phát nếu nhà máy ngừng"
    },
    {
      "id": "EMS012",
      "type": "Công trình",
      "buildingId": "B079",
      "pollutant": "POLL013",
      "name": "Chất thải y tế",
      "points": 3,
      "basis": "theo 10 lượt chăm sóc",
      "treatment": "B165",
      "source": "Bệnh viện",
      "condition": "Rác y tế phải phân loại"
    },
    {
      "id": "EMS013",
      "type": "Công trình",
      "buildingId": "B099",
      "pollutant": "POLL014",
      "name": "Rác điện tử và hóa chất",
      "points": 4,
      "basis": "theo 1 ca sản xuất",
      "treatment": "B165",
      "source": "Nhà máy máy tính",
      "condition": "Rác điện tử chưa xử lý"
    },
    {
      "id": "EMS014",
      "type": "Công trình",
      "buildingId": "B138",
      "pollutant": "POLL002",
      "name": "Rác hữu cơ phân hủy",
      "points": 1.5,
      "basis": "theo mức đầy bãi",
      "treatment": "B153",
      "source": "Bãi thu gom rác",
      "condition": "Bãi đầy hoặc quá hạn xử lý"
    },
    {
      "id": "EMS015",
      "type": "Công trình",
      "buildingId": "B149",
      "pollutant": "POLL005",
      "name": "Phân gia súc",
      "points": 1,
      "basis": "theo 1 ca ủ",
      "treatment": "B153",
      "source": "Bãi ủ phân",
      "condition": "Ủ sai gây mùi và nước rỉ"
    },
    {
      "id": "EMS016",
      "type": "Công trình",
      "buildingId": "B160",
      "pollutant": "POLL011",
      "name": "Nước thải công nghiệp",
      "points": 2,
      "basis": "theo mức đầy",
      "treatment": "B159",
      "source": "Bãi rác kiểm soát",
      "condition": "Bãi đầy, thời tiết mưa lớn tăng rỉ"
    },
    {
      "id": "EMS017",
      "type": "Công trình",
      "buildingId": "B068",
      "pollutant": "POLL008",
      "name": "Nước rỉ từ khai mỏ",
      "points": 3,
      "basis": "theo 1 ca khai thác",
      "treatment": "B159",
      "source": "Mỏ than",
      "condition": "Bụi và dòng chảy phụ thuộc địa hình"
    },
    {
      "id": "EMS018",
      "type": "Công trình",
      "buildingId": "B090",
      "pollutant": "POLL011",
      "name": "Nước thải công nghiệp",
      "points": 0.5,
      "basis": "theo 1 ca xử lý",
      "treatment": "B165",
      "source": "Trạm xử lý nước thải",
      "condition": "Sản sinh phụ phẩm, không tự biến mất"
    }
  ],
  "facilities": [
    {
      "id": "B012",
      "name": "Lều thảo dược",
      "era": "E0",
      "technologyId": "T005",
      "technology": "Thảo dược",
      "staffing": [
        {
          "roleId": "J011",
          "required": 1
        }
      ],
      "inputs": "Thảo dược, Nước thô",
      "outputs": "—",
      "power": 0,
      "capacity": null
    },
    {
      "id": "B079",
      "name": "Bệnh viện",
      "era": "E6",
      "technologyId": "T061",
      "technology": "Y tế công nghiệp",
      "staffing": [
        {
          "roleId": "J056",
          "required": 3
        }
      ],
      "inputs": "Nước sạch, Thảo dược",
      "outputs": "—",
      "power": 0,
      "capacity": null
    },
    {
      "id": "B090",
      "name": "Trạm xử lý nước thải",
      "era": "E7",
      "technologyId": "T071",
      "technology": "Xử lý nước thải",
      "staffing": [
        {
          "roleId": "J062",
          "required": 2
        }
      ],
      "inputs": "Nước thải, Điện năng",
      "outputs": "Nước sạch",
      "power": 20,
      "capacity": null
    },
    {
      "id": "B128",
      "name": "Lều khâu trang phục",
      "era": "E0",
      "technologyId": "T106",
      "technology": "Khâu trang phục thô sơ",
      "staffing": [
        {
          "roleId": "J076",
          "required": 2
        }
      ],
      "inputs": "Da sơ chế; Lông thú; Gân thú; Sợi thực vật",
      "outputs": "Trang phục da; Chăn da; Tấm lót ngủ",
      "power": 0,
      "capacity": 4
    },
    {
      "id": "B136",
      "name": "Lều nghỉ dưỡng",
      "era": "E0",
      "technologyId": "T115",
      "technology": "Chăm sóc người bệnh sơ khai",
      "staffing": [
        {
          "roleId": "J081",
          "required": 1
        },
        {
          "roleId": "J011",
          "required": 1
        }
      ],
      "inputs": "Nước sạch, Suất ăn, Thảo dược",
      "outputs": "Chăm sóc, thời gian hồi phục",
      "power": 0,
      "capacity": 4
    },
    {
      "id": "B137",
      "name": "Khu vệ sinh đơn sơ",
      "era": "E0",
      "technologyId": "T116",
      "technology": "Vệ sinh trại nguyên thủy",
      "staffing": [
        {
          "roleId": "J082",
          "required": 1
        }
      ],
      "inputs": "Dụng cụ dọn vệ sinh",
      "outputs": "Giảm ô nhiễm phân thải, rủi ro tiêu chảy",
      "power": 0,
      "capacity": 20
    },
    {
      "id": "B138",
      "name": "Bãi thu gom rác",
      "era": "E0",
      "technologyId": "T116",
      "technology": "Vệ sinh trại nguyên thủy",
      "staffing": [
        {
          "roleId": "J082",
          "required": 1
        }
      ],
      "inputs": "Chất thải sinh hoạt, Tro và bụi bếp",
      "outputs": "Điểm tập kết rác, giảm bẩn khu ở",
      "power": 0,
      "capacity": 70
    },
    {
      "id": "B149",
      "name": "Bãi ủ phân",
      "era": "E1",
      "technologyId": "T125",
      "technology": "Ủ phân và cải tạo đất",
      "staffing": [
        {
          "roleId": "J090",
          "required": 1
        }
      ],
      "inputs": "Phân hữu cơ, Rác hữu cơ, Chất thải sinh hoạt",
      "outputs": "Phân chuồng ủ hoai",
      "power": 0,
      "capacity": 120
    },
    {
      "id": "B153",
      "name": "Bãi xử lý rác",
      "era": "E3",
      "technologyId": "T130",
      "technology": "Quản lý rác đô thị",
      "staffing": [
        {
          "roleId": "J090",
          "required": 2
        }
      ],
      "inputs": "Chất thải sinh hoạt, Rác hữu cơ",
      "outputs": "Thu gom và xử lý chất thải",
      "power": 0,
      "capacity": 300
    },
    {
      "id": "B159",
      "name": "Nhà máy xử lý nước thải công nghiệp",
      "era": "E6",
      "technologyId": "T132",
      "technology": "Xử lý chất thải công nghiệp",
      "staffing": [
        {
          "roleId": "J092",
          "required": 2
        }
      ],
      "inputs": "Nước thải, Vật tư xử lý nước thải",
      "outputs": "Nước tái sử dụng kỹ thuật, Bùn thải",
      "power": 0,
      "capacity": 80
    },
    {
      "id": "B160",
      "name": "Bãi rác kiểm soát",
      "era": "E6",
      "technologyId": "T132",
      "technology": "Xử lý chất thải công nghiệp",
      "staffing": [
        {
          "roleId": "J090",
          "required": 2
        }
      ],
      "inputs": "Rác công nghiệp, Chất thải sinh hoạt",
      "outputs": "Giảm rác tràn lan",
      "power": 0,
      "capacity": 1500
    },
    {
      "id": "B161",
      "name": "Trạm lọc bụi công nghiệp",
      "era": "E7",
      "technologyId": "T133",
      "technology": "Lọc không khí công nghiệp",
      "staffing": [
        {
          "roleId": "J093",
          "required": 1
        }
      ],
      "inputs": "Điện năng, Vật tư lọc khí",
      "outputs": "Giảm bụi ở vùng phục vụ",
      "power": 12,
      "capacity": 100
    },
    {
      "id": "B165",
      "name": "Khu xử lý chất thải nguy hại",
      "era": "E8",
      "technologyId": "T137",
      "technology": "Xử lý rác nguy hại",
      "staffing": [
        {
          "roleId": "J070",
          "required": 2
        }
      ],
      "inputs": "Chất thải y tế, Rác điện tử, Vật tư xử lý nước thải",
      "outputs": "Giảm rò rỉ ô nhiễm độc hại",
      "power": 20,
      "capacity": 120
    }
  ],
  "recipes": [
    {
      "row": [
        "F085",
        "E0",
        "Đồ đá sơ khai",
        "Lều thảo dược",
        "Thảo dược:1; Nước sạch:1; Củi:1",
        "Nước sắc thảo mộc",
        2,
        0,
        "Chỉ hỗ trợ nước và nghỉ dưỡng; không tự động khỏi bệnh"
      ],
      "ingredients": [
        [
          "FI0180",
          "F085",
          "B012",
          "Lều thảo dược",
          "R061",
          "Thảo dược",
          1,
          "Vật tư tiêu hao",
          "E0"
        ],
        [
          "FI0181",
          "F085",
          "B012",
          "Lều thảo dược",
          "R067",
          "Nước sạch",
          1,
          "Vật tư tiêu hao",
          "E0"
        ],
        [
          "FI0182",
          "F085",
          "B012",
          "Lều thảo dược",
          "R167",
          "Củi",
          1,
          "Vật tư tiêu hao",
          "E0"
        ]
      ]
    },
    {
      "row": [
        "F086",
        "E0",
        "Đồ đá sơ khai",
        "Lều khâu trang phục",
        "Da thú:1; Sợi thực vật:2",
        "Băng bó thô sơ",
        3,
        0,
        "Giảm hở vết thương; cần thao tác chăm sóc"
      ],
      "ingredients": [
        [
          "FI0183",
          "F086",
          "B128",
          "Lều khâu trang phục",
          "R058",
          "Da thú",
          1,
          "Vật tư tiêu hao",
          "E0"
        ],
        [
          "FI0184",
          "F086",
          "B128",
          "Lều khâu trang phục",
          "R050",
          "Sợi thực vật",
          2,
          "Vật tư tiêu hao",
          "E0"
        ]
      ]
    },
    {
      "row": [
        "F094",
        "E1",
        "Đá mới – Nông nghiệp",
        "Bãi ủ phân",
        "Phân hữu cơ:3; Rác hữu cơ:2",
        "Phân chuồng ủ hoai",
        4,
        0,
        "Cần thời gian ủ; dùng trước ủ có nguy cơ mầm bệnh"
      ],
      "ingredients": [
        [
          "FI0200",
          "F094",
          "B149",
          "Bãi ủ phân",
          "R065",
          "Phân hữu cơ",
          3,
          "Vật tư tiêu hao",
          "E1"
        ],
        [
          "FI0201",
          "F094",
          "B149",
          "Bãi ủ phân",
          "R180",
          "Rác hữu cơ",
          2,
          "Vật tư tiêu hao",
          "E1"
        ]
      ]
    },
    {
      "row": [
        "F095",
        "E1",
        "Đá mới – Nông nghiệp",
        "Xưởng dệt",
        "Vải dệt:1",
        "Băng vải sạch",
        2,
        0,
        "Cần điều kiện sạch để dùng chăm sóc"
      ],
      "ingredients": [
        [
          "FI0202",
          "F095",
          "B027",
          "Xưởng dệt",
          "R114",
          "Vải dệt",
          1,
          "Vật tư tiêu hao",
          "E1"
        ]
      ]
    },
    {
      "row": [
        "F099",
        "E6",
        "Công nghiệp",
        "Phòng hóa học",
        "Thảo dược:2; Nước sạch:2",
        "Thuốc hỗ trợ y tế",
        2,
        0,
        "Chỉ được áp dụng khi có công nghệ và nhân lực y tế"
      ],
      "ingredients": [
        [
          "FI0209",
          "F099",
          "B062",
          "Phòng hóa học",
          "R061",
          "Thảo dược",
          2,
          "Vật tư tiêu hao",
          "E6"
        ],
        [
          "FI0210",
          "F099",
          "B062",
          "Phòng hóa học",
          "R067",
          "Nước sạch",
          2,
          "Vật tư tiêu hao",
          "E6"
        ]
      ]
    }
  ],
  "settings": {
    "waterWarning": 40,
    "airWarning": 40,
    "wastePerPerson": 0.25,
    "collectionPerDay": 4,
    "maxPollution": 100
  },
  "resources": [
    {
      "id": "R061",
      "name": "Thảo dược",
      "ttlDays": "Không áp dụng"
    },
    {
      "id": "R067",
      "name": "Nước sạch",
      "ttlDays": "Không áp dụng"
    },
    {
      "id": "R167",
      "name": "Củi",
      "ttlDays": "Không áp dụng"
    },
    {
      "id": "R208",
      "name": "Chất thải sinh hoạt",
      "ttlDays": null
    },
    {
      "id": "R209",
      "name": "Nước sinh hoạt bẩn",
      "ttlDays": null
    },
    {
      "id": "R210",
      "name": "Tro và bụi bếp",
      "ttlDays": null
    },
    {
      "id": "R211",
      "name": "Băng bó thô sơ",
      "ttlDays": null
    },
    {
      "id": "R212",
      "name": "Nước sắc thảo mộc",
      "ttlDays": 3
    },
    {
      "id": "R213",
      "name": "Nước uống đun sôi",
      "ttlDays": 2
    },
    {
      "id": "R214",
      "name": "Dụng cụ dọn vệ sinh",
      "ttlDays": null
    },
    {
      "id": "R221",
      "name": "Vật liệu vệ sinh đơn sơ",
      "ttlDays": null
    },
    {
      "id": "R223",
      "name": "Vật tư xử lý nước thải",
      "ttlDays": null
    },
    {
      "id": "R224",
      "name": "Vật tư lọc khí",
      "ttlDays": null
    },
    {
      "id": "R225",
      "name": "Chất thải y tế",
      "ttlDays": null
    }
  ]
}
'::jsonb);

alter function private.sim_validate(jsonb,public.worlds) rename to sim_validate_v9;
create function private.health_shape(v jsonb,keys text[]) returns boolean language sql immutable set search_path='' as $$
 select coalesce(jsonb_typeof(v)='object' and v ?& keys and (select count(*) from jsonb_object_keys(v))=cardinality(keys) and not exists(select 1 from jsonb_each(v) q(key,value) where q.value='null'::jsonb and q.key not in ('sourceId','patientId','origin','recoveredTick')),false)
$$;
create function private.health_int(v jsonb,lo numeric,hi numeric) returns boolean language sql immutable set search_path='' as $$ select coalesce(private.climate_int(v,lo,hi),false) $$;
create function private.sim_validate(s jsonb,w public.worlds) returns void language plpgsql set search_path='' as $$
declare h jsonb;p jsonb;q jsonb;d jsonb;t jsonb;spec jsonb;tick bigint;started bigint;n text;ids text[];seen text[];used_ids text[]:=array[]::text[];mass numeric:=0;inc text[];base jsonb;
begin
 if private.health_int(s->'schemaVersion',2,9) then perform private.sim_validate_v9(s,w);return;end if;
 if s->'schemaVersion' is distinct from '10'::jsonb or s->>'engineVersion' is distinct from 'we-sim-8' or not(s ? 'health') or (select count(*) from jsonb_object_keys(s))<>25 then raise exception 'INVALID_SAVE' using errcode='22023';end if;
 h:=s->'health';tick:=(s->>'tick')::bigint;select hc.spec into spec from private.health_catalog hc where id=1;
 if not private.health_shape(h,array['version','startedTick','rngState','sequence','people','cells','waste','tasks','water','waterPlans','generated','processed','legacyWaste']) or h->'version' is distinct from '1'::jsonb then raise exception 'INVALID_HEALTH' using errcode='22023';end if;
 foreach n in array array['startedTick','sequence','generated','processed'] loop if not private.health_int(h->n,0,1e12) then raise exception 'INVALID_HEALTH' using errcode='22023';end if;end loop;
 if h->'processed' is distinct from '0'::jsonb then raise exception 'INVALID_WASTE_MASS' using errcode='22023';end if;started:=(h->>'startedTick')::bigint;
 if started>tick or not private.health_int(h->'rngState',1,4294967295) or jsonb_typeof(h->'legacyWaste') is distinct from 'number' or (h->>'legacyWaste')::numeric not between 0 and 1e12 then raise exception 'INVALID_HEALTH' using errcode='22023';end if;
 foreach n in array array['people','cells','waste','tasks','water','waterPlans'] loop if jsonb_typeof(h->n) is distinct from 'array' then raise exception 'INVALID_HEALTH' using errcode='22023';end if;end loop;
 if jsonb_array_length(h->'people')<>20 or jsonb_array_length(h->'cells')>4096 or jsonb_array_length(h->'waste')>4096 or jsonb_array_length(h->'tasks')>20 or jsonb_array_length(h->'water')>1024 or jsonb_array_length(h->'waterPlans')>20 then raise exception 'INVALID_HEALTH' using errcode='22023';end if;
 select array_agg(q.value->>'id') into ids from jsonb_array_elements(s->'citizens') q(value);seen:=array[]::text[];
 for p in select q.value from jsonb_array_elements(h->'people') q(value) loop
  if not private.health_shape(p,array['citizenId','health','rest','moveCredit','workCredit','exposure','illnesses','careTicks']) or not coalesce(p->>'citizenId'=any(ids),false) or p->>'citizenId'=any(seen) or jsonb_typeof(p->'rest') is distinct from 'boolean' or not private.health_int(p->'health',0,10000) or not private.health_int(p->'moveCredit',0,99) or not private.health_int(p->'workCredit',0,99) or not private.health_int(p->'careTicks',0,tick-started) then raise exception 'INVALID_PATIENT' using errcode='22023';end if;seen:=array_append(seen,p->>'citizenId');
  if not private.health_shape(p->'exposure',array['cold','heat','dirty','contact','hunger','thirst','wound']) then raise exception 'INVALID_EXPOSURE' using errcode='22023';end if;
  foreach n in array array['cold','heat','dirty','contact','hunger','thirst','wound'] loop if not private.health_int(p->'exposure'->n,0,9000) then raise exception 'INVALID_EXPOSURE' using errcode='22023';end if;end loop;
  if jsonb_typeof(p->'illnesses') is distinct from 'array' or jsonb_array_length(p->'illnesses')>3 or (select count(distinct q.value->>'diseaseId') from jsonb_array_elements(p->'illnesses') q(value))<>jsonb_array_length(p->'illnesses') then raise exception 'INVALID_ILLNESS' using errcode='22023';end if;
  for d in select q.value from jsonb_array_elements(p->'illnesses') q(value) loop
   select q.value into t from jsonb_array_elements(spec->'diseases') q(value) where q.value->>'id'=d->>'diseaseId';
   if t is null or t->>'era'<>'E0' or not private.health_shape(d,array['diseaseId','exposedTick','onsetTick','endTick','recoveredTick']) or not private.health_int(d->'exposedTick',started,tick) or not private.health_int(d->'onsetTick',0,1e12) or not private.health_int(d->'endTick',0,1e12) then raise exception 'INVALID_ILLNESS' using errcode='22023';end if;
   inc:=regexp_match(t->>'incubation','([0-9]+)(?:[^0-9]+([0-9]+))?');
   if (d->>'onsetTick')::bigint not between (d->>'exposedTick')::bigint+inc[1]::integer*1800 and (d->>'exposedTick')::bigint+coalesce(inc[2],inc[1])::integer*1800 or (d->>'endTick')::bigint<>(d->>'onsetTick')::bigint+(t->>'durationDays')::integer*1800 or d->'recoveredTick'<>'null'::jsonb and not private.health_int(d->'recoveredTick',(d->>'endTick')::bigint,tick) then raise exception 'INVALID_ILLNESS' using errcode='22023';end if;
  end loop;
 end loop;
 seen:=array[]::text[];
 for p in select q.value from jsonb_array_elements(h->'cells') q(value) loop
  if not private.health_shape(p,array['cell','air','water','soil','chemical']) or not private.health_int(p->'cell',0,65535) or p->>'cell'=any(seen) then raise exception 'INVALID_POLLUTION' using errcode='22023';end if;seen:=array_append(seen,p->>'cell');
  foreach n in array array['air','water','soil','chemical'] loop if not private.health_int(p->n,0,10000) then raise exception 'INVALID_POLLUTION' using errcode='22023';end if;end loop;
 end loop;
 seen:=array[]::text[];
 for p in select q.value from jsonb_array_elements(h->'waste') q(value) loop
  if not private.health_shape(p,array['id','cell','resource','amount','createdTick','location']) or p->>'id' is null or length(p->>'id') not between 1 and 150 or p->>'id'=any(seen) or p->>'resource' not in ('R208','R210','R225') or not private.health_int(p->'cell',0,65535) or not private.health_int(p->'amount',0,100000000) or not private.health_int(p->'createdTick',0,tick) or jsonb_typeof(p->'location') is distinct from 'string' then raise exception 'INVALID_WASTE' using errcode='22023';end if;
  if p->>'location'<>'ground' and not exists(select 1 from jsonb_array_elements(s->'construction'->'sites') q(value) where 'site:'||(q.value->>'id')=p->>'location' and q.value->>'status'='complete' and (q.value->'entrance'->>'y')::integer*256+(q.value->'entrance'->>'x')::integer=(p->>'cell')::integer) then raise exception 'INVALID_WASTE' using errcode='22023';end if;
  mass:=mass+(p->>'amount')::numeric;seen:=array_append(seen,p->>'id');
 end loop;
 seen:=array[]::text[];
 for p in select q.value from jsonb_array_elements(h->'tasks') q(value) loop
  if not private.health_shape(p,array['id','citizenId','type','target','siteId','sourceId','patientId','phase','work','required','amount','cargo','startedTick']) or p->>'id' is null or length(p->>'id') not between 1 and 150 or p->>'id'=any(seen) or not coalesce(p->>'citizenId'=any(ids),false) or p->>'citizenId'=any(used_ids) or p->>'type' not in ('collect','care','brew','bandage','compost') or p->>'phase' not in ('going','working','delivery','blocked') or not private.health_int(p->'target',0,65535) or not private.health_int(p->'startedTick',0,tick) or not private.health_int(p->'required',1,5400) or not private.health_int(p->'work',0,(p->>'required')::numeric) or not private.health_int(p->'amount',0,3000) or not private.health_int(p->'cargo',0,3000) or not exists(select 1 from jsonb_array_elements(s->'construction'->'sites') q(value) where q.value->>'id'=p->>'siteId' and q.value->>'status'='complete') then raise exception 'INVALID_HEALTH_TASK' using errcode='22023';end if;
  if p->>'type'<>'collect' and ((p->>'required')::integer<>case p->>'type' when 'care' then 1800 when 'compost' then 5400 else 450 end or p->'amount'<>'0'::jsonb or p->'cargo'<>'0'::jsonb or p->'sourceId'<>'null'::jsonb) or (p->>'type'='care') is distinct from (p->'patientId'<>'null'::jsonb) then raise exception 'INVALID_HEALTH_TASK' using errcode='22023';end if;
  used_ids:=array_append(used_ids,p->>'citizenId');seen:=array_append(seen,p->>'id');
  if p->'patientId'<>'null'::jsonb then if not coalesce(p->>'patientId'=any(ids),false) or p->>'patientId'=any(used_ids) or p->>'type'<>'care' then raise exception 'INVALID_HEALTH_TASK' using errcode='22023';end if;used_ids:=array_append(used_ids,p->>'patientId');end if;
  if p->>'type'='collect' and (not exists(select 1 from jsonb_array_elements(h->'waste') q(value) where q.value->>'id'=p->>'sourceId') or (p->>'amount')::integer<1 or (p->>'required')::integer<>ceil((p->>'amount')::numeric/1000/4*1800) or (p->>'cargo')::integer not in (0,(p->>'amount')::integer)) then raise exception 'INVALID_HEALTH_TASK' using errcode='22023';end if;
  mass:=mass+(p->>'cargo')::numeric;
 end loop;
 if exists(select 1 from jsonb_array_elements(s->'survival'->'jobs') q(value) where q.value->>'citizenId'=any(used_ids)) or exists(select 1 from jsonb_array_elements(s->'workforce'->'workers') q(value) where q.value->>'citizenId'=any(used_ids) and (q.value->'training'<>'null'::jsonb or q.value->'assignment'<>'null'::jsonb and not exists(select 1 from jsonb_array_elements(h->'tasks') ht(value) where ht.value->>'citizenId'=q.value->>'citizenId' and ht.value->>'type'<>'collect' and ht.value->>'siteId'=q.value->'assignment'->>'siteId'))) or exists(select 1 from jsonb_array_elements(s->'climate'->'refuges') q(value) where q.value->>'citizenId'=any(used_ids)) or exists(select 1 from jsonb_array_elements(s->'construction'->'hauls') q(value) where q.value->>'citizenId'=any(used_ids)) or exists(select 1 from jsonb_array_elements(s->'construction'->'builders') q(value) where q.value->>'citizenId'=any(used_ids)) then raise exception 'INVALID_HEALTH_TASK' using errcode='22023';end if;
 if mass+(h->>'processed')::numeric<>(h->>'generated')::numeric then raise exception 'INVALID_WASTE_MASS' using errcode='22023';end if;
 seen:=array[]::text[];
 for p in select q.value from jsonb_array_elements(h->'water') q(value) loop
  if not private.health_shape(p,array['lotId','bio','chemical','origin']) or p->>'lotId' is null or p->>'lotId'=any(seen) or not private.health_int(p->'bio',0,10000) or not private.health_int(p->'chemical',0,10000) or p->'origin'<>'null'::jsonb and not private.health_int(p->'origin',0,65535) or not exists(select 1 from jsonb_array_elements(s->'survival'->'lots') q(value) where q.value->>'id'=p->>'lotId' and q.value->>'resource' in ('R062','R067','R213')) then raise exception 'INVALID_WATER_QUALITY' using errcode='22023';end if;seen:=array_append(seen,p->>'lotId');
 end loop;
 seen:=array[]::text[];
 for p in select q.value from jsonb_array_elements(h->'waterPlans') q(value) loop
  if not private.health_shape(p,array['jobId','bio','chemical','origin']) or p->>'jobId' is null or p->>'jobId'=any(seen) or p->'bio' is distinct from '0'::jsonb or not private.health_int(p->'chemical',0,10000) or p->'origin'<>'null'::jsonb and not private.health_int(p->'origin',0,65535) or not exists(select 1 from jsonb_array_elements(s->'survival'->'jobs') q(value) where q.value->>'id'=p->>'jobId' and q.value->>'recipeId' in ('F060','F087')) then raise exception 'INVALID_WATER_QUALITY' using errcode='22023';end if;seen:=array_append(seen,p->>'jobId');
 end loop;
 base:=(s-'health')||'{"schemaVersion":9,"engineVersion":"we-sim-7"}'::jsonb;perform private.sim_validate_v9(base,w);
end $$;
revoke all on function private.health_shape(jsonb,text[]),private.health_int(jsonb,numeric,numeric),private.sim_validate(jsonb,public.worlds),private.sim_validate_v9(jsonb,public.worlds) from public,anon,authenticated;
commit;
