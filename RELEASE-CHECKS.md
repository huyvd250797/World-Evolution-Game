# World Evolution V0.2.0 — Release checks

Ngày kiểm tra: 18/11/2026. Nguồn nâng cấp: ZIP V0.1.2 Boss đính kèm.

| Kiểm tra | Kết quả |
| --- | --- |
| `npm run typecheck` (app + tools/tests) | Đạt |
| `npm run lint` | Đạt |
| `npm test` | 30 kiểm tra/subtest đạt, 0 lỗi |
| `npm run data:check` | Đạt; 38 sheet, 5.984 tham chiếu, SQL/asset checksum khớp |
| `npm run build` | Đạt; Next.js 16.4.6 Turbopack, production routes và Proxy |
| `npm run test:http` | Đạt auth/session và vòng đời worlds qua fixture PostgreSQL/Next/SDK |
| Bản đồ `we-map-1` | Golden SHA-256 khóa seed BOSS-2026 / B01; kiểm 7 khí hậu và camera/gesture/culling |
| Renderer Canvas | Render thật qua native Canvas; kiểm pixel, LOD, resize và cleanup; xem ảnh near/far B01/B02/B06 |
| Tính kế thừa | Workbook, catalog/summary, SQL 001, hai entry proxy và logic session giống byte với ZIP V0.1.2 |
| Playwright / WebGL GPU / Safari & Android thật | Chưa xác minh; xem docs/VERIFICATION.md |
| Supabase thật / GitHub / deploy Vercel thật | Chưa truy cập hoặc triển khai trong lần bàn giao source này |

Không cần migration mới. Không reset database. Build dùng Node verifier và catalog xuất sẵn, không phụ thuộc chạy importer Excel trong production.

Master Data SHA-256: `9583ccb1398a0e45dc1c4e415b9749f5a22c3f7b24dd403df92ecd675c42836c`.
Catalog SHA-256: `b375ca03e5123d07ddd9a317a3e75b607f91c680bd69e72198b97e980013a5ea`.
Map golden arrays SHA-256: `bb0888d7a11d99b75e67c63ea35705c79995906189f683aa8cfa54f943f9cb6d`.

Gói ZIP chứa source ở gốc để upload vào repo Vercel hiện tại; không đóng gói node_modules/.next/cache/QA images hoặc secret. Cấu hình và checklist nghiệm thu trong README.md, docs/CONFIGURATION.md, docs/MAP-AND-CAMERA.md và docs/VERIFICATION.md.
