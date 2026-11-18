# World Evolution V0.3.0 — Release checks

Ngày kiểm tra: 18/11/2026. Nguồn nâng cấp: ZIP V0.2.0 Boss đính kèm.

| Kiểm tra | Kết quả |
| --- | --- |
| Typecheck app + tools/tests | Đạt |
| ESLint | Đạt |
| Unit/integration | 47 tests/subtests đạt, 0 lỗi |
| Engine golden vector | Xorshift32 + we-sim-1 seed BOSS-2026/cursor khóa bằng test |
| Clock/calendar | CFG001/002/008/035, season ranges Frozen, x1/x2/x4/pause/partial tick/RNG resume đạt |
| Worker thật | Chạy/pause/x4/snapshot và lease-expiry tự pause đạt qua node worker bridge |
| Session + Worker + PostgreSQL | Lost ACK retry, reconnect/local recovery, offline/visibility pause, fencing, sửa corrupt head, storage denied đạt |
| SQL 001→002 | Ownership/privileges, lease/epoch/expiry, idempotency/conflicts, full/delta/reconstruct/prune/restore/cascade đạt |
| HTTP Next + Supabase SDK fixture | Auth/world lifecycle và simulation open/save sang ngày 2/retry/history/restore/CSRF/input validation đạt |
| data:check | Đạt; 38 sheet, 5.984 tham chiếu, catalog/SQL baseline/asset checksums |
| Production build | Đạt; Next.js 16.4.6 Turbopack, `/api/simulation`, các trang và Proxy |
| Kế thừa byte | Workbook/catalog/summary/asset manifest/SQL 001, map generator/camera/controller/render, proxy và toàn bộ assets giống ZIP V0.2.0 |
| Playwright | Đã thử 5 specs, Chromium bị chặn socket trước mở trang; chưa xác minh UI/browser qua suite này |
| GPU/Safari/Android/Supabase/Vercel thật | Chưa xác minh trên dịch vụ/thiết bị của Boss |

Migration mới bắt buộc: `202611180002_simulation_save.sql` sau 001. File TXT riêng chứa đúng SQL 002; không chạy lại 001 và không reset database.

Master Data SHA-256: `9583ccb1398a0e45dc1c4e415b9749f5a22c3f7b24dd403df92ecd675c42836c`.
Catalog SHA-256: `b375ca03e5123d07ddd9a317a3e75b607f91c680bd69e72198b97e980013a5ea`.
Generator bản đồ vẫn `we-map-1`, snapshot engine `we-sim-1` schema 2. Không thay Master Data Frozen.

Gói source chứa code ở gốc ZIP, cấu hình/lockfile, migrations và tài liệu. Không chứa node_modules/.next/cache/log/trace/screenshot hoặc secret. Việc build lại gói giải nén dùng dependency cài sạch được kiểm tra trước bàn giao. Chi tiết phạm vi và checklist live trong docs/VERIFICATION.md.
