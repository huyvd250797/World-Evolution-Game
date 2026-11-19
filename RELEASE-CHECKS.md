# World Evolution V0.7.0 — Release checks

Ngày kiểm tra: 19/11/2026. Source nền: World-Evolution-V0.6.0-Survival-and-Food(1).zip Boss đính kèm.

| Kiểm tra | Kết quả |
| --- | --- |
| Typecheck app + tools/tests | Đạt |
| ESLint | Đạt |
| Unit/integration | 73 tests/subtests đạt, 0 lỗi |
| Data/release checks | Frozen + planning/population/survival/workforce adapters và assets khớp checksum |
| Nghề | 96 nghề/định biên khớp Frozen; J092 chưa khớp tên công nghệ giữ khóa có lý do |
| Đào tạo | Fixtures đủ cơ sở/tech/mentor: 2 chỗ B123, N ngày thật, không cộng travel/rest/thiếu mentor; đổi lại nghề cũ reset |
| Phân công | Batch nguyên nhóm, không vượt định biên, một người một assignment, không chiếm người có survival job/cargo |
| Hiệu suất | Tập sự 80/100 credit thực làm; lưu phần dư; job 450 work units hoàn thành sau đủ tick, không nhận ngay |
| Migration 006 | PGlite chạy 001–006; raw schema 5/history giữ nguyên; progress/credit save/restore, IDs/TTL/lease/role lookup private và invalid delta được kiểm |
| Worker/session | Worker source thật qua bridge; lệnh nhân sự, chặn đào tạo thiếu cơ sở, không tự cấp nghề; session save/backup và regression offline/lease/retry |
| HTTP | Next SSR/actions/API + Supabase SDK/Auth/PostgREST fixture; workforce snapshot, trùng IDs và workforce delta bị từ chối; các luồng cũ đạt |
| Production | Production build đạt; cài sạch/build lại từ chính ZIP bàn giao |
| Bảo toàn nền | 19 file baseline: workbook/catalog/adapters cũ, assets, migrations 001–005, generator và proxy entries giữ nguyên byte |

Chưa chạy Playwright/browser cho bản này; có spec workforce mới để chạy ở môi trường Chromium đầy đủ. Môi trường nền trước đó chặn Chromium socket. Chưa xác minh Safari/iPhone/Android, GPU/WebGL, Supabase/Vercel thật hoặc OS kill/suspend. Không coi các fixture/bridge là kiểm nghiệm thiết bị thật. Chưa push/deploy vào tài khoản Boss.

**Giới hạn gameplay:** bảng nhân sự/danh mục/định biên dùng ngay; đào tạo và phân vào cơ sở thật vẫn bị khóa trong world khởi đầu do thiếu công trình hoàn thành/T104/hướng dẫn viên. Các nhánh đủ điều kiện được kiểm bằng fixtures, không phải cấp miễn phí công nghệ/cơ sở. Xem docs/WORKFORCE-AND-TRAINING.md.
