const API_BASE_URL = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/discount`
    : "http://localhost:3000/api/discount";

export const getDiscountCodes = async ({
    search = "",
    status = "",
    page = 1,
    limit = 10,
} = {}) => {
    const params = new URLSearchParams();

    if (search) params.append("search", search);
    if (status) params.append("status", status);
    params.append("page", page);
    params.append("limit", limit);

    const response = await fetch(`${API_BASE_URL}?${params.toString()}`);
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Không thể lấy danh sách mã giảm giá");
    }

    return result;
};

export const getDiscountStats = async () => {
    const response = await fetch(`${API_BASE_URL}/stats`);
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Không thể lấy thống kê mã giảm giá");
    }

    return result;
};

export const createDiscountCode = async (payload) => {
    const response = await fetch(`${API_BASE_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Không thể tạo mã giảm giá");
    }

    return result;
};

export const updateDiscountCode = async (id, payload) => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Không thể cập nhật mã giảm giá");
    }

    return result;
};

export const deleteDiscountCode = async (id) => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Không thể xóa mã giảm giá");
    }

    return result;
};