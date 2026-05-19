import React, { useState, useMemo, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { ZoomIn, ZoomOut, RotateCcw, ArrowLeft, Maximize2 } from "lucide-react"

const seatStatusStyles = {
  available: "bg-blue-500 hover:bg-blue-600 hover:scale-110 cursor-pointer border-blue-600 text-white shadow-sm",
  vip: "bg-amber-400 hover:bg-amber-500 hover:scale-110 cursor-pointer border-amber-600 text-amber-950 shadow-md",
  selected: "bg-green-500 hover:bg-green-600 hover:scale-110 cursor-pointer border-green-400 ring-4 ring-green-400/50 text-white shadow-[0_0_20px_rgba(34,197,94,0.6)] z-20",
  sold: "bg-transparent border-2 border-red-500 cursor-not-allowed text-red-500 font-bold",
  locked: "bg-transparent border border-slate-300 cursor-not-allowed text-slate-300 opacity-40",
}

export function SeatMap({ seats = [], selectedSeats = [], onSeatClick, maxSeats = 8, layout = [] }) {
  const containerRef = useRef(null)
  const [scale, setScale] = useState(1)
  const [zoomedSection, setZoomedSection] = useState(null)

  // Constant scale factor relative to Admin's 14px seats
  const K = 1.6 
  const userSeatSize = Math.round(14 * K) // ~22px
  const userGap = 4 * K
  const userPadding = 16 * K

  // Parse layout if it's a string
  const parsedLayout = useMemo(() => {
    if (!layout) return []
    if (typeof layout === "string") {
      try {
        return JSON.parse(layout)
      } catch (e) {
        console.error("Error parsing layout_json:", e)
        return []
      }
    }
    return Array.isArray(layout) ? layout : []
  }, [layout])

  const [activeFloor, setActiveFloor] = useState(
    parsedLayout.length > 0 ? parsedLayout[0].floor : "Tầng 1"
  )

  // Auto-center the scroll container on mount or floor change
  useEffect(() => {
    if (containerRef.current && !zoomedSection) {
      const { scrollWidth, scrollHeight, clientWidth, clientHeight } = containerRef.current
      containerRef.current.scrollLeft = (scrollWidth - clientWidth) / 2
      containerRef.current.scrollTop = (scrollHeight - clientHeight) / 2
    }
  }, [activeFloor, scale, zoomedSection])

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 2))
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5))
  const handleResetZoom = () => setScale(1)

  const isSeatSelected = (seat) => {
    return selectedSeats.some((s) => s.id === seat.id)
  }

  const getSeatStatus = (seat) => {
    if (!seat) return "available"
    if (isSeatSelected(seat)) return "selected"
    if (seat.status === "sold" || seat.status === "locked") return seat.status
    
    const type = String(seat.type || "").toUpperCase()
    if (type === "VIP") return "vip"
    return "available"
  }

  const getSeatBySectionPos = (section, rowIdx, colIdx) => {
    if (!seats || seats.length === 0) return null

    const targetRowId = `${section.id}-${rowIdx}`
    const rowLetter = String.fromCharCode(64 + rowIdx)
    
    return seats.find((s) => {
      const sRow = String(s.row || "").trim()
      const sCol = Number(s.column)
      const sSection = String(s.section || "").trim()
      
      if (sRow === targetRowId && sCol === colIdx) return true
      
      const isMatchSection = sSection === section.name.trim() || s.section === section.id
      const isMatchRow = sRow === String(rowIdx) || sRow === rowLetter || sRow.endsWith(`-${rowIdx}`)
      const isMatchCol = sCol === colIdx

      return isMatchSection && isMatchRow && isMatchCol
    })
  }

  const floors = useMemo(() => {
    return [...new Set(parsedLayout.map((s) => s.floor))]
  }, [parsedLayout])

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

  const renderSeat = (seat, type = "Standard", extraProps = {}) => {
    const { className, style, showLabel = true, labelOverride = null } = extraProps
    
    if (!seat) {
      const typeStr = String(type || "").toUpperCase()
      const isVIP = typeStr === "VIP"
      const label = labelOverride !== null ? labelOverride : ""
      
      return (
        <div 
          className={cn(
            "rounded-t-lg border-b-2 flex items-center justify-center shadow-sm transition-all duration-200 font-bold",
            isVIP 
              ? "bg-amber-100 border-amber-300 text-amber-500" 
              : "bg-blue-50 border-blue-200 text-blue-400",
            className
          )}
          style={{ 
            width: `${userSeatSize}px`, 
            height: `${userSeatSize}px`,
            fontSize: `${Math.max(8, (style?.width ? parseInt(style.width) : userSeatSize) / 2.5)}px`,
            ...style 
          }}
          title="Vị trí này chưa có dữ liệu ghế"
        >
          {showLabel && label !== "" ? label : <div className="w-1.5 h-1.5 rounded-full bg-current opacity-30" />}
        </div>
      )
    }

    const status = getSeatStatus(seat)
    const isClickable = status === "available" || status === "vip" || status === "selected"

    return (
      <button
        key={seat.id}
        onClick={(e) => {
          e.stopPropagation()
          if (isClickable) onSeatClick(seat)
        }}
        disabled={!isClickable}
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
        title={`${seat.type} - Ghế ${seat.column} - ${seat.price.toLocaleString("vi-VN")}đ`}
      >
        {showLabel ? (labelOverride !== null ? labelOverride : seat.column) : ""}
      </button>
    )
  }

  const renderZoomedSectionView = () => {
    if (!zoomedSection) return null
    const sec = zoomedSection
    const rows = parseInt(sec.rows) || 0
    const cols = parseInt(sec.cols) || 0

    return (
      <div className="absolute inset-0 z-[100] bg-white flex flex-col p-8 overflow-auto animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => setZoomedSection(null)}
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

        <div className="flex-1 flex items-center justify-center min-h-[400px]">
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
                          <div key={`${r}-${c}`} className="flex items-center justify-center">
                            {renderSeat(seat, sec.type, {
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
            <div className="relative w-full max-w-4xl h-[500px] flex items-center justify-center bg-slate-50 rounded-[2rem] border border-slate-200 shadow-inner overflow-hidden">
               <div className="relative w-full h-full">
                  {/* Column Labels (Letters A, B, C...) at the inner head of each branch */}
                  {Array.from({ length: cols }).map((_, i) => {
                    const angleSpread = 120 // Matches first row (r=0)
                    const angleStep = angleSpread / (cols - 1 || 1)
                    const startAngle = -angleSpread / 2
                    const angle = startAngle + i * angleStep
                    const labelRadius = 100 // Adjusted relative to new inner radius 150
                    const lx = Math.sin((angle * Math.PI) / 180) * labelRadius
                    const ryOffset = (150 + (rows - 1) * 45)
                    const ly = -Math.cos((angle * Math.PI) / 180) * labelRadius + ryOffset

                    return (
                      <div 
                        key={`col-label-${i}`}
                        className="absolute left-1/2 top-[10%] text-[11px] font-black text-slate-500 uppercase flex items-center justify-center w-6 h-6"
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
                        const total = cols
                        const angleSpread = 120 + r * 10
                        const angleStep = angleSpread / (total - 1 || 1)
                        const startAngle = -angleSpread / 2
                        const angle = startAngle + i * angleStep
                        const radius = (150 + r * 45) // Increased from 120 + r * 30
                        const maxRadius = (150 + (rows - 1) * 45)
                        
                        const rx = Math.sin((angle * Math.PI) / 180) * radius
                        const ry = -Math.cos((angle * Math.PI) / 180) * radius + maxRadius

                        const seat = getSeatBySectionPos(sec, r + 1, i + 1)
                        
                        return (
                          <React.Fragment key={`${r}-${i}`}>
                            {renderSeat(seat, sec.type, {
                              className: "absolute",
                              labelOverride: r + 1,
                              style: {
                                left: "50%",
                                top: "10%",
                                width: '36px',
                                height: '36px',
                                fontSize: '12px',
                                transform: `translate(${rx - 18}px, ${ry}px) rotate(${angle}deg)`,
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

        {/* Legend in Zoom View */}
        <div className="mt-auto pt-8 flex items-center justify-center gap-8">
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

    return (
      <div className="relative w-full group overflow-hidden rounded-[2rem]">
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
                    <div className="absolute inset-0 opacity-0 group-hover/sec:opacity-100 transition-opacity bg-primary/5 flex items-center justify-center z-30 rounded-[inherit]">
                       <div className="bg-white px-3 py-1.5 rounded-full shadow-lg border border-primary/20 flex items-center gap-2 text-[10px] font-bold text-primary animate-in fade-in slide-in-from-bottom-2">
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
                              <div key={`${r}-${c}`} className="flex items-center justify-center">
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
                                  <React.Fragment key={`${r}-${i}`}>
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
          <span className="text-sm font-medium">Đang chọn</span>
        </div>
        <div className="flex items-center gap-3 bg-card p-2 px-4 rounded-xl border border-border shadow-sm">
          <div className="h-6 w-6 rounded-t-md border-2 border-red-500 bg-transparent" />
          <span className="text-sm font-medium text-muted-foreground">Hết chỗ</span>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground font-medium italic">
        * Bạn có thể chọn tối đa {maxSeats} ghế trong một lần đặt vé
      </p>
    </div>
  )
}
