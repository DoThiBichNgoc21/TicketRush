import express from "express";
import { getDashboardStats } from "../Controllers/adminDashboardController.js";
import { verifyToken, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Sử dụng verifyToken và requireAdmin để chỉ cho phép Admin thật sự truy cập
router.get("/", verifyToken, requireAdmin, getDashboardStats);

export default router;
