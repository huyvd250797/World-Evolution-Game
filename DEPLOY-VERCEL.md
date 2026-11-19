# Deploy World Evolution V0.11.0 — Health & Pollution

Không cần localhost/npm trên máy Boss.

1. Với project V0.10 đã chạy 001–009: sao lưu project, chạy một lần **infra/supabase/migrations/202611190010_health_pollution.sql** trong Supabase SQL Editor. TXT V0.11 gửi kèm là đúng nội dung SQL010. Project mới chạy 001 → 010 theo thứ tự; không chạy lại migration đã áp dụng.
2. Giải nén ZIP, đưa tất cả file/thư mục vào gốc repo hiện tại, cùng cấp package.json. Ghi đè file trùng; giữ database/repo/Vercel/env. Không chỉ upload src hoặc bỏ data/generated/scripts/public/infra.
3. Vercel: Next.js, Root Directory `.`, Node24.x, Install `npm ci`, Build `npm run build`, Output mặc định. Push branch đã kết nối; redeploy commit mới nhất. Không chọn static export/out.
4. Giữ NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY; asset base để trống dùng Vercel/CDN. Auth Site URL và Redirect URLs callback/confirm theo domain HTTPS. Không expose schema private.
5. Chạy infra/supabase/verify_health.sql: 12 bệnh, 14 ô nhiễm, 18 nguồn phát thải, schema validator hiện tại và private client read=false.
6. Mở world cũ: đúng seed/tick/20 ID/cargo/hạn/nghề/khí hậu. Health bắt đầu tại tick cũ, không chạy bù quá khứ. Lưu schema10 rồi reload; kiểm nghỉ bệnh, hiệu suất, rác và lớp phủ/chú giải. Tắt lớp phủ không thay simulation.
7. Kiểm cơ chế lease: thiết bị khác quan sát, tiếp quản rõ ràng; bản cũ không ghi đè sau tiếp quản. Thử offline/bản tạm/lịch sử theo docs/VERIFICATION.md.

Cơ sở y tế/vệ sinh chưa mở khi chỉ có T001: app báo rõ thiếu điều kiện, không tự cấp nghề/vật tư. Không sửa DB sản xuất để giả fixture. Các bệnh/ô nhiễm công nghiệp cần tuyến sản xuất chưa có nên không tự xuất hiện. Chi tiết phạm vi/policy trong docs/HEALTH-POLLUTION.md.

Thiếu metadata/function: kiểm đúng project và SQL010 sau009; không reset database. Lỗi scripts/catalog.ts hoặc ./lib/config: kiểm upload đủ source, Root Directory, Build Command, giữ cả hai proxy entry alias. Đổi biến NEXT_PUBLIC phải redeploy.

Sau lưu schema10 cần V0.11/hotfix tương thích để ghi tiếp; dùng app hiện tại phục hồi lịch sử cũ. Chưa deploy vào tài khoản Boss; browser/mobile/GPU và quota thật cần nghiệm thu.
