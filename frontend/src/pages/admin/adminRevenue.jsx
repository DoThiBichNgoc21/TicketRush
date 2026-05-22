import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const DEFAULT_POSTER =
  "https://lh3.googleusercontent.com/aida/ADBb0uhlZSLkgU6iJn37SxaBjosOiTvtO8LrYU6ZM5zQM8K_ayvjwnZK0pEXWE4KRR-RhFPLy4j-WW-gfpnw0E7iN2m40gk3gb0mNCZbQ_ig1p4_LqoVj3BE1t-G6MwSoB44qkuV9yifO9_bQt-AvepNEhbaZ3n5JFRK44dduNiwWeyzLDc5dTPCJF_tikwFw5-Ors6fBQ7-lRnELfBcAyg9Y-zwMLuUZ5ShC1iVmva-50Wrkjuam98A3RMWT0SFkhKPlrAWfcKLT6nwGA";

const RevenueDashboard = () => {
  const [data, setData] = useState(null);
  const [occupancyPage, setOccupancyPage] = useState(1);
  const OCCUPANCY_PER_PAGE = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/revenue"); // endpoint backend

        //Xem lỗi
        console.log("Revenue API:", res.data);
        console.log("Transactions:", res.data?.transactions);
        console.log("Transactions length:", res.data?.transactions?.length);

        setData(res.data);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu:", err);
      }
    };

    fetchData();

    const liveBadge = document.querySelector(".animate-pulse");
    let status = true;
    const interval1 = setInterval(() => {
      status = !status;
      if (status) {
        liveBadge.style.backgroundColor = "#00FF00";
      } else {
        liveBadge.style.backgroundColor = "#FFD700";
      }
    }, 3000);

    const progressBars = document.querySelectorAll(".progress-bar");
    const interval2 = setInterval(() => {
      progressBars.forEach(bar => {
        const currentWidth = parseFloat(bar.style.width);
        const delta = Math.random() > 0.5 ? 0.1 : -0.1;
        bar.style.width = Math.min(Math.max(currentWidth + delta, 0), 100) + "%";
      });
    }, 2000);

    return () => {
      clearInterval(interval1);
      clearInterval(interval2);
    };
  }, []);

  const occupancyData = [
    //{ title: "Skyline Music Festival 2024", venue: "Sân vận động Quốc gia Mỹ Đình", date: "15/10/2024", percent: 94, status: "Sắp hết vé", color: "#e00d0d" },
    //{ title: "Hội thảo TechVision Global", venue: "Trung tâm Hội nghị Quốc gia", date: "22/10/2024", percent: 62, status: "Đang mở bán", color: "#5f5e5e" },
    //{ title: "Giải Bóng rổ VBA Final", venue: "Nhà thi đấu Thanh Trì", date: "05/11/2024", percent: 45, status: "Mới mở bán", color: "#d8e2ff" },
  ];
  /*
    const transactionsData = [
      { time: "14:22:05", name: "Skyline Festival - VIP", amount: "2.500k₫", status: "Thành công", color: "#00a000" },
      { time: "14:19:40", name: "TechVision - Standard", amount: "850k₫", status: "Thành công", color: "#00a000" },
      { time: "14:18:12", name: "VBA Final - Courtside", amount: "1.200k₫", status: "Thành công", color: "#00a000" },
      { time: "14:15:55", name: "Skyline Festival - Regular", amount: "950k₫", status: "Chờ xử lý", color: "#FFD700" },
      { time: "14:10:02", name: "TechVision - VIP Plus", amount: "3.200k₫", status: "Thành công", color: "#00a000" },
    ];
  */
  const chartHeights = [40, 55, 75, 60, 90, 85, 100];

  //Thêm phần giao dịch gần đây
  const recentTransactions = data?.transactions ?? [];

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#f8f9fa" }}>
      {/* Sidebar Navigation */}
      <aside className="h-screen w-64 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 fixed left-0 top-0 z-50 flex flex-col py-6 space-y-2">
        <div className="px-6 mb-8">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Cổng Quản Trị</h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-1">TicketRush HQ</p>
        </div>
        <nav className="flex-1 space-y-1">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="flex items-center px-6 py-3 space-x-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-100 transition-all active:translate-x-1 duration-200 font-sans font-medium text-sm w-full text-left"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span>Bảng điều khiển</span>
          </button>
          <button
            onClick={() => navigate("/admin/events")}
            className="flex items-center px-6 py-3 space-x-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-100 transition-all active:translate-x-1 duration-200 font-sans font-medium text-sm w-full text-left"
          >
            <span className="material-symbols-outlined">calendar_today</span>
            <span>Sự kiện</span>
          </button>
          <button
            onClick={() => navigate("/admin/usermanagement")}
            className="flex items-center px-6 py-3 space-x-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-100 transition-all active:translate-x-1 duration-200 font-sans font-medium text-sm w-full text-left"
          >
            <span className="material-symbols-outlined" data-icon="group">group</span>
            <span>Người dùng</span>
          </button>
          <button
            onClick={() => navigate("/admin/revenue")}
            className="flex items-center w-full px-6 py-3 space-x-3 bg-red-50 text-red-600 border-l-4 border-red-600 active:translate-x-1 duration-200 font-sans font-medium text-sm text-left">
            <span className="material-symbols-outlined" data-icon="group">analytics</span>
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
        <div className="px-6 pt-6 border-t border-gray-200 dark:border-gray-800 space-y-1">
          <button
            onClick={() => navigate("/")}
            className="flex items-center w-full py-2 space-x-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-all font-sans font-medium text-sm text-left"
          >
            <span className="material-symbols-outlined" data-icon="logout">logout</span>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-6 flex flex-col gap-6">
        {/* Header */}
        <header className="flex justify-between items-center h-16 border-b border-gray-200">
          <h1 className="text-xl font-bold" style={{ color: "#b30004" }}>Quản lý Doanh thu & Tỷ lệ lấp đầy</h1>
          <div className="flex items-center gap-3">
          </div>
        </header>

        {/* KPI Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded shadow border" style={{ backgroundColor: "#ffffff" }}>
            <div className="flex justify-between">
              <p className="text-xs font-bold text-gray-600 uppercase">Tổng doanh thu</p>
              <span className="material-symbols-outlined p-1 rounded" style={{ backgroundColor: "#ffdad5", color: "#b30004" }}>payments</span>
            </div>
            <h3 className="mt-2 font-extrabold text-2xl">{(data?.totalRevenue || 0).toLocaleString()}₫</h3>
            <span className="text-green-600 font-bold text-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">trending_up</span>
            </span>
          </div>

          <div className="p-4 rounded shadow border" style={{ backgroundColor: "#ffffff" }}>
            <div className="flex justify-between">
              <p className="text-xs font-bold text-gray-600 uppercase">Vé đã bán</p>
              <span className="material-symbols-outlined p-1 rounded" style={{ backgroundColor: "#d8e2ff", color: "#0053b7" }}>confirmation_number</span>
            </div>
            {/*            <h3 className="mt-2 font-extrabold text-2xl">15.842 / 20.000</h3>
            <div className="mt-1 w-full bg-gray-200 h-2 rounded">
              <div className="progress-bar" style={{ width: "79%", backgroundColor: "#0053b7", height: "100%" }}></div>
            </div>
*/}
            <h3 className="mt-2 font-extrabold text-2xl">
              {(data?.ticketsSold || 0).toLocaleString()} Vé
            </h3>

            <div className="flex justify-between text-xs text-gray-600 mt-2">
              <span>Dữ liệu thực tế từ hệ thống</span>
            </div>
          </div>
        </section>
        {/* Occupancy & Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-bold text-gray-800">Tỷ lệ sự kiện</h4>
              <span className="text-xs text-gray-500">
                {(() => {
                  const list = data?.occupancy || occupancyData;
                  return `${Math.min((occupancyPage - 1) * OCCUPANCY_PER_PAGE + 1, list.length)}–${Math.min(occupancyPage * OCCUPANCY_PER_PAGE, list.length)} / ${list.length} sự kiện`;
                })()}
              </span>
            </div>

           {(data?.occupancy || occupancyData)
              .slice((occupancyPage - 1) * OCCUPANCY_PER_PAGE, occupancyPage * OCCUPANCY_PER_PAGE)
              .map((e, i) => (
                <div key={i} className="p-4 rounded shadow border flex flex-col gap-2 bg-white">
                  <div className="flex justify-between">
                    <div className="flex gap-3 items-center">
                      <div className="w-12 h-12 overflow-hidden rounded border border-zinc-100 shadow-sm flex-shrink-0">
                        <img
                          src={e.image_url || DEFAULT_POSTER}
                          alt={e.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h5 className="font-bold">{e.title}</h5>
                        <p className="text-xs text-gray-500">{e.venue} • {e.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">{e.sold !== undefined ? e.sold : e.percent} Vé</p>
                      <p className="text-[10px] uppercase font-bold" style={{ color: e.color }}>{e.status}</p>
                    </div>
                  </div>
                </div>
              ))}

            {/* Occupancy Pagination */}
            {(() => {
              const totalPages = Math.ceil((data?.occupancy || occupancyData).length / OCCUPANCY_PER_PAGE);
              if (totalPages <= 1) return null;
              return (
                <div className="flex items-center justify-between pt-2">
                  <button
                
                    onClick={() => setOccupancyPage(p => Math.max(p - 1, 1))}
                    disabled={occupancyPage <= 1}
                    className="px-3 py-1.5 text-xs font-bold border rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>chevron_left</span>
                    Trước
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => setOccupancyPage(p)}
                        className={`w-7 h-7 rounded text-xs font-bold transition-colors ${p === occupancyPage
                          ? "bg-red-600 text-white"
                          : "border hover:bg-gray-50 text-gray-600"
                          }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setOccupancyPage(p => Math.min(p + 1, totalPages))}
                    disabled={occupancyPage >= totalPages}
                    className="px-3 py-1.5 text-xs font-bold border rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    Tiếp
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>chevron_right</span>
                  </button>
                </div>
              );
            })()}
          </div>

          <div className="p-4 rounded shadow border flex flex-col">
            <h4 className="font-bold mb-2">Giao dịch gần đây</h4>
            <div className="flex-1 overflow-y-auto max-h-96">
              <table className="w-full text-left">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="px-2 py-1 text-xs font-bold text-gray-500 uppercase">Thời gian</th>
                    <th className="px-2 py-1 text-xs font-bold text-gray-500 uppercase text-right">Số tiền</th>
                  </tr>
                </thead>
                {/*                <tbody className="divide-y divide-gray-200">
                  {(data?.transactions || transactionsData).map((t, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-2 py-1">
                        <p className="font-bold text-sm">{t.purchase_date || t.time}</p>
                        <p className="text-xs text-gray-500">{t.booking_id || t.name}</p>
                      </td>
                      <td className="px-2 py-1 text-right">
                        <p className="font-bold text-sm" style={{ color: (t.transaction_status || t.status) === "Chờ xử lý" || (t.transaction_status || t.status) === "pending" ? "#000" : "#00a000" }}>
                          {t.amount}₫
                        </p>
                        <span className="text-[9px] px-1 py-0.5 rounded uppercase font-bold" style={{ backgroundColor: t.color || (t.status === "Thành công" ? "#00a000" : "#FFD700") }}>
                          {t.transaction_status || t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
*/}
                {/*Thêm phần giao dịch gần đây */}
                <tbody className="divide-y divide-gray-200">
                  {recentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="2" className="px-2 py-4 text-center text-xs text-gray-500">
                        Chưa có giao dịch nào
                      </td>
                    </tr>
                  ) : (
                    recentTransactions.map((t, i) => (
                      <tr key={t.id || i} className="hover:bg-gray-50">
                        <td className="px-2 py-1">
                          <p className="font-bold text-sm">
                            {t.time || t.purchase_date}
                          </p>

                          <p className="text-xs text-gray-500">
                            {t.name || `Booking #${t.booking_id}`}
                          </p>
                        </td>

                        <td className="px-2 py-1 text-right">
                          <p
                            className="font-bold text-sm"
                            style={{ color: t.color || "#00a000" }}
                          >
                            {t.amountText || `${Number(t.amount || 0).toLocaleString("vi-VN")}₫`}
                          </p>

                          <span
                            className="text-[9px] px-1 py-0.5 rounded uppercase font-bold"
                            style={{
                              backgroundColor: t.color || "#5f5e5e",
                              color: (t.status || t.transaction_status) === "Chờ xử lý" ? "#000" : "#fff",
                            }}
                          >
                            {t.status || t.transaction_status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RevenueDashboard;