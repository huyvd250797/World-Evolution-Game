# Simulation & Save Engine V0.3.0

## Clock và tính nhất quán

`we-sim-1` chạy trong Worker riêng, tách khỏi Worker sinh bản đồ và renderer. Một bước 100ms ở x1; CFG008 = 180 giây thực/ngày nên 1.800 tick/ngày. Speed nhân lượng thời gian đưa vào accumulator, không thay công thức tick. Integer subTick 0–99 được lưu để không mất phần bước. x1/x2/x4 cùng số tick có cùng RNG/cursor; thời gian hoạt động thực sẽ khác theo tốc độ.

CFG001/002 = 120 ngày/năm và 30 ngày/mùa; SEASONS lấy S1 Xuân 1–30, S2 Hạ 31–60, S3 Thu 61–90, S4 Đông 91–120. Adapter nhỏ có test đối chiếu workbook/catalog Frozen. B02 hiện nhãn mưa/khô theo ghi chú vùng, không áp nhiệt độ/mưa giả vào gameplay. Giờ được nội suy từ tick trong ngày, bắt đầu 00:00.

State schema 2: identity world/seed/climate, master/catalog/map/engine version, population=20, tick/subTick, xorshift32 RNG state và rngDraws=tick, speed/pause, commandSeq, activeMillis. RNG dùng seed FNV32 ổn định; cursor tiến một lần/tick làm nền cho các hệ thống sau. Chưa có sự kiện RNG gameplay để hiển thị. Không dùng Math.random hoặc thời gian hệ thống để tính kết quả. Same input state + cùng lệnh tại cùng tick cho cùng kết quả; cadence timer không đổi thứ tự RNG.

Worker timer 100ms, gửi trạng thái UI tối đa khoảng 4 lần/giây; giới hạn xử lý elapsed mỗi lượt ở 1 giây để không chạy bù sau suspend/lag dài. Đây là game chạy khi người chơi mở trang, không phải simulation server 24/7. Load luôn tạm dừng; không cộng ngày, active time hoặc tài nguyên khi đóng/ẩn/offline. Render map giữ nguyên instance khi HUD đổi thời gian.

## Dữ liệu và migration

001 giữ nguyên byte. 002 chỉ mở rộng check day>=1 trên `public.worlds`, tạo hai bảng **private**:

- `world_simulations`: full current head và SHA-256, sim revision, saved_at, lease token/epoch/until, save_count/write_bytes.
- `world_save_history`: full/delta payload, SHA payload và SHA kết quả, request ID/checksum, revision/tick/time; FK cascade theo world.

Hai bảng bật RLS và không grant SELECT/INSERT/UPDATE/DELETE cho client. Public `simulation_rpc` invoker gọi private definer với search_path rỗng; kiểm auth.uid/owner ở mọi nhánh, khóa world trước rồi khóa head. Helpers không được client execute. Không expose schema private trong API settings. API route kiểm Origin, user qua Supabase SDK và input trước RPC, không dùng service-role key.

State khởi tạo schema 1 và 20 người vẫn ở `worlds.initial_state`, không sửa/copy lại mỗi tick. Bản lưu đầy đủ V0.3 gồm baseline immutable đó cùng full mutable engine state. Cấu hình/name/population_limit theo metadata revision cũ; simulation có revision riêng, cập nhật day/updated_at nhưng không tăng config revision. Chưa mô phỏng dân, đói/bệnh/sinh tử, khai thác/xây dựng hay mở khóa thời đại.

Game client là nơi tính tick, server kiểm cấu trúc/quyền/đồng bộ, không chạy lại toàn bộ tick để làm server chống gian lận. Checksum phát hiện hỏng hoặc nhầm payload, không thay xác thực người dùng.

## Lưu và lịch sử

Tự lưu sau 30 giây nếu có thay đổi; pause/Lưu ngay cố flush sớm. Không gửi mỗi tick. Request lưu có UUID cố định, expected simulation revision và epoch; khi timeout giữ nguyên request/payload để retry. Nếu server đã commit nhưng mất ACK, retry trả ACK cũ, không tạo revision/lịch sử trùng. Sau ACK chỉ xóa bản tạm đã khớp; các tick/lệnh mới hơn ACK vẫn chưa đồng bộ.

Cloud head luôn materialized đầy đủ để mở nhanh. Auto save gửi patch chỉ chứa mutable fields thay đổi; Lưu ngay gửi full. Server bắt buộc full anchor mỗi 8 revision dù client chỉ gửi delta. Mỗi row history có SHA payload và SHA full kết quả. Reconstruct bắt đầu từ full gần nhất, kiểm liên tục revision, checksum từng patch và checksum kết quả. Chuỗi thiếu/hỏng không được khôi phục.

Retention chọn full anchor gần nhất trước revision hiện tại trừ 24, xóa phần trước anchor đó trong cùng transaction. Còn khoảng 25–32 mốc, luôn có full base cho delta còn giữ. Không cần cron; không tự hồi sinh revision 0 đã prune. Payload đầu vào tối đa 16KiB cho phạm vi engine nhỏ hiện tại; bản gameplay lớn sau phải nâng schema/ngân sách có chủ đích.

Mở Lịch sử để chọn revision hoặc **Tìm bản hợp lệ gần nhất**: kiểm từ mới về cũ, bỏ qua bản/chuỗi hỏng. Người chơi xác nhận trước khi sửa head. Restore yêu cầu lease hiện tại và expected revision, tạo full revision mới ở trạng thái paused, không xóa lịch sử ngay hoặc ghi đè âm thầm bản mới. Bản sửa hỏng head có thể phục hồi từ history hợp lệ. Nếu tất cả history đều hỏng, cần backup database ngoài app; không tự reset thế giới.

## Lease và chuyển thiết bị

Mỗi mount/tab tạo token mới; không dùng token chung trong sessionStorage để tránh Duplicate Tab trở thành hai writer. Lease 75 giây ở server; heartbeat mỗi 20 giây khi đang hiện trang. Client trừ thời gian request và thêm biên 3 giây trước deadline; Worker tự pause nếu deadline hết hạn ngay cả khi UI bị chậm. Renew không tự giành lại lease đã hết hạn.

Open nhận lease nếu đang trống/hết hạn; nếu thiết bị khác giữ thì chỉ xem bản lưu cloud. Tiếp quản có xác nhận và tăng epoch. Mỗi save/restore kiểm token + epoch + lease_until + revision dưới row lock, nên writer cũ không ghi được ngay sau takeover, kể cả request đang trễ. Thiết bị cũ hiển thị mất quyền ở lần heartbeat/save kế tiếp (thường trong 20 giây), tự pause và giữ bản tạm. Không dùng đồng hồ client làm quyền ghi.

Thoát màn giải phóng Worker/timer/listener và cố release; nếu mạng/đóng đột ngột thì lease tự hết hạn. Không bảo đảm release trước khi trình duyệt bị tắt. Thiết bị mới có thể chờ hoặc Tiếp quản. Một tài khoản vẫn quản lý metadata như trước; lease chỉ khóa phần simulation.

## Mất mạng, bản tạm và xung đột

Bản tạm localStorage được ký checksum SHA-256, validate schema/identity, tên khóa account/world/tab. Ghi khoảng mỗi giây khi dirty, thêm lúc pause/lưu/đổi trạng thái; tối đa 8 bản/world/account và 7 ngày. Đây không phải cloud save, không đi sang thiết bị khác và có thể bị browser/user xóa. Nếu browser chặn hoặc đầy storage, UI báo rõ; vẫn dùng cloud khi có mạng.

Ẩn trang/pagehide gửi pause rồi cố flush keepalive. Mất mạng cũng pause, giữ pending request và bản tạm; online thử lại nếu phiên còn quyền. Không bảo đảm request cuối hoàn tất khi OS giết tab. Chờ Đã lưu trước khi rời; tắt đột ngột có thể mất phần từ bản tạm gần nhất, khoảng một giây cộng độ trễ Worker/UI.

Khi mở/kết nối lại, không tự áp bản tạm:

1. So sánh account/world/seed/climate/schema/checksum.
2. Nếu baseRevision bằng cloud revision và đã nhận lease: cho **Khôi phục bản tạm**, load paused rồi full save.
3. Nếu cloud đã có revision khác: chặn áp, giữ bản để **Tải JSON**; người chơi có thể xác nhận giữ cloud và bỏ các bản tạm đã liệt kê.
4. JSON tải xuống dùng để giữ/đối chiếu và hỗ trợ, V0.3 chưa có nút import hoặc tự merge JSON khác revision.

Hai bản cùng base nhưng từ nhiều tab cần người chơi chọn bản muốn giữ. Mở lại không được dùng một pending request cũ để vượt epoch mới; payload đã xác nhận vẫn được ACK idempotent, phần chưa đồng bộ chỉ áp sau đối chiếu.

## Đo dữ liệu và nghiệm thu

UI hiện số lần save, tổng byte payload incoming, tổng byte payload head/history còn giữ và số byte request/response API trong phiên. Các số không bao gồm index/row/header/cookie/network overhead hoặc dữ liệu map/auth khác, không phải hóa đơn/quota dashboard Supabase. Atlas, texture và worker JS được phục vụ Vercel/CDN; DB không nhận frame, texture hoặc mảng map đầy đủ.

Tests gồm engine/calendar/RNG, partial tick, Worker thật bằng node worker_threads với Web Worker bridge, session thật qua Worker + PGlite, SQL ownership/fencing/expiry/idempotency/retention/corruption/recovery, và HTTP qua Next route + Supabase SDK. Bridge không thay GPU hoặc lifecycle OS thật. Cần nghiệm thu Safari/Android, network toggling, hai thiết bị và Supabase thật sau deploy theo VERIFICATION.md.
