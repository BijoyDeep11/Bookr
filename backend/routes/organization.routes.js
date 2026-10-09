import express from "express";
import { getOrganizationsController as getOrganizations, createOrganizationsController as createOrganization } from "../controllers/organization.controller.js";

const router = express.Router();

router.get("/", getOrganizations)
router.post("/", createOrganization)

export default router;