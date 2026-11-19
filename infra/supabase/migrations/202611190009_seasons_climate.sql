-- World Evolution V0.10.0 — Seasons & Climate
-- infra/supabase/migrations/202611190009_seasons_climate.sql
-- Upgrade V0.9.0 -> V0.10.0: run ONCE after 001–008, before deploy.
-- Raw old save/history are preserved; projections below are for validation only.
begin;
create table private.climate_catalog(id integer primary key check(id=1),spec jsonb not null);
alter table private.climate_catalog enable row level security;
revoke all on private.climate_catalog from public,anon,authenticated;
insert into private.climate_catalog values(1,'{
  "version": 1,
  "seasons": [
    {
      "id": "S1",
      "name": "Xuân",
      "from": 1,
      "to": 30,
      "description": "Tái sinh thực vật, nhiều con non, mưa rào",
      "weather": "Mưa vừa",
      "biological": 0.75,
      "water": 1.1,
      "growth": 1.15
    },
    {
      "id": "S2",
      "name": "Hạ",
      "from": 31,
      "to": 60,
      "description": "Nắng nóng, hạn hán, cháy rừng",
      "weather": "Khô nóng",
      "biological": 1.25,
      "water": 1.45,
      "growth": 0.8
    },
    {
      "id": "S3",
      "name": "Thu",
      "from": 61,
      "to": 90,
      "description": "Mùa hạt và quả chín, tích trữ trước lạnh",
      "weather": "Mưa bão",
      "biological": 0.9,
      "water": 1,
      "growth": 1.2
    },
    {
      "id": "S4",
      "name": "Đông",
      "from": 91,
      "to": 120,
      "description": "Rét ở biome lạnh; nhiệt độ, tuyết, mưa lạnh và gió tùy vùng",
      "weather": "Rét đậm / tuyết ở vùng phù hợp",
      "biological": 0.7,
      "water": 1.05,
      "growth": 0.55
    }
  ],
  "regions": [
    {
      "id": "B01",
      "name": "Ôn đới",
      "seasons": "Đủ 4 mùa",
      "rainfall": "Trung bình",
      "snow": "Có tuyết mùa đông",
      "description": "Thay đổi mạnh mùa, động vật di cư"
    },
    {
      "id": "B02",
      "name": "Nhiệt đới gió mùa",
      "seasons": "Mùa mưa/mùa khô là chính",
      "rainfall": "Mưa lớn",
      "snow": "Không có tuyết ở bản đồ điển hình",
      "description": "S1/S3 là mùa mưa, S2 khô nóng, S4 dịu hơn"
    },
    {
      "id": "B03",
      "name": "Bán khô hạn",
      "seasons": "Mùa khô dài",
      "rainfall": "Ít mưa",
      "snow": "Thường không tuyết",
      "description": "Nguồn nước hiếm; hạn hán thường xuyên"
    },
    {
      "id": "B04",
      "name": "Cận nhiệt",
      "seasons": "4 mùa nhẹ",
      "rainfall": "Vừa đến nhiều",
      "snow": "Tuyết hiếm ở vùng thấp",
      "description": "Mưa bão theo thời kỳ; sản lượng cây thay đổi"
    },
    {
      "id": "B05",
      "name": "Hàn đới",
      "seasons": "Mùa đông dài và rét sâu; xuân/hè ngắn",
      "rainfall": "Thấp; có tuyết",
      "snow": "Có tuyết dày",
      "description": "Trang phục giữ ấm và nơi trú bắt buộc để duy trì dân số; mùa ngắn khó kiếm ăn"
    },
    {
      "id": "B06",
      "name": "Núi cao",
      "seasons": "Nhiệt độ phụ thuộc cao độ; có thể lạnh quanh năm",
      "rainfall": "Biến động theo sườn núi",
      "snow": "Có tuyết ở cao độ phù hợp",
      "description": "Gió mạnh; cần trang phục ấm cả khi mùa hạ; đường đi dễ bị chặn"
    },
    {
      "id": "B07",
      "name": "Cao nguyên khô lạnh",
      "seasons": "Ngày nắng nhưng đêm lạnh mạnh; đông rất rét",
      "rainfall": "Ít mưa",
      "snow": "Tuyết hiếm hoặc theo cao độ",
      "description": "Cần nước như vùng khô và quần áo/chăn giữ ấm ban đêm"
    }
  ],
  "hazards": [
    {
      "id": "H01",
      "name": "Hạn hán",
      "condition": "Khô hạn tích lũy >= 18 ngày, lượng mưa thấp",
      "warning": "Dòng sông giảm, đất nứt, cây héo",
      "effect": "Nguồn nước -20 đến -70%, quả giảm",
      "response": "Hố chứa nước, phân công lấy nước, tìm suối",
      "resilience": "Nước dự trữ ≥ 10 ngày; vẫn đủ uống",
      "area": "Ô bản đồ khô/mùa hạ",
      "rule": "Khí hậu bán khô hạn ảnh hưởng cao"
    },
    {
      "id": "H02",
      "name": "Lũ sông",
      "condition": "Lượng mưa nhiều ngày + nước thượng nguồn",
      "warning": "Sông dâng qua từng mốc, đất thấp ẩm",
      "effect": "Kho/người/đường trên vùng ngập bị ảnh hưởng",
      "response": "Rãnh thoát nước, bờ chắn lũ, di dời kho",
      "resilience": "Nhà/kho quan trọng không còn nằm trên ô ngập",
      "area": "Vùng trũng cạnh sông",
      "rule": "Không bắt buộc gặp mới qua thời đại"
    },
    {
      "id": "H03",
      "name": "Mưa liên tục",
      "condition": "Mưa >= 5 ngày; tỉ lệ tùy khí hậu",
      "warning": "Mây, đường lầy, vật liệu ướt",
      "effect": "Hư hỏng thực phẩm ngoài trời nhanh, đi chậm",
      "response": "Giá phơi có mái, lều che, kho",
      "resilience": "Lương thực vẫn có nguồn cung",
      "area": "Rừng ẩm, vùng ven sông",
      "rule": "Không bắt buộc xuất hiện tất cả các năm"
    },
    {
      "id": "H04",
      "name": "Cháy rừng",
      "condition": "Nóng + khô + gió + nguồn lửa",
      "warning": "Khói, vệt cháy, động vật bỏ chạy",
      "effect": "Mất cây gỗ, nguy cơ cháy kho/lều",
      "response": "Phòng cháy, cất củi, khoảng cách công trình",
      "resilience": "Không mất sạch khu định cư",
      "area": "Rừng khô",
      "rule": "Cảnh báo trước khi cháy lan"
    },
    {
      "id": "H05",
      "name": "Rét đậm",
      "condition": "Nhiệt độ dưới ngưỡng sinh tồn liên tiếp",
      "warning": "Băng giá, nước chậm, người tụ lửa",
      "effect": "Tăng tiêu thụ củi, giảm thân nhiệt khi thiếu áo/mũ/giày; áo ướt làm rủi ro cao",
      "response": "Trang bị áo da/lông theo người; chăn, lều giữ ấm, nhà sưởi, hong áo ướt",
      "resilience": ">=80% người được bảo vệ theo biome; nơi ngủ và nhiên liệu đủ",
      "area": "Ôn đới/đồi núi",
      "rule": "Không áp dụng tuyết cho vùng nhiệt đới thấp"
    },
    {
      "id": "H06",
      "name": "Nắng nóng cực đoan",
      "condition": "Nhiệt tăng kéo dài",
      "warning": "Cây héo, người hoạt động chậm",
      "effect": "Tăng tiêu thụ nước +1/người, giảm hiệu suất",
      "response": "Nguồn nước, phân ca, trú mát",
      "resilience": "Nước sinh hoạt vẫn bảo đảm",
      "area": "Các vùng nóng",
      "rule": "Tần suất biến cố phụ thuộc khí hậu"
    },
    {
      "id": "H07",
      "name": "Dịch bệnh nguồn nước",
      "condition": "Dùng nước bẩn quá mức nhiều ngày",
      "warning": "Sức khỏe nhóm người xuống thấp",
      "effect": "Giảm nhân lực, tăng cần người chữa bệnh",
      "response": "Làm sạch nước, thảo dược, cách ly hợp lý",
      "resilience": "Kiểm soát tỷ lệ mắc và phục hồi",
      "area": "Mọi vùng",
      "rule": "Có xác suất; không tự phát chắc chắn"
    },
    {
      "id": "H08",
      "name": "Dịch bệnh do thực phẩm",
      "condition": "Ăn đồ hỏng / nấm không nhận biết",
      "warning": "Nhiều ca đau bụng, nghỉ làm",
      "effect": "Hao hụt sức khỏe/nhân lực",
      "response": "Kho, kiểm tra hạn, nhận biết thực phẩm",
      "resilience": "Không có người chết hàng loạt vì 1 quyết định nhỏ",
      "area": "Mọi vùng",
      "rule": "Dùng cảnh báo chất lượng thức ăn"
    },
    {
      "id": "H09",
      "name": "Động vật nguy hiểm",
      "condition": "Săn thú lớn, gần khu cư trú thú",
      "warning": "Vết chân, âm thanh, dân cảnh báo",
      "effect": "Thợ săn bị thương hoặc rút lui",
      "response": "Đào tạo, bẫy, hạn mức và công cụ",
      "resilience": "Không ép đánh thú nguy hiểm mới lên E1",
      "area": "Rừng già, đồng cỏ",
      "rule": "Rủi ro theo species"
    },
    {
      "id": "H10",
      "name": "Suy giảm hệ sinh thái",
      "condition": "Săn/hái vượt tốc độ tái sinh",
      "warning": "Quần thể giảm dần trên map",
      "effect": "Sản lượng nguồn ngoài tự nhiên giảm",
      "response": "Giảm quota, chuyển vùng, dự trữ",
      "resilience": "Quần thể khai thác được > mức phục hồi tối thiểu",
      "area": "Mọi vùng",
      "rule": "Không để nguồn sống là điểm sinh vô hạn"
    },
    {
      "id": "H11",
      "name": "Bão gió",
      "condition": "Gió mạnh + mưa lớn",
      "warning": "Cây nghiêng, lều rung, mưa xiên",
      "effect": "Hỏng mái, đổ cây, cản vận chuyển",
      "response": "Sửa mái, chọn nền tốt, cảnh báo",
      "resilience": "Công trình thiết yếu được duy trì",
      "area": "Ven biển/vùng gió mạnh",
      "rule": "Sát thương tối đa có giới hạn theo cân bằng"
    },
    {
      "id": "H12",
      "name": "Sạt lở",
      "condition": "Nền dốc + mưa lớn + mất cây",
      "warning": "Đất đá dịch chuyển",
      "effect": "Chặn đường và hỏng mỏ/kho trên dốc",
      "response": "Tránh vùng rủi ro, trồng cây, gia cố",
      "resilience": "Có tuyến vận chuyển thay thế",
      "area": "Đồi núi",
      "rule": "Đánh dấu risk từ địa hình trước xây"
    },
    {
      "id": "H13",
      "name": "Bão tuyết",
      "condition": "Biến động nhiệt <= -10°C + tuyết + gió mạnh ở vùng có tuyết",
      "warning": "Gió mạnh, mây nặng, nhiệt giảm, tuyết dày lên",
      "effect": "Giảm di chuyển, tăng mất nhiệt, gián đoạn thu gom nước/gỗ",
      "response": "Áo da/lông; lều giữ ấm; nhà sưởi; dự trữ củi và nước",
      "resilience": ">=80% dân được bảo vệ khi lạnh; đường cung cấp thiết yếu còn hoạt động",
      "area": "Hàn đới, núi cao, ôn đới có tuyết",
      "rule": "Không áp dụng vùng nhiệt đới thấp; phát sinh báo trước"
    },
    {
      "id": "H14",
      "name": "Sương giá và đóng băng",
      "condition": "Nhiệt <=0°C kéo dài; hồ nông/đất ẩm đóng băng",
      "warning": "Sương bám, lớp băng mặt nước, rau héo",
      "effect": "Nguồn nước mặt giảm; cây trồng yếu; người không có giày rét chân",
      "response": "Đun chảy băng; giày ủng; công trình giữ ấm, tích nước trước rét",
      "resilience": "Nguồn uống >= tối thiểu; người ra ngoài có giày phù hợp",
      "area": "Ôn đới lạnh, hàn đới, núi cao",
      "rule": "Có thể xảy ra không cần bão tuyết; nước đóng băng không đồng nghĩa mất vĩnh viễn"
    },
    {
      "id": "H15",
      "name": "Mưa lạnh kéo dài",
      "condition": "Mưa + nhiệt 0–10°C + độ ẩm lớn nhiều ngày",
      "warning": "Quần áo ướt, nền lầy, củi ẩm",
      "effect": "Giảm hiệu quả áo len/áo da ướt, tăng nguy cơ hạ thân nhiệt",
      "response": "Áo choàng chống mưa, bãi hong khô, chỗ ngủ có mái, củi khô",
      "resilience": "Tỷ lệ trang phục khô và nhà ở kín mưa >= mức an toàn",
      "area": "Ôn đới, cận nhiệt vùng cao, núi cao",
      "rule": "Rủi ro đến từ ướt và gió, ngay cả khi nhiệt chưa xuống âm"
    }
  ],
  "thermal": [
    {
      "id": "TC01",
      "name": "Nóng",
      "min": 20,
      "max": 99,
      "warmth": 0,
      "rule": "Tăng nước nếu mặc áo quá dày"
    },
    {
      "id": "TC02",
      "name": "Mát",
      "min": 15,
      "max": 19,
      "warmth": 1,
      "rule": "Không ép người chơi chế áo len"
    },
    {
      "id": "TC03",
      "name": "Lạnh",
      "min": 5,
      "max": 14,
      "warmth": 3,
      "rule": "Cảnh báo nếu dân ngủ ngoài trời"
    },
    {
      "id": "TC04",
      "name": "Rét nhẹ",
      "min": 0,
      "max": 4,
      "warmth": 6,
      "rule": "Tăng nhiên liệu; giảm làm đêm"
    },
    {
      "id": "TC05",
      "name": "Rét sâu",
      "min": -9,
      "max": -1,
      "warmth": 10,
      "rule": "Theo dõi độ ướt, mệt mỏi, lộ trình săn"
    },
    {
      "id": "TC06",
      "name": "Rét cực đoan",
      "min": -50,
      "max": -10,
      "warmth": 15,
      "rule": "Có thể tạm dừng săn xa để tránh thương tích"
    },
    {
      "id": "TC07",
      "name": "Gió lạnh",
      "min": null,
      "max": null,
      "warmth": 2,
      "rule": "+2 điểm khi gió mạnh trong trời lạnh"
    },
    {
      "id": "TC08",
      "name": "Quần áo ướt",
      "min": null,
      "max": null,
      "warmth": 3,
      "rule": "+3 điểm lúc độ ướt cao; giảm hiệu quả áo"
    },
    {
      "id": "TC09",
      "name": "Đêm ngoài trời",
      "min": null,
      "max": null,
      "warmth": 2,
      "rule": "Dân ngủ ngoài trời chịu rét nhiều hơn"
    },
    {
      "id": "TC10",
      "name": "Lều giữ ấm",
      "min": null,
      "max": null,
      "warmth": -4,
      "rule": "Không áp buff khi người ở ngoài lều"
    },
    {
      "id": "TC11",
      "name": "Nhà sưởi có củi",
      "min": null,
      "max": null,
      "warmth": -5,
      "rule": "Mất củi thì không còn tác dụng sưởi"
    }
  ],
  "gear": [
    {
      "id": "R188",
      "name": "Áo choàng da thú",
      "era": "E0",
      "slot": "Thân ngoài",
      "warmth": 4,
      "waterproof": 0.2,
      "durability": 120,
      "rule": "Khô >=50%; dùng khi đi săn/lấy nước"
    },
    {
      "id": "R189",
      "name": "Mũ lông thú",
      "era": "E0",
      "slot": "Đầu",
      "warmth": 2,
      "waterproof": 0.15,
      "durability": 110,
      "rule": "Đầu giữ ấm; cần trang bị riêng"
    },
    {
      "id": "R190",
      "name": "Giày quấn da",
      "era": "E0",
      "slot": "Chân",
      "warmth": 2,
      "waterproof": 0.2,
      "durability": 90,
      "rule": "Giảm lạnh chân khi di chuyển xa"
    },
    {
      "id": "R191",
      "name": "Găng tay da",
      "era": "E0",
      "slot": "Tay",
      "warmth": 1,
      "waterproof": 0.1,
      "durability": 80,
      "rule": "Giảm lạnh khi lao động ngoài trời"
    },
    {
      "id": "R192",
      "name": "Chăn da thú",
      "era": "E0",
      "slot": "Ngủ",
      "warmth": 4,
      "waterproof": 0.1,
      "durability": 130,
      "rule": "Chỉ có tác dụng trong lúc ngủ"
    },
    {
      "id": "R193",
      "name": "Áo choàng chống mưa",
      "era": "E0",
      "slot": "Thân ngoài",
      "warmth": 1,
      "waterproof": 0.8,
      "durability": 110,
      "rule": "Bảo vệ mưa, giảm tích lũy ướt; không chống rét sâu"
    },
    {
      "id": "R195",
      "name": "Tấm lót ngủ cỏ khô",
      "era": "E0",
      "slot": "Ngủ",
      "warmth": 2,
      "waterproof": 0,
      "durability": 75,
      "rule": "Lót ngủ giảm mất nhiệt từ nền đất"
    },
    {
      "id": "R196",
      "name": "Áo da thuộc",
      "era": "E1",
      "slot": "Thân ngoài",
      "warmth": 5,
      "waterproof": 0.5,
      "durability": 180,
      "rule": "Áo bền, ấm hơn da sơ chế"
    },
    {
      "id": "R197",
      "name": "Áo len",
      "era": "E1",
      "slot": "Thân trong",
      "warmth": 5,
      "waterproof": 0.15,
      "durability": 160,
      "rule": "Độ ấm cao khi khô, bị ảnh hưởng nếu ướt"
    },
    {
      "id": "R198",
      "name": "Chăn len",
      "era": "E1",
      "slot": "Ngủ",
      "warmth": 5,
      "waterproof": 0.1,
      "durability": 170,
      "rule": "Chỉ dùng khi ngủ; không thay cho áo đi làm"
    },
    {
      "id": "R199",
      "name": "Ủng da",
      "era": "E1",
      "slot": "Chân",
      "warmth": 3,
      "waterproof": 0.7,
      "durability": 170,
      "rule": "Bảo vệ chân và hạn chế ngấm nước"
    },
    {
      "id": "R200",
      "name": "Áo khoác vải dày",
      "era": "E4",
      "slot": "Thân ngoài",
      "warmth": 6,
      "waterproof": 0.35,
      "durability": 190,
      "rule": "Trang phục dày thời Trung đại"
    },
    {
      "id": "R201",
      "name": "Áo bông lót",
      "era": "E5",
      "slot": "Thân ngoài",
      "warmth": 7,
      "waterproof": 0.35,
      "durability": 190,
      "rule": "Cách nhiệt nhiều lớp, không nên mặc trong khí hậu nóng"
    },
    {
      "id": "R202",
      "name": "Áo khoác công nghiệp",
      "era": "E6",
      "slot": "Thân ngoài",
      "warmth": 8,
      "waterproof": 0.5,
      "durability": 230,
      "rule": "Độ bền cao, sản xuất quy mô công nghiệp"
    },
    {
      "id": "R203",
      "name": "Găng bảo hộ chống lạnh",
      "era": "E6",
      "slot": "Tay",
      "warmth": 2,
      "waterproof": 0.65,
      "durability": 210,
      "rule": "Bảo vệ tay công nhân và thợ mỏ"
    },
    {
      "id": "R205",
      "name": "Áo giữ nhiệt",
      "era": "E7",
      "slot": "Thân trong",
      "warmth": 6,
      "waterproof": 0.65,
      "durability": 220,
      "rule": "Có thể kết hợp áo ngoài; yêu cầu slot riêng"
    },
    {
      "id": "R206",
      "name": "Ủng chống lạnh",
      "era": "E7",
      "slot": "Chân",
      "warmth": 4,
      "waterproof": 0.75,
      "durability": 230,
      "rule": "Đồ giữ ấm chân vùng lạnh sâu"
    },
    {
      "id": "R207",
      "name": "Bộ bảo hộ khí hậu cực đoan",
      "era": "E8",
      "slot": "Bộ toàn thân",
      "warmth": 14,
      "waterproof": 0.9,
      "durability": 280,
      "rule": "Chiếm thân/đầu/tay/chân; không xếp chồng bộ toàn thân"
    }
  ],
  "settings": {
    "warmThreshold": 15,
    "coldThreshold": 5,
    "freezeThreshold": 0,
    "extremeThreshold": -10,
    "protectedRatio": 0.8,
    "minDurability": 0.25,
    "wearPerDay": 1,
    "wetPerDay": 0.2,
    "dryPerDay": 0.35,
    "woolWetLoss": 0.55,
    "coldFoodExtra": 0.2,
    "deficitWarning": 4,
    "hotWaterExtra": 1,
    "warningDays": 2
  },
  "fuel": [
    {
      "buildingId": "B129",
      "resource": "R167",
      "perDay": 1
    },
    {
      "buildingId": "B130",
      "resource": "R167",
      "perDay": 2
    },
    {
      "buildingId": "B131",
      "resource": "R167",
      "perDay": 3
    }
  ]
}
'::jsonb);
create function private.climate_int(v jsonb,lo numeric,hi numeric) returns boolean language sql immutable set search_path='' as $$
 select jsonb_typeof(v)='number' and (v#>>'{}')::numeric=trunc((v#>>'{}')::numeric) and (v#>>'{}')::numeric between lo and hi;
$$;
alter function private.sim_validate(jsonb,public.worlds) rename to sim_validate_v8;
create function private.sim_validate(s jsonb,w public.worlds) returns void language plpgsql set search_path='' as $$
declare c jsonb;meta jsonb;p jsonb;g jsonb;h jsonb;v jsonb;item jsonb;site jsonb;b jsonb;spec jsonb;l jsonb;n text;tick bigint;elapsed bigint;age bigint;bounded_age bigint;ttl integer;ids text[];seen text[];slots text[];current_ids text[];busy text[];base jsonb;lots jsonb:='[]';served jsonb:='[]';previous jsonb;cap numeric;used numeric;protected boolean;
begin
 if (s->>'schemaVersion')::integer between 2 and 8 then perform private.sim_validate_v8(s,w);return;end if;
 if s->'schemaVersion' is distinct from '9'::jsonb or s->>'engineVersion' is distinct from 'we-sim-7' or (select count(*) from jsonb_object_keys(s))<>24 then raise exception 'INVALID_SAVE' using errcode='22023';end if;
 c:=s->'climate';tick:=(s->>'tick')::bigint;select cc.spec into meta from private.climate_catalog cc where id=1;
 if jsonb_typeof(c) is distinct from 'object' or (select count(*) from jsonb_object_keys(c))<>19 or not(c ?& array['version','startedTick','lastTick','rngState','sequence','current','history','dryDays','rainDays','coldDays','hotDays','freezingDays','coldRainDays','hazards','people','gear','refuges','fuel','needDay']) or c->'version' is distinct from '1'::jsonb then raise exception 'INVALID_CLIMATE' using errcode='22023';end if;
 foreach n in array array['startedTick','lastTick','rngState','sequence','needDay'] loop if not coalesce(private.climate_int(c->n,0,1e12),false) then raise exception 'INVALID_CLIMATE' using errcode='22023';end if;end loop;
 elapsed:=tick-(c->>'startedTick')::bigint;
 if elapsed<0 or (c->>'lastTick')::bigint<>tick or (c->>'needDay')::bigint<>tick/1800+1 or (c->>'rngState')::bigint not between 1 and 4294967295 then raise exception 'INVALID_CLIMATE' using errcode='22023';end if;
 foreach n in array array['dryDays','rainDays','coldDays','hotDays','freezingDays','coldRainDays'] loop if not coalesce(private.climate_int(c->n,0,least(1000000,elapsed/1800)),false) then raise exception 'INVALID_CLIMATE' using errcode='22023';end if;end loop;
 foreach n in array array['history','hazards','people','gear','refuges','fuel'] loop if jsonb_typeof(c->n) is distinct from 'array' then raise exception 'INVALID_CLIMATE' using errcode='22023';end if;end loop;
 if jsonb_array_length(c->'history')>32 or jsonb_array_length(c->'hazards')>32 or jsonb_array_length(c->'people')<>20 or jsonb_array_length(c->'gear')>160 or jsonb_array_length(c->'refuges')>20 or jsonb_array_length(c->'fuel')>256 then raise exception 'INVALID_CLIMATE' using errcode='22023';end if;
 seen:=array[]::text[];
 for p in select value from jsonb_array_elements(jsonb_build_array(c->'current')||(c->'history')) loop
  if jsonb_typeof(p) is distinct from 'object' or (select count(*) from jsonb_object_keys(p))<>7 or not(p ?& array['id','kind','startsTick','endsTick','rain','wind','offset']) or (p->>'id')!~'^weather-[1-9][0-9]*$' or p->>'id' is null or p->>'id'=any(seen) or substring(p->>'id' from 9)::bigint>(c->>'sequence')::bigint or p->>'kind' is null or p->>'kind' not in ('clear','rain','storm','snow','blizzard') then raise exception 'INVALID_WEATHER' using errcode='22023';end if;seen:=array_append(seen,p->>'id');
  if not coalesce(private.climate_int(p->'startsTick',(c->>'startedTick')::bigint,tick),false) or not coalesce(private.climate_int(p->'endsTick',(p->>'startsTick')::bigint+1,(p->>'startsTick')::bigint+1800),false) or not coalesce(private.climate_int(p->'rain',0,3),false) or not coalesce(private.climate_int(p->'wind',0,3),false) or not coalesce(private.climate_int(p->'offset',-4,3),false) then raise exception 'INVALID_WEATHER' using errcode='22023';end if;
  if p=c->'current' and (p->>'endsTick')::bigint<=tick or p<>c->'current' and (p->>'endsTick')::bigint>tick or (p->>'kind'='clear') is distinct from (p->'rain'='0'::jsonb) or p->>'kind' in ('snow','blizzard') and (w.climate_id in ('B02','B03','B04') or w.climate_id='B01' and ((p->>'startsTick')::bigint/1800/30)%4<>3) then raise exception 'INVALID_WEATHER' using errcode='22023';end if;
 end loop;
 select array_agg(q.value->>'id') into ids from jsonb_array_elements(s->'citizens') as q(value);seen:=array[]::text[];
 for p in select value from jsonb_array_elements(c->'people') loop
  if jsonb_typeof(p) is distinct from 'object' or (select count(*) from jsonb_object_keys(p))<>9 or not(p ?& array['citizenId','wetness','wetCredit','exposureTicks','moveCredit','workCredit','moveRate','foodNeed','waterNeed']) or p->>'citizenId' is null or not(p->>'citizenId'=any(ids)) or p->>'citizenId'=any(seen) then raise exception 'INVALID_THERMAL' using errcode='22023';end if;seen:=array_append(seen,p->>'citizenId');
  if not coalesce(private.climate_int(p->'wetness',0,10000),false) or not coalesce(private.climate_int(p->'wetCredit',0,179999),false) or not coalesce(private.climate_int(p->'exposureTicks',0,elapsed),false) or not coalesce(private.climate_int(p->'moveCredit',0,99),false) or not coalesce(private.climate_int(p->'workCredit',0,99),false) or not coalesce(private.climate_int(p->'moveRate',0,100),false) or not coalesce(private.climate_int(p->'foodNeed',100,120),false) or not coalesce(private.climate_int(p->'waterNeed',200,390),false) then raise exception 'INVALID_THERMAL' using errcode='22023';end if;
 end loop;
 seen:=array[]::text[];
 for h in select value from jsonb_array_elements(c->'hazards') loop
  if jsonb_typeof(h) is distinct from 'object' or (select count(*) from jsonb_object_keys(h))<>7 or not(h ?& array['id','kind','announcedTick','startsTick','endsTick','phase','regions']) or h->>'id' is null or (h->>'id')!~'^hazard-[1-9][0-9]*$' or h->>'id'=any(seen) or substring(h->>'id' from 8)::bigint>(c->>'sequence')::bigint or h->>'kind' is null or h->>'kind' not in ('H01','H03','H05','H06','H13','H14','H15') or h->>'phase' is null or h->>'phase' not in ('forecast','active','ended','cancelled') or jsonb_typeof(h->'regions') is distinct from 'array' or jsonb_array_length(h->'regions') not between 1 and 64 then raise exception 'INVALID_HAZARD' using errcode='22023';end if;seen:=array_append(seen,h->>'id');
  if not coalesce(private.climate_int(h->'announcedTick',(c->>'startedTick')::bigint,tick),false) or not coalesce(private.climate_int(h->'startsTick',(h->>'announcedTick')::bigint+3600,1e12),false) or not coalesce(private.climate_int(h->'endsTick',(h->>'startsTick')::bigint,1e12),false) or h->>'phase'='forecast' and tick>=(h->>'startsTick')::bigint or h->>'phase'='active' and (tick<(h->>'startsTick')::bigint or tick>=(h->>'endsTick')::bigint) or h->>'phase'='ended' and (h->>'endsTick')::bigint>tick or h->>'kind'='H13' and w.climate_id in ('B02','B03','B04') then raise exception 'INVALID_HAZARD' using errcode='22023';end if;
  if exists(select 1 from jsonb_array_elements_text(h->'regions') q(value) where q.value!~'^region-[0-7]-[0-7]$') or (select count(distinct q.value) from jsonb_array_elements_text(h->'regions') q(value))<>jsonb_array_length(h->'regions') then raise exception 'INVALID_HAZARD' using errcode='22023';end if;
 end loop;
 seen:=array[]::text[];
 for g in select value from jsonb_array_elements(c->'gear') loop
  select q.value into spec from jsonb_array_elements(meta->'gear') q(value) where q.value->>'id'=g->>'resource';
  if jsonb_typeof(g) is distinct from 'object' or (select count(*) from jsonb_object_keys(g))<>9 or not(g ?& array['id','resource','citizenId','location','durability','wetness','wetCredit','wearCredit','createdTick']) or g->>'id' is null or (g->>'id')!~'^gear-[1-9][0-9]*$' or g->>'id'=any(seen) or substring(g->>'id' from 6)::bigint>(c->>'sequence')::bigint or spec is null then raise exception 'INVALID_GEAR' using errcode='22023';end if;seen:=array_append(seen,g->>'id');
  if not coalesce(private.climate_int(g->'durability',0,(spec->>'durability')::integer),false) or not coalesce(private.climate_int(g->'wetness',0,10000),false) or not coalesce(private.climate_int(g->'wetCredit',0,179999),false) or not coalesce(private.climate_int(g->'wearCredit',0,1799),false) or not coalesce(private.climate_int(g->'createdTick',0,tick),false) or jsonb_typeof(g->'location') is distinct from 'string' then raise exception 'INVALID_GEAR' using errcode='22023';end if;
  if g->'citizenId' is distinct from 'null'::jsonb then if not(g->>'citizenId'=any(ids)) or g->>'location'<>'citizen:'||(g->>'citizenId') then raise exception 'INVALID_GEAR' using errcode='22023';end if;
  elsif g->>'location'<>'depot' and not exists(select 1 from jsonb_array_elements(s->'construction'->'yards') q(value) where 'yard:'||(q.value->>'id')=g->>'location') and not exists(select 1 from jsonb_array_elements(s->'construction'->'sites') q(value) join lateral jsonb_array_elements(s->'planning'->'buildings') bld(value) on bld.value->>'id'=q.value->>'id' where 'site:'||(q.value->>'id')=g->>'location' and q.value->>'status'='complete' and bld.value->>'buildingId'='B011') then raise exception 'INVALID_GEAR' using errcode='22023';end if;
 end loop;
 foreach n in array ids loop slots:=array[]::text[];for g in select value from jsonb_array_elements(c->'gear') where value->>'citizenId'=n loop select to_jsonb(q.value->>'slot') into item from jsonb_array_elements(meta->'gear') q(value) where q.value->>'id'=g->>'resource';if (item#>>'{}')=any(slots) then raise exception 'INVALID_GEAR' using errcode='22023';end if;slots:=array_append(slots,item#>>'{}');end loop;if 'Bộ toàn thân'=any(slots) and exists(select 1 from unnest(slots) slot where slot not in ('Bộ toàn thân','Ngủ')) then raise exception 'INVALID_GEAR' using errcode='22023';end if;end loop;
 select coalesce(array_agg(q.value->>'citizenId'),array[]::text[]) into busy from jsonb_array_elements(s->'construction'->'builders') q(value);
 select busy||coalesce(array_agg(q.value->>'citizenId'),array[]::text[]) into busy from jsonb_array_elements(s->'construction'->'hauls') q(value);
 select busy||coalesce(array_agg(q.value->>'citizenId'),array[]::text[]) into busy from jsonb_array_elements(s->'survival'->'jobs') q(value);
 select busy||coalesce(array_agg(q.value->>'citizenId'),array[]::text[]) into busy from jsonb_array_elements(s->'workforce'->'workers') q(value) where q.value->'training'<>'null'::jsonb or q.value->'assignment'<>'null'::jsonb;
 seen:=array[]::text[];
 for p in select value from jsonb_array_elements(c->'refuges') loop
  select q.value into site from jsonb_array_elements(s->'construction'->'sites') q(value) where q.value->>'id'=p->>'siteId' and q.value->>'status'='complete';select q.value into b from jsonb_array_elements(s->'planning'->'buildings') q(value) where q.value->>'id'=site->>'id';cap:=case b->>'buildingId' when 'B006' then 5 when 'B125' then 5 when 'B130' then 5 when 'B131' then 10 when 'B129' then 8 else 0 end;
  if jsonb_typeof(p) is distinct from 'object' or (select count(*) from jsonb_object_keys(p))<>3 or not(p ?& array['citizenId','siteId','phase']) or p->>'citizenId' is null or not(p->>'citizenId'=any(ids)) or p->>'citizenId'=any(seen) or p->>'citizenId'=any(busy) or p->>'phase' is null or p->>'phase' not in ('going','sheltered','blocked') or cap=0 or (select count(*) from jsonb_array_elements(c->'refuges') q(value) where q.value->>'siteId'=p->>'siteId')>cap then raise exception 'INVALID_REFUGE' using errcode='22023';end if;seen:=array_append(seen,p->>'citizenId');
 end loop;
 seen:=array[]::text[];
 for p in select value from jsonb_array_elements(c->'fuel') loop
  select q.value into site from jsonb_array_elements(s->'construction'->'sites') q(value) where q.value->>'id'=p->>'siteId' and q.value->>'status'='complete';select q.value into b from jsonb_array_elements(s->'planning'->'buildings') q(value) where q.value->>'id'=site->>'id';
  if jsonb_typeof(p) is distinct from 'object' or (select count(*) from jsonb_object_keys(p))<>3 or not(p ?& array['siteId','fromTick','untilTick']) or p->>'siteId' is null or p->>'siteId'=any(seen) or b->>'buildingId' is null or b->>'buildingId' not in ('B129','B130','B131') or not coalesce(private.climate_int(p->'fromTick',0,tick),false) or not coalesce(private.climate_int(p->'untilTick',tick+1,1e12),false) or (p->>'untilTick')::bigint-(p->>'fromTick')::bigint<>1800 then raise exception 'INVALID_FUEL' using errcode='22023';end if;seen:=array_append(seen,p->>'siteId');
 end loop;
 -- True climate-dependent lots/needs are checked before projecting into prior validators.
 for l in select value from jsonb_array_elements(s->'survival'->'lots') loop
  select cr.ttl_days into ttl from private.construction_resources cr where cr.id=l->>'resource';if not found then raise exception 'INVALID_RESOURCE' using errcode='22023';end if;
  age:=(l->>'ageTicks')::bigint;if age<0 or age>2*(tick-(l->>'createdTick')::bigint) then raise exception 'INVALID_LOT' using errcode='22023';end if;
  protected:=false;if l->'expiresTick'='null'::jsonb and ttl is not null then
   select q.value into site from jsonb_array_elements(s->'construction'->'sites') q(value) where 'site:'||(q.value->>'id')=l->>'location' and q.value->>'status'='complete';select q.value into b from jsonb_array_elements(s->'planning'->'buildings') q(value) where q.value->>'id'=site->>'id';
   select cc.spec into spec from private.construction_catalog cc where cc.id=b->>'buildingId';
   if b->>'buildingId'='B010' and exists(select 1 from private.construction_resources cr where cr.id=l->>'resource' and cr.storage='Kho lương thực') or b->>'buildingId'='B118' and l->>'resource'='R213' then
    protected:=not exists(select 1 from jsonb_array_elements(spec->'staffing') need(value) where (select count(*) from jsonb_array_elements(s->'workforce'->'workers') wr(value) where wr.value->'assignment'->>'siteId'=site->>'id' and wr.value->>'roleId'=need.value->>'roleId' and (wr.value->'qualified'='true'::jsonb or wr.value->'training'->>'phase' in ('studying','practice','outbound')) and exists(select 1 from jsonb_array_elements(s->'citizens') pr(value) where pr.value->>'id'=wr.value->>'citizenId' and pr.value->>'status'='idle' and pr.value->'x'=site->'entrance'->'x' and pr.value->'y'=site->'entrance'->'y'))<(need.value->>'required')::integer);
   end if;
  end if;
  if ttl is not null then if l->'spoiled' is distinct from to_jsonb(age>=ttl*1800) or (age<ttl*1800 and l->'expiresTick' is distinct from to_jsonb(tick+ttl*1800-age) and not(protected and l->'expiresTick'='null'::jsonb)) then raise exception 'INVALID_LOT' using errcode='22023';end if;bounded_age:=least(age,tick-(l->>'createdTick')::bigint);v:=l||jsonb_build_object('ageTicks',bounded_age,'spoiled',bounded_age>=ttl*1800,'expiresTick',tick+greatest(0,ttl*1800-bounded_age));else v:=l;end if;lots:=lots||jsonb_build_array(v);
 end loop;
 for p in select value from jsonb_array_elements(s->'survival'->'served') loop
  select q.value into item from jsonb_array_elements(c->'people') q(value) where q.value->>'citizenId'=p->>'id';if item is null or (p->>'food')::numeric>(item->>'foodNeed')::numeric/100 or (p->>'water')::numeric>(item->>'waterNeed')::numeric/100 then raise exception 'INVALID_DISTRIBUTION' using errcode='22023';end if;served:=served||jsonb_build_array(p||jsonb_build_object('food',least(1,(p->>'food')::numeric),'water',least(2,(p->>'water')::numeric)));
 end loop;
 previous:=s->'survival'->'previous';if previous<>'null'::jsonb then if (previous->>'food')::numeric>24 or (previous->>'water')::numeric>78 then raise exception 'INVALID_DISTRIBUTION' using errcode='22023';end if;previous:=previous||jsonb_build_object('food',least(20,(previous->>'food')::numeric),'water',least(40,(previous->>'water')::numeric));end if;
 -- Unequipped individual gear occupies physical storage capacity alongside bulk lots.
 for p in select value from jsonb_array_elements(s->'construction'->'yards') loop select count(*) into used from jsonb_array_elements(c->'gear') q(value) where q.value->'citizenId'='null'::jsonb and q.value->>'location'='yard:'||(p->>'id');select used+coalesce(sum((q.value->>'quantity')::numeric),0) into used from jsonb_array_elements(s->'survival'->'lots') q(value) where q.value->>'location'='yard:'||(p->>'id');if used>60 then raise exception 'STORAGE_FULL' using errcode='22023';end if;end loop;
 for p in select value from jsonb_array_elements(s->'construction'->'sites') loop select q.value into b from jsonb_array_elements(s->'planning'->'buildings') q(value) where q.value->>'id'=p->>'id';if b->>'buildingId'='B011' and p->>'status'='complete' then select count(*) into used from jsonb_array_elements(c->'gear') q(value) where q.value->'citizenId'='null'::jsonb and q.value->>'location'='site:'||(p->>'id');select used+coalesce(sum((q.value->>'quantity')::numeric),0) into used from jsonb_array_elements(s->'survival'->'lots') q(value) where q.value->>'location'='site:'||(p->>'id');if used>250 then raise exception 'STORAGE_FULL' using errcode='22023';end if;end if;end loop;
 base:=(s-'climate')||'{"schemaVersion":8,"engineVersion":"we-sim-6"}'::jsonb;base:=jsonb_set(jsonb_set(jsonb_set(base,'{survival,lots}',lots),'{survival,served}',served),'{survival,previous}',previous);perform private.sim_validate_v8(base,w);
end;$$;
revoke all on function private.climate_int(jsonb,numeric,numeric),private.sim_validate(jsonb,public.worlds),private.sim_validate_v8(jsonb,public.worlds) from public,anon,authenticated;
commit;
