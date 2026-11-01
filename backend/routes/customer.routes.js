import express from "express";

import {
    createCustomerController, getAllCustomersController, getCustomerByIdController, updateCustomerController, deleteCustomerController
} from "../controllers/customer.controller.js";

const router = express.Router();

router.post("/", createCustomerController);
router.get("/", getAllCustomersController);
router.get("/:customerId", getCustomerByIdController);
router.patch("/:customerId", updateCustomerController);
router.delete("/:customerId", deleteCustomerController);

export default router;
