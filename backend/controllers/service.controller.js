
import { createService, getServicesByOrganization, getServiceById, updateService, deleteService } from "../services/service.service.js";
import { getOrganizationById } from "../services/organization.service.js";

const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function createServiceController(req, res) {
    const { organizationId } = req.params;

    const {
        name,
        type,
        price,
        duration
    } = req.body ?? {};

    // Validate organization UUID
    if (!uuidRegex.test(organizationId)) {
        return res.status(400).json({
            message: "Invalid organization ID"
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

    // Validate optional type
    if (
        type !== undefined &&
        type !== null &&
        (
            typeof type !== "string" ||
            type.trim().length === 0 ||
            type.trim().length > 50
        )
    ) {
        return res.status(400).json({
            message: "Type must be a non-empty string of at most 50 characters"
        });
    }

    // Validate price
    if (
        price !== undefined &&
        price !== null &&
        (
            typeof price !== "number" ||
            !Number.isFinite(price) ||
            price < 0 ||
            price > 99999999.99 ||
            Number(price.toFixed(2)) !== price
        )
    ) {
        return res.status(400).json({
            message: "Price must be a non-negative number with at most 2 decimal places"
        });
    }

    // Validate duration
    if (
        duration !== undefined &&
        duration !== null &&
        (
            !Number.isInteger(duration) ||
            duration <= 0
        )
    ) {
        return res.status(400).json({
            message: "Duration must be a positive integer"
        });
    }

    // Verify organization exists
    const organization = await getOrganizationById(organizationId);

    if (!organization) {
        return res.status(404).json({
            message: "Organization not found"
        });
    }

    const service = await createService({
        name: name.trim(),
        type: type?.trim() ?? null,
        price: price ?? null,
        duration: duration ?? null,
        organizationId
    });

    return res.status(201).json({
        message: "Service created successfully",
        data: service
    });
}



async function getServicesByOrganizationController(req, res) {
    const { organizationId } = req.params;

    if (!uuidRegex.test(organizationId)) {
        return res.status(400).json({
            message: "Invalid organization ID"
        });
    }

    const organization = await getOrganizationById(organizationId);

    if (!organization) {
        return res.status(404).json({
            message: "Organization not found"
        });
    }

    const services = await getServicesByOrganization(organizationId);

    return res.status(200).json({
        count: services.length,
        data: services
    });
}


async function getServiceByIdController(req, res) {
    const { organizationId, serviceId } = req.params;

    if (
        !uuidRegex.test(organizationId) ||
        !uuidRegex.test(serviceId)
    ) {
        return res.status(400).json({
            message: "Invalid organization ID or service ID"
        });
    }

    const organization = await getOrganizationById(organizationId);

    if (!organization) {
        return res.status(404).json({
            message: "Organization not found"
        });
    }

    const service = await getServiceById(
        organizationId,
        serviceId
    );

    if (!service) {
        return res.status(404).json({
            message: "Service not found for this organization"
        });
    }

    return res.status(200).json({
        data: service
    });
}


async function updateServiceController(req, res) {
    const { organizationId, serviceId } = req.params;

    const allowedFields = ["name", "type", "price", "duration"];

    if (
        !uuidRegex.test(organizationId) ||
        !uuidRegex.test(serviceId)
    ) {
        return res.status(400).json({
            message: "Invalid organization ID or service ID"
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

    if (
        "name" in body &&
        (
            typeof body.name !== "string" ||
            body.name.trim().length === 0 ||
            body.name.trim().length > 50
        )
    ) {
        return res.status(400).json({
            message: "Name must be a non-empty string of at most 50 characters"
        });
    }

    if (
        "type" in body &&
        body.type !== null &&
        (
            typeof body.type !== "string" ||
            body.type.trim().length === 0 ||
            body.type.trim().length > 50
        )
    ) {
        return res.status(400).json({
            message: "Type must be a non-empty string of at most 50 characters"
        });
    }

    if (
        "price" in body &&
        body.price !== null &&
        (
            typeof body.price !== "number" ||
            !Number.isFinite(body.price) ||
            body.price < 0 ||
            body.price > 99999999.99 ||
            Number(body.price.toFixed(2)) !== body.price
        )
    ) {
        return res.status(400).json({
            message: "Price must be a non-negative number with at most 2 decimal places"
        });
    }

    if (
        "duration" in body &&
        body.duration !== null &&
        (
            !Number.isInteger(body.duration) ||
            body.duration <= 0
        )
    ) {
        return res.status(400).json({
            message: "Duration must be a positive integer"
        });
    }

    const updates = {};

    for (const field of suppliedFields) {
        const value = body[field];

        updates[field] =
            typeof value === "string" ? value.trim() : value;
    }

    const organization = await getOrganizationById(organizationId);

    if (!organization) {
        return res.status(404).json({
            message: "Organization not found"
        });
    }

    const service = await updateService(
        organizationId,
        serviceId,
        updates
    );

    if (!service) {
        return res.status(404).json({
            message: "Service not found for this organization"
        });
    }

    return res.status(200).json({
        message: "Service updated successfully",
        data: service
    });
}


async function deleteServiceController(req, res) {
    const { organizationId, serviceId } = req.params;

    if (
        !uuidRegex.test(organizationId) ||
        !uuidRegex.test(serviceId)
    ) {
        return res.status(400).json({
            message: "Invalid organization ID or service ID"
        });
    }

    const organization = await getOrganizationById(organizationId);

    if (!organization) {
        return res.status(404).json({
            message: "Organization not found"
        });
    }

    const service = await deleteService(
        organizationId,
        serviceId
    );

    if (!service) {
        return res.status(404).json({
            message: "Service not found for this organization"
        });
    }

    return res.status(200).json({
        message: "Service deleted successfully",
        data: service
    });
}


export {
    createServiceController, getServicesByOrganizationController, getServiceByIdController, updateServiceController, deleteServiceController
};
