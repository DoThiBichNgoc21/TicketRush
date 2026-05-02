import express from "express";
import {
    createEventStep1,
    createShowtimeStep2,
    createSeatingChartStep3
} from "../Controllers/adminEventController.js";

const router = express.Router();

router.post("/step-1", createEventStep1);
router.post("/:event_id/step-2/showtime", createShowtimeStep2);
router.post("/:event_id/step-3/seats", createSeatingChartStep3);

export default router;