import React, { useState, useMemo, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { ZoomIn, ZoomOut, RotateCcw, ArrowLeft, Maximize2 } from "lucide-react"

const seatStatusStyles = {
  available: "bg-blue-500 hover:bg-blue-600 hover:scale-110 cursor-pointer border-blue-600 text-white shadow-sm",
  vip: "bg-amber-400 hover:bg-amber-500 hover:scale-110 cursor-pointer border-amber-600 text-amber-950 shadow-md",
  selected: "bg-green-500 hover:bg-green-600 cursor-pointer border-green-400 ring-4 ring-green-400/50 text-white shadow-[0_0_20px_rgba(34,197,94,0.6)] z-20",
  sold: "bg-transparent border-2 border-red-500 cursor-not-allowed text-red-500 font-bold",
  locked: "bg-transparent border border-slate-300 cursor-not-allowed text-slate-300 opacity-40",
}

/** Kích thước canvas chi tiết vòng cung — scale theo số hàng/cột thay vì cố định 500px */
function getArcDetailLayout(rows, cols, seatPx = 36) {
  const innerRadius = 150
  const rowStep = 45
  const r = Math.max(1, parseInt(rows, 10) || 1)
  const c = Math.max(1, parseInt(cols, 10) || 1)
  const maxRadius = innerRadius + (r - 1) * rowStep
  const maxAngleSpread = 120 + (r - 1) * 10
  const maxRx =
    Math.sin(((maxAngleSpread / 2) * Math.PI) / 180) * maxRadius
  const pad = 56
  const labelBand = 72
  return {
    innerRadius,
    rowStep,
    maxRadius,
    seatPx,
    width: Math.max(360, Math.ceil(maxRx * 2 + seatPx + pad * 2)),
    height: Math.max(320, Math.ceil(maxRadius + seatPx + labelBand + pad)),
  }
}

function getArcSeatTransform(rowIdx, colIdx, totalCols, layout) {
  const { innerRadius, rowStep, maxRadius } = layout
  const r = rowIdx - 1
  const i = colIdx - 1
  const angleSpread = 120 + r * 10
  const angleStep = angleSpread / (totalCols - 1 || 1)
  const startAngle = -angleSpread / 2
  const angle = startAngle + i * angleStep
  const radius = innerRadius + r * rowStep
  const rx = Math.sin((angle * Math.PI) / 180) * radius
  const ry = -Math.cos((angle * Math.PI) / 180) * radius + maxRadius
  return { rx, ry, angle }
}

export function SeatMap({ seats = [], selectedSeats = [], onSeatClick, maxSeats = 8, layout = [], seatsLoading = false, currentUserId = null, seatActionLoading = false }) {
  const containerRef = useRef(null)
  const zoomScrollRef = useRef(null)
  const zoomScrollPos = useRef({ left: 0, top: 0 })
  const [scale, setScale] = useState(1)
  const [zoomedSection, setZoomedSection] = useState(null)

  // Constant scale factor relative to Admin's 14px seats
  const K = 1.6 
  const userSeatSize = Math.round(14 * K) // ~22px
  const userGap = 4 * K
  const userPadding = 16 * K

  // Parse layout if it's a string, or { sections: [...] }
  const parsedLayout = useMemo(() => {
    if (!layout) return []
    let raw = layout
    if (typeof layout === "string") {
      try {
        raw = JSON.parse(layout)
      } catch (e) {
        console.error("Error parsing layout_json:", e)
        return []
      }
    }
    if (Array.isArray(raw)) return raw
    if (raw && Array.isArray(raw.sections)) return raw.sections
    return []
  }, [layout])

  const [activeFloor, setActiveFloor] = useState(
    parsedLayout.length > 0 ? parsedLayout[0].floor : "Tầng 1"
  )

  useEffect(() => {
    if (!parsedLayout.length) return
    const floorKeys = [...new Set(parsedLayout.map((s) => s.floor))]
    setActiveFloor((prev) => (floorKeys.includes(prev) ? prev : floorKeys[0]))
  }, [parsedLayout])

  // Auto-center the scroll container on mount or floor change
  useEffect(() => {
    if (containerRef.current && !zoomedSection) {
      const { scrollWidth, scrollHeight, clientWidth, clientHeight } = containerRef.current
      containerRef.current.scrollLeft = (scrollWidth - clientWidth) / 2
      containerRef.current.scrollTop = (scrollHeight - clientHeight) / 2
    }
  }, [activeFloor, scale, zoomedSection])

  // Giữ vị trí cuộn khi chọn/bỏ chọn ghế trong màn chi tiết (tránh nhảy)
  useEffect(() => {
    const el = zoomScrollRef.current
    if (!el || !zoomedSection) return
    el.scrollLeft = zoomScrollPos.current.left
    el.scrollTop = zoomScrollPos.current.top
  }, [selectedSeats, zoomedSection])

  // Căn giữa sơ đồ chi tiết một lần khi mở khu vực
  useEffect(() => {
    if (!zoomedSection || !zoomScrollRef.current) return
    const el = zoomScrollRef.current
    const id = requestAnimationFrame(() => {
      el.scrollLeft = Math.max(0, (el.scrollWidth - el.clientWidth) / 2)
      el.scrollTop = Math.max(0, (el.scrollHeight - el.clientHeight) / 2)
      zoomScrollPos.current = { left: el.scrollLeft, top: el.scrollTop }
    })
    return () => cancelAnimationFrame(id)
  }, [zoomedSection])

  const saveZoomScroll = () => {
    if (!zoomScrollRef.current) return
    zoomScrollPos.current = {
      left: zoomScrollRef.current.scrollLeft,
      top: zoomScrollRef.current.scrollTop,
    }
  }

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 2))
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5))
  const handleResetZoom = () => setScale(1)

  const isSeatSelected = (seat) => {
    return selectedSeats.some((s) => s.id === seat.id)
  }

  const getSeatStatus = (seat) => {
    if (!seat) return "skeleton"
    if (isSeatSelected(seat)) return "selected"
    if (seat.status === "sold") return "sold"
    if (seat.status === "locked") {
      if (currentUserId && seat.user_id === currentUserId) return "selected"
      return "locked"
    }
    
    const type = String(seat.type || "").toUpperCase()
    if (type === "VIP") return "vip"
    return "available"
  }

  const isDefaultSectionName = (name) => {
    if (!name) return true
    const n = name.toLowerCase().trim()
    return (
      n === "khu vực vòng cung" ||
      n === "khu vưcj vòng cung" ||
      n === "khu vực mới" ||
      n === "khu vực hình chữ nhật" ||
      n === "section name"
    )
  }

  const floors = useMemo(() => {
    return [...new Set(parsedLayout.map((s) => s.floor))]
  }, [parsedLayout])

  const sectionsByFloor = useMemo(() => {
    const map = new Map()
    for (const sec of parsedLayout) {
      const f = String(sec.floor || "Tầng 1").trim()
      if (!map.has(f)) map.set(f, [])
      map.get(f).push(sec)
    }
    return map
  }, [parsedLayout])

  /** Index ghế theo (tầng|khu|hàng|cột) — tránh find() lấy nhầm ghế khối khác khi nhiều khu */
  const seatLookup = useMemo(() => {
    const map = new Map()
    const add = (key, seat) => {
      if (key && !map.has(key)) map.set(key, seat)
    }
    for (const s of seats) {
      const col = Number(s.column)
      if (!Number.isFinite(col)) continue
      const row = String(s.row || "").trim()
      const sec = String(s.section || "").trim()
      const floor = s.floor != null && s.floor !== "" ? String(s.floor).trim() : ""
      const type = String(s.type || "").trim().toUpperCase()

      // Admin lưu row = sec_xxx-N → suy ra section id + chỉ số hàng (ổn định khi nhiều khối)
      const rowParts = row.match(/^(sec_\d+)-(\d+)$/)
      if (rowParts) {
        const [, secFromRow, rowIndex] = rowParts
        add(`${floor}|${secFromRow}|${rowIndex}|${col}`, s)
        add(`|${secFromRow}|${rowIndex}|${col}`, s)
      }

      add(`${floor}|${sec}|${row}|${col}`, s)
      add(`|${sec}|${row}|${col}`, s)
      add(`${sec}|${row}|${col}`, s)
      if (type) {
        add(`${floor}|${type}|${row}|${col}`, s)
        add(`|${type}|${row}|${col}`, s)
      }
    }
    return map
  }, [seats])

  const matchSectionStrict = (s, section, floorSections, multiSection) => {
    const sSection = String(s.section || "").trim()
    const secId = String(section.id || "").trim()
    const secName = String(section.name || "").trim()

    if (sSection === secId || sSection === secName) return true
    if (multiSection) return false

    const secType = String(section.type || "").trim().toUpperCase()
    const sameTypeOnFloor = floorSections.filter(
      (sec) => String(sec.type || "").trim().toUpperCase() === secType
    ).length
    if (sameTypeOnFloor > 1) return false

    const sType = String(s.type || "").trim().toUpperCase()
    return (
      secType &&
      isDefaultSectionName(secName) &&
      (sSection.toUpperCase() === secType || sType === secType)
    )
  }

  const matchRowStrict = (s, section, rowIdx, multiSection) => {
    const sRow = String(s.row || "").trim()
    const compositeRow = `${section.id}-${rowIdx}`
    if (sRow === compositeRow) return true
    if (multiSection) return false

    const rowLetter = String.fromCharCode(64 + rowIdx)
    return sRow === String(rowIdx) || sRow === rowLetter
  }

  const getSeatBySectionPos = (section, rowIdx, colIdx) => {
    if (!seats?.length) return null

    const floor = String(section.floor || "Tầng 1").trim()
    const secId = String(section.id || "").trim()
    const secName = String(section.name || "").trim()
    const secType = String(section.type || "").trim().toUpperCase()
    const compositeRow = `${secId}-${rowIdx}`
    const rowLetter = String.fromCharCode(64 + rowIdx)
    const rowNum = String(rowIdx)

    const floorSections =
      sectionsByFloor.get(floor) ||
      parsedLayout.filter((s) => String(s.floor || "Tầng 1").trim() === floor)
    const multiSection = floorSections.length > 1

    const keyAttempts = [
      `${floor}|${secId}|${rowIdx}|${colIdx}`,
      `|${secId}|${rowIdx}|${colIdx}`,
      `${floor}|${secName}|${compositeRow}|${colIdx}`,
      `${floor}|${secId}|${compositeRow}|${colIdx}`,
      `${secName}|${compositeRow}|${colIdx}`,
      `${secId}|${compositeRow}|${colIdx}`,
    ]

    if (!multiSection) {
      keyAttempts.push(
        `${floor}|${secName}|${rowLetter}|${colIdx}`,
        `${floor}|${secName}|${rowNum}|${colIdx}`,
        `${secName}|${rowLetter}|${colIdx}`,
        `${secName}|${rowNum}|${colIdx}`
      )
      if (secType && isDefaultSectionName(secName)) {
        keyAttempts.push(
          `${floor}|${secType}|${rowLetter}|${colIdx}`,
          `${floor}|${secType}|${rowNum}|${colIdx}`,
          `|${secType}|${rowLetter}|${colIdx}`,
          `|${secType}|${rowNum}|${colIdx}`
        )
      }
    }

    for (const k of keyAttempts) {
      if (seatLookup.has(k)) return seatLookup.get(k)
    }

    return (
      seats.find((s) => {
        if (section.floor && s.floor && String(s.floor).trim() !== floor) return false
        if (!matchSectionStrict(s, section, floorSections, multiSection)) return false
        if (!matchRowStrict(s, section, rowIdx, multiSection)) return false
        const sCol = Number(s.column)
        return Number.isFinite(sCol) && sCol === colIdx
      }) ?? null
    )
  }

  const renderSeat = (seat, type = "Standard", extraProps = {}) => {
    const { className, style, showLabel = true, labelOverride = null, detailView = false } = extraProps
    const status = getSeatStatus(seat)
    
    if (status === "skeleton") {
      const typeStr = String(type || "").toUpperCase()
      const isVIP = typeStr === "VIP"
      const label = labelOverride !== null ? labelOverride : ""
      
      return (
        <div 
          className={cn(
            "rounded-t-lg border-b-2 flex items-center justify-center shadow-sm transition-all duration-200 font-bold opacity-30 cursor-not-allowed",
            isVIP 
              ? "bg-amber-50 border-amber-200 text-amber-500" 
              : "bg-blue-50 border-blue-200 text-blue-400",
            className
          )}
          style={{ 
            width: `${userSeatSize}px`, 
            height: `${userSeatSize}px`,
            fontSize: `${Math.max(8, (style?.width ? parseInt(style.width) : userSeatSize) / 2.5)}px`,
            ...style 
          }}
          title="Vị trí này chưa được khởi tạo sơ đồ ghế"
        >
          {showLabel && label !== "" ? label : <div className="w-1.5 h-1.5 rounded-full bg-current opacity-30" />}
        </div>
      )
    }

    const isClickable =
      !seatActionLoading &&
      (status === "available" || status === "vip" || status === "selected")

    return (
      <button
        type="button"
        onMouseDown={(e) => {
          if (detailView) e.preventDefault()
        }}
        onClick={(e) => {
          e.stopPropagation()
          if (detailView) saveZoomScroll()
          if (isClickable && seat) onSeatClick(seat)
        }}
        disabled={!isClickable || seatActionLoading}
        className={cn(
          "relative flex items-center justify-center rounded-t-lg border-b-2 font-bold transition-all duration-200 shadow-md",
          seatStatusStyles[status],
          className
        )}
        style={{ 
          width: `${userSeatSize}px`, 
          height: `${userSeatSize}px`,
          fontSize: `${Math.max(8, (style?.width ? parseInt(style.width) : userSeatSize) / 2.5)}px`,
          ...style 
        }}
        title={`${seat?.type} - Ghế ${seat?.column} - ${seat?.price?.toLocaleString("vi-VN")}đ`}
      >
        {showLabel ? (labelOverride !== null ? labelOverride : seat?.column) : ""}
      </button>
    )
  }

  const renderZoomedSectionView = () => {
    if (!zoomedSection) return null
    const sec = zoomedSection
    const rows = parseInt(sec.rows) || 0
    const cols = parseInt(sec.cols) || 0
    const detailSeatPx = 36
    const arcLayout =
      sec.shape === "arc" ? getArcDetailLayout(rows, cols, detailSeatPx) : null
    const halfSeat = detailSeatPx / 2

    return (
      <div className="absolute inset-0 z-[100] bg-white flex flex-col animate-in fade-in zoom-in duration-300">
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <button 
            onClick={() => {
              zoomScrollPos.current = { left: 0, top: 0 }
              setZoomedSection(null)
            }}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-primary hover:bg-slate-50 rounded-xl transition-all font-bold"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại sơ đồ chính
          </button>
          <div className="text-center">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
              {isDefaultSectionName(sec.name) ? "Chi tiết khu vực" : sec.name}
            </h3>
            <p className="text-sm text-slate-500 font-medium">Chọn ghế của bạn tại đây</p>
          </div>
          <div className="w-[180px]" /> {/* Spacer */}
        </div>

        <div
          ref={zoomScrollRef}
          onScroll={saveZoomScroll}
          className="flex-1 min-h-0 overflow-auto overscroll-contain px-4 py-6 zoom-detail-scroll"
        >
          <div className="flex justify-center w-max min-w-full mx-auto shrink-0">
          {sec.shape === "rectangle" ? (
            <div className="relative p-12 bg-slate-50 rounded-[2rem] border border-slate-200 shadow-inner">
              {/* Column Numbers Header */}
              <div 
                className="grid gap-4 mb-6 ml-10"
                style={{ gridTemplateColumns: `repeat(${cols}, 40px)` }}
              >
                {Array.from({ length: cols }).map((_, i) => (
                  <div key={i} className="text-center text-[10px] font-black text-slate-400 uppercase">
                    {i + 1}
                  </div>
                ))}
              </div>

              {/* Rows with Row Letters */}
              <div className="space-y-4">
                {Array.from({ length: rows }).map((_, r) => (
                  <div key={r} className="flex items-center gap-4">
                    <div className="w-6 text-right text-xs font-black text-slate-400">
                      {String.fromCharCode(65 + r)}
                    </div>
                    <div 
                      className="grid gap-4"
                      style={{ gridTemplateColumns: `repeat(${cols}, 40px)` }}
                    >
                      {Array.from({ length: cols }).map((_, c) => {
                        const seat = getSeatBySectionPos(sec, r + 1, c + 1)
                        return (
                          <div key={`${sec.id}-${r}-${c}`} className="flex items-center justify-center">
                            {renderSeat(seat, sec.type, {
                              detailView: true,
                              style: { width: '40px', height: '40px', fontSize: '14px' }
                            })}
                          </div>
                        )
                      })}
                    </div>
                    <div className="w-6 text-left text-xs font-black text-slate-400">
                      {String.fromCharCode(65 + r)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div
              className="relative bg-slate-50 rounded-[2rem] border border-slate-200 shadow-inner shrink-0"
              style={{
                width: `${arcLayout.width}px`,
                height: `${arcLayout.height}px`,
              }}
            >
               <div className="relative w-full h-full">
                  {/* Column labels */}
                  {Array.from({ length: cols }).map((_, i) => {
                    const { angle } = getArcSeatTransform(1, i + 1, cols, arcLayout)
                    const labelRadius = arcLayout.innerRadius - 50
                    const lx = Math.sin((angle * Math.PI) / 180) * labelRadius
                    const ly =
                      -Math.cos((angle * Math.PI) / 180) * labelRadius +
                      arcLayout.maxRadius -
                      24

                    return (
                      <div 
                        key={`col-label-${i}`}
                        className="absolute left-1/2 top-0 text-[11px] font-black text-slate-500 uppercase flex items-center justify-center w-6 h-6 pointer-events-none"
                        style={{
                          transform: `translate(${lx - 12}px, ${ly}px) rotate(${angle}deg)`
                        }}
                      >
                        {String.fromCharCode(65 + i)}
                      </div>
                    )
                  })}

                  {Array.from({ length: rows }).map((_, r) => (
                    <React.Fragment key={r}>
                      {Array.from({ length: cols }).map((_, i) => {
                        const { rx, ry, angle } = getArcSeatTransform(r + 1, i + 1, cols, arcLayout)
                        const seat = getSeatBySectionPos(sec, r + 1, i + 1)
                        
                        return (
                          <React.Fragment key={`${sec.id}-${r}-${i}`}>
                            {renderSeat(seat, sec.type, {
                              detailView: true,
                              className: "absolute",
                              labelOverride: r + 1,
                              style: {
                                left: "50%",
                                width: `${detailSeatPx}px`,
                                height: `${detailSeatPx}px`,
                                fontSize: '12px',
                                transform: `translate(${rx - halfSeat}px, ${ry}px) rotate(${angle}deg)`,
                              }
                            })}
                          </React.Fragment>
                        )
                      })}
                    </React.Fragment>
                  ))}
               </div>
            </div>
          )}
          </div>
        </div>

        {/* Legend in Zoom View */}
        <div className="shrink-0 py-4 px-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-6 sm:gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-t-lg border-b-2 border-blue-600 bg-blue-500" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Thường</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-t-lg border-b-2 border-amber-600 bg-amber-400" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">VIP</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-t-lg border-b-2 border-green-400 bg-green-500 ring-4 ring-green-400/50" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Đang chọn</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-t-lg border-2 border-red-500" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hết chỗ</span>
          </div>
        </div>
      </div>
    )
  }

  const renderLayout = () => {
    if (!parsedLayout || parsedLayout.length === 0) return null

    const hasNoSeats = !seatsLoading && (!seats || seats.length === 0)

    return (
      <div className="relative w-full group overflow-hidden rounded-[2rem]">
        {hasNoSeats && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-full text-xs font-bold shadow-lg animate-bounce">
            ⚠️ Không có dữ liệu ghế cho suất này. Chạy backend (port 3000) hoặc bật RLS SELECT cho bảng showtimes.
          </div>
        )}
        {zoomedSection && renderZoomedSectionView()}
        
        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-50">
          <button
            onClick={handleZoomIn}
            className="p-2 bg-white/90 backdrop-blur shadow-lg rounded-full border border-slate-200 hover:bg-white text-slate-600 transition-all active:scale-95"
            title="Phóng to"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 bg-white/90 backdrop-blur shadow-lg rounded-full border border-slate-200 hover:bg-white text-slate-600 transition-all active:scale-95"
            title="Thu nhỏ"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-2 bg-white/90 backdrop-blur shadow-lg rounded-full border border-slate-200 hover:bg-white text-slate-600 transition-all active:scale-95"
            title="Đặt lại"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        <div 
          ref={containerRef}
          className="relative mx-auto h-[600px] w-full max-w-6xl overflow-auto bg-slate-50 rounded-[2rem] border border-border shadow-xl custom-scrollbar"
        >
          {/* The Map Canvas */}
          <div 
            className="relative w-[2000px] h-[2000px] transition-transform duration-200 ease-out origin-center"
            style={{ transform: `scale(${scale})` }}
          >
            {/* Stage Visualization - Exactly at the center (1000, 1000) */}
            <div 
              className="absolute top-[1000px] left-[1000px] -translate-x-1/2 -translate-y-1/2 z-0 flex flex-col items-center pointer-events-none opacity-80"
              style={{
                width: `${240 * K}px`,
                height: `${60 * K}px`,
              }}
            >
              <div className="absolute inset-0 bg-primary/10 blur-[40px] rounded-full" />
              <div id="user-stage" className="relative w-full h-full bg-zinc-900 text-white rounded-xl font-black tracking-[0.3em] uppercase shadow-xl border border-white/10 flex flex-col items-center justify-center gap-1">
                <span style={{ fontSize: `${12 * K}px` }}>SÂN KHẤU</span>
                <div className="w-1/4 h-0.5 bg-white/20 rounded-full" />
              </div>
            </div>

            {/* Sections positioned relative to the center stage (1000, 1000) */}
            {parsedLayout
              .filter((sec) => sec.floor === activeFloor)
              .map((sec) => {
                const rows = parseInt(sec.rows) || 0
                const cols = parseInt(sec.cols) || 0
                
                // Precise Admin dimension calculation
                const adminW = sec.shape === "arc" 
                  ? (60 + (rows - 1) * 15) * 2 + 40 
                  : (cols * 14 + (cols - 1) * 4 + 32)
                const adminH = sec.shape === "arc" 
                  ? (60 + (rows - 1) * 15) + 60 
                  : (rows * 14 + (rows - 1) * 4 + 32)

                return (
                  <div
                    key={sec.id}
                    onClick={() => setZoomedSection(sec)}
                    className={cn(
                      "absolute transition-all duration-300 z-10 group/sec cursor-pointer hover:bg-slate-200/20 rounded-2xl",
                      sec.shape === "arc" ? "rounded-t-full" : "rounded-2xl"
                    )}
                    style={{
                      left: `${Math.round(1000 + (sec.x + adminW / 2) * K)}px`,
                      top: `${Math.round(1000 + (sec.y + adminH / 2) * K)}px`,
                      transform: `translateX(-50%) translateY(-50%) rotate(${sec.rotation}deg)`,
                      width: `${Math.round(adminW * K)}px`,
                      height: `${Math.round(adminH * K)}px`,
                      padding: `${Math.round(userPadding)}px`,
                    }}
                  >
                    {/* View Detail Overlay on Hover */}
                    <div className="absolute inset-0 opacity-0 group-hover/sec:opacity-100 transition-opacity bg-primary/5 flex items-center justify-center z-30 rounded-[inherit] pointer-events-none">
                       <div className="bg-white px-3 py-1.5 rounded-full shadow-lg border border-primary/20 flex items-center gap-2 text-[10px] font-bold text-primary animate-in fade-in slide-in-from-bottom-2 pointer-events-auto">
                          <Maximize2 className="w-3 h-3" />
                          CHI TIẾT
                       </div>
                    </div>

                    {/* Section Label */}
                    {sec.name && !isDefaultSectionName(sec.name) && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white border border-slate-200 text-slate-600 text-[10px] font-black rounded-full uppercase tracking-[0.15em] shadow-md z-20 whitespace-nowrap group-hover/sec:bg-primary group-hover/sec:text-white group-hover/sec:border-primary transition-all duration-300">
                        {sec.name}
                      </div>
                    )}

                    {sec.shape === "rectangle" ? (
                      <div
                        className="grid w-full h-full"
                        style={{
                          gridTemplateColumns: `repeat(${cols}, ${userSeatSize}px)`,
                          gap: `${userGap}px`,
                        }}
                      >
                        {Array.from({ length: rows }).map((_, r) =>
                          Array.from({ length: cols }).map((_, c) => {
                            const seat = getSeatBySectionPos(sec, r + 1, c + 1)
                            return (
                              <div key={`${sec.id}-${r}-${c}`} className="flex items-center justify-center">
                                {renderSeat(seat, sec.type, { showLabel: false })}
                              </div>
                            )
                          })
                        )}
                      </div>
                    ) : (
                      <div 
                        className="absolute inset-0 flex items-start justify-center"
                        style={{ paddingTop: `${10 * K}px` }}
                      >
                        <div className="relative h-full w-full overflow-visible">
                          {Array.from({ length: rows }).map((_, r) => (
                            <React.Fragment key={r}>
                              {Array.from({ length: cols }).map((_, i) => {
                                const total = cols
                                const angleSpread = 120 + r * 10
                                const angleStep = angleSpread / (total - 1 || 1)
                                const startAngle = -angleSpread / 2
                                const angle = startAngle + i * angleStep
                                const radius = (60 + r * 15) * K
                                const maxRadius = (60 + (rows - 1) * 15) * K
                                
                                const rx = Math.sin((angle * Math.PI) / 180) * radius
                                const ry = -Math.cos((angle * Math.PI) / 180) * radius + maxRadius

                                const seat = getSeatBySectionPos(sec, r + 1, i + 1)
                                
                                return (
                                  <React.Fragment key={`${sec.id}-${r}-${i}`}>
                                    {renderSeat(seat, sec.type, {
                                      showLabel: false,
                                      className: "absolute",
                                      style: {
                                        left: "50%",
                                        transform: `translate(${rx - userSeatSize/2}px, ${ry}px) rotate(${angle}deg)`,
                                      }
                                    })}
                                  </React.Fragment>
                                )
                              })}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
          </div>
        
        {/* Style for custom scrollbar */}
        <style dangerouslySetInnerHTML={{ __html: `
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(0,0,0,0.1);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(179,0,4,0.3);
          }
          .zoom-detail-scroll {
            overflow-anchor: none;
          }
          .zoom-detail-scroll::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          .zoom-detail-scroll::-webkit-scrollbar-thumb {
            background: rgba(0,0,0,0.12);
            border-radius: 10px;
          }
        `}} />
      </div>
    </div>
    )
  }

  return (
    <div className="w-full">
      {/* Floor Selection */}
      {floors.length > 1 && (
        <div className="mb-6 flex justify-center gap-2">
          {floors.map((floor) => (
            <button
              key={floor}
              onClick={() => setActiveFloor(floor)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                activeFloor === floor
                  ? "bg-primary text-white shadow-lg"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {floor}
            </button>
          ))}
        </div>
      )}

      {parsedLayout && parsedLayout.length > 0 ? (
        renderLayout()
      ) : (
        <>
          {/* Fallback to old grid if no layout provided */}
          <div className="relative mb-8">
            <div className="mx-auto w-full max-w-md">
              <div className="relative">
                <div className="h-3 rounded-t-full bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
                <div className="flex h-12 items-center justify-center rounded-b-lg bg-gradient-to-b from-primary/30 to-transparent">
                  <span className="text-sm font-medium tracking-widest text-foreground/70">
                    SÂN KHẤU
                  </span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 left-1/2 h-8 w-3/4 -translate-x-1/2 bg-primary/10 blur-xl" />
          </div>

          <div className="mx-auto max-w-4xl overflow-x-auto px-4">
            <div className="min-w-[600px] space-y-2 pb-4">
              {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"].map((row) => (
                <div key={row} className="flex items-center justify-center gap-1 sm:gap-2">
                  <span className="w-6 text-center text-xs font-medium text-muted-foreground sm:text-sm">
                    {row}
                  </span>
                  <div className="flex gap-1 sm:gap-1.5">
                    {Array.from({ length: 15 }, (_, i) => {
                      const seat = seats.find((s) => s.row === row && s.column === i + 1)
                      if (!seat) return <div key={i} className="h-6 w-6 sm:h-8 sm:w-8" />
                      return renderSeat(seat)
                    })}
                  </div>
                  <span className="w-6 text-center text-xs font-medium text-muted-foreground sm:text-sm">
                    {row}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Legend */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-6 px-4">
        <div className="flex items-center gap-3 bg-card p-2 px-4 rounded-xl border border-border shadow-sm">
          <div className="h-6 w-6 rounded-t-md border-b-2 border-blue-600 bg-blue-500 shadow-sm" />
          <span className="text-sm font-medium">Thường</span>
        </div>
        <div className="flex items-center gap-3 bg-card p-2 px-4 rounded-xl border border-border shadow-sm">
          <div className="h-6 w-6 rounded-t-md border-b-2 border-amber-600 bg-amber-400 shadow-sm" />
          <span className="text-sm font-medium">VIP</span>
        </div>
        <div className="flex items-center gap-3 bg-card p-2 px-4 rounded-xl border border-border shadow-sm">
          <div className="h-6 w-6 rounded-t-md border-b-2 border-green-400 bg-green-500 ring-4 ring-green-400/50 shadow-[0_0_20px_rgba(34,197,94,0.6)]" />
          <span className="text-sm font-medium">Đang chọn / giữ</span>
        </div>
        <div className="flex items-center gap-3 bg-card p-2 px-4 rounded-xl border border-border shadow-sm">
          <div className="h-6 w-6 rounded-t-md border border-slate-300 bg-slate-100 opacity-60" />
          <span className="text-sm font-medium text-muted-foreground">Locked (người khác)</span>
        </div>
        <div className="flex items-center gap-3 bg-card p-2 px-4 rounded-xl border border-border shadow-sm">
          <div className="h-6 w-6 rounded-t-md border-2 border-red-500 bg-transparent" />
          <span className="text-sm font-medium text-muted-foreground">Đã bán (Sold)</span>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground font-medium italic">
        * Bạn có thể chọn tối đa {maxSeats} ghế trong một lần đặt vé
      </p>
    </div>
  )
}
