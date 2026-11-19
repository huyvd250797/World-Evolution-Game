# Deploy World Evolution V0.8.0 — Living Ecosystem

Boss không cần cài Node/npm hoặc localhost. Vercel tự cài và build.

1. Project V0.7 đã áp dụng 001–006: chạy **202611190007_living_ecosystem.sql một lần** trong Supabase SQL Editor, trước deploy. TXT V0.8 có đúng SQL này. Không chạy lại 001–006, không xóa dữ liệu. Project mới chạy đủ 001→007.
2. Upload toàn bộ nội dung source ZIP sau giải nén vào gốc repo/branch đang liên kết Vercel, ghi đè file trùng. Kiểm package.json=0.8.0, data/generated/ecology.json, src/game/ecology, src/components/ecology, scripts và migrations đủ. Không xóa repo/project.
3. Giữ Supabase env/asset URL. Framework Next.js, Root Directory chứa package.json, Node 24.x, Install npm ci, Build npm run build, Output mặc định. Không static export hoặc đổi build thành importer Excel. Redeploy bỏ Build Cache nếu cần dọn cache cũ.
4. Giữ proxy.ts/src/proxy.ts import alias @/lib/supabase/proxy; không dùng lại ./lib/config.
5. Mở world cũ: clock/seed/map/planning/20 IDs/nghề/cargo/lô/hạn giữ nguyên. Nội dung sinh thái mới khởi tạo một lần tại tick đang lưu; nguồn quả đã thu/cooldown cũ được giữ. Bấm Lưu ngay để ghi schema 7 trước khi thử trên thiết bị khác.
6. Chọn Hệ sinh thái → xem catalog, nguồn đã biết, động vật và thông tin vùng. Bấm Chạy, kiểm động vật di chuyển; pause đứng lại, x1/x2/x4 đồng bộ. Dấu ? chưa xác định loài; đưa cư dân tới trong 2 ô để khảo sát.
7. Giao thu hoạch → Xác nhận: chưa có hàng ngay. Đợi đi/làm/mang về; tồn kho chỉ tăng khi tới bãi, còn có thể cấp phát ngay theo FEFO. Lưu khi đang mang, reload kiểm trữ lượng/TTL/cargo không đổi hoặc nhân đôi.
8. Săn vẫn cần đúng nghề/công cụ/trại thật. Chỉ chọn con mồi tồn tại, không còn tạo thịt từ ô rừng trống. Chưa tự mở tech/cơ sở; vật nuôi và săn nhóm chưa triển khai.
9. Kiểm PC/mobile: kéo/pinch không gửi lệnh, nút Hủy trái/Xác nhận phải, dọc/ngang, thu gọn bảng, minimap, hai thiết bị/lease takeover, offline và phục hồi.

Nếu thiếu migration, kiểm đúng project và 007 sau 006, không reset DB. verify_ecology.sql và các verify_*.sql chỉ đọc metadata. Auth/CDN/GitHub/env chi tiết trong docs/CONFIGURATION.md.

Sau ghi schema 7, dùng V0.8/hotfix tương thích để ghi tiếp; app V0.7 không hỗ trợ save mới. Restore lịch sử cũ qua V0.8 vẫn được. Chưa deploy thật vào tài khoản Boss trong lần bàn giao ZIP này.
