# World Evolution V0.11.0 — Release checks

Ngày 19/11/2026. Nền: World-Evolution-V0.10.0-Seasons-and-Climate(1).zip Boss đính kèm, 196 file nguồn. Không deploy vào tài khoản cloud của Boss trong phiên làm việc này.

| Kiểm tra | Kết quả |
| --- | --- |
| data:check | Workbook/catalog Frozen, SQL baseline, assets, adapters cũ và adapter/metadata SQL health đạt |
| Typecheck | App, tools, tests và Next route types đạt |
| ESLint | Đạt, không warning |
| Unit/integration | 128 tests/subtests đạt, 0 lỗi; gồm 17 kiểm health/SQL/Canvas mới, Worker và HTTP thêm nhánh health |
| Health dữ liệu | Exact 12 bệnh, 14 ô nhiễm, 18 nguồn phát thải, định mức rác 0,25 và thu gom4, B136 capacity4/B138 capacity70 |
| Cá nhân/clock | Giữ 20 IDs; incubation/course/recovery riêng; rest không chữa tức thời; speed/batching/pause/RNG/reload nhất quán |
| Lây/nguy cơ | Không tự sinh hô hấp khi không có nguồn; chỉ tiếp xúc gần có triệu chứng, cold không phát tán như D005; nguồn/era chưa có bị khóa |
| Công việc | Health credit nguyên; nghỉ không tạo sản lượng; giữ cargo/việc; training áp sức khỏe; Worker lease/khóa việc/cancel/retry kiểm |
| Chăm sóc | Fixture cơ sở hoàn thành + nghề/tech/nhân lực thật; tới nơi mới tính; đủ vật tư trừ một lần; thiếu một loại rollback toàn bộ; không đổi ngày hết bệnh |
| Chế biến | F085 đúng input/output, TTL3 ngày, chỉ khói khi tiêu hao củi; bộ kiểm Frozen bảo vệ F086/F094; các nhánh chưa đủ điều kiện không tự mở |
| Rác | Không cộng hàng khi bấm; giữ chỗ nguồn/đích, hạn sức chứa, thu gom có thời gian, cargo/đường đi/giao thật; cancel đang mang bị chặn, mass giữ sau JSON reload/giao lại |
| Nước | Provenance nguồn/lô, boiling giữ hóa chất, unsafe water không cấp uống; haul split kế thừa metadata trong engine |
| SQL010 | PGlite001–010; raw schema9/history giữ byte, full save/restore health/RNG/waste/pollution; reject duplicate IDs/cells, sai timeline/mass/provenance, delta; owner/private catalog permissions đạt |
| Worker/session | Actual Worker/coordinator regression: lease, lost ACK, takeover/fences, local backup/recovery; thêm health rest/command/lease rejection |
| HTTP | Next SSR/actions/API + Supabase SDK/Auth/PostgREST fixtures; health schema10 snapshot/rest/waste/RNG round-trip, impossible mass/unsafe delta reject; auth/CRUD/các module trước giữ |
| Renderer | Native Canvas vẽ pixel màu thật, visible culling/cache/off/release; đã xem composite terrain thật + lớp phủ. Không phải browser screenshot |
| Production | Build production đạt; gói ZIP được giải nén mới, npm ci sạch và production build lại; xem docs/VERIFICATION.md |
| Bảo toàn | Workbook/catalog/adapters Frozen cũ, migrations001–009, assets, map generator và các proxy entries đối chiếu nguyên byte với ZIP nguồn |

## Giới hạn cần đọc

Không coi fixtures là thế giới người chơi đã mở khóa. Thế giới E0 vẫn chỉ T001; nghề/cơ sở y tế và vệ sinh cần research/bootstrap ở mốc tiếp theo. Cơ sở công nghiệp/điện/y tế tiên tiến mới đọc metadata/gates, chưa có tuyến vận hành hoặc tự xử lý. Bệnh E1–E8 chưa tự phát sinh, không bật tử vong hay nguồn nhập mầm bệnh hô hấp. F094 không thay R208 vào công thức R180 để xóa rác sinh hoạt.

Các policy kỹ thuật ngoài Frozen (liều chăm sóc, thời gian thao tác, mức sức khỏe, diffusion/decay, buffers) ghi rõ trong docs/HEALTH-POLLUTION.md. Không có benchmark 240 giờ, dân số lớn, đo quota cloud hay cam kết60fps. Browser/Playwright/mobile/GPU/hosted Supabase/Vercel chưa được kiểm trực tiếp.

Cập nhật: SQL010 sau001–009 rồi upload đầy đủ source/push Vercel. Không cần xóa repo/reset database/chạy local.
