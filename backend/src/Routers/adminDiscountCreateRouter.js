import express from "express";

import {
  getAllDiscountCodes,
  getDiscountCodeById,
  createDiscountCode,
  updateDiscountCode,
  deleteDiscountCode,
  updateDiscountStatus,
  getDiscountEventOptions,
} from "../Controllers/adminDiscountCreateController.js";

const router = express.Router();

router.get("/", getAllDiscountCodes);

router.get("/event-options", getDiscountEventOptions);

router.get("/:id", getDiscountCodeById);

router.post("/", createDiscountCode);

router.put("/:id", updateDiscountCode);

router.delete("/:id", deleteDiscountCode);

router.patch("/:id/status", updateDiscountStatus);

export default router;