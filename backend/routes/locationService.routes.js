import express from "express";

import {
    assignServiceToLocationController, getServicesByLocationController, getLocationsByServiceController, updateLocationServiceController, removeServiceFromLocationController
} from "../controllers/locationService.controller.js";

const router = express.Router();

router.post(
    "/:locationId/services",
    assignServiceToLocationController
);

router.get(
    "/:locationId/services",
    getServicesByLocationController
);

router.get(
    "/services/:serviceId/locations",
    getLocationsByServiceController
);

router.patch(
    "/:locationId/services/:serviceId",
    updateLocationServiceController
);

router.delete(
    "/:locationId/services/:serviceId",
    removeServiceFromLocationController
);

export default router;