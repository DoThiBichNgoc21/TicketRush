import express from "express";
import { getRevenueData } from "../Controllers/adminRevenueController.js";

const router = express.Router();

router.get("/", getRevenueData);

export default router; // **phải có export default**