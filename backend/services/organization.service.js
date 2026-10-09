import pool from "../db/pool.js"

async function getOrganizations() {
    const result = await pool.query("SELECT * FROM organizations");
    return result.rows;
}

async function createOrganization({ name, type, email }) {
    const result = await pool.query(
        `INSERT INTO organizations (name, type, email)
         VALUES ($1, $2, $3)
         RETURNING *;`,
        [name, type, email]
    );

    return result.rows[0];
}

export { getOrganizations, createOrganization };