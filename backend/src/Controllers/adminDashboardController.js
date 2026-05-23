import supabase from "../config/supabase.js";

export const getDashboardStats = async (req, res) => {
  try {
    // 1. Lấy toàn bộ giao dịch để tính Doanh thu
    const { data: transactions, error: txError } = await supabase
      .from("transactions")
      .select("amount, transaction_status");

    if (txError) throw txError;

    let totalRevenue = 0;
    (transactions || []).forEach((t) => {
      const status = String(t.transaction_status || "").trim().toLowerCase();
      if (["completed", "success", "paid", "thành công"].includes(status)) {
        totalRevenue += Number(t.amount) || 0;
      }
    });

    // 2. Lấy danh sách vé cùng thông tin booking để tính số vé đã bán, doanh thu và tỷ lệ lấp đầy
    const { data: tickets, error: ticketsError } = await supabase
      .from("tickets")
      .select("id, price, bookings(id, event_id, status)");

    if (ticketsError) throw ticketsError;

    let ticketsSold = 0;
    const eventRevenueMap = {}; // eventId -> tổng doanh thu vé đã bán
    const eventSoldCount = {};  // eventId -> số vé đã bán (Confirmed)

    (tickets || []).forEach((t) => {
      const booking = Array.isArray(t.bookings) ? t.bookings[0] : t.bookings;
      if (!booking) return;

      const eventId = booking.event_id;
      if (!eventId) return;

      const bookingStatus = String(booking.status || "").trim().toLowerCase();
      if (["confirmed", "completed", "success", "paid", "thành công"].includes(bookingStatus)) {
        // Chỉ đếm vé đã thanh toán thành công
        ticketsSold++;
        eventSoldCount[eventId] = (eventSoldCount[eventId] || 0) + 1;
        eventRevenueMap[eventId] = (eventRevenueMap[eventId] || 0) + (Number(t.price) || 0);
      }
    });

    // 3. Lấy tất cả sự kiện để đếm số sự kiện đang hoạt động (đang diễn ra + sắp diễn ra)
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("id, name, location, date, status, image_url")
      .order("created_at", { ascending: false });

    if (eventsError) throw eventsError;

    // Lấy thời điểm bắt đầu ngày hôm nay (00:00:00) theo giờ địa phương để so sánh
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const activeEvents = (events || []).filter((e) => {
      if (e.status !== "published") return false;
      if (!e.date) return false;
      const eventDate = new Date(e.date);
      // Đang diễn ra hoặc Sắp diễn ra (ngày diễn ra >= bắt đầu ngày hôm nay)
      return eventDate >= startOfToday;
    }).length;

    // 4. Đếm tổng sức chứa thực tế từ seating_chart theo từng showtime (song song)
    // Dùng count HEAD query tránh giới hạn 1000 rows của Supabase
    const { data: showtimes, error: stError } = await supabase
      .from("showtimes")
      .select("id, event_id");
    if (stError) throw stError;

    const seatCountResults = await Promise.all(
      (showtimes || []).map((st) =>
        supabase
          .from("seating_chart")
          .select("*", { count: "exact", head: true })
          .eq("showtime_id", st.id)
          .then(({ count }) => ({ eventId: st.event_id, count: count || 0 }))
      )
    );

    const eventCapacity = {}; // eventId -> tổng số ghế (sức chứa)
    seatCountResults.forEach(({ eventId, count }) => {
      if (eventId) eventCapacity[eventId] = (eventCapacity[eventId] || 0) + count;
    });

    // 5. Tính occupancy: vé đã bán (Confirmed) / tổng sức chứa (seating_chart)
    const occupancy = (events || []).map((e) => {
      const sold = eventSoldCount[e.id] || 0;
      const total = eventCapacity[e.id] || 0;
      const ratio = total > 0 ? sold / total : 0;
      return { id: e.id, name: e.name, sold: ratio };
    });

    // 6. Danh sách sự kiện gần đây kèm tỷ lệ lấp đầy và doanh thu thật
    const recentEvents = (events || []).slice(0, 5).map((e) => {
      const sold = eventSoldCount[e.id] || 0;
      const total = eventCapacity[e.id] || 0;
      // Tỷ lệ lấp đầy = số vé đã bán / tổng sức chứa * 100%
      const occupancyPercent = total > 0 ? Math.round((sold / total) * 100) : 0;
      const eventRev = eventRevenueMap[e.id] || 0;
      return {
        id: e.id,
        name: e.name,
        location: e.location,
        date: e.date,
        status: e.status,
        image_url: e.image_url,
        occupancyPercent,
        totalRevenue: eventRev,
      };
    });

    // 7. Lấy thông tin nhân khẩu học (Tuổi & Giới tính) từ bảng users
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("gender, birth_year");

    if (usersError) throw usersError;

    const currentYear = new Date().getFullYear();
    let age18_24 = 0;
    let age25_34 = 0;
    let age35_44 = 0;
    let age45_plus = 0;
    let totalWithAge = 0;

    let maleCount = 0;
    let femaleCount = 0;
    let otherCount = 0;
    let totalWithGender = 0;

    (users || []).forEach((u) => {
      if (u.birth_year) {
        const age = currentYear - Number(u.birth_year);
        if (!isNaN(age)) {
          totalWithAge++;
          if (age >= 18 && age <= 24) age18_24++;
          else if (age >= 25 && age <= 34) age25_34++;
          else if (age >= 35 && age <= 44) age35_44++;
          else if (age >= 45) age45_plus++;
        }
      }

      if (u.gender) {
        totalWithGender++;
        const g = String(u.gender).trim().toLowerCase();
        if (g === "nam" || g === "male") maleCount++;
        else if (g === "nữ" || g === "female") femaleCount++;
        else otherCount++;
      }
    });

    const ageDemographics = {
      "18-24": totalWithAge ? Math.round((age18_24 / totalWithAge) * 100) : 45,
      "25-34": totalWithAge ? Math.round((age25_34 / totalWithAge) * 100) : 32,
      "35-44": totalWithAge ? Math.round((age35_44 / totalWithAge) * 100) : 15,
      "45+": totalWithAge ? Math.round((age45_plus / totalWithAge) * 100) : 8,
    };

    const genderStats = {
      "Nam": totalWithGender ? Math.round((maleCount / totalWithGender) * 100) : 24,
      "Nữ": totalWithGender ? Math.round((femaleCount / totalWithGender) * 100) : 52,
      "Khác": totalWithGender ? Math.round((otherCount / totalWithGender) * 100) : 24,
    };

    return res.status(200).json({
      ticketsSold,
      totalRevenue,
      occupancy,
      activeEvents,
      recentEvents,
      ageDemographics,
      genderStats,
    });
  } catch (error) {
    console.error("Lỗi lấy dữ liệu Admin Dashboard:", error);
    return res.status(500).json({ message: "Lỗi server khi lấy dữ liệu dashboard", error: error.message });
  }
};
