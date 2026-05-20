import express from "express";
import {
  getEvents,
  getEventById,
  getShowtimeBookingDetail,
  getShowtimesByEventId,
  getSeatingChartByShowtime,
  createEvent,
  updateEvent,
  updateEventVisibility,
  setupEventSeats,
  getEventStats,
} from "../Controllers/adminEventDashboardController.js";

const router = express.Router();

// Các route cụ thể phải đứng trước /:id
router.get("/", getEvents);
router.get("/showtimes/:showtimeId/seating-chart", getSeatingChartByShowtime);
router.get("/showtimes/:showtimeId/booking", getShowtimeBookingDetail);
router.get("/:eventId/showtimes", getShowtimesByEventId);
router.get("/:id", getEventById);

router.post("/", createEvent);
router.put("/:id", updateEvent);
router.patch("/:id/visibility", updateEventVisibility);
router.post("/:id/seats", setupEventSeats);
router.get("/:id/stats", getEventStats);

export default router;