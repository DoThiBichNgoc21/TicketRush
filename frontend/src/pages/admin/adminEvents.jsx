import React, { useEffect, useMemo, useState } from "react";
import { getEvents, toggleEventVisibility } from "../../api/eventApi";
import { useNavigate } from "react-router-dom";



const DEFAULT_POSTER =
  "https://lh3.googleusercontent.com/aida/ADBb0uhlZSLkgU6iJn37SxaBjosOiTvtO8LrYU6ZM5zQM8K_ayvjwnZK0pEXWE4KRR-RhFPLy4j-WW-gfpnw0E7iN2m40gk3gb0mNCZbQ_ig1p4_LqoVj3BE1t-G6MwSoB44qkuV9yifO9_bQt-AvepNEhbaZ3n5JFRK44dduNiwWeyzLDc5dTPCJF_tikwFw5-Ors6fBQ7-lRnELfBcAyg9Y-zwMLuUZ5ShC1iVmva-50Wrkjuam98A3RMWT0SFkhKPlrAWfcKLT6nwGA";

const formatDate = (value) => {
  if (!value) return "Chưa có ngày";
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusLabel = (status) => {
  switch (status) {
    case "published":
      return "Đang bán vé";
    case "draft":
      return "Bản nháp";
    case "cancelled":
      return "Đã hủy";
    case "ended":
      return "Đã kết thúc";
    default:
      return status || "Chưa rõ";
  }
};

const getStatusClass = (status) => {
  switch (status) {
    case "published":
      return "bg-green-100 text-green-700";
    case "draft":
      return "bg-amber-100 text-amber-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    case "ended":
      return "bg-zinc-100 text-zinc-600";
    default:
      return "bg-zinc-100 text-zinc-600";
  }
};

const getDotClass = (status) => {
  switch (status) {
    case "published":
      return "bg-green-500";
    case "draft":
      return "bg-amber-500";
    case "cancelled":
      return "bg-red-500";
    case "ended":
      return "bg-zinc-400";
    default:
      return "bg-zinc-400";
  }
};

export default function AdminEvents() {
    const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);

      const result = await getEvents({
        search,
        status: activeStatus,
      });

      setEvents(result.events || []);
    } catch (error) {
      console.error("Lỗi lấy danh sách sự kiện:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStatus]);

  const totalEvents = events.length;

  const publishedEvents = useMemo(
    () => events.filter((event) => event.status === "published").length,
    [events]
  );

  const pendingEvents = useMemo(
    () => events.filter((event) => event.status === "draft").length,
    [events]
  );

  return (
    <div className="bg-background text-on-background font-body-md antialiased overflow-x-hidden">
      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }

        .concert-pattern {
          background-image: radial-gradient(#e5e7eb 0.5px, transparent 0.5px);
          background-size: 20px 20px;
        }
      `}</style>

      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-sm font-['Inter']">
        <div className="flex items-center gap-8">
          <span className="text-xl font-black tracking-tighter text-zinc-900 dark:text-white">
            SeatMaster Admin
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors text-zinc-600">
              <span className="material-symbols-outlined">notifications</span>
            </button>

            <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors text-zinc-600">
              <span className="material-symbols-outlined">help</span>
            </button>

            <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors text-zinc-600">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>

          <div className="h-8 w-px bg-zinc-200 mx-2" />

          <div className="flex items-center gap-3">
            <img
              alt="Admin Avatar"
              className="w-8 h-8 rounded-full border border-zinc-200"
              src="https://lh3.googleusercontent.com/aida/ADBb0ugYexK1ZND4JINj1NbXIBL2RqGA2yHl9XVYCNSx6RzORV0GXWjge_89Vm88tOYo1yeNvJ15W97YmtbvII5vCGNdhCv8gobP-Z0TMAAUEEt20ClX5B9tZQC0zeptx9t6fEX5zvj7pnPNq5esqVxAiWHQIhRf8IpSKLKmLQXtgTSD17mz6tZuaDAfyKE_ObVtGvjeg81FwPaBKd6mL9EF0WffcaldwRdImnepmhmawjhRY4-UD6ylLjW-q1NKRiMebA2DRZ7eFboA"
            />

            <span className="text-sm font-semibold hidden lg:block">
              System Admin
            </span>
          </div>
        </div>
      </header>

      {/* SideNavBar */}
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
            className="flex items-center w-full px-6 py-3 space-x-3 bg-red-50 text-red-600 border-l-4 border-red-600 active:translate-x-1 duration-200 font-sans font-medium text-sm text-left"
            >
            <span className="material-symbols-outlined">calendar_today</span>
            <span>Sự kiện</span>
            </button>

            <button className="flex items-center w-full px-6 py-3 space-x-3 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all active:translate-x-1 duration-200 font-sans font-medium text-sm text-left">
            <span className="material-symbols-outlined">group</span>
            <span>Người dùng</span>
            </button>

            <button className="flex items-center w-full px-6 py-3 space-x-3 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all active:translate-x-1 duration-200 font-sans font-medium text-sm text-left">
            <span className="material-symbols-outlined">confirmation_number</span>
            <span>Vé</span>
            </button>

            <button className="flex items-center w-full px-6 py-3 space-x-3 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all active:translate-x-1 duration-200 font-sans font-medium text-sm text-left">
            <span className="material-symbols-outlined">analytics</span>
            <span>Báo cáo</span>
            </button>
        </nav>

        <div className="px-6 pt-6 border-t border-gray-200 space-y-1">
            <button className="flex items-center w-full py-2 space-x-3 text-gray-600 hover:text-gray-900 transition-all font-sans font-medium text-sm text-left">
            <span className="material-symbols-outlined">help</span>
            <span>Hỗ trợ</span>
            </button>

            <button
            onClick={() => navigate("/")}
            className="flex items-center w-full py-2 space-x-3 text-gray-600 hover:text-gray-900 transition-all font-sans font-medium text-sm text-left"
            >
            <span className="material-symbols-outlined">logout</span>
            <span>Đăng xuất</span>
            </button>
        </div>
        </aside>

      {/* Main Content */}
      <main className="ml-64 mt-16 p-8 concert-pattern min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-black text-zinc-900 tracking-tight">
                Quản lý sự kiện
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/admin/events/create/step-1")}
                className="bg-[#e00d0d] text-white px-6 py-2.5 rounded font-bold flex items-center gap-2 hover:bg-[#b30004] transition-all shadow-md active:scale-95"
                >
                <span className="material-symbols-outlined">add_circle</span>
                Tạo sự kiện mới
                </button>
            </div>
          </div>

          {/* Dashboard Stats Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded">
                  <span className="material-symbols-outlined">
                    calendar_today
                  </span>
                </div>

                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                  +12%
                </span>
              </div>

              <p className="text-zinc-500 text-sm font-medium">Tổng sự kiện</p>
              <h3 className="text-2xl font-black text-zinc-900">
                {totalEvents}
              </h3>
            </div>

            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-red-50 text-[#e00d0d] rounded">
                  <span className="material-symbols-outlined">
                    local_activity
                  </span>
                </div>

                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                  +24%
                </span>
              </div>

              <p className="text-zinc-500 text-sm font-medium">Đang bán vé</p>
              <h3 className="text-2xl font-black text-zinc-900">
                {publishedEvents}
              </h3>
            </div>

            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-green-50 text-green-600 rounded">
                  <span className="material-symbols-outlined">payments</span>
                </div>

                <span className="text-xs font-bold text-zinc-400 bg-zinc-50 px-2 py-1 rounded">
                  Tháng này
                </span>
              </div>

              <p className="text-zinc-500 text-sm font-medium">Doanh thu</p>
              <h3 className="text-2xl font-black text-zinc-900">0 VNĐ</h3>
            </div>
          </div>

          {/* Filter & List Area */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-zinc-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-2 bg-zinc-100 p-1 rounded-lg w-fit">
                <button
                  onClick={() => setActiveStatus("")}
                  className={`px-4 py-2 rounded-md font-bold text-sm ${
                    activeStatus === ""
                      ? "bg-white text-zinc-900 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  Tất cả
                </button>

                <button
                  onClick={() => setActiveStatus("published")}
                  className={`px-4 py-2 rounded-md font-semibold text-sm transition-colors ${
                    activeStatus === "published"
                      ? "bg-white text-zinc-900 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  Đang diễn ra
                </button>

                <button
                  onClick={() => setActiveStatus("draft")}
                  className={`px-4 py-2 rounded-md font-semibold text-sm transition-colors ${
                    activeStatus === "draft"
                      ? "bg-white text-zinc-900 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  Sắp diễn ra
                </button>

                <button
                  onClick={() => setActiveStatus("ended")}
                  className={`px-4 py-2 rounded-md font-semibold text-sm transition-colors ${
                    activeStatus === "ended"
                      ? "bg-white text-zinc-900 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  Đã kết thúc
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                    search
                  </span>

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") fetchEvents();
                    }}
                    className="pl-10 pr-4 py-2.5 border border-zinc-200 rounded-lg text-sm w-80 focus:ring-2 focus:ring-[#e00d0d] transition-all"
                    placeholder="Tìm tên sự kiện, nghệ sĩ..."
                    type="text"
                  />
                </div>

                <button
                  onClick={fetchEvents}
                  className="p-2.5 border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-50 transition-colors"
                >
                  <span className="material-symbols-outlined">filter_list</span>
                </button>
              </div>
            </div>

            {/* Events Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50 text-zinc-500 text-xs font-bold uppercase tracking-wider border-b border-zinc-200">
                    <th className="px-6 py-4">Tên sự kiện</th>
                    <th className="px-6 py-4">Ngày tổ chức</th>
                    <th className="px-6 py-4">Địa điểm</th>
                    <th className="px-6 py-4">Số lượng vé</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4 text-right">Hành động</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-10 text-center text-zinc-500"
                      >
                        Đang tải dữ liệu...
                      </td>
                    </tr>
                  ) : events.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-10 text-center text-zinc-500"
                      >
                        Không có sự kiện nào
                      </td>
                    </tr>
                  ) : (
                    events.map((event) => (
                      <tr
                        key={event.id}
                        className="hover:bg-zinc-50/80 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-16 rounded overflow-hidden flex-shrink-0 border border-zinc-100 shadow-sm">
                              <img
                                alt="Event Poster"
                                className="w-full h-full object-cover"
                                src={event.image_url || DEFAULT_POSTER}
                              />
                            </div>

                            <div>
                              <div className="font-bold text-zinc-900 group-hover:text-[#e00d0d] transition-colors">
                                {event.name}
                              </div>
                              <div className="text-xs text-zinc-500">
                                ID: #EVT-{event.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-zinc-700">
                            {formatDate(event.date)}
                          </div>
                          <div className="text-xs text-zinc-500">--:--</div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-sm text-zinc-700">
                            {event.location}
                          </div>
                          <div className="text-xs text-zinc-500">
                            {event.category || "Chưa phân loại"}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="w-full max-w-[120px]">
                            <div className="flex justify-between text-xs font-bold mb-1">
                              <span>0 / 0</span>
                              <span className="text-[#e00d0d]">0%</span>
                            </div>
                            <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-[#e00d0d] h-full"
                                style={{ width: "0%" }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusClass(
                              event.status
                            )}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${getDotClass(
                                event.status
                              )}`}
                            />
                            {getStatusLabel(event.status)}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={async () => {
                                await toggleEventVisibility(
                                  event.id,
                                  !event.is_visible
                                );
                                fetchEvents();
                              }}
                              className="p-2 hover:bg-zinc-200 rounded text-zinc-500 transition-colors"
                              title={
                                event.is_visible
                                  ? "Ẩn sự kiện"
                                  : "Hiện sự kiện"
                              }
                            >
                              <span className="material-symbols-outlined text-xl">
                                visibility
                              </span>
                            </button>

                            <button className="p-2 hover:bg-zinc-200 rounded text-zinc-500 transition-colors">
                              <span className="material-symbols-outlined text-xl">
                                edit
                              </span>
                            </button>

                            <button className="p-2 hover:bg-red-50 rounded text-red-500 transition-colors">
                              <span className="material-symbols-outlined text-xl">
                                delete
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-6 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
              <p className="text-sm text-zinc-500">
                Hiển thị{" "}
                <span className="font-bold text-zinc-900">
                  {events.length > 0 ? `1-${events.length}` : "0"}
                </span>{" "}
                trong số{" "}
                <span className="font-bold text-zinc-900">
                  {events.length}
                </span>{" "}
                sự kiện
              </p>

              <div className="flex items-center gap-1">
                <button
                  className="p-2 border border-zinc-200 rounded hover:bg-white transition-colors disabled:opacity-50"
                  disabled
                >
                  <span className="material-symbols-outlined">
                    chevron_left
                  </span>
                </button>

                <button className="px-4 py-2 bg-[#e00d0d] text-white rounded font-bold text-sm">
                  1
                </button>

                <button className="p-2 border border-zinc-200 rounded hover:bg-white transition-colors">
                  <span className="material-symbols-outlined">
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Contextual FAB */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-[#e00d0d] text-white rounded-full shadow-2xl flex items-center justify-center lg:hidden hover:scale-110 active:scale-90 transition-transform z-50">
        <span className="material-symbols-outlined">add</span>
      </button>
    </div>
  );
}