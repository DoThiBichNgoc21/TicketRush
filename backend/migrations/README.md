# Database migrations

## Giữ ghế & vòng đời ghế

Chạy lần lượt trong **Supabase SQL Editor**:

1. `001_seat_hold_concurrency.sql`
2. `002_seat_hold_bigint_ids.sql` (id kiểu số, không phải UUID)
3. `003_seat_lifecycle_checkout.sql` (phiên 10 phút, expire JSON, booking `Paid`)

Khởi động lại backend — worker tự quét ghế hết hạn mỗi 30 giây.

### Trạng thái ghế

| Trạng thái DB | Ý nghĩa |
|---------------|---------|
| `available` | Có thể chọn |
| `locked` | Đang giữ chỗ chờ thanh toán (10 phút) |
| `sold` | Đã thanh toán (xác nhận checkout) |
| *(released)* | Hết hạn giữ → DB đặt lại `available` (nhả ra thị trường) |

### Luồng khán giả

1. Chọn ghế → `hold_seat` → **locked**
2. Bấm **Thanh toán** → `/booking/:showtimeId/checkout`
3. Bấm **XÁC NHẬN** → `confirm_booking` → **sold** (không qua cổng thanh toán thật)
4. Hết 10 phút không thanh toán → worker `expire_stale_seat_locks` → **released** (`available`)

### API

| Method | Path |
|--------|------|
| POST | `/api/booking/seats/:seatId/hold` |
| POST | `/api/booking/seats/:seatId/release` |
| POST | `/api/booking/seats/release` |
| POST | `/api/booking/confirm` |

Cần JWT user (`user_token`).

### Biến môi trường (tùy chọn)

- `SEAT_HOLD_SECONDS=600`
- `SEAT_RELEASE_INTERVAL_MS=30000`
