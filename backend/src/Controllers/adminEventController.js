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
                    image_url,
                    status: "draft"
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
        const { start_time, location, city, latitude, longitude } = req.body;

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
                    start_time,
                    city,
                    latitude,
                    longitude
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
        const { showtime_id, seats, layout, layoutData } = req.body;
        const finalLayout = layoutData || layout;
        
        console.log("Keys nhận được trong body:", Object.keys(req.body));

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

        console.log(`Đang xử lý ${seats.length} ghế cho showtime_id: ${showtime_id}`);
        
        // Lọc trùng lặp ngay tại backend để bảo vệ database
        const uniqueSeatsMap = new Map();
        seats.forEach(s => {
            const key = `${s.row}-${s.seat_number}`;
            if (!uniqueSeatsMap.has(key)) {
                uniqueSeatsMap.set(key, s);
            }
        });
        
        const filteredSeats = Array.from(uniqueSeatsMap.values());
        console.log(`Sau khi lọc trùng: ${filteredSeats.length} ghế.`);

        const seatData = filteredSeats.map((seat) => ({
            showtime_id,
            floor: seat.floor || 1,
            section: seat.section,
            row: seat.row,
            seat_number: seat.seat_number,
            status: seat.status || "available",
            seat_type: seat.seat_type || "Standard",
            price: seat.price || 0,
            locked_at: null,
            user_id: null
        }));

        // Xóa các ghế cũ của showtime này trước khi chèn mới
        const { error: deleteError } = await supabase
            .from("seating_chart")
            .delete()
            .eq("showtime_id", showtime_id);
            
        if (deleteError) {
            console.error("Lỗi xóa ghế cũ:", deleteError);
            throw deleteError;
        }

        const { data, error } = await supabase
            .from("seating_chart")
            .insert(seatData)
            .select();

        if (error) throw error;

        // Tự động chuyển trạng thái sự kiện sang "published" và lưu bản thiết kế sơ đồ (layout_json)
        const { event_id } = req.params;
        console.log("Đang lưu sơ đồ cho sự kiện ID:", event_id);
        
        // Log an toàn
        if (finalLayout) {
            console.log("Có nhận được dữ liệu layout.");
        } else {
            console.log("CẢNH BÁO: finalLayout là undefined!");
        }
 
        const { error: statusError } = await supabase
            .from("events")
            .update({ 
                status: "published",
                layout_json: finalLayout || [] // Đảm bảo luôn có giá trị (mảng rỗng nếu null)
            })
            .eq("id", event_id);

        if (statusError) {
            console.error("Lỗi cập nhật layout_json:", statusError);
            throw statusError;
        }

        return res.status(201).json({
            message: "Tạo sơ đồ ghế và xuất bản sự kiện thành công",
            seats: data
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};