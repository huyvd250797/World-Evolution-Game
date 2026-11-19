# World Evolution V0.8.0 — Release checks

Ngày kiểm tra: 19/11/2026. Nền: World-Evolution-V0.7.0-Workforce-and-Training(1).zip Boss đính kèm.

| Kiểm tra | Kết quả |
| --- | --- |
| Typecheck app + tools/tests | Đạt |
| ESLint | Đạt |
| Unit/integration | 84 tests/subtests đạt, 0 lỗi |
| Catalog | 52 species, 10 habitats, 14 quan hệ ăn, sản phẩm/định mức/ngày theo Frozen |
| Phân bố | Lặp lại đúng từ seed; hợp lệ đủ 7 climate; không tự tạo vật nuôi |
| Thu hoạch | Không nhận ngay; giữ chỗ, trừ stock một lần, cargo rồi delivery; reload giữ tuổi/TTL |
| Tái sinh | Loài/deadline/mùa/ô không bị chặn; legacy depleted stock/deadline giữ nguyên |
| Động vật | Movement mid-edge và RNG giữ qua reload/batching/x1/x4; predation chỉ đúng linked prey; có biomass/decline/birth cap |
| Săn | Fixtures đủ nghề/công cụ/trại: target ID thật, còn sống đến lúc hoàn tất, trừ đúng con và tạo sản phẩm Frozen; thiếu điều kiện bị chặn |
| Migration 007 | PGlite chạy 001–007; raw schema 6/history không đổi; actual cargo/RNG/knowledge save+restore, R061 không bị đổi loại; owner/private grants/delta/invalid IDs kiểm |
| Worker/session | Worker source thật, commands/lease, lost ACK, local recovery, preservation of population/workforce/survival regression |
| HTTP | Next SSR/actions/API và Supabase SDK/Auth/PostgREST fixture; schema 7, trùng animal ID và unsafe ecology delta bị từ chối; các luồng cũ đạt |
| Rendering | Native Canvas pixels/picking/culling/LOD; đã xem composite actual renderer/overlay. Đây không phải browser screenshot |
| Production | Production build và cài sạch/build lại từ chính ZIP bàn giao |
| Bảo toàn nền | 21 baseline files: Frozen workbook/catalog/adapters cũ, migrations 001–006, assets, map generator và proxy entries giữ nguyên byte |

Chưa chạy browser/Playwright cho bản này; tests/ui/ecology.spec.ts được bổ sung để chạy trong môi trường Chromium đầy đủ. Môi trường nền trước đó chặn Chromium socket. Chưa xác minh Safari/iPhone/Android, GPU/WebGL, Supabase/Vercel thật hoặc OS kill/suspend. Không coi Canvas/fixtures là nghiệm thu thiết bị thật. Chưa push/deploy vào tài khoản Boss.

Gameplay nguồn/khảo sát/động vật tự nhiên dùng được. Săn của cư dân vẫn giữ gate nghề/công cụ/cơ sở; world khởi đầu không tự mở trại hoặc tech. Runtime hỗ trợ 9 flora/15 fauna, catalog đủ 52. Chưa có thuần hóa/vật nuôi, săn nhóm hay thời tiết/bệnh đầy đủ. Các hệ số kỹ thuật ghi trong docs/LIVING-ECOSYSTEM.md.
