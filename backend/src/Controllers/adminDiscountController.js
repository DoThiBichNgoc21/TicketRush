import supabase from "../config/supabase.js";

const allowedDiscountTypes = ["percentage", "fixed", "tiered"];
const allowedStatuses = ["active", "expired", "disabled"];

const normalizeCode = (code) => {
  return String(code || "").trim().toUpperCase();
};

const toNullableNumber = (value) => {
  if (value === "" || value === undefined || value === null) {
    return null;
  }

  return Number(value);
};

const toNullableDate = (value) => {
  if (value === "" || value === undefined || value === null) {
    return null;
  }

  return value;
};

const validateDiscountPayload = ({
  code,
  discount_type,
  discount_value,
  usage_limit,
  status,
}) => {
  if (!code || !String(code).trim()) {
    return "Vui lòng nhập mã giảm giá";
  }

  if (!discount_type) {
    return "Vui lòng chọn loại giảm giá";
  }

  if (!allowedDiscountTypes.includes(discount_type)) {
    return "Loại giảm giá chỉ được là percentage, fixed hoặc tiered";
  }

  if (!discount_value || Number(discount_value) <= 0) {
    return "Giá trị giảm phải lớn hơn 0";
  }

  if (discount_type === "percentage" && Number(discount_value) > 100) {
    return "Mã giảm theo phần trăm không được lớn hơn 100%";
  }

  if (usage_limit !== "" && usage_limit !== undefined && usage_limit !== null) {
    if (Number(usage_limit) < 0) {
      return "Số lượt dùng tối đa không được nhỏ hơn 0";
    }
  }

  if (status && !allowedStatuses.includes(status)) {
    return "Trạng thái chỉ được là active, expired hoặc disabled";
  }

  return null;
};

const validateTier = (tier) => {
  if (!tier.min_quantity || Number(tier.min_quantity) <= 0) {
    return "Số lượng vé tối thiểu của bậc thang phải lớn hơn 0";
  }

  if (!tier.discount_type) {
    return "Vui lòng chọn loại giảm cho bậc thang";
  }

  if (!["percentage", "fixed"].includes(tier.discount_type)) {
    return "Loại giảm của bậc thang chỉ được là percentage hoặc fixed";
  }

  if (!tier.discount_value || Number(tier.discount_value) <= 0) {
    return "Giá trị giảm của bậc thang phải lớn hơn 0";
  }

  if (
    tier.discount_type === "percentage" &&
    Number(tier.discount_value) > 100
  ) {
    return "Bậc thang giảm theo phần trăm không được lớn hơn 100%";
  }

  return null;
};

export const getDiscountCodes = async (req, res) => {
  try {
    const { search = "", status = "", page = 1, limit = 10 } = req.query;

    const currentPage = Number(page) || 1;
    const pageSize = Number(limit) || 10;
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("discount_codes")
      .select(
        `
        *,
        discount_code_tiers (
          id,
          min_quantity,
          discount_type,
          discount_value,
          created_at,
          updated_at
        )
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (search) {
      query = query.ilike("code", `%${search}%`);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách mã giảm giá thành công",
      data: data || [],
      pagination: {
        page: currentPage,
        limit: pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    });
  } catch (error) {
    console.error("getDiscountCodes error:", error);

    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách mã giảm giá",
      error: error.message,
    });
  }
};

export const getDiscountCodeById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("discount_codes")
      .select(
        `
        *,
        discount_code_tiers (
          id,
          min_quantity,
          discount_type,
          discount_value,
          created_at,
          updated_at
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "Lấy chi tiết mã giảm giá thành công",
      data,
    });
  } catch (error) {
    console.error("getDiscountCodeById error:", error);

    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy chi tiết mã giảm giá",
      error: error.message,
    });
  }
};

export const createDiscountCode = async (req, res) => {
  try {
    const {
      code,
      discount_type,
      discount_value,
      currency = "VND",
      usage_limit,
      starts_at,
      expires_at,
      status = "active",
      tiers = [],
    } = req.body;

    const validationError = validateDiscountPayload({
      code,
      discount_type,
      discount_value,
      usage_limit,
      status,
    });

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    if (discount_type === "tiered") {
      if (!Array.isArray(tiers) || tiers.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Mã bậc thang cần ít nhất một mức giảm",
        });
      }

      for (const tier of tiers) {
        const tierError = validateTier(tier);

        if (tierError) {
          return res.status(400).json({
            success: false,
            message: tierError,
          });
        }
      }
    }

    const payload = {
      code: normalizeCode(code),
      discount_type,
      discount_value: Number(discount_value),
      currency,
      usage_limit: toNullableNumber(usage_limit),
      starts_at: toNullableDate(starts_at),
      expires_at: toNullableDate(expires_at),
      status,
    };

    const { data: discountCode, error: insertError } = await supabase
      .from("discount_codes")
      .insert([payload])
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    let tierData = [];

    if (discount_type === "tiered" && Array.isArray(tiers) && tiers.length > 0) {
      const tierPayload = tiers.map((tier) => ({
        discount_code_id: discountCode.id,
        min_quantity: Number(tier.min_quantity),
        discount_type: tier.discount_type,
        discount_value: Number(tier.discount_value),
      }));

      const { data, error: tierError } = await supabase
        .from("discount_code_tiers")
        .insert(tierPayload)
        .select()
        .order("min_quantity", { ascending: true });

      if (tierError) {
        await supabase.from("discount_codes").delete().eq("id", discountCode.id);
        throw tierError;
      }

      tierData = data || [];
    }

    return res.status(201).json({
      success: true,
      message: "Tạo mã giảm giá thành công",
      data: {
        ...discountCode,
        discount_code_tiers: tierData,
      },
    });
  } catch (error) {
    console.error("createDiscountCode error:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Mã giảm giá đã tồn tại",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Lỗi khi tạo mã giảm giá",
      error: error.message,
    });
  }
};

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

    const payload = {
      updated_at: new Date().toISOString(),
    };

    if (code !== undefined) {
      payload.code = normalizeCode(code);
    }

    if (discount_type !== undefined) {
      if (!allowedDiscountTypes.includes(discount_type)) {
        return res.status(400).json({
          success: false,
          message: "Loại giảm giá chỉ được là percentage, fixed hoặc tiered",
        });
      }

      payload.discount_type = discount_type;
    }

    if (discount_value !== undefined) {
      if (Number(discount_value) <= 0) {
        return res.status(400).json({
          success: false,
          message: "Giá trị giảm phải lớn hơn 0",
        });
      }

      payload.discount_value = Number(discount_value);
    }

    if (
      payload.discount_type === "percentage" &&
      payload.discount_value !== undefined &&
      Number(payload.discount_value) > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Mã giảm theo phần trăm không được lớn hơn 100%",
      });
    }

    if (currency !== undefined) {
      payload.currency = currency;
    }

    if (usage_limit !== undefined) {
      if (usage_limit !== "" && usage_limit !== null && Number(usage_limit) < 0) {
        return res.status(400).json({
          success: false,
          message: "Số lượt dùng tối đa không được nhỏ hơn 0",
        });
      }

      payload.usage_limit = toNullableNumber(usage_limit);
    }

    if (status !== undefined) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Trạng thái chỉ được là active, expired hoặc disabled",
        });
      }

      payload.status = status;
    }

    if (starts_at !== undefined) {
      payload.starts_at = toNullableDate(starts_at);
    }

    if (expires_at !== undefined) {
      payload.expires_at = toNullableDate(expires_at);
    }

    const { data: updatedDiscountCode, error: updateError } = await supabase
      .from("discount_codes")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    let tierData = [];

    if (Array.isArray(tiers)) {
      for (const tier of tiers) {
        const tierError = validateTier(tier);

        if (tierError) {
          return res.status(400).json({
            success: false,
            message: tierError,
          });
        }
      }

      const { error: deleteTierError } = await supabase
        .from("discount_code_tiers")
        .delete()
        .eq("discount_code_id", id);

      if (deleteTierError) {
        throw deleteTierError;
      }

      if (tiers.length > 0) {
        const tierPayload = tiers.map((tier) => ({
          discount_code_id: Number(id),
          min_quantity: Number(tier.min_quantity),
          discount_type: tier.discount_type,
          discount_value: Number(tier.discount_value),
        }));

        const { data, error: insertTierError } = await supabase
          .from("discount_code_tiers")
          .insert(tierPayload)
          .select()
          .order("min_quantity", { ascending: true });

        if (insertTierError) {
          throw insertTierError;
        }

        tierData = data || [];
      }
    } else {
      const { data, error: tierSelectError } = await supabase
        .from("discount_code_tiers")
        .select("*")
        .eq("discount_code_id", id)
        .order("min_quantity", { ascending: true });

      if (tierSelectError) {
        throw tierSelectError;
      }

      tierData = data || [];
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật mã giảm giá thành công",
      data: {
        ...updatedDiscountCode,
        discount_code_tiers: tierData,
      },
    });
  } catch (error) {
    console.error("updateDiscountCode error:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Mã giảm giá đã tồn tại hoặc bậc thang bị trùng",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật mã giảm giá",
      error: error.message,
    });
  }
};

export const deleteDiscountCode = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("discount_codes")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "Xóa mã giảm giá thành công",
    });
  } catch (error) {
    console.error("deleteDiscountCode error:", error);

    return res.status(500).json({
      success: false,
      message: "Lỗi khi xóa mã giảm giá",
      error: error.message,
    });
  }
};

export const getDiscountStats = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("discount_codes")
      .select("status, used_count, discount_type, discount_value");

    if (error) {
      throw error;
    }

    const activeCount = (data || []).filter(
      (item) => item.status === "active"
    ).length;

    const totalUsed = (data || []).reduce((sum, item) => {
      return sum + Number(item.used_count || 0);
    }, 0);

    const estimatedSaved = (data || []).reduce((sum, item) => {
      const usedCount = Number(item.used_count || 0);
      const discountValue = Number(item.discount_value || 0);

      if (item.discount_type === "fixed") {
        return sum + usedCount * discountValue;
      }

      return sum;
    }, 0);

    return res.status(200).json({
      success: true,
      message: "Lấy thống kê mã giảm giá thành công",
      data: {
        activeCount,
        totalUsed,
        estimatedSaved,
      },
    });
  } catch (error) {
    console.error("getDiscountStats error:", error);

    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thống kê mã giảm giá",
      error: error.message,
    });
  }
};