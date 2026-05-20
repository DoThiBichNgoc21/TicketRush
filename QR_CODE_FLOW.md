# QR Code Ticket Management Flow - TicketRush

## 📋 Tổng quan

Sau khi người dùng đặt vé và thanh toán, họ sẽ nhận được vé điện tử với QR code để quản lý và check-in vào sự kiện.

---

## 🔄 Quy trình luồng hoàn chỉnh

### 1. **Người dùng đặt vé & thanh toán**
   - User chọn ghế → click "Thanh toán"
   - Xác nhận thông tin trong trang Checkout
   - Nhấn "Xác nhận thanh toán"
   
### 2. **Backend xử lý booking**
   - Gọi function SQL `confirm_booking()` để:
     - Kiểm tra ghế & locking
     - Tính tổng giá
     - Tạo bảng `bookings` record
     - Tạo `tickets` record cho mỗi ghế

### 3. **Frontend hiển thị thành công**
   - Trang Checkout hiển thị:
     - ✓ "Đặt vé thành công"
     - Mã đơn hàng (booking_id)
     - Chi tiết vé
   - **2 nút action:**
     - "Xem vé của tôi" → `/my-tickets`
     - "Về trang sự kiện"

### 4. **Người dùng xem vé & QR code**
   - Vào `/my-tickets` page
   - Xem danh sách tất cả bookings
   - Click vào booking để mở rộng
   - Xem chi tiết tickets & ghế
   - **Click "Hiển thị QR code"** để xem mã QR

### 5. **QR Code generation & display**
   - QR code được sinh từ chuỗi duy nhất:
     ```
     {booking_id}-{ticket_id}-{user_id}-{timestamp}
     ```
   - Frontend dùng thư viện `qrcode` để vẽ hình ảnh
   - User có thể **"Tải xuống"** QR code thành file PNG

---

## 📦 Backend Components

### **Database Schema** (`migrations/004_qr_code_tickets.sql`)

#### Cột mới trong bảng `tickets`:
```sql
- qr_code: TEXT               -- Mã QR duy nhất
- qr_generated_at: TIMESTAMPTZ -- Thời gian sinh QR
```

### **SQL Functions**

#### 1. `generate_ticket_qr(ticket_id, booking_id, user_id)`
```
Chức năng: Sinh QR code cho một vé
Input: ticket_id, booking_id, user_id
Output: { success, ticket_id, qr_code, generated_at }
```

#### 2. `get_user_bookings(user_id)`
```
Chức năng: Lấy danh sách bookings + tickets + QR codes
Input: user_id
Output: JSONB array của bookings với tickets nested
```

#### 3. `get_booking_with_showtime(booking_id, user_id)`
```
Chức năng: Lấy chi tiết một booking cùng showtime
Input: booking_id, user_id
Output: JSONB object có event, showtime, tickets data
```

### **API Endpoints** (`src/Routers/ticketRouter.js`)

```
GET  /api/tickets/my-bookings
     → Lấy danh sách tất cả bookings của user

GET  /api/tickets/booking/:bookingId
     → Lấy chi tiết booking cùng tickets & QR codes

POST /api/tickets/:ticketId/generate-qr
     → Sinh QR code cho ticket (nếu chưa có)

POST /api/tickets/:ticketId/verify
     Body: { qr_code: "..." }
     → Xác minh tính hợp lệ của QR code (dùng cho check-in)
```

### **Controller** (`src/Controllers/ticketController.js`)

Xử lý:
- Validation user & permission
- Gọi các RPC functions
- Return JSONB responses

---

## 🎨 Frontend Components

### **ticketApi.js** - API Service
```javascript
getMyBookings()              // GET /api/tickets/my-bookings
getBookingDetails(bookingId) // GET /api/tickets/booking/:bookingId
generateTicketQR(ticketId)   // POST /api/tickets/:ticketId/generate-qr
verifyTicket(ticketId, qr)   // POST /api/tickets/:ticketId/verify
```

### **MyTickets.jsx** - Main Page
```
Hiển thị:
✓ Danh sách bookings (collapsible cards)
✓ Mỗi booking có:
  - Event title, venue, total amount
  - Status (Confirmed / Pending)
  - Danh sách tickets với ghế info

Khi mở rộng booking:
✓ Chi tiết từng vé
✓ Nút "Hiển thị QR code" → sinh & hiển thị QR
✓ Nút "Tải xuống" → download QR as PNG
✓ Nút "Ẩn QR" → ẩn QR code
```

### **CheckoutPage.jsx** - Update
```
Sau khi thanh toán thành công:
+ "Xem vé của tôi" button → /my-tickets
+ "Về trang sự kiện" button (outline)
```

### **header.jsx** - Already updated
```
Dropdown menu user đã có:
✓ "Vé của tôi" link → /my-tickets
```

---

## 🔧 Installation & Setup

### **1. Install QRCode package (Frontend)**
```bash
cd frontend
npm install qrcode
```

### **2. Run migration (Backend - Supabase)**
```sql
-- Chạy trong Supabase SQL Editor:
-- File: backend/migrations/004_qr_code_tickets.sql
```

### **3. Update backend server.js** ✓ DONE
```javascript
import ticketRouter from "./src/Routers/ticketRouter.js"
app.use("/api/tickets", ticketRouter)
```

### **4. Update frontend App.jsx** ✓ DONE
```javascript
import MyTickets from './pages/user/MyTickets'
<Route path="/my-tickets" element={<MyTickets />} />
```

---

## 📊 Data Flow Diagram

```
User clicks "Confirm Payment"
         ↓
CheckoutPage.handleConfirmPay()
         ↓
confirmBooking(eventId, showtimeId, seatIds, totalAmount)
         ↓
Backend: POST /api/booking/confirm
         ↓
SQL: confirm_booking() function
    - Validate seats
    - Create bookings record
    - Create tickets records
    ↓
Return: { success: true, booking_id, ... }
         ↓
Frontend: orderResult state
         ↓
Show success message + buttons
    - "Xem vé của tôi" → /my-tickets
    - "Về trang sự kiện"
         ↓
User navigates to /my-tickets
         ↓
MyTickets.jsx loads
         ↓
getMyBookings() → GET /api/tickets/my-bookings
         ↓
Backend returns all bookings with tickets
         ↓
User sees bookings list
         ↓
User clicks booking → expands to show tickets
         ↓
User clicks "Hiển thị QR code"
         ↓
handleGenerateQR()
    - Gọi QRCode.toDataURL(qrCodeString)
    - Hiển thị PNG image
         ↓
User can download or share QR
```

---

## 🎯 Key Features

### ✅ Implemented
- [x] QR code generation (string-based)
- [x] Booking listing with tickets
- [x] QR display on demand
- [x] Download QR as PNG
- [x] Permission checking (only user's own tickets)
- [x] Responsive UI

### 🔜 Future enhancements
- [ ] Print QR code
- [ ] Email QR code
- [ ] QR code check-in scanning (admin panel)
- [ ] Bulk ticket download
- [ ] Ticket transfer to other users
- [ ] Used/unused status tracking
- [ ] Refund management

---

## 🔐 Security

### Tầng Authorization
```
1. verifyToken() middleware
   → Kiểm tra JWT token

2. requireUser() middleware
   → Kiểm tra user tồn tại

3. Xử lý ở backend
   → So sánh user_id từ token với user_id trong ticket
   → Chỉ trả dữ liệu của user đó
```

### QR Code Format
```
{booking_id}-{ticket_id}-{user_id}-{timestamp}

Ví dụ: 123-456-789-20260520142030

Bảo mật:
- Không contain sensitive data
- Linked to specific user & booking
- Timestamp prevents simple guessing
```

---

## 📱 Usage

### Người dùng
1. Đặt vé và thanh toán
2. Nhấn "Xem vé của tôi"
3. Tìm booking cần xem
4. Click vào booking để mở rộng
5. Click "Hiển thị QR code" để sinh QR
6. Có thể "Tải xuống" hoặc share QR

### Admin (Future - Check-in)
1. Scan QR code
2. Backend verify QR via POST `/api/tickets/:ticketId/verify`
3. Xác nhận vé hợp lệ & chưa sử dụng
4. Mark ticket as used

---

## 🐛 Troubleshooting

### QR code không hiển thị
- Kiểm tra qrcode package được cài chưa: `npm install qrcode`
- Kiểm tra browser console cho lỗi

### Không thể tải bookings
- Kiểm tra user_token trong localStorage
- Kiểm tra backend endpoints đang chạy
- Xem Network tab trong DevTools

### QR code không khớp khi verify
- Kiểm tra exact string trong database
- Kiểm tra timestamp tính toán đúng không

---

## 📚 Files Modified/Created

### Backend
```
✓ migrations/004_qr_code_tickets.sql (NEW)
✓ src/Controllers/ticketController.js (NEW)
✓ src/Routers/ticketRouter.js (NEW)
✓ server.js (UPDATED)
```

### Frontend
```
✓ src/lib/ticketApi.js (NEW)
✓ src/pages/user/MyTickets.jsx (NEW)
✓ src/App.jsx (UPDATED - added route)
✓ src/pages/user/CheckoutPage.jsx (UPDATED - added button)
```

---

## 🚀 Next Steps

1. **Install packages:**
   ```bash
   cd frontend && npm install qrcode
   cd backend && npm install qrcode  # if needed
   ```

2. **Run migration:**
   - Mở Supabase SQL Editor
   - Copy content từ `004_qr_code_tickets.sql`
   - Run nó

3. **Test flow:**
   - User login & đặt vé
   - Click "Xem vé của tôi"
   - Verify QR code hiển thị
   - Download QR code

4. **Monitor:** Kiểm tra logs & errors
