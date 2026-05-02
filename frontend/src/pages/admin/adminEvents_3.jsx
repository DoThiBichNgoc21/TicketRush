import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const DEFAULT_CONFIG = {
  rows: 10,
  cols: 14,
  vipRows: 3,
  standardRows: 7,
  vipPrice: 1000000,
  standardPrice: 500000,
};

const rowName = (index) => String.fromCharCode(65 + index);

function generateCinemaSeats(config) {
  const seats = [];

  for (let rowIndex = 0; rowIndex < config.rows; rowIndex++) {
    const isVip = rowIndex < config.vipRows;
    const section = isVip ? "VIP" : "Standard";
    const seatType = isVip ? "VIP" : "Standard";
    const price = isVip ? config.vipPrice : config.standardPrice;
    const rowLabel = rowName(rowIndex);

    for (let col = 1; col <= config.cols; col++) {
      seats.push({
        section,
        row: rowLabel,
        seat_number: `${rowLabel}${col}`,
        status: "available",
        seat_type: seatType,
        price,
        total_rows: config.rows,
        total_cols: config.cols,
        vip_rows: config.vipRows,
        standard_rows: config.standardRows,
        vip_price: config.vipPrice,
        standard_price: config.standardPrice,
      });
    }
  }

  return seats;
}

function CreateEventStep3() {
  const navigate = useNavigate();

  const savedStep3 =
    JSON.parse(localStorage.getItem("create_event_step_3")) || {};

  const [config, setConfig] = useState(savedStep3.config || DEFAULT_CONFIG);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const showtime_id = localStorage.getItem("draft_showtime_id");
  const event_name = localStorage.getItem("draft_event_name") || "Sự kiện";

  const seats = useMemo(() => generateCinemaSeats(config), [config]);

  const vipSeats = seats.filter((seat) => seat.section === "VIP").length;
  const standardSeats = seats.filter((seat) => seat.section === "Standard").length;

  const saveStep3 = (newConfig = config) => {
    localStorage.setItem(
      "create_event_step_3",
      JSON.stringify({
        config: newConfig,
      })
    );
  };

  const updateConfig = (field, value) => {
    const nextConfig = {
      ...config,
      [field]: Number(value),
    };

    if (field === "rows") {
      const rows = Number(value);
      nextConfig.vipRows = Math.min(nextConfig.vipRows, rows);
      nextConfig.standardRows = Math.max(rows - nextConfig.vipRows, 0);
    }

    if (field === "vipRows") {
      const vipRows = Number(value);
      nextConfig.vipRows = Math.min(vipRows, nextConfig.rows);
      nextConfig.standardRows = Math.max(nextConfig.rows - nextConfig.vipRows, 0);
    }

    if (field === "standardRows") {
      const standardRows = Number(value);
      nextConfig.standardRows = Math.min(standardRows, nextConfig.rows);
      nextConfig.vipRows = Math.max(nextConfig.rows - nextConfig.standardRows, 0);
    }

    setConfig(nextConfig);
    saveStep3(nextConfig);
  };

  const handleBack = () => {
    saveStep3();
    navigate("/admin/events/create/step-2");
  };

  const handleFinish = async () => {
    setError("");

    if (!showtime_id) {
      setError("Không tìm thấy suất diễn. Vui lòng quay lại Bước 2.");
      return;
    }

    if (seats.length === 0) {
      setError("Vui lòng tạo ít nhất một ghế.");
      return;
    }

    const event_id = localStorage.getItem("draft_event_id");

    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:3000/api/admin/events/${event_id}/step-3/seats`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            showtime_id,
            seats,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Lưu sơ đồ ghế thất bại.");
      }

      localStorage.removeItem("draft_event_id");
      localStorage.removeItem("draft_showtime_id");
      localStorage.removeItem("draft_event_name");
      localStorage.removeItem("draft_location");
      localStorage.removeItem("create_event_step_1");
      localStorage.removeItem("create_event_step_2");
      localStorage.removeItem("create_event_step_3");

      setSuccess(true);
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra, thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl border p-12 max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-green-600 text-4xl">
              check_circle
            </span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Tạo sự kiện thành công!
          </h2>

          <p className="text-slate-500 mb-8">
            Sự kiện{" "}
            <span className="font-semibold text-slate-700">{event_name}</span>{" "}
            đã được tạo với{" "}
            <span className="font-semibold text-red-700">{seats.length}</span>{" "}
            ghế.
          </p>

          <button
            onClick={() => navigate("/admin/events")}
            className="w-full bg-red-700 text-white py-3 rounded-lg font-semibold hover:bg-red-800 transition-colors"
          >
            Về trang sự kiện
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900 font-sans">
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 shadow-sm z-40 flex items-center justify-between px-6">
        <h1 className="text-xl font-black tracking-tighter text-red-700">
          TicketRush Admin
        </h1>

        <div className="flex items-center gap-3">
          <button className="p-2 text-slate-600 hover:bg-slate-50 rounded-full">
            <span className="material-symbols-outlined">notifications</span>
          </button>

          <button className="p-2 text-slate-600 hover:bg-slate-50 rounded-full">
            <span className="material-symbols-outlined">settings</span>
          </button>

          <img
            src="https://i.pravatar.cc/100?img=12"
            className="w-8 h-8 rounded-full border"
            alt="avatar"
          />
        </div>
      </header>

      <main className="pt-16 min-h-screen bg-[#f8f9fa] flex justify-center">
        <div className="w-full max-w-7xl px-6 py-10">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-8">
            <div className="mb-10">
              <h1 className="text-2xl font-bold mb-2">
                Bước 3: Cấu hình sơ đồ ghế
              </h1>
              <p className="text-slate-500">
                Tự động tạo ghế theo hàng và cột cho sự kiện{" "}
                <span className="font-semibold text-slate-700">
                  {event_name}
                </span>
                .
              </p>
            </div>

            <div className="mb-12">
              <div className="flex items-center justify-between">
                <Step done label="Thông tin chung" />
                <div className="flex-1 h-0.5 bg-red-600 mx-4 -mt-6" />
                <Step done label="Thời gian & Địa điểm" />
                <div className="flex-1 h-0.5 bg-red-600 mx-4 -mt-6" />
                <Step active label="Cấu hình vé" number="3" />
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              <div className="xl:col-span-1 bg-white border rounded-xl shadow-sm p-5 h-fit">
                <h3 className="text-lg font-bold mb-5">Cài đặt ghế</h3>

                <div className="space-y-4">
                  <FormField label="Số hàng">
                    <input
                      type="number"
                      min="1"
                      max="26"
                      value={config.rows}
                      onChange={(e) => updateConfig("rows", e.target.value)}
                      className="w-full mt-1 px-3 py-2 border rounded-lg"
                    />
                  </FormField>

                  <FormField label="Số cột">
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={config.cols}
                      onChange={(e) => updateConfig("cols", e.target.value)}
                      className="w-full mt-1 px-3 py-2 border rounded-lg"
                    />
                  </FormField>

                  <FormField label="Số dãy ghế VIP">
                    <input
                      type="number"
                      min="0"
                      max={config.rows}
                      value={config.vipRows}
                      onChange={(e) => updateConfig("vipRows", e.target.value)}
                      className="w-full mt-1 px-3 py-2 border rounded-lg"
                    />
                  </FormField>

                  <FormField label="Số dãy ghế thường">
                    <input
                      type="number"
                      min="0"
                      max={config.rows}
                      value={config.standardRows}
                      onChange={(e) =>
                        updateConfig("standardRows", e.target.value)
                      }
                      className="w-full mt-1 px-3 py-2 border rounded-lg"
                    />
                  </FormField>

                  <FormField label="Giá vé VIP">
                    <input
                      type="number"
                      min="0"
                      step="50000"
                      value={config.vipPrice}
                      onChange={(e) => updateConfig("vipPrice", e.target.value)}
                      className="w-full mt-1 px-3 py-2 border rounded-lg"
                    />
                  </FormField>

                  <FormField label="Giá vé thường">
                    <input
                      type="number"
                      min="0"
                      step="50000"
                      value={config.standardPrice}
                      onChange={(e) =>
                        updateConfig("standardPrice", e.target.value)
                      }
                      className="w-full mt-1 px-3 py-2 border rounded-lg"
                    />
                  </FormField>
                </div>

                <div className="mt-6 pt-5 border-t space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Tổng ghế:</span>
                    <b>{seats.length}</b>
                  </div>
                  <div className="flex justify-between text-red-700">
                    <span>Ghế VIP:</span>
                    <b>{vipSeats}</b>
                  </div>
                  <div className="flex justify-between text-blue-700">
                    <span>Ghế thường:</span>
                    <b>{standardSeats}</b>
                  </div>
                </div>

                {error && (
                  <div className="mt-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <div className="mt-6 space-y-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="w-full border py-3 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Quay lại
                  </button>

                  <button
                    type="button"
                    onClick={handleFinish}
                    disabled={loading}
                    className="w-full bg-red-700 text-white py-3 rounded-lg font-semibold hover:bg-red-800 transition-colors disabled:opacity-60"
                  >
                    {loading ? "Đang lưu..." : "Hoàn tất tạo sự kiện"}
                  </button>
                </div>
              </div>

              <div className="xl:col-span-3 bg-slate-50 border rounded-xl p-6 overflow-auto">
                <div className="flex flex-col items-center">
                  <div className="mb-8 flex justify-center">
                    <div className="w-[520px] max-w-full bg-slate-900 text-white text-center py-4 rounded-b-[60px] font-black tracking-widest shadow-lg">
                      MÀN HÌNH / SÂN KHẤU
                    </div>
                  </div>

                  <div className="w-full flex justify-center">
                    <div className="space-y-3 max-w-fit">
                      {Array.from({ length: config.rows }).map((_, rowIndex) => {
                        const rowLabel = rowName(rowIndex);
                        const isVip = rowIndex < config.vipRows;

                        return (
                          <div key={rowLabel} className="flex items-center gap-3">
                            <div className="w-8 text-sm font-bold text-slate-500 text-center">
                              {rowLabel}
                            </div>

                            <div
                              className="grid gap-2"
                              style={{
                                gridTemplateColumns: `repeat(${config.cols}, minmax(32px, 1fr))`,
                              }}
                            >
                              {Array.from({ length: config.cols }).map(
                                (_, colIndex) => (
                                  <div
                                    key={colIndex}
                                    className={`w-8 h-8 rounded-md flex items-center justify-center text-xs ${
                                      isVip
                                        ? "bg-red-100 text-red-700 border border-red-300"
                                        : "bg-blue-100 text-blue-700 border border-blue-300"
                                    }`}
                                  >
                                    {colIndex + 1}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-100 border border-red-300 rounded" />
                      VIP
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded" />
                      Ghế thường
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Step({ done, active, number, label }) {
  return (
    <div className="flex flex-col items-center z-10">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
          done
            ? "bg-red-700 text-white"
            : active
            ? "bg-red-700 text-white ring-4 ring-red-100"
            : "bg-slate-100 text-slate-400 border border-slate-200"
        }`}
      >
        {done ? (
          <span className="material-symbols-outlined text-xl">check</span>
        ) : (
          number
        )}
      </div>

      <span
        className={`mt-2 text-sm font-semibold ${
          active || done ? "text-red-700" : "text-slate-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      {children}
    </div>
  );
}

export default CreateEventStep3;