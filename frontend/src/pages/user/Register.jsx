import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../lib/axiosInstance.js';

export default function UserRegister() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone_number: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (form.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    try {
      const payload = { ...form };
      delete payload.confirmPassword;
      await axiosInstance.post('/auth/user/register', payload);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] text-[var(--color-foreground)]">
      <div className="w-full max-w-md p-8 rounded-2xl border border-[var(--color-border)] shadow-sm bg-[var(--color-card)]">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold">Tạo tài khoản</h1>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-1">Tham gia cùng TicketRush ngay hôm nay</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                type="text"
                name="username"
                required
                value={form.username}
                onChange={handleChange}
                className="w-full rounded-lg border border-[var(--color-input)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-ring)] bg-[var(--color-background)]"
                placeholder="user01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-[var(--color-input)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-ring)] bg-[var(--color-background)]"
                placeholder="user@ticketrush.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Họ</label>
              <input
                type="text"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                className="w-full rounded-lg border border-[var(--color-input)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-ring)] bg-[var(--color-background)]"
                placeholder="Nguyễn"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tên</label>
              <input
                type="text"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                className="w-full rounded-lg border border-[var(--color-input)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-ring)] bg-[var(--color-background)]"
                placeholder="Văn A"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Số điện thoại</label>
            <input
              type="tel"
              name="phone_number"
              value={form.phone_number}
              onChange={handleChange}
              className="w-full rounded-lg border border-[var(--color-input)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-ring)] bg-[var(--color-background)]"
              placeholder="0901234567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mật khẩu</label>
            <input
              type="password"
              name="password"
              required
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-lg border border-[var(--color-input)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-ring)] bg-[var(--color-background)]"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Xác nhận mật khẩu</label>
            <input
              type="password"
              name="confirmPassword"
              required
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full rounded-lg border border-[var(--color-input)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-ring)] bg-[var(--color-background)]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-foreground)] px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition"
          >
            {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[var(--color-muted-foreground)]">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-[var(--color-primary)] hover:underline font-medium">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
