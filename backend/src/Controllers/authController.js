import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabaseClient.js';
import { generateVerificationToken, hashVerificationToken, sendVerificationEmail, sendWelcomeEmail } from '../services/emailService.js';

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

    // Tạo token xác thực
    const { token, expiresAt } = generateVerificationToken();
    const tokenHash = hashVerificationToken(token);

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
        status: 'pending',
        email_verified: false,
        verification_token_hash: tokenHash,
        verification_token_expires: expiresAt.toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ message: 'Không thể tạo tài khoản', detail: error.message });
    }

    // Gửi email xác thực (try-catch riêng)
    let emailSent = true;
    let emailError = null;
    try {
      await sendVerificationEmail(email, token);
    } catch (mailErr) {
      emailSent = false;
      emailError = mailErr.message;
      console.error('Email send error:', mailErr);
    }

    const response = {
      message: emailSent 
        ? 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.'
        : 'Đăng ký thành công nhưng không thể gửi email xác thực. Vui lòng nhấn "Gửi lại mã" ở trang đăng nhập.',
      user: { id: data.id, username: data.username, email: data.email, role: data.role },
      emailSent,
      requiresEmailVerification: true
    };

    if (!emailSent) {
      response.emailError = emailError;
    }

    return res.status(201).json(response);
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

    // Kiểm tra email đã xác thực chưa
    if (!user.email_verified) {
      return res.status(403).json({
        message: 'Tài khoản của bạn chưa được xác thực. Vui lòng kiểm tra email để xác thực.',
        requiresEmailVerification: true,
        email: user.email
      });
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

/**
 * Xác thực email
 */
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Token không hợp lệ' });
    }

    // Hash token từ query
    const tokenHash = hashVerificationToken(token);

    // Tìm user với token hash (dùng maybeSingle để tránh exception)
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('verification_token_hash', tokenHash)
      .maybeSingle();

    if (error || !user) {
      return res.status(404).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    // Kiểm tra token hết hạn
    if (new Date(user.verification_token_expires) < new Date()) {
      return res.status(410).json({
        message: 'Token đã hết hạn. Vui lòng yêu cầu gửi lại mã xác thực.',
        tokenExpired: true,
        email: user.email
      });
    }

    // Cập nhật user: xác thực email, xóa token
    const { error: updateError } = await supabase
      .from('users')
      .update({
        email_verified: true,
        verification_token_hash: null,
        verification_token_expires: null,
        status: 'active'
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Update user error:', updateError);
      return res.status(500).json({ message: 'Không thể cập nhật tài khoản' });
    }

    // Gửi email chào mừng (không block nếu lỗi)
    try {
      await sendWelcomeEmail(user.email, user.username);
    } catch (mailErr) {
      console.error('Welcome email send error:', mailErr);
      // Không throw, vì welcome email không bắt buộc
    }

    return res.status(200).json({
      message: 'Xác thực email thành công! Bạn có thể đăng nhập ngay.',
      verified: true,
      email: user.email
    });
  } catch (err) {
    console.error('Verify email error:', err);
    return res.status(500).json({ message: err.message || 'Lỗi server' });
  }
};

/**
 * Gửi lại email xác thực
 */
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Vui lòng cung cấp email' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error || !user) {
      return res.status(404).json({ message: 'Email không tồn tại trong hệ thống' });
    }

    // Nếu đã xác thực rồi
    if (user.email_verified) {
      return res.status(400).json({ message: 'Email này đã được xác thực rồi' });
    }

    // Tạo token mới
    const { token, expiresAt } = generateVerificationToken();
    const tokenHash = hashVerificationToken(token);

    // Cập nhật token
    const { error: updateError } = await supabase
      .from('users')
      .update({
        verification_token_hash: tokenHash,
        verification_token_expires: expiresAt.toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Update token error:', updateError);
      return res.status(500).json({ message: 'Không thể cập nhật token' });
    }

    // Gửi email
    let emailSent = true;
    try {
      await sendVerificationEmail(email, token);
    } catch (mailErr) {
      emailSent = false;
      console.error('Resend email error:', mailErr);
    }

    if (!emailSent) {
      return res.status(500).json({
        message: 'Không thể gửi email. Vui lòng thử lại sau.',
        emailError: true
      });
    }

    return res.status(200).json({
      message: 'Email xác thực đã được gửi. Vui lòng kiểm tra email của bạn.',
      emailSent: true
    });
  } catch (err) {
    console.error('Resend verification error:', err);
    return res.status(500).json({ message: err.message || 'Lỗi server' });
  }
};
