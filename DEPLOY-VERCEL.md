# Deploy bản sửa V0.1.2

1. Giải nén ZIP, upload toàn bộ nội dung vào gốc repository GitHub hiện tại, ghi đè file trùng. Không xóa repository.
2. Kiểm tra `package.json` có version `0.1.2`.
3. Kiểm tra `proxy.ts` ở gốc repo import từ `@/lib/supabase/proxy`. File logic phải có tại `src/lib/supabase/proxy.ts`. Không giữ nội dung cũ `./lib/config` trong proxy ở gốc.
4. Vercel dùng đúng repo, branch và commit mới. Root Directory là thư mục có package.json, thường là `.`.
5. Build Command `npm run build`, Node.js 24.x; giữ nguyên biến môi trường. Deploy commit mới, bỏ dùng Build Cache khi thử lại.
6. Không chạy lại SQL 001. Không có migration mới; giữ Supabase và dữ liệu đã có.

Bản sửa có hai entry `proxy.ts` và `src/proxy.ts` cùng nội dung, dùng chung một implementation. Đã thử build sạch và cập nhật đè trên source có proxy cũ ở gốc.
