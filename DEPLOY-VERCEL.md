# Deploy World Evolution V0.5.0 — Population Housing & Pathfinding

Boss không cần localhost/npm trên máy. Vercel tự cài/build.

1. Project V0.4.0 đã chạy 001/002/003: trong Supabase SQL Editor chạy **202611190004_population_navigation.sql một lần trước deploy**. TXT V0.5 gửi riêng có đúng SQL này. Không chạy lại 001/002/003, không xóa worlds. Project mới chạy 001 → 002 → 003 → 004.
2. Giải nén ZIP, upload toàn bộ source vào repo/branch đang liên kết Vercel, ghi đè file trùng. Kiểm package.json version 0.5.0, src/game/population, src/components/population, data/generated/population.json và infra/migrations đủ.
3. Vercel: Next.js, Root Directory chứa package.json, Node 24.x, Install npm ci, Build npm run build, Output mặc định. Giữ Supabase env và asset URL. Không static export hoặc đổi build thành importer Excel.
4. Deploy commit mới; nếu cần xử lý cache cũ, redeploy không dùng Build Cache. Giữ proxy.ts/src/proxy.ts import alias @/lib/supabase/proxy cùng logic session, không khôi phục import cũ ./lib/config.
5. Mở world cũ: tick/seed/map/quy hoạch giữ nguyên; đúng 20 ID xuất hiện trên đất hợp lệ, game tạm dừng. Dân cư → chọn ID → Chọn điểm đến → chọn ô → Xác nhận → Chạy. Đợi đi được một phần cạnh → Pause/Lưu ngay → Đã lưu → reload kiểm không teleport/nhân đôi.
6. Chỗ ở: giường thực 0 khi mới có nền planned; bốn lều dự kiến 20, không tự cấp nhà. Thử Đi tới lối vào của người đang chọn và xem blocked nếu không tìm được tuyến.
7. PC/mobile: pan/pinch/zoom, chọn trực tiếp sprite hoặc danh sách, Nghỉ/Tiếp tục, x1/x2/x4, xoay dọc/ngang, khóa màn hình rồi quay lại. Chỉ một thiết bị có lease ghi tiến trình; takeover giữ cơ chế xác nhận.

Nếu báo thiếu migration, kiểm đúng project và 004 đã chạy sau 003, chờ schema cache cập nhật rồi thử lại. Không reset DB để xử lý. Dùng verify_setup.sql, verify_simulation.sql, verify_planning.sql và verify_population.sql (read-only).

Sau khi có schema 4, app V0.4 không đọc được save mới. Không drop schema để rollback; giữ backup và dùng V0.5/hotfix tương thích. Hướng dẫn Auth/CDN/GitHub trong docs/CONFIGURATION.md; phạm vi và kiểm live trong docs/POPULATION-AND-PATHFINDING.md, docs/VERIFICATION.md.
