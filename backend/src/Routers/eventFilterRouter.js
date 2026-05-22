import express from "express";
import { getFilterOptions } from "../Controllers/eventFilterController.js";

const router = express.Router();

router.get("/filters", getFilterOptions);

export default router;
