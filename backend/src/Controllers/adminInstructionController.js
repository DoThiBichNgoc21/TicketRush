import db from "../config/supabase.js";

const VALID_STATUSES = ["draft", "published", "archived"];

const CATEGORIES = [
    {
        category_code: "CUSTOMER",
        category_name: "Khách hàng",
    },
    {
        category_code: "POLICY",
        category_name: "Chính sách",
    },
    {
        category_code: "ORGANIZER",
        category_name: "Ban tổ chức",
    },
];

function getValue(body, snakeKey, camelKey) {
    return body[snakeKey] ?? body[camelKey];
}

function makeSlug(value = "") {
    return value
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

function findCategoryName(categoryCode) {
    const category = CATEGORIES.find(
        (item) => item.category_code === categoryCode
    );
    return category ? category.category_name : null;
}

async function ensureUniqueSlug(baseSlug, ignoreId = null) {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
        let query = db.from('support_articles').select('id').eq('slug', slug);
        if (ignoreId) {
            query = query.neq('id', ignoreId);
        }

        const { data, error } = await query;

        if (error) throw error;

        if (data.length === 0) {
            return slug;
        }

        slug = `${baseSlug}-${counter}`;
        counter += 1;
    }
}

function sendServerError(res, error) {
    console.error(error);
    if (error.code === "23505") { // Note: this is a PG error code, supabase returns it too in error.code
        return res.status(409).json({
            success: false,
            message: "Slug bài viết đã tồn tại.",
        });
    }

    return res.status(500).json({
        success: false,
        message: "Lỗi server.",
    });
}

export const getCategories = async (req, res) => {
    return res.json({
        success: true,
        data: CATEGORIES,
    });
};

export const getArticles = async (req, res) => {
    try {
        const q = req.query.q;
        const categoryCode = req.query.category_code || req.query.categoryCode;
        const status = req.query.status;

        let query = db.from('support_articles').select('*');

        query = query.neq('slug', 'thong-tin-lien-he-ticketrush');

        if (status) {
            if (!VALID_STATUSES.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Trạng thái bài viết không hợp lệ.",
                });
            }
            query = query.eq('status', status);
        } else {
            query = query.neq('status', 'archived');
        }

        if (categoryCode) {
            query = query.eq('category_code', categoryCode);
        }

        if (q) {
            query = query.or(`title.ilike.%${q}%,short_description.ilike.%${q}%,content.ilike.%${q}%`);
        }

        query = query.order('sort_order', { ascending: true }).order('updated_at', { ascending: false });

        const { data, error } = await query;

        if (error) throw error;

        return res.json({
            success: true,
            data: data,
        });
    } catch (error) {
        return sendServerError(res, error);
    }
};

export const getArticleById = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await db.from('support_articles').select('*').eq('id', id);

        if (error) throw error;

        if (data.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy bài viết.",
            });
        }

        return res.json({
            success: true,
            data: data[0],
        });
    } catch (error) {
        return sendServerError(res, error);
    }
};

export const createArticle = async (req, res) => {
    try {
        const title = getValue(req.body, "title", "title");
        const rawSlug = getValue(req.body, "slug", "slug");
        const categoryCode = getValue(req.body, "category_code", "categoryCode");
        const bodyCategoryName = getValue(
            req.body,
            "category_name",
            "categoryName"
        );
        const targetUser = getValue(req.body, "target_user", "targetUser");
        const shortDescription = getValue(
            req.body,
            "short_description",
            "shortDescription"
        );
        const content = getValue(req.body, "content", "content");
        const status = getValue(req.body, "status", "status") || "draft";
        const sortOrder = getValue(req.body, "sort_order", "sortOrder") || 0;

        if (!title || !categoryCode || !content) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập tiêu đề, danh mục và nội dung bài viết.",
            });
        }

        if (!VALID_STATUSES.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Trạng thái bài viết không hợp lệ.",
            });
        }

        const categoryName = bodyCategoryName || findCategoryName(categoryCode);

        if (!categoryName) {
            return res.status(400).json({
                success: false,
                message: "Danh mục bài viết không hợp lệ.",
            });
        }

        const baseSlug = makeSlug(rawSlug || title);

        if (!baseSlug) {
            return res.status(400).json({
                success: false,
                message: "Slug bài viết không hợp lệ.",
            });
        }

        const slug = await ensureUniqueSlug(baseSlug);
        const publishedAt = status === "published" ? new Date().toISOString() : null;

        const { data, error } = await db.from('support_articles').insert({
            title,
            slug,
            category_code: categoryCode,
            category_name: categoryName,
            target_user: targetUser || null,
            short_description: shortDescription || null,
            content,
            status,
            sort_order: sortOrder,
            published_at: publishedAt
        }).select();

        if (error) throw error;

        return res.status(201).json({
            success: true,
            message: "Tạo bài viết thành công.",
            data: data[0],
        });
    } catch (error) {
        return sendServerError(res, error);
    }
};

export const updateArticle = async (req, res) => {
    try {
        const { id } = req.params;

        const { data: currentResult, error: currentError } = await db.from('support_articles').select('*').eq('id', id);

        if (currentError) throw currentError;

        if (currentResult.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy bài viết.",
            });
        }

        const currentArticle = currentResult[0];

        const title = getValue(req.body, "title", "title") ?? currentArticle.title;
        const categoryCode = getValue(req.body, "category_code", "categoryCode") ?? currentArticle.category_code;
        const bodyCategoryName = getValue(req.body, "category_name", "categoryName");
        const categoryName = bodyCategoryName || findCategoryName(categoryCode) || currentArticle.category_name;
        const targetUser = getValue(req.body, "target_user", "targetUser") ?? currentArticle.target_user;
        const shortDescription = getValue(req.body, "short_description", "shortDescription") ?? currentArticle.short_description;
        const content = getValue(req.body, "content", "content") ?? currentArticle.content;
        const status = getValue(req.body, "status", "status") ?? currentArticle.status;
        const sortOrder = getValue(req.body, "sort_order", "sortOrder") ?? currentArticle.sort_order;

        if (!title || !categoryCode || !categoryName || !content) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập đầy đủ tiêu đề, danh mục và nội dung.",
            });
        }

        if (!VALID_STATUSES.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Trạng thái bài viết không hợp lệ.",
            });
        }

        const rawSlug = getValue(req.body, "slug", "slug") || (req.body.title ? title : currentArticle.slug);
        const baseSlug = makeSlug(rawSlug);

        if (!baseSlug) {
            return res.status(400).json({
                success: false,
                message: "Slug bài viết không hợp lệ.",
            });
        }

        const slug = await ensureUniqueSlug(baseSlug, id);

        const publishedAt = status === "published" ? currentArticle.published_at || new Date().toISOString() : null;

        const { data, error } = await db.from('support_articles').update({
            title,
            slug,
            category_code: categoryCode,
            category_name: categoryName,
            target_user: targetUser,
            short_description: shortDescription,
            content,
            status,
            sort_order: sortOrder,
            published_at: publishedAt,
            updated_at: new Date().toISOString()
        }).eq('id', id).select();

        if (error) throw error;

        return res.json({
            success: true,
            message: "Cập nhật bài viết thành công.",
            data: data[0],
        });
    } catch (error) {
        return sendServerError(res, error);
    }
};

export const deleteArticle = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await db.from('support_articles').delete().eq('id', id).select('id, title, status');

        if (error) throw error;

        if (data.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy bài viết.",
            });
        }

        return res.json({
            success: true,
            message: "Đã xóa bài viết.",
            data: data[0],
        });
    } catch (error) {
        return sendServerError(res, error);
    }
};

export const getContactInfo = async (req, res) => {
    try {
        const { data, error } = await db.from('support_articles').select('id, hotline, support_email, office_address, facebook_page, instagram_page, zalo_oa_id, updated_at').eq('slug', 'thong-tin-lien-he-ticketrush').limit(1);

        if (error) throw error;

        if (data.length === 0) {
            return res.json({
                success: true,
                data: {
                    id: null,
                    hotline: "",
                    support_email: "",
                    office_address: "",
                    facebook_page: "",
                    instagram_page: "",
                    zalo_oa_id: "",
                    updated_at: null,
                },
            });
        }

        return res.json({
            success: true,
            data: data[0],
        });
    } catch (error) {
        return sendServerError(res, error);
    }
};

export const updateContactInfo = async (req, res) => {
    try {
        const hotline = getValue(req.body, "hotline", "hotline") || "";
        const supportEmail = getValue(req.body, "support_email", "supportEmail") || "";
        const officeAddress = getValue(req.body, "office_address", "officeAddress") || "";
        const facebookPage = getValue(req.body, "facebook_page", "facebookPage") || "";
        const instagramPage = getValue(req.body, "instagram_page", "instagramPage") || "";
        const zaloOaId = getValue(req.body, "zalo_oa_id", "zaloOaId") || "";

        const { data, error } = await db.from('support_articles').upsert({
            slug: 'thong-tin-lien-he-ticketrush',
            title: 'Thông tin liên hệ TicketRush',
            category_code: 'CONTACT',
            category_name: 'Thông tin liên hệ',
            target_user: 'all',
            short_description: 'Thông tin hotline, email, địa chỉ văn phòng và mạng xã hội của TicketRush.',
            content: 'Thông tin liên hệ chính thức của TicketRush.',
            status: 'published',
            sort_order: 0,
            hotline,
            support_email: supportEmail,
            office_address: officeAddress,
            facebook_page: facebookPage,
            instagram_page: instagramPage,
            zalo_oa_id: zaloOaId,
            published_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }, { onConflict: 'slug' }).select('id, hotline, support_email, office_address, facebook_page, instagram_page, zalo_oa_id, updated_at');

        if (error) throw error;

        return res.json({
            success: true,
            message: "Cập nhật thông tin liên hệ thành công.",
            data: data[0],
        });
    } catch (error) {
        return sendServerError(res, error);
    }
};