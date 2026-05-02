import supabase from "../config/supabase.js";

export const createEventStep1 = async (req, res) => {
    try {
        const {
            created_by,
            name,
            description,
            date,
            location,
            category,
            image_url
        } = req.body;

        if (!created_by || !name || !date || !location || !category) {
            return res.status(400).json({
                message: "Vui lòng nhập đầy đủ thông tin sự kiện"
            });
        }

        const { data, error } = await supabase
            .from("events")
            .insert([
                {
                    created_by,
                    name,
                    description,
                    date,
                    location,
                    category,
                    image_url
                }
            ])
            .select()
            .single();

        if (error) throw error;

        return res.status(201).json({
            message: "Tạo sự kiện thành công",
            event: data
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const createShowtimeStep2 = async (req, res) => {
    try {
        const { event_id } = req.params;
        const { start_time, location, city } = req.body;

        if (!start_time) {
            return res.status(400).json({
                message: "Vui lòng nhập thời gian bắt đầu"
            });
        }

        if (!location) {
            return res.status(400).json({
                message: "Vui lòng nhập địa điểm tổ chức"
            });
        }

        const fullLocation = city ? `${location}, ${city}` : location;

        const { data: showtime, error: showtimeError } = await supabase
            .from("showtimes")
            .insert([
                {
                    event_id,
                    start_time
                }
            ])
            .select()
            .single();

        if (showtimeError) throw showtimeError;

        const { data: event, error: eventError } = await supabase
            .from("events")
            .update({
                date: start_time,
                location: fullLocation,
                updated_at: new Date().toISOString()
            })
            .eq("id", event_id)
            .select()
            .single();

        if (eventError) throw eventError;

        return res.status(201).json({
            message: "Tạo suất diễn và cập nhật địa điểm thành công",
            showtime,
            event
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const createSeatingChartStep3 = async (req, res) => {
    try {
        const { showtime_id, seats } = req.body;

        if (!showtime_id) {
            return res.status(400).json({
                message: "Thiếu showtime_id"
            });
        }

        if (!Array.isArray(seats) || seats.length === 0) {
            return res.status(400).json({
                message: "Danh sách ghế không hợp lệ"
            });
        }

        await supabase
            .from("seating_chart")
            .delete()
            .eq("showtime_id", showtime_id);

        const seatData = seats.map((seat) => ({
            showtime_id,
            section: seat.section,
            row: seat.row,
            seat_number: seat.seat_number,
            status: seat.status || "available",
            locked_at: null,
            user_id: null
        }));

        const { data, error } = await supabase
            .from("seating_chart")
            .insert(seatData)
            .select();

        if (error) throw error;

        return res.status(201).json({
            message: "Tạo sơ đồ ghế thành công",
            seats: data
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};