# World Evolution V0.5.0 — Release checks

Ngày kiểm tra: 19/11/2026. Nguồn: ZIP V0.4.0 Boss đính kèm.

| Kiểm tra | Kết quả |
| --- | --- |
| Typecheck app + tools/tests | Đạt |
| ESLint | Đạt, không warning |
| Unit/integration | 59 tests/subtests đạt, 0 lỗi |
| Population data | CFG003/053/059 và 8 home capacities khớp Frozen |
| IDs/navigation/movement | 20 saved IDs, deterministic spawn 7 climates, BFS/cache/obstacle/no-path, progress/rest/resume/replan/x1/x2/x4 đạt |
| Housing model | Projected/actual separation, completed-only capacity/allocation/reachability, no free beds đạt; game chưa có completed homes |
| Migration 004 | Legacy raw bytes + schema upgrade/customIDs/partial path restore; malformed IDs/path/progress/free beds/downgrade/fencing reject đạt |
| Worker/session thật | Move/save giữa cạnh + lost ACK, offline, local recovery, lease kế thừa đạt |
| HTTP Next/SDK fixture | Auth/world/sim/planning/population save-load và security/input checks đạt |
| Native Canvas | People/pick/culling/cleanup, visible animation flag; composite 20 người/bốn nền lều đã xem |
| data:check | Đạt Frozen38sheets/5.984refs, SQL baseline/assets/planning/population adapter |
| Production build | Đạt Next.js16.4.6 Turbopack, pages/Proxy/API |
| Kế thừa byte | Workbook/catalog/summary/assets/planning adapter/001–003/map/camera/base render/proxy giữ nguyên |
| Browser/mobile/GPU thật | Chưa xác minh; không báo Playwright đạt khi môi trường chặn Chromium |
| Supabase/GitHub/Vercel thật | Chưa kết nối/push/deploy vào tài khoản Boss trong lần bàn giao source |

Gói ZIP được giải nén và build lại với dependency cài sạch trước bàn giao. Không chứa node_modules/.next/cache/log/QA screenshots hoặc secret thật.

**Nâng từ V0.4:** chạy `202611190004_population_navigation.sql` một lần, không chạy lại 001/002/003/reset database. TXT riêng khớp SQL004 byte-for-byte. Schema4/we-sim-2 không đọc được bằng clientV0.4, không drop schema để rollback.

Master SHA-256 `9583ccb1398a0e45dc1c4e415b9749f5a22c3f7b24dd403df92ecd675c42836c`; catalog SHA-256 `b375ca03e5123d07ddd9a317a3e75b607f91c680bd69e72198b97e980013a5ea`. Không sửa MasterDataFrozen. Game không cấp giường từ nhà quy hoạch, không tự thêm tử vong khi chưa có survival.

Chi tiết hành vi/giới hạn/housing/rollback: docs/POPULATION-AND-PATHFINDING.md. Checklistlive: docs/VERIFICATION.md. Hướng dẫn Vercel không cần localhost: DEPLOY-VERCEL.md và README.md.
