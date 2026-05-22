import supabase from "../config/supabase.js";
import { mapSeatForClient } from "../utils/seatStatus.js";

/** Supabase/PostgREST thường giới hạn 1000 dòng/lần — phải phân trang */
async function fetchAllSeatsForShowtime(showtimeId) {
  const pageSize = 1000;
  const all = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("seating_chart")
      .select("*")
      .eq("showtime_id", showtimeId)
      .range(from, from + pageSize - 1);

    if (error) throw error;
    if (!data?.length) break;

    all.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return all;
}

export const getEvents = async (req, res) => {
  try {
    const { search, status, category, page = 1, limit = 15 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from("events")
      .select("id, name, date, location, category, image_url, status, is_featured, created_at, updated_at, is_visible", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    if (status) {
      const now = new Date();
      const todayStart = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      const todayEnd = new Date(now.setHours(23, 59, 59, 999)).toISOString();

      if (status === "ongoing") {
        query = query.eq("status", "published").gte("date", todayStart).lte("date", todayEnd);
      } else if (status === "upcoming") {
        query = query.eq("status", "published").gt("date", todayEnd);
      } else if (status === "ended") {
        query = query.or(`status.eq.ended,date.lt.${todayStart}`);
      } else {
        query = query.eq("status", status);
      }
    }

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error, count } = await query;

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(200).json({
      message: "Lấy danh sách sự kiện thành công",
      events: data,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit)),
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: "Không tìm thấy sự kiện" });
    }

    return res.status(200).json({
      message: "Lấy chi tiết sự kiện thành công",
      event: data,
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

/** Suất chiếu + sự kiện cho trang /booking/:showtimeId (bypass RLS showtimes) */
export const getShowtimeBookingDetail = async (req, res) => {
  try {
    const { showtimeId } = req.params;

    const { data: showtime, error: stErr } = await supabase
      .from("showtimes")
      .select("*, events(*)")
      .eq("id", showtimeId)
      .single();

    if (stErr || !showtime) {
      return res.status(404).json({ message: "Không tìm thấy suất chiếu" });
    }

    const event = Array.isArray(showtime.events) ? showtime.events[0] : showtime.events;
    if (!event || event.status !== "published") {
      return res.status(404).json({ message: "Sự kiện không khả dụng" });
    }

    const { events: _nested, ...showtimeFields } = showtime;

    return res.status(200).json({
      message: "Lấy thông tin đặt vé thành công",
      showtime: showtimeFields,
      event,
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

/** Danh sách suất chiếu theo event (bypass RLS showtimes) */
export const getShowtimesByEventId = async (req, res) => {
  try {
    const eventId = req.params.eventId ?? req.params.id;

    const { data: eventRow, error: evErr } = await supabase
      .from("events")
      .select("id, status")
      .eq("id", eventId)
      .single();

    if (evErr || !eventRow || eventRow.status !== "published") {
      return res.status(404).json({ message: "Sự kiện không khả dụng" });
    }

    const { data: showtimes, error: stErr } = await supabase
      .from("showtimes")
      .select("*")
      .eq("event_id", eventId)
      .order("start_time", { ascending: true });

    if (stErr) {
      return res.status(400).json({ message: stErr.message });
    }

    const list = showtimes ?? [];
    const showtimesWithCounts = [];

    for (const st of list) {
      const { count, error: countErr } = await supabase
        .from("seating_chart")
        .select("*", { count: "exact", head: true })
        .eq("showtime_id", st.id);

      showtimesWithCounts.push({
        ...st,
        seat_count: countErr ? 0 : count ?? 0,
      });
    }

    return res.status(200).json({
      message: "Lấy suất chiếu thành công",
      showtimes: showtimesWithCounts,
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

/**
 * Đọc ghế theo showtime bằng service role (bypass RLS) cho trang đặt vé.
 * Chỉ trả dữ liệu khi sự kiện đã published — tránh lộ sơ đồ bản nháp.
 */
export const getSeatingChartByShowtime = async (req, res) => {
  try {
    const { showtimeId } = req.params;

    const { data: showtime, error: stErr } = await supabase
      .from("showtimes")
      .select("id, event_id")
      .eq("id", showtimeId)
      .single();

    if (stErr || !showtime) {
      return res.status(404).json({ message: "Không tìm thấy suất chiếu" });
    }

    const { data: eventRow, error: evErr } = await supabase
      .from("events")
      .select("status")
      .eq("id", showtime.event_id)
      .single();

    if (evErr || !eventRow || eventRow.status !== "published") {
      return res.status(404).json({ message: "Sự kiện không khả dụng" });
    }

    await supabase.rpc("expire_stale_seat_locks", { p_hold_seconds: 600 }).catch(() => {});

    let seats;
    try {
      const raw = await fetchAllSeatsForShowtime(showtime.id);
      seats = raw.map(mapSeatForClient);
    } catch (seatErr) {
      return res.status(400).json({ message: seatErr.message });
    }

    return res.status(200).json({
      message: "Lấy sơ đồ ghế thành công",
      seats,
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

export const createEvent = async (req, res) => {
  try {
    const {
      name,
      description,
      date,
      location,
      category,
      image_url,
      status,
      is_featured,
    } = req.body;

    if (!name || !date || !location) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ tên sự kiện, ngày tổ chức và địa điểm",
      });
    }

    const { data, error } = await supabase
      .from("events")
      .insert([
        {
          name,
          description,
          date,
          location,
          category,
          image_url,
          status: status || "draft",
          is_featured: is_featured || false,
          created_by: req.user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(201).json({
      message: "Tạo sự kiện thành công",
      event: data,
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      date,
      location,
      category,
      image_url,
      status,
      is_featured,
    } = req.body;

    const { data, error } = await supabase
      .from("events")
      .update({
        name,
        description,
        date,
        location,
        category,
        image_url,
        status,
        is_featured,
        updated_at: new Date(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ message: "Không tìm thấy sự kiện" });
    }

    return res.status(200).json({
      message: "Cập nhật sự kiện thành công",
      event: data,
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

export const updateEventVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_visible } = req.body;

    if (typeof is_visible !== "boolean") {
      return res.status(400).json({
        message: "is_visible phải là true hoặc false",
      });
    }

    const { data, error } = await supabase
      .from("events")
      .update({
        is_visible,
        updated_at: new Date(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ message: "Không tìm thấy sự kiện" });
    }

    return res.status(200).json({
      message: is_visible ? "Đã hiện sự kiện" : "Đã ẩn sự kiện",
      event: data,
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

export const setupEventSeats = async (req, res) => {
  try {
    const { id } = req.params;
    const { seats } = req.body;

    if (!Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        message: "Danh sách ghế không hợp lệ",
      });
    }

    const seatData = seats.map((seat) => ({
      event_id: id,
      section_name: seat.section_name,
      row_name: seat.row_name,
      seat_number: seat.seat_number,
      seat_type: seat.seat_type,
      price: seat.price,
      status: "available",
    }));

    const { data, error } = await supabase
      .from("event_seats")
      .insert(seatData)
      .select();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(201).json({
      message: "Thiết lập sơ đồ ghế thành công",
      seats: data,
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

export const getEventStats = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: seats, error } = await supabase
      .from("event_seats")
      .select("*")
      .eq("event_id", id);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const totalSeats = seats.length;
    const soldSeats = seats.filter((seat) => seat.status === "sold").length;
    const availableSeats = seats.filter((seat) => seat.status === "available").length;

    const revenue = seats
      .filter((seat) => seat.status === "sold")
      .reduce((total, seat) => total + Number(seat.price || 0), 0);

    return res.status(200).json({
      message: "Lấy thống kê sự kiện thành công",
      stats: {
        totalSeats,
        soldSeats,
        availableSeats,
        revenue,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

export const toggleEventVisibility = async (req, res) => {
  const { id } = req.params;
  const { is_visible } = req.body;

  const { data, error } = await supabase
    .from("events")
    .update({
      is_visible,
      updated_at: new Date(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  res.json({
    message: is_visible ? "Đã hiện sự kiện" : "Đã ẩn sự kiện",
    event: data,
  });
};