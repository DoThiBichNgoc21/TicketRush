import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEventById } from "../../api/eventApi";

export default function EventDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const data = await getEventById(id);
                setEvent(data.event);
            } catch (error) {
                console.error("Lỗi lấy chi tiết sự kiện:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    if (loading) return <div className="p-20 text-center font-medium text-secondary">Đang tải dữ liệu sự kiện...</div>;
    if (!event) return <div className="p-20 text-center font-medium text-secondary">Không tìm thấy sự kiện.</div>;

    const formatDate = (value) => {
        if (!value) return "Chưa có ngày";
        return new Date(value).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    //Kích thước ghế
    const layout = event.layout_json;
    const sections = layout
        ? Array.isArray(layout)
            ? layout
            : layout.sections || []
        : [];

    const totalSeats = sections.reduce((sum, sec) => {
        return sum + (Number(sec.rows) || 0) * (Number(sec.cols) || 0);
    }, 0);

    const getAutoScale = (seatCount) => {
        if (seatCount <= 50) return 2;
        if (seatCount <= 150) return 0.85;
        if (seatCount <= 300) return 0.72;
        if (seatCount <= 600) return 0.6;
        if (seatCount <= 1000) return 0.5;
        return 0.42;
    };

    const autoScale = getAutoScale(totalSeats);

    // Vị trí sân khấu và ghế ra giữa
    const STAGE_X = 600;
    const STAGE_Y = 400;

    const getLayoutBounds = (sections) => {
        const bounds = [
            {
                left: STAGE_X - 160,
                top: STAGE_Y - 45,
                right: STAGE_X + 160,
                bottom: STAGE_Y + 45,
            },
        ];

        sections.forEach((sec) => {
            const rows = Number(sec.rows) || 0;
            const cols = Number(sec.cols) || 0;

            const left = STAGE_X + (Number(sec.x) || 0) + 80;
            const top = STAGE_Y + (Number(sec.y) || 0) + 80;

            let width = 0;
            let height = 0;

            if (sec.shape === "arc") {
                const maxRadius = 60 + ((rows - 1) * 15);
                width = maxRadius * 2 + 40;
                height = maxRadius + 60;
            } else {
                width = cols * 14 + Math.max(cols - 1, 0) * 4 + 32;
                height = rows * 14 + Math.max(rows - 1, 0) * 4 + 32;
            }

            bounds.push({
                left,
                top,
                right: left + width,
                bottom: top + height,
            });
        });

        const left = Math.min(...bounds.map((b) => b.left));
        const top = Math.min(...bounds.map((b) => b.top));
        const right = Math.max(...bounds.map((b) => b.right));
        const bottom = Math.max(...bounds.map((b) => b.bottom));

        return {
            centerX: (left + right) / 2,
            centerY: (top + bottom) / 2,
        };
    };

    const layoutBounds = getLayoutBounds(sections);

    const layoutOffsetX = STAGE_X - layoutBounds.centerX + 40;
    const layoutOffsetY = STAGE_Y - layoutBounds.centerY;


    return (
        <div className="tr-event-detail-root">
            <style>{`
        
        @import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap");

        :root {
          --tr-surface-container-high: #e7e8e9;
          --tr-on-surface: #191c1d;
          --tr-secondary: #5f5e5e;
          --tr-surface-container-low: #f3f4f5;
          --tr-primary: #b30004;
          --tr-background: #f8f9fa;
          --tr-tertiary: #0053b7;
          --tr-surface-container-lowest: #ffffff;
          --tr-surface-container: #edeeef;
          --tr-on-primary: #ffffff;
          --tr-surface-container-highest: #e1e3e4;
        }

        .tr-event-detail-root {
          min-height: 100vh;
          background-color: var(--tr-background);
          color: var(--tr-on-surface);
          font-family: "Inter", sans-serif;
          padding: 40px 20px;
        }

        .tr-main-frame {
          max-width: 1600px;
          margin: 0 auto;
          background: white;
          border-radius: 24px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 20px 40px -20px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .tr-frame-header {
            padding: 40px 40px 20px;
            border-bottom: 1px solid var(--tr-surface-container-low);
        }

        .tr-back-link {
            display: flex;
            align-items: center;
            gap: 6px;
            color: var(--tr-secondary);
            font-size: 13px;
            font-weight: 600;
            text-decoration: none;
            margin-bottom: 24px;
            cursor: pointer;
            transition: color 0.2s;
        }

        .tr-back-link:hover {
            color: var(--tr-primary);
        }

        .tr-header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 24px;
        }

        .tr-meta-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .tr-event-id {
          color: var(--tr-secondary);
          font-size: 13px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .tr-status-badge {
          border-radius: 9999px;
          padding: 2px 10px;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .tr-status-published { background: #ecfdf5; color: #065f46; }
        .tr-status-draft { background: #fffbeb; color: #92400e; }

        .tr-title {
          margin: 0;
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .tr-actions {
          display: flex;
          gap: 12px;
        }

        .tr-btn {
          height: 44px;
          padding: 0 20px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid rgba(0,0,0,0.08);
        }

        .tr-btn-white { background: white; color: var(--tr-on-surface); }
        .tr-btn-white:hover { background: var(--tr-background); }
        .tr-btn-danger { background: var(--tr-primary); color: white; border: none; }
        .tr-btn-danger:hover { opacity: 0.9; }

        .tr-frame-content {
            padding: 40px;
            display: grid;
            grid-template-columns: 1fr 400px;
            gap: 40px;
        }

        .tr-section-title {
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--tr-secondary);
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .tr-info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 32px;
            margin-bottom: 48px;
        }

        .tr-info-card {
            display: flex;
            gap: 16px;
        }

        .tr-info-icon {
            width: 48px;
            height: 48px;
            background: var(--tr-background);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--tr-primary);
        }

        .tr-info-label {
            font-size: 11px;
            font-weight: 700;
            color: var(--tr-secondary);
            text-transform: uppercase;
            margin-bottom: 4px;
        }

        .tr-info-val {
            font-size: 16px;
            font-weight: 700;
        }

        .tr-desc-text {
            font-size: 15px;
            line-height: 1.6;
            color: var(--tr-secondary);
            padding: 24px;
            background: var(--tr-background);
            border-radius: 16px;
        }

        .tr-table-container {
            margin-top: 48px;
        }

        .tr-table {
            width: 100%;
            border-collapse: collapse;
        }

        .tr-table th {
            text-align: left;
            padding: 16px;
            font-size: 11px;
            font-weight: 800;
            color: var(--tr-secondary);
            text-transform: uppercase;
            border-bottom: 2px solid var(--tr-background);
        }

        .tr-table td {
            padding: 16px;
            border-bottom: 1px solid var(--tr-background);
            font-size: 14px;
        }

        .tr-sidebar {
            display: flex;
            flex-direction: column;
            gap: 40px;
        }

        .tr-sidebar-box {
            background: var(--tr-background);
            border-radius: 20px;
            padding: 24px;
        }

        .tr-canvas-grid {
          background-image: radial-gradient(circle, #e2e8f0 1.2px, transparent 1.2px);
          background-size: 20px 20px;
          background-color: white;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .tr-seat-preview-container {
            position: relative;
            aspect-ratio: 1.2;
            background: white;
            border-radius: 16px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            padding: 20px;
            overflow: hidden;
        }

        .tr-mini-seating {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            overflow: hidden;
        }

        .tr-sidebar-footer {
            margin-top: 16px;
            display: flex;
            justify-content: center;
        }

        @media (max-width: 900px) {
            .tr-frame-content { grid-template-columns: 1fr; }
        }
      `}</style>

            <div className="tr-main-frame">
                {/* Header Section */}
                <div className="tr-frame-header">
                    <div onClick={() => navigate("/admin/events")} className="tr-back-link">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
                        Quay lại danh sách
                    </div>

                    <div className="tr-header-content" style={{ alignItems: 'flex-end' }}>
                        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-end' }}>
                            {event.image_url && (
                                <img
                                    src={event.image_url}
                                    alt={event.name}
                                    style={{
                                        width: '280px',
                                        aspectRatio: '16/9',
                                        borderRadius: '16px',
                                        objectFit: 'cover',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                        border: '1px solid rgba(0,0,0,0.08)'
                                    }}
                                />
                            )}
                            <div style={{ paddingBottom: '4px' }}>
                                <div className="tr-meta-row">
                                    <span className="tr-event-id">ID: {String(event.id).slice(0, 8)}</span>
                                    <span className={`tr-status-badge ${event.status === 'published' ? 'tr-status-published' : 'tr-status-draft'}`}>
                                        {event.status === 'published' ? 'Đang hoạt động' : 'Bản nháp'}
                                    </span>
                                </div>
                                <h2 className="tr-title">{event.name}</h2>
                            </div>
                        </div>

                        <div className="tr-actions">
                            <button className="tr-btn tr-btn-white">
                                <span className="material-symbols-outlined">edit</span>
                                Chỉnh sửa
                            </button>
                            <button className="tr-btn tr-btn-danger">
                                <span className="material-symbols-outlined">delete</span>
                                Xóa sự kiện
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="tr-frame-content">
                    {/* Left Column (Sơ đồ ghế) */}
                    <div className="tr-main-info">
                        <div className="tr-sidebar-box" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <h4 className="tr-section-title" style={{ marginBottom: '16px' }}>Sơ đồ ghế</h4>
                            <div className="tr-seat-preview-container tr-canvas-grid" style={{ flex: 1, minHeight: '600px' }}>
                                <div className="tr-mini-seating">
                                    {event.layout_json && (
                                        <div style={{
                                            position: 'absolute',
                                            inset: 0,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <div style={{
                                                position: 'relative',
                                                width: '1200px',
                                                height: '800px',
                                                //transform: 'scale(0.65)',
                                                transform: 'scale(${autoScale})',
                                                //transform: `translate(${layoutOffsetX}px, ${layoutOffsetY}px) scale(${autoScale})`,
                                                transformOrigin: 'center center'
                                            }}>
                                                {(() => {
                                                    //const layout = event.layout_json;
                                                    //const sections = Array.isArray(layout) ? layout : (layout.sections || []);

                                                    return (
                                                        <>
                                                            <div style={{
                                                                position: 'absolute',
                                                                //left: 600,
                                                                //top: 400,
                                                                left: 600 + layoutOffsetX,
                                                                top: 400 + layoutOffsetY,
                                                                transform: 'translate(-50%, -50%)',
                                                                padding: '16px 40px',
                                                                backgroundColor: '#18181b',
                                                                color: 'white',
                                                                fontWeight: '900',
                                                                borderRadius: '8px',
                                                                fontSize: '14px',
                                                                letterSpacing: '0.1em',
                                                                textTransform: 'uppercase',
                                                                whiteSpace: 'nowrap',
                                                                zIndex: 10,
                                                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                                                border: '2px solid rgba(255, 255, 255, 0.2)'
                                                            }}>{event.name} / SÂN KHẤU</div>

                                                            {sections.map((sec) => (
                                                                <div key={sec.id} style={{
                                                                    position: 'absolute',
                                                                    //left: 600 + sec.x + 80,
                                                                    //top: 400 + sec.y + 80,
                                                                    left: 600 + sec.x + 80 + layoutOffsetX,
                                                                    top: 400 + sec.y + 80 + layoutOffsetY,
                                                                    transform: `rotate(${sec.rotation}deg)`,
                                                                    width: sec.shape === 'arc' ? `${(60 + ((sec.rows - 1) * 15)) * 2 + 40}px` : 'auto',
                                                                    height: sec.shape === 'arc' ? `${(60 + ((sec.rows - 1) * 15)) + 60}px` : 'auto',
                                                                    padding: '16px'
                                                                }}>
                                                                    {sec.shape === 'rectangle' ? (
                                                                        <div style={{
                                                                            display: 'grid',
                                                                            gap: '4px',
                                                                            gridTemplateColumns: `repeat(${sec.cols}, minmax(0, 1fr))`,
                                                                            width: 'max-content'
                                                                        }}>
                                                                            {Array.from({ length: sec.rows * sec.cols }).map((_, i) => (
                                                                                <div key={i} style={{
                                                                                    width: '14px',
                                                                                    height: '14px',
                                                                                    borderRadius: '2px',
                                                                                    background: String(sec.type).toUpperCase() === 'VIP' ? '#0053b7' : '#b30004'
                                                                                }}></div>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '40px' }}>
                                                                            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
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
                                                                                                <div key={`${r}-${i}`} style={{
                                                                                                    position: 'absolute',
                                                                                                    left: '50%',
                                                                                                    width: '12px',
                                                                                                    height: '12px',
                                                                                                    borderRadius: '2px',
                                                                                                    background: String(sec.type).toUpperCase() === 'VIP' ? '#0053b7' : '#b30004',
                                                                                                    transform: `translate(${rx - 6}px, ${ry}px) rotate(${angle}deg)`
                                                                                                }}></div>
                                                                                            );
                                                                                        })}
                                                                                    </React.Fragment>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar (Thông tin chi tiết) */}
                    <aside className="tr-sidebar">
                        <div className="tr-sidebar-box">
                            <h4 className="tr-section-title">Thông tin chi tiết</h4>
                            <div className="tr-info-grid" style={{ gridTemplateColumns: '1fr', gap: '24px', marginBottom: 0 }}>
                                <div className="tr-info-card">
                                    <div className="tr-info-icon">
                                        <span className="material-symbols-outlined">calendar_today</span>
                                    </div>
                                    <div>
                                        <div className="tr-info-label">Ngày & Giờ</div>
                                        <div className="tr-info-val">{formatDate(event.date)}</div>
                                        <div className="tr-info-val" style={{ fontWeight: 400, color: 'var(--tr-secondary)', fontSize: '14px' }}>
                                            {new Date(event.date).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>

                                <div className="tr-info-card">
                                    <div className="tr-info-icon">
                                        <span className="material-symbols-outlined">location_on</span>
                                    </div>
                                    <div>
                                        <div className="tr-info-label">Địa điểm</div>
                                        <div className="tr-info-val">{event.location?.split(',')[0]}</div>
                                        <div className="tr-info-val" style={{ fontWeight: 400, color: 'var(--tr-secondary)', fontSize: '14px' }}>
                                            {event.location}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div className="tr-sidebar-box">
                            <h4 className="tr-section-title">Mô tả sự kiện</h4>
                            <div className="tr-desc-text" style={{ padding: 0, background: 'transparent' }}>
                                {event.description || "Chưa có mô tả cho sự kiện này."}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}