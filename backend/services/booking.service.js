
import pool from "../db/pool.js";

// ==========================================
// CREATE BOOKING
// ==========================================

async function createBooking({
    customerId,
    serviceId,
    staffId,
    locationId,
    startTime,
    endTime,
    price,
    status
}) {
    const client = await pool.connect();

    try {
        // 1. Start transaction
        await client.query("BEGIN");

        // 2. Check customer
        const customer = await client.query(
            `SELECT id FROM customers WHERE id = $1`,
            [customerId]
        );

        if (customer.rows.length === 0) {
            await client.query("ROLLBACK");
            return { error: "Customer not found", statusCode: 404 };
        }

        // 3. Check staff
        const staff = await client.query(
            `SELECT id, location_id FROM staff WHERE id = $1`,
            [staffId]
        );

        if (staff.rows.length === 0) {
            await client.query("ROLLBACK");
            return { error: "Staff member not found", statusCode: 404 };
        }

        // 4. Check location
        const location = await client.query(
            `SELECT id FROM locations WHERE id = $1`,
            [locationId]
        );

        if (location.rows.length === 0) {
            await client.query("ROLLBACK");
            return { error: "Location not found", statusCode: 404 };
        }

        // 5. Check service
        const service = await client.query(
            `SELECT id FROM services WHERE id = $1`,
            [serviceId]
        );

        if (service.rows.length === 0) {
            await client.query("ROLLBACK");
            return { error: "Service not found", statusCode: 404 };
        }

        // 6. Check whether staff belongs to location
        if (staff.rows[0].location_id !== locationId) {
            await client.query("ROLLBACK");

            return {
                error: "Staff member does not belong to this location",
                statusCode: 400
            };
        }

        // 7. Check whether staff provides service
        const staffService = await client.query(
            `SELECT 1
             FROM staff_services
             WHERE staff_id = $1 AND service_id = $2`,
            [staffId, serviceId]
        );

        if (staffService.rows.length === 0) {
            await client.query("ROLLBACK");

            return {
                error: "Staff member does not provide this service",
                statusCode: 400
            };
        }

        // 8. Check whether location offers service
        const locationService = await client.query(
            `SELECT 1
             FROM location_services
             WHERE location_id = $1 AND service_id = $2`,
            [locationId, serviceId]
        );

        if (locationService.rows.length === 0) {
            await client.query("ROLLBACK");

            return {
                error: "This service is not available at this location",
                statusCode: 400
            };
        }

        // 9. Check booking conflicts
        if (status === "confirmed") {
            const conflict = await client.query(
                `SELECT id
                 FROM bookings
                 WHERE staff_id = $1
                   AND status = 'confirmed'
                   AND start_time < $3
                   AND end_time > $2
                 LIMIT 1`,
                [staffId, startTime, endTime]
            );

            if (conflict.rows.length > 0) {
                await client.query("ROLLBACK");

                return {
                    error: "This staff member already has a booking during the selected time",
                    statusCode: 409
                };
            }
        }

        // 10. Create booking
        const result = await client.query(
            `INSERT INTO bookings (
                customer_id,
                service_id,
                staff_id,
                location_id,
                start_time,
                end_time,
                price,
                status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`,
            [
                customerId,
                serviceId,
                staffId,
                locationId,
                startTime,
                endTime,
                price,
                status
            ]
        );

        // 11. Commit transaction
        await client.query("COMMIT");

        return { data: result.rows[0] };

    } catch (error) {
        await client.query("ROLLBACK");

        // PostgreSQL exclusion constraint violation
        if (error.code === "23P01") {
            return {
                error: "This staff member already has a booking during the selected time",
                statusCode: 409
            };
        }

        throw error;

    } finally {
        // 12. Release connection
        client.release();
    }
}

// ==========================================
// GET ALL BOOKINGS
// ==========================================

async function getAllBookings() {
    const result = await pool.query(
        `SELECT
            b.id,
            b.start_time,
            b.end_time,
            b.price,
            b.status,
            b.created_at,
            c.name AS customer_name,
            s.name AS service_name,
            st.name AS staff_name,
            l.name AS location_name
         FROM bookings b
         INNER JOIN customers c ON b.customer_id = c.id
         INNER JOIN services s ON b.service_id = s.id
         INNER JOIN staff st ON b.staff_id = st.id
         INNER JOIN locations l ON b.location_id = l.id
         ORDER BY b.created_at DESC`
    );

    return result.rows;
}

// ==========================================
// GET BOOKING BY ID
// ==========================================

async function getBookingById(bookingId) {
    const result = await pool.query(
        `SELECT
            b.id,
            b.start_time,
            b.end_time,
            b.price,
            b.status,
            b.created_at,
            c.name AS customer_name,
            s.name AS service_name,
            st.name AS staff_name,
            l.name AS location_name
         FROM bookings b
         INNER JOIN customers c ON b.customer_id = c.id
         INNER JOIN services s ON b.service_id = s.id
         INNER JOIN staff st ON b.staff_id = st.id
         INNER JOIN locations l ON b.location_id = l.id
         WHERE b.id = $1`,
        [bookingId]
    );

    return result.rows[0] || null;
}

// ==========================================
// GET BOOKING FOR UPDATE
// ==========================================

async function getBookingForUpdate(bookingId, client) {
    const result = await client.query(
        `SELECT *
         FROM bookings
         WHERE id = $1`,
        [bookingId]
    );

    return result.rows[0] || null;
}

// ==========================================
// UPDATE BOOKING
// ==========================================

async function updateBooking(bookingId, data) {
    const client = await pool.connect();

    try {
        // 1. Start transaction
        await client.query("BEGIN");

        // 2. Fetch existing booking
        const existingBooking = await getBookingForUpdate(
            bookingId,
            client
        );

        if (!existingBooking) {
            await client.query("ROLLBACK");

            return {
                error: "Booking not found",
                statusCode: 404
            };
        }

        // 3. Check whether at least one field was supplied
        const hasUpdates = Object.values(data).some(
            value => value !== undefined
        );

        if (!hasUpdates) {
            await client.query("ROLLBACK");

            return {
                error: "No fields provided for update",
                statusCode: 400
            };
        }

        // 4. Merge existing data with PATCH fields
        const updatedBooking = {
            customerId: data.customerId !== undefined
                ? data.customerId
                : existingBooking.customer_id,

            serviceId: data.serviceId !== undefined
                ? data.serviceId
                : existingBooking.service_id,

            staffId: data.staffId !== undefined
                ? data.staffId
                : existingBooking.staff_id,

            locationId: data.locationId !== undefined
                ? data.locationId
                : existingBooking.location_id,

            startTime: data.startTime !== undefined
                ? data.startTime
                : existingBooking.start_time,

            endTime: data.endTime !== undefined
                ? data.endTime
                : existingBooking.end_time,

            price: data.price !== undefined
                ? data.price
                : existingBooking.price,

            status: data.status !== undefined
                ? data.status
                : existingBooking.status
        };

        // 5. Validate booking time
        const start = new Date(updatedBooking.startTime);
        const end = new Date(updatedBooking.endTime);

        if (
            Number.isNaN(start.getTime()) ||
            Number.isNaN(end.getTime()) ||
            end <= start
        ) {
            await client.query("ROLLBACK");

            return {
                error: "Invalid booking time range",
                statusCode: 400
            };
        }

        // 6. Validate price
        const price = Number(updatedBooking.price);

        if (
            updatedBooking.price === null ||
            updatedBooking.price === "" ||
            !Number.isFinite(price) ||
            price < 0 ||
            price > 99999999.99 ||
            Math.round(price * 100) !== price * 100
        ) {
            await client.query("ROLLBACK");

            return {
                error: "Invalid booking price",
                statusCode: 400
            };
        }

        // 7. Validate booking status
        const validStatuses = [
            "pending",
            "confirmed",
            "cancelled",
            "completed"
        ];

        if (!validStatuses.includes(updatedBooking.status)) {
            await client.query("ROLLBACK");

            return {
                error: "Invalid booking status",
                statusCode: 400
            };
        }

        // 8. Validate customer
        const customer = await client.query(
            "SELECT id FROM customers WHERE id = $1",
            [updatedBooking.customerId]
        );

        if (customer.rows.length === 0) {
            await client.query("ROLLBACK");

            return {
                error: "Customer not found",
                statusCode: 404
            };
        }

        // 9. Validate staff
        const staff = await client.query(
            "SELECT id, location_id FROM staff WHERE id = $1",
            [updatedBooking.staffId]
        );

        if (staff.rows.length === 0) {
            await client.query("ROLLBACK");

            return {
                error: "Staff not found",
                statusCode: 404
            };
        }

        // 10. Validate location
        const location = await client.query(
            "SELECT id FROM locations WHERE id = $1",
            [updatedBooking.locationId]
        );

        if (location.rows.length === 0) {
            await client.query("ROLLBACK");

            return {
                error: "Location not found",
                statusCode: 404
            };
        }

        // 11. Validate service
        const service = await client.query(
            "SELECT id FROM services WHERE id = $1",
            [updatedBooking.serviceId]
        );

        if (service.rows.length === 0) {
            await client.query("ROLLBACK");

            return {
                error: "Service not found",
                statusCode: 404
            };
        }

        // 12. Verify staff belongs to selected location
        if (staff.rows[0].location_id !== updatedBooking.locationId) {
            await client.query("ROLLBACK");

            return {
                error: "Staff does not belong to this location",
                statusCode: 400
            };
        }

        // 13. Verify staff provides selected service
        const staffService = await client.query(
            `SELECT 1
             FROM staff_services
             WHERE staff_id = $1 AND service_id = $2`,
            [updatedBooking.staffId, updatedBooking.serviceId]
        );

        if (staffService.rows.length === 0) {
            await client.query("ROLLBACK");

            return {
                error: "Staff is not assigned to this service",
                statusCode: 400
            };
        }

        // 14. Verify location offers selected service
        const locationService = await client.query(
            `SELECT 1
             FROM location_services
             WHERE location_id = $1 AND service_id = $2`,
            [updatedBooking.locationId, updatedBooking.serviceId]
        );

        if (locationService.rows.length === 0) {
            await client.query("ROLLBACK");

            return {
                error: "Service is not available at this location",
                statusCode: 400
            };
        }

        // 15. Check for booking conflicts
        if (updatedBooking.status === "confirmed") {
            const conflict = await client.query(
                `SELECT id
                 FROM bookings
                 WHERE staff_id = $1
                   AND status = 'confirmed'
                   AND id <> $2
                   AND start_time < $4
                   AND end_time > $3
                 LIMIT 1`,
                [
                    updatedBooking.staffId,
                    bookingId,
                    updatedBooking.startTime,
                    updatedBooking.endTime
                ]
            );

            if (conflict.rows.length > 0) {
                await client.query("ROLLBACK");

                return {
                    error: "Staff already has a booking during this time",
                    statusCode: 409
                };
            }
        }

        // 16. Update booking
        const result = await client.query(
            `UPDATE bookings
             SET
                customer_id = $1,
                service_id = $2,
                staff_id = $3,
                location_id = $4,
                start_time = $5,
                end_time = $6,
                price = $7,
                status = $8
             WHERE id = $9
             RETURNING *`,
            [
                updatedBooking.customerId,
                updatedBooking.serviceId,
                updatedBooking.staffId,
                updatedBooking.locationId,
                updatedBooking.startTime,
                updatedBooking.endTime,
                price,
                updatedBooking.status,
                bookingId
            ]
        );

        // 17. Commit transaction
        await client.query("COMMIT");

        return {
            data: result.rows[0]
        };

    } catch (error) {
        await client.query("ROLLBACK");

        // PostgreSQL exclusion constraint violation
        if (error.code === "23P01") {
            return {
                error: "Staff already has a booking during this time",
                statusCode: 409
            };
        }

        throw error;

    } finally {
        client.release();
    }
}


async function deleteBooking(bookingId) {
    const result = await pool.query(
        `DELETE FROM bookings
         WHERE id = $1
         RETURNING *`,
        [bookingId]
    );

    return result.rows[0] || null;
}


// ==========================================
// EXPORTS
// ==========================================

export {
    createBooking,
    getAllBookings,
    getBookingById,
    updateBooking,
    deleteBooking
};
