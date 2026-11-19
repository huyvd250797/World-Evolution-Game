# Deploy World Evolution V0.7.0 — Workforce & Training

Boss không cần cài Node/npm hoặc chạy localhost. Vercel tự thực hiện Install/Build.

1. Project V0.6 đã áp dụng 001–005: chạy **202611190006_workforce_training.sql một lần** trong Supabase SQL Editor trước deploy. TXT V0.7 chứa đúng SQL này. Không chạy lại 001–005, không xóa dữ liệu. Project mới chạy đủ 001→006.
2. Upload toàn bộ nội dung ZIP sau giải nén vào đúng gốc repo/branch đang nối Vercel; ghi đè file trùng. Kiểm package.json=0.7.0, data/generated/workforce.json, src/game/workforce, src/components/workforce, scripts và migrations đủ. Không xóa repo/project.
3. Giữ Supabase env và asset URL. Framework Next.js, Root Directory chứa package.json, Node 24.x, Install npm ci, Build npm run build, Output mặc định. Không static export hoặc đổi build sang importer Excel. Nếu cần dọn cache cũ, Redeploy và bỏ Use existing Build Cache.
4. Giữ proxy.ts và src/proxy.ts import alias @/lib/supabase/proxy. Không khôi phục ./lib/config (lỗi deploy cũ).
5. Mở world cũ: seed/tick/camera/quy hoạch/20 ID/survival cargo/lô/hạn còn nguyên, game pause. Bảng Nhân sự & đào tạo dưới bản đồ có đủ 20 hồ sơ chưa tự cấp nghề. Danh mục có đủ 96 nghề, J001=5 ngày/80%, J092 hiện lý do chưa khớp công nghệ.
6. Chọn một hoặc nhiều người → Đào tạo/đổi nghề → xem điều kiện trước Xác nhận. Chưa có cơ sở hoàn thành/hướng dẫn thì Confirm bị khóa kèm lý do. Không biến blueprint thành trường hoặc tự mở T104. Định biên blueprint có mặt 0, còn thiếu theo Frozen.
7. Kiểm tiếp trên PC/mobile: lọc, chọn nhóm, tìm nghề/phân trang, Hủy trái/Xác nhận phải, dọc/ngang không tràn; save/reload và hai thiết bị/lease takeover vẫn đúng. Chức năng học đủ điều kiện cần nối cơ sở hoàn thành ở các phiên bản sau.

Nếu migration chưa có hoặc sai project, kiểm tra 006 sau 005; không reset DB. verify_workforce.sql và các verify_*.sql chỉ đọc metadata. Cấu hình Auth/CDN, GitHub, môi trường và lỗi phổ biến xem docs/CONFIGURATION.md.

Sau ghi schema 6, không dùng V0.6 để tiếp tục ghi. Dùng V0.7/hotfix tương thích; restore lịch sử cũ vẫn qua V0.7. Chưa deploy thật vào tài khoản Boss trong lần bàn giao source này.
