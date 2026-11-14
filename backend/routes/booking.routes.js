import express from "express";

import {
    createBookingController, getAllBookingsController, getBookingByIdController, updateBookingController, deleteBookingController
} from "../controllers/booking.controller.js";

const router = express.Router();

router.post("/", createBookingController);
router.get("/", getAllBookingsController);
router.get("/:bookingId", getBookingByIdController);
router.patch("/:bookingId", updateBookingController);
router.delete("/:bookingId", deleteBookingController);

export default router;