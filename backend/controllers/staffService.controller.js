
import {
    assignServiceToStaff, getServicesByStaff, getStaffByService, updateStaffService, removeServiceFromStaff
} from "../services/staffservice.service.js";

const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function assignServiceToStaffController(req, res) {
    const { staffId } = req.params;
    const { serviceId } = req.body ?? {};

    if (!uuidRegex.test(staffId) || !uuidRegex.test(serviceId)) {
        return res.status(400).json({
            message: "Invalid staff ID or service ID"
        });
    }

    const assignment = await assignServiceToStaff(
        staffId,
        serviceId
    );

    if (!assignment) {
        return res.status(404).json({
            message: "Staff or service not found, or they belong to different organizations"
        });
    }

    return res.status(201).json({
        message: "Service assigned to staff successfully",
        data: assignment
    });
}



async function getServicesByStaffController(req, res) {
    const { staffId } = req.params;

    if (!uuidRegex.test(staffId)) {
        return res.status(400).json({
            message: "Invalid staff ID"
        });
    }

    const services = await getServicesByStaff(staffId);

    return res.status(200).json({
        count: services.length,
        data: services
    });
}


async function getStaffByServiceController(req, res) {
    const { serviceId } = req.params;

    if (!uuidRegex.test(serviceId)) {
        return res.status(400).json({
            message: "Invalid service ID"
        });
    }

    const staff = await getStaffByService(serviceId);

    return res.status(200).json({
        count: staff.length,
        data: staff
    });
}

async function updateStaffServiceController(req, res) {
    const { staffId, serviceId } = req.params;
    const { newStaffId, newServiceId } = req.body ?? {};

    if (
        !uuidRegex.test(staffId) ||
        !uuidRegex.test(serviceId) ||
        (newStaffId && !uuidRegex.test(newStaffId)) ||
        (newServiceId && !uuidRegex.test(newServiceId))
    ) {
        return res.status(400).json({
            message: "Invalid ID format"
        });
    }

    if (Boolean(newStaffId) === Boolean(newServiceId)) {
        return res.status(400).json({
            message: "Provide exactly one of newStaffId or newServiceId"
        });
    }

    const assignment = await updateStaffService(
        staffId,
        serviceId,
        newStaffId ?? staffId,
        newServiceId ?? serviceId
    );

    if (!assignment) {
        return res.status(404).json({
            message: "Assignment not found, or the new staff and service do not belong to the same organization"
        });
    }

    return res.status(200).json({
        message: "Assignment updated successfully",
        data: assignment
    });
}

async function removeServiceFromStaffController(req, res) {
    const { staffId, serviceId } = req.params;

    if (!uuidRegex.test(staffId) || !uuidRegex.test(serviceId)) {
        return res.status(400).json({
            message: "Invalid staff ID or service ID"
        });
    }

    const assignment = await removeServiceFromStaff(
        staffId,
        serviceId
    );

    if (!assignment) {
        return res.status(404).json({
            message: "Staff-service assignment not found"
        });
    }

    return res.status(200).json({
        message: "Service removed from staff successfully",
        data: assignment
    });
}

export {
    assignServiceToStaffController, getServicesByStaffController, getStaffByServiceController, updateStaffServiceController, removeServiceFromStaffController
};
