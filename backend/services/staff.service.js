import pool from "../db/pool.js"

async function createStaff({
    name,
    phone,
    email,
    age,
    gender,
    designation,
    locationId
}) {
    const result = await pool.query(
    `INSERT INTO staff (
        name, phone, email, age, gender, designation, location_id
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;`,
    [
        name,
        phone ?? null,
        email ?? null,
        age ?? null,
        gender ?? null,
        designation ?? null,
        locationId
    ]
);

return result.rows[0];
}


async function getStaffByLocation(locationId) {
    const result = await pool.query(
        `SELECT *
         FROM staff
         WHERE location_id = $1
         ORDER BY created_at DESC;`,
        [locationId]
    );

    return result.rows;
}


async function getStaffById(locationId, staffId) {
    const result = await pool.query(
        `SELECT *
         FROM staff
         WHERE location_id = $1
           AND id = $2;`,
        [locationId, staffId]
    );

    return result.rows[0] ?? null;
}


async function updateStaff(locationId, staffId, updates) {
    const fields = Object.keys(updates);

    const setClause = fields
        .map((field, index) => `${field} = $${index + 1}`)
        .join(", ");

    const values = Object.values(updates);

    values.push(staffId, locationId);

    const result = await pool.query(
        `UPDATE staff
         SET ${setClause}, updated_at = NOW()
         WHERE id = $${values.length - 1}
           AND location_id = $${values.length}
         RETURNING *;`,
        values
    );

    return result.rows[0] ?? null;
}



async function deleteStaff(locationId, staffId) {
    const result = await pool.query(
        `DELETE FROM staff
         WHERE location_id = $1
           AND id = $2
         RETURNING *;`,
        [locationId, staffId]
    );

    return result.rows[0] ?? null;
}


export {createStaff, getStaffByLocation, getStaffById, updateStaff, deleteStaff}