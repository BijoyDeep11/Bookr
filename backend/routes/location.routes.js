import express from "express";
import { createLocationController, getLocationsController, getLocationByIdController, updateLocationController, deleteLocationController } from "../controllers/location.controller.js";
import staffRouter from "./staff.routes.js";

const router = express.Router({ mergeParams: true });

router.post("/", createLocationController);
router.get("/", getLocationsController);
router.get("/:locationId", getLocationByIdController);
router.patch("/:locationId", updateLocationController);
router.delete("/:locationId", deleteLocationController);

router.use("/:locationId/staff", staffRouter);

export default router;