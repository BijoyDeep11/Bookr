import {
    assignServiceToLocation, getServicesByLocation, getLocationsByService, updateLocationService, removeServiceFromLocation
} from "../services/locationService.service.js";

const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function assignServiceToLocationController(req, res) {
    const { locationId } = req.params;
    const { serviceId } = req.body ?? {};

    // Validate UUIDs
    if (
        !uuidRegex.test(locationId) ||
        !uuidRegex.test(serviceId)
    ) {
        return res.status(400).json({
            message: "Invalid location ID or service ID"
        });
    }

    // Create assignment
    const assignment = await assignServiceToLocation(
        locationId,
        serviceId
    );

    // Handle missing records or organization mismatch
    if (!assignment) {
        return res.status(404).json({
            message: "Location or service not found, or they belong to different organizations"
        });
    }

    return res.status(201).json({
        message: "Service assigned to location successfully",
        data: assignment
    });
}


async function getServicesByLocationController(req, res) {
    const { locationId } = req.params;

    if (!uuidRegex.test(locationId)) {
        return res.status(400).json({
            message: "Invalid location ID"
        });
    }

    const services = await getServicesByLocation(locationId);

    return res.status(200).json({
        count: services.length,
        data: services
    });
}

async function getLocationsByServiceController(req, res) {
    const { serviceId } = req.params;

    if (!uuidRegex.test(serviceId)) {
        return res.status(400).json({
            message: "Invalid service ID"
        });
    }

    const locations = await getLocationsByService(serviceId);

    return res.status(200).json({
        count: locations.length,
        data: locations
    });
}

async function updateLocationServiceController(req, res) {
    const { locationId, serviceId } = req.params;
    const { newLocationId, newServiceId } = req.body ?? {};

    // Validate IDs
    if (
        !uuidRegex.test(locationId) ||
        !uuidRegex.test(serviceId) ||
        (newLocationId && !uuidRegex.test(newLocationId)) ||
        (newServiceId && !uuidRegex.test(newServiceId))
    ) {
        return res.status(400).json({
            message: "Invalid ID format"
        });
    }

    // Require exactly one new ID
    if (Boolean(newLocationId) === Boolean(newServiceId)) {
        return res.status(400).json({
            message: "Provide exactly one of newLocationId or newServiceId"
        });
    }

    const assignment = await updateLocationService(
        locationId,
        serviceId,
        newLocationId ?? locationId,
        newServiceId ?? serviceId
    );

    if (!assignment) {
        return res.status(404).json({
            message: "Assignment not found, or the new location and service do not belong to the same organization"
        });
    }

    return res.status(200).json({
        message: "Location-service assignment updated successfully",
        data: assignment
    });
}

async function removeServiceFromLocationController(req, res) {
    const { locationId, serviceId } = req.params;

    if (
        !uuidRegex.test(locationId) ||
        !uuidRegex.test(serviceId)
    ) {
        return res.status(400).json({
            message: "Invalid location ID or service ID"
        });
    }

    const assignment = await removeServiceFromLocation(
        locationId,
        serviceId
    );

    if (!assignment) {
        return res.status(404).json({
            message: "Location-service assignment not found"
        });
    }

    return res.status(200).json({
        message: "Service removed from location successfully",
        data: assignment
    });
}

export {
    assignServiceToLocationController, getServicesByLocationController, getLocationsByServiceController, updateLocationServiceController, removeServiceFromLocationController
};