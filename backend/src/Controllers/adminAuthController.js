import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import supabase from "../config/supabase.js";

export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .or(`username.eq.${username},email.eq.${username}`)
      .limit(1);

    if (error) {
      console.error("Supabase query error:", error);
      return res.status(500).json({ message: "Lỗi truy xuất dữ liệu" });
    }

    if (!users || users.length === 0) {
      return res.status(401).json({ message: "Tài khoản không tồn tại" });
    }

    const user = users[0];

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Bạn không có quyền admin" });
    }

    if (user.status === "blocked") {
      return res.status(403).json({ message: "Tài khoản đã bị khóa" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Mật khẩu không đúng" });
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    if (updateError) {
      console.error("Supabase update error:", updateError);
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Đăng nhập admin thành công",
      token,
      admin: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};