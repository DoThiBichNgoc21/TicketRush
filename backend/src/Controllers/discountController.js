import supabase from "../config/supabase.js";

/**
 * POST /api/discounts/validate
 * Kiểm tra mã giảm giá và tính toán số tiền được giảm
 */
export const validateDiscountCode = async (req, res) => {
  try {
    const { code, eventId, totalPrice, quantity } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập mã giảm giá" });
    }

    const normalizedCode = code.trim().toUpperCase();

    // 1. Lấy thông tin mã giảm giá
    const { data: discount, error } = await supabase
      .from("discount_codes")
      .select(`
        *,
        discount_code_tiers (*),
        discount_code_events (*)
      `)
      .eq("code", normalizedCode)
      .single();

    if (error || !discount) {
      return res.status(404).json({ success: false, message: "Mã giảm giá không tồn tại" });
    }

    // 2. Kiểm tra trạng thái và thời hạn
    const now = new Date();
    if (discount.status !== "active") {
      return res.status(400).json({ success: false, message: "Mã giảm giá hiện không khả dụng" });
    }

    if (discount.starts_at && new Date(discount.starts_at) > now) {
      return res.status(400).json({ success: false, message: "Mã giảm giá chưa đến thời gian áp dụng" });
    }

    if (discount.expires_at && new Date(discount.expires_at) < now) {
      // Cập nhật status sang expired nếu đã hết hạn
      await supabase.from("discount_codes").update({ status: "expired" }).eq("id", discount.id);
      return res.status(400).json({ success: false, message: "Mã giảm giá đã hết hạn" });
    }

    // 3. Kiểm tra số lượt sử dụng
    if (discount.usage_limit !== null && Number(discount.used_count) >= Number(discount.usage_limit)) {
      return res.status(400).json({ 
        success: false, 
        code: 'LIMIT_REACHED',
        message: "Mã giảm giá đã hết lượt sử dụng" 
      });
    }

    // 4. Kiểm tra phạm vi sự kiện
    if (discount.apply_scope === "events") {
      const isEventValid = discount.discount_code_events.some(e => e.event_id === Number(eventId));
      if (!isEventValid) {
        return res.status(400).json({ success: false, message: "Mã giảm giá này không áp dụng cho sự kiện này" });
      }
    }

    // 5. Tính toán số tiền giảm
    let discountAmount = 0;

    if (discount.discount_type === "percentage") {
      discountAmount = (totalPrice * discount.discount_value) / 100;
    } else if (discount.discount_type === "fixed") {
      discountAmount = discount.discount_value;
    } else if (discount.discount_type === "tiered") {
      // Logic giảm giá bậc thang dựa trên số lượng vé (quantity)
      const sortedTiers = (discount.discount_code_tiers || []).sort((a, b) => b.min_quantity - a.min_quantity);
      const matchedTier = sortedTiers.find(t => quantity >= t.min_quantity);

      if (matchedTier) {
        if (matchedTier.discount_type === "percentage") {
          discountAmount = (totalPrice * matchedTier.discount_value) / 100;
        } else {
          discountAmount = matchedTier.discount_value;
        }
      } else {
        return res.status(400).json({ success: false, message: "Mã giảm giá này yêu cầu mua nhiều vé hơn để được áp dụng" });
      }
    }

    // Đảm bảo số tiền giảm không vượt quá tổng tiền
    discountAmount = Math.min(discountAmount, totalPrice);

    return res.json({
      success: true,
      data: {
         id: discount.id,
         code: discount.code,
         discount_amount: discountAmount,
         new_total: totalPrice - discountAmount,
         message: `Áp dụng mã thành công! Bạn được giảm ${discountAmount.toLocaleString('vi-VN')}đ`
      }
    });

  } catch (error) {
    console.error("Validate discount code error:", error);
    return res.status(500).json({ success: false, message: "Lỗi hệ thống khi kiểm tra mã giảm giá" });
  }
};

/**
 * GET /api/discounts/available
 * Lấy danh sách mã giảm giá khả dụng cho sự kiện này
 */
export const getAvailableDiscounts = async (req, res) => {
  try {
    const { eventId } = req.query;
    const now = new Date().toISOString();

    // Lấy tất cả mã active và trong thời hạn, kèm theo các tầng giảm giá (nếu có)
    let query = supabase
      .from("discount_codes")
      .select(`
        *,
        discount_code_events (*),
        discount_code_tiers (*)
      `)
      .eq("status", "active")
      .or(`starts_at.lte.${now},starts_at.is.null`)
      .or(`expires_at.gte.${now},expires_at.is.null`);

    const { data: allActive, error } = await query;

    if (error) throw error;

    // Lọc lại ở phía server để xử lý logic phức tạp (scope và usage_limit)
    const available = allActive.filter(d => {
      // 1. Kiểm tra giới hạn sử dụng
      if (d.usage_limit !== null && d.used_count >= d.usage_limit) return false;

      // 2. Kiểm tra phạm vi
      if (d.apply_scope === "all") return true;
      if (d.apply_scope === "events" && eventId) {
        return d.discount_code_events.some(e => e.event_id === Number(eventId));
      }
      return false;
    });

    return res.json({
      success: true,
      data: available.map(d => ({
        id: d.id,
        code: d.code,
        discount_type: d.discount_type,
        discount_value: d.discount_value,
        expires_at: d.expires_at,
        apply_scope: d.apply_scope,
        tiers: d.discount_code_tiers || []
      }))
    });

  } catch (error) {
    console.error("Get available discounts error:", error);
    return res.status(500).json({ success: false, message: "Lỗi khi lấy danh sách mã giảm giá" });
  }
};
