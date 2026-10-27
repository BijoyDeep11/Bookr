import pool from "../db/pool.js"
import { getOrganizationById } from "./organization.service.js";

async function createLocation({ name, address, organizationId }) {

    const organization = await getOrganizationById(organizationId);

    if (!organization) {
        const error = new Error("Organization not found");
        error.statusCode = 404;
        throw error;
    }

    const result = await pool.query(
        `
        INSERT INTO locations(name, address, organization_id)
        VALUES ($1, $2, $3)
        RETURNING *;
        `,[name, address, organizationId]
    );

    return result.rows[0];
}

async function getLocations(organizationId) {
    const organization = await getOrganizationById(organizationId);

    if (!organization) {
        const error = new Error("Organization not found");
        error.statusCode = 404;
        throw error;
    }

    const result = await pool.query(
        `SELECT *
         FROM locations
         WHERE organization_id = $1;`,
        [organizationId]
    );

    return result.rows;
}

async function getLocationById(organizationId, locationId) {
    const organization = await getOrganizationById(organizationId);

    if (!organization) {
        const error = new Error("Organization not found");
        error.statusCode = 404;
        throw error;
    }

    const result = await pool.query(
        `SELECT *
         FROM locations
         WHERE organization_id = $1
         AND id = $2;`,
        [organizationId, locationId]
    );

    return result.rows[0] ?? null;
}


async function updateLocation(organizationId, locationId, updates) {
    const organization = await getOrganizationById(organizationId);

    if (!organization) {
        const error = new Error("Organization not found");
        error.statusCode = 404;
        throw error;
    }

    const existingLocation = await getLocationById(
        organizationId,
        locationId
    );

    if (!existingLocation) {
        return null;
    }

    const fields = Object.keys(updates);
    const values = Object.values(updates);

    const setClause = fields
        .map((field, index) => `${field} = $${index + 1}`)
        .join(", ");

    values.push(locationId, organizationId);

    const result = await pool.query(
        `UPDATE locations
         SET ${setClause}, updated_at = NOW()
         WHERE id = $${values.length - 1}
         AND organization_id = $${values.length}
         RETURNING *;`,
        values
    );

    return result.rows[0] ?? null;
}

async function deleteLocation(organizationId, locationId) {
    const organization = await getOrganizationById(organizationId);

    if (!organization) {
        const error = new Error("Organization not found");
        error.statusCode = 404;
        throw error;
    }

    const result = await pool.query(
        `DELETE FROM locations
         WHERE id = $1
         AND organization_id = $2
         RETURNING *;`,
        [locationId, organizationId]
    );

    return result.rows[0] ?? null;
}

export {createLocation, getLocations, getLocationById, updateLocation, deleteLocation} 