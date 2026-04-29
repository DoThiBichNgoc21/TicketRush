import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabaseClient.js';

const JWT_SECRET = process.env.JWT_SECRET || 'ticketrush_admin_secret_change_me';

export const registerAdmin = async (req, res) => {
  try {
    const { username, password, email, first_name, last_name, phone_number } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ username, email và password' });
    }

    const { data: existingByEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingByEmail) {
      return res.status(409).json({ message: 'Email đã được sử dụng' });
    }

    const { data: existingByUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (existingByUser) {
      return res.status(409).json({ message: 'Username đã được sử dụng' });
    }

    const { data, error } = await supabase
      .from('users')
      .insert({
        username,
        email,
        password,
        role: 'admin',
        first_name: first_name || null,
        last_name: last_name || null,
        phone_number: phone_number || null,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ message: 'Không thể tạo tài khoản', detail: error.message });
    }

    return res.status(201).json({
      message: 'Đăng ký admin thành công',
      user: { id: data.id, username: data.username, email: data.email, role: data.role }
    });
  } catch (err) {
    console.error('Register admin error:', err);
    return res.status(500).json({ message: err.message || 'Lỗi server' });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập email và password' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error || !user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập trang admin' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ message: 'Tài khoản đã bị khóa' });
    }

    if (password !== user.password) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });
  } catch (err) {
    console.error('Login admin error:', err);
    return res.status(500).json({ message: err.message || 'Lỗi server' });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { username, password, email, first_name, last_name, phone_number } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ username, email và password' });
    }

    const { data: existingByEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingByEmail) {
      return res.status(409).json({ message: 'Email đã được sử dụng' });
    }

    const { data: existingByUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (existingByUser) {
      return res.status(409).json({ message: 'Username đã được sử dụng' });
    }

    const { data, error } = await supabase
      .from('users')
      .insert({
        username,
        email,
        password,
        role: 'user',
        first_name: first_name || null,
        last_name: last_name || null,
        phone_number: phone_number || null,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ message: 'Không thể tạo tài khoản', detail: error.message });
    }

    return res.status(201).json({
      message: 'Đăng ký thành công',
      user: { id: data.id, username: data.username, email: data.email, role: data.role }
    });
  } catch (err) {
    console.error('Register user error:', err);
    return res.status(500).json({ message: err.message || 'Lỗi server' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập email và password' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error || !user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    if (user.role !== 'user') {
      return res.status(403).json({ message: 'Tài khoản không hợp lệ cho người dùng' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ message: 'Tài khoản đã bị khóa' });
    }

    if (password !== user.password) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });
  } catch (err) {
    console.error('Login user error:', err);
    return res.status(500).json({ message: err.message || 'Lỗi server' });
  }
};
