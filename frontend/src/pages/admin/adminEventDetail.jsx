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

    return (
        <div className="tr-event-detail-root">
            <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");
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
          max-width: 1300px;
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
            grid-template-columns: 1fr 350px;
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

                    <div className="tr-header-content">
                        <div>
                            <div className="tr-meta-row">
                                <span className="tr-event-id">ID: {String(event.id).slice(0, 8)}</span>
                                <span className={`tr-status-badge ${event.status === 'published' ? 'tr-status-published' : 'tr-status-draft'}`}>
                                    {event.status === 'published' ? 'Đang hoạt động' : 'Bản nháp'}
                                </span>
                            </div>
                            <h2 className="tr-title">{event.name}</h2>
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
                    {/* Left Column */}
                    <div className="tr-main-info">
                        <h4 className="tr-section-title">Thông tin chi tiết</h4>

                        <div className="tr-info-grid">
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

                        <h4 className="tr-section-title">Mô tả sự kiện</h4>
                        <div className="tr-desc-text">
                            {event.description || "Chưa có mô tả cho sự kiện này."}
                        </div>

                        <div className="tr-table-container">
                            <h4 className="tr-section-title">Hạng vé & Trạng thái</h4>
                            <table className="tr-table">
                                <thead>
                                    <tr>
                                        <th>Loại vé</th>
                                        <th>Giá</th>
                                        <th>Số lượng</th>
                                        <th>Đã bán</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><strong>VIP Diamond</strong></td>
                                        <td>2.500.000đ</td>
                                        <td>500</td>
                                        <td>485</td>
                                    </tr>
                                    <tr>
                                        <td><strong>VIP Gold</strong></td>
                                        <td>1.800.000đ</td>
                                        <td>1.500</td>
                                        <td>1.200</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Standard</strong></td>
                                        <td>900.000đ</td>
                                        <td>8.000</td>
                                        <td>7.415</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <aside className="tr-sidebar">
                        <div className="tr-sidebar-box">
                            <h4 className="tr-section-title" style={{ marginBottom: '16px' }}>Sơ đồ ghế</h4>
                            <div className="tr-seat-preview-container tr-canvas-grid" style={{ height: '300px' }}>
                                <div className="tr-mini-seating">
                                    {event.layout_json && (
                                        <div style={{
                                            position: 'relative',
                                            width: '100%',
                                            height: '100%',
                                            transform: 'scale(0.2)',
                                            transformOrigin: 'center center',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <div style={{ position: 'relative', width: '1200px', height: '800px' }}>
                                                {(() => {
                                                    const layout = event.layout_json;
                                                    const sections = Array.isArray(layout) ? layout : (layout.sections || []);

                                                    return (
                                                        <>
                                                            <div style={{
                                                                position: 'absolute',
                                                                left: 600,
                                                                top: 400,
                                                                transform: 'translate(-50%, -50%)',
                                                                padding: '12px 60px',
                                                                backgroundColor: '#18181b',
                                                                color: 'white',
                                                                fontWeight: 'bold',
                                                                borderRadius: '6px',
                                                                fontSize: '32px',
                                                                whiteSpace: 'nowrap',
                                                                zIndex: 10,
                                                                boxShadow: '0 4px 30px rgba(0,0,0,0.5)'
                                                            }}>SÂN KHẤU</div>

                                                            {sections.map((sec) => (
                                                                <div key={sec.id} style={{
                                                                    position: 'absolute',
                                                                    left: 600 + sec.x,
                                                                    top: 400 + sec.y,
                                                                    transform: `rotate(${sec.rotation}deg)`,
                                                                    width: sec.shape === 'arc' ? `${(60 + ((sec.rows - 1) * 15)) * 2 + 40}px` : 'auto',
                                                                    height: sec.shape === 'arc' ? `${(60 + ((sec.rows - 1) * 15)) + 60}px` : 'auto',
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
                                                                                                    width: '14px',
                                                                                                    height: '14px',
                                                                                                    borderRadius: '2px',
                                                                                                    background: String(sec.type).toUpperCase() === 'VIP' ? '#0053b7' : '#b30004',
                                                                                                    transform: `translate(${rx - 7}px, ${ry}px) rotate(${angle}deg)`
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

                            <div className="tr-sidebar-footer">
                                <button className="tr-btn tr-btn-white" style={{ width: '100%', height: '36px', fontSize: '12px' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>grid_view</span>
                                    Xem sơ đồ chi tiết
                                </button>
                            </div>
                        </div>

                        <div className="tr-sidebar-box">
                            <h4 className="tr-section-title">Thống kê nhanh</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <div className="tr-info-label">Tổng doanh thu</div>
                                    <div className="tr-info-val" style={{ color: 'var(--tr-primary)', fontSize: '20px' }}>8.450.000.000đ</div>
                                </div>
                                <div>
                                    <div className="tr-info-label">Tỷ lệ lấp đầy</div>
                                    <div className="tr-info-val">85%</div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}