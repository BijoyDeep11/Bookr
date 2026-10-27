import { createLocation, getLocations, getLocationById, updateLocation, deleteLocation } from "../services/location.service.js";

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function createLocationController(req, res) {
    const organizationId = req.params.organizationId;
    const name = req.body.name;
    const address = req.body.address;

    if (!uuidRegex.test(organizationId)) {
        return res.status(400).json({
            message: "Invalid organization ID"
        });
    }

    if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
            message: "Location name must be a non-empty string"
        });
    }

    if (
        typeof address !== "string" ||
        !address.trim() ||
        address.trim().length > 100
    ) {
        return res.status(400).json({
            message: "Address must be a non-empty string of at most 100 characters"
        });
    }

    const location = await createLocation({
        name: name.trim(),
        address: address.trim(),
        organizationId
    });

    return res.status(201).json(location);

}

async function getLocationsController(req, res) {
    const organizationId = req.params.organizationId;

    if (!uuidRegex.test(organizationId)) {
        return res.status(400).json({
            message: "Invalid organization ID"
        });
    }

    const locations = await getLocations(organizationId);

    return res.status(200).json(locations);
}

async function getLocationByIdController(req, res) {
    const organizationId = req.params.organizationId;
    const locationId = req.params.locationId;

    if (
        !uuidRegex.test(organizationId) ||
        !uuidRegex.test(locationId)
    ) {
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
            message: "Location not found"
        });
    }

    return res.status(200).json(location);
}

async function updateLocationController(req, res) {
    const organizationId = req.params.organizationId;
    const locationId = req.params.locationId;

    if (
        !uuidRegex.test(organizationId) ||
        !uuidRegex.test(locationId)
    ) {
        return res.status(400).json({
            message: "Invalid organization ID or location ID"
        });
    }

    const body = req.body ?? {};
    const fields = Object.keys(body);
    const allowedFields = ["name", "address"];

    const invalidFields = fields.filter(
        (field) => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
        return res.status(400).json({
            message: `Unsupported fields: ${invalidFields.join(", ")}`
        });
    }

    if (fields.length === 0) {
        return res.status(400).json({
            message: "Provide at least one field to update"
        });
    }

    const updates = {};

    for (const field of fields) {
        const value = body[field];

        if (typeof value !== "string" || !value.trim()) {
            return res.status(400).json({
                message: `${field} must be a non-empty string`
            });
        }

        if (field === "name" && value.trim().length > 50) {
            return res.status(400).json({
                message: "Location name cannot exceed 50 characters"
            });
        }

        if (field === "address" && value.trim().length > 100) {
            return res.status(400).json({
                message: "Address cannot exceed 100 characters"
            });
        }

        updates[field] = value.trim();
    }

    const location = await updateLocation(
        organizationId,
        locationId,
        updates
    );

    if (!location) {
        return res.status(404).json({
            message: "Location not found"
        });
    }

    return res.status(200).json(location);
}

async function deleteLocationController(req, res) {
    const organizationId = req.params.organizationId;
    const locationId = req.params.locationId;

    if (
        !uuidRegex.test(organizationId) ||
        !uuidRegex.test(locationId)
    ) {
        return res.status(400).json({
            message: "Invalid organization ID or location ID"
        });
    }

    const location = await deleteLocation(
        organizationId,
        locationId
    );

    if (!location) {
        return res.status(404).json({
            message: "Location not found"
        });
    }

    return res.status(200).json({
        message: "Location deleted successfully",
        location
    });
}

export {createLocationController, getLocationsController, getLocationByIdController, updateLocationController, deleteLocationController}
