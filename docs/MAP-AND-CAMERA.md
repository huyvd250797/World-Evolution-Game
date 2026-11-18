# Isometric World & Camera V0.2.0

## Hành vi

Mở một thế giới ở danh sách để tải module bản đồ, Worker và atlas E0. Bản đồ có 65.536 ô (256 × 256), chia 256 chunk 16 × 16. Điểm khởi đầu là đất gần sông. Không cấp thêm công trình hoặc kho hàng. Các nguồn tự nhiên chỉ để khảo sát, chưa phải số lượng có thể khai thác trong kho.

Cùng seed và khí hậu B01–B07 sinh cùng terrain/elevation/resources/variation. Seed giống nhau nhưng khí hậu khác có thể cho địa hình khác. Generator `we-map-1` dùng hash/noise số nguyên và typed arrays, không dùng Math.random/thời gian. Sông chính liên tục; tuyết ở vùng lạnh, rừng có loại cây theo khí hậu. Tài nguyên dùng ID/nhãn E0 Canonical: R001, R045, R052, R053, R054, R061, R062. Không thay workbook hoặc catalog Frozen.

Map được tái tạo từ seed/climate mỗi lần mở, không upload mảng 65.536 ô vào Supabase. Worker chuyển quyền sở hữu bốn Uint8Array buffers cho UI rồi kết thúc; abort/timeout cũng kết thúc Worker. Không tiến tick, chưa sinh lối đi, dân đi lại, sản lượng hay khai thác. Trạng thái E0/ngày 1/20 dân/tạm dừng được đọc từ world hiện có.

## Camera và khảo sát

| Thao tác | Kết quả |
| --- | --- |
| Kéo chuột trái/giữa, vuốt một ngón | Pan camera, giới hạn tâm trong bản đồ |
| Cuộn chuột, chụm/mở hai ngón | Zoom quanh con trỏ/trung điểm hai ngón |
| Click/chạm không kéo | Chọn mặt trên của ô, hiện tọa độ, địa hình, cao độ và nguồn tự nhiên |
| Nút ± | Zoom quanh tâm màn hình, dùng dự phòng trên điện thoại |
| Home / nút ngôi nhà | Về điểm khởi đầu |
| Xem toàn bản đồ | Fit toàn khu vực bằng LOD |
| Minimap | Hiện vùng nhìn và tâm camera; chạm/kéo để chuyển vùng |
| Mũi tên/WASD, +/−, Escape | Pan, zoom, bỏ chọn khi canvas có focus |
| Mở rộng | Bản đồ phủ viewport, Escape thu gọn |

Drag quá 6 CSS pixel, pinch và pointercancel không tạo lựa chọn nhầm. Canvas dùng pointer capture và touch-action:none; vùng ngoài map vẫn cuộn trang. Nút và panel không truyền tương tác xuống canvas. Camera/ô chọn/chất lượng chỉ giữ trong phiên, không ghi cloud hoặc đồng bộ giữa thiết bị.

## Renderer và tải tài nguyên

PixiJS 8.23.0 WebGL dùng atlas PNG 1024 × 800, 38 frame (28 nền, 10 đối tượng). Nền và đối tượng có lớp riêng; sắp thứ tự theo độ sâu isometric. Cao độ thể hiện bằng mặt bên và vị trí nâng. Sprite không có animation trong bản này. Asset SVG là nguồn tự tạo để tái xuất PNG bằng Sharp. Tên `world-e0-atlas-v1` phải tăng nếu đổi nội dung sau phát hành.

Atlas được load khi mở thế giới, dùng một texture chung cho toàn bộ chunk. Reference counting và cleanup tuần tự tránh unload nhầm khi React remount. Thoát màn giải phóng scene, canvas, texture, observer, listener, timer và Worker. Chỉ render khi có thay đổi; không có vòng ticker liên tục. WebGL thất bại khi khởi tạo thì chuyển Canvas 2D với chất lượng Nhẹ và cùng atlas. Canvas lỗi mạng có timeout/thử lại ở UI.

Chunk ngoài vùng nhìn không vẽ; WebGL giữ cache chunk LRU tối thiểu 48 hoặc số visible +12, loại chunk cũ khi vượt giới hạn. Zoom xa dùng bước mẫu 2/4/8 để giảm sprite, ẩn đối tượng ở stride ≥4. Bản đồ logic vẫn đủ ô; hình khi zoom xa là khái quát hóa, có thể lược chi tiết sông/tài nguyên hẹp. Nhẹ giảm mật độ cây/đá, Canvas luôn dùng Nhẹ. Pixel ratio tối đa 1.5 WebGL /1.25 Canvas. Chưa đo FPS/texture memory trên GPU điện thoại thật nên không cam kết 60fps.

Tệp được phục vụ từ Vercel/CDN; Supabase chỉ lưu auth/world metadata/initial state. Để `NEXT_PUBLIC_ASSET_BASE_URL` trống là đủ. CDN riêng phải chứa nguyên `/assets` và cho phép CORS tải JSON/PNG, không cần bucket Supabase Storage. Worker JS vẫn được đóng gói cùng ứng dụng Next.

## Bảo trì và xác minh

- `npm run assets:world`: sinh atlas từ SVG tự tạo và cập nhật manifest checksum.
- `npm run map:qa`: chạy renderer Canvas thật qua thư viện native và ghi ảnh near/far cho B01/B02/B06 vào `qa-map-out`. Đây không phải ảnh chụp trình duyệt.
- `npm test`: khóa digest generator, kiểm 7 khí hậu, ID tài nguyên, connected river, camera/zoom/picking, pan/pinch/cancel, culling/LOD và pixel output Canvas.
- `npm run typecheck`, `npm run lint`, `npm run data:check`, `npm run build`: kiểm kiểu, import runtime, checksum và production bundling.
- `npm run test:http`: kiểm luồng auth/world cũ qua Next/SDK/RPC trên fixture PostgreSQL, không thực thi client WebGL.
- `npm run test:ui`: Playwright smoke test khi môi trường có Chromium. iPhone Safari/Android và GPU thật cần kiểm trực tiếp sau deploy.

`we-map-1` và golden digest không được thay chỉ để test pass. Khi nâng generator cần version routing/migration rõ ràng để thế giới đã xây không đổi địa hình. V0.3 bổ sung version vào snapshot/save engine khi bắt đầu lưu thay đổi bản đồ. Không sửa migration 001 đã áp dụng.
