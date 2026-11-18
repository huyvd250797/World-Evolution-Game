# Hướng dẫn cấu hình World Evolution V0.1.0

## 1. Chuẩn bị source và môi trường

- Giải nén ZIP. Thư mục gốc ứng dụng là `world-evolution`, nơi có `package.json`.
- Cài Node.js 24 LTS từ https://nodejs.org. Mở terminal mới, chạy `node -v` và `npm -v`.
- Chọn Terminal → New Terminal trong VS Code tại thư mục ứng dụng. Không chạy npm từ thư mục ZIP bên ngoài.
- Source dùng npm, giữ `package-lock.json`; cài bằng `npm ci` để tái lập phiên bản.

## 2. Tạo project và database Supabase

1. Mở https://supabase.com/dashboard, tạo project riêng cho game, chọn region phù hợp người chơi. Ghi lại mật khẩu database ở nơi quản lý mật khẩu của Boss; app không cần mật khẩu đó.
2. Đợi project sẵn sàng. Mở **SQL Editor → New query**.
3. Mở `infra/supabase/migrations/202611180001_foundation.sql` trong source hoặc bản TXT đi kèm. Copy toàn bộ, chạy **một lần**.
4. Migration tạo bảng `public.worlds`, index, RLS và các RPC tạo/sửa/xóa. Không có bucket Storage cần tạo ở bản này.
5. Nếu gặp `relation worlds already exists`, dừng chạy lại. Kiểm tra project có phải môi trường mới hay đã áp dụng migration. Không xóa bảng dữ liệu để xử lý lỗi này.
6. Trong API settings, giữ `public` được exposed; **không thêm schema `private` vào Exposed schemas**. Các function private chỉ được gọi qua public RPC có kiểm soát.
7. Chạy `infra/supabase/verify_setup.sql` để kiểm tra cấu trúc, RLS và các grant. File kiểm tra chỉ đọc metadata.

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

`npm run build` kiểm tra catalog/SQL trước khi Next build. Không cần khóa service-role hoặc database đang chạy để compile; muốn dùng cloud thật phải cấu hình hai biến Supabase.

## 7. Push GitHub

Repo mới (thay URL mẫu bằng repo của Boss):

```bash
git init
git add .
git commit -m "World Evolution V0.1.0 Cross-Platform Foundation"
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

Bản này có SVG minh họa riêng trong `public/assets`, dùng URL phiên bản bất biến. Để trống asset base URL khi dùng Vercel CDN mặc định. Nếu chuyển CDN, upload nguyên cấu trúc `/assets/...` và cấu hình `NEXT_PUBLIC_ASSET_BASE_URL=https://cdn.example.com`, sau đó rebuild/redeploy.

Không upload ảnh vào PostgreSQL hoặc tạo bản sao theo từng world. Không sửa nội dung file dưới URL đã cache immutable; đổi tên phiên bản và cập nhật manifest. V0.1 chưa có offline cache/service worker; browser/CDN HTTP cache là lớp cache hiện tại.

Theo dõi database/egress ở Supabase và data transfer ở Vercel. Ngưỡng 60% dùng để kiểm tra, 80% để chuẩn bị phương án nâng cấp theo kế hoạch V1.1; đây là ngưỡng nội bộ, không phải quota của nhà cung cấp. Không có cam kết Free phục vụ không giới hạn.

## 10. Backup và nâng cấp

Trước dữ liệu thật có giá trị, chọn và diễn tập một cách backup phù hợp project: export bảng `worlds` và thông tin chủ sở hữu cần phục hồi, hoặc dùng công cụ backup database của Supabase. Không coi revision là bản backup: bản nền tảng chỉ giữ trạng thái hiện tại, không có recovery history tự động.

Khởi tạo lần đầu chạy migration 001 trước khi sử dụng app. Bản sau phải có migration tăng dần, không sửa rồi chạy lại 001 trên dữ liệu đang dùng. Khi rollback app, xác minh schema tương thích; không xóa bảng/khôi phục database cũ mù quáng làm mất save mới.

## 11. Xử lý lỗi thường gặp

| Hiện tượng | Kiểm tra và xử lý |
| --- | --- |
| Chưa cấu hình kết nối | Kiểm tra `.env.local` hoặc Vercel Environment Variables; restart local/redeploy |
| Không có bảng/function | Chạy migration 001 đúng project; nếu vừa chạy, chờ schema cache cập nhật rồi thử lại |
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
