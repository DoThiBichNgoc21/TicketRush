import supabase from "../config/supabase.js";

const USER_TABLE = "users";

function mapDbStatusToUi(status) {
  if (status === "active") return "Hoạt động";
  if (status === "blocked") return "Đã khóa";
  return "Hoạt động";
}

function mapUiStatusToDb(status) {
  if (status === "Hoạt động") return "active";
  if (status === "Đã khóa") return "blocked";
  if (status === "active") return "active";
  if (status === "blocked") return "blocked";
  return "active";
}

function formatDateVN(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("vi-VN");
}

function getFullName(user) {
  const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim();
  return fullName || user.username || "Người dùng";
}

function getAvatar(user) {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    getFullName(user)
  )}`;
}

function normalizeUser(row) {
  const currentYear = new Date().getFullYear();
  const age = row.birth_year ? currentYear - Number(row.birth_year) : null;

  return {
    id: row.id,
    username: row.username,
    name: getFullName(row),
    firstName: row.first_name || "",
    lastName: row.last_name || "",
    email: row.email,
    phoneNumber: row.phone_number || "",
    gender: row.gender || "Khác",
    birthYear: row.birth_year || null,
    age: age !== null ? `${age} tuổi` : "Chưa cập nhật",
    role: row.role,
    status: mapDbStatusToUi(row.status),
    statusRaw: row.status,
    joined: formatDateVN(row.created_at),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLogin: row.last_login ? formatDateVN(row.last_login) : "Chưa đăng nhập",
    avatar: getAvatar(row),
  };
}

function getFirstDayOfCurrentMonthISO() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}-01`;
}

async function countUsers(applyFilter) {
  let query = supabase
    .from(USER_TABLE)
    .select("id", {
      count: "exact",
      head: true,
    });

  if (applyFilter) {
    query = applyFilter(query);
  }

  const { count, error } = await query;

  if (error) {
    throw error;
  }

  return count || 0;
}

/*
async function getUserStats(req, res) {
  try {
    const firstDayOfMonth = getFirstDayOfCurrentMonthISO();

    const [
        totalUsers,
        activeUsers,
        blockedUsers,
        newUsers,
        maleUsers,
        femaleUsers,
        otherGenderUsers,
        ] = await Promise.all([
        countUsers(),
        countUsers((query) => query.eq("status", "active")),
        countUsers((query) => query.eq("status", "blocked")),
        countUsers((query) => query.gte("created_at", firstDayOfMonth)),
        countUsers((query) => query.eq("gender", "Nam")),
        countUsers((query) => query.eq("gender", "Nữ")),
        countUsers((query) => query.eq("gender", "Khác")),
    ]);

    res.json({
      totalUsers,
      newUsers,
      activeRate:
        totalUsers === 0
          ? 0
          : Number(((activeUsers / totalUsers) * 100).toFixed(1)),
      genderStats: {
        Nam: maleUsers,
        Nữ: femaleUsers,
        Khác: otherGenderUsers,
      },
      statusStats: {
        active: activeUsers,
        blocked: blockedUsers,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Không thể lấy thống kê người dùng.",
      error: error.message,
    });
  }
}

async function getUserStats(req, res) {
  try {
    const firstDayOfMonth = getFirstDayOfCurrentMonthISO();

    // Lấy toàn bộ người dùng từ bảng users
    const { data: users, error } = await supabase
      .from(USER_TABLE)
      .select("id, status, gender, created_at");

    if (error) throw error;

    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === "active").length;
    const blockedUsers = users.filter(u => u.status === "blocked").length;
    const newUsers = users.filter(u => new Date(u.created_at) >= new Date(firstDayOfMonth)).length;
    const maleUsers = users.filter(u => u.gender === "Nam").length;
    const femaleUsers = users.filter(u => u.gender === "Nữ").length;
    const otherGenderUsers = users.filter(u => u.gender === "Khác").length;

    res.json({
      totalUsers,
      newUsers,
      activeRate: totalUsers === 0 ? 0 : Number(((activeUsers / totalUsers) * 100).toFixed(1)),
      genderStats: {
        Nam: maleUsers,
        Nữ: femaleUsers,
        Khác: otherGenderUsers,
      },
      statusStats: {
        active: activeUsers,
        blocked: blockedUsers,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Không thể lấy thống kê người dùng.",
      error: error.message,
    });
  }
}
  */
async function getUserStats(req, res) {
  try {
    // Lấy ngày đầu tháng để thống kê người dùng mới
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    // Lấy tất cả người dùng từ Supabase
    const { data: users, error } = await supabase
      .from(USER_TABLE)
      .select("id, status, gender, created_at");

    if (error) {
      throw error;
    }

    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === "active").length;
    const blockedUsers = users.filter(u => u.status === "blocked").length;
    const newUsers = users.filter(u => new Date(u.created_at) >= firstDayOfMonth).length;

    // Thống kê theo giới tính
    const maleUsers = users.filter(u => u.gender === "Nam").length;
    const femaleUsers = users.filter(u => u.gender === "Nữ").length;
    const otherGenderUsers = users.filter(u => u.gender === "Khác").length;

    res.json({
      totalUsers,
      newUsers,
      activeRate: totalUsers === 0 ? 0 : Number(((activeUsers / totalUsers) * 100).toFixed(1)),
      genderStats: {
        Nam: maleUsers,
        Nữ: femaleUsers,
        Khác: otherGenderUsers,
      },
      statusStats: {
        active: activeUsers,
        blocked: blockedUsers,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Không thể lấy thống kê người dùng.",
      error: error.message,
    });
  }
}

async function getUsers(req, res) {
  try {
    const keyword = req.query.keyword || "";
    const gender = req.query.gender || "Tất cả";
    const status = req.query.status || "Tất cả";

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 4, 1);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from(USER_TABLE)
      .select(
        `
          id,
          username,
          email,
          role,
          first_name,
          last_name,
          phone_number,
          gender,
          birth_year,
          status,
          created_at,
          updated_at,
          last_login
        `,
        {
          count: "exact",
        }
      )
      .order("id", {
        ascending: false,
      })
      .range(from, to);

    const cleanKeyword = keyword.trim().replace(/[,%]/g, " ");

    if (cleanKeyword) {
      query = query.or(
        `username.ilike.%${cleanKeyword}%,email.ilike.%${cleanKeyword}%,first_name.ilike.%${cleanKeyword}%,last_name.ilike.%${cleanKeyword}%,phone_number.ilike.%${cleanKeyword}%`
      );
    }

    if (gender !== "Tất cả") {
      query = query.eq("gender", gender);
    }

    if (status !== "Tất cả") {
      query = query.eq("status", mapUiStatusToDb(status));
    }

    const { data, count, error } = await query;

    if (error) {
      throw error;
    }

    const total = count || 0;

    res.json({
      data: (data || []).map(normalizeUser),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Không thể lấy danh sách người dùng.",
      error: error.message,
    });
  }
}

async function createUser(req, res) {
  try {
    const {
      username,
      email,
      password,
      role = "user",
      firstName = "",
      lastName = "",
      phoneNumber = "",
      gender = "Khác",
      status = "Hoạt động",
    } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Vui lòng nhập username, email và mật khẩu.",
      });
    }

    if (!["Nam", "Nữ", "Khác"].includes(gender)) {
      return res.status(400).json({
        message: "Giới tính không hợp lệ.",
      });
    }

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Vai trò không hợp lệ.",
      });
    }

    const { data, error } = await supabase
      .from(USER_TABLE)
      .insert({
        username: username.trim(),
        email: email.trim(),
        password,
        role,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        gender,
        status: mapUiStatusToDb(status),
      })
      .select(
        `
          id,
          username,
          email,
          role,
          first_name,
          last_name,
          phone_number,
          gender,
          status,
          created_at,
          updated_at,
          last_login
        `
      )
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      message: "Thêm người dùng thành công.",
      data: normalizeUser(data),
    });
  } catch (error) {
    res.status(500).json({
      message: "Không thể thêm người dùng.",
      error: error.message,
    });
  }
}

async function updateUser(req, res) {
  try {
    const { id } = req.params;

    const updateData = {
      username: req.body.username,
      email: req.body.email,
      role: req.body.role,
      first_name: req.body.firstName,
      last_name: req.body.lastName,
      phone_number: req.body.phoneNumber,
      gender: req.body.gender,
      status: req.body.status ? mapUiStatusToDb(req.body.status) : undefined,
      updated_at: new Date().toISOString(),
    };

    if (req.body.password) {
      updateData.password = req.body.password;
    }

    Object.keys(updateData).forEach((key) => {
      if (
        updateData[key] === undefined ||
        updateData[key] === null ||
        updateData[key] === ""
      ) {
        delete updateData[key];
      }
    });

    const { data, error } = await supabase
      .from(USER_TABLE)
      .update(updateData)
      .eq("id", id)
      .select(
        `
          id,
          username,
          email,
          role,
          first_name,
          last_name,
          phone_number,
          gender,
          status,
          created_at,
          updated_at,
          last_login
        `
      )
      .single();

    if (error) {
      throw error;
    }

    res.json({
      message: "Cập nhật người dùng thành công.",
      data: normalizeUser(data),
    });
  } catch (error) {
    res.status(500).json({
      message: "Không thể cập nhật người dùng.",
      error: error.message,
    });
  }
}

async function updateUserStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Hoạt động", "Đã khóa", "active", "blocked"].includes(status)) {
      return res.status(400).json({
        message: "Trạng thái không hợp lệ.",
      });
    }

    const { data, error } = await supabase
      .from(USER_TABLE)
      .update({
        status: mapUiStatusToDb(status),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(
        `
          id,
          username,
          email,
          role,
          first_name,
          last_name,
          phone_number,
          gender,
          status,
          created_at,
          updated_at,
          last_login
        `
      )
      .single();

    if (error) {
      throw error;
    }

    res.json({
      message: "Cập nhật trạng thái thành công.",
      data: normalizeUser(data),
    });
  } catch (error) {
    res.status(500).json({
      message: "Không thể cập nhật trạng thái.",
      error: error.message,
    });
  }
}

async function getUserById(req, res) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from(USER_TABLE)
      .select(
        `
          id,
          username,
          email,
          role,
          first_name,
          last_name,
          phone_number,
          gender,
          birth_year,
          avatar_url,
          status,
          created_at,
          updated_at,
          last_login
        `
      )
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.json({
      data: normalizeUser(data),
    });
  } catch (error) {
    res.status(500).json({
      message: "Không thể lấy thông tin người dùng.",
      error: error.message,
    });
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    const { error } = await supabase.from(USER_TABLE).delete().eq("id", id);

    if (error) {
      throw error;
    }

    res.json({
      message: "Xóa người dùng thành công.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Không thể xóa người dùng.",
      error: error.message,
    });
  }
}

export {
  getUsers,
  getUserById,
  getUserStats,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
};