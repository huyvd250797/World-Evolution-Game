# Xác minh V0.8.0 — Living Ecosystem

Kết quả cuối: ../RELEASE-CHECKS.md. Source nền V0.7.0, giữ dữ liệu Frozen và migrations cũ.

## Kiểm tự động

- App/tools/tests typecheck, ESLint, data:check, release checksum, production build và clean-install/build từ source ZIP.
- 84 tests/subtests gồm toàn bộ regression Auth/world/proxy/map/Canvas/planning/population/survival/workforce/save và ecology mới.
- Canonical adapter 52 loài, 10 sinh cảnh, 14 cạnh food web, đúng products/range/regen/season/diet. Phân bố lặp lại ở 7 khí hậu, bounds và habitat passability, không spawn vật nuôi.
- Legacy 6 giữ nguồn cạn/deadline, IDs/cargo/TTL/workforce; ecology mới khởi tạo theo tick lưu, không chạy bù offline.
- Khảo sát ngoài tầm bị chặn, đặt chỗ không sinh hàng/trừ stock ngay, người khác không thu cùng nguồn; actual gather/carry/delivery và checksum reload không reset expiry hoặc nhân sản phẩm.
- Regeneration đủ minimum và season; committed harvest không chạy lần hai. Chuyển timer batch/speed/pause giữ chính xác RNG/cạnh/vị trí.
- Predators chỉ ăn linked prey gần/tiếp cận được, không tùy ý ăn loài khác; finite biomass khiến thiếu thức ăn suy giảm. Birth maturity/food/season, sức chứa vùng và total cap có kiểm.
- Basic hunt đủ nghề/camp/tools fixture: một con sống/đặt chỗ, hoàn tất mới giảm con và có đúng sản phẩm; không tạo thịt từ rừng trống hoặc dùng một tool hai lần.
- SQL 007 giữ raw schema 6/history, lưu actual in-transit ecology cargo, RNG/knowledge/reservation, restore và R061; rejects malformed plants/duplicate animals/delta/foreign owner/private reads.
- Worker bridge thực + session: commands, snapshot, lease expiry/fences, lost ACK/retry, offline/local recovery. Test lease dùng cửa sổ đủ rộng cho payload lớn, vẫn kiểm expiry thực.
- HTTP Next/Supabase SDK fixture: auth/SSR/actions, world lifecycle, save/history/restore, bad actor IDs và ecology delta; không coi fixture là Supabase cloud thật.
- Native Canvas thực vẽ/pick fauna, source sprites và chunk/LOD; đã xem composite QA, không phải ảnh giả mô phỏng UI.

## Giới hạn

Chưa chạy Playwright/browser, Safari/iPhone/Android, GPU/60fps hoặc dịch vụ thật của Boss. tests/ui/ecology.spec.ts có sẵn; môi trường nền chặn socket Chromium. Không cam kết quota Free hoặc tốc độ thiết bị khi chưa đo thực tế.

Catalog đầy đủ không đồng nghĩa mọi loài đã spawn: runtime 9 nguồn/15 fauna trên các habitat we-map-1 hỗ trợ. Sinh thái tự nhiên và thu hoạch dùng ngay; săn cư dân vẫn cần nghề/công cụ/trại hoàn thành, chưa tự cấp. Chưa có vật nuôi, săn nhóm/combat, bệnh, corpse hoặc thời tiết đầy đủ. Chính sách kỹ thuật riêng trong LIVING-ECOSYSTEM.md.

## Nghiệm thu sau deploy

1. Chỉ chạy 007 sau 001–006 trước deploy; giữ env/repo/database. verify_ecology.sql: species=52, private grants=false.
2. Mở world cũ: seed/tick/20 IDs/camera/planning/nghề/tiến độ/cargo/lô/hạn còn nguyên. Lưu schema 7 trước chuyển thiết bị.
3. Hệ sinh thái: zoom/pan/minimap, nguồn/động vật trong viewport, depth/LOD/culling, pause/x1/x2/x4; zoom xa không làm mất dân/con vật trong thống kê.
4. Chọn nguồn, đọc stock/cap/deadline/mùa; nguồn đã biết/unknown khác nhau. Đưa người đến gần khảo sát; pan/pinch không gửi lệnh.
5. Giao thu hoạch với xác nhận; chưa đến/chưa làm đủ thì hàng=0, sau đó carried rồi deposit/FEFO. Lưu giữa chặng và reload, kiểm source/cargo/expiry/reservation không đổi sai.
6. Con mồi còn sống, săn tự nhiên giảm đúng loài, không có hàng người chơi từ natural kill. Săn cư dân thiếu điều kiện phải báo rõ; không tạo thịt khi chọn rừng trống.
7. Thấy nguồn cạn/biomass thấp/cảnh báo suy giảm; đúng mùa/deadline mới phục hồi. Catalog 52 loài/food links đọc đầy đủ tên trên PC/mobile.
8. Dọc/ngang/mở rộng: bảng cuộn/thu gọn, Hủy trái/Xác nhận phải, không tràn ngang. Kiểm lease/takeover, offline/local recovery/history trên hai máy; đo RAM/FPS/payload/traffic project thật.
