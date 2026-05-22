import React from "react";
import useUsers from "../../hooks/adminUserManagement.js";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';


const uiThemeStyles = `

@import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap");

.material-symbols-outlined {
  font-family: "Material Symbols Outlined";
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-feature-settings: "liga";
  -webkit-font-smoothing: antialiased;
  font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
}

.concert-grid {
  background-image: radial-gradient(#e1e3e4 1px, transparent 1px);
  background-size: 24px 24px;
}

.chart-bar {
  transition: height 1s ease-out;
}

.font-body-md,
.font-h1,
.font-button,
.font-label-sm {
  font-family: "Inter", sans-serif;
}

.text-h1 {
  font-size: 24px;
  line-height: 32px;
  letter-spacing: -0.02em;
  font-weight: 700;
}

.text-button {
  font-size: 16px;
  line-height: 24px;
  letter-spacing: 0.01em;
  font-weight: 600;
}

.text-body-md {
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
}

.text-label-sm {
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
}

.py-unit {
  padding-top: 4px;
  padding-bottom: 4px;
}

.px-container-padding {
  padding-left: 40px;
  padding-right: 40px;
}

.py-input-padding-y {
  padding-top: 12px;
  padding-bottom: 12px;
}

.gap-grid-gutter {
  gap: 20px;
}

.space-y-grid-gutter > :not([hidden]) ~ :not([hidden]) {
  margin-top: 20px;
}

.space-y-stack-gap > :not([hidden]) ~ :not([hidden]) {
  margin-top: 24px;
}

.bg-surface {
  background-color: #f8f9fa;
}

.bg-background {
  background-color: #f8f9fa;
}

.bg-surface-container-lowest {
  background-color: #ffffff;
}

.bg-surface-container-low {
  background-color: #f3f4f5;
}

.bg-surface-container {
  background-color: #edeeef;
}

.bg-surface-container-high {
  background-color: #e7e8e9;
}

.bg-surface-container-highest {
  background-color: #e1e3e4;
}

.bg-surface-variant {
  background-color: #e1e3e4;
}

.bg-primary {
  background-color: #b30004;
}

.bg-primary-container {
  background-color: #e00d0d;
}

.bg-primary-container\\/10 {
  background-color: rgb(224 13 13 / 0.1);
}

.bg-secondary {
  background-color: #5f5e5e;
}

.bg-outline {
  background-color: #936e69;
}

.bg-outline-variant {
  background-color: #e8bcb6;
}

.bg-error {
  background-color: #ba1a1a;
}

.text-on-surface {
  color: #191c1d;
}

.text-on-background {
  color: #191c1d;
}

.text-primary {
  color: #b30004;
}

.text-primary-container {
  color: #e00d0d;
}

.text-on-primary {
  color: #ffffff;
}

.text-on-primary-container {
  color: #fff2f0;
}

.text-secondary {
  color: #5f5e5e;
}

.text-outline {
  color: #936e69;
}

.text-error {
  color: #ba1a1a;
}

.border-outline-variant {
  border-color: #e8bcb6;
}

.border-outline {
  border-color: #936e69;
}

.border-primary {
  border-color: #b30004;
}

.border-primary-container {
  border-color: #e00d0d;
}

.hover\\:text-primary:hover {
  color: #b30004;
}

.hover\\:text-error:hover {
  color: #ba1a1a;
}

.hover\\:bg-primary-container:hover {
  background-color: #e00d0d;
}

.hover\\:bg-surface-container:hover {
  background-color: #edeeef;
}

.hover\\:bg-surface-container-low:hover {
  background-color: #f3f4f5;
}

.hover\\:bg-surface-container-high:hover {
  background-color: #e7e8e9;
}

.hover\\:bg-surface-variant\\/50:hover {
  background-color: rgb(225 227 228 / 0.5);
}

.focus\\:ring-primary\\/20:focus {
  --tw-ring-color: rgb(179 0 4 / 0.2);
}

.dark .dark\\:bg-inverse-surface {
  background-color: #2e3132;
}

.dark .dark\\:text-inverse-primary {
  color: #ffb4a9;
}

.dark .dark\\:text-secondary-fixed-dim {
  color: #c8c6c5;
}

.dark .dark\\:border-inverse-primary {
  border-color: #ffb4a9;
}

.dark .dark\\:border-outline {
  border-color: #936e69;
}

.dark .dark\\:hover\\:text-inverse-primary:hover {
  color: #ffb4a9;
}

.dark .dark\\:hover\\:bg-on-surface-variant\\/20:hover {
  background-color: rgb(94 63 58 / 0.2);
}

.dark .dark\\:hover\\:bg-on-surface-variant\\/30:hover {
  background-color: rgb(94 63 58 / 0.3);
}
`;

const navItems = [
  { icon: "dashboard", label: "Dashboard" },
  { icon: "event", label: "Events" },
  { icon: "shopping_cart", label: "Orders" },
  { icon: "group", label: "Customers", active: true },
  { icon: "monitoring", label: "Analytics" },
];
/*
const users = [
  {
    name: "Nguyễn Văn An",
    email: "an.nv@gmail.com",
    age: 24,
    gender: "Nam",
    joined: "12/03/2024",
    status: "Hoạt động",
    statusClass: "bg-green-100 text-green-800",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB7981hTioCN_257vMvcEon4g-q4PDlXtT9EnolzwudQNRWJTW4P-i_t1EPhtXS_WWI7i0VO7xO1DGAoeqxG5pmadxyEDiJqPAY4yVUsvpBLbR849WivQbJ3heIhKm1lNvdvYJ-bo7QHna5-MZjKRHqEn6C9UYhOMap7nTCEAUeswdjkgv_zYPudhu84VYPxjyVf1KncyPLxG5nNYLuNthFq3R5_JI8FkNyTZtlt5GgaSvYpiHsKUXmu0t9WZR78qg0VS_p6kxTwmc",
  },
  {
    name: "Trần Thị Bảo",
    email: "bao.tt@outlook.com",
    age: 31,
    gender: "Nữ",
    joined: "08/02/2024",
    status: "Đã khóa",
    statusClass: "bg-red-100 text-red-800",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDuSx1KTR5ctQOB3fyimmlfCayRJoJiXSixNGtSazsBjrtQghVwtWzc_7c0bA9kzN_iH0XKIfPmD_vGkZdUnCHaRPM2LA6zwY3fu0nbc2P3wby4B6fz9HaveiSUG7637KwjjIbEW7NaBd5oqXZYmDIuMxogblCKn2npCkcIUv87gJXkhLnn5D9Wt-OOrzit3rL4IvAqMGAXXZuylwdBy1qikmKULc7WA1h2AI6QXOssmfsMvKQr7m1vYzN2ry6LTIltvxsigIf5XO0",
  },
  {
    name: "Lê Minh Cường",
    email: "cuong.lm@ticketrush.vn",
    age: 19,
    gender: "Nam",
    joined: "15/05/2024",
    status: "Hoạt động",
    statusClass: "bg-green-100 text-green-800",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD_Xb5M1_xXfI795AXhX8e9F93iaQ83o1wKlPku9r7sL7tHbixDjElVi9Kc2mI9419RAHXMFAav0rUXems4fRGRFAsZsM1pkiK5yyYwQFKlBMmyPHMEhUYeS78IlCd-SB3MsYcrm-wIOd2K-R82l-32lF6k3mWD3OjZYUcJ0xNTSIqulXGEWTm1IXfSOMY1EWQ_gXxMC1-NQ3BVkxBAw8dcdFk6zCSI--tDxdm_epGM6jm3rUW2ixlENi5potd3Ft68s53gXMtCJ5A",
  },
  {
    name: "Phạm Quỳnh Dung",
    email: "dungpq@gmail.com",
    age: 27,
    gender: "Nữ",
    joined: "22/01/2024",
    status: "Hoạt động",
    statusClass: "bg-green-100 text-green-800",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAVFCi-W9ktb6HMwGadibhK3uRphC0yFUBrU8m6xdlm4MoNmmp9Un-pDv7RipHOjj0_BlBLQcB8fGVnkyRey_M9auYry-vTYAmrvfjGaDDZC5WQEGUEsxxkDA3JAI-Tq4ULRH3PLX35-_3ObI34uONGhZDAULinm866LQZTp9UGZ_OLayezfXknSgdq_qx410bDJR0FEVHTuc7j-nKmlbtZeTJq7BJ3kpNUTYdoi2-fsK4iCHmQVG3Qg-pPScmPkMHVcvcDfnBdkSI",
  },
];
*/

const ageBars = [
  { label: "<18", height: "30%", className: "bg-outline-variant" },
  { label: "18-24", height: "85%", className: "bg-primary" },
  { label: "25-34", height: "70%", className: "bg-primary" },
  { label: "35-44", height: "45%", className: "bg-secondary" },
  { label: "45+", height: "20%", className: "bg-outline" },
];



function CustomersPage() {
  const navigate = useNavigate();
  const {
    users,
    stats,
    keyword,
    gender,
    status,
    page,
    pagination,
    loading,
    error,
    setPage,
    handleSearchChange,
    handleGenderChange,
    handleStatusChange,
    handleCreateUser,
    handleUpdateUserStatus,
    handleDeleteUser,
  } = useUsers();

  const total = stats?.totalUsers || 1; // tránh chia cho 0
  const malePercent = stats?.genderStats?.Nam || 0;
  const femalePercent = stats?.genderStats?.Nữ || 0;
  const otherPercent = stats?.genderStats?.Khác || 0;

  const genderData = React.useMemo(() => [
    { name: 'Nam', value: malePercent },
    { name: 'Nữ', value: femalePercent },
    { name: 'Khác', value: otherPercent },
  ], [malePercent, femalePercent, otherPercent]);

  // Bật animation ban đầu, sau khi dữ liệu vào và hiệu ứng chạy xong thì tắt đi để tránh lỗi rung nhãn
  const [isChartAnimated, setIsChartAnimated] = React.useState(true);
  React.useEffect(() => {
    if (stats && stats.totalUsers > 0) {
      const timer = setTimeout(() => {
        setIsChartAnimated(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [stats?.totalUsers]);

  const COLORS = ['#b30004', '#5f5e5e', '#936e69'];

  return (
    <div className="bg-surface font-body-md text-on-surface concert-grid min-h-screen flex overflow-hidden">
      <style>{uiThemeStyles}</style>
      {/*
      <aside className="flex flex-col h-full py-unit bg-surface-container-lowest dark:bg-inverse-surface h-screen w-64 border-r border-outline-variant shadow-sm dark:shadow-none z-50 shrink-0">
        <div className="px-6 py-8">
          <h1 className="text-h1 font-h1 text-primary dark:text-inverse-primary uppercase tracking-tighter">
            Admin Panel
          </h1>
          <p className="font-label-sm text-label-sm text-secondary">
            Event Ticketing System
          </p>
        </div>

        <nav className="flex-1 px-2 space-y-1">
          {navItems.map((item) => (
            <a
              key={item.label}
              href="#"
              className={
                item.active
                  ? "flex items-center px-4 py-3 text-primary dark:text-inverse-primary font-bold border-r-4 border-primary dark:border-inverse-primary bg-primary-container/10 rounded-lg scale-[0.98] transition-transform duration-150"
                  : "flex items-center px-4 py-3 text-secondary dark:text-secondary-fixed-dim hover:text-primary dark:hover:text-inverse-primary transition-colors hover:bg-surface-variant/50 dark:hover:bg-on-surface-variant/20 rounded-lg group"
              }
            >
              <span
                className="material-symbols-outlined mr-3"
                data-icon={item.icon}
              >
                {item.icon}
              </span>
              <span className="font-label-sm text-label-sm">{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-outline-variant">
          <div className="flex items-center gap-3">
            <img
              alt="Admin User Profile"
              className="w-10 h-10 rounded-full border border-outline"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRdJAJJ_4Awi-qvu77pQeJBBsgRe-aS4ve-qOnJqH1EHVU_wT_CH_LhMnPpgatwjKzZJvBYoYdjnUuu61nCGyt1Uos9367LD4U7YjtX-UW0pL6p-TLcmSjXyyq3sBSLpojmCC6llTgKmOf6pMxYhbzT4bHv254IWrYie0HhoFksL7BXsigjobnVNJ329pV-NF1UQwUE-0-rihgM419yCtqW15hg26oSsnpWhV9oEiDMky3YRwYmQA9-H59MLIBMM0BkC4LIkQ68eg"
            />
            <div className="overflow-hidden">
              <p className="font-label-sm text-label-sm font-bold truncate">
                Admin TicketRush
              </p>
              <p className="text-[10px] text-secondary truncate">
                admin@ticketrush.vn
              </p>
            </div>
          </div>
        </div>
      </aside>
*/}
      {/* SideNavBar mới */}
      <aside className="h-screen w-64 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 fixed left-0 top-0 z-50 flex flex-col py-6 space-y-2">
        <div className="px-6 mb-8">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Cổng Quản Trị</h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-1">TicketRush HQ</p>
        </div>

        <nav className="flex-1 space-y-1">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="flex items-center w-full px-6 py-3 space-x-3 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all active:translate-x-1 duration-200 font-sans font-medium text-sm text-left"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span>Bảng điều khiển</span>
          </button>

          <button
            onClick={() => navigate("/admin/events")}
            className="flex items-center w-full px-6 py-3 space-x-3 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all active:translate-x-1 duration-200 font-sans font-medium text-sm text-left"
          >
            <span className="material-symbols-outlined">calendar_today</span>
            <span>Sự kiện</span>
          </button>

          <button
            onClick={() => navigate("/admin/usermanagement")}
            className="flex items-center w-full px-6 py-3 space-x-3 bg-red-50 text-red-600 border-l-4 border-red-600 active:translate-x-1 duration-200 font-sans font-medium text-sm text-left"
          >
            <span className="material-symbols-outlined">group</span>
            <span>Người dùng</span>
          </button>

          <button
            onClick={() => navigate("/admin/revenue")}
            className="flex items-center w-full px-6 py-3 space-x-3 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all active:translate-x-1 duration-200 font-sans font-medium text-sm text-left"
          >
            <span className="material-symbols-outlined">analytics</span>
            <span>Doanh thu</span>
          </button>

          <button
            onClick={() => navigate("/admin/discount")}
            className="flex items-center px-6 py-3 space-x-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-100 transition-all active:translate-x-1 duration-200 font-sans font-medium text-sm w-full text-left"
          >
            <span className="material-symbols-outlined">confirmation_number</span>
            <span>Mã giảm giá</span>
            </button>

          <button
            onClick={() => navigate("/admin/instruction")}
            className="flex items-center px-6 py-3 space-x-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-100 transition-all active:translate-x-1 duration-200 font-sans font-medium text-sm w-full text-left"
          >
            <span className="material-symbols-outlined">help</span>
            <span>Hỗ trợ & Liên hệ</span>
          </button>
        </nav>

        <div className="px-6 pt-6 border-t border-gray-200 space-y-1">
          <button
            onClick={() => navigate("/")}
            className="flex items-center w-full py-2 space-x-3 text-gray-600 hover:text-gray-900 transition-all font-sans font-medium text-sm text-left"
          >
            <span className="material-symbols-outlined">logout</span>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/*<div className="flex-1 flex flex-col min-w-0 overflow-hidden">*/}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden ml-64">
        <header className="bg-surface-container-lowest dark:bg-inverse-surface border-b border-outline-variant dark:border-outline shadow-sm dark:shadow-none z-40">
          <div className="flex justify-between items-center px-container-padding py-input-padding-y w-full">
            <div className="flex items-center gap-4">
              <h2 className="text-h1 font-h1 text-primary dark:text-inverse-primary">
                Quản lý người dùng
              </h2>
            </div>

            <div className="flex items-center gap-6">
              <div className="relative hidden lg:block">
                <span
                  className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
                  data-icon="search"
                >
                  search
                </span>
              </div>

              <div className="flex items-center gap-4">
                <button className="p-2 text-secondary hover:bg-surface-container-high dark:hover:bg-on-surface-variant/30 rounded-full transition-all">
                  <span
                    className="material-symbols-outlined"
                    data-icon="notifications"
                  >
                    notifications
                  </span>
                </button>

                <button className="p-2 text-secondary hover:bg-surface-container-high dark:hover:bg-on-surface-variant/30 rounded-full transition-all">
                  <span
                    className="material-symbols-outlined"
                    data-icon="settings"
                  >
                    settings
                  </span>
                </button>

                <div className="w-px h-6 bg-outline-variant"></div>

                <img
                  alt="Administrator Profile"
                  className="w-8 h-8 rounded-full"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBI4L469l41S96xmgUHO9nKcD6KjsjoY_CVrTYLhYJc2VbE_zW5HxkzmSHwIqlfM0KnEC-WL19TO9x8R9fX7DtyME_y5-8NbOLI0cLEZgatjSDfTB-PGQZHwDd-4U8ZPWilCGvdIHAvJQF51sUbFjEmPkKA55lVy0Rfz9PAzztd_7raBTqPbD3wEqqgDyb_VLrdTFN-bio2dOA5RPCapydLuVMsmSNR5t0_u-jS8bZqm99huUUyrRAWdmMK0fPkBAWoHA1ihXEDUyg"
                />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-container-padding space-y-stack-gap">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-grid-gutter">
            <div className="lg:col-span-1 space-y-grid-gutter">
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col gap-2">
                <div className="flex justify-between items-start text-secondary">
                  <span className="font-label-sm text-label-sm">
                    Tổng người dùng
                  </span>
                  <span className="material-symbols-outlined" data-icon="groups">
                    groups
                  </span>
                </div>
                <p className="text-h1 font-h1">{(stats?.totalUsers || 0).toLocaleString("vi-VN")}</p>
                <p className="text-[12px] text-green-600 flex items-center font-bold">
                  <span
                    className="material-symbols-outlined text-sm mr-1"
                    data-icon="trending_up"
                  >
                    trending_up
                  </span>
                  +14.2% tháng này
                </p>
              </div>

              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col gap-2">
                <div className="flex justify-between items-start text-secondary">
                  <span className="font-label-sm text-label-sm">
                    Người dùng mới
                  </span>
                  <span
                    className="material-symbols-outlined"
                    data-icon="person_add"
                  >
                    person_add
                  </span>
                </div>
                <p className="text-h1 font-h1">{(stats?.newUsers || 0).toLocaleString("vi-VN")}</p>
                <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="bg-primary h-full w-[75%]"></div>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col gap-2">
                <div className="flex justify-between items-start text-secondary">
                  <span className="font-label-sm text-label-sm">
                    Tỷ lệ hoạt động
                  </span>
                  <span className="material-symbols-outlined" data-icon="bolt">
                    bolt
                  </span>
                </div>
                <p className="text-h1 font-h1">{stats?.activeRate || 0}%</p>
                <p className="text-[12px] text-secondary">
                  Trung bình 4k users/ngày
                </p>
              </div>
            </div>

            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-grid-gutter">
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
                <h3 className="font-label-sm text-label-sm text-secondary mb-6 flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-sm"
                    data-icon="pie_chart"
                  >
                    pie_chart
                  </span>
                  Tỷ lệ Giới tính
                </h3>
                {/*
                <div className="flex items-center justify-center gap-12 py-4">
                  <div className="relative w-32 h-32 rounded-full border-[12px] border-surface-container flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-[12px] border-primary border-r-transparent border-b-transparent rotate-45"></div>
                    <span className="font-h1 text-h1">{malePercent}%</span>
                  </div>

                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full bg-primary"></span>
                      <span className="font-label-sm text-label-sm">
                        Nam ({malePercent}%)
                      </span>
                    </li>

                    <li className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full bg-secondary"></span>
                      <span className="font-label-sm text-label-sm">
                        Nữ ({femalePercent}%)
                      </span>
                    </li>

                    <li className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full bg-outline"></span>
                      <span className="font-label-sm text-label-sm">
                        Khác ({otherPercent}%)
                      </span>
                    </li>
                  </ul>
                </div>
                */}
                <div className="flex flex-col items-center py-4">
                  <PieChart width={450} height={400}>
                    <Pie
                      data={genderData}
                      dataKey="value"
                      nameKey="name"
                      isAnimationActive={isChartAnimated}
                      cx="50%"
                      cy="50%"
                      outerRadius={125}  // tăng bán kính để đẹp hơn
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} // hiển thị nhãn trực tiếp trên phần tròn
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} người (${((value / total) * 100).toFixed(1)}%)`, name]} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
                <h3 className="font-label-sm text-label-sm text-secondary mb-6 flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-sm"
                    data-icon="bar_chart"
                  >
                    bar_chart
                  </span>
                  Phân bổ Độ tuổi
                </h3>

                <div className="flex items-end justify-between h-32 gap-2 mt-4 px-2">
                  {ageBars.map((bar) => (
                    <div
                      key={bar.label}
                      className="group relative flex flex-col items-center flex-1"
                    >
                      <div
                        className={`${bar.className} w-full rounded-t-sm chart-bar`}
                        style={{ height: bar.height }}
                      ></div>
                      <span className="text-[10px] text-secondary mt-2">
                        {bar.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="text-h1 font-h1">Danh sách người dùng</h3>

              <div className="flex flex-wrap items-center gap-3">
                <input
                  className="pl-10 pr-4 py-2 bg-surface-container border border-outline-variant rounded-full text-label-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
                  placeholder="Tìm kiếm người dùng..."
                  type="text"
                  value={keyword}
                  onChange={(event) => handleSearchChange(event.target.value)}
                />
                <select
                  className="bg-surface-container border border-outline-variant rounded-lg px-4 py-2 text-label-sm focus:ring-2 focus:ring-primary/20"
                  value={gender}
                  onChange={(event) => handleGenderChange(event.target.value)}
                >
                  <option value="Tất cả">Giới tính: Tất cả</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>

                <select
                  className="bg-surface-container border border-outline-variant rounded-lg px-4 py-2 text-label-sm focus:ring-2 focus:ring-primary/20"
                  value={status}
                  onChange={(event) => handleStatusChange(event.target.value)}
                >
                  <option value="Tất cả">Trạng thái: Tất cả</option>
                  <option value="Hoạt động">Hoạt động</option>
                  <option value="Đã khóa">Đã khóa</option>
                </select>

                <button className="bg-primary text-on-primary px-6 py-2 rounded-lg font-button text-button hover:bg-primary-container transition-all flex items-center gap-2 shadow-sm active:scale-[0.98]"
                  onClick={async () => {
                    const username = window.prompt("Nhập username:");
                    if (!username) return;

                    const email = window.prompt("Nhập email:");
                    if (!email) return;

                    const password = window.prompt("Nhập mật khẩu:");
                    if (!password) return;

                    const firstName = window.prompt("Nhập tên:", "");
                    const lastName = window.prompt("Nhập họ:", "");
                    const phoneNumber = window.prompt("Nhập số điện thoại:", "");

                    const genderInput = window.prompt(
                      "Nhập giới tính: Nam, Nữ hoặc Khác",
                      "Khác"
                    );

                    const roleInput = window.prompt("Nhập vai trò: user hoặc admin", "user");

                    const gender = ["Nam", "Nữ", "Khác"].includes(genderInput)
                      ? genderInput
                      : "Khác";

                    const role = roleInput === "admin" ? "admin" : "user";

                    try {
                      await handleCreateUser({
                        username,
                        email,
                        password,
                        firstName,
                        lastName,
                        phoneNumber,
                        gender,
                        role,
                        status: "Hoạt động",
                      });
                    } catch (err) {
                      alert(err.message);
                    }
                  }}
                >
                  <span
                    className="material-symbols-outlined text-sm"
                    data-icon="add"
                  >
                    add
                  </span>
                  Thêm người dùng
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low text-secondary font-label-sm text-label-sm">
                  <tr>
                    <th className="px-6 py-4 border-b border-outline-variant">
                      Họ tên
                    </th>
                    <th className="px-6 py-4 border-b border-outline-variant">
                      Email
                    </th>
                    <th className="px-6 py-4 border-b border-outline-variant">
                      Độ tuổi
                    </th>
                    <th className="px-6 py-4 border-b border-outline-variant">
                      Giới tính
                    </th>
                    <th className="px-6 py-4 border-b border-outline-variant">
                      Ngày tham gia
                    </th>
                    <th className="px-6 py-4 border-b border-outline-variant">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 border-b border-outline-variant text-right">
                      Thao tác
                    </th>
                  </tr>
                </thead>

                <tbody className="text-body-md divide-y divide-outline-variant">
                  {users.map((user) => (
                    <tr
                      key={user.id || user.email}
                      className="hover:bg-surface-container-low transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            alt={user.name || user.username || "User"}
                            className="w-8 h-8 rounded-full"
                            src={user.avatar || `https://ui-avatars.com/api/?name=${user.name || user.username || "User"}`}
                          />
                          <span className="font-bold">{user.name || user.username || "Không có tên"}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-secondary">{user.email}</td>
                      <td className="px-6 py-4">{user.age}</td>
                      <td className="px-6 py-4">{user.gender}</td>
                      <td className="px-6 py-4 text-secondary">
                        {user.joined}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.statusClass || (user.status === 'Hoạt động' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')
                            }`}
                        >
                          {user.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          className="text-secondary hover:text-primary p-1"
                          onClick={() => {
                            const newStatus = user.status === "Hoạt động" ? "Đã khóa" : "Hoạt động";
                            handleUpdateUserStatus(user.id, newStatus).catch(err => alert(err.message));
                          }}
                          title={`Chuyển trạng thái sang ${user.status === "Hoạt động" ? "Đã khóa" : "Hoạt động"}`}
                        >
                          <span
                            className="material-symbols-outlined"
                            data-icon="edit"
                          >
                            edit
                          </span>
                        </button>

                        <button
                          className="text-secondary hover:text-error p-1 ml-2"
                          onClick={() => {
                            if (window.confirm("Bạn có chắc chắn muốn xoá người dùng này?")) {
                              handleDeleteUser(user.id).catch(err => alert(err.message));
                            }
                          }}
                          title="Xoá người dùng"
                        >
                          <span
                            className="material-symbols-outlined"
                            data-icon="delete"
                          >
                            delete
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 border-t border-outline-variant flex items-center justify-between">
              <span className="text-label-sm text-secondary">
                Hiển thị {users.length} trên {pagination?.total || 0} người dùng
              </span>

              <div className="flex gap-2">
                <button
                  className="p-2 border border-outline-variant rounded hover:bg-surface-container transition-colors disabled:opacity-50"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <span
                    className="material-symbols-outlined"
                    data-icon="chevron_left"
                  >
                    chevron_left
                  </span>
                </button>

                {Array.from({ length: pagination?.totalPages || 1 }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${page === pageNum
                      ? "bg-primary text-on-primary font-bold"
                      : "hover:bg-surface-container"
                      }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  className="p-2 border border-outline-variant rounded hover:bg-surface-container transition-colors disabled:opacity-50"
                  disabled={page >= (pagination?.totalPages || 1)}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <span
                    className="material-symbols-outlined"
                    data-icon="chevron_right"
                  >
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <button className="fixed bottom-8 right-8 w-14 h-14 bg-primary-container text-on-primary-container rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-50">
        <span
          className="material-symbols-outlined text-3xl"
          data-icon="person_add"
        >
          person_add
        </span>
      </button>
    </div>
  );
}

export default CustomersPage;