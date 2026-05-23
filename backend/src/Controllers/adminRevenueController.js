
import { supabase } from "../config/supabaseClient.js";
import { DateTime } from "luxon";

//Sửa phần giao dịch gần đây
const getRelation = (value) => {
  return Array.isArray(value) ? value[0] : value;
};

const formatMoney = (value) => {
  return `${Number(value || 0).toLocaleString("vi-VN")}₫`;
};



const formatTime = (value) => {
  if (!value) return "";
  return DateTime.fromISO(value, { zone: "utc" }) // parse UTC
    .setZone("Asia/Ho_Chi_Minh")               // chuyển sang giờ Việt Nam
    .toFormat("HH:mm:ss");                     // format
};

const normalizeStatus = (status) => {
  return String(status || "").trim().toLowerCase();
};

const isCompletedTransaction = (status) => {
  const s = normalizeStatus(status);

  return ["completed", "success", "paid", "thành công"].includes(s);
};

const getStatusText = (status) => {
  const s = normalizeStatus(status);

  if (["completed", "success", "paid", "thành công"].includes(s)) {
    return "Thành công";
  }

  if (["pending", "processing", "chờ xử lý"].includes(s)) {
    return "Chờ xử lý";
  }

  if (["failed", "cancelled", "canceled", "thất bại"].includes(s)) {
    return "Thất bại";
  }

  return status || "Không rõ";
};

const getStatusColor = (status) => {
  const s = normalizeStatus(status);

  if (["completed", "success", "paid", "thành công"].includes(s)) {
    return "#00a000";
  }

  if (["pending", "processing", "chờ xử lý"].includes(s)) {
    return "#FFD700";
  }

  return "#e00d0d";
};

export const getRevenueData = async (req, res) => {
  try {
    // 1. Lấy tất cả transactions kèm thông tin sự kiện
    const { data: transactionsData, error: txnError } = await supabase
      .from("transactions")
      .select("*, bookings(id, event_id, events(name, location, date))")
      .order("purchase_date", { ascending: false });

    if (txnError) throw txnError;

    //Xem lỗi Giao dịch gần đây
    console.log("RAW transactionsData length:", transactionsData?.length);
    console.log("RAW transactionsData sample:", transactionsData?.slice(0, 3));

    // 2. Lấy tất cả events để tính occupancy
    const { data: eventsData, error: eventsError } = await supabase
      .from("events")
      .select("id, name, location, date, image_url");

    if (eventsError) throw eventsError;

    // 3. Lấy tất cả vé đã bán (bookings)
    const { data: ticketsData, error: ticketsError } = await supabase
      .from("tickets")
      .select("*, bookings(event_id, status)");

    if (ticketsError) throw ticketsError;

    // --- XỬ LÝ DOANH THU & GIAO DỊCH ---
    let totalRevenue = 0;

    const formattedTransactions = (transactionsData || []).map((t) => {
      const booking = getRelation(t.bookings);
      const event = getRelation(booking?.events);

      const amount = Number(t.amount) || 0;
      const statusText = getStatusText(t.transaction_status);

      // Chỉ cộng tiền nếu giao dịch thành công
      if (isCompletedTransaction(t.transaction_status)) {
        totalRevenue += amount;
      }

      return {
        ...t,

        // Tên hiển thị ở giao diện
        name: event?.name || `Booking #${t.booking_id}`,

        // Giờ hiển thị ở bảng giao dịch gần đây
        time: formatTime(t.purchase_date),

        // Số tiền
        amount,
        amountText: formatMoney(amount),

        // Trạng thái đã format sang tiếng Việt
        status: statusText,
        transaction_status: statusText,

        // Màu trạng thái
        color: getStatusColor(t.transaction_status),
      };
    });
    // --- XỬ LÝ VÉ BÁN & OCCUPANCY ---
    let ticketsSold = 0;
    const eventTicketCount = {};

    (ticketsData || []).forEach(ticket => {
      if (ticket.bookings?.status === 'Confirmed' || ticket.bookings?.status === 'completed') {
        ticketsSold++;
        const eventId = ticket.bookings?.event_id;
        if (eventId) {
          eventTicketCount[eventId] = (eventTicketCount[eventId] || 0) + 1;
        }
      }
    });

    // Format occupancy cho UI
    const occupancy = (eventsData || []).map(e => {
      const sold = eventTicketCount[e.id] || 0;

      let status = "Đang mở bán";
      let color = "#0053b7";
      if (sold > 0) { status = "Đã có giao dịch"; color = "#00a000"; }
      else { status = "Chưa có giao dịch"; color = "#5f5e5e"; }

      return {
        title: e.name,
        venue: e.location,
        //date: new Date(e.date).toLocaleDateString('vi-VN'),
        rawDate: e.date,
        sold: sold,
        status: status,
        color: color,
        image_url: (e.image_url && !e.image_url.startsWith('blob:')) ? e.image_url : null
      };
    });

    // --- Sort theo rawDate giảm dần (sự kiện mới nhất trước)
    occupancy.sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));

    res.json({
      totalRevenue,
      ticketsSold,
      occupancy,
      transactions: formattedTransactions.slice(0, 10) // Lấy 10 giao dịch gần nhất
    });
  } catch (err) {
    console.error("Revenue API Error:", err);
    res.status(500).json({ error: err.message });
  }
};