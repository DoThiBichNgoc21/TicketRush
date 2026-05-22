import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import axiosInstance from '../../lib/axiosInstance.js';

export default function UserRegister() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    gender: '',
    birth_year: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
    setEmailError('');
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
    setError('');
    setEmailError('');
    
    try {
      const payload = { ...form };
      delete payload.confirmPassword;
      const res = await axiosInstance.post('/auth/user/register', payload);
      
      // Lưu email vào sessionStorage để CheckYourEmailPage có thể lấy
      sessionStorage.setItem('pendingVerificationEmail', form.email);
      
      // Nếu email gửi bị lỗi, hiển thị warning nhưng vẫn đi tới check email page
      if (!res.data?.emailSent) {
        setEmailError('Email xác thực không thể gửi được. Vui lòng gửi lại hoặc kiểm tra Email Spam.');
      }
      
      // Navigate tới check email page
      navigate('/check-your-email', { 
        state: { 
          email: form.email,
          emailError: res.data?.emailError
        } 
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      setLoading(true);
      await axiosInstance.post('/auth/resend-verification-email', { email: form.email });
      setEmailError('');
      alert('Email xác thực đã được gửi lại. Vui lòng kiểm tra email của bạn.');
    } catch (err) {
      setEmailError(err.response?.data?.message || 'Không thể gửi lại email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      {/* Back button */}
      <div className="absolute top-4 left-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Center card */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[420px] bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-red-600 tracking-tight">TicketRush</h1>
            <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase bg-gray-200 text-gray-600 rounded">
              USER
            </span>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Create Account</h2>
            <p className="mt-1 text-sm text-gray-500">Join TicketRush to discover amazing events.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
              {error}
            </div>
          )}

          {emailError && (
            <div className="mb-4 p-3 rounded-lg bg-orange-50 text-orange-700 text-sm border border-orange-100 flex gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-2">{emailError}</p>
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={loading}
                  className="text-xs font-semibold underline hover:no-underline disabled:opacity-60"
                >
                  Gửi lại mã xác thực
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username + Email */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Username</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="username"
                    required
                    value={form.username}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2.5 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
                    placeholder="user01"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2.5 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
                    placeholder="user@ticketrush.com"
                  />
                </div>
              </div>
            </div>

            {/* Last Name + First Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
                  placeholder="Nguyen"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
                  placeholder="Van A"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
              <input
                type="tel"
                name="phone_number"
                value={form.phone_number}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
                placeholder="0901234567"
              />
            </div>

            {/* Gender + Birth Year */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Giới tính</label>
                <select
                  name="gender"
                  required
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Năm sinh</label>
                <input
                  type="number"
                  name="birth_year"
                  required
                  min="1900"
                  max={new Date().getFullYear()}
                  value={form.birth_year}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
                  placeholder="2000"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2.5 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2.5 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-md bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60"
            >
              {loading ? 'Creating account...' : (
                <>
                  Register <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Link */}
          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-gray-900 hover:text-red-600 transition">
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center">
        <div className="flex items-center justify-center gap-6 text-[11px] font-medium tracking-wide text-gray-500 uppercase">
          <span>&copy; 2024 TICKETRUSH. ALL RIGHTS RESERVED.</span>
          <Link to="/privacy" className="hover:text-red-600 transition">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-red-600 transition">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}
