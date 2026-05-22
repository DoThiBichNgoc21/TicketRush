import express from "express";
import { validateDiscountCode, getAvailableDiscounts } from "../Controllers/discountController.js";
import { verifyToken, requireUser } from "../middleware/authMiddleware.js";

const router = express.Router();

// Chỉ người dùng đã đăng nhập mới được dùng mã giảm giá
router.post("/validate", verifyToken, requireUser, validateDiscountCode);
router.get("/available", verifyToken, requireUser, getAvailableDiscounts);

export default router;
