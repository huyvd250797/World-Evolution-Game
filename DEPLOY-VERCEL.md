# Deploy World Evolution V0.9.0 — Construction & Logistics

Không cần chạy localhost/npm trên máy Boss.

1. Sao lưu Supabase project đang dùng. Nếu đã chạy 001–007 của V0.8, mở SQL Editor và chạy đúng `infra/supabase/migrations/202611190008_construction_logistics.sql` **một lần**, trước deploy. TXT V0.9 là bản sao nguyên SQL 008. Project mới chạy 001 → 008 theo thứ tự; không chạy lại file đã áp dụng.
2. Giải nén ZIP, upload toàn bộ nội dung vào gốc repo hiện tại (cùng cấp package.json), ghi đè file trùng. Không xóa repo/project/env/database. Giữ source ngoài phạm vi nếu repo có thay đổi riêng.
3. Vercel project hiện tại → framework Next.js, Root Directory `.`, Node 24.x, Install `npm ci`, Build `npm run build`, Output mặc định. Giữ hai biến Supabase và asset base tùy chọn. Push branch đã nối để tự deploy; nếu cần Redeploy, dùng commit source mới nhất.
4. Đảm bảo Supabase Auth Site URL và Redirect URLs `/auth/callback`, `/auth/confirm` đúng domain HTTPS. Chỉ expose schema public, không expose private.
5. Đăng nhập → mở world cũ → so seed/tick/20 ID/nghề/đào tạo/lô/ecology. Lưu thủ công, reload; kiểm đổi thiết bị/lease/history. Bảng Thi công nằm dưới bản đồ.
6. Đặt bãi ngoài trời ở tọa độ đi được; chọn lô đã thu và cư dân rảnh, giao vận chuyển có xác nhận; hàng chưa tới nguồn không bị trừ, chưa tới đích chưa nhập nơi nhận. Kiểm reload giữa chặng giữ tuổi/hạn và số lượng.
7. Tạo công trường từ nền mở, xem BOM/khóa. Không tự thử cấp thợ/vật tư bằng sửa database sản xuất. Chuỗi khởi đầu còn chờ nghiên cứu/nguồn vật liệu; fixture đã kiểm không đồng nghĩa world đã được mở sẵn.

`infra/supabase/verify_construction.sql` chỉ đọc metadata; kỳ vọng catalog166, resources230 và grants private=false. Nếu báo thiếu function/metadata, kiểm đúng project và 008 sau 007, không reset DB.

Lỗi thiếu scripts/catalog.ts hoặc ./lib/config: kiểm upload đủ source mới, Build Command đúng npm run build và Root Directory chứa package.json; giữ cả hai proxy.ts alias. Đổi biến NEXT_PUBLIC cần redeploy. Không đổi sang static export/out.

Sau lưu schema 8 dùng source V0.9/hotfix tương thích để ghi tiếp; V0.8 không đọc được construction mới. Lịch sử cũ vẫn khôi phục qua V0.9. Chưa deploy thật vào tài khoản Boss; kết quả tự động và phần cần nghiệm thu thiết bị thật trong RELEASE-CHECKS.md.
