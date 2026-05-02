import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function CreateEventStep2() {
  const navigate = useNavigate();

  const savedStep2 =
    JSON.parse(localStorage.getItem("create_event_step_2")) || {};

  const [date, setDate] = useState(savedStep2.date || "");
  const [time, setTime] = useState(savedStep2.time || "");
  const [location, setLocation] = useState(savedStep2.location || "");
  const [city, setCity] = useState(savedStep2.city || "");

  const [loading, setLoading] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [error, setError] = useState("");

  const [mapPosition, setMapPosition] = useState(
    savedStep2.mapPosition || [10.762622, 106.660172]
  );
  const [mapAddress, setMapAddress] = useState(
    savedStep2.mapAddress || "TP.HCM, Việt Nam"
  );

  const saveStep2 = (newData = {}) => {
    const data = {
      date,
      time,
      location,
      city,
      mapPosition,
      mapAddress,
      ...newData,
    };

    localStorage.setItem("create_event_step_2", JSON.stringify(data));
  };

  const handleBack = () => {
    saveStep2();
    navigate("/admin/events/create/step-1");
  };

  const handleSearchLocation = async () => {
    setError("");

    if (!location.trim()) {
      setError("Vui lòng nhập địa điểm trước khi tìm trên bản đồ.");
      return;
    }

    const query = `${location}${city ? ", " + city : ""}, Việt Nam`;

    setMapLoading(true);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=1`
      );

      const data = await res.json();

      if (!data || data.length === 0) {
        setError(
          "Không tìm thấy vị trí trên bản đồ. Vui lòng nhập địa chỉ cụ thể hơn."
        );
        return;
      }

      const lat = Number(data[0].lat);
      const lon = Number(data[0].lon);
      const nextMapPosition = [lat, lon];
      const nextMapAddress = data[0].display_name;

      setMapPosition(nextMapPosition);
      setMapAddress(nextMapAddress);

      saveStep2({
        mapPosition: nextMapPosition,
        mapAddress: nextMapAddress,
      });
    } catch (err) {
      setError("Không thể tìm vị trí trên bản đồ. Vui lòng thử lại.");
    } finally {
      setMapLoading(false);
    }
  };

  const handleNext = async () => {
    setError("");

    if (!date || !time || !location.trim()) {
      setError("Vui lòng nhập ngày, giờ và địa điểm tổ chức.");
      return;
    }

    saveStep2();

    const event_id = localStorage.getItem("draft_event_id");

    if (!event_id) {
      setError("Không tìm thấy sự kiện. Vui lòng quay lại Bước 1.");
      return;
    }

    const start_time = `${date}T${time}:00`;

    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:3000/api/admin/events/${event_id}/step-2/showtime`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            start_time,
            location,
            city,
            latitude: mapPosition[0],
            longitude: mapPosition[1],
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Lưu thời gian và địa điểm thất bại.");
      }

      localStorage.setItem("draft_showtime_id", data.showtime.id);
      localStorage.setItem(
        "draft_location",
        `${location}${city ? ", " + city : ""}`
      );
      localStorage.setItem("draft_latitude", mapPosition[0]);
      localStorage.setItem("draft_longitude", mapPosition[1]);

      navigate("/admin/events/create/step-3");
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra, thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const updateDate = (value) => {
    setDate(value);
    saveStep2({ date: value });
  };

  const updateTime = (value) => {
    setTime(value);
    saveStep2({ time: value });
  };

  const updateLocation = (value) => {
    setLocation(value);
    saveStep2({ location: value });
  };

  const updateCity = (value) => {
    setCity(value);
    saveStep2({ city: value });
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900">
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-6 z-40">
        <h1 className="text-xl font-black text-red-700">
          TicketRush Admin
        </h1>

        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-slate-50 rounded-full">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border-2 border-white"></span>
          </button>

          <button className="p-2 hover:bg-slate-50 rounded-full">
            <span className="material-symbols-outlined">settings</span>
          </button>

          <img
            src="https://i.pravatar.cc/100?img=3"
            className="w-8 h-8 rounded-full border"
            alt="avatar"
          />
        </div>
      </header>

      <main className="pt-24 min-h-screen flex justify-center bg-[#f8f9fa]">
        <div className="w-full max-w-5xl px-6">
          <div className="mb-10 flex justify-between relative">
            <div className="absolute w-full h-0.5 bg-slate-200 top-5 left-0 right-0"></div>
            <Step done label="Thông tin chung" number="1" />
            <Step active label="Thời gian & Địa điểm" number="2" />
            <Step label="Cấu hình vé" number="3" />
          </div>

          <div className="bg-white rounded-xl shadow-lg border p-8">
            <h2 className="text-xl font-bold mb-2">
              Bước 2: Thời gian & Địa điểm
            </h2>

            <p className="text-slate-500 mb-6">
              Vui lòng cung cấp chính xác thời gian và địa điểm tổ chức sự kiện.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-base">
                  error
                </span>
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Ngày bắt đầu <span className="text-red-600">*</span>
                  </label>

                  <div className="relative mt-2">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      calendar_today
                    </span>

                    <input
                      type="date"
                      value={date}
                      onChange={(e) => updateDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-red-700 focus:border-red-700 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Giờ bắt đầu <span className="text-red-600">*</span>
                  </label>

                  <div className="relative mt-2">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      schedule
                    </span>

                    <input
                      type="time"
                      value={time}
                      onChange={(e) => updateTime(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-red-700 focus:border-red-700 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Địa điểm tổ chức <span className="text-red-600">*</span>
                  </label>

                  <div className="relative mt-2">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      location_on
                    </span>

                    <input
                      type="text"
                      value={location}
                      onChange={(e) => updateLocation(e.target.value)}
                      placeholder="Ví dụ: Nhà hát Hòa Bình, 240 Đường 3/2"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-red-700 focus:border-red-700 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Tỉnh/Thành phố
                  </label>

                  <select
                    value={city}
                    onChange={(e) => updateCity(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border rounded-lg mt-2 focus:ring-2 focus:ring-red-700 outline-none"
                  >
                    <option value="">Chọn tỉnh thành</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="TP.HCM">TP.HCM</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Cần Thơ">Cần Thơ</option>
                    <option value="Hải Phòng">Hải Phòng</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold">
                    Xem trước bản đồ
                  </span>

                  <button
                    type="button"
                    onClick={handleSearchLocation}
                    disabled={mapLoading}
                    className="text-xs text-red-700 font-semibold hover:underline disabled:opacity-60"
                  >
                    {mapLoading ? "Đang tìm..." : "Tìm vị trí trên bản đồ"}
                  </button>
                </div>

                <div className="h-64 rounded-xl overflow-hidden border relative">
                  <MapContainer
                    center={mapPosition}
                    zoom={15}
                    scrollWheelZoom={true}
                    className="w-full h-full z-0"
                  >
                    <ChangeMapView position={mapPosition} />

                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <Marker position={mapPosition} icon={markerIcon}>
                      <Popup>{mapAddress}</Popup>
                    </Marker>
                  </MapContainer>
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Vị trí hiện tại: {mapAddress}
                </p>
              </div>

              <div className="flex justify-between pt-6 border-t">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-2 px-6 py-3 text-slate-600 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                  Quay lại
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={loading}
                  className="bg-red-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-red-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-lg">
                        progress_activity
                      </span>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      Tiếp theo
                      <span className="material-symbols-outlined">
                        arrow_forward
                      </span>
                    </>
                  )}
                </button>
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
    <div className="relative z-10 flex flex-col items-center">
      <div
        className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-sm transition-all ${
          done
            ? "bg-red-700 text-white"
            : active
            ? "bg-red-700 text-white ring-4 ring-red-100"
            : "bg-white border-2 border-slate-200 text-slate-400"
        }`}
      >
        {done ? "✓" : number}
      </div>

      <span
        className={`mt-2 text-xs font-semibold ${
          active || done ? "text-red-700" : "text-slate-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function ChangeMapView({ position }) {
  const map = useMap();
  map.setView(position, 15);
  return null;
}

export default CreateEventStep2;