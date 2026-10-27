import express from "express";
import
 { getOrganizationsController as getOrganizations,
   createOrganizationsController as createOrganization,
   getOrganizationByIdController as getOrganizationById,
   updateOrganizationController as updateOrganization,
   deleteOrganizationController as deleteOrganization
} from "../controllers/organization.controller.js";
import locationRouter from "./location.routes.js";

const router = express.Router();

router.get("/", getOrganizations)
router.post("/", createOrganization)
router.get("/:id", getOrganizationById)
router.patch("/:id", updateOrganization)
router.delete("/:id",deleteOrganization)

router.use("/:organizationId/locations", locationRouter);

export default router;