# Xác minh V0.1.1 Vercel Deployment Hotfix

Đã bổ sung kiểm thử verifier với source triển khai không có scripts/tests/workbook; kiểm catalog hỏng và file thiếu. 18 tests/subtests đã đạt; production build riêng đã đạt khi loại thư mục scripts, tests và workbook khỏi source thử triển khai. Full importer vẫn chạy ở CI. Kiểm tra typecheck, lint, tests, data:check và production build được chạy lại cho hotfix. Không có migration mới.

# Kết quả xác minh V0.1.0

Ngày kiểm tra: 18/11/2026. Đây là báo cáo kiểm chứng source, không phải chứng nhận đã triển khai dịch vụ của chủ dự án.

## Đã chạy và đạt

| Kiểm tra | Kết quả và phạm vi |
| --- | --- |
| Typecheck | TypeScript strict, không có lỗi |
| ESLint | Không có lỗi/cảnh báo lint |
| Production build | Next.js production build thành công, route private/auth là dynamic |
| Catalog | 38 sheet, 5.984 ID references có cấu trúc, số lượng cốt lõi và defaults khớp |
| Frozen | SHA-256 workbook và JSON đồng nhất; không sửa file nguồn |
| Logic + SQL | 14 tests/subtests đạt; chạy migration thực trong PostgreSQL PGlite, không chỉ kiểm chuỗi SQL |
| HTTP contract | Chạy Next dev + Supabase SDK + PostgreSQL local với GoTrue/PostgREST fixture; auth, tạo/mở/sửa/xóa và conflict đạt |
| Asset | Manifest khớp size/SHA-256 file; đổi base URL không đổi ID save |

Các ca SQL đã kiểm: create trả snapshot 20 dân đúng catalog, retry request ID không tạo trùng, user B không đọc/sửa/xóa world A, anon bị chặn, direct table writes bị chặn, input sai bị chặn tại DB, revision cũ bị từ chối, xóa sai tên bị chặn, xóa đúng tên/revision thành công.

Các ca HTTP đã kiểm: bảo vệ route khi chưa login, Supabase SSR cookie session, Server Action login đúng/sai, thông báo signup cần email, callback không nhận next URL bên ngoài, danh sách trống, tạo world, trang chi tiết có đủ 20 người, rename/config, conflict, xóa, not found sau xóa.

## Chưa xác minh trực tiếp

- Supabase hosted thật của Boss, SMTP/email thật, link OTP/PKCE thật, rate limit và backup thực tế: chưa có cấu hình project của Boss.
- Deploy Vercel/GitHub: không nằm trong yêu cầu bàn giao source lần này; chỉ có hướng dẫn.
- Thử bằng trình duyệt trong môi trường hiện tại bị chặn khi Chromium khởi động; không có kết quả visual QA hoặc Playwright pass được tuyên bố.
- Safari trên iPhone, Chrome trên Android và cảm ứng thiết bị thật chưa được chạy. CSS và controls đã xây cho hai nền tảng; cần smoke test thực tế.
- Các bản đồ/camera, simulation và gameplay ngoài V0.1 không thuộc phạm vi xác minh.

## Chạy lại UI test

`tests/ui/foundation.spec.ts` có 3 kịch bản: PC lifecycle, mobile ngang/dọc, và lỗi auth/hiện mật khẩu/callback. Các test dùng fixture cục bộ riêng, không gửi mail, không tác động database của Boss.

```bash
npm ci
npx playwright install chromium
npm run test:ui
```

Nếu muốn dùng Chromium đã cài, đặt `CHROMIUM_PATH` là đường dẫn executable. Mặc định Playwright dùng browser tải bằng lệnh install. Không có browser flags dùng để bỏ qua cảnh báo website.

`tests/http-smoke.ts` và fixture là công cụ QA, chỉ bind loopback. Không deploy fixture hoặc cấu hình production trỏ về fixture.

## Checklist sau khi Boss cấu hình

1. Chạy SQL verify_setup.sql và đối chiếu quyền SELECT/execute như comment.
2. Đăng ký/xác nhận/đăng nhập, reload và đăng xuất; thử recovery qua email.
3. Tạo world PC rồi đăng nhập cùng user trên điện thoại, đối chiếu seed/khí hậu/20 dân.
4. Thử quyền user B và revision conflict giữa hai thiết bị.
5. Kiểm tra dọc/ngang, bàn phím, scroll modal và nút Hủy/Lưu không bị che.
6. Xác minh thông báo mất mạng, session hết hạn và dữ liệu sau reconnect.
7. Chỉ xóa world thử riêng; bản này xóa vĩnh viễn, không có undo.
