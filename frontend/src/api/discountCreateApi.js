const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const adminDiscountApi = {
  async getAllDiscounts() {
    const response = await fetch(`${API_BASE_URL}/api/discount/create`);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể lấy danh sách mã giảm giá");
    }

    return data;
  },

  async getDiscountById(id) {
    const response = await fetch(`${API_BASE_URL}/api/discount/create/${id}`);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể lấy chi tiết mã giảm giá");
    }

    return data;
  },

  async createDiscount(payload) {
    const response = await fetch(`${API_BASE_URL}/api/discount/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể tạo mã giảm giá");
    }

    return data;
  },

  async updateDiscount(id, payload) {
    const response = await fetch(`${API_BASE_URL}/api/discount/create/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể cập nhật mã giảm giá");
    }

    return data;
  },

  async deleteDiscount(id) {
    const response = await fetch(`${API_BASE_URL}/api/discount/create/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể xóa mã giảm giá");
    }

    return data;
  },

  async updateDiscountStatus(id, status) {
    const response = await fetch(
      `${API_BASE_URL}/api/discount/create/${id}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể cập nhật trạng thái");
    }

    return data;
  },
};