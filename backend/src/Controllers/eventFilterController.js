import supabase from "../config/supabase.js";

export const getFilterOptions = async (req, res) => {
    try {
        // Lấy tất cả các category duy nhất từ các sự kiện đã xuất bản
        const { data: categoriesData, error: catError } = await supabase
            .from('events')
            .select('category')
            .eq('status', 'published')
            .not('category', 'is', null);

        if (catError) throw catError;

        // Lấy tất cả các địa điểm duy nhất
        const { data: locationsData, error: locError } = await supabase
            .from('events')
            .select('location')
            .eq('status', 'published')
            .not('location', 'is', null);

        if (locError) throw locError;

        // Xử lý dữ liệu để lấy danh sách duy nhất
        const uniqueCategories = [...new Set(categoriesData.map(item => item.category))].sort();
        const uniqueLocations = [...new Set(locationsData.map(item => {
            // Thường địa điểm có dạng "Sân vận động, Hà Nội", ta lấy phần tỉnh thành cuối cùng nếu có
            const parts = item.location.split(',');
            return parts[parts.length - 1].trim();
        }))].sort();

        return res.json({
            success: true,
            categories: uniqueCategories,
            locations: uniqueLocations
        });
    } catch (error) {
        console.error("Error fetching filter options:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy tùy chọn bộ lọc."
        });
    }
};
