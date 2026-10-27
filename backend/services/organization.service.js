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

async function getOrganizationById(id){
    const result = await pool.query("SELECT * FROM organizations WHERE id = $1",[id]);
    return result.rows[0];
}

async function updateOrganization(id, updates) {
    const allowedFields = ["name", "type", "email"];

    const fields = Object.keys(updates).filter(
        (field) => allowedFields.includes(field)
    );

    if (fields.length === 0) {
        return null;
    }

    const values = fields.map((field) => updates[field]);

    const setClause = fields
        .map((field, index) => `${field} = $${index + 1}`)
        .join(", ");

    values.push(id);

    const query = `
        UPDATE organizations
        SET ${setClause}, updated_at = NOW()
        WHERE id = $${values.length}
        RETURNING *;
    `;

    const result = await pool.query(query, values);

    return result.rows[0] ?? null;
}

async function deleteOrganization(id){
    const result = await pool.query(`DELETE from organizations
                    WHERE id=$1
                    RETURNING *;
                    `, [id]);
    return result.rows[0] ?? null;
    
}

export { getOrganizations, createOrganization, getOrganizationById, updateOrganization, deleteOrganization };