# World Evolution V0.4.0 — Release checks

Ngày kiểm: 18/11/2026. Nguồn: ZIP V0.3.0 Boss đính kèm.

| Kiểm tra | Kết quả |
| --- | --- |
| Typecheck app + tools/tests | Đạt |
| ESLint | Đạt, không warning ở lần kiểm cuối |
| Unit/integration | 52 tests/subtests đạt, 0 lỗi |
| Planning adapter | 166 công trình: ID/tên/era/công dụng/tech/BOM khớp Frozen; footprint tách technical planning-v1 |
| Placement/routes | Rotation, bounds, water, slope, site, tech/era, occupancy, L-route/path limits/intersections đạt |
| Migration 003 | Giữ raw legacy head/history byte, schema 2 đọc nâng 3, full/delta/restore và deny direct catalog access đạt |
| Worker/session | Plan command qua Worker thật, full save; lost ACK/fencing/expiry/offline/reconnect/local recovery kế thừa đạt |
| Native Canvas | Ghost valid/invalid khác pixel, culling/cleanup; đã render/xem composite bốn nền + một tuyến |
| HTTP fixture Next + Supabase SDK | Auth/world lifecycle, sim open/save/retry/history/restore, full planning save/load, locked building và planning delta bị từ chối, CSRF/auth/input đạt |
| data:check | Đạt: Frozen 38 sheet/5.984 refs, SQL baseline/assets/planning adapter |
| Production build | Đạt Next.js 16.4.6 Turbopack, pages/Proxy và API simulation |
| Kế thừa byte | Workbook/catalog/summary/assets manifest, 001/002, map generator/camera/render, proxy và toàn bộ assets không đổi |
| Browser/thiết bị thật | Chưa xác minh; môi trường Chromium bị chặn socket, không coi Playwright đã đạt |
| Supabase/GitHub/Vercel thật | Chưa kết nối hoặc deploy vào tài khoản Boss trong lần bàn giao này |

Gói ZIP được giải nén và cài dependency sạch để build lại trước khi bàn giao. Không có node_modules/.next/cache/log/QA images/secret trong ZIP.

**Migration bắt buộc từ V0.3:** chạy `202611180003_city_planning.sql` một lần sau 001/002. TXT đi kèm giống SQL 003 byte-for-byte. Không chạy lại 001/002/reset database.

Master source SHA-256 `9583ccb1398a0e45dc1c4e415b9749f5a22c3f7b24dd403df92ecd675c42836c`; catalog SHA-256 `b375ca03e5123d07ddd9a317a3e75b607f91c680bd69e72198b97e980013a5ea`. Không đổi Master Data Frozen.

Chi tiết phạm vi/quy tắc/giới hạn/rollback: docs/CITY-PLANNING.md. Checklist live: docs/VERIFICATION.md. Bản này chỉ quy hoạch, chưa thi công/vật liệu/nhà ở/dân di chuyển.
