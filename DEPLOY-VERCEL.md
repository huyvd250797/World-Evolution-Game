# Deploy World Evolution V0.3.0 — Simulation & Save Engine

Không cần localhost, không cài Node/npm trên máy Boss. Vercel tự cài/build.

1. **Supabase SQL Editor:** với project đang chạy V0.2.0, mở file TXT `World-Evolution-V0.3.0-Migrations.txt` hoặc `infra/supabase/migrations/202611180002_simulation_save.sql`, copy toàn bộ SQL và chạy **một lần trước deploy**. Không chạy lại migration 001 và không reset bảng. Project mới hoàn toàn cần 001 trước, sau đó 002.
2. Giải nén ZIP, upload **toàn bộ** nội dung vào gốc repository/branch GitHub đang liên kết Vercel, ghi đè file trùng. Không cần xóa repo hoặc deployment cũ.
3. Kiểm tra `package.json` version `0.3.0`, có `src/game/simulation`, `src/components/simulation`, `src/app/api/simulation/route.ts`, `verify-release.mjs`, `data/generated` và `public/assets` đầy đủ.
4. Giữ hai entry proxy dùng alias `@/lib/supabase/proxy`; không giữ import cũ `./lib/config`. Không sửa build thành gọi importer Excel/TS khi deploy.
5. Vercel: đúng repo/branch/commit mới; Root Directory chứa `package.json` (thường `.`), Framework Next.js, Node 24.x, Install `npm ci`, Build `npm run build`, Output mặc định. Giữ nguyên URL/key Supabase và asset base URL. Không dùng static export.
6. Deploy commit mới. Nếu gặp cache cũ, redeploy bỏ Use existing Build Cache.
7. Mở world cũ → seed/bản đồ/20 dân còn nguyên → panel engine tải xong ở trạng thái tạm dừng. Bấm Chạy, x4, Tạm dừng/Lưu ngay, chờ Đã lưu rồi reload để kiểm.
8. Mở tab/thiết bị khác → chỉ xem khi lease đang giữ → Tiếp quản có xác nhận. Mất mạng phải pause/giữ bản tạm, khác cloud revision không tự ghi đè. Trên điện thoại thử xoay ngang/dọc và khóa màn hình rồi quay lại.

Nếu panel báo thiếu migration: kiểm đúng Supabase project và đã chạy 002; chờ PostgREST schema cache cập nhật rồi thử lại. Không xóa database để xử lý. Nếu lease đang ở tab đã đóng, chờ tối đa 75 giây hoặc dùng Tiếp quản.

Hướng dẫn Auth/email/callback/GitHub/CDN: `docs/CONFIGURATION.md`. Thiết kế lưu/khôi phục: `docs/SIMULATION-AND-SAVE.md`. Kiểm tra thực tế và phần cần nghiệm thu thiết bị: `RELEASE-CHECKS.md`, `docs/VERIFICATION.md`.
