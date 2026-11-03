import pool from "../db/pool.js";

async function assignServiceToLocation(locationId, serviceId) {
    const result = await pool.query(
        `INSERT INTO location_services (location_id, service_id)
         SELECT locations.id, services.id
         FROM locations
         JOIN services
             ON services.organization_id = locations.organization_id
         WHERE locations.id = $1
           AND services.id = $2
         RETURNING *;`,
        [locationId, serviceId]
    );

    return result.rows[0] ?? null;
}

async function getServicesByLocation(locationId) {
    const result = await pool.query(
        `SELECT services.*
         FROM location_services
         JOIN services
             ON services.id = location_services.service_id
         WHERE location_services.location_id = $1
         ORDER BY services.name ASC;`,
        [locationId]
    );

    return result.rows;
}

async function getLocationsByService(serviceId) {
    const result = await pool.query(
        `SELECT locations.*
         FROM location_services
         JOIN locations
             ON locations.id = location_services.location_id
         WHERE location_services.service_id = $1
         ORDER BY locations.name ASC;`,
        [serviceId]
    );

    return result.rows;
}

async function updateLocationService(
    oldLocationId,
    oldServiceId,
    newLocationId,
    newServiceId
) {
    const result = await pool.query(
        `UPDATE location_services
         SET location_id = $1,
             service_id = $2
         WHERE location_id = $3
           AND service_id = $4
           AND EXISTS (
               SELECT 1
               FROM locations
               JOIN services
                   ON services.organization_id = locations.organization_id
               WHERE locations.id = $1
                 AND services.id = $2
           )
         RETURNING *;`,
        [newLocationId, newServiceId, oldLocationId, oldServiceId]
    );

    return result.rows[0] ?? null;
}

async function removeServiceFromLocation(locationId, serviceId) {
    const result = await pool.query(
        `DELETE FROM location_services
         WHERE location_id = $1
           AND service_id = $2
         RETURNING *;`,
        [locationId, serviceId]
    );

    return result.rows[0] ?? null;
}

export {
    assignServiceToLocation, getServicesByLocation, getLocationsByService, updateLocationService, removeServiceFromLocation
};