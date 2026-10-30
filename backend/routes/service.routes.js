
import express from "express";

import {
    createServiceController, getServicesByOrganizationController, getServiceByIdController, updateServiceController, deleteServiceController
} from "../controllers/service.controller.js";

const router = express.Router({ mergeParams: true });

router.post("/", createServiceController);
router.get("/", getServicesByOrganizationController);
router.get("/:serviceId", getServiceByIdController);
router.patch("/:serviceId", updateServiceController);
router.delete("/:serviceId", deleteServiceController);

export default router;
