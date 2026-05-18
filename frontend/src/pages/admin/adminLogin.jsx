import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function TicketRushAdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/admin/login/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      localStorage.setItem("token", data.token);
      localStorage.setItem("admin_id", String(data.admin.id));
      localStorage.setItem("admin_username", data.admin.username);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen flex flex-col font-['Inter'] text-[16px] leading-[24px] text-[#191c1d] relative overflow-hidden">
      {/* Abstract Background Pattern */}
      <div
        className="absolute inset-0 z-0 opacity-50 pointer-events-none"
        style={{
          backgroundSize: '40px 40px',
          backgroundImage: 'linear-gradient(to right, rgba(225, 227, 228, 0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(225, 227, 228, 0.5) 1px, transparent 1px)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#f8f9fa]/80 to-[#f8f9fa] z-0 pointer-events-none" />

      {/* Main Content Canvas */}
      <main className="flex-grow flex items-center justify-center relative z-10 px-4 py-12">
        {/* Login Card */}
        <div className="relative w-full max-w-[440px]" id="login-card-wrapper">
          <Link
            to="/"
            aria-label="Quay lại trang chủ"
            className="absolute -left-12 top-0 flex items-center justify-center w-10 h-10 rounded-full bg-[#ffffff] border border-[#e1e3e4] text-[#b30004] hover:bg-[#e00d0d] hover:text-[#ffffff] transition-all shadow-sm z-20"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>

          <div className="bg-[#ffffff] w-full rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] border border-[#e1e3e4] p-[40px] flex flex-col items-center">
            {/* Logo & Brand */}
            <div className="mb-8 text-center flex flex-col items-center gap-2">
              <div className="text-[#b30004] text-3xl font-black tracking-tighter">
                TicketRush
              </div>
              <span className="bg-[#e1e3e4] text-[#191c1d] px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                Admin
              </span>
            </div>

            {/* Header */}
            <div className="w-full mb-[24px] text-center">
              <h1 className="font-['Inter'] font-bold text-[24px] leading-[32px] tracking-[-0.02em] text-[#191c1d] mb-2">
                Cổng Quản Trị
              </h1>
              <p className="font-['Inter'] font-normal text-[16px] leading-[24px] text-[#5e3f3a]">
                Đăng nhập để quản lý sự kiện và vé.
              </p>
            </div>

            {/* Form */}
            <form className="w-full flex flex-col gap-[24px]" onSubmit={handleLogin}>
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  {error}
                </div>
              )}
              {/* Email/Username Field */}
              <div className="flex flex-col gap-2">
                <label
                  className="font-['Inter'] font-semibold text-[14px] leading-[20px] text-[#191c1d]"
                  htmlFor="email"
                >
                  Email hoặc Tên đăng nhập
                </label>
                <div className="relative flex items-center">
                  <span
                    aria-hidden="true"
                    className="material-symbols-outlined absolute left-[16px] text-[#5e3f3a] text-[20px]"
                  >
                    mail
                  </span>
                  <input
                    className="w-full bg-[#F1F5F9] border border-[#e1e3e4] rounded-lg py-[12px] pl-[48px] pr-[16px] font-['Inter'] font-normal text-[16px] leading-[24px] text-[#191c1d] focus:outline-none focus:ring-0 focus:border-[#191c1d] focus:border-2 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                    id="email"
                    placeholder="admin@ticketrush.com"
                    required
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-2">
                <label
                  className="font-['Inter'] font-semibold text-[14px] leading-[20px] text-[#191c1d]"
                  htmlFor="password"
                >
                  Mật khẩu
                </label>
                <div className="relative flex items-center">
                  <span
                    aria-hidden="true"
                    className="material-symbols-outlined absolute left-[16px] text-[#5e3f3a] text-[20px]"
                  >
                    lock
                  </span>
                  <input
                    className="w-full bg-[#F1F5F9] border border-[#e1e3e4] rounded-lg py-[12px] pl-[48px] pr-[48px] font-['Inter'] font-normal text-[16px] leading-[24px] text-[#191c1d] focus:outline-none focus:ring-0 focus:border-[#191c1d] focus:border-2 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                    id="password"
                    placeholder="••••••••"
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    className="absolute right-[16px] text-[#5e3f3a] hover:text-[#191c1d] transition-colors flex items-center justify-center focus:outline-none"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span
                      aria-hidden="true"
                      className="material-symbols-outlined text-[20px]"
                    >
                      {showPassword ? "visibility" : "visibility_off"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex items-center justify-end w-full pt-1">
                <a
                  className="font-['Inter'] text-[14px] leading-[20px] font-semibold text-[#191c1d] hover:underline underline-offset-4 decoration-[#e1e3e4] hover:decoration-[#191c1d] transition-all"
                  href="#"
                >
                  Quên mật khẩu?
                </a>
              </div>

              {/* Submit Button */}
              <button
                className="w-full bg-[#e00d0d] text-[#ffffff] font-['Inter'] font-semibold text-[16px] leading-[24px] tracking-[0.01em] py-[14px] rounded-lg hover:bg-[#b30004] transition-all active:scale-[0.98] shadow-[0_2px_8px_rgba(224,13,13,0.25)] flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    Đăng nhập
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer Component */}
      <footer className="w-full py-8 mt-auto bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 shadow-sm relative z-10">
        <div className="flex flex-col md:flex-row justify-center items-center px-8 max-w-7xl mx-auto gap-4">
          <div className="text-xs font-['Inter'] uppercase tracking-widest text-red-700 dark:text-red-500">
            © 2026 TicketRush. Truy cập quản trị an toàn.
          </div>
        </div>
      </footer>
    </div>
  );
}