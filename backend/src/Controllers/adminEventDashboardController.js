import supabase from "../config/supabase.js";

export const getEvents = async (req, res) => {
  try {
    const { search, status, category } = req.query;

    let query = supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(200).json({
      message: "Lấy danh sách sự kiện thành công",
      events: data,
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