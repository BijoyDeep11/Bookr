
import {
    createBooking, getAllBookings, getBookingById, updateBooking, deleteBooking
} from "../services/booking.service.js";

const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const bookingStatuses = [
    "pending",
    "confirmed",
    "cancelled",
    "completed"
];

async function createBookingController(req, res) {
    const {
        customerId,
        serviceId,
        staffId,
        locationId,
        startTime,
        endTime,
        price,
        status
    } = req.body ?? {};

    // 1. Validate UUIDs
    if (
        !uuidRegex.test(customerId) ||
        !uuidRegex.test(serviceId) ||
        !uuidRegex.test(staffId) ||
        !uuidRegex.test(locationId)
    ) {
        return res.status(400).json({
            message: "Invalid customer, service, staff or location ID"
        });
    }

    // 2. Validate timestamps and timezone
    const timestampRegex =
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

    if (
        typeof startTime !== "string" ||
        typeof endTime !== "string" ||
        !timestampRegex.test(startTime) ||
        !timestampRegex.test(endTime)
    ) {
        return res.status(400).json({
            message: "Provide valid ISO timestamps with an explicit timezone"
        });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime())
    ) {
        return res.status(400).json({
            message: "Invalid start time or end time"
        });
    }

    // 3. End time must be after start time
    if (end <= start) {
        return res.status(400).json({
            message: "End time must be after start time"
        });
    }

    // 4. Validate price
    if (
        typeof price !== "number" ||
        !Number.isFinite(price) ||
        price < 0 ||
        price > 99999999.99 ||
        Math.round(price * 100) !== price * 100
    ) {
        return res.status(400).json({
            message: "Price must be a non-negative number with maximum two decimal places"
        });
    }

    // 5. Validate booking status
    if (!bookingStatuses.includes(status)) {
        return res.status(400).json({
            message: "Invalid booking status",
            allowedStatuses: bookingStatuses
        });
    }

    // 6. Create booking
    const result = await createBooking({
    customerId,
    serviceId,
    staffId,
    locationId,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    price,
    status
});

if (result.error) {
    return res.status(result.statusCode).json({
        message: result.error
    });
}

return res.status(201).json({
    message: "Booking created successfully",
    data: result.data
});

}

async function getAllBookingsController(req, res, next) {
    try {
        const bookings = await getAllBookings();

        return res.status(200).json({
            data: bookings
        });
    } catch (error) {
        next(error);
    }
}


async function getBookingByIdController(req, res, next) {
    try {
        const { bookingId } = req.params;

        // 1. Validate UUID
        if (!UUID_REGEX.test(bookingId)) {
            return res.status(400).json({
                error: "Invalid booking ID"
            });
        }

        // 2. Fetch booking
        const booking = await getBookingById(bookingId);

        // 3. Check whether booking exists
        if (!booking) {
            return res.status(404).json({
                error: "Booking not found"
            });
        }

        // 4. Return booking
        return res.status(200).json({
            data: booking
        });

    } catch (error) {
        next(error);
    }
}


const updateBookingController = async (req, res, next) => {
    try {
        const { bookingId } = req.params;

        if (!UUID_REGEX.test(bookingId)) {
            return res.status(400).json({
                message: "Invalid booking ID"
            });
        }

        const {
            customerId,
            serviceId,
            staffId,
            locationId,
            startTime,
            endTime,
            price,
            status
        } = req.body;

        const result = await updateBooking(bookingId, {
            customerId,
            serviceId,
            staffId,
            locationId,
            startTime,
            endTime,
            price,
            status
        });

        if (result.error) {
            return res.status(result.statusCode).json({
                message: result.error
            });
        }

        return res.status(200).json({
            message: "Booking updated successfully",
            data: result.data
        });

    } catch (error) {
        next(error);
    }
};


export const deleteBookingController = async (req, res, next) => {
    try {
        const { bookingId } = req.params;

        if (!UUID_REGEX.test(bookingId)) {
            return res.status(400).json({
                message: "Invalid booking ID"
            });
        }

        const deletedBooking = await deleteBooking(bookingId);

        if (!deletedBooking) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        return res.status(200).json({
            message: "Booking deleted successfully",
            data: deletedBooking
        });

    } catch (error) {
        next(error);
    }
};



export {
    createBookingController, getAllBookingsController, getBookingByIdController, updateBookingController, deleteBookingController
}
