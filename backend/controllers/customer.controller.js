
import { createCustomer, getAllCustomers, getCustomerById, updateCustomer, deleteCustomer } from "../services/customer.service.js";

async function createCustomerController(req, res) {
    const {
        name,
        address,
        phone,
        email,
        gender
    } = req.body ?? {};

    // Validate name
    if (
        typeof name !== "string" ||
        name.trim().length === 0 ||
        name.trim().length > 50
    ) {
        return res.status(400).json({
            message: "Name is required and must be at most 50 characters"
        });
    }

    // Validate address
    if (
        typeof address !== "string" ||
        address.trim().length === 0 ||
        address.trim().length > 255
    ) {
        return res.status(400).json({
            message: "Address is required and must be at most 255 characters"
        });
    }

    // Validate optional string fields
    const optionalFields = {
        phone: 20,
        email: 255,
        gender: 50
    };

    for (const [field, maxLength] of Object.entries(optionalFields)) {
        const value = req.body?.[field];

        if (
            value !== undefined &&
            value !== null &&
            (
                typeof value !== "string" ||
                value.trim().length === 0 ||
                value.trim().length > maxLength
            )
        ) {
            return res.status(400).json({
                message: `${field} must be a non-empty string of at most ${maxLength} characters`
            });
        }
    }

    // Validate email format
    if (
        email != null &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
        return res.status(400).json({
            message: "Invalid email format"
        });
    }

    const customer = await createCustomer({
        name: name.trim(),
        address: address.trim(),
        phone: phone?.trim() ?? null,
        email: email?.trim() ?? null,
        gender: gender?.trim() ?? null
    });

    return res.status(201).json({
        message: "Customer created successfully",
        data: customer
    });
}


async function getAllCustomersController(req, res) {
    const customers = await getAllCustomers();

    return res.status(200).json({
        count: customers.length,
        data: customers
    });
}


const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getCustomerByIdController(req, res) {
    const { customerId } = req.params;

    if (!uuidRegex.test(customerId)) {
        return res.status(400).json({
            message: "Invalid customer ID"
        });
    }

    const customer = await getCustomerById(customerId);

    if (!customer) {
        return res.status(404).json({
            message: "Customer not found"
        });
    }

    return res.status(200).json({
        data: customer
    });
}


async function updateCustomerController(req, res) {
    const { customerId } = req.params;

    const allowedFields = [
        "name",
        "address",
        "phone",
        "email",
        "gender"
    ];

    if (!uuidRegex.test(customerId)) {
        return res.status(400).json({
            message: "Invalid customer ID"
        });
    }

    const body = req.body ?? {};
    const suppliedFields = Object.keys(body);

    if (suppliedFields.length === 0) {
        return res.status(400).json({
            message: "Request body cannot be empty"
        });
    }

    const invalidFields = suppliedFields.filter(
        (field) => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
        return res.status(400).json({
            message: `Invalid fields: ${invalidFields.join(", ")}`
        });
    }

    const requiredFields = {
        name: 50,
        address: 255
    };

    for (const [field, maxLength] of Object.entries(requiredFields)) {
        if (
            field in body &&
            (
                typeof body[field] !== "string" ||
                body[field].trim().length === 0 ||
                body[field].trim().length > maxLength
            )
        ) {
            return res.status(400).json({
                message: `${field} is required and must be at most ${maxLength} characters`
            });
        }
    }

    const optionalFields = {
        phone: 20,
        email: 255,
        gender: 50
    };

    for (const [field, maxLength] of Object.entries(optionalFields)) {
        if (
            body[field] !== undefined &&
            body[field] !== null &&
            (
                typeof body[field] !== "string" ||
                body[field].trim().length === 0 ||
                body[field].trim().length > maxLength
            )
        ) {
            return res.status(400).json({
                message: `${field} must be a non-empty string of at most ${maxLength} characters`
            });
        }
    }

    if (
        body.email != null &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())
    ) {
        return res.status(400).json({
            message: "Invalid email format"
        });
    }

    const updates = {};

    for (const field of suppliedFields) {
        const value = body[field];

        updates[field] =
            typeof value === "string" ? value.trim() : value;
    }

    const customer = await updateCustomer(customerId, updates);

    if (!customer) {
        return res.status(404).json({
            message: "Customer not found"
        });
    }

    return res.status(200).json({
        message: "Customer updated successfully",
        data: customer
    });
}


async function deleteCustomerController(req, res) {
    const { customerId } = req.params;

    if (!uuidRegex.test(customerId)) {
        return res.status(400).json({
            message: "Invalid customer ID"
        });
    }

    const customer = await deleteCustomer(customerId);

    if (!customer) {
        return res.status(404).json({
            message: "Customer not found"
        });
    }

    return res.status(200).json({
        message: "Customer deleted successfully",
        data: customer
    });
}


export {
    createCustomerController, getAllCustomersController, getCustomerByIdController, updateCustomerController, deleteCustomerController
};
