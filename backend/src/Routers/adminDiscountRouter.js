import express from "express";

import {
  getDiscountCodes,
  getDiscountCodeById,
  createDiscountCode,
  updateDiscountCode,
  deleteDiscountCode,
  getDiscountStats,
} from "../Controllers/adminDiscountController.js";

const router = express.Router();

router.get("/", getDiscountCodes);
router.get("/stats", getDiscountStats);
router.get("/:id", getDiscountCodeById);
router.post("/", createDiscountCode);
router.put("/:id", updateDiscountCode);
router.delete("/:id", deleteDiscountCode);

export default router;
