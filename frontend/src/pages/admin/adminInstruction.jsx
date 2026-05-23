"use client";

//import React, { useState } from "react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function SupportContactAdmin() {
    const [activeTab, setActiveTab] = useState("guides");
    const navigate = useNavigate();

    const [articles, setArticles] = useState([]);
    const [selectedArticleId, setSelectedArticleId] = useState(null);

    const [formData, setFormData] = useState({
        title: "",
        category: "Khách hàng",
        status: "draft",
        content: "",
    });

    const [contactData, setContactData] = useState({
        hotline: "",
        supportEmail: "",
        officeAddress: "",
        facebookPage: "",
        instagramPage: "",
        zaloOaId: "",
    });

    const selectedArticle = articles.find(
        (article) => article.id === selectedArticleId
    );


    const handleInputFocus = (event) => {
        event.currentTarget.parentElement?.classList.add("scale-[1.01]");
    };

    const handleInputBlur = (event) => {
        event.currentTarget.parentElement?.classList.remove("scale-[1.01]");
    };

    const focusProps = {
        onFocus: handleInputFocus,
        onBlur: handleInputBlur,
    };


    const loadArticlesFromDatabase = async () => {
        const response = await fetch(`${API_BASE_URL}/api/admin/support/articles`);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Không thể tải danh sách bài viết.");
        }

        const mappedArticles = (result.data || []).map((item) => ({
            id: item.id,
            title: item.title,
            category: item.category_name,
            categoryCode: item.category_code,
            status: item.status,
            content: item.content || "",
            description: item.short_description || "",
            updatedAt: item.updated_at
                ? new Date(item.updated_at).toLocaleDateString("vi-VN")
                : "",
        }));

        setArticles(mappedArticles);
    };

    const loadContactFromDatabase = async () => {
        const response = await fetch(
            `${API_BASE_URL}/api/admin/support/articles/contact`
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Không thể tải thông tin liên hệ.");
        }

        const data = result.data || {};

        setContactData({
            hotline: data.hotline || "",
            supportEmail: data.support_email || "",
            officeAddress: data.office_address || "",
            facebookPage: data.facebook_page || "",
            instagramPage: data.instagram_page || "",
            zaloOaId: data.zalo_oa_id || "",
        });
    };

    useEffect(() => {
        const initData = async () => {
            try {
                await loadArticlesFromDatabase();
                await loadContactFromDatabase();
            } catch (error) {
                console.error(error);
            }
        };

        initData();
    }, []);

    const saveContactToDatabase = async (nextContactData) => {
        const response = await fetch(
            `${API_BASE_URL}/api/admin/support/articles/contact`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    hotline: nextContactData.hotline,
                    support_email: nextContactData.supportEmail,
                    office_address: nextContactData.officeAddress,
                    facebook_page: nextContactData.facebookPage,
                    instagram_page: nextContactData.instagramPage,
                    zalo_oa_id: nextContactData.zaloOaId,
                }),
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Không thể lưu thông tin liên hệ.");
        }

        return result.data;
    };

    const getCategoryCode = (categoryName) => {
        if (categoryName === "Khách hàng") return "CUSTOMER";
        if (categoryName === "Chính sách") return "POLICY";
        if (categoryName === "Ban tổ chức") return "ORGANIZER";
        return "CUSTOMER";
    };

    const saveArticleToDatabase = async () => {
        const payload = {
            title: formData.title,
            category_code: getCategoryCode(formData.category),
            category_name: formData.category,
            target_user: formData.category === "Ban tổ chức" ? "organizer" : "customer",
            short_description:
                formData.content.slice(0, 120) || "Chưa có mô tả nội dung.",
            content: formData.content,
            status: formData.status,
            sort_order: 0,
        };

        const url = selectedArticleId
            ? `${API_BASE_URL}/api/admin/support/articles/${selectedArticleId}`
            : `${API_BASE_URL}/api/admin/support/articles`;

        const method = selectedArticleId ? "PUT" : "POST";

        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Không thể lưu bài viết.");
        }

        return result.data;
    };
    const handleContactChange = (field, value) => {
        setContactData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleUpdateGeneralContact = async () => {
        try {
            if (!contactData.hotline.trim()) {
                alert("Vui lòng nhập số điện thoại tổng đài!");
                return;
            }

            if (!contactData.supportEmail.trim()) {
                alert("Vui lòng nhập email hỗ trợ!");
                return;
            }

            if (!contactData.officeAddress.trim()) {
                alert("Vui lòng nhập địa chỉ văn phòng!");
                return;
            }

            await saveContactToDatabase(contactData);
            await loadContactFromDatabase();

            alert("Đã lưu thông tin chung vào database!");
        } catch (error) {
            console.error(error);
            alert(error.message || "Lưu thông tin chung thất bại!");
        }
    };

    const handleUpdateSocialContact = async () => {
        try {
            await saveContactToDatabase(contactData);
            await loadContactFromDatabase();

            alert("Đã lưu mạng xã hội vào database!");
        } catch (error) {
            console.error(error);
            alert(error.message || "Lưu mạng xã hội thất bại!");
        }
    };

    const handleSelectArticle = (article) => {
        setSelectedArticleId(article.id);

        setFormData({
            title: article.title,
            category: article.category,
            status: article.status,
            content: article.content,
        });
    };

    /*
    const handleAddNew = () => {
        const newArticle = {
            id: Date.now(),
            title: "Bài viết mới",
            category: "Khách hàng",
            status: "draft",
            description: "Mô tả ngắn cho bài viết mới.",
            content: "",
            updatedAt: new Date().toLocaleDateString("vi-VN"),
        };

        setArticles((prev) => [newArticle, ...prev]);
        setSelectedArticleId(newArticle.id);

        setFormData({
            title: newArticle.title,
            category: newArticle.category,
            status: newArticle.status,
            content: newArticle.content,
        });
    };
    */
    const handleAddNew = () => {
        setSelectedArticleId(null);

        setFormData({
            title: "",
            category: "Khách hàng",
            status: "draft",
            content: "",
        });
    };

    /*
    const handleSave = () => {
        setArticles((prev) =>
            prev.map((article) =>
                article.id === selectedArticleId
                    ? {
                        ...article,
                        title: formData.title,
                        category: formData.category,
                        status: formData.status,
                        content: formData.content,
                        description:
                            formData.content.slice(0, 120) ||
                            "Chưa có mô tả nội dung.",
                        updatedAt: new Date().toLocaleDateString("vi-VN"),
                    }
                    : article
            )
        );

        alert("Đã lưu thay đổi!");
    };
    */

    const handleSave = async () => {
        try {
            if (!formData.title.trim()) {
                alert("Vui lòng nhập tiêu đề bài viết!");
                return;
            }

            if (!formData.content.trim()) {
                alert("Vui lòng nhập nội dung bài viết!");
                return;
            }

            const savedArticle = await saveArticleToDatabase();

            await loadArticlesFromDatabase();

            setSelectedArticleId(savedArticle.id);

            alert(selectedArticleId ? "Đã lưu thay đổi!" : "Đã thêm bài viết mới!");
        } catch (error) {
            console.error(error);
            alert(error.message || "Lưu bài viết thất bại!");
        }
    };

    const handleCancel = () => {
        if (!selectedArticle) return;

        setFormData({
            title: selectedArticle.title,
            category: selectedArticle.category,
            status: selectedArticle.status,
            content: selectedArticle.content,
        });
    };

    const handleDelete = async (articleId) => {
        const confirmed = window.confirm("Bạn có chắc muốn xóa bài viết này?");

        if (!confirmed) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/support/articles/${articleId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.message || "Xóa thất bại!");
            }

            const nextArticles = articles.filter((article) => article.id !== articleId);
            setArticles(nextArticles);

            if (selectedArticleId === articleId) {
                const firstArticle = nextArticles[0];

                if (firstArticle) {
                    setSelectedArticleId(firstArticle.id);
                    setFormData({
                        title: firstArticle.title,
                        category: firstArticle.category,
                        status: firstArticle.status,
                        content: firstArticle.content,
                    });
                } else {
                    setSelectedArticleId(null);
                    setFormData({
                        title: "",
                        category: "Khách hàng",
                        status: "draft",
                        content: "",
                    });
                }
            }
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    return (
        <div className="support-contact-admin bg-surface font-body-md text-on-surface min-h-screen">
            <style>{`
        
        @import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap");




        .support-contact-admin .text-label-sm {
          font-size: 14px;
          line-height: 20px;
          font-weight: 600;
        }

        .support-contact-admin .text-button {
          font-size: 16px;
          line-height: 24px;
          letter-spacing: 0.01em;
          font-weight: 600;
        }

        .support-contact-admin .text-h1 {
          font-size: 24px;
          line-height: 32px;
          letter-spacing: -0.02em;
          font-weight: 700;
        }

        .support-contact-admin.bg-surface,
        .support-contact-admin .bg-surface {
          background-color: #f8f9fa;
        }

        .support-contact-admin .bg-surface-container-low {
          background-color: #f3f4f5;
        }

        .support-contact-admin .bg-surface-container-high {
          background-color: #e7e8e9;
        }

        .support-contact-admin .bg-surface-container-highest {
          background-color: #e1e3e4;
        }

        .support-contact-admin .bg-secondary-container {
          background-color: #e5e2e1;
        }

        .support-contact-admin .bg-outline-variant {
          background-color: #e8bcb6;
        }

        .support-contact-admin .bg-primary {
          background-color: #b30004;
        }

        .support-contact-admin .bg-primary-container {
          background-color: #e00d0d;
        }

        .support-contact-admin .bg-inverse-surface {
          background-color: #2e3132;
        }

        .support-contact-admin .bg-surface\\/80 {
          background-color: rgb(248 249 250 / 0.8);
        }

        .support-contact-admin .bg-primary\\/5 {
          background-color: rgb(179 0 4 / 0.05);
        }

        .support-contact-admin.text-on-surface,
        .support-contact-admin .text-on-surface {
          color: #191c1d;
        }

        .support-contact-admin .text-primary {
          color: #b30004;
        }

        .support-contact-admin .text-secondary {
          color: #5f5e5e;
        }

        .support-contact-admin .text-on-primary {
          color: #ffffff;
        }

        .support-contact-admin .text-on-primary-container {
          color: #fff2f0;
        }

        .support-contact-admin .text-on-surface-variant {
          color: #5e3f3a;
        }

        .support-contact-admin .text-error {
          color: #ba1a1a;
        }

        .support-contact-admin .text-outline {
          color: #936e69;
        }

        .support-contact-admin .text-inverse-on-surface {
          color: #f0f1f2;
        }

        .support-contact-admin .text-primary\\/60 {
          color: rgb(179 0 4 / 0.6);
        }

        .support-contact-admin .border-outline-variant {
          border-color: #e8bcb6;
        }

        .support-contact-admin .border-primary\\/20 {
          border-color: rgb(179 0 4 / 0.2);
        }

        .support-contact-admin .hover\\:bg-secondary-container:hover {
          background-color: #e5e2e1;
        }

        .support-contact-admin .hover\\:bg-surface-container-low:hover {
          background-color: #f3f4f5;
        }

        .support-contact-admin .hover\\:text-primary:hover {
          color: #b30004;
        }

        .support-contact-admin .hover\\:text-error:hover {
          color: #ba1a1a;
        }

        .support-contact-admin .hover\\:border-primary:hover {
          border-color: #b30004;
        }

        .support-contact-admin .focus\\:ring-primary:focus {
          --tw-ring-color: #b30004;
        }

        .support-contact-admin .rounded {
          border-radius: 0.125rem;
        }

        .support-contact-admin .rounded-lg {
          border-radius: 0.25rem;
        }

        .support-contact-admin .rounded-xl {
          border-radius: 0.5rem;
        }

        .support-contact-admin .rounded-full {
          border-radius: 0.75rem;
        }

        .support-contact-admin .rounded-l-lg {
          border-top-left-radius: 0.25rem;
          border-bottom-left-radius: 0.25rem;
        }

        .support-contact-admin .rounded-r-lg {
          border-top-right-radius: 0.25rem;
          border-bottom-right-radius: 0.25rem;
        }

        .support-contact-admin .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        .support-contact-admin .material-symbols-outlined {
          font-family: "Material Symbols Outlined";
          font-weight: normal;
          font-style: normal;
          font-size: 24px;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          display: inline-block;
          white-space: nowrap;
          word-wrap: normal;
          direction: ltr;
          -webkit-font-feature-settings: "liga";
          -webkit-font-smoothing: antialiased;
          font-feature-settings: "liga";
          font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
        }

        .support-contact-admin .material-symbols-outlined.text-sm {
          font-size: 0.875rem;
          line-height: 1.25rem;
        }

        .support-contact-admin .material-symbols-outlined.text-lg {
          font-size: 1.125rem;
          line-height: 1.75rem;
        }

        .support-contact-admin .active-tab {
          border-bottom: 2px solid #b30004;
          color: #b30004;
        }

        .support-contact-admin .concert-pattern {
          background-color: #f8f9fa;
          background-image: radial-gradient(#e1e3e4 0.5px, transparent 0.5px);
          background-size: 24px 24px;
        }
      `}</style>

            {/* SideNavBar mới */}
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
                        className="flex items-center w-full px-6 py-3 space-x-3 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all active:translate-x-1 duration-200 font-sans font-medium text-sm text-left"
                    >
                        <span className="material-symbols-outlined">group</span>
                        <span>Người dùng</span>
                    </button>

                    <button
                        onClick={() => navigate("/admin/revenue")}
                        className="flex items-center w-full px-6 py-3 space-x-3 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all active:translate-x-1 duration-200 font-sans font-medium text-sm text-left"
                    >
                        <span className="material-symbols-outlined">analytics</span>
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
                        className="flex items-center w-full px-6 py-3 space-x-3 bg-red-50 text-red-600 border-l-4 border-red-600 active:translate-x-1 duration-200 font-sans font-medium text-sm text-left"
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

            {/* TopAppBar */}
            <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 bg-surface border-b border-outline-variant flex justify-between items-center px-8 z-40">
                <div className="flex items-center bg-surface-container-low px-0 py-0 rounded-full w-96">
                    
                </div>

                <div className="flex items-center gap-4">
                    <button
                        className="hover:bg-surface-container-low rounded-full p-2 transition-colors"
                        type="button"
                    >
                        <span className="material-symbols-outlined text-on-surface-variant">
                            
                        </span>
                    </button>

                    <button
                        className="hover:bg-surface-container-low rounded-full p-2 transition-colors"
                        type="button"
                    >
                        <span className="material-symbols-outlined text-on-surface-variant">
                            
                        </span>
                    </button>

                    <div className="h-8 w-[1px] bg-outline-variant mx-2" />

                    <div className="flex items-center gap-3">
                        <img
                        alt="Admin Avatar"
                        className="w-8 h-8 rounded-full border border-zinc-200"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBI4L469l41S96xmgUHO9nKcD6KjsjoY_CVrTYLhYJc2VbE_zW5HxkzmSHwIqlfM0KnEC-WL19TO9x8R9fX7DtyME_y5-8NbOLI0cLEZgatjSDfTB-PGQZHwDd-4U8ZPWilCGvdIHAvJQF51sUbFjEmPkKA55lVy0Rfz9PAzztd_7raBTqPbD3wEqqgDyb_VLrdTFN-bio2dOA5RPCapydLuVMsmSNR5t0_u-jS8bZqm99huUUyrRAWdmMK0fPkBAWoHA1ihXEDUyg"
                        />

                        <span className="text-sm font-semibold hidden lg:block">
                        System Admin
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Content Canvas */}
            <main className="ml-64 pt-16 min-h-screen concert-pattern">
                <div className="p-8 max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h2 className="font-h1 text-h1 text-on-surface mb-2">
                            Quản lý Hỗ trợ & Liên hệ
                        </h2>
                        <p className="text-secondary">
                            Cập nhật tài liệu hướng dẫn và thông tin liên hệ chính thức của
                            TicketRush.
                        </p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex gap-8 border-b border-outline-variant mb-8 bg-surface/80 backdrop-blur-sm sticky top-16 z-30 px-2">
                        <button
                            aria-pressed={activeTab === "guides"}
                            className={`py-4 font-button text-button transition-all ${activeTab === "guides"
                                ? "active-tab"
                                : "text-secondary hover:text-primary"
                                }`}
                            id="tab-guides"
                            onClick={() => setActiveTab("guides")}
                            type="button"
                        >
                            Hướng dẫn sử dụng
                        </button>

                        <button
                            aria-pressed={activeTab === "contact"}
                            className={`py-4 font-button text-button transition-all ${activeTab === "contact"
                                ? "active-tab"
                                : "text-secondary hover:text-primary"
                                }`}
                            id="tab-contact"
                            onClick={() => setActiveTab("contact")}
                            type="button"
                        >
                            Thông tin liên hệ
                        </button>
                    </div>

                    {/* Content Area */}
                    <div
                        className={`space-y-8 ${activeTab === "guides" ? "block" : "hidden"
                            }`}
                        id="guides-content"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Guide List */}
                            <div className="lg:col-span-1 space-y-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
                                        Danh sách bài viết
                                    </h3>

                                    <button
                                        className="flex items-center gap-1 text-primary font-button text-sm hover:underline"
                                        type="button"
                                        onClick={handleAddNew}
                                    >
                                        <span className="material-symbols-outlined text-sm">
                                            add
                                        </span>
                                        Thêm mới
                                    </button>
                                </div>
                                {/*
                                <div className="space-y-3">
                                    
                                    <div className="bg-white p-4 rounded-xl border border-outline-variant shadow-sm hover:border-primary cursor-pointer transition-all group">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="px-2 py-0.5 bg-surface-container-high rounded text-[10px] font-bold text-secondary uppercase">
                                                Khách hàng
                                            </span>

                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="material-symbols-outlined text-secondary text-lg hover:text-primary">
                                                    edit
                                                </span>
                                                <span className="material-symbols-outlined text-secondary text-lg hover:text-error">
                                                    delete
                                                </span>
                                            </div>
                                        </div>

                                        <h4 className="font-label-sm text-on-surface mb-1">
                                            Cách đặt vé và thanh toán
                                        </h4>

                                        <p className="text-xs text-secondary line-clamp-2">
                                            Hướng dẫn chi tiết các bước chọn sự kiện, chọn chỗ ngồi
                                            và hoàn tất thanh toán qua ví điện tử.
                                        </p>

                                        <div className="mt-3 text-[10px] text-outline italic">
                                            Cập nhật: 12/10/2023
                                        </div>
                                    </div>

                                    <div className="bg-white p-4 rounded-xl border border-primary/20 bg-primary/5 shadow-sm cursor-pointer transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="px-2 py-0.5 bg-primary-container text-on-primary-container rounded text-[10px] font-bold uppercase">
                                                Chính sách
                                            </span>

                                            <span className="material-symbols-outlined text-primary text-lg">
                                                check_circle
                                            </span>
                                        </div>

                                        <h4 className="font-label-sm text-primary mb-1">
                                            Chính sách hoàn trả & hủy vé
                                        </h4>

                                        <p className="text-xs text-secondary line-clamp-2">
                                            Quy định về việc hủy vé và thời gian hoàn tiền cho người
                                            mua trong các trường hợp đặc biệt.
                                        </p>

                                        <div className="mt-3 text-[10px] text-primary/60 italic">
                                            Đang chỉnh sửa
                                        </div>
                                    </div>

                                    <div className="bg-white p-4 rounded-xl border border-outline-variant shadow-sm hover:border-primary cursor-pointer transition-all group">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="px-2 py-0.5 bg-surface-container-high rounded text-[10px] font-bold text-secondary uppercase">
                                                Ban tổ chức
                                            </span>

                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="material-symbols-outlined text-secondary text-lg hover:text-primary">
                                                    edit
                                                </span>
                                                <span className="material-symbols-outlined text-secondary text-lg hover:text-error">
                                                    delete
                                                </span>
                                            </div>
                                        </div>

                                        <h4 className="font-label-sm text-on-surface mb-1">
                                            Tạo sự kiện mới cho đối tác
                                        </h4>

                                        <p className="text-xs text-secondary line-clamp-2">
                                            Quy trình đăng tải thông tin sự kiện và sơ đồ chỗ ngồi
                                            cho nhà tổ chức chuyên nghiệp.
                                        </p>

                                        <div className="mt-3 text-[10px] text-outline italic">
                                            Cập nhật: 05/10/2023
                                        </div>
                                    </div>
                                </div>
*/}
                                {/*
                                <div className="space-y-3">
                                    {articles.map((article) => {
                                        const isActive = article.id === selectedArticleId;

                                        return (
                                            <div
                                                key={article.id}
                                                className={`bg-white p-4 rounded-xl border shadow-sm cursor-pointer transition-all group ${isActive
                                                    ? "border-primary/20 bg-primary/5"
                                                    : "border-outline-variant hover:border-primary"
                                                    }`}
                                                onClick={() => handleSelectArticle(article)}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span
                                                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isActive
                                                            ? "bg-primary-container text-on-primary-container"
                                                            : "bg-surface-container-high text-secondary"
                                                            }`}
                                                    >
                                                        {article.category}
                                                    </span>

                                                    {isActive ? (
                                                        <span className="material-symbols-outlined text-primary text-lg">
                                                            check_circle
                                                        </span>
                                                    ) : (
                                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                type="button"
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    handleSelectArticle(article);
                                                                }}
                                                            >
                                                                <span className="material-symbols-outlined text-secondary text-lg hover:text-primary">
                                                                    edit
                                                                </span>
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    handleDelete(article.id);
                                                                }}
                                                            >
                                                                <span className="material-symbols-outlined text-secondary text-lg hover:text-error">
                                                                    delete
                                                                </span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                <h4
                                                    className={`font-label-sm mb-1 ${isActive ? "text-primary" : "text-on-surface"
                                                        }`}
                                                >
                                                    {article.title}
                                                </h4>

                                                <p className="text-xs text-secondary line-clamp-2">
                                                    {article.description}
                                                </p>

                                                <div
                                                    className={`mt-3 text-[10px] italic ${isActive ? "text-primary/60" : "text-outline"
                                                        }`}
                                                >
                                                    {isActive
                                                        ? "Đang chỉnh sửa"
                                                        : `Cập nhật: ${article.updatedAt}`}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
*/}
                                <div className="space-y-3">
                                    {articles.length === 0 ? (
                                        <div className="bg-white p-4 rounded-xl border border-outline-variant text-sm text-secondary">
                                            Chưa có bài viết nào. Hãy nhập nội dung bên phải rồi bấm “Lưu thay đổi”.
                                        </div>
                                    ) : (
                                        articles.map((article) => {
                                            const isActive = article.id === selectedArticleId;

                                            return (
                                                <div
                                                    key={article.id}
                                                    className={`bg-white p-4 rounded-xl border shadow-sm cursor-pointer transition-all group ${isActive
                                                        ? "border-primary/20 bg-primary/5"
                                                        : "border-outline-variant hover:border-primary"
                                                        }`}
                                                    onClick={() => handleSelectArticle(article)}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span
                                                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isActive
                                                                ? "bg-primary-container text-on-primary-container"
                                                                : "bg-surface-container-high text-secondary"
                                                                }`}
                                                        >
                                                            {article.category}
                                                        </span>

                                                        {isActive ? (
                                                            <span className="material-symbols-outlined text-primary text-lg">
                                                                check_circle
                                                            </span>
                                                        ) : (
                                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    type="button"
                                                                    onClick={(event) => {
                                                                        event.stopPropagation();
                                                                        handleSelectArticle(article);
                                                                    }}
                                                                >
                                                                    <span className="material-symbols-outlined text-secondary text-lg hover:text-primary">
                                                                        edit
                                                                    </span>
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={(event) => {
                                                                        event.stopPropagation();
                                                                        handleDelete(article.id);
                                                                    }}
                                                                >
                                                                    <span className="material-symbols-outlined text-secondary text-lg hover:text-error">
                                                                        delete
                                                                    </span>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <h4
                                                        className={`font-label-sm mb-1 ${isActive ? "text-primary" : "text-on-surface"
                                                            }`}
                                                    >
                                                        {article.title}
                                                    </h4>

                                                    <p className="text-xs text-secondary line-clamp-2">
                                                        {article.description}
                                                    </p>

                                                    <div
                                                        className={`mt-3 text-[10px] italic ${isActive ? "text-primary/60" : "text-outline"
                                                            }`}
                                                    >
                                                        {isActive
                                                            ? "Đang chỉnh sửa"
                                                            : `Cập nhật: ${article.updatedAt}`}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Editor Section */}
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-xl border border-outline-variant shadow-md flex flex-col h-full overflow-hidden">
                                    <div className="p-6 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
                                        <h3 className="font-h1 text-xl text-on-surface">
                                            {selectedArticleId ? "Chỉnh sửa bài viết" : "Thêm bài viết mới"}
                                        </h3>

                                        <div className="flex gap-3">
                                            <button
                                                className="px-4 py-2 text-secondary font-button text-sm border border-outline-variant rounded-lg hover:bg-white transition-colors"
                                                type="button"
                                                onClick={handleCancel}
                                            >
                                                Hủy
                                            </button>

                                            <button
                                                className="px-6 py-2 bg-primary text-on-primary font-button text-sm rounded-lg hover:opacity-90 transition-all active:scale-95"
                                                type="button"
                                                onClick={handleSave}
                                            >
                                                Lưu thay đổi
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-8 space-y-6 overflow-y-auto max-h-[700px]">
                                        <div className="space-y-2">
                                            <label
                                                className="font-label-sm text-on-surface"
                                                htmlFor="article-title"
                                            >
                                                Tiêu đề bài viết
                                            </label>

                                            <input
                                                className="w-full bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                                value={formData.title}
                                                id="article-title"
                                                type="text"
                                                onChange={(event) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        title: event.target.value,
                                                    }))
                                                }
                                                {...focusProps}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label
                                                    className="font-label-sm text-on-surface"
                                                    htmlFor="article-category"
                                                >
                                                    Danh mục
                                                </label>

                                                <select
                                                    className="w-full bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none appearance-none"
                                                    value={formData.category}
                                                    id="article-category"
                                                    onChange={(event) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            category: event.target.value,
                                                        }))
                                                    }
                                                    {...focusProps}
                                                >
                                                    <option>Chính sách</option>
                                                    <option>Khách hàng</option>
                                                    <option>Ban tổ chức</option>
                                                </select>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="font-label-sm text-on-surface">
                                                    Trạng thái
                                                </label>

                                                <div className="flex items-center h-[50px] gap-4 px-3 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            className="text-primary focus:ring-primary"
                                                            checked={formData.status === "published"}
                                                            name="status"
                                                            type="radio"
                                                            onChange={() =>
                                                                setFormData((prev) => ({
                                                                    ...prev,
                                                                    status: "published",
                                                                }))
                                                            }
                                                            {...focusProps}
                                                        />
                                                        <span className="text-sm">Công khai</span>
                                                    </label>

                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            className="text-primary focus:ring-primary"
                                                            checked={formData.status === "draft"}
                                                            name="status"
                                                            type="radio"
                                                            onChange={() =>
                                                                setFormData((prev) => ({
                                                                    ...prev,
                                                                    status: "draft",
                                                                }))
                                                            }
                                                            {...focusProps}
                                                        />
                                                        <span className="text-sm">Nháp</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label
                                                className="font-label-sm text-on-surface"
                                                htmlFor="article-content"
                                            >
                                                Nội dung chi tiết
                                            </label>

                                            <div className="border border-[#E2E8F0] rounded-lg overflow-hidden">
                                                {/* Toolbar */}
                                                <div className="bg-surface-container-high p-2 border-b border-outline-variant flex gap-2">
                                                    <button
                                                        className="p-1 hover:bg-white rounded transition-colors"
                                                        type="button"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">
                                                            format_bold
                                                        </span>
                                                    </button>

                                                    <button
                                                        className="p-1 hover:bg-white rounded transition-colors"
                                                        type="button"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">
                                                            format_italic
                                                        </span>
                                                    </button>

                                                    <button
                                                        className="p-1 hover:bg-white rounded transition-colors"
                                                        type="button"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">
                                                            format_list_bulleted
                                                        </span>
                                                    </button>

                                                    <div className="w-[1px] h-4 bg-outline-variant self-center" />

                                                    <button
                                                        className="p-1 hover:bg-white rounded transition-colors"
                                                        type="button"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">
                                                            link
                                                        </span>
                                                    </button>

                                                    <button
                                                        className="p-1 hover:bg-white rounded transition-colors"
                                                        type="button"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">
                                                            image
                                                        </span>
                                                    </button>
                                                </div>

                                                <textarea
                                                    className="w-full bg-white p-4 focus:ring-0 border-none outline-none resize-none font-body-md text-sm leading-relaxed"
                                                    value={formData.content}
                                                    id="article-content"
                                                    rows={12}
                                                    onChange={(event) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            content: event.target.value,
                                                        }))
                                                    }
                                                    {...focusProps}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Info Area */}
                    <div
                        className={activeTab === "contact" ? "block" : "hidden"}
                        id="contact-content"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* General Info Card */}
                            <div className="bg-white rounded-xl border border-outline-variant shadow-md overflow-hidden">
                                <div className="p-6 bg-surface-container-low border-b border-outline-variant flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">
                                        business
                                    </span>
                                    <h3 className="font-h1 text-xl text-on-surface">
                                        Thông tin cơ bản
                                    </h3>
                                </div>

                                <div className="p-8 space-y-6">
                                    <div className="space-y-2">
                                        <label
                                            className="font-label-sm text-on-surface"
                                            htmlFor="hotline"
                                        >
                                            Số điện thoại tổng đài
                                        </label>

                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-lg">
                                                call
                                            </span>

                                            <input
                                                className="w-full pl-10 pr-4 py-3 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                                value={contactData.hotline}
                                                id="hotline"
                                                type="text"
                                                placeholder="Nhập số điện thoại tổng đài"
                                                onChange={(event) =>
                                                    handleContactChange("hotline", event.target.value)
                                                }
                                                {...focusProps}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label
                                            className="font-label-sm text-on-surface"
                                            htmlFor="support-email"
                                        >
                                            Email hỗ trợ
                                        </label>

                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-lg">
                                                mail
                                            </span>

                                            <input
                                                className="w-full pl-10 pr-4 py-3 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                                value={contactData.supportEmail}
                                                id="support-email"
                                                type="email"
                                                placeholder="Nhập email hỗ trợ"
                                                onChange={(event) =>
                                                    handleContactChange("supportEmail", event.target.value)
                                                }
                                                {...focusProps}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label
                                            className="font-label-sm text-on-surface"
                                            htmlFor="office-address"
                                        >
                                            Địa chỉ văn phòng
                                        </label>

                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-3 top-3 text-secondary text-lg">
                                                location_on
                                            </span>

                                            <textarea
                                                className="w-full pl-10 pr-4 py-3 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none"
                                                value={contactData.officeAddress}
                                                id="office-address"
                                                rows={3}
                                                placeholder="Nhập địa chỉ văn phòng"
                                                onChange={(event) =>
                                                    handleContactChange("officeAddress", event.target.value)
                                                }
                                                {...focusProps}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        className="w-full py-3 bg-primary text-on-primary font-button rounded-lg hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                                        type="button"
                                        onClick={handleUpdateGeneralContact}
                                    >
                                        Cập nhật thông tin chung
                                    </button>
                                </div>
                            </div>

                            {/* Social Media Card */}
                            <div className="bg-white rounded-xl border border-outline-variant shadow-md overflow-hidden">
                                <div className="p-6 bg-surface-container-low border-b border-outline-variant flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">
                                        share
                                    </span>
                                    <h3 className="font-h1 text-xl text-on-surface">
                                        Mạng xã hội
                                    </h3>
                                </div>

                                <div className="p-8 space-y-6">
                                    <div className="space-y-2">
                                        <label
                                            className="font-label-sm text-on-surface"
                                            htmlFor="facebook-page"
                                        >
                                            Facebook Page
                                        </label>

                                        <div className="flex">
                                            <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-[#E2E8F0] bg-surface-container-high text-secondary text-sm">
                                                fb.com/
                                            </span>

                                            <input
                                                className="flex-1 px-4 py-3 bg-[#F1F5F9] border border-[#E2E8F0] rounded-r-lg focus:ring-2 focus:ring-primary outline-none"
                                                value={contactData.facebookPage}
                                                id="facebook-page"
                                                type="text"
                                                placeholder="ticketrush.official"
                                                onChange={(event) =>
                                                    handleContactChange("facebookPage", event.target.value)
                                                }
                                                {...focusProps}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label
                                            className="font-label-sm text-on-surface"
                                            htmlFor="instagram"
                                        >
                                            Instagram
                                        </label>

                                        <div className="flex">
                                            <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-[#E2E8F0] bg-surface-container-high text-secondary text-sm">
                                                instagr.am/
                                            </span>

                                            <input
                                                className="flex-1 px-4 py-3 bg-[#F1F5F9] border border-[#E2E8F0] rounded-r-lg focus:ring-2 focus:ring-primary outline-none"
                                                value={contactData.instagramPage}
                                                id="instagram"
                                                type="text"
                                                placeholder="ticketrush_vn"
                                                onChange={(event) =>
                                                    handleContactChange("instagramPage", event.target.value)
                                                }
                                                {...focusProps}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label
                                            className="font-label-sm text-on-surface"
                                            htmlFor="zalo-oa"
                                        >
                                            Zalo OA ID
                                        </label>

                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-lg">
                                                chat
                                            </span>

                                            <input
                                                className="w-full pl-10 pr-4 py-3 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                                value={contactData.zaloOaId}
                                                id="zalo-oa"
                                                type="text"
                                                placeholder="Nhập Zalo OA ID"
                                                onChange={(event) =>
                                                    handleContactChange("zaloOaId", event.target.value)
                                                }
                                                {...focusProps}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-10">
                                        <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 flex gap-4">
                                            <span className="material-symbols-outlined text-primary">
                                                info
                                            </span>

                                            <p className="text-xs text-secondary leading-relaxed">
                                                Các liên kết này sẽ hiển thị trực tiếp tại chân trang
                                                (footer) của website TicketRush.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        className="w-full py-3 bg-primary text-on-primary font-button rounded-lg hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                                        type="button"
                                        onClick={handleUpdateSocialContact}
                                    >
                                        Cập nhật mạng xã hội
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}