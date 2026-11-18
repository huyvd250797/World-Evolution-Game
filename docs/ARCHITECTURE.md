# Kiến trúc mở rộng V0.4.0

Planning model/catalog/overlay/editor tách khỏi engine/map. Worker kiểm lệnh, API kiểm full snapshot và SQL kiểm structural/lease/occupancy. Schema 2 được decode nâng thành 3, thêm planning-v1; không sửa Frozen/map/RNG. Xem CITY-PLANNING.md. Các mục dưới mô tả nền kế thừa.

# Thay đổi build V0.1.1

Production build dùng catalog JSON có sẵn và verify-release.mjs chạy Node thuần. Importer Excel và SQL generation chỉ phục vụ bảo trì/CI. tsconfig.json chỉ kiểm ứng dụng; tsconfig.tools.json kiểm đầy đủ công cụ/test qua npm run typecheck. Các kiểm tra Frozen và quyền database vẫn giữ nguyên.

# Kiến trúc V0.3.0

## Luồng tài khoản và dữ liệu

Browser → Server Action → Supabase SSR client (cookie, public key, validated user) → RPC → private implementation → PostgreSQL. Trang dữ liệu riêng kiểm tra user ở server; proxy refresh cookie. Không dùng service-role để vượt quyền.

Bảng worlds bật RLS SELECT theo auth.uid. User có quyền SELECT dữ liệu của mình, không có INSERT/UPDATE/DELETE trực tiếp. Public RPC là security invoker; private function là security definer với search_path rỗng, kiểm tra auth.uid và owner trong thân hàm, chỉ authenticated được execute. Không expose private qua PostgREST. V0.3 thêm simulation RPC, kiểm owner/lease/epoch/revision/checksum/schema trước khi nhận state hoặc patch.

Khởi tạo world là giao dịch database duy nhất: ID, owner, request ID, seed, khí hậu, population limit, phiên bản catalog và snapshot được ghi cùng lúc. Advisory transaction lock theo account + unique(owner, creation_request_id) ngăn retry tạo trùng. Form giữ request ID khi retry; mở một form mới được coi là yêu cầu mới.

Đổi tên/giới hạn dùng optimistic concurrency: expected revision phải bằng revision hiện tại dưới row lock; thành công tăng revision, cập nhật server timestamp. Xóa cần đúng owner, revision và tên. Hai thiết bị chỉ quản lý metadata; lease quyền điều khiển simulation chưa có vì V0.1 không chạy simulation. Lease/tick/snapshot history đã có ở V0.3; xem SIMULATION-AND-SAVE.md.

## Lưu ban đầu

- Metadata: seed, climate_id, population_limit, day=1, era=E0, population=20, revision, master_data_version=1.2, save_schema_version=1, catalog_checksum.
- initial_state: 20 người có ID ổn định, chưa có home/job; paused=true; buildings/inventories rỗng; T001 khởi nguyên đã mở.
- Không gán tuổi, sức khỏe hoặc tài nguyên khởi đầu chưa được đặc tả. Chưa mô phỏng nhu cầu hoặc sản lượng.
- Revision ghi đè trạng thái metadata hiện tại; không phải lịch sử backup. V0.1 không có save tùy ý hoặc export/import trong UI.

## Import Canonical

Đọc ZIP OOXML với fflate và fast-xml-parser; resolve workbook relationships, shared strings, namespace prefix, địa chỉ ô, giá trị cache công thức. Không sửa hoặc lưu lại workbook. Bản phát hành có source checksum đã khóa trong frozen.json.

Catalog giữ tên sheet, tiêu đề, mô tả, hàng header và tất cả hàng dữ liệu không rỗng; kiểu string/number/boolean/null được giữ. JSON không chứa thời điểm build để kết quả lặp lại có checksum như nhau. Build kiểm tra JSON, source và SQL generation đồng nhất.

Validation gồm số sheet và số lượng catalog cốt lõi, thiếu/trùng khóa đầu tiên trong bảng nghiệp vụ, foreign key có header ID rõ ràng, mã thời đại và polymorphic technology links. 5.984 tham chiếu được kiểm ở baseline. Không tự diễn giải nội dung văn bản như “nhiên liệu”, “đầu ra mô tả” thành định lượng gameplay. Validator cấu trúc không chứng minh toàn bộ 240 giờ cân bằng hoặc mọi chuỗi đều chơi được; các bản gameplay sau bổ sung evaluator/fixtures theo phạm vi.

## Asset

`data/generated/assets.json` giữ ID, URL phiên bản, size byte và SHA-256. `assetUrl()` đọc optional HTTPS base URL để tách hosting asset. Chỉ file tĩnh có tên phiên bản được cache immutable. Chỉnh nội dung sau khi phát hành phải tăng tên URL/version; công cụ manifest không tự upload sang CDN.

SVG minh họa tự tạo, không dựa vào file ảnh người dùng. Không có server render từng frame, không upload đồ họa vào database. Catalog lớn chỉ dùng ở pipeline Node; UI chỉ nhận summary nhỏ.

## Phạm vi PWA và hiệu năng

Responsive CSS, safe area và manifest cài đặt cơ bản; không có offline game, service worker cache private data, background simulation hoặc push. Renderer PixiJS, chunk/LOD, camera cảm ứng và Worker sinh bản đồ có ở V0.2.0; tick/recovery có ở V0.3.0. Không tải thư viện renderer nặng trước khi dùng.

## Giới hạn xác minh

PGlite kiểm tra PostgreSQL SQL/RLS/privileges thực trong máy cục bộ. Fixture HTTP mô phỏng GoTrue/PostgREST để chạy qua chính Supabase SSR SDK và Next Server Actions. Không dùng fixture cho production. Chưa xác minh project Supabase, SMTP, token email thật hoặc deployment của chủ dự án; cần smoke test sau cấu hình.

## Bản đồ V0.2.0

Xem [MAP-AND-CAMERA.md](MAP-AND-CAMERA.md). Map suy ra từ seed/climate đã lưu, không thêm cột hoặc snapshot map vào PostgreSQL. `we-map-1` là thuật toán bất biến cho thế giới của V0.2.0; test khóa digest. Khi có generator mới cần lưu/định tuyến version để thế giới cũ không đổi địa hình. Camera thuộc phiên, không cập nhật revision cloud. Mọi quyền tài khoản và RPC giữ nguyên.

## Simulation V0.3.0

[SIMULATION-AND-SAVE.md](SIMULATION-AND-SAVE.md) mô tả clock/Worker, session controller, full/delta ledger, SHA-256, idempotency, lease fencing, local recovery và giới hạn. `initial_state` vẫn schema 1, immutable; engine mutable state là schema 2 trong bảng private riêng. Metadata revision và simulation revision độc lập.
