import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  return (
    <div className="bg-[#f8f9fa] text-[#191c1d] font-['Inter'] text-[16px] leading-[24px] overflow-hidden">
      <style>{`
            .material-symbols-outlined {
                font - variation - settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
            .custom-scrollbar::-webkit-scrollbar {
                width: 4px;
        }
            .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
        }
            .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #e1e3e4;
            border-radius: 10px;
        }
        `}</style>

            {/* Sidebar Navigation */}
            <aside className="h-screen w-64 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 fixed left-0 top-0 z-50 flex flex-col py-6 space-y-2">
                <div className="px-6 mb-8">
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">Cổng Quản Trị</h1>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-1">TicketRush HQ</p>
                </div>
                <nav className="flex-1 space-y-1">
                    <a className="flex items-center px-6 py-3 space-x-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-500 border-l-4 border-red-600 active:translate-x-1 duration-200 font-sans font-medium text-sm" href="#">
                        <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
                        <span>Bảng điều khiển</span>
                    </a>
                    <button
                        onClick={() => navigate("/admin/events")}
                        className="flex items-center px-6 py-3 space-x-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-100 transition-all active:translate-x-1 duration-200 font-sans font-medium text-sm w-full text-left"
                        >
                        <span className="material-symbols-outlined">calendar_today</span>
                        <span>Sự kiện</span>
                    </button>
                    <a className="flex items-center px-6 py-3 space-x-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-100 transition-all active:translate-x-1 duration-200 font-sans font-medium text-sm" href="#">
                        <span className="material-symbols-outlined" data-icon="group">group</span>
                        <span>Người dùng</span>
                    </a>
                    <a className="flex items-center px-6 py-3 space-x-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-100 transition-all active:translate-x-1 duration-200 font-sans font-medium text-sm" href="#">
                        <span className="material-symbols-outlined" data-icon="confirmation_number">confirmation_number</span>
                        <span>Vé</span>
                    </a>
                    <a className="flex items-center px-6 py-3 space-x-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-100 transition-all active:translate-x-1 duration-200 font-sans font-medium text-sm" href="#">
                        <span className="material-symbols-outlined" data-icon="analytics">analytics</span>
                        <span>Báo cáo</span>
                    </a>
                </nav>
                <div className="px-6 pt-6 border-t border-gray-200 dark:border-gray-800 space-y-1">
                    <a className="flex items-center py-2 space-x-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-all font-sans font-medium text-sm" href="#">
                        <span className="material-symbols-outlined" data-icon="help">help</span>
                        <span>Hỗ trợ</span>
                    </a>
                    <button 
                        onClick={() => navigate("/")}
                        className="flex items-center w-full py-2 space-x-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-all font-sans font-medium text-sm text-left"
                    >
                        <span className="material-symbols-outlined" data-icon="logout">logout</span>
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>
            {/* Main Content Area */}
            <main className="ml-64 flex-1 h-screen overflow-y-auto custom-scrollbar">
                {/* Top Navigation Bar */}
                <header className="sticky top-0 w-full flex items-center justify-between px-6 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm z-40 font-sans antialiased text-sm">
                    <div className="flex items-center space-x-8">
                        <div className="text-xl font-black tracking-tighter text-red-600 dark:text-red-500 uppercase">TicketRush</div>
                        <div className="relative w-96">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" data-icon="search">search</span>
                            <input className="w-full bg-gray-50 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary" placeholder="Tìm kiếm sự kiện, người dùng hoặc báo cáo..." type="text" />
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 mr-4">
                            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-xs font-semibold text-gray-500">HỆ THỐNG ĐANG HOẠT ĐỘNG</span>
                        </div>
                        <button className="p-2 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-full active:scale-95 duration-150">
                            <span className="material-symbols-outlined" data-icon="notifications">notifications</span>
                        </button>
                        <button className="p-2 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-full active:scale-95 duration-150">
                            <span className="material-symbols-outlined" data-icon="settings">settings</span>
                        </button>
                        <button
                            onClick={() => navigate("/admin/events/create/step-1")}
                            className="bg-[#b30004] text-white px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 active:scale-95 duration-150 hover:bg-red-800 transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg" data-icon="add">add</span>
                            <span>Tạo sự kiện</span>
                        </button>
                        <img alt="Admin profile" className="h-8 w-8 rounded-full border border-gray-200" data-alt="professional portrait of a middle-aged male administrator in a clean office environment" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkwAngUbmfRR2-wc5vUWZK4vZ7G2_YR78BAiOcpjs_z9f700laYOsTgNt2tL7C9n4pPFbmQK-d1bFLMWZlV6CS46BRWk3UJmZztDGJZFMRBGdo1zxMhIBDlDi1Nieqtjd18vyaMRL2nBoU3Uoxv8vC9uzMhmMKEhB-SU-wamaB8FXeswCoW7DS888vEvH8T-DVbMw9Br5AVWyzky8T8C9DSuJwKmUbTHThwerjkN31Z2HbTIOhdsP8AL26xtS4lU897B1Hu3M9mE8" />
                    </div>
                </header>
                <div className="p-8 space-y-[24px]">
                    {/* Stats Grid */}
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[20px]">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e8bcb6] flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-gray-500 font-semibold text-[14px] leading-[20px]">Tổng số vé đã bán</span>
                                    <span className="material-symbols-outlined text-[#b30004]" data-icon="confirmation_number">confirmation_number</span>
                                </div>
                                <div className="text-3xl font-bold text-[24px] leading-[32px] tracking-tight">128,432</div>
                                <div className="mt-4 flex items-center text-xs text-green-600 font-bold"><span className="material-symbols-outlined text-sm mr-1" data-icon="trending_up">trending_up</span>+12.5% so với tháng trước</div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e8bcb6] flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-gray-500 font-semibold text-[14px] leading-[20px]">Xu hướng doanh thu</span>
                                    <span className="material-symbols-outlined text-[#b30004]" data-icon="payments">payments</span>
                                </div>
                                <div className="text-3xl font-bold text-[24px] leading-[32px] tracking-tight">$2.4M</div>
                                <div className="mt-4 flex items-center space-x-1">
                                    <div className="h-8 flex items-end space-x-1 w-full">
                                        <div className="w-1/6 bg-[#b30004] opacity-20 h-2/5 rounded-t"></div>
                                        <div className="w-1/6 bg-[#b30004] opacity-40 h-3/5 rounded-t"></div>
                                        <div className="w-1/6 bg-[#b30004] opacity-60 h-2/5 rounded-t"></div>
                                        <div className="w-1/6 bg-[#b30004] opacity-80 h-4/5 rounded-t"></div>
                                        <div className="w-1/6 bg-[#b30004] opacity-100 h-5/5 rounded-t"></div>
                                        <div className="w-1/6 bg-[#b30004] opacity-90 h-3/5 rounded-t"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e8bcb6] flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-gray-500 font-semibold text-[14px] leading-[20px]">Tỷ lệ lấp đầy</span>
                                    <span className="material-symbols-outlined text-[#b30004]" data-icon="data_usage">data_usage</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="text-3xl font-bold text-[24px] leading-[32px] tracking-tight">84%</div>
                                    <div className="relative h-12 w-12">
                                        <svg className="h-full w-full transform -rotate-90">
                                            <circle className="text-gray-100" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeWidth="4"></circle>
                                            <circle className="text-[#b30004]" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeDasharray="125.6" strokeDashoffset="20" strokeWidth="4"></circle>
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 mt-4">Trên tất cả các địa điểm hoạt động</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e8bcb6] flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-gray-500 font-semibold text-[14px] leading-[20px]">Sự kiện đang hoạt động</span>
                                    <span className="material-symbols-outlined text-[#b30004]" data-icon="event_available">event_available</span>
                                </div>
                                <div className="text-3xl font-bold text-[24px] leading-[32px] tracking-tight">42</div>
                                <div className="mt-4 flex -space-x-2">
                                    <img alt="event" className="h-6 w-6 rounded-full ring-2 ring-white" data-alt="vibrant concert lights and crowd silhouette at a music festival" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsFQK_8FL_r1ybl0gOE5acU5ZiVWaly-3m52SCih1WbpFUQtzv9Vh54BiYTqitfpt8am9GqA5W2jNWk1jc30ZjvR8ld1TEDMIjgPyJI-hiNnMQxa3eLEExHSCa8kFzSgIK_4a_nJbXTatKVnrqHZyXdsRiqp5oZaEjuiZaNggfpDHoCWfEt_or0p1_JXvZxNKJ9HNjxeRH073f-pEr_FlAUpaskh1Xi2L6FMiwXL4sy-OPeuQnSpA6Np46O62GjVY7Esvs8NaJZPA" />
                                    <img alt="event" className="h-6 w-6 rounded-full ring-2 ring-white" data-alt="energetic performance on stage with laser lights and theatrical smoke" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTdC5ixFDEyvpJcFdN-oBaCeV_fHCH9oiLlxhpi0_b2rE1_01WBwTudjwzemEC13oRtOyS-jZanjB2gNI26jQLF4GeOU1Okz8CQNFvxK9brXtLKsCTJfJaSXM-NmgIbT4CAz0Ofxe6jXFM2sKQy-c3juzHjJtacpy6rzj8gwiRlRPLHys0xkKcK99xP-wnkM0KGxmj9PhJelQ29Hgn6mNLzrhXSY6TaQ8rOkDQnengmWEQ8WZLXLEcHPAl3RZ0N1MQUaCcrQz9MDY" />
                                    <img alt="event" className="h-6 w-6 rounded-full ring-2 ring-white" data-alt="outdoor summer festival with colorful bunting and people gathering at sunset" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBocokzje3v5naNabN91lc0Z1fYkDocUcZPwzgb5DbaOnSs4RuRul-P1F3vt9V_By7uIA-RmGWxMK16gPlJRqvXViCoWCGL1HVAQZxlEy3-X_9uIcXwhEZh5F0ULDtiihRM1J6BBQerKKgrM2KNVFaD2hgFU9Yn_2dKrGdqiHBM67itE-RByPIjIPAWXV6LNdtZ-vI_jvQVKZG3xMqpjmqKBnGNS_Na6t-v7wF47YQtzjh0cPqdHUdc1y23VLJxteVqM6FJD5Wn9dQ" />
                                    <div className="h-6 w-6 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-[10px] font-bold">+39</div>
                                </div>
                            </div>
                        </div>
                    </section>
                    {/* Demographics & Detail Grids */}
                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-[20px]">
                        {/* Age Demographics */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-[#e8bcb6]">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="font-bold text-[24px] leading-[32px] tracking-tight text-xl">Nhân khẩu học khán giả</h2>
                                <div className="flex space-x-2">
                                    <span className="px-3 py-1 bg-gray-100 rounded text-xs font-bold">NHÓM TUỔI</span>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-gray-500">
                                        <span>18-24</span>
                                        <span>45%</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#b30004] w-[45%]"></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-gray-500">
                                        <span>25-34</span>
                                        <span>32%</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#b30004] w-[32%] opacity-80"></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-gray-500">
                                        <span>35-44</span>
                                        <span>15%</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#b30004] w-[15%] opacity-60"></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-gray-500">
                                        <span>45+</span>
                                        <span>8%</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#b30004] w-[8%] opacity-40"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Gender Breakdown */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e8bcb6] flex flex-col">
                            <h2 className="font-bold text-[24px] leading-[32px] tracking-tight text-xl mb-8">Nhân khẩu học khán giả</h2>
                            <div className="flex-1 flex flex-col justify-center items-center">
                                <div className="relative h-48 w-48 flex items-center justify-center">
                                    <svg className="h-full w-full" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" fill="transparent" r="40" stroke="#f1f5f9" strokeWidth="20"></circle>
                                        <circle cx="50" cy="50" fill="transparent" r="40" stroke="#b30004" strokeDasharray="125 251.2" strokeWidth="20"></circle>
                                        <circle cx="50" cy="50" fill="transparent" r="40" stroke="#5f5e5e" strokeDasharray="60 251.2" strokeDashoffset="-125" strokeWidth="20"></circle>
                                        <circle cx="50" cy="50" fill="transparent" r="40" stroke="#e1e3e4" strokeDasharray="66.2 251.2" strokeDashoffset="-185" strokeWidth="20"></circle>
                                    </svg>
                                    <div className="absolute flex flex-col items-center">
                                        <span className="text-2xl font-bold">52%</span>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase">Female</span>
                                    </div>
                                </div>
                                <div className="mt-8 grid grid-cols-3 gap-4 w-full">
                                    <div className="flex flex-col items-center">
                                        <span className="h-2 w-2 rounded-full bg-[#b30004] mb-1"></span>
                                        <span className="text-[10px] font-bold text-gray-500">52% F</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="h-2 w-2 rounded-full bg-[#5f5e5e] mb-1"></span>
                                        <span className="text-[10px] font-bold text-gray-500">24% M</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="h-2 w-2 rounded-full bg-[#e1e3e4] mb-1"></span>
                                        <span className="text-[10px] font-bold text-gray-500">24% O</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    {/* Recent Events Table */}
                    <section className="bg-white rounded-xl shadow-sm border border-[#e8bcb6] overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="font-bold text-[24px] leading-[32px] tracking-tight text-xl">Hiệu suất sự kiện gần đây</h2>
                            <button className="text-[#b30004] font-bold text-sm hover:underline">Xem tất cả sự kiện</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-[10px] uppercase tracking-wider font-bold text-gray-500">
                                    <tr>
                                        <th className="px-6 py-4">Chi tiết sự kiện</th>
                                        <th className="px-6 py-4">Trạng thái</th>
                                        <th className="px-6 py-4">Lấp đầy</th>
                                        <th className="px-6 py-4 text-right">Tổng doanh thu</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    <tr className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="h-10 w-10 rounded-lg overflow-hidden flex-shrink-0">
                                                    <img className="h-full w-full object-cover" data-alt="energetic rock concert atmosphere with intense red stage lighting and blurred audience hands" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXedMCdx7mzwdpu3dZ6wV6corugBTlLpWou7xVvD1UCS7JfEXhjNRuxMpTtX7UKDORg9nUzQs84ATCufz1GyYGm6KEO0_Ev0uzKfDvj_cYn131RmG-6hrkLIM_eczJktiLTEQewAO9YmVtDm6-rLwsBsyXJpw2qQE3iFTBttYmLF11c402HwCZb1lbrK3hryAAvO5ktVDid4nFahB1Pnv-beRpsJ2n0plLRR9YKRbe678zcPd9EjByScJN8DwlQPT2LVJVTzNpAbc" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900">Electric Horizon Tour</div>
                                                    <div className="text-xs text-gray-500">Metro Arena • Oct 12, 2023</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700">HOẠT ĐỘNG</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <div className="flex-1 h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-[#b30004] w-[92%]"></div>
                                                </div>
                                                <span className="text-xs font-bold text-gray-700">92%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-bold text-gray-900">$425,000.00</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 text-gray-400 hover:text-[#b30004] transition-colors">
                                                <span className="material-symbols-outlined" data-icon="more_vert">more_vert</span>
                                            </button>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="h-10 w-10 rounded-lg overflow-hidden flex-shrink-0">
                                                    <img className="h-full w-full object-cover" data-alt="classical music concert with orchestra and violinist spotlighted on a grand wooden stage" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdxWQwFt4fUVBgReoUC7RnKYN7KHTupHEdh4vkm4Aipp9htUrRP-BzeDks0DxYV7Z74eg65MC6Ys9jXBvfl4sikPq7mfZz1-lEtS9yjWEbosicCqZXKP7ZR1HvKomcRdEGXGtomBwv-19OtQ2z0kFnqsKK1zT24JASDJo4Vi8JP3LDF1udnShaatWO5zxLxvsS-SCr4Awtr4hL1Wf5D-J5ExePNlmB19QYopBUPQM2rpDkzhRnlqPCrnMpq9X6ClthSvrC61cquHI" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900">Symphony in the Park</div>
                                                    <div className="text-xs text-gray-500">Central Park • Oct 15, 2023</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-700">SẮP DIỄN RA</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <div className="flex-1 h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-[#b30004] w-[45%]"></div>
                                                </div>
                                                <span className="text-xs font-bold text-gray-700">45%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-bold text-gray-900">$182,500.00</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 text-gray-400 hover:text-[#b30004] transition-colors">
                                                <span className="material-symbols-outlined" data-icon="more_vert">more_vert</span>
                                            </button>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="h-10 w-10 rounded-lg overflow-hidden flex-shrink-0">
                                                    <img className="h-full w-full object-cover" data-alt="professional technology conference with speaker at podium and large screen showing data visualizations" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIVLz_aKqqXs7DPCAl2CnQaD6REQJWBRDtp79G-87GmHpAW8wzYV99goHJPTVM28MZRdf5wx4X_DIkWiIPa2LmJA2JjFdgkx-SvmpxTyVEy5t-be2zg1PN_Pk6FgG97HXR-gVh0LvmBaLCoUYlkCpKilC3FQF4CZ9mwLvE76nG-xFV7vVKeacEVrAQVOY3zEroqe7t3213B-PxmffotP09ZKMvYqSqIPhCNEkCiVt9IShOVyhAcoofVJMjtW19X_WQGewr5KxGwVE" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900">Tech Summit 2023</div>
                                                    <div className="text-xs text-gray-500">Expo Center • Oct 20, 2023</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700">HOẠT ĐỘNG</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <div className="flex-1 h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-[#b30004] w-[78%]"></div>
                                                </div>
                                                <span className="text-xs font-bold text-gray-700">78%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-bold text-gray-900">$940,000.00</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 text-gray-400 hover:text-[#b30004] transition-colors">
                                                <span className="material-symbols-outlined" data-icon="more_vert">more_vert</span>
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </main>
        
    </div>
  );
}
