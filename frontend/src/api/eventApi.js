const API_URL = "http://localhost:3000/api/events";

const getToken = () => localStorage.getItem("token");

export const getEvents = async ({ search = "", status = "" } = {}) => {
    const params = new URLSearchParams();

    if (search) params.append("search", search);
    if (status) params.append("status", status);

    const res = await fetch(`${API_URL}?${params.toString()}`, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });

    return res.json();
};

export const getEventById = async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });

    return res.json();
};

export const createEvent = async (eventData) => {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(eventData),
    });

    return res.json();
};

export const updateEvent = async (id, eventData) => {
    const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(eventData),
    });

    return res.json();
};

export const toggleEventVisibility = async (id, is_visible) => {
    const res = await fetch(`${API_URL}/${id}/visibility`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ is_visible }),
    });

    return res.json();
};