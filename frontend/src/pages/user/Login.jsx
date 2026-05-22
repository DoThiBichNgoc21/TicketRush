import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import axiosInstance from '../../lib/axiosInstance.js';

export default function UserLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
    setRequiresVerification(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRequiresVerification(false);
    
    try {
      const res = await axiosInstance.post('/auth/user/login', form);
      localStorage.setItem('user_token', res.data.token);
      localStorage.setItem('user_info', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.requiresEmailVerification) {
        setRequiresVerification(true);
        setError('');
      } else {
        setError(err.response?.data?.message || 'Đăng nhập thất bại');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!form.email) return;
    setResendLoading(true);
    try {
      await axiosInstance.post('/auth/resend-verification-email', { email: form.email });
      alert('Email xác thực đã được gửi lại. Vui lòng kiểm tra email của bạn.');
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể gửi lại email');
    } finally {
      setResendLoading(false);
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
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-[420px] bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-red-600 tracking-tight">TicketRush</h1>
            <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase bg-gray-200 text-gray-600 rounded">
              USER
            </span>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">User Portal</h2>
            <p className="mt-1 text-sm text-gray-500">Sign in to browse events and book tickets.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
              {error}
            </div>
          )}

          {requiresVerification && (
            <div className="mb-4 p-3 rounded-lg bg-blue-50 text-blue-700 text-sm border border-blue-100">
              <div className="flex gap-2 mb-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Email chưa được xác thực</p>
                  <p className="text-xs mt-1">Vui lòng xác thực email của bạn để tiếp tục. Email xác thực đã được gửi tới inbox của bạn.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendLoading || !form.email}
                className="text-xs font-semibold underline hover:no-underline disabled:opacity-60 mt-2"
              >
                {resendLoading ? 'Đang gửi...' : 'Gửi lại mã xác thực'}
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
                  placeholder="user@ticketrush.com"
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

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm font-semibold text-gray-900 hover:text-red-600 transition">
                Forgot Password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-md bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60"
            >
              {loading ? 'Signing in...' : (
                <>
                  Login <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center">
        <div className="flex items-center justify-center gap-6 text-[11px] font-medium tracking-wide text-gray-500 uppercase">
          <span>&copy; 2026 TICKETRUSH. ALL RIGHTS RESERVED.</span>
          <Link to="/privacy" className="hover:text-red-600 transition">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-red-600 transition">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}
