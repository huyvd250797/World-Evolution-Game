# Xác minh V0.2.0 — Isometric World & Camera

## Kiểm tra tự động

- Typecheck ứng dụng + công cụ/tests, lint và production build Next/Turbopack.
- Unit/integration: Frozen workbook/catalog, input/snapshot 20 dân, PostgreSQL migration/RLS/quyền/ownership/revision, import proxy gốc/src và kiểm release thiếu/corrupt file.
- Bản đồ: golden SHA-256 của `we-map-1`, cùng seed/config có cùng 4 mảng, 7 khí hậu, sông chính liên tục, terrain/elevation/resource hợp lệ và ID/nhãn E0 khớp Canonical.
- Camera: tọa độ isometric khứ hồi, zoom giữ điểm neo, giới hạn zoom/pan, chọn ô cao/ô phẳng/ngoài bản đồ, visible chunks và LOD không thay đổi dữ liệu logic, drag/pinch/cancel không chọn ô.
- Canvas compatibility renderer: chạy renderer thật qua native Canvas; kiểm pixels thay đổi khi chọn/lưới/tài nguyên/zoom, LOD giảm đối tượng, resize và cleanup backing store. Render near/far B01/B02/B06 và xem ảnh để kiểm bố cục địa hình. Đây không phải screenshot trình duyệt.
- `data:check`: đối chiếu nguồn Frozen, JSON, SQL generation và asset size/SHA-256.
- `test:http`: protected routes, SSR cookie/session, login thành công/thất bại, registration notice, callback an toàn; tạo/mở/đổi tên/xung đột revision/xóa world qua Next Server Actions + Supabase SDK với fixture PostgreSQL.

Kết quả/lệnh cuối cùng được ghi trong `RELEASE-CHECKS.md` tại gốc source. Các kiểm tra không được báo đạt nếu chưa chạy thành công.

## Giới hạn

Môi trường kiểm source không chạy được Chromium do giới hạn sandbox socket. Có Playwright specs cho foundation và map, nhưng không coi chúng đã đạt; cũng chưa xác minh WebGL bằng GPU thật hoặc touch Safari/Android. Native Canvas không thay thế kiểm trình duyệt. HTTP fixture mô phỏng Auth/PostgREST, không chứng minh SMTP/token email thật trên Supabase của Boss. Chưa push repo hoặc truy cập deployment Vercel thật của Boss trong lần bàn giao này.

## Checklist nghiệm thu deployment

1. Deploy commit V0.2.0 trên Vercel với biến Supabase hiện có; mở world cũ, xác minh tên/seed/khí hậu/giới hạn/20 dân giữ nguyên. Không chạy SQL mới.
2. Kiểm tra Worker JS và atlas JSON/PNG trả 200; CDN riêng có CORS. Lần tải đầu/ấm và khi mất mạng phải hiện trạng thái lỗi hoặc bản đồ đúng.
3. PC: drag, wheel, ±, Home, fit toàn bản đồ, minimap, click tile; chọn địa hình cao và mép map. Drag/pinch/cancel không chọn nhầm.
4. iPhone Safari/Android: vuốt/chụm, dùng ±, chọn ô; xoay dọc/ngang, mở rộng/thu gọn, kiểm lưới/tài nguyên và cuộn ngoài bản đồ.
5. Đăng nhập cùng tài khoản trên thiết bị khác: cùng seed + khí hậu có cùng địa hình; camera có thể khác vì không đồng bộ.
6. Mở/đóng world nhiều lần, đo GPU/RAM, draw time và texture; kéo/zoom xa kiểm chunk/LOD. Thử Canvas fallback/thiết bị yếu, chọn Nhẹ. Chưa đặt cam kết FPS trước số đo thật.
7. Đăng xuất/đăng nhập, sửa cấu hình/xung đột, tài khoản khác không đọc world. Không bật tick hoặc tự lưu vị trí camera vào cloud.
