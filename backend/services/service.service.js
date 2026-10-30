
import pool from "../db/pool.js";

async function createService({
    name,
    type,
    price,
    duration,
    organizationId
}) {
    const result = await pool.query(
        `INSERT INTO services (
            name,
            type,
            price,
            duration,
            organization_id
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;`,
        [
            name,
            type ?? null,
            price ?? null,
            duration ?? null,
            organizationId
        ]
    );

    return result.rows[0];
}


async function getServicesByOrganization(organizationId) {
    const result = await pool.query(
        `SELECT *
         FROM services
         WHERE organization_id = $1
         ORDER BY created_at DESC;`,
        [organizationId]
    );

    return result.rows;
}


async function getServiceById(organizationId, serviceId) {
    const result = await pool.query(
        `SELECT *
         FROM services
         WHERE organization_id = $1
           AND id = $2;`,
        [organizationId, serviceId]
    );

    return result.rows[0] ?? null;
}


async function updateService(organizationId, serviceId, updates) {
    const fields = Object.keys(updates);

    const setClause = fields
        .map((field, index) => `${field} = $${index + 1}`)
        .join(", ");

    const values = Object.values(updates);

    values.push(organizationId, serviceId);

    const result = await pool.query(
        `UPDATE services
         SET ${setClause}, updated_at = NOW()
         WHERE organization_id = $${values.length - 1}
           AND id = $${values.length}
         RETURNING *;`,
        values
    );

    return result.rows[0] ?? null;
}


async function deleteService(organizationId, serviceId) {
    const result = await pool.query(
        `DELETE FROM services
         WHERE organization_id = $1
           AND id = $2
         RETURNING *;`,
        [organizationId, serviceId]
    );

    return result.rows[0] ?? null;
}


export {
    createService, getServicesByOrganization, getServiceById, updateService, deleteService
};
