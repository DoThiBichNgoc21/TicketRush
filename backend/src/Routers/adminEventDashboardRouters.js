import express from "express";
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  updateEventVisibility,
  setupEventSeats,
  getEventStats,
} from "../Controllers/adminEventDashboardController.js";

const router = express.Router();

router.get("/", getEvents);
router.get("/:id", getEventById);

router.post("/", createEvent);
router.put("/:id", updateEvent);
router.patch("/:id/visibility", updateEventVisibility);
router.post("/:id/seats", setupEventSeats);
router.get("/:id/stats", getEventStats);

export default router;