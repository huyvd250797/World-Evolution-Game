# World Evolution V0.9.0 — Release checks

Ngày: 19/11/2026. Nền: World-Evolution-V0.8.0-Living-Ecosystem(1).zip Boss đính kèm; đã đối chiếu toàn bộ 171 file đầu vào với nền trước khi sửa.

| Kiểm tra | Kết quả |
| --- | --- |
| Typecheck app + tools/tests | Đạt |
| ESLint | Đạt, không warning |
| data:check | Catalog/SQL baseline/assets/planning/population/survival/workforce/ecology/construction adapters đạt |
| Unit/integration | 96 tests/subtests đạt, 0 lỗi |
| Construction cuối | 12 tests đạt sau kiểm bổ sung SQL entrance/time/BOM và renderer; không nới assertion nghiệp vụ để bỏ lỗi |
| BOM/khởi đầu | Đúng định mức Frozen/MOV001, không cấp vật tư/nghề; thiếu vật tư/đào tạo/công nghệ không tăng công |
| Thi công | Đi tới mới làm, full BOM, pause/resume/cancel, consume một lần, nhà 5 giường và không vượt sức chứa |
| Vận chuyển | Giữ chỗ, pickup/delivery thật, không trùng việc, lô giữ createdTick/age/TTL; reload, spoil/recovery và reservation không bị FEFO/chế biến lấy mất |
| Determinism | Batch/x1/x2/x4/pause/checksum reload giữ construction/citizens/lots; clock/ecology regression đạt |
| SQL 008 | PGlite 001–008; giữ raw schema 7/history, round-trip vật liệu đang mang và nhà hoàn thành, reject cargo/yard/home/work giả, owner/private/delta fences |
| HTTP | Next SSR/actions/API + Supabase SDK/Auth/PostgREST fixture; schema 8 cargo thật round-trip, duplicate yard/unsafe construction delta bị từ chối; luồng cũ đạt |
| Rendering | Native Canvas actual pixels: nền/đang thi công/nhà hoàn thành/bãi khác nhau, culling; đã xem composite renderer QA |
| Production | npm run build đạt; cài sạch npm ci và build lại từ chính ZIP bàn giao |
| Bảo toàn | 26 baseline files: Frozen workbook/catalog/adapters cũ, migrations 001–007, assets, map generator, proxy entries và session proxy giữ nguyên byte |

Browser/Playwright **chưa chạy**; spec construction bổ sung và compile, môi trường trước đó chặn Chromium socket. Chưa nghiệm thu Safari/iPhone/Android, GPU/WebGL/60fps, Supabase/Vercel thật hoặc OS kill/suspend; không coi Canvas/HTTP fixtures là thiết bị/cloud thật. Chưa push/deploy vào tài khoản Boss.

**Gameplay:** bãi và vận chuyển lô đã thu hoạt động; công trường hiển thị BOM/khóa/chờ. Thế giới khởi đầu chưa đủ tech/đào tạo J008/nguồn nguyên liệu để xây từ số 0. Nhánh thi công hoàn thành và cơ sở dùng fixture đủ điều kiện, không tặng điều kiện vào world sản xuất. Các chính sách kỹ thuật, giới hạn store/cooking, không có phá dỡ/xe/đường tăng tốc nằm docs/CONSTRUCTION-LOGISTICS.md.
