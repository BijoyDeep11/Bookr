import {
    getOrganizations,
    createOrganization,
    getOrganizationById,
    updateOrganization,
    deleteOrganization
} from "../services/organization.service.js";

const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const allowedFields = ["name", "type", "email"];

async function getOrganizationsController(req, res) {
    const response = await getOrganizations();
    return res.status(200).json(response);
}

async function createOrganizationsController(req, res) {
    const { name, type, email } = req.body ?? {};

    if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
            message: "Organization name must be a non-empty string"
        });
    }

    if (typeof type !== "string" || !type.trim()) {
        return res.status(400).json({
            message: "Organization type must be a non-empty string"
        });
    }

    if (email !== undefined && email !== null) {
        if (
            typeof email !== "string" ||
            !email.trim() ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {
            return res.status(400).json({
                message: "Please provide a valid email address"
            });
        }
    }

    const response = await createOrganization({
        name: name.trim(),
        type: type.trim(),
        email: typeof email === "string" ? email.trim() : email
    });

    return res.status(201).json(response);
}

async function getOrganizationByIdController(req, res) {
    const id = req.params.id;

    if (!uuidRegex.test(id)) {
        return res.status(400).json({
            message: "Invalid organization ID"
        });
    }

    const organization = await getOrganizationById(id);

    if (!organization) {
        return res.status(404).json({
            message: "Organization not found"
        });
    }

    return res.status(200).json(organization);
}

async function updateOrganizationController(req, res) {
    const id = req.params.id;

    if (!uuidRegex.test(id)) {
        return res.status(400).json({
            message: "Invalid organization ID"
        });
    }

    const body = req.body ?? {};
    const fields = Object.keys(body);

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

        if (field === "name" || field === "type") {
            if (typeof value !== "string" || !value.trim()) {
                return res.status(400).json({
                    message: `${field} must be a non-empty string`
                });
            }

            updates[field] = value.trim();
        }

        if (field === "email") {
            if (
                value !== null &&
                (
                    typeof value !== "string" ||
                    !value.trim() ||
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                )
            ) {
                return res.status(400).json({
                    message: "Please provide a valid email address"
                });
            }

            updates.email =
                typeof value === "string" ? value.trim() : value;
        }
    }

    const organization = await updateOrganization(id, updates);

    if (!organization) {
        return res.status(404).json({
            message: "Organization not found"
        });
    }

    return res.status(200).json(organization);
}

async function deleteOrganizationController(req, res) {
    const id = req.params.id;

    if (!uuidRegex.test(id)) {
        return res.status(400).json({
            message: "Invalid organization ID"
        });
    }

    const organization = await deleteOrganization(id);

    if (!organization) {
        return res.status(404).json({
            message: "Organization not found"
        });
    }

    return res.status(200).json({
        message: "Organization deleted successfully",
        organization
    });
}

export {
    getOrganizationsController,
    createOrganizationsController,
    getOrganizationByIdController,
    updateOrganizationController,
    deleteOrganizationController
};