import db from "../config/supabase.js";

export const getPublishedArticles = async (req, res) => {
    try {
        const { category_code } = req.query;

        let query = db
            .from("support_articles")
            .select("*")
            .eq("status", "published")
            .neq("slug", "thong-tin-lien-he-ticketrush")
            .order("sort_order", { ascending: true })
            .order("updated_at", { ascending: false });

        if (category_code) {
            query = query.eq("category_code", category_code);
        }

        const { data, error } = await query;

        if (error) throw error;

        return res.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("Error fetching published articles:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi tải danh sách hướng dẫn.",
        });
    }
};

export const getArticleBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const { data, error } = await db
            .from("support_articles")
            .select("*")
            .eq("slug", slug)
            .eq("status", "published")
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy bài viết hướng dẫn.",
                });
            }
            throw error;
        }

        return res.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("Error fetching article by slug:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi tải nội dung bài viết.",
        });
    }
};

export const getContactInfo = async (req, res) => {
    try {
        const { data, error } = await db
            .from("support_articles")
            .select("id, hotline, support_email, office_address, facebook_page, instagram_page, zalo_oa_id, updated_at")
            .eq("slug", "thong-tin-lien-he-ticketrush")
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                return res.json({ success: true, data: null });
            }
            throw error;
        }

        return res.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("Error fetching contact info:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi tải thông tin liên hệ.",
        });
    }
};
