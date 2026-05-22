import { supabase } from "../config/supabaseClient.js";

/**
 * GET /api/admin/discounts
 * Lấy danh sách mã giảm giá
 */
export const getAllDiscountCodes = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("discount_codes")
      .select(`
        *,
        discount_code_tiers (*)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get discount codes error:", error);
      return res.status(500).json({
        success: false,
        message: "Không thể lấy danh sách mã giảm giá",
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Server error getAllDiscountCodes:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách mã giảm giá",
    });
  }
};

/**
 * GET /api/admin/discounts/:id
 * Lấy chi tiết 1 mã giảm giá
 */
export const getDiscountCodeById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("discount_codes")
      .select(`
        *,
        discount_code_tiers (*)
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Get discount code by id error:", error);
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy mã giảm giá",
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Server error getDiscountCodeById:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy chi tiết mã giảm giá",
    });
  }
};

/**
 * POST /api/admin/discounts
 * Tạo mã giảm giá mới
 */
export const createDiscountCode = async (req, res) => {
  try {
    const {
      code,
      discount_type,
      discount_value,
      currency = "VND",
      usage_limit,
      status = "active",
      starts_at,
      expires_at,
      tiers = [],
    } = req.body;

    if (!code || !discount_type) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ code và discount_type",
      });
    }

    const normalizedCode = code.trim().toUpperCase();

    /**
     * Database của bạn đang CHECK:
     * discount_type IN ('percentage', 'fixed')
     *
     * Nếu frontend gửi fixed_amount thì backend đổi thành fixed.
     */
    const dbDiscountType =
      discount_type === "fixed_amount" ? "fixed" : discount_type;

    if (!["percentage", "fixed", "tiered"].includes(dbDiscountType)) {
      return res.status(400).json({
        success: false,
        message: "Loại chiết khấu không hợp lệ",
      });
    }

    if (dbDiscountType !== "tiered") {
      if (!discount_value || Number(discount_value) <= 0) {
        return res.status(400).json({
          success: false,
          message: "Giá trị chiết khấu phải lớn hơn 0",
        });
      }
    }

    if (dbDiscountType === "tiered") {
      if (!Array.isArray(tiers) || tiers.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Mã giảm giá bậc thang cần ít nhất 1 điều kiện",
        });
      }
    }

    const insertPayload = {
      code: normalizedCode,
      discount_type: dbDiscountType,

      // Vì bảng discount_codes yêu cầu discount_value NOT NULL và > 0,
      // với loại tiered ta lưu tạm 1 để qua constraint.
      discount_value:
        dbDiscountType === "tiered" ? 1 : Number(discount_value),

      currency,
      usage_limit:
        usage_limit === "" || usage_limit === undefined || usage_limit === null
          ? null
          : Number(usage_limit),
      status,
      starts_at: starts_at || null,
      expires_at: expires_at || null,
    };

    const { data: discountCode, error: discountError } = await supabase
      .from("discount_codes")
      .insert(insertPayload)
      .select()
      .single();

    if (discountError) {
      console.error("Create discount code error:", discountError);
      return res.status(500).json({
        success: false,
        message: "Không thể tạo mã giảm giá",
        error: discountError.message,
      });
    }

    let insertedTiers = [];

    if (dbDiscountType === "tiered") {
      const tierPayload = tiers.map((tier) => {
        const tierDiscountType =
          tier.discount_type === "fixed_amount"
            ? "fixed"
            : tier.discount_type || "percentage";

        return {
          discount_code_id: discountCode.id,
          min_quantity: Number(tier.min_quantity),
          discount_type: tierDiscountType,
          discount_value: Number(tier.discount_value),
        };
      });

      const invalidTier = tierPayload.find(
        (tier) =>
          !tier.min_quantity ||
          tier.min_quantity <= 0 ||
          !tier.discount_value ||
          tier.discount_value <= 0 ||
          !["percentage", "fixed"].includes(tier.discount_type)
      );

      if (invalidTier) {
        await supabase.from("discount_codes").delete().eq("id", discountCode.id);

        return res.status(400).json({
          success: false,
          message: "Dữ liệu bậc thang không hợp lệ",
        });
      }

      const { data: tierData, error: tierError } = await supabase
        .from("discount_code_tiers")
        .insert(tierPayload)
        .select();

      if (tierError) {
        console.error("Create discount tiers error:", tierError);

        await supabase.from("discount_codes").delete().eq("id", discountCode.id);

        return res.status(500).json({
          success: false,
          message: "Không thể tạo điều kiện bậc thang",
          error: tierError.message,
        });
      }

      insertedTiers = tierData;
    }

    return res.status(201).json({
      success: true,
      message: "Tạo mã giảm giá thành công",
      data: {
        ...discountCode,
        discount_code_tiers: insertedTiers,
      },
    });
  } catch (error) {
    console.error("Server error createDiscountCode:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo mã giảm giá",
    });
  }
};

/**
 * PUT /api/admin/discounts/:id
 * Cập nhật mã giảm giá
 */
export const updateDiscountCode = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      code,
      discount_type,
      discount_value,
      currency,
      usage_limit,
      status,
      starts_at,
      expires_at,
      tiers,
    } = req.body;

    const dbDiscountType =
      discount_type === "fixed_amount" ? "fixed" : discount_type;

    const updatePayload = {
      updated_at: new Date().toISOString(),
    };

    if (code !== undefined) updatePayload.code = code.trim().toUpperCase();
    if (dbDiscountType !== undefined) updatePayload.discount_type = dbDiscountType;
    if (currency !== undefined) updatePayload.currency = currency;
    if (status !== undefined) updatePayload.status = status;

    if (usage_limit !== undefined) {
      updatePayload.usage_limit =
        usage_limit === "" || usage_limit === null ? null : Number(usage_limit);
    }

    if (starts_at !== undefined) updatePayload.starts_at = starts_at || null;
    if (expires_at !== undefined) updatePayload.expires_at = expires_at || null;

    if (dbDiscountType === "tiered") {
      updatePayload.discount_value = 1;
    } else if (discount_value !== undefined) {
      updatePayload.discount_value = Number(discount_value);
    }

    const { data: updatedDiscount, error: updateError } = await supabase
      .from("discount_codes")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Update discount code error:", updateError);
      return res.status(500).json({
        success: false,
        message: "Không thể cập nhật mã giảm giá",
        error: updateError.message,
      });
    }

    let updatedTiers = [];

    if (Array.isArray(tiers)) {
      const { error: deleteTierError } = await supabase
        .from("discount_code_tiers")
        .delete()
        .eq("discount_code_id", id);

      if (deleteTierError) {
        console.error("Delete old tiers error:", deleteTierError);
        return res.status(500).json({
          success: false,
          message: "Không thể xóa bậc thang cũ",
          error: deleteTierError.message,
        });
      }

      if (dbDiscountType === "tiered" && tiers.length > 0) {
        const tierPayload = tiers.map((tier) => ({
          discount_code_id: Number(id),
          min_quantity: Number(tier.min_quantity),
          discount_type:
            tier.discount_type === "fixed_amount"
              ? "fixed"
              : tier.discount_type || "percentage",
          discount_value: Number(tier.discount_value),
        }));

        const { data: tierData, error: insertTierError } = await supabase
          .from("discount_code_tiers")
          .insert(tierPayload)
          .select();

        if (insertTierError) {
          console.error("Insert updated tiers error:", insertTierError);
          return res.status(500).json({
            success: false,
            message: "Không thể cập nhật bậc thang",
            error: insertTierError.message,
          });
        }

        updatedTiers = tierData;
      }
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật mã giảm giá thành công",
      data: {
        ...updatedDiscount,
        discount_code_tiers: updatedTiers,
      },
    });
  } catch (error) {
    console.error("Server error updateDiscountCode:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật mã giảm giá",
    });
  }
};

/**
 * DELETE /api/admin/discounts/:id
 * Xóa mã giảm giá
 */
export const deleteDiscountCode = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("discount_codes")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete discount code error:", error);
      return res.status(500).json({
        success: false,
        message: "Không thể xóa mã giảm giá",
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Xóa mã giảm giá thành công",
    });
  } catch (error) {
    console.error("Server error deleteDiscountCode:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa mã giảm giá",
    });
  }
};

/**
 * PATCH /api/admin/discounts/:id/status
 * Đổi trạng thái mã giảm giá
 */
export const updateDiscountStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "expired", "disabled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ",
      });
    }

    const { data, error } = await supabase
      .from("discount_codes")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Update discount status error:", error);
      return res.status(500).json({
        success: false,
        message: "Không thể cập nhật trạng thái",
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      data,
    });
  } catch (error) {
    console.error("Server error updateDiscountStatus:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật trạng thái",
    });
  }
};