import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    getDiscountCodes,
    getDiscountStats,
    createDiscountCode,
    deleteDiscountCode,
} from "../../api/discountApi";


const navItems = [
    { icon: "dashboard", label: "Dashboard" },
    { icon: "event", label: "Events" },
    { icon: "shopping_cart", label: "Orders" },
    { icon: "group", label: "Customers" },
    { icon: "confirmation_number", label: "Reports", active: true },
    { icon: "settings", label: "Settings" },
];

/*
const discountRows = [
    {
        code: "GROUPDEAL",
        type: "Bậc thang",
        value: "10-25%",
        used: "150",
        limit: "500",
        progress: 30,
        status: "Hoạt động",
        expired: false,
    },
    {
        code: "SUMMER24",
        type: "Phần trăm",
        value: "15%",
        used: "450",
        limit: "500",
        progress: 90,
        status: "Hoạt động",
        expired: false,
    },
    {
        code: "NEWBIE50K",
        type: "Cố định",
        value: "50.000 VNĐ",
        used: "1,234",
        limit: "∞",
        progress: null,
        status: "Hoạt động",
        expired: false,
    },
    {
        code: "EARLYBIRD",
        type: "Phần trăm",
        value: "20%",
        used: "100",
        limit: "100",
        progress: null,
        status: "Hết hạn",
        expired: true,
    },
];
*/

function MaterialIcon({ children, className = "" }) {
    return (
        <span className={`material-symbols-outlined ${className}`}>
            {children}
        </span>
    );
}

function formatNumber(value) {
    return new Intl.NumberFormat("vi-VN").format(Number(value || 0));
}


function formatMoney(value) {
    const numberValue = Number(value || 0);

    if (numberValue >= 1000000000) {
        return `${(numberValue / 1000000000).toFixed(1)}B`;
    }

    if (numberValue >= 1000000) {
        return `${(numberValue / 1000000).toFixed(1)}M`;
    }

    return new Intl.NumberFormat("vi-VN").format(numberValue);
}

//Hiển thị các thông số của mã giảm giá ở bảng thống kê.
function formatDiscountType(type) {
    const typeMap = {
        percentage: "Phần trăm",
        fixed: "Cố định",
        tiered: "Bậc thang",
    };

    return typeMap[type] || type || "";
}

function formatDiscountValue(row) {
    if (row.discount_type === "percentage") {
        return `${Number(row.discount_value || 0)}%`;
    }

    if (row.discount_type === "fixed") {
        return `${formatNumber(row.discount_value)} VNĐ`;
    }

    if (row.discount_type === "tiered") {
        const tiers = row.discount_code_tiers || [];

        if (tiers.length > 0) {
            const values = tiers.map((tier) => Number(tier.discount_value));
            const min = Math.min(...values);
            const max = Math.max(...values);

            if (min === max) {
                return `${max}%`;
            }

            return `${min}-${max}%`;
        }

        return "Theo bậc";
    }

    return "";
}

function formatStatus(status) {
    const statusMap = {
        active: "Hoạt động",
        expired: "Hết hạn",
        disabled: "Tạm tắt",
    };

    return statusMap[status] || status || "";
}

function getStatusClass(status) {
    if (status === "expired") return "expired";
    if (status === "disabled") return "expired";
    return "active";
}

export default function AdminDiscountManagement() {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [discountRows, setDiscountRows] = useState([]);
    const [stats, setStats] = useState({ activeCount: 0, totalUsed: 0, estimatedSaved: 0 });
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        code: "",
        discount_type: "percentage",
        discount_value: "",
        usage_limit: "",
        starts_at: "",
        expires_at: "",
        status: "active",
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [codesRes, statsRes] = await Promise.all([
                getDiscountCodes(),
                getDiscountStats(),
            ]);
            setDiscountRows(codesRes.data || []);
            setStats(statsRes.data || { activeCount: 0, totalUsed: 0, estimatedSaved: 0 });
        } catch (err) {
            console.error("Lỗi tải dữ liệu:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            await createDiscountCode({
                ...formData,
                discount_value: Number(formData.discount_value),
                usage_limit: formData.usage_limit === "" ? null : Number(formData.usage_limit),
                starts_at: formData.starts_at || null,
                expires_at: formData.expires_at || null,
            });
            setIsModalOpen(false);
            setFormData({ code: "", discount_type: "percentage", discount_value: "", usage_limit: "", starts_at: "", expires_at: "", status: "active" });
            loadData();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDelete = async (id, code) => {
        if (!window.confirm(`Xóa mã "${code}"?`)) return;
        try {
            await deleteDiscountCode(id);
            loadData();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="ticketrush-page">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        .ticketrush-page {
          min-height: 100vh;
          color: #191c1d;
          background-color: #f8f9fa;
          background-image: radial-gradient(#e1e3e4 1px, transparent 1px);
          background-size: 24px 24px;
        }

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          font-size: 24px;
          line-height: 1;
        }

        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          z-index: 50;
          width: 256px;
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border-right: 1px solid #e8bcb6;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .brand {
          padding: 24px;
        }

        .brand h1 {
          margin: 0;
          color: #b30004;
          font-size: 24px;
          line-height: 32px;
          letter-spacing: -0.02em;
          font-weight: 700;
        }

        .brand p,
        .admin-profile p,
        .nav-label,
        .table th,
        .stat-label {
          margin: 0;
        }

        .brand p {
          margin-top: 4px;
          color: #5f5e5e;
          font-size: 14px;
          line-height: 20px;
          font-weight: 600;
        }

        .nav {
          flex: 1;
          padding: 16px 0;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          color: #5f5e5e;
          text-decoration: none;
          transition: background 180ms ease, color 180ms ease;
        }

        .nav-link:hover {
          background: #e7e8e9;
        }

        .nav-link.active {
          color: #b30004;
          font-weight: 700;
          background: rgba(224, 13, 13, 0.1);
          border-right: 4px solid #b30004;
        }

        .nav-label {
          font-size: 14px;
          line-height: 20px;
          font-weight: 600;
        }

        .admin-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border-top: 1px solid #e8bcb6;
        }

        .admin-avatar {
          width: 40px;
          height: 40px;
          border-radius: 999px;
          border: 2px solid rgba(179, 0, 4, 0.2);
          object-fit: cover;
          background: #e1e3e4;
        }

        .admin-name {
          color: #191c1d;
          font-size: 14px;
          line-height: 20px;
          font-weight: 600;
        }

        .admin-role {
          color: #5f5e5e;
          font-size: 12px;
          line-height: 16px;
        }

        .topbar {
          position: fixed;
          top: 0;
          right: 0;
          z-index: 40;
          width: calc(100% - 256px);
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
          background: #f8f9fa;
          border-bottom: 1px solid #e8bcb6;
        }

        .search-wrap {
          position: relative;
          width: 100%;
          max-width: 448px;
        }

        .search-wrap .material-symbols-outlined {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #5e3f3a;
        }

        .search-input {
          width: 100%;
          border: 0;
          outline: 0;
          border-radius: 999px;
          background: #f3f4f5;
          color: #191c1d;
          font-size: 16px;
          line-height: 24px;
          padding: 8px 16px 8px 40px;
          transition: box-shadow 180ms ease, background 180ms ease;
        }

        .search-input:focus {
          background: #ffffff;
          box-shadow: 0 0 0 2px #b30004;
        }

        .top-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .icon-button {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 0;
          background: transparent;
          color: #191c1d;
          border-radius: 999px;
          padding: 8px;
          cursor: pointer;
          transition: background 180ms ease, color 180ms ease;
        }

        .icon-button:hover {
          background: #e7e8e9;
        }

        .notification-dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #b30004;
        }

        .main {
          min-height: calc(100vh - 64px);
          margin-left: 256px;
          padding: 40px;
          padding-top: 104px;
        }

        .page-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 32px;
        }

        .page-title {
          margin: 0;
          color: #191c1d;
          font-size: 24px;
          line-height: 32px;
          letter-spacing: -0.02em;
          font-weight: 700;
        }

        .page-subtitle {
          margin: 4px 0 0;
          color: #5f5e5e;
          font-size: 16px;
          line-height: 24px;
        }

        .primary-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 0;
          border-radius: 4px;
          background: #e00d0d;
          color: #ffffff;
          font-size: 16px;
          line-height: 24px;
          font-weight: 600;
          letter-spacing: 0.01em;
          padding: 12px 24px;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(179, 0, 4, 0.2);
          transition: filter 180ms ease, transform 120ms ease;
        }

        .primary-button:hover {
          filter: brightness(1.1);
        }

        .primary-button:active {
          transform: scale(0.95);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 24px;
          border: 1px solid #e8bcb6;
          border-radius: 8px;
          background: #ffffff;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
        }

        .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 12px;
        }

        .stat-icon.red {
          color: #b30004;
          background: rgba(179, 0, 4, 0.1);
        }

        .stat-icon.blue {
          color: #0053b7;
          background: rgba(0, 83, 183, 0.1);
        }

        .stat-icon.gray {
          color: #5f5e5e;
          background: rgba(71, 70, 70, 0.1);
        }

        .stat-label {
          color: #5f5e5e;
          font-size: 14px;
          line-height: 20px;
          font-weight: 600;
        }

        .stat-value {
          margin: 0;
          color: #191c1d;
          font-size: 24px;
          line-height: 32px;
          letter-spacing: -0.02em;
          font-weight: 700;
        }

        .currency {
          font-size: 14px;
          line-height: 20px;
          font-weight: 400;
        }

        .table-card {
          overflow: hidden;
          border: 1px solid #e8bcb6;
          border-radius: 8px;
          background: #ffffff;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
        }

        .table-scroll {
          overflow-x: auto;
        }

        .table {
          width: 100%;
          min-width: 880px;
          border-collapse: collapse;
          text-align: left;
        }

        .table thead tr {
          background: #f3f4f5;
          border-bottom: 1px solid #e8bcb6;
        }

        .table th {
          padding: 16px 24px;
          color: #5f5e5e;
          font-size: 14px;
          line-height: 20px;
          font-weight: 600;
        }

        .table th:last-child {
          text-align: right;
        }

        .table tbody tr {
          border-bottom: 1px solid #e8bcb6;
          transition: background 180ms ease, transform 120ms ease;
        }

        .table tbody tr:hover {
          background: #f8f9fa;
        }

        .table td {
          padding: 20px 24px;
          color: #191c1d;
          font-size: 16px;
          line-height: 24px;
          vertical-align: middle;
        }

        .code-badge {
          display: inline-flex;
          align-items: center;
          border: 1px solid #e8bcb6;
          border-radius: 4px;
          background: #e7e8e9;
          color: #191c1d;
          padding: 4px 12px;
          font-size: 14px;
          line-height: 20px;
          font-weight: 700;
        }

        .muted {
          opacity: 0.5;
        }

        .usage {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .usage strong {
          font-weight: 700;
        }

        .usage-limit {
          color: #5f5e5e;
        }

        .progress-track {
          width: 64px;
          height: 6px;
          overflow: hidden;
          border-radius: 999px;
          background: #edeeef;
        }

        .progress-fill {
          height: 100%;
          background: #b30004;
        }

        .status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 2px 10px;
          border-radius: 999px;
          font-size: 12px;
          line-height: 18px;
          font-weight: 700;
        }

        .status.active {
          color: #15803d;
          background: #dcfce7;
        }

        .status.expired {
          color: #5f5e5e;
          background: #e7e8e9;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: currentColor;
        }

        .row-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          opacity: 0;
          transition: opacity 180ms ease;
        }

        .table tbody tr:hover .row-actions {
          opacity: 1;
        }

        .row-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 0;
          border-radius: 4px;
          color: #5e3f3a;
          background: transparent;
          padding: 8px;
          cursor: pointer;
          transition: background 180ms ease, color 180ms ease;
        }

        .row-action:hover {
          background: #e7e8e9;
        }

        .row-action.delete:hover {
          color: #ba1a1a;
          background: #ffdad6;
        }

        .table-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 16px 24px;
          background: #f3f4f5;
        }

        .table-footer-text {
          color: #5f5e5e;
          font-size: 14px;
          line-height: 20px;
          font-weight: 600;
        }

        .pagination {
          display: flex;
          gap: 8px;
        }

        .page-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: 1px solid #e8bcb6;
          border-radius: 4px;
          background: #ffffff;
          color: #5f5e5e;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: background 180ms ease;
        }

        .page-button:hover {
          background: #edeeef;
        }

        .page-button.active {
          border-color: #b30004;
          background: #e00d0d;
          color: #ffffff;
        }

        .modal-root {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .modal-overlay {
          position: absolute;
          inset: 0;
          background: rgba(25, 28, 29, 0.4);
          backdrop-filter: blur(4px);
        }

        .modal-card {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 672px;
          max-height: 92vh;
          overflow: hidden;
          border-radius: 8px;
          background: #ffffff;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
        }

        .modal-header,
        .modal-footer {
          display: flex;
          align-items: center;
          border-color: #e8bcb6;
          background: #f8f9fa;
        }

        .modal-header {
          justify-content: space-between;
          padding: 24px 32px;
          border-bottom: 1px solid #e8bcb6;
        }

        .modal-title {
          margin: 0;
          color: #191c1d;
          font-size: 24px;
          line-height: 32px;
          letter-spacing: -0.02em;
          font-weight: 700;
        }

        .modal-body {
          display: grid;
          gap: 24px;
          overflow-y: auto;
          padding: 32px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 24px;
        }

        .field label {
          display: block;
          margin-bottom: 8px;
          color: #5f5e5e;
          font-size: 14px;
          line-height: 20px;
          font-weight: 600;
        }

        .field input,
        .field select {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #e8bcb6;
          outline: none;
          border-radius: 8px;
          background: #f1f5f9;
          color: #191c1d;
          font-size: 16px;
          line-height: 24px;
          padding: 12px 16px;
          transition: border 180ms ease;
        }

        .field input:focus,
        .field select:focus {
          border-color: #191c1d;
        }

        .field input.uppercase {
          text-transform: uppercase;
          font-weight: 700;
        }

        .helper-text {
          margin: 4px 0 0;
          color: #5f5e5e;
          font-size: 12px;
          line-height: 16px;
        }

        .input-suffix {
          position: relative;
        }

        .input-suffix span {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #5f5e5e;
          font-size: 14px;
          line-height: 20px;
          font-weight: 600;
        }

        .modal-footer {
          justify-content: flex-end;
          gap: 16px;
          padding: 24px 32px;
          border-top: 1px solid #e8bcb6;
        }

        .secondary-button {
          border: 0;
          border-radius: 4px;
          background: transparent;
          color: #5f5e5e;
          font-size: 16px;
          line-height: 24px;
          font-weight: 600;
          letter-spacing: 0.01em;
          padding: 12px 24px;
          cursor: pointer;
        }

        .secondary-button:hover {
          background: #e7e8e9;
        }

        @media (max-width: 960px) {
          .sidebar {
            width: 224px;
          }

          .topbar {
            width: calc(100% - 224px);
            padding: 0 24px;
          }

          .main {
            margin-left: 224px;
            padding-left: 24px;
            padding-right: 24px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 720px) {
          .sidebar {
            position: static;
            width: 100%;
            height: auto;
          }

          .topbar {
            position: static;
            width: 100%;
          }

          .main {
            margin-left: 0;
            padding: 24px;
          }

          .page-header,
          .table-footer {
            align-items: flex-start;
            flex-direction: column;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

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
                        className="flex items-center w-full px-6 py-3 space-x-3 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all active:translate-x-1 duration-200 font-sans font-medium text-sm text-left"
                    >
                        <span className="material-symbols-outlined">calendar_today</span>
                        <span>Sự kiện</span>
                    </button>

                    <button
                        onClick={() => navigate("/admin/usermanagement")}
                        className="flex items-center w-full px-6 py-3 space-x-3 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all active:translate-x-1 duration-200 font-sans font-medium text-sm text-left">
                        <span className="material-symbols-outlined">group</span>
                        <span>Người dùng</span>
                    </button>

                    <button
                        onClick={() => navigate("/admin/revenue")}
                        className="flex items-center w-full px-6 py-3 space-x-3 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all active:translate-x-1 duration-200 font-sans font-medium text-sm text-left">
                        <span className="material-symbols-outlined">analytics</span>
                        <span>Doanh thu</span>
                    </button>

                    <button
                        onClick={() => navigate("/admin/discount")}
                        className="flex items-center w-full px-6 py-3 space-x-3 bg-red-50 text-red-600 border-l-4 border-red-600 active:translate-x-1 duration-200 font-sans font-medium text-sm text-left"
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

            <header className="topbar">
                <div className="search-wrap">
                    <MaterialIcon>search</MaterialIcon>
                    <input
                        className="search-input"
                        placeholder="Tìm kiếm mã giảm giá..."
                        type="text"
                    />
                </div>

                <div className="top-actions">
                    <button className="icon-button" type="button" aria-label="Thông báo">
                        <MaterialIcon>notifications</MaterialIcon>
                        <span className="notification-dot" />
                    </button>

                    <button className="icon-button" type="button" aria-label="Tài khoản">
                        <MaterialIcon>account_circle</MaterialIcon>
                    </button>
                </div>
            </header>

            <main className="main">
                <div className="page-header">
                    <div>
                        <h2 className="page-title">Quản lý Mã giảm giá</h2>
                        <p className="page-subtitle">
                            Quản lý và theo dõi các chiến dịch ưu đãi vé sự kiện.
                        </p>
                    </div>

                    <button
                      onClick={() => navigate("/api/discount/create")}
                      className="bg-[#e00d0d] text-white px-6 py-2.5 rounded font-bold flex items-center gap-2 hover:bg-[#b30004] transition-all shadow-md active:scale-95"
                    >
                      <span className="material-symbols-outlined">add</span>
                      Tạo mã mới
                    </button>
                </div>

                <section className="stats-grid">
                  <div className="stat-card">
                      <div className="stat-icon red">
                          <MaterialIcon>verified</MaterialIcon>
                      </div>
                      <div>
                          <p className="stat-label">Mã đang hoạt động</p>
                          <p className="stat-value">
                              {loading ? "..." : formatNumber(stats.activeCount)}
                          </p>
                      </div>
                  </div>

                  <div className="stat-card">
                      <div className="stat-icon blue">
                          <MaterialIcon>analytics</MaterialIcon>
                      </div>
                      <div>
                          <p className="stat-label">Tổng lượt sử dụng</p>
                          <p className="stat-value">
                              {loading ? "..." : formatNumber(stats.totalUsed)}
                          </p>
                      </div>
                  </div>

                  <div className="stat-card">
                      <div className="stat-icon gray">
                          <MaterialIcon>savings</MaterialIcon>
                      </div>
                      <div>
                          <p className="stat-label">Doanh thu tiết kiệm</p>
                          <p className="stat-value">
                              {loading ? "..." : formatMoney(stats.estimatedSaved)}{" "}
                              <span className="currency">VNĐ</span>
                          </p>
                      </div>
                  </div>
              </section>

                <section className="table-card">
                    <div className="table-scroll">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Mã</th>
                                    <th>Loại</th>
                                    <th>Giá trị</th>
                                    <th>Lượt dùng / Giới hạn</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
{/*
                            <tbody>
                                {discountRows.map((row) => (
                                    <tr key={row.code}>
                                        <td>
                                            <span
                                                className={`code-badge ${row.expired ? "muted" : ""}`}
                                            >
                                                {row.code}
                                            </span>
                                        </td>

                                        <td className={row.expired ? "muted" : ""}>{row.type}</td>

                                        <td className={row.expired ? "muted" : ""}>
                                            {row.value}
                                        </td>

                                        <td className={row.expired ? "muted" : ""}>
                                            <div className="usage">
                                                <strong>{row.used}</strong>
                                                <span className="usage-limit">/ {row.limit}</span>

                                                {row.progress !== null && (
                                                    <div className="progress-track">
                                                        <div
                                                            className="progress-fill"
                                                            style={{ width: `${row.progress}%` }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        <td>
                                            <span
                                                className={`status ${row.expired ? "expired" : "active"
                                                    }`}
                                            >
                                                <span className="status-dot" />
                                                {row.status}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="row-actions">
                                                <button
                                                    className="row-action"
                                                    type="button"
                                                    aria-label={`Sửa ${row.code}`}
                                                >
                                                    <MaterialIcon>edit</MaterialIcon>
                                                </button>

                                                <button
                                                    className="row-action delete"
                                                    type="button"
                                                    aria-label={`Xóa ${row.code}`}
                                                >
                                                    <MaterialIcon>delete</MaterialIcon>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
*/}
                            <tbody>
                              {loading ? (
                                  <tr>
                                      <td colSpan="6" style={{ textAlign: "center", padding: "32px" }}>
                                          Đang tải dữ liệu...
                                      </td>
                                  </tr>
                              ) : discountRows.length === 0 ? (
                                  <tr>
                                      <td colSpan="6" style={{ textAlign: "center", padding: "32px" }}>
                                          Chưa có mã giảm giá nào.
                                      </td>
                                  </tr>
                              ) : (
                                  discountRows.map((row) => {
                                      const isExpired = row.status === "expired";
                                      const usedCount = Number(row.used_count || 0);
                                      const usageLimit = row.usage_limit;
                                      const progress =
                                          usageLimit && Number(usageLimit) > 0
                                              ? Math.min((usedCount / Number(usageLimit)) * 100, 100)
                                              : null;

                                      return (
                                          <tr key={row.id || row.code}>
                                              <td>
                                                  <span className={`code-badge ${isExpired ? "muted" : ""}`}>
                                                      {row.code}
                                                  </span>
                                              </td>

                                              <td className={isExpired ? "muted" : ""}>
                                                  {formatDiscountType(row.discount_type)}
                                              </td>

                                              <td className={isExpired ? "muted" : ""}>
                                                  {formatDiscountValue(row)}
                                              </td>

                                              <td className={isExpired ? "muted" : ""}>
                                                  <div className="usage">
                                                      <strong>{formatNumber(row.used_count)}</strong>

                                                      <span className="usage-limit">
                                                          /{" "}
                                                          {usageLimit === null || usageLimit === undefined
                                                              ? "∞"
                                                              : formatNumber(usageLimit)}
                                                      </span>

                                                      {progress !== null && (
                                                          <div className="progress-track">
                                                              <div
                                                                  className="progress-fill"
                                                                  style={{ width: `${progress}%` }}
                                                              />
                                                          </div>
                                                      )}
                                                  </div>
                                              </td>

                                              <td>
                                                  <span className={`status ${getStatusClass(row.status)}`}>
                                                      <span className="status-dot" />
                                                      {formatStatus(row.status)}
                                                  </span>
                                              </td>

                                              <td>
                                                <div className="row-actions">
                                                    <button
                                                        className="row-action delete"
                                                        type="button"
                                                        title={`Xóa ${row.code}`}
                                                        aria-label={`Xóa ${row.code}`}
                                                        onClick={() => handleDelete(row.id, row.code)}
                                                    >
                                                        <MaterialIcon>delete</MaterialIcon>
                                                    </button>
                                                </div>
                                            </td>
                                          </tr>
                                      );
                                  })
                              )}
                          </tbody>
                        </table>
                    </div>

                    <div className="table-footer">
                      <span className="table-footer-text">
                          Hiển thị {discountRows.length} mã
                      </span>
                        <div className="pagination">
                            <button
                                className="page-button"
                                type="button"
                                aria-label="Trang trước"
                            >
                                <MaterialIcon>chevron_left</MaterialIcon>
                            </button>

                            <button className="page-button active" type="button">
                                1
                            </button>

                            <button className="page-button" type="button">
                                2
                            </button>

                            <button className="page-button" type="button">
                                3
                            </button>

                            <button
                                className="page-button"
                                type="button"
                                aria-label="Trang sau"
                            >
                                <MaterialIcon>chevron_right</MaterialIcon>
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            {isModalOpen && (
                <div
                    className="modal-root"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="discount-modal-title"
                >
                    <button
                        className="modal-overlay"
                        type="button"
                        aria-label="Đóng modal"
                        onClick={() => setIsModalOpen(false)}
                    />

                    <div className="modal-card">
                        <div className="modal-header">
                            <h3 id="discount-modal-title" className="modal-title">
                                Tạo mã giảm giá mới
                            </h3>

                            <button
                                className="icon-button"
                                type="button"
                                aria-label="Đóng"
                                onClick={() => setIsModalOpen(false)}
                            >
                                <MaterialIcon>close</MaterialIcon>
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-grid">
                                <div className="field">
                                    <label>Tên mã (Code Name)</label>
                                    <input
                                        className="uppercase"
                                        placeholder="Ví dụ: TICKETRUSH50"
                                        type="text"
                                    />
                                </div>

                                <div className="field">
                                    <label>Loại giảm giá</label>

                                    <select defaultValue="percent">
                                        <option value="percent">Giảm theo phần trăm (%)</option>
                                        <option value="fixed">Giảm số tiền cố định (VNĐ)</option>
                                        <option value="tier">
                                            Giảm giá theo số lượng (Bậc thang)
                                        </option>
                                    </select>

                                    <p className="helper-text">
                                        Đặt quy tắc bậc thang (vd: đặt 5 ghế giảm 10%, đặt 10 ghế
                                        giảm 20%).
                                    </p>
                                </div>
                            </div>

                            <div className="form-grid">
                                <div className="field">
                                    <label>Giá trị giảm</label>

                                    <div className="input-suffix">
                                        <input placeholder="0" type="number" />
                                        <span>%</span>
                                    </div>
                                </div>

                                <div className="field">
                                    <label>Số lượt dùng tối đa</label>
                                    <input
                                        placeholder="Bỏ trống nếu không giới hạn"
                                        type="number"
                                    />
                                </div>
                            </div>

                            <div className="form-grid">
                                <div className="field">
                                    <label>Ngày bắt đầu</label>
                                    <input type="date" />
                                </div>

                                <div className="field">
                                    <label>Ngày kết thúc</label>
                                    <input type="date" />
                                </div>
                            </div>

                            <div className="form-grid">
                                <div className="field">
                                    <label>Giá trị đơn hàng tối thiểu</label>
                                    <input placeholder="0 VNĐ" type="number" />
                                </div>

                                <div className="field">
                                    <label>Mức giảm tối đa</label>
                                    <input placeholder="Không giới hạn" type="number" />
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                className="secondary-button"
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Hủy bỏ
                            </button>

                            <button className="primary-button" type="button">
                                Lưu thông tin
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}