# Deploy World Evolution V0.6.0 — Survival & Food

Boss không cần localhost/npm trên máy. Vercel tự cài và build.

1. Project V0.5.0 đã có 001–004: chạy **202611190005_survival_food.sql một lần** trong Supabase SQL Editor, trước deploy. TXT V0.6.0 chứa đúng migration này. Không chạy lại 001–004. Project mới chạy 001 → 002 → 003 → 004 → 005.
2. Giải nén ZIP, upload toàn bộ file/thư mục vào gốc repo/branch đang liên kết Vercel, ghi đè file trùng. Không xóa repo, project hoặc database. Kiểm package.json version 0.6.0, src/game/survival, src/components/survival, data/generated/survival.json, verify-release.mjs và migrations đủ.
3. Giữ Supabase Environment Variables. Framework Next.js; Root Directory chứa package.json; Node 24.x; Install `npm ci`; Build `npm run build`; Output mặc định. Không static export, không thay Build bằng importer Excel.
4. Deploy commit mới. Nếu cần xóa cache build cũ, Redeploy và bỏ Use existing Build Cache. Giữ hai proxy entry import alias `@/lib/supabase/proxy`; không dùng lại import tương đối `./lib/config`.
5. Mở thế giới cũ: đúng seed/quy hoạch/20 ID/vị trí/tick, tạm dừng. Mở Sinh tồn & thức ăn. Chọn ô có Quả rừng (bật Tài nguyên nếu cần), chọn người đứng yên, Giao việc → Xác nhận → Chạy. Thu gọn bảng để quan sát di chuyển.
6. Trước tới nguồn, tồn kho phải 0. Sau khi làm đủ thời gian, lô có nơi chứa Đang mang; tới bãi mới nhập. Lưu ngay ở giữa chuyến, chờ Đã lưu, reload, bấm Chạy và kiểm không nhân đôi sản phẩm/đổi hạn lô.
7. Màn sinh tồn hiển thị nhu cầu 20 ăn/40 nước, đã cấp, thiếu, ngày dự trữ và hạn từng lô. Nước thô không phải nước uống. Lấy nước/săn/nấu phải báo rõ điều kiện chưa đạt trong thế giới chỉ có T001 và nền planned.
8. Kiểm PC/mobile: chọn ô sau pan/pinch, xác nhận/hủy, dọc/ngang, cuộn bảng, x1/x2/x4/pause, khóa màn hình rồi quay lại, hai thiết bị và tiếp quản. Tất cả save chỉ có một thiết bị ghi tại một thời điểm.

Nếu báo thiếu schema/migration, kiểm đúng Supabase project và 005 đã chạy sau 004. Không reset dữ liệu. Dùng verify_survival.sql và các verify_*.sql read-only. Auth/CDN chi tiết: docs/CONFIGURATION.md.

Khi đã lưu schema 5, không rollback app V0.5 để tiếp tục ghi. Giữ bản sao lưu và dùng hotfix tương thích schema 5; lịch sử schema cũ vẫn phục hồi được bằng V0.6.
