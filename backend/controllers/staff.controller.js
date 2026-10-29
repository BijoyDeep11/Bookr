
import {
    createStaff, getStaffByLocation, getStaffById, updateStaff, deleteStaff
} from "../services/staff.service.js";

import {
    getLocationById
} from "../services/location.service.js";

const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function createStaffController(req, res) {
    const { organizationId, locationId } = req.params;

    const {
        name,
        phone,
        email,
        age,
        gender,
        designation
    } = req.body ?? {};

    // Validate URL parameters
    if (!uuidRegex.test(organizationId) || !uuidRegex.test(locationId)) {
        return res.status(400).json({
            message: "Invalid organization ID or location ID"
        });
    }

    // Validate required name
    if (
        typeof name !== "string" ||
        name.trim().length === 0 ||
        name.trim().length > 50
    ) {
        return res.status(400).json({
            message: "Name is required and must be at most 50 characters"
        });
    }

    // Validate optional string fields
    for (const [field, value] of Object.entries({
        phone,
        email,
        gender,
        designation
    })) {
        if (
            value !== undefined &&
            value !== null &&
            (typeof value !== "string" || value.trim().length === 0)
        ) {
            return res.status(400).json({
                message: `${field} must be a non-empty string when provided`
            });
        }
    }

    // Basic email format check
    if (
        email != null &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
        return res.status(400).json({
            message: "Invalid email format"
        });
    }

    // Age must be an integer if provided
    if (
        age !== undefined &&
        age !== null &&
        (!Number.isInteger(age) || age < 0)
    ) {
        return res.status(400).json({
            message: "Age must be a non-negative integer"
        });
    }

    // Ensure the location belongs to the organization in the URL
    const location = await getLocationById(
        organizationId,
        locationId
    );

    if (!location) {
        return res.status(404).json({
            message: "Location not found for this organization"
        });
    }

    const staff = await createStaff({
        name: name.trim(),
        phone: phone?.trim() ?? null,
        email: email?.trim() ?? null,
        age: age ?? null,
        gender: gender?.trim() ?? null,
        designation: designation?.trim() ?? null,
        locationId
    });

    return res.status(201).json({
        message: "Staff created successfully",
        data: staff
    });
}


async function getStaffByLocationController(req, res) {
    const { organizationId, locationId } = req.params;

    if (!uuidRegex.test(organizationId) || !uuidRegex.test(locationId)) {
        return res.status(400).json({
            message: "Invalid organization ID or location ID"
        });
    }

    const location = await getLocationById(
        organizationId,
        locationId
    );

    if (!location) {
        return res.status(404).json({
            message: "Location not found for this organization"
        });
    }

    const staff = await getStaffByLocation(locationId);

    return res.status(200).json({
        count: staff.length,
        data: staff
    });
}



async function getStaffByIdController(req, res) {
    const { organizationId, locationId, staffId } = req.params;

    if (
        !uuidRegex.test(organizationId) ||
        !uuidRegex.test(locationId) ||
        !uuidRegex.test(staffId)
    ) {
        return res.status(400).json({
            message: "Invalid organization, location, or staff ID"
        });
    }

    const location = await getLocationById(
        organizationId,
        locationId
    );

    if (!location) {
        return res.status(404).json({
            message: "Location not found for this organization"
        });
    }

    const staff = await getStaffById(locationId, staffId);

    if (!staff) {
        return res.status(404).json({
            message: "Staff member not found at this location"
        });
    }

    return res.status(200).json({
        data: staff
    });
}

async function updateStaffController(req, res) {
    const { organizationId, locationId, staffId } = req.params;

    const allowedFields = [
        "name",
        "phone",
        "email",
        "age",
        "gender",
        "designation"
    ];

    if (
        !uuidRegex.test(organizationId) ||
        !uuidRegex.test(locationId) ||
        !uuidRegex.test(staffId)
    ) {
        return res.status(400).json({
            message: "Invalid organization, location, or staff ID"
        });
    }

    const body = req.body ?? {};
    const updates = {};
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

    if (
        "name" in body &&
        (typeof body.name !== "string" ||
            body.name.trim().length === 0 ||
            body.name.trim().length > 50)
    ) {
        return res.status(400).json({
            message: "Name must be a non-empty string of at most 50 characters"
        });
    }

    for (const field of ["phone", "email", "gender", "designation"]) {
        if (
            body[field] !== undefined &&
            body[field] !== null &&
            (typeof body[field] !== "string" ||
                body[field].trim().length === 0)
        ) {
            return res.status(400).json({
                message: `${field} must be a non-empty string when provided`
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

    if (
        body.age !== undefined &&
        body.age !== null &&
        (!Number.isInteger(body.age) || body.age < 0)
    ) {
        return res.status(400).json({
            message: "Age must be a non-negative integer"
        });
    }

    for (const field of suppliedFields) {
        const value = body[field];

        updates[field] =
            typeof value === "string" ? value.trim() : value;
    }

    const location = await getLocationById(
        organizationId,
        locationId
    );

    if (!location) {
        return res.status(404).json({
            message: "Location not found for this organization"
        });
    }

    const staff = await updateStaff(
        locationId,
        staffId,
        updates
    );

    if (!staff) {
        return res.status(404).json({
            message: "Staff member not found at this location"
        });
    }

    return res.status(200).json({
        message: "Staff updated successfully",
        data: staff
    });
}



async function deleteStaffController(req, res) {
    const { organizationId, locationId, staffId } = req.params;

    if (
        !uuidRegex.test(organizationId) ||
        !uuidRegex.test(locationId) ||
        !uuidRegex.test(staffId)
    ) {
        return res.status(400).json({
            message: "Invalid organization, location, or staff ID"
        });
    }

    const location = await getLocationById(
        organizationId,
        locationId
    );

    if (!location) {
        return res.status(404).json({
            message: "Location not found for this organization"
        });
    }

    const staff = await deleteStaff(locationId, staffId);

    if (!staff) {
        return res.status(404).json({
            message: "Staff member not found at this location"
        });
    }

    return res.status(200).json({
        message: "Staff deleted successfully",
        data: staff
    });
}


export {
    createStaffController, getStaffByLocationController, getStaffByIdController, updateStaffController, deleteStaffController
};
