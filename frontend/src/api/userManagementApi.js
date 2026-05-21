const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || data?.error || "Có lỗi xảy ra khi gọi API.");
  }

  return data;
}

export function getUsers({
  keyword = "",
  gender = "Tất cả",
  status = "Tất cả",
  page = 1,
  limit = 4,
} = {}) {
  const params = new URLSearchParams({
    keyword,
    gender,
    status,
    page: String(page),
    limit: String(limit),
  });

  return request(`/usermanagement?${params.toString()}`);
}

export function getUserStats() {
  return request("/usermanagement/stats");
}

export function createUser(payload) {
  return request("/usermanagement", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateUser(id, payload) {
  return request(`/usermanagement/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function updateUserStatus(id, status) {
  return request(`/usermanagement/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function deleteUser(id) {
  return request(`/usermanagement/${id}`, {
    method: "DELETE",
  });
}