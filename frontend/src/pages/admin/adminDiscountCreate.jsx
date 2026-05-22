/*
import { useState } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export default function AdminCreateDiscount() {
  const [promoCode, setPromoCode] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [tiers, setTiers] = useState([
    { id: 1, minQuantity: 1, type: "percentage", value: 5 },
  ]);

  const generateCode = () => {
    let result = "";
    for (let i = 0; i < 8; i += 1) {
      result += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
    }
    setPromoCode(result);
  };

  const addTier = () => {
    setTiers((prev) => [
      ...prev,
      { id: Date.now(), minQuantity: "", type: "percentage", value: "" },
    ]);
  };

  const removeTier = (id) => {
    setTiers((prev) => prev.filter((tier) => tier.id !== id));
  };

  const updateTier = (id, field, value) => {
    setTiers((prev) =>
      prev.map((tier) => (tier.id === id ? { ...tier, [field]: value } : tier))
    );
  };

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-[#f8f9fa] text-[#191c1d] concert-pattern custom-scrollbar">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        .concert-pattern {
          background-color: #f8f9fa;
          background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
          background-size: 24px 24px;
          font-family: 'Inter', sans-serif;
        }

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }

        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>

      <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#e8bcb6] bg-white px-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-150 hover:bg-[#edeeef] active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-[#5f5e5e]">
              arrow_back
            </span>
          </button>

          <h2 className="text-2xl font-bold tracking-tight text-[#b30004]">
            Tạo mã giảm giá mới
          </h2>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#5f5e5e]">
              search
            </span>
            <input
              className="w-64 rounded-full border-none bg-[#f3f4f5] py-2 pl-10 pr-4 text-base transition-all focus:ring-2 focus:ring-[#b30004]"
              placeholder="Tìm kiếm tính năng..."
              type="text"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              className="rounded-full p-2 text-[#5f5e5e] hover:bg-[#edeeef]"
              type="button"
            >
              <span className="material-symbols-outlined">notifications</span>
            </button>

            <div className="h-8 w-8 overflow-hidden rounded-full border border-[#e8bcb6] bg-[#e7e8e9]">
              <img
                alt="Admin Profile Avatar"
                className="h-full w-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxF2WXBRuA-JbEOyv6AbfBeBpLCb5TqHFnQuDcg-TSS-K6e2UWrPE8Wz0KtZ65BrbTg5dg5A29kYpVSi3wMnW5IlfmditaQfwimdQRrAoB9RQylg3AzeE_3w0mJ9jRqsoPAK1TX-__ArEMFgf4F6oFlqyNJupljdzCclemBxOxKcvdk4i-hAyn6oKHd2NiQEIDNJ89dEEkYA5a2-F2tq1U6uePQPpHX1dSXlTnWfARU3RLbZRnouwhXEKflLyJbO-E4sYIWWq2KXg"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 p-10">
        <div className="mx-auto max-w-4xl space-y-8 pb-32">
          <section className="rounded-xl border border-[#E2E8F0] bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-2 border-b border-[#edeeef] pb-4">
              <span className="material-symbols-outlined text-[#b30004]">
                confirmation_number
              </span>
              <h3 className="text-lg font-bold text-[#b30004]">
                Cấu hình mã
              </h3>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-[#191c1d]">
                    Mã giảm giá (code){" "}
                    <span className="text-[#ba1a1a]">*</span>
                  </label>

                  <div className="relative flex">
                    <input
                      className="w-full rounded-l-lg border border-[#e8bcb6] bg-[#F1F5F9] px-4 py-3 font-mono text-base uppercase tracking-wider transition-all focus:border-[#b30004] focus:ring-2 focus:ring-[#b30004]"
                      id="promoCode"
                      onChange={(event) =>
                        setPromoCode(event.target.value.toUpperCase())
                      }
                      placeholder="SUMMER24"
                      type="text"
                      value={promoCode}
                    />

                    <button
                      className="flex items-center gap-2 rounded-r-lg border border-l-0 border-[#e8bcb6] bg-[#e7e8e9] px-4 text-sm font-semibold transition-all hover:bg-[#edeeef]"
                      onClick={generateCode}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-sm">
                        refresh
                      </span>
                      Tạo mã
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-[#191c1d]">
                    Giới hạn sử dụng (usage_limit)
                  </label>
                  <input
                    className="w-full rounded-lg border border-[#e8bcb6] bg-[#F1F5F9] px-4 py-3 text-base transition-all focus:border-[#b30004] focus:ring-2 focus:ring-[#b30004]"
                    placeholder="Để trống nếu không giới hạn"
                    type="number"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-[#E2E8F0] bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-2 border-b border-[#edeeef] pb-4">
              <span className="material-symbols-outlined text-[#b30004]">
                sell
              </span>
              <h3 className="text-lg font-bold text-[#b30004]">
                Loại chiết khấu
              </h3>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {[
                  {
                    value: "percentage",
                    icon: "percent",
                    label: "Phần trăm (%)",
                  },
                  {
                    value: "fixed_amount",
                    icon: "payments",
                    label: "Số tiền cố định (VNĐ)",
                  },
                  {
                    value: "tiered",
                    icon: "stairs",
                    label: "Bậc thang (Tiered)",
                  },
                ].map((option) => {
                  const checked = discountType === option.value;

                  return (
                    <label
                      className={`group relative flex cursor-pointer flex-col rounded-xl border p-4 transition-all hover:bg-[#f3f4f5] ${
                        checked
                          ? "border-[#e00d0d] ring-1 ring-[#e00d0d]"
                          : "border-[#e8bcb6]"
                      }`}
                      key={option.value}
                    >
                      <input
                        checked={checked}
                        className="sr-only peer"
                        name="discount_type"
                        onChange={() => setDiscountType(option.value)}
                        type="radio"
                        value={option.value}
                      />

                      <div className="mb-2 flex items-center justify-between">
                        <span className="material-symbols-outlined text-[#5f5e5e] transition-colors group-hover:text-[#b30004]">
                          {option.icon}
                        </span>

                        <div
                          className={`h-4 w-4 rounded-full border-2 transition-all ${
                            checked
                              ? "border-[#b30004] bg-[#b30004]"
                              : "border-[#e8bcb6]"
                          }`}
                        />
                      </div>

                      <span className="text-sm font-semibold">
                        {option.label}
                      </span>
                    </label>
                  );
                })}
              </div>

              {discountType !== "tiered" ? (
                <div className="space-y-4">
                  <div className="flex max-w-md flex-col gap-2">
                    <label className="text-sm font-semibold text-[#191c1d]">
                      Giá trị chiết khấu (discount_value){" "}
                      <span className="text-[#ba1a1a]">*</span>
                    </label>

                    <div className="relative">
                      <input
                        className="w-full rounded-lg border border-[#e8bcb6] bg-[#F1F5F9] py-3 pl-4 pr-16 text-base transition-all focus:border-[#b30004] focus:ring-2 focus:ring-[#b30004]"
                        id="mainDiscountValue"
                        placeholder="0"
                        type="number"
                      />

                      <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-[#5f5e5e]">
                        {discountType === "percentage" ? "%" : "VNĐ"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 duration-300">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-[#5f5e5e]">
                      Cấu hình bậc thang giảm giá
                    </h4>

                    <button
                      className="flex items-center gap-1 text-sm font-semibold text-[#b30004] hover:underline"
                      onClick={addTier}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-sm">
                        add_circle
                      </span>
                      Thêm bậc thang
                    </button>
                  </div>

                  <div className="space-y-3">
                    {tiers.map((tier, index) => (
                      <div
                        className="grid grid-cols-12 items-end gap-4 rounded-lg border border-[#e8bcb6] bg-[#f3f4f5] p-4"
                        key={tier.id}
                      >
                        <div className="col-span-3 flex flex-col gap-1">
                          <label className="mb-1 text-[10px] font-bold uppercase leading-none text-[#5f5e5e]">
                            SL tối thiểu
                          </label>

                          <input
                            className="w-full rounded border border-[#e8bcb6] bg-white px-3 py-2 text-base"
                            onChange={(event) =>
                              updateTier(
                                tier.id,
                                "minQuantity",
                                event.target.value
                              )
                            }
                            placeholder="1"
                            type="number"
                            value={tier.minQuantity}
                          />
                        </div>

                        <div className="col-span-3 flex flex-col gap-1">
                          <label className="mb-1 text-[10px] font-bold uppercase leading-none text-[#5f5e5e]">
                            Loại giảm
                          </label>

                          <select
                            className="w-full rounded border border-[#e8bcb6] bg-white px-3 py-2 text-base focus:border-[#b30004] focus:ring-[#b30004]"
                            onChange={(event) =>
                              updateTier(tier.id, "type", event.target.value)
                            }
                            value={tier.type}
                          >
                            <option value="percentage">Phần trăm (%)</option>
                            <option value="fixed_amount">Số tiền (VNĐ)</option>
                          </select>
                        </div>

                        <div className="col-span-4 flex flex-col gap-1">
                          <label className="mb-1 text-[10px] font-bold uppercase leading-none text-[#5f5e5e]">
                            Giá trị giảm
                          </label>

                          <input
                            className="w-full rounded border border-[#e8bcb6] bg-white px-3 py-2 text-base"
                            onChange={(event) =>
                              updateTier(tier.id, "value", event.target.value)
                            }
                            placeholder="0"
                            type="number"
                            value={tier.value}
                          />
                        </div>

                        <div className="col-span-2 flex justify-end">
                          <button
                            className="p-2 text-[#5f5e5e] transition-colors hover:text-[#ba1a1a] disabled:opacity-30"
                            disabled={index === 0}
                            onClick={() => removeTier(tier.id)}
                            type="button"
                          >
                            <span className="material-symbols-outlined">
                              delete
                            </span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-[#E2E8F0] bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-2 border-b border-[#edeeef] pb-4">
              <span className="material-symbols-outlined text-[#b30004]">
                calendar_today
              </span>
              <h3 className="text-lg font-bold text-[#b30004]">
                Thời gian áp dụng
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#191c1d]">
                  Thời gian bắt đầu (starts_at){" "}
                  <span className="text-[#ba1a1a]">*</span>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="w-full rounded-lg border border-[#e8bcb6] bg-[#F1F5F9] px-3 py-3 text-base transition-all focus:border-[#b30004] focus:ring-2 focus:ring-[#b30004]"
                    type="date"
                  />

                  <input
                    className="w-full rounded-lg border border-[#e8bcb6] bg-[#F1F5F9] px-3 py-3 text-base transition-all focus:border-[#b30004] focus:ring-2 focus:ring-[#b30004]"
                    type="time"
                    defaultValue="00:00"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#191c1d]">
                  Thời gian kết thúc (expires_at)
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="w-full rounded-lg border border-[#e8bcb6] bg-[#F1F5F9] px-3 py-3 text-base transition-all focus:border-[#b30004] focus:ring-2 focus:ring-[#b30004]"
                    type="date"
                  />

                  <input
                    className="w-full rounded-lg border border-[#e8bcb6] bg-[#F1F5F9] px-3 py-3 text-base transition-all focus:border-[#b30004] focus:ring-2 focus:ring-[#b30004]"
                    type="time"
                    defaultValue="23:59"
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="pt-8">
            <div className="flex flex-col items-center justify-between gap-6 rounded-xl border border-[#e8bcb6] bg-[#f3f4f5] p-6 md:flex-row">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#b30004]/10 text-[#b30004]">
                  <span className="material-symbols-outlined">visibility</span>
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#191c1d]">
                    Đang soạn thảo
                  </p>
                  <p className="text-base text-[#5f5e5e]">
                    Mã sẽ ở trạng thái tạm sau khi lưu.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#b30004] px-3 py-1 text-xs font-bold text-white">
                  NHẬP LIỆU
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-end gap-4 border-t border-[#e8bcb6] bg-white px-10 py-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <button
          className="rounded-lg border border-[#936e69] px-8 py-3 text-base font-semibold tracking-wide text-[#5f5e5e] transition-all duration-150 hover:bg-[#f3f4f5] active:scale-95"
          type="button"
        >
          Hủy
        </button>

        <button
          className="flex items-center gap-2 rounded-lg bg-[#e00d0d] px-8 py-3 text-base font-semibold tracking-wide text-white shadow-lg shadow-[#e00d0d]/20 transition-all duration-150 hover:opacity-90 active:scale-95"
          type="button"
        >
          <span className="material-symbols-outlined text-sm">save</span>
          Lưu mã giảm giá
        </button>
      </footer>
    </main>
  );
}
*/

//import { useState } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminDiscountApi } from "../../api/discountCreateApi";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const API_BASE_URL = "http://localhost:3000";
export default function AdminCreateDiscount() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    code: "",
    usage_limit: "",
    discount_type: "percentage",
    discount_value: "",
    starts_date: "",
    starts_time: "00:00",
    expires_date: "",
    expires_time: "23:59",

    // all = áp dụng tất cả sự kiện
    // events = chỉ áp dụng sự kiện được chọn
    apply_scope: "all",
    event_ids: [],
  });

  const [tiers, setTiers] = useState([
    {
      id: Date.now(),
      min_quantity: 1,
      discount_type: "percentage",
      discount_value: 5,
    },
  ]);

  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
    useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoadingEvents(true);

        const response = await fetch(
          `${API_BASE_URL}/api/discount/create/event-options`
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Không thể lấy danh sách sự kiện");
        }

        setEvents(result.data || []);
      } catch (error) {
        console.error("Fetch events error:", error);
        alert(error.message || "Không thể lấy danh sách sự kiện");
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, []);

  const generateCode = () => {
    let result = "";

    for (let i = 0; i < 8; i += 1) {
      result += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
    }

    handleChange("code", result);
  };

  const addTier = () => {
    setTiers((prev) => [
      ...prev,
      {
        id: Date.now(),
        min_quantity: "",
        discount_type: "percentage",
        discount_value: "",
      },
    ]);
  };

  const removeTier = (id) => {
    setTiers((prev) => prev.filter((tier) => tier.id !== id));
  };

  const updateTier = (id, field, value) => {
    setTiers((prev) =>
      prev.map((tier) => (tier.id === id ? { ...tier, [field]: value } : tier))
    );
  };

  const toggleEvent = (eventId) => {
    setFormData((prev) => {
      const currentEventIds = prev.event_ids || [];
      const exists = currentEventIds.includes(eventId);

      return {
        ...prev,
        event_ids: exists
          ? currentEventIds.filter((id) => id !== eventId)
          : [...currentEventIds, eventId],
      };
    });
  };

  const buildDateTime = (date, time) => {
    if (!date) return null;
    return `${date}T${time || "00:00"}:00`;
  };

  const validateForm = () => {
    if (!formData.code.trim()) {
      alert("Vui lòng nhập mã giảm giá");
      return false;
    }

    if (!formData.starts_date) {
      alert("Vui lòng chọn thời gian bắt đầu");
      return false;
    }

    if (formData.discount_type !== "tiered") {
      if (!formData.discount_value || Number(formData.discount_value) <= 0) {
        alert("Vui lòng nhập giá trị chiết khấu lớn hơn 0");
        return false;
      }
    }

    if (
      formData.discount_type === "percentage" &&
      Number(formData.discount_value) > 100
    ) {
      alert("Giá trị phần trăm không được lớn hơn 100%");
      return false;
    }

    if (
      formData.usage_limit !== "" &&
      Number(formData.usage_limit) < 0
    ) {
      alert("Giới hạn sử dụng không được nhỏ hơn 0");
      return false;
    }

    if (formData.discount_type === "tiered") {
      if (!tiers.length) {
        alert("Vui lòng thêm ít nhất 1 bậc thang");
        return false;
      }

      const invalidTier = tiers.find((tier) => {
        return (
          !tier.min_quantity ||
          Number(tier.min_quantity) <= 0 ||
          !tier.discount_value ||
          Number(tier.discount_value) <= 0
        );
      });

      if (invalidTier) {
        alert("Thông tin bậc thang không hợp lệ");
        return false;
      }
    }

    if (formData.apply_scope === "events" && formData.event_ids.length === 0) {
      alert("Vui lòng chọn ít nhất 1 sự kiện áp dụng mã giảm giá");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) return;

      setLoading(true);

      const payload = {
        code: formData.code.trim().toUpperCase(),
        discount_type: formData.discount_type,

        // Bảng discount_codes của bạn đang yêu cầu discount_value > 0.
        // Với tiered, giá trị thật nằm ở bảng discount_code_tiers.
        discount_value:
          formData.discount_type === "tiered"
            ? 1
            : Number(formData.discount_value),

        currency: "VND",

        usage_limit:
          formData.usage_limit === "" ? null : Number(formData.usage_limit),

        status: "active",

        apply_scope: formData.apply_scope,
        event_ids: formData.apply_scope === "events" ? formData.event_ids : [],

        starts_at: buildDateTime(formData.starts_date, formData.starts_time),
        expires_at: buildDateTime(formData.expires_date, formData.expires_time),

        tiers:
          formData.discount_type === "tiered"
            ? tiers.map((tier) => ({
                min_quantity: Number(tier.min_quantity),
                discount_type: tier.discount_type,
                discount_value: Number(tier.discount_value),
              }))
            : [],
      };

      const result = await adminDiscountApi.createDiscount(payload);

      alert(result.message || "Tạo mã giảm giá thành công");

      navigate("/admin/discount");
    } catch (error) {
      console.error("Create discount error:", error);
      alert(error.message || "Có lỗi xảy ra khi tạo mã giảm giá");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="concert-pattern custom-scrollbar flex min-h-screen flex-col overflow-x-hidden bg-[#f8f9fa] text-[#191c1d]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        .concert-pattern {
          background-color: #f8f9fa;
          background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
          background-size: 24px 24px;
          font-family: 'Inter', sans-serif;
        }

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>

      <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#e8bcb6] bg-white px-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-150 hover:bg-[#edeeef] active:scale-95"
            onClick={() => navigate(-1)}
            type="button"
          >
            <span className="material-symbols-outlined text-[#5f5e5e]">
              arrow_back
            </span>
          </button>

          <h2 className="text-2xl font-bold tracking-tight text-[#b30004]">
            Tạo mã giảm giá mới
          </h2>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#5f5e5e]">
              search
            </span>

            <input
              className="w-64 rounded-full border-none bg-[#f3f4f5] py-2 pl-10 pr-4 text-base transition-all focus:ring-2 focus:ring-[#b30004]"
              placeholder="Tìm kiếm tính năng..."
              type="text"
            />
          </div>

          <button
            className="rounded-full p-2 text-[#5f5e5e] hover:bg-[#edeeef]"
            type="button"
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>

          <div className="h-8 w-8 overflow-hidden rounded-full border border-[#e8bcb6] bg-[#e7e8e9]">
            <img
              alt="Admin Profile Avatar"
              className="h-full w-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxF2WXBRuA-JbEOyv6AbfBeBpLCb5TqHFnQuDcg-TSS-K6e2UWrPE8Wz0KtZ65BrbTg5dg5A29kYpVSi3wMnW5IlfmditaQfwimdQRrAoB9RQylg3AzeE_3w0mJ9jRqsoPAK1TX-__ArEMFgf4F6oFlqyNJupljdzCclemBxOxKcvdk4i-hAyn6oKHd2NiQEIDNJ89dEEkYA5a2-F2tq1U6uePQPpHX1dSXlTnWfARU3RLbZRnouwhXEKflLyJbO-E4sYIWWq2KXg"
            />
          </div>
        </div>
      </header>

      <div className="flex-1 p-10">
        <div className="mx-auto max-w-4xl space-y-8 pb-32">
          <section className="rounded-xl border border-[#E2E8F0] bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-2 border-b border-[#edeeef] pb-4">
              <span className="material-symbols-outlined text-[#b30004]">
                confirmation_number
              </span>
              <h3 className="text-lg font-bold text-[#b30004]">
                Cấu hình mã
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#191c1d]">
                  Mã giảm giá (code){" "}
                  <span className="text-[#ba1a1a]">*</span>
                </label>

                <div className="relative flex">
                  <input
                    className="w-full rounded-l-lg border border-[#e8bcb6] bg-[#F1F5F9] px-4 py-3 font-mono text-base uppercase tracking-wider transition-all focus:border-[#b30004] focus:ring-2 focus:ring-[#b30004]"
                    onChange={(event) =>
                      handleChange("code", event.target.value.toUpperCase())
                    }
                    placeholder="SUMMER24"
                    type="text"
                    value={formData.code}
                  />

                  <button
                    className="flex items-center gap-2 rounded-r-lg border border-l-0 border-[#e8bcb6] bg-[#e7e8e9] px-4 text-sm font-semibold transition-all hover:bg-[#edeeef]"
                    onClick={generateCode}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-sm">
                      refresh
                    </span>
                    Tạo mã
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#191c1d]">
                  Giới hạn sử dụng (usage_limit)
                </label>

                <input
                  className="w-full rounded-lg border border-[#e8bcb6] bg-[#F1F5F9] px-4 py-3 text-base transition-all focus:border-[#b30004] focus:ring-2 focus:ring-[#b30004]"
                  onChange={(event) =>
                    handleChange("usage_limit", event.target.value)
                  }
                  placeholder="Để trống nếu không giới hạn"
                  type="number"
                  value={formData.usage_limit}
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-[#E2E8F0] bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-2 border-b border-[#edeeef] pb-4">
              <span className="material-symbols-outlined text-[#b30004]">
                event
              </span>
              <h3 className="text-lg font-bold text-[#b30004]">
                Phạm vi áp dụng
              </h3>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    formData.apply_scope === "all"
                      ? "border-[#e00d0d] ring-1 ring-[#e00d0d]"
                      : "border-[#e8bcb6]"
                  }`}
                >
                  <input
                    checked={formData.apply_scope === "all"}
                    className="sr-only"
                    name="apply_scope"
                    onChange={() =>
                      setFormData((prev) => ({
                        ...prev,
                        apply_scope: "all",
                        event_ids: [],
                      }))
                    }
                    type="radio"
                    value="all"
                  />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#191c1d]">
                        Tất cả sự kiện
                      </p>
                      <p className="mt-1 text-sm text-[#5f5e5e]">
                        Mã giảm giá có thể dùng cho mọi sự kiện.
                      </p>
                    </div>

                    <span className="material-symbols-outlined text-[#b30004]">
                      public
                    </span>
                  </div>
                </label>

                <label
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    formData.apply_scope === "events"
                      ? "border-[#e00d0d] ring-1 ring-[#e00d0d]"
                      : "border-[#e8bcb6]"
                  }`}
                >
                  <input
                    checked={formData.apply_scope === "events"}
                    className="sr-only"
                    name="apply_scope"
                    onChange={() =>
                      setFormData((prev) => ({
                        ...prev,
                        apply_scope: "events",
                      }))
                    }
                    type="radio"
                    value="events"
                  />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#191c1d]">
                        Chọn từng sự kiện
                      </p>
                      <p className="mt-1 text-sm text-[#5f5e5e]">
                        Mã chỉ áp dụng cho những sự kiện được chọn.
                      </p>
                    </div>

                    <span className="material-symbols-outlined text-[#b30004]">
                      confirmation_number
                    </span>
                  </div>
                </label>
              </div>

              {formData.apply_scope === "events" && (
                <div className="rounded-xl border border-[#e8bcb6] bg-[#f3f4f5] p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#191c1d]">
                      Danh sách sự kiện
                    </p>

                    <span className="text-sm text-[#5f5e5e]">
                      Đã chọn {formData.event_ids.length} sự kiện
                    </span>
                  </div>

                  {loadingEvents ? (
                    <p className="text-sm text-[#5f5e5e]">
                      Đang tải danh sách sự kiện...
                    </p>
                  ) : events.length === 0 ? (
                    <p className="text-sm text-[#5f5e5e]">
                      Chưa có sự kiện nào để chọn.
                    </p>
                  ) : (
                    <div className="max-h-72 space-y-3 overflow-y-auto pr-2">
                      {events.map((eventItem) => {
                        const eventId = Number(eventItem.id);
                        const checked = formData.event_ids.includes(eventId);

                        return (
                          <label
                            className={`flex cursor-pointer items-center justify-between rounded-lg border bg-white p-4 transition-all ${
                              checked
                                ? "border-[#e00d0d] ring-1 ring-[#e00d0d]"
                                : "border-[#e8bcb6]"
                            }`}
                            key={eventItem.id}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                checked={checked}
                                className="h-4 w-4 accent-[#b30004]"
                                onChange={() => toggleEvent(eventId)}
                                type="checkbox"
                              />

                              <div>
                                <p className="text-sm font-semibold text-[#191c1d]">
                                  {eventItem.name}
                                </p>

                                <p className="text-sm text-[#5f5e5e]">
                                  {eventItem.location || "Chưa có địa điểm"}
                                  {eventItem.date ? ` • ${eventItem.date}` : ""}
                                </p>
                              </div>
                            </div>

                            <span className="text-xs font-semibold text-[#b30004]">
                              ID: {eventItem.id}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-[#E2E8F0] bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-2 border-b border-[#edeeef] pb-4">
              <span className="material-symbols-outlined text-[#b30004]">
                sell
              </span>
              <h3 className="text-lg font-bold text-[#b30004]">
                Loại chiết khấu
              </h3>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {[
                  {
                    value: "percentage",
                    icon: "percent",
                    label: "Phần trăm (%)",
                  },
                  {
                    value: "fixed",
                    icon: "payments",
                    label: "Số tiền cố định (VNĐ)",
                  },
                  {
                    value: "tiered",
                    icon: "stairs",
                    label: "Bậc thang (Tiered)",
                  },
                ].map((option) => {
                  const checked = formData.discount_type === option.value;

                  return (
                    <label
                      className={`group relative flex cursor-pointer flex-col rounded-xl border p-4 transition-all hover:bg-[#f3f4f5] ${
                        checked
                          ? "border-[#e00d0d] ring-1 ring-[#e00d0d]"
                          : "border-[#e8bcb6]"
                      }`}
                      key={option.value}
                    >
                      <input
                        checked={checked}
                        className="sr-only"
                        name="discount_type"
                        onChange={() =>
                          handleChange("discount_type", option.value)
                        }
                        type="radio"
                        value={option.value}
                      />

                      <div className="mb-2 flex items-center justify-between">
                        <span className="material-symbols-outlined text-[#5f5e5e] transition-colors group-hover:text-[#b30004]">
                          {option.icon}
                        </span>

                        <div
                          className={`h-4 w-4 rounded-full border-2 transition-all ${
                            checked
                              ? "border-[#b30004] bg-[#b30004]"
                              : "border-[#e8bcb6]"
                          }`}
                        />
                      </div>

                      <span className="text-sm font-semibold">
                        {option.label}
                      </span>
                    </label>
                  );
                })}
              </div>

              {formData.discount_type !== "tiered" ? (
                <div className="space-y-4">
                  <div className="flex max-w-md flex-col gap-2">
                    <label className="text-sm font-semibold text-[#191c1d]">
                      Giá trị chiết khấu (discount_value){" "}
                      <span className="text-[#ba1a1a]">*</span>
                    </label>

                    <div className="relative">
                      <input
                        className="w-full rounded-lg border border-[#e8bcb6] bg-[#F1F5F9] py-3 pl-4 pr-16 text-base transition-all focus:border-[#b30004] focus:ring-2 focus:ring-[#b30004]"
                        onChange={(event) =>
                          handleChange("discount_value", event.target.value)
                        }
                        placeholder="0"
                        type="number"
                        value={formData.discount_value}
                      />

                      <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-[#5f5e5e]">
                        {formData.discount_type === "percentage" ? "%" : "VNĐ"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 duration-300">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-[#5f5e5e]">
                      Cấu hình bậc thang giảm giá
                    </h4>

                    <button
                      className="flex items-center gap-1 text-sm font-semibold text-[#b30004] hover:underline"
                      onClick={addTier}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-sm">
                        add_circle
                      </span>
                      Thêm bậc thang
                    </button>
                  </div>

                  <div className="space-y-3">
                    {tiers.map((tier, index) => (
                      <div
                        className="grid grid-cols-12 items-end gap-4 rounded-lg border border-[#e8bcb6] bg-[#f3f4f5] p-4"
                        key={tier.id}
                      >
                        <div className="col-span-3 flex flex-col gap-1">
                          <label className="mb-1 text-[10px] font-bold uppercase leading-none text-[#5f5e5e]">
                            SL tối thiểu
                          </label>

                          <input
                            className="w-full rounded border border-[#e8bcb6] bg-white px-3 py-2 text-base"
                            onChange={(event) =>
                              updateTier(
                                tier.id,
                                "min_quantity",
                                event.target.value
                              )
                            }
                            placeholder="1"
                            type="number"
                            value={tier.min_quantity}
                          />
                        </div>

                        <div className="col-span-3 flex flex-col gap-1">
                          <label className="mb-1 text-[10px] font-bold uppercase leading-none text-[#5f5e5e]">
                            Loại giảm
                          </label>

                          <select
                            className="w-full rounded border border-[#e8bcb6] bg-white px-3 py-2 text-base focus:border-[#b30004] focus:ring-[#b30004]"
                            onChange={(event) =>
                              updateTier(
                                tier.id,
                                "discount_type",
                                event.target.value
                              )
                            }
                            value={tier.discount_type}
                          >
                            <option value="percentage">Phần trăm (%)</option>
                            <option value="fixed">Số tiền (VNĐ)</option>
                          </select>
                        </div>

                        <div className="col-span-4 flex flex-col gap-1">
                          <label className="mb-1 text-[10px] font-bold uppercase leading-none text-[#5f5e5e]">
                            Giá trị giảm
                          </label>

                          <input
                            className="w-full rounded border border-[#e8bcb6] bg-white px-3 py-2 text-base"
                            onChange={(event) =>
                              updateTier(
                                tier.id,
                                "discount_value",
                                event.target.value
                              )
                            }
                            placeholder="0"
                            type="number"
                            value={tier.discount_value}
                          />
                        </div>

                        <div className="col-span-2 flex justify-end">
                          <button
                            className="p-2 text-[#5f5e5e] transition-colors hover:text-[#ba1a1a] disabled:opacity-30"
                            disabled={index === 0}
                            onClick={() => removeTier(tier.id)}
                            type="button"
                          >
                            <span className="material-symbols-outlined">
                              delete
                            </span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-[#E2E8F0] bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-2 border-b border-[#edeeef] pb-4">
              <span className="material-symbols-outlined text-[#b30004]">
                calendar_today
              </span>
              <h3 className="text-lg font-bold text-[#b30004]">
                Thời gian áp dụng
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#191c1d]">
                  Thời gian bắt đầu (starts_at){" "}
                  <span className="text-[#ba1a1a]">*</span>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="w-full rounded-lg border border-[#e8bcb6] bg-[#F1F5F9] px-3 py-3 text-base transition-all focus:border-[#b30004] focus:ring-2 focus:ring-[#b30004]"
                    onChange={(event) =>
                      handleChange("starts_date", event.target.value)
                    }
                    type="date"
                    value={formData.starts_date}
                  />

                  <input
                    className="w-full rounded-lg border border-[#e8bcb6] bg-[#F1F5F9] px-3 py-3 text-base transition-all focus:border-[#b30004] focus:ring-2 focus:ring-[#b30004]"
                    onChange={(event) =>
                      handleChange("starts_time", event.target.value)
                    }
                    type="time"
                    value={formData.starts_time}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#191c1d]">
                  Thời gian kết thúc (expires_at)
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="w-full rounded-lg border border-[#e8bcb6] bg-[#F1F5F9] px-3 py-3 text-base transition-all focus:border-[#b30004] focus:ring-2 focus:ring-[#b30004]"
                    onChange={(event) =>
                      handleChange("expires_date", event.target.value)
                    }
                    type="date"
                    value={formData.expires_date}
                  />

                  <input
                    className="w-full rounded-lg border border-[#e8bcb6] bg-[#F1F5F9] px-3 py-3 text-base transition-all focus:border-[#b30004] focus:ring-2 focus:ring-[#b30004]"
                    onChange={(event) =>
                      handleChange("expires_time", event.target.value)
                    }
                    type="time"
                    value={formData.expires_time}
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="pt-8">
            <div className="flex flex-col items-center justify-between gap-6 rounded-xl border border-[#e8bcb6] bg-[#f3f4f5] p-6 md:flex-row">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#b30004]/10 text-[#b30004]">
                  <span className="material-symbols-outlined">visibility</span>
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#191c1d]">
                    Đang soạn thảo
                  </p>
                  <p className="text-base text-[#5f5e5e]">
                    Mã sẽ ở trạng thái tạm sau khi lưu.
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-[#b30004] px-3 py-1 text-xs font-bold text-white">
                NHẬP LIỆU
              </span>
            </div>
          </div>
        </div>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-end gap-4 border-t border-[#e8bcb6] bg-white px-10 py-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <button
          className="rounded-lg border border-[#936e69] px-8 py-3 text-base font-semibold tracking-wide text-[#5f5e5e] transition-all duration-150 hover:bg-[#f3f4f5] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
          onClick={() => navigate(-1)}
          type="button"
        >
          Hủy
        </button>

        <button
          className="flex items-center gap-2 rounded-lg bg-[#e00d0d] px-8 py-3 text-base font-semibold tracking-wide text-white shadow-lg shadow-[#e00d0d]/20 transition-all duration-150 hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
          onClick={handleSubmit}
          type="button"
        >
          <span className="material-symbols-outlined text-sm">save</span>
          {loading ? "Đang lưu..." : "Lưu mã giảm giá"}
        </button>
      </footer>
    </main>
  );
}