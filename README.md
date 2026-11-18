# World Evolution V0.2.0 — Isometric World & Camera

Game web dùng chung PC, iPhone và Android. V0.2.0 thêm bản đồ isometric tương tác từ seed vào thế giới đã lưu; giữ đăng nhập, danh sách thế giới và cloud save nền tảng của V0.1.2. Mô phỏng thời gian, xây dựng và dân đi lại thuộc các bản tiếp theo.

## Nâng cấp từ V0.1.2

Upload đầy đủ nội dung ZIP vào repo đang dùng, ghi đè file trùng rồi deploy commit mới. Không xóa repo, database hoặc thế giới. Giữ nguyên biến môi trường và Supabase project. **Không cần chạy migration mới.**

Bản đồ 256 × 256 ô dùng `we-map-1`, seed và khí hậu đã lưu. Cùng seed + cùng khí hậu luôn tạo cùng địa hình/tài nguyên trên PC/mobile. Camera và ô đang chọn chỉ tồn tại trong phiên, không đồng bộ giữa thiết bị. Generator được khóa bằng checksum test; thay thuật toán sau này phải có phiên bản mới và lộ trình tương thích save.

- Rừng, sông chính liên tục và nhánh sông, bờ sông, đồi, núi, vùng tuyết theo khí hậu. Nguồn tự nhiên liên kết ID E0 của catalog Frozen.
- Đồ họa 2.5D: atlas địa hình và cây/đá/núi riêng lớp, có cao độ.
- PC: kéo chuột để di chuyển, cuộn để zoom, click chọn ô. Mobile: vuốt một ngón, chụm hai ngón; nút ±, về điểm đầu, xem toàn bản đồ và mở rộng.
- Minimap hiển thị vùng nhìn, chạm/kéo để chuyển camera. Chọn ô xem tọa độ, địa hình, cao độ và nguồn tự nhiên.
- Web Worker sinh map; chunk 16 × 16, culling và LOD khi zoom xa; PixiJS/WebGL với Canvas 2D dự phòng. Atlas chỉ tải khi mở thế giới, dùng chung texture và giải phóng khi rời màn.

Xem [docs/MAP-AND-CAMERA.md](docs/MAP-AND-CAMERA.md) cho thiết kế và kiểm tra bản đồ.

## Sửa lỗi proxy khi cập nhật source

V0.1.2 đặt entry proxy an toàn ở cả `proxy.ts` và `src/proxy.ts`, cùng import qua alias `@/lib/supabase/proxy`. Logic session chỉ có một bản tại `src/lib/supabase/proxy.ts`. Hai entry giống nhau để cập nhật repo đang còn file proxy ở gốc từ source trước; Next chọn entry ở gốc nếu có.

Upload đầy đủ source mới vào **đúng repo và branch Vercel đang dùng**, ghi đè file trùng; không cần xóa repo. Kiểm tra trên GitHub `proxy.ts` dòng import phải là `@/lib/supabase/proxy`, không còn `./lib/config`. Giữ Root Directory chứa package.json; deploy commit mới và bỏ dùng Build Cache khi thử lại.

Không cần migration mới, không chạy lại SQL 001, giữ nguyên Supabase và biến môi trường. Master Data V1.2 và SQL khởi tạo được giữ nguyên byte.

## Deploy thẳng lên Vercel

Không cần localhost hoặc chạy npm trên máy Boss. Giải nén ZIP mới, upload **toàn bộ nội dung** vào gốc repository GitHub. Gói V0.2.0 đặt `package.json`, `verify-release.mjs`, `src`, `data`, `public` ngay tại gốc ZIP.

Trên Vercel: Framework Next.js; Root Directory `.` nếu package.json ở gốc repo; Node 24.x; Install `npm ci`; Build `npm run build`; Output mặc định. Các lệnh do Vercel tự chạy.

Thêm `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` trong Environment Variables, giữ cấu hình Supabase hiện có. Redeploy commit mới và tắt Use existing Build Cache khi thử lại lỗi cũ. **Không cần migration mới; không chạy lại SQL 001 đã áp dụng.**

Lỗi cũ `Cannot find module scripts/catalog.ts`: bản build trước gọi bộ import Excel ở mỗi deploy, trong khi file đó không có ở source Vercel nhận. V0.1.1 dùng catalog đã xuất sẵn và kiểm checksum bằng Node thuần tại `verify-release.mjs`. Bộ import Excel và tests vẫn đầy đủ trong ZIP để bảo trì/CI.

## Chạy local tùy chọn

1. Giải nén ZIP, mở thư mục `world-evolution` chứa `package.json` bằng VS Code.
2. Cài Node.js **24 LTS** (hỗ trợ 22–24), npm 10 trở lên.
3. Tạo project Supabase. Trong SQL Editor, chạy **một lần** toàn bộ `infra/supabase/migrations/202611180001_foundation.sql`.
4. Copy `.env.example` thành `.env.local`. Điền URL và khóa publishable của project.
5. Trong terminal tại thư mục `world-evolution`, chạy:

```bash
npm ci
npm run dev
```

6. Mở `http://localhost:3000`. Đăng ký, xác nhận email, đăng nhập rồi tạo thế giới.

**Hướng dẫn đầy đủ:** [docs/CONFIGURATION.md](docs/CONFIGURATION.md). Đọc phần Auth, callback và deploy trước khi đưa lên Vercel.

## Chức năng đã xây dựng

- Đăng ký bằng email/mật khẩu, xác nhận email, đăng nhập, duy trì phiên bằng cookie, đăng xuất phiên hiện tại.
- Quên mật khẩu qua email và form nhập mật khẩu mới.
- Danh sách thế giới riêng theo tài khoản; tìm tên/seed; tạo, đổi tên, mở, sửa giới hạn dân số và xóa có nhập lại tên.
- Tạo thế giới với seed, khí hậu từ catalog, 20 dân ID riêng, ngày 1, E0, trạng thái tạm dừng; không phát công trình sẵn.
- Giới hạn dân số mặc định 200, cho phép chọn 20–100.000 theo CFG047–049. Đây là cấu hình lưu, không phải cam kết hiệu năng ở 100.000 dân.
- Cùng tài khoản có thể mở dữ liệu đã lưu từ PC/mobile. Cấu hình dùng revision để chặn ghi đè dữ liệu cũ.
- Tạo thế giới có request ID chống nhân đôi khi retry cùng yêu cầu.
- Import workbook Frozen V1.2 thành JSON; kiểm tra 38 sheet, ID, tham chiếu có cấu trúc, counts, cấu hình nền và SHA-256.
- Trang Dữ liệu nền tảng hiển thị kết quả kiểm tra, 38 sheet và checksum.
- Asset manifest, asset base URL, tài nguyên tĩnh có tên phiên bản và cache CDN; dữ liệu save tách khỏi đồ họa.
- Responsive PC/mobile ngang/dọc, modal cuộn và footer hành động Hủy bên trái, Lưu/Xác nhận bên phải.
- Manifest PWA cơ bản; không có service worker/offline gameplay hay chạy nền.

Không có dữ liệu demo thay cho cloud trong production. Khi chưa cấu hình Supabase, màn đăng nhập báo rõ và khóa thao tác tài khoản. Bản đồ tương tác đã có; 20 cư dân vẫn là trạng thái khởi tạo, chưa có mô phỏng di chuyển/sản xuất.

## Các lệnh chính

```bash
npm run data:check  # đối chiếu workbook / JSON / SQL
npm run typecheck
npm run lint
npm test           # logic và SQL PostgreSQL qua PGlite
npm run test:http  # HTTP contract, auth giả lập, database PostgreSQL cục bộ
npm run build
npm start          # chạy bản production đã build
```

Kiểm thử trình duyệt tùy chọn:

```bash
npx playwright install chromium
npm run test:ui
```

Xem phạm vi kiểm chứng và các bước cần kiểm tra trên thiết bị thật trong [docs/VERIFICATION.md](docs/VERIFICATION.md).

## Công nghệ và cấu trúc

Phiên bản chính xác nằm trong `package.json` và `package-lock.json`: Next.js 16.4.6, React 19.3.1, TypeScript 6.0.3, Supabase JS 2.119.0 và Supabase SSR 0.12.7, PixiJS 8.23.0. Source không dùng font/ảnh bên thứ ba để chạy giao diện.

```text
src/app/                 Trang, Server Actions, callback
src/components/          Giao diện và form dùng chung
src/game/core/           Schema, khởi tạo state, logic độc lập UI
src/game/data/           Adapter catalog Canonical
src/game/renderer/       Asset manifest/URL
src/game/map/            Generator, Worker, camera, PixiJS/Canvas, chunk/LOD
src/lib/supabase/         Supabase SSR bằng khóa public và cookie
proxy.ts                 Entry proxy tại gốc, dùng alias ổn định
src/proxy.ts             Entry tương thích khi dùng cấu trúc src
src/lib/supabase/proxy.ts Logic refresh/kiểm tra phiên dùng chung
public/assets/           SVG, PNG atlas và spritesheet JSON có phiên bản
scripts/                 Import OOXML, kiểm tra catalog, sinh SQL
infra/supabase/          Migration và SQL kiểm tra cấu hình
 data/source/            Workbook Frozen và dấu vân tay gốc
 data/generated/         Catalog JSON + summary
 tests/                  Unit, PostgreSQL, HTTP và Playwright
 docs/                   Cấu hình, kiến trúc, xác minh
```

PixiJS và Worker chỉ được tải khi mở màn bản đồ. Worker V0.2 chỉ sinh địa hình, không tiến tick hoặc ghi cloud mỗi frame.

## Master Data Frozen

File gốc được đóng gói nguyên byte tại `data/source/World-Evolution-Master-Data-v1.2-Canonical.xlsx`. Không mở rồi lưu lại workbook bằng công cụ khác chỉ để nhập dữ liệu.

```bash
npm run data:import
npm run data:sql
npm run data:check
```

Importer đọc trực tiếp OOXML, hỗ trợ namespace prefix của file Canonical, không cần Excel/Python. Trả lỗi khi workbook khác `data/source/frozen.json`; không tự sửa baseline để vượt kiểm tra. Các tham chiếu mô tả tự do không được coi là công thức engine đã định lượng; xem [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

Không chạy lại migration khởi tạo trên database đã sử dụng. Việc thay đổi dữ liệu gốc cần yêu cầu riêng và migration mới ở phiên bản sau.

## Bàn giao và phiên bản tiếp theo

Gói source: `World-Evolution-V0.2.0-Isometric-World-and-Camera.zip`. Hướng dẫn cấu hình nằm trong ZIP. SQL khởi tạo được giữ để tạo project mới; database V0.1.2 đang dùng không cần chạy lại SQL hoặc migration mới.

V0.3.0 — **Simulation & Save Engine**: tick deterministic trong Worker, ngày/mùa, x1/x2/x4/tạm dừng, snapshot/delta/recovery và lease thiết bị. Xem [ROADMAP.md](ROADMAP.md).

GitHub/Vercel/Supabase của chủ dự án chưa được kết nối trong lần bàn giao source này. Không có secret thật trong ZIP. Gửi lại ZIP bản mới nhất khi yêu cầu xây dựng tiếp để bảo toàn chức năng đã có.
