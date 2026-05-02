import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const DEFAULT_PREVIEW =
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1200&auto=format&fit=crop";

function CreateEventStep1() {
  const navigate = useNavigate();

  const savedStep1 =
    JSON.parse(localStorage.getItem("create_event_step_1")) || {};

  const [form, setForm] = useState(
    savedStep1.form || {
      name: "",
      category: "",
      description: "",
    }
  );

  const [imageFile, setImageFile] = useState(null);
  const [previewSrc, setPreviewSrc] = useState(
    savedStep1.previewSrc || DEFAULT_PREVIEW
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const saveStep1 = (newForm, newPreviewSrc = previewSrc) => {
    localStorage.setItem(
      "create_event_step_1",
      JSON.stringify({
        form: newForm,
        previewSrc: newPreviewSrc,
      })
    );
  };

  const handleChange = (e) => {
    const updatedForm = {
      ...form,
      [e.target.name]: e.target.value,
    };

    setForm(updatedForm);
    saveStep1(updatedForm);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      setPreviewSrc(result);
      saveStep1(form, result);
    };

    reader.readAsDataURL(file);
  };

  const handleNext = async () => {
    setError("");

    if (!form.name.trim() || !form.category.trim()) {
      setError("Vui lòng nhập tên sự kiện và loại sự kiện.");
      return;
    }

    saveStep1(form, previewSrc);

    const adminId = parseInt(localStorage.getItem("admin_id"), 10);

    if (!adminId) {
      setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/api/admin/events/step-1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          created_by: adminId,
          name: form.name,
          description: form.description,
          date: new Date().toISOString(),
          location: "Chưa xác định",
          category: form.category,
          image_url: null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Không thể tạo sự kiện.");
      }

      localStorage.setItem("draft_event_id", data.event.id);
      localStorage.setItem("draft_event_name", form.name);

      if (imageFile || savedStep1.previewSrc) {
        localStorage.setItem("draft_event_has_image", "true");
      }

      navigate("/admin/events/create/step-2");
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra, thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

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

          <div className="h-8 w-px bg-slate-200 mx-2" />

          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">
            <span className="material-symbols-outlined text-lg">
              support_agent
            </span>
            Support
          </button>

          <img
            alt="Admin avatar"
            className="w-8 h-8 rounded-full border border-slate-200 ml-2"
            src="https://i.pravatar.cc/100?img=12"
          />
        </div>
      </header>

      <main className="pt-16 min-h-screen bg-[#f8f9fa] flex justify-center">
        <div className="w-full max-w-6xl px-6 py-10">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-10">
            <div className="mb-10">
              <h1 className="text-2xl font-bold mb-2">Tạo sự kiện mới</h1>
              <p className="text-slate-500">
                Bắt đầu bằng việc cung cấp các thông tin cơ bản về sự kiện của
                bạn.
              </p>
            </div>

            <div className="mb-12">
              <div className="flex items-center justify-between">
                <Step number="1" label="Thông tin chung" active />
                <div className="flex-1 h-0.5 bg-slate-200 mx-4 -mt-6" />
                <Step number="2" label="Thời gian & Địa điểm" />
                <div className="flex-1 h-0.5 bg-slate-200 mx-4 -mt-6" />
                <Step number="3" label="Cấu hình vé" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-10">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">
                    error
                  </span>
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Tên sự kiện <span className="text-red-600">*</span>
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Nhập tên sự kiện của bạn..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-red-700 focus:border-red-700 outline-none placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Loại sự kiện <span className="text-red-600">*</span>
                    </label>

                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-red-700 focus:border-red-700 outline-none"
                    >
                      <option value="">Chọn loại sự kiện</option>
                      <option value="concert">Hòa nhạc & Âm nhạc</option>
                      <option value="workshop">Hội thảo & Workshop</option>
                      <option value="sport">Thể thao</option>
                      <option value="art">Triển lãm Nghệ thuật</option>
                      <option value="festival">Lễ hội</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Mô tả sự kiện
                    </label>

                    <textarea
                      rows="6"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Mô tả chi tiết về sự kiện của bạn để thu hút người tham gia..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-red-700 focus:border-red-700 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Hình ảnh Poster
                    </label>

                    <div className="relative border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                      <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-slate-400 group-hover:text-red-700 mb-3">
                        <span className="material-symbols-outlined text-2xl">
                          add_photo_alternate
                        </span>
                      </div>

                      <p className="text-sm font-semibold text-slate-600 mb-1">
                        Nhấp để tải lên hoặc kéo thả
                      </p>

                      <p className="text-xs text-slate-400">
                        PNG, JPG tối đa 5MB (Tỷ lệ 16:9)
                      </p>

                      <input
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl shadow-md p-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Xem trước Poster
                    </h5>

                    <div className="relative w-full aspect-[16/9] bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                      <img
                        alt="Event poster preview"
                        className="w-full h-full object-cover grayscale-[20%] opacity-80"
                        src={previewSrc}
                      />

                      {form.name ? (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs font-semibold px-3 py-2 truncate">
                          {form.name}
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white font-medium text-xs">
                          Xem trước thời gian thực
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-red-50 border border-red-100 rounded-lg flex items-start gap-4">
                <span className="material-symbols-outlined text-red-600 mt-1">
                  info
                </span>

                <div>
                  <h4 className="text-sm font-semibold text-red-800 mb-1">
                    Mẹo nhỏ
                  </h4>

                  <p className="text-sm text-red-700/80 leading-relaxed">
                    Sử dụng hình ảnh poster chất lượng cao và tiêu đề ngắn gọn
                    sẽ giúp tăng tỷ lệ chuyển đổi vé lên đến 40%. Đảm bảo thông
                    tin mô tả rõ ràng về nội dung chương trình.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-8 border-t border-slate-100 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Bạn có chắc muốn hủy tạo sự kiện?")) {
                      localStorage.removeItem("create_event_step_1");
                      navigate("/admin/events");
                    }
                  }}
                  className="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-all"
                >
                  Hủy
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={loading}
                  className="px-8 py-3 bg-red-700 text-white font-semibold rounded-lg shadow-lg shadow-red-700/20 hover:bg-red-800 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
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

function Step({ number, label, active, done }) {
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

export default CreateEventStep1;