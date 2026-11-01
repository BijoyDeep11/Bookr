
import pool from "../db/pool.js";

async function createCustomer({
    name,
    address,
    phone,
    email,
    gender
}) {
    const result = await pool.query(
        `INSERT INTO customers (
            name,
            address,
            phone,
            email,
            gender
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;`,
        [
            name,
            address,
            phone ?? null,
            email ?? null,
            gender ?? null
        ]
    );

    return result.rows[0];
}


async function getAllCustomers() {
    const result = await pool.query(
        `SELECT *
         FROM customers
         ORDER BY created_at DESC;`
    );

    return result.rows;
}


async function getCustomerById(customerId) {
    const result = await pool.query(
        `SELECT *
         FROM customers
         WHERE id = $1;`,
        [customerId]
    );

    return result.rows[0] ?? null;
}


async function updateCustomer(customerId, updates) {
    const fields = Object.keys(updates);

    const setClause = fields
        .map((field, index) => `${field} = $${index + 1}`)
        .join(", ");

    const values = Object.values(updates);

    values.push(customerId);

    const result = await pool.query(
        `UPDATE customers
         SET ${setClause}, updated_at = NOW()
         WHERE id = $${values.length}
         RETURNING *;`,
        values
    );

    return result.rows[0] ?? null;
}


async function deleteCustomer(customerId) {
    const result = await pool.query(
        `DELETE FROM customers
         WHERE id = $1
         RETURNING *;`,
        [customerId]
    );

    return result.rows[0] ?? null;
}


export {
    createCustomer, getAllCustomers, getCustomerById, updateCustomer, deleteCustomer
};
