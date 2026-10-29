
import express from "express";
import {
    createStaffController, getStaffByLocationController, getStaffByIdController, updateStaffController, deleteStaffController
} from "../controllers/staff.controller.js";

const router = express.Router({ mergeParams: true });

router.post("/", createStaffController);
router.get("/", getStaffByLocationController);
router.get("/:staffId", getStaffByIdController);
router.patch("/:staffId", updateStaffController);
router.delete("/:staffId", deleteStaffController);

export default router;
