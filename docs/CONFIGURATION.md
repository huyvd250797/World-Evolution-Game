# Hướng dẫn cấu hình World Evolution V0.8.0

## Cập nhật từ V0.7.0

Chạy **infra/supabase/migrations/202611190007_living_ecosystem.sql một lần** sau 001–006, trước deploy. TXT V0.8 gửi riêng có đúng SQL 007. Không chạy lại migrations cũ, không reset dữ liệu/repo/project. Source mới upload toàn bộ nội dung ZIP vào gốc repo chứa package.json, ghi đè file trùng và giữ env.

007 nâng schema 7/we-sim-5 cho nguồn/quần thể/cạnh động vật/RNG/đặt chỗ, giữ raw head/history cũ, cap payload 2 MiB. Không cấp công nghệ/nghề/công trình. Hai proxy entry vẫn cùng import alias @/lib/supabase/proxy; không dùng ./lib/config. Xem LIVING-ECOSYSTEM.md cho phạm vi và policies.

## 0. Deploy trực tiếp trên Vercel

Boss không phải cài Node/npm hoặc chạy localhost. Gói V0.8.0 chứa source ngay tại gốc ZIP; upload toàn bộ sau giải nén vào GitHub, chọn Root Directory chứa package.json. Nếu thay source từ gói cũ, giữ các biến môi trường và Supabase project hiện tại.

Build production chỉ chạy `node verify-release.mjs && next build`, không chạy importer TypeScript. Vercel tự chạy Install/Build. Mục 1 và các lệnh local bên dưới là tùy chọn cho lập trình viên. Cấu hình Vercel chi tiết ở mục 8.

Lên V0.8.0 cần migration 007 sau 001–006. Project mới chạy 001 → 002 → 003 → 004 → 005 → 006 → 007; project V0.7.0 chỉ chạy 007.

## 1. Chuẩn bị source và môi trường

- Giải nén ZIP. Nội dung source đặt ngay gốc ZIP, nơi có `package.json`.
- Cài Node.js 24 LTS từ https://nodejs.org. Mở terminal mới, chạy `node -v` và `npm -v`.
- Chọn Terminal → New Terminal trong VS Code tại thư mục ứng dụng. Không chạy npm từ thư mục ZIP bên ngoài.
- Source dùng npm, giữ `package-lock.json`; cài bằng `npm ci` để tái lập phiên bản.

## 2. Tạo project và database Supabase

1. Mở https://supabase.com/dashboard, tạo project riêng cho game, chọn region phù hợp người chơi. Ghi lại mật khẩu database ở nơi quản lý mật khẩu của Boss; app không cần mật khẩu đó.
2. Đợi project sẵn sàng. Mở **SQL Editor → New query**.
3. Mở `infra/supabase/migrations/202611180001_foundation.sql` trong source. Copy toàn bộ, chạy **một lần**, sau đó chạy `202611180002_simulation_save.sql` , `202611180003_city_planning.sql`  , `202611190004_population_navigation.sql` , `202611190005_survival_food.sql` , `202611190006_workforce_training.sql` và `202611190007_living_ecosystem.sql` theo thứ tự.
4. Migration 001 tạo bảng `public.worlds`, index, RLS và các RPC tạo/sửa/xóa; 002 thêm bảng private và RPC `simulation_rpc`, 003 nâng cho quy hoạch schema 3; 004 nâng validator/RPC cho 20 cư dân schema 4; 005 nâng schema 5/we-sim-3 cho hoạt động/lô/cấp phát sinh tồn; 006 nâng schema 6/we-sim-4 cho nhân sự/đào tạo; 007 nâng schema 7/we-sim-5 cho hệ sinh thái. Không có bucket Storage cần tạo ở bản này.
5. Nếu gặp `relation worlds already exists`, dừng chạy lại. Kiểm tra project có phải môi trường mới hay đã áp dụng migration. Không xóa bảng dữ liệu để xử lý lỗi này.
6. Trong API settings, giữ `public` được exposed; **không thêm schema `private` vào Exposed schemas**. Các function private chỉ được gọi qua public RPC có kiểm soát.
7. Chạy `infra/supabase/verify_setup.sql` và `infra/supabase/verify_simulation.sql` để kiểm tra cấu trúc, RLS và các grant. File kiểm tra chỉ đọc metadata.

Migration không tạo user thử trong Supabase thật. `tests/database.ts` chỉ tạo auth giả lập trong PostgreSQL cục bộ dùng cho test.

## 3. URL và khóa môi trường

Trong Supabase Project Settings → API (hoặc Connect / API Keys theo giao diện Dashboard):

| Biến | Điền giá trị | Phạm vi |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL, ví dụ `https://abcdefgh.supabase.co` | Public; dùng bởi SSR/proxy |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key bắt đầu `sb_publishable_...`; nếu project cũ, dùng legacy **anon** key trong cùng biến | Public; quyền dữ liệu vẫn do Auth/RLS kiểm soát |
| `NEXT_PUBLIC_ASSET_BASE_URL` | Để trống khi ảnh nằm cùng app; hoặc HTTPS origin CDN, không thêm `/assets` | Public; build vào client |

**Không dùng `service_role`, secret key `sb_secret_...`, database password hoặc connection string trong các biến `NEXT_PUBLIC_*`.** App không cần khóa đặc quyền. Khi đổi biến public trên Vercel phải redeploy để đồng bộ bản build.

Windows PowerShell tại thư mục source:

```powershell
Copy-Item .env.example .env.local
```

macOS/Linux:

```bash
cp .env.example .env.local
```

Mở `.env.local` điền giá trị. Không thêm dấu `< >`, không để URL/khóa mẫu. `.env.local` đã bị loại khỏi Git.

## 4. Cấu hình đăng ký, email và callback

Trong Supabase Authentication:

1. Bật provider **Email**, cho phép sign up.
2. Bật xác nhận email nếu muốn tài khoản chỉ đăng nhập sau xác nhận; source xử lý cả chế độ có/không xác nhận.
3. URL Configuration → **Site URL**: dùng URL production sau deploy, ví dụ `https://your-game.vercel.app`. Khi chỉ thử local có thể dùng `http://localhost:3000`.
4. **Redirect URLs** thêm các địa chỉ cụ thể cần dùng:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/confirm`
   - `https://your-game.vercel.app/auth/callback`
   - `https://your-game.vercel.app/auth/confirm`
   - Nếu thử từ điện thoại qua LAN, thêm callback/confirm của đúng IP LAN và cổng đang dùng.
5. Giữ password policy tối thiểu 8 ký tự; source hỗ trợ đến 128 ký tự. Dashboard có thể đặt chính sách mạnh hơn.
6. Với email mặc định, đăng ký và mở email xác nhận trên cùng trình duyệt sẽ dùng luồng PKCE `/auth/callback`.

### Xác nhận email trên thiết bị khác

Luồng PKCE mặc định cần verifier trong trình duyệt đã gửi yêu cầu. Để mở thư xác nhận hoặc recovery trên thiết bị khác, cấu hình template email của Supabase dùng token hash ở endpoint có sẵn:

Confirm signup — link trong Email Templates:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup">Xác nhận tài khoản</a>
```

Reset password — link trong Email Templates:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery">Đặt lại mật khẩu</a>
```

Đặt **Site URL đúng môi trường** vì template trên đưa người nhận về Site URL. Không dùng cùng project/template cho nhiều môi trường khác domain khi chưa có quy tắc rõ ràng. Thư recovery thành công mở `/reset-password`; sau lưu mật khẩu mới mở danh sách thế giới.

Supabase có giới hạn gửi email và rate limit. Thử nghiệm ít tài khoản trước; nếu thư không đến, kiểm tra Spam, Auth logs, cấu hình SMTP và giới hạn gửi trong Dashboard. Không tắt xác nhận email chỉ để che lỗi SMTP trên môi trường thật.

## 5. Chạy local và kiểm tra tài khoản

```bash
npm ci
npm run dev
```

Mở `http://localhost:3000`. Các bước kiểm tra:

1. Đăng ký tài khoản A → xác nhận email → đăng nhập.
2. Tạo thế giới `Bình Minh`, giữ seed hoặc nhập seed riêng, chọn khí hậu và giới hạn dân số.
3. Xác nhận màn chi tiết có E0, ngày 1, 20 dân và trạng thái đã lưu.
4. Reload; đăng xuất; đăng nhập lại: thế giới vẫn còn.
5. Đăng nhập cùng A trên thiết bị thứ hai: mở đúng thế giới từ danh sách.
6. Đổi tên hoặc giới hạn trên một thiết bị. Nếu thiết bị kia giữ form cũ, Lưu phải báo xung đột; đóng form và tải lại trước khi sửa.
7. Tài khoản B không nhìn thấy thế giới A; mở URL chi tiết A phải báo không tìm thấy/không có quyền.
8. Thử xóa một thế giới dùng riêng để kiểm tra: phải nhập đúng tên mới bật xác nhận. Xóa trong bản này là xóa vĩnh viễn, không có thùng rác.

Dữ liệu thế giới chỉ thay đổi khi cloud xác nhận. Khi request gián đoạn, tải lại để biết trạng thái; retry tạo trong cùng hộp thoại dùng cùng request ID để tránh nhân đôi.

### Kiểm tra điện thoại cùng mạng

```bash
npm run dev -- --hostname 0.0.0.0
```

Dùng địa chỉ `http://IP_LAN_PC:3000` từ điện thoại cùng Wi-Fi, mở firewall cục bộ nếu Boss chủ động cho phép. Cookie/session trên hostname khác với localhost là phiên riêng, cần đăng nhập lại. Clipboard và cài PWA có thể yêu cầu HTTPS; kiểm tra các chức năng đó bằng URL deploy HTTPS.

## 6. Build và chạy bản production local

```bash
npm run typecheck
npm run lint
npm test
npm run test:http
npm run build
npm start
```

`npm run build` kiểm catalog JSON/asset đã đóng gói bằng Node thuần. Kiểm workbook/SQL đầy đủ nằm ở `npm run data:check` cho CI. Không cần khóa service-role hoặc database đang chạy để compile; muốn dùng cloud thật phải cấu hình hai biến Supabase.

## 7. Push GitHub

Repo mới (thay URL mẫu bằng repo của Boss):

```bash
git init
git add .
git commit -m "World Evolution V0.5.0 Population Housing and Pathfinding"
git branch -M main
git remote add origin https://github.com/YOUR_ACCOUNT/world-evolution.git
git push -u origin main
```

Kiểm tra `.env.local` không nằm trong `git status` trước commit. Với repo có source, clone repo về trước, tạo nhánh mới rồi copy source vào; giữ các thay đổi ngoài phạm vi. Nếu `fetch first`, fetch/pull và giải quyết khác biệt, không force push ghi đè lịch sử:

```bash
git fetch origin
git pull --rebase origin main
git push origin main
```

Nếu rebase xung đột, đối chiếu từng file và chạy lại checks trước push.

## 8. Import vào Vercel

1. Mở https://vercel.com/new → Import Git Repository → chọn repo vừa push.
2. Framework: **Next.js**.
3. Root Directory: thư mục chứa `package.json`. Chọn `.` nếu source ở gốc repo, hoặc `world-evolution` nếu repo chứa thư mục này.
4. Node.js: **24.x**. Install Command `npm ci`, Build Command `npm run build`, Output Directory giữ mặc định Next.js; không chọn `out`.
5. Thêm 3 biến môi trường ở mục 3. ASSET_BASE_URL có thể bỏ qua hoặc để trống. Chọn Production/Preview theo môi trường thực dùng.
6. Deploy, chờ build thành công. Mở URL HTTPS được Vercel cấp.
7. Quay lại Supabase cập nhật Site URL và Redirect URLs đúng domain deploy. Nếu thêm custom domain, thêm callback/confirm tương ứng.
8. Đăng ký/đăng nhập và kiểm tra đủ các bước ở mục 5 trên URL đó.
9. Các bản sau push lên branch đã liên kết sẽ tạo deployment mới. Chỉ chạy migration mới được ghi rõ ở release notes của bản nâng cấp.

Không đổi runtime sang static export: app cần Server Actions/SSR. Không đưa `tests/fixture-server.ts` thành lệnh production; `npm start` chỉ chạy Next.

## 9. Đồ họa và CDN

Bản này có SVG minh họa và atlas bản đồ E0 (PNG + spritesheet JSON) trong `public/assets`, dùng URL phiên bản bất biến. Để trống asset base URL khi dùng Vercel CDN mặc định. Nếu chuyển CDN, upload nguyên cấu trúc `/assets/...` và cấu hình `NEXT_PUBLIC_ASSET_BASE_URL=https://cdn.example.com`, sau đó rebuild/redeploy.

Nếu dùng CDN riêng, cho phép CORS GET/HEAD từ domain app cho PNG/JSON; upload cả hai file atlas, giữ cùng thư mục vì JSON tham chiếu PNG tương đối. Worker và JavaScript tiếp tục được phục vụ cùng origin app. Nếu không cần CDN riêng, giữ ASSET_BASE_URL trống.

Không upload ảnh vào PostgreSQL hoặc tạo bản sao theo từng world. Không sửa nội dung file dưới URL đã cache immutable; đổi tên phiên bản và cập nhật manifest. V0.3 chưa có offline cache/service worker; browser/CDN HTTP cache là lớp cache hiện tại.

Theo dõi database/egress ở Supabase và data transfer ở Vercel. Ngưỡng 60% dùng để kiểm tra, 80% để chuẩn bị phương án nâng cấp theo kế hoạch V1.1; đây là ngưỡng nội bộ, không phải quota của nhà cung cấp. Không có cam kết Free phục vụ không giới hạn.

## Kiểm tra bản đồ sau deploy

Mở một thế giới V0.2.0 đã có, chờ tải atlas; xác nhận 20 dân và cấu hình vẫn giữ. Trên PC kéo/cuộn, click ô, ±, Home, minimap và xem toàn bản đồ. Trên iPhone/Android thử vuốt một ngón, chụm hai ngón, xoay ngang/dọc; thao tác chụm không được bật thông tin ô. Mở cùng seed/khí hậu ở thiết bị khác phải có địa hình giống nhau. Kiểm tra chế độ Nhẹ khi máy yếu. Sau khi panel Simulation tải xong, bấm Chạy, x4, Tạm dừng/Lưu ngay; đợi Đã lưu rồi reload. Mở thiết bị/tab khác, kiểm quyền xem và Tiếp quản. Ẩn trang phải tạm dừng; mất mạng giữ bản tạm, khác revision không tự ghi đè. Xem docs/SIMULATION-AND-SAVE.md.

Nếu bản đồ báo lỗi tải, kiểm tra Network: worker JS, atlas JSON và PNG trả 200; nếu dùng CDN kiểm tra CORS và HTTPS. Nếu WebGL lỗi, ứng dụng tự thử Canvas 2D, thông báo trong Hướng dẫn điều khiển. Vẫn lỗi thì bấm Thử lại sau khi kiểm tra mạng.

## 10. Backup và nâng cấp

V0.4.0 có lịch sử giới hạn 25–32 mốc, snapshot mỗi 8 revision và khôi phục tạo revision mới. Đây là recovery trong app, không thay thế backup toàn project.

Trước dữ liệu thật có giá trị, chọn và diễn tập một cách backup phù hợp project: export bảng `worlds` và thông tin chủ sở hữu cần phục hồi, hoặc dùng công cụ backup database của Supabase. Không coi config revision là backup: simulation revision và lịch sử riêng bắt đầu từ V0.3.0.

Khởi tạo mới chạy 001 → 002 → 003 → 004 trước khi sử dụng V0.5.0. Nâng từ V0.4.0 chỉ chạy 004; giữ nguyên mọi dữ liệu. Bản sau phải có migration tăng dần, không sửa rồi chạy lại 001 trên dữ liệu đang dùng. Khi rollback app, xác minh schema tương thích; không xóa bảng/khôi phục database cũ mù quáng làm mất save mới.

## 11. Xử lý lỗi thường gặp

| Hiện tượng | Kiểm tra và xử lý |
| --- | --- |
| Chưa cấu hình kết nối | Kiểm tra `.env.local` hoặc Vercel Environment Variables; restart local/redeploy |
| Không có bảng/function | Project mới chạy 001 → 002 → 003 → 004; nâng từ V0.4 chỉ chạy 004. Nếu vừa chạy, chờ schema cache cập nhật |
| Invalid API key | Dùng publishable/anon của cùng project URL; không dùng secret key |
| Email chưa xác nhận | Mở email xác nhận hoặc kiểm tra Email Templates và SMTP |
| Callback hết hạn | Xin thư mới; dùng cùng trình duyệt cho PKCE hoặc cấu hình token_hash template |
| Đăng nhập xong bị quay lại login | Kiểm tra cookie bị chặn, URL project, Site URL; không cache trang private qua CDN tùy chỉnh |
| Sửa cấu hình báo xung đột | Đóng hộp thoại, tải lại dữ liệu; không lặp gửi revision cũ |
| Không tìm thấy world | Kiểm tra tài khoản; hệ thống không tiết lộ world thuộc user khác |
| Import workbook lỗi checksum | Dùng nguyên file Canonical gốc; không chỉnh frozen.json để bỏ qua kiểm tra |
| Build thiếu devDependencies | Không cài `--omit=dev` trước build; TypeScript và importer cần dependencies build |
| Asset không hiện sau đổi CDN | Đối chiếu HTTPS base URL và đường dẫn `/assets/`; không thêm `/assets` hai lần |
| PWA không hiện nút cài | Tùy trình duyệt; manifest cơ bản chưa có service worker/offline, dùng Add to Home Screen khi được hỗ trợ |

Khi cần hỗ trợ bản sau, gửi ZIP mới nhất, lỗi build nguyên văn và bước tái hiện. Không gửi `.env.local` hoặc khóa bí mật.
