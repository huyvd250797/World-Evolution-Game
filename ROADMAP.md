# World Evolution Development Roadmap

Căn cứ: Development Plan V1.1 và Master Game Data V1.2 Canonical Frozen. 23 phiên bản, một source PC/mobile. Giữ thế giới qua E0–E8; mục tiêu cân bằng khoảng 240 giờ x4 để mở E8, cần playtest.

| Phiên bản | Tên | Phạm vi và nghiệm thu | Trạng thái |
| --- | --- | --- | --- |
| V0.1.0 | Cross-Platform Foundation | Auth, worlds, 20 dân khởi tạo, catalog/ID/checksum, RLS, asset/CDN nền tảng, UI PC/mobile. Source/build/logic/SQL được kiểm; live cloud và thiết bị thật chờ cấu hình | Đã xây source |
| V0.2.0 | Isometric World & Camera | Map 2.5D từ seed, chunk/culling/LOD, minimap, chọn ô, pan/pinch, WebGL/Canvas; kiểm logic và render Canvas. GPU, tải lạnh/ấm và thiết bị thật cần nghiệm thu deployment | Đã xây source |
| V0.3.0 | Simulation & Save Engine | Worker deterministic, ngày/mùa, x1/x2/x4/pause, snapshot/delta/recovery, lease thiết bị, retention và thống kê payload; kiểm Worker/SQL/HTTP, cloud và thiết bị thật cần nghiệm thu | Đã xây source |
| V0.4.0 | Construction & City Planning | Ghost preview, địa hình, footprint, xoay, đường; xác nhận bằng chạm; catalog Frozen, schema 3, lưu/khôi phục; stamp dùng chung, chunk/culling. Browser/mobile cần nghiệm thu deployment | Đã xây source |
| V0.5.0 | Population Housing & Pathfinding | Nhà ở, nhu cầu cơ bản, 20 agents, đường đi, pop cap; cloud cross-device và benchmark dân cư | Tiếp theo |
| V0.6.0 | Survival & Food | Hái/săn/nước, phần ăn, kho và hư hỏng theo lô; dữ liệu lô có vòng đời | Dự kiến |
| V0.7.0 | Workforce & Training | Nghề, tập sự, đào tạo và điều chuyển; controls chạm, batch cập nhật | Dự kiến |
| V0.8.0 | Living Ecosystem | Cây/động vật, săn mồi, tái sinh và quần thể; tải asset theo sinh cảnh | Dự kiến |
| V0.9.0 | Construction & Logistics | Thi công, vật tư và tuyến vận chuyển thật; không ghi DB từng bước chân | Dự kiến |
| V0.10.0 | Seasons & Climate | Mùa theo vùng, thiên tai, lạnh/trang phục, thời tiết có mức chất lượng | Dự kiến |
| V0.11.0 | Health & Pollution | Bệnh, chăm sóc, rác và ô nhiễm theo vùng; đo tăng trưởng save | Dự kiến |
| V0.12.0 | Research & Discovery | 3 pha nghiên cứu, tiên quyết, RNG chống reroll, bằng chứng ứng dụng | Dự kiến |
| V0.13.0 | Cross-Platform Gameplay UX | HUD/cảnh báo/nhật ký, E0 tuning, baseline tải/cache/save PC/mobile | Dự kiến |
| V1.0.0 | Prehistoric Release | Chơi trọn E0 và mở E1, soak/save/recovery, đánh giá quota Free bằng tải thực | Dự kiến |
| V1.1.0 | Agricultural Revolution | E1 trồng trọt, chăn nuôi, trâu/ngựa, thủy lợi; tải gói E1 và giữ E0 | Dự kiến |
| V1.2.0 | Bronze Age | E2 khảo sát mỏ, luyện/đúc đồng, nghề/công cụ; ngân sách chuỗi luyện kim | Dự kiến |
| V1.3.0 | Iron Age & Ancient Society | E3 sắt, đường/cầu/chợ, vận tải và xã hội; benchmark đường/dân/save | Dự kiến |
| V1.4.0 | Medieval Civilization | E4 trường/thư viện/y tế/thủ công; gói tài nguyên E4 | Dự kiến |
| V1.5.0 | Scientific Revolution | E5 phòng thí nghiệm, hóa học, cơ khí và prototype; manifest/version mới | Dự kiến |
| V1.6.0 | Industrial Revolution | E6 hơi nước, than/thép, nhà máy/đường sắt, chất thải; profiling tải nặng | Dự kiến |
| V1.7.0 | Electrification | E7 mạng điện/nước/kho lạnh, mất điện và ưu tiên; đo save hạ tầng | Dự kiến |
| V1.8.0 | Modern Civilization | E8 điện tử/robot/tự động hóa/năng lượng mới; audit asset E0–E8 và save lớn | Dự kiến |
| V2.0.0 | Complete Civilization Release | QA chiến dịch, tối ưu PC/mobile, cân bằng, recovery, CDN rollback và báo cáo chi phí thực | Dự kiến |

Mỗi bản kế thừa chức năng trước, có typecheck/lint/tests/build và smoke test thiết bị theo khả năng xác minh thực. Không coi nút/menu dữ liệu là gameplay đã hoàn tất. Không sửa Master Data khi chưa được yêu cầu.

## Hotfix nền tảng

V0.1.1 — Vercel Deployment Hotfix: sửa production build và gói source; giữ 23 mốc gameplay. Không cần migration mới.

V0.1.2 — Proxy Path Compatibility Fix: sửa entry/import tương thích khi repo có proxy ở gốc hoặc src. Không thêm mốc gameplay; đã kế thừa trong V0.2.0.

## Mốc điều kiện

- V0.5: camera, xây, nhà ở, dân đi và chuyển thiết bị.
- V1.0: E0 chơi được, tiến E1, không mất/nhân đôi tài nguyên.
- V1.8: toàn bộ E1–E8 vận hành trên cùng thế giới.
- V2.0: QA dài hạn và tối ưu/cân bằng thực tế.

V0.1 chưa cần lease simulation do không tiến tick; revision bảo vệ sửa cấu hình. V0.3 phải hoàn thiện lease trước khi chạy mô phỏng nhiều thiết bị.

## V0.3.0 — Simulation & Save Engine

Clock theo CFG001/002/008/035, Worker cố định bước, RNG/cursor; full head + lịch sử full/delta, SHA-256 và khôi phục tạo revision mới. Lease 75 giây, heartbeat 20 giây, epoch fencing. Bản tạm theo tài khoản/world/tab, đối chiếu revision trước phục hồi, không tự ghi đè khi xung đột. Migration 002 sau 001; giữ generator/map và trạng thái ban đầu. Chưa chạy dân/sinh tồn, không chạy bù offline.
