
import express from "express";

import {
    assignServiceToStaffController, getServicesByStaffController, getStaffByServiceController, updateStaffServiceController, removeServiceFromStaffController
} from "../controllers/staffService.controller.js";

const router = express.Router();

router.post("/:staffId/services", assignServiceToStaffController);
router.get("/:staffId/services", getServicesByStaffController);
router.get("/services/:serviceId/staff", getStaffByServiceController);
router.patch("/:staffId/services/:serviceId",updateStaffServiceController);
router.delete("/:staffId/services/:serviceId",removeServiceFromStaffController);

export default router;
