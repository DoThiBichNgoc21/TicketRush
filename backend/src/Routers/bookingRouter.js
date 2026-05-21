import { Router } from "express"

import { verifyToken, requireUser } from "../middleware/authMiddleware.js"

import {

  holdSeat,

  releaseSeat,

  releaseSeats,

  confirmBooking,

  getLockedSeats,

} from "../Controllers/seatHoldController.js"



const router = Router()



router.use(verifyToken, requireUser)



router.post("/seats/:seatId/hold", holdSeat)

router.post("/seats/:seatId/release", releaseSeat)

router.get("/showtimes/:showtimeId/locked-seats", getLockedSeats)

router.post("/seats/release", releaseSeats)

router.post("/confirm", confirmBooking)



export default router

