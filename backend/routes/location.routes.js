import express from "express";
import { createLocationController, getLocationsController, getLocationByIdController, updateLocationController, deleteLocationController } from "../controllers/location.controller.js";

const router = express.Router({ mergeParams: true });

router.post("/", createLocationController);
router.get("/", getLocationsController);
router.get("/:locationId", getLocationByIdController);
router.patch("/:locationId", updateLocationController);
router.delete("/:locationId", deleteLocationController);

export default router;