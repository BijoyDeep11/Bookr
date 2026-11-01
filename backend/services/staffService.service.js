
import pool from "../db/pool.js";

async function assignServiceToStaff(staffId, serviceId) {
    const result = await pool.query(
        `INSERT INTO staff_services (staff_id, service_id)
         SELECT staff.id, services.id
         FROM staff
         JOIN locations
            ON locations.id = staff.location_id
         JOIN services
            ON services.organization_id = locations.organization_id
         WHERE staff.id = $1
           AND services.id = $2
         RETURNING *;`,
        [staffId, serviceId]
    );

    return result.rows[0] ?? null;
}



async function getServicesByStaff(staffId) {
    const result = await pool.query(
        `SELECT services.*
         FROM staff_services
         JOIN services
            ON services.id = staff_services.service_id
         WHERE staff_services.staff_id = $1
         ORDER BY services.name ASC;`,
        [staffId]
    );

    return result.rows;
}


async function getStaffByService(serviceId) {
    const result = await pool.query(
        `SELECT staff.*
         FROM staff_services
         JOIN staff
            ON staff.id = staff_services.staff_id
         WHERE staff_services.service_id = $1
         ORDER BY staff.name ASC;`,
        [serviceId]
    );

    return result.rows;
}

async function updateStaffService(
    oldStaffId,
    oldServiceId,
    newStaffId,
    newServiceId
) {
    const result = await pool.query(
        `UPDATE staff_services
            SET staff_id = $1,
                service_id = $2
            WHERE staff_id = $3
            AND service_id = $4
            AND EXISTS (
                SELECT 1
                FROM staff
                JOIN locations
                    ON locations.id = staff.location_id
                JOIN services
                    ON services.organization_id = locations.organization_id
                WHERE staff.id = $1
                    AND services.id = $2
            )
            RETURNING *;`, [newStaffId, newServiceId, oldStaffId, oldServiceId]
    );

    return result.rows[0] ?? null;
}

async function removeServiceFromStaff(staffId, serviceId) {
    const result = await pool.query(
        `DELETE FROM staff_services
         WHERE staff_id = $1
           AND service_id = $2
         RETURNING *;`,
        [staffId, serviceId]
    );

    return result.rows[0] ?? null;
}

export {
    assignServiceToStaff, getServicesByStaff, getStaffByService, updateStaffService, removeServiceFromStaff
};

