import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { setCookie, getCookie, removeCookie } from "../../utils/cookieUtils";

const Step = ({ number, label, active, completed }) => (
  <div className="flex flex-col items-center gap-2">
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${active
        ? "bg-red-700 text-white shadow-lg ring-4 ring-red-50"
        : completed
          ? "bg-red-700 text-white"
          : "bg-slate-100 text-slate-400"
        }`}
    >
      {completed ? (
        <span className="material-symbols-outlined text-base">check</span>
      ) : (
        number
      )}
    </div>
    <span
      className={`text-xs font-bold whitespace-nowrap ${active ? "text-red-700" : "text-slate-500"
        }`}
    >
      {label}
    </span>
  </div>
);

const TicketRushSeatMapDesign = () => {
  const navigate = useNavigate();

  // Load basic event info from localStorage
  const draftEventId = getCookie("draft_event_id");
  const draftShowtimeId = getCookie("draft_showtime_id");
  const draftEventName = getCookie("draft_event_name") || "Sự kiện chưa đặt tên";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [floors, setFloors] = useState(["Tầng 1", "Tầng 2"]);
  const [activeFloor, setActiveFloor] = useState("Tầng 1");

  // State for seat sections
  const [sections, setSections] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState(null);

  const selectedSection = sections.find(s => s.id === selectedSectionId);

  // Helper to update a specific section property
  const updateSection = (id, updates) => {
    setSections(prev => prev.map(sec => sec.id === id ? { ...sec, ...updates } : sec));
  };

  // Helper to add a new section
  const addSection = (shapeType = "rectangle") => {
    const newId = "sec_" + Date.now();
    const isArc = shapeType === "arc";

    const newSection = {
      id: newId,
      name: isArc ? "Khu vực vòng cung" : "Khu vực mới",
      type: "Standard",
      price: 500000,
      rows: isArc ? 1 : 5,
      cols: isArc ? 8 : 10,
      x: 200,
      y: 200,
      rotation: 0,
      shape: shapeType,
      floor: activeFloor,
    };
    setSections(prev => [...prev, newSection]);
    setSelectedSectionId(newId);
  };

  const deleteSection = (id) => {
    setSections(prev => prev.filter(sec => sec.id !== id));
    if (selectedSectionId === id) setSelectedSectionId(null);
  };

  const addFloor = () => {
    const nextFloorNumber = floors.length + 1;
    const nextFloorName = `Tầng ${nextFloorNumber}`;
    if (!floors.includes(nextFloorName)) {
      setFloors(prev => [...prev, nextFloorName]);
      setActiveFloor(nextFloorName);
    }
  };

  const deleteFloor = (floorName) => {
    if (floors.length <= 1) {
      setError("Không thể xóa tầng cuối cùng.");
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa "${floorName}" và toàn bộ ghế trong tầng này không?`)) {
      setFloors(prev => prev.filter(f => f !== floorName));
      setSections(prev => prev.filter(s => s.floor !== floorName));

      if (activeFloor === floorName) {
        const remainingFloors = floors.filter(f => f !== floorName);
        setActiveFloor(remainingFloors[remainingFloors.length - 1]);
      }
    }
  };

  // Dragging logic
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e, id) => {
    if (e.button !== 0) return; // Only left click
    const sec = sections.find(s => s.id === id);
    if (!sec) return;

    const container = document.querySelector(".canvas-grid");
    if (!container) return;
    const rect = container.getBoundingClientRect();

    setDraggingId(id);
    setSelectedSectionId(id);
    setDragOffset({
      x: e.clientX - rect.left + container.scrollLeft - sec.x,
      y: e.clientY - rect.top + container.scrollTop - sec.y
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (!draggingId) return;
    const container = document.querySelector(".canvas-grid");
    if (!container) return;
    const rect = container.getBoundingClientRect();
    // Cộng thêm scrollLeft/scrollTop để tọa độ chính xác ngay cả khi cuộn chuột
    const newX = e.clientX - rect.left + container.scrollLeft - dragOffset.x;
    const newY = e.clientY - rect.top + container.scrollTop - dragOffset.y;

    setSections(prev => prev.map(sec =>
      sec.id === draggingId ? { ...sec, x: newX, y: newY } : sec
    ));
  }, [draggingId, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setDraggingId(null);
  }, []);

  useEffect(() => {
    if (draggingId) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingId, handleMouseMove, handleMouseUp]);

  const handleFinish = async () => {
    if (!draftShowtimeId) {
      setError("Không tìm thấy thông tin suất diễn. Vui lòng hoàn thành Bước 2.");
      return;
    }

    if (sections.length === 0) {
      setError("Vui lòng thiết kế ít nhất một khu vực ghế.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Transform sections into individual seats
      const allSeats = [];
      sections.forEach(sec => {
        for (let r = 1; r <= sec.rows; r++) {
          for (let c = 1; c <= sec.cols; c++) {
            allSeats.push({
              floor: sec.floor,
              section: sec.id,
              row: `${sec.id}-${r}`,
              seat_number: c,
              status: "available",
              seat_type: sec.type,
              price: sec.price
            });
          }
        }
      });

      const response = await fetch(`http://localhost:3000/api/admin/events/${draftEventId}/step-3/seats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          showtime_id: draftShowtimeId,
          seats: allSeats,
          layoutData: sections.map(sec => {
            const stage = document.getElementById("admin-stage");
            const container = document.querySelector(".canvas-grid");
            if (stage && container) {
              const stageRect = stage.getBoundingClientRect();
              const containerRect = container.getBoundingClientRect();
              const centerX = (stageRect.left + stageRect.width / 2) - containerRect.left + container.scrollLeft;
              const centerY = (stageRect.top + stageRect.height / 2) - containerRect.top + container.scrollTop;
              return {
                ...sec,
                x: sec.x - centerX,
                y: sec.y - centerY
              };
            }
            return sec;
          })
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Lưu sơ đồ ghế thất bại.");
      }

      // Success! Clear draft and redirect
      removeCookie("create_event_step_1");
      removeCookie("create_event_step_2");
      removeCookie("draft_event_id");
      removeCookie("draft_showtime_id");

      alert("Chúc mừng! Bạn đã tạo sự kiện thành công.");
      navigate("/admin/events");
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra, thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        
        @import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap");

        .canvas-grid {
          background-image: radial-gradient(circle, #e2e8f0 1px, transparent 1px);
          background-size: 24px 24px;
        }

        .seat-manual {
          width: 14px;
          height: 14px;
          border-radius: 2px;
        }

        .material-symbols-outlined {
          font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
        }

        .bg-surface {
          background-color: #f8f9fa;
        }

        .text-on-surface {
          color: #191c1d;
        }

        .text-secondary {
          color: #5f5e5e;
        }

        .text-primary {
          color: #b30004;
        }

        .bg-primary {
          background-color: #b30004;
        }

        .bg-tertiary {
          background-color: #0053b7;
        }

        .text-tertiary {
          color: #0053b7;
        }

        .font-body-md {
          font-family: "Inter", sans-serif;
          font-size: 16px;
          line-height: 24px;
          font-weight: 400;
        }

        .font-button {
          font-family: "Inter", sans-serif;
        }

        .text-button {
          font-size: 16px;
          line-height: 24px;
          letter-spacing: 0.01em;
          font-weight: 600;
        }

        .text-label-sm {
          font-size: 14px;
          line-height: 20px;
          font-weight: 600;
        }
      `}</style>

      <div className="min-h-screen bg-[#f8f9fa] text-slate-900 font-sans flex flex-col">
        {/* Header (Same as Step 1 & 2) */}
        <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 shadow-sm z-[100] flex items-center justify-between px-6">
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
            <div className="h-8 w-px bg-slate-200 mx-2" />
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">
              <span className="material-symbols-outlined text-lg">support_agent</span>
              Support
            </button>
            <img
              alt="Admin avatar"
              className="w-8 h-8 rounded-full border border-slate-200 ml-2"
              src="https://i.pravatar.cc/100?img=12"
            />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="pt-16 flex-1 flex flex-col items-center">
          <div className="w-full max-w-[1600px] px-6 py-10 flex-1 flex flex-col">
            {/* Title Block */}
            <div className="mb-10">
              <h1 className="text-2xl font-bold mb-2 text-on-surface">Cấu hình sơ đồ ghế</h1>
              <p className="text-slate-500">
                Thiết kế vị trí ghế và thiết lập hạng vé cho từng khu vực của sự kiện.
              </p>
            </div>

            {/* Step Progress Bar */}
            <div className="mb-12 bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
              <div className="flex items-center justify-between max-w-4xl mx-auto">
                <Step number="1" label="Thông tin chung" completed />
                <div className="flex-1 h-0.5 bg-red-700 mx-4 -mt-6" />
                <Step number="2" label="Thời gian & Địa điểm" completed />
                <div className="flex-1 h-0.5 bg-red-700 mx-4 -mt-6" />
                <Step number="3" label="Cấu hình vé" active />
              </div>
            </div>

            {/* Editor Container */}
            <div className="flex-1 flex gap-6 min-h-[600px] mb-10">
              {/* Interactive Map Workspace */}
              <div className="flex-1 relative bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-xl">
                {/* Drawing Toolbar */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2 p-2 bg-white rounded-xl shadow-xl border border-zinc-100">

                  <div className="w-8 h-[1px] bg-zinc-100 mx-auto"></div>

                  <button
                    onClick={() => addSection('rectangle')}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg hover:bg-red-50 hover:text-primary transition-colors ${selectedSection?.shape === 'rectangle' ? 'bg-red-50 text-primary' : 'text-zinc-600'}`}
                  >
                    <span className="material-symbols-outlined">rectangle</span>
                  </button>

                  <button
                    onClick={() => addSection('arc')}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg hover:bg-red-50 hover:text-primary transition-colors ${selectedSection?.shape === 'arc' ? 'bg-red-50 text-primary' : 'text-zinc-600'}`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M4 18c0-4.418 3.582-8 8-8s8 3.582 8 8" strokeLinecap="round"></path>
                    </svg>
                  </button>


                </div>

                {/* Canvas */}
                <div className="flex-1 canvas-grid relative overflow-auto p-20 flex items-center justify-center bg-slate-50/30">
                  {/* Centered Stage Reference Point */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div id="admin-stage" className="px-10 py-4 bg-zinc-900 text-white rounded-lg text-sm font-black tracking-widest uppercase shadow-2xl border-2 border-white/20 z-0 pointer-events-auto select-none">
                      {draftEventName} / SÂN KHẤU
                    </div>
                  </div>

                  {/* Interactive Drawing Layer (Placeholder for seats/shapes) */}
                  <div className="relative w-full h-full pointer-events-none">
                    {sections.filter(s => s.floor === activeFloor).map((sec) => (
                      <div
                        key={sec.id}
                        onMouseDown={(e) => handleMouseDown(e, sec.id)}
                        className={`absolute p-4 rounded-xl transition-all pointer-events-auto select-none ${selectedSectionId === sec.id
                          ? "border-2 border-primary bg-white/50 backdrop-blur-sm shadow-lg ring-2 ring-red-100"
                          : "border-0"
                          } ${sec.shape === 'arc' ? 'rounded-t-full' : 'rounded-xl'}`}
                        style={{
                          left: sec.x,
                          top: sec.y,
                          transform: `rotate(${sec.rotation}deg)`,
                          width: sec.shape === 'arc' ? `${(60 + ((sec.rows - 1) * 15)) * 2 + 40}px` : 'auto',
                          height: sec.shape === 'arc' ? `${(60 + ((sec.rows - 1) * 15)) + 60}px` : 'auto'
                        }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-zinc-800 text-white text-[10px] font-bold rounded uppercase tracking-tighter whitespace-nowrap shadow-sm z-10">
                          {sec.name} ({sec.type})
                        </div>

                        {sec.shape === "rectangle" ? (
                          <div
                            className="grid gap-1"
                            style={{
                              gridTemplateColumns: `repeat(${sec.cols}, minmax(0, 1fr))`
                            }}
                          >
                            {Array.from({ length: sec.rows * sec.cols }).map((_, i) => (
                              <div
                                key={i}
                                className={`seat-manual shadow-sm ${sec.shape === 'rectangle' ? 'bg-blue-600' : 'bg-red-600'}`}
                              ></div>
                            ))}
                          </div>
                        ) : (
                          <div className="absolute inset-0 flex items-start justify-center pt-10">
                            {/* Curved Seats Representation */}
                            <div className="relative w-full h-full overflow-visible">
                              {Array.from({ length: sec.rows }).map((_, r) => (
                                <React.Fragment key={r}>
                                  {Array.from({ length: sec.cols }).map((_, i) => {
                                    const total = sec.cols;
                                    const angleSpread = 120 + (r * 10);
                                    const angleStep = angleSpread / (total - 1 || 1);
                                    const startAngle = -angleSpread / 2;
                                    const angle = startAngle + (i * angleStep);
                                    const radius = 60 + (r * 15);
                                    const maxRadius = 60 + ((sec.rows - 1) * 15);

                                    const rx = Math.sin(angle * Math.PI / 180) * radius;
                                    const ry = -Math.cos(angle * Math.PI / 180) * radius + maxRadius;

                                    return (
                                      <div
                                        key={`${r}-${i}`}
                                        className={`absolute w-3 h-3 rounded-[2px] ${sec.type === "VIP" ? "bg-[#0053b7]" : "bg-[#b30004]"}`}
                                        style={{
                                          left: "50%",
                                          transform: `translate(${rx - 6}px, ${ry}px) rotate(${angle}deg)`,
                                        }}
                                      ></div>
                                    );
                                  })}
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Canvas Footer Controls */}
                <div className="p-4 bg-white border-t border-zinc-200 flex justify-end items-center">
                  {/* Floors Selection */}
                  <div className="flex bg-slate-50 p-1 rounded-xl border border-zinc-100">
                    {floors.map(floor => (
                      <button
                        key={floor}
                        onClick={() => setActiveFloor(floor)}
                        className={`px-4 py-1.5 text-[11px] font-bold rounded-lg transition-all ${activeFloor === floor ? 'bg-white text-primary shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                      >
                        {floor}
                      </button>
                    ))}
                    <button
                      onClick={addFloor}
                      className="px-2 py-1.5 text-zinc-400 hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Property Panel */}
              <aside className="w-80 bg-white rounded-2xl border border-slate-200 shadow-xl flex flex-col overflow-hidden">
                <div className="p-4 border-b border-zinc-200 bg-zinc-50/50">
                  <h2 className="text-sm font-black uppercase tracking-tight text-on-surface">
                    Cài đặt thuộc tính
                  </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                  {/* Section: Floor Selection */}
                  <div className="space-y-3 pb-6 border-b border-zinc-100">
                    <div className="flex items-center justify-between">
                      <label className="text-label-sm text-zinc-500 flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">
                          layers
                        </span>
                        Quản lý tầng
                      </label>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {floors.map(f => (
                        <div key={f} className="group relative">
                          <button
                            onClick={() => setActiveFloor(f)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${activeFloor === f ? 'bg-red-700 text-white shadow-sm shadow-red-100' : 'bg-slate-50 text-zinc-500 hover:bg-zinc-100'}`}
                          >
                            {f}
                          </button>
                          {activeFloor === f && floors.length > 1 && (
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteFloor(f); }}
                              className="absolute -top-2 -right-2 w-5 h-5 bg-white border border-red-200 text-red-600 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <span className="material-symbols-outlined text-[12px]">close</span>
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={addFloor}
                        className="w-8 h-8 rounded-lg border border-dashed border-zinc-300 text-zinc-400 hover:border-red-700 hover:text-red-700 transition-all flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    </div>
                  </div>

                  {/* Section: Area Properties */}
                  {selectedSection ? (
                    <div className="space-y-6 pt-4">
                      <div className="space-y-3">
                        <label className="text-label-sm text-zinc-500 flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg">
                            edit_square
                          </span>
                          Thuộc tính khu vực
                        </label>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase">
                              Tên khu vực
                            </p>

                            <input
                              className="w-full bg-slate-50 border-zinc-200 rounded-lg text-sm font-semibold focus:ring-primary focus:border-primary px-3 py-2"
                              type="text"
                              value={selectedSection.name}
                              onChange={(e) => updateSection(selectedSection.id, { name: e.target.value })}
                            />
                          </div>

                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase">
                              Hạng vé
                            </p>

                            <select
                              className="w-full bg-slate-50 border-zinc-200 rounded-lg text-sm font-semibold focus:ring-primary focus:border-primary px-3 py-2 cursor-pointer"
                              value={selectedSection.type}
                              onChange={(e) => updateSection(selectedSection.id, { type: e.target.value })}
                            >
                              <option value="Standard">Standard</option>
                              <option value="VIP">VIP</option>
                              <option value="VVIP">VVIP</option>
                              <option value="Premium">Premium</option>
                              <option value="Economy">Economy</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1 pt-2">
                          <p className="text-[10px] font-bold text-zinc-400 uppercase">
                            Giá vé (VNĐ)
                          </p>

                          <input
                            className="w-full bg-slate-50 border-zinc-200 rounded-lg text-sm font-semibold focus:ring-primary focus:border-primary px-3 py-2"
                            type="number"
                            value={selectedSection.price}
                            onChange={(e) => updateSection(selectedSection.id, { price: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-zinc-100">
                        <label className="text-label-sm text-zinc-500 flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg">
                            grid_view
                          </span>
                          Cấu hình khối ghế
                        </label>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase">
                              Số hàng ghế
                            </p>

                            <input
                              className="w-full h-9 bg-slate-50 border-zinc-200 rounded-lg text-sm font-semibold focus:ring-primary focus:border-primary px-3"
                              type="number"
                              min="1"
                              max="10"
                              value={selectedSection.rows}
                              onChange={(e) => updateSection(selectedSection.id, { rows: parseInt(e.target.value) || 1 })}
                            />
                          </div>

                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase">
                              {selectedSection.shape === 'rectangle' ? 'Số ghế mỗi hàng' : 'Số ghế / vòng cung'}
                            </p>

                            <input
                              className="w-full h-9 bg-slate-50 border-zinc-200 rounded-lg text-sm font-semibold focus:ring-primary focus:border-primary px-3"
                              type="number"
                              min="1"
                              max="30"
                              value={selectedSection.cols}
                              onChange={(e) => updateSection(selectedSection.id, { cols: parseInt(e.target.value) || 1 })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2 mt-2">
                          <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase">
                            <span>Xoay hướng</span>
                            <span className="text-zinc-600">{selectedSection.rotation}°</span>
                          </div>

                          <input
                            className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-primary"
                            max="360"
                            min="0"
                            type="range"
                            value={selectedSection.rotation}
                            onChange={(e) => updateSection(selectedSection.id, { rotation: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>

                      <div className="pt-4">
                        <button
                          onClick={() => deleteSection(selectedSection.id)}
                          className="w-full py-2 text-[11px] font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                          Xóa khu vực này
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-zinc-400 space-y-2">
                      <span className="material-symbols-outlined text-4xl opacity-20">touch_app</span>
                      <p className="text-xs font-medium">Chọn một khu vực để chỉnh sửa</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-5 bg-white border-t border-zinc-200 space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-bold text-zinc-400">
                      TỔNG SỐ GHẾ:
                    </span>
                    <span className="text-lg font-black text-on-surface">
                      {sections.reduce((acc, sec) => acc + (sec.rows * sec.cols), 0)}
                    </span>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-[11px] font-medium leading-relaxed">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate("/admin/events/create/step-2")}
                      className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-all"
                    >
                      Quay lại
                    </button>
                    <button
                      onClick={handleFinish}
                      disabled={loading}
                      className="flex-[2] py-3 bg-red-700 text-white font-semibold rounded-lg shadow-lg shadow-red-700/20 hover:bg-red-800 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                      ) : null}
                      Hoàn tất thiết kế
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </main>

        {/* Abstract Event Background Pattern (Visual Only) */}
        <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
          <svg
            className="absolute top-0 right-0 w-[800px] h-[800px] text-red-50/20 translate-x-1/2 -translate-y-1/4"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M44.7,-76.4C58.3,-69.2,70.1,-58,78.5,-44.6C86.9,-31.2,91.9,-15.6,90.4,-0.9C88.8,13.9,80.7,27.8,70.6,39.6C60.5,51.4,48.4,61.1,34.8,68.4C21.2,75.7,6,80.6,-8.7,79.1C-23.4,77.6,-37.6,69.7,-49.4,59.6C-61.2,49.5,-70.6,37.1,-76.3,23.3C-82,9.4,-84.1,-5.9,-80.4,-20.1C-76.7,-34.3,-67.2,-47.4,-54.9,-55.1C-42.6,-62.8,-27.5,-65.1,-13.3,-71C0.8,-76.9,15.1,-86.4,31.1,-83.6C47.1,-80.8,64.8,-65.7,44.7,-76.4Z"
              fill="currentColor"
              transform="translate(100 100)"
            ></path>
          </svg>
        </div>
      </div>
    </>
  );
};

export default TicketRushSeatMapDesign;