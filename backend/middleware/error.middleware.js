
function errorMiddleware(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    console.error(err);

    const postgresErrors = {
        "23505": {
            statusCode: 409,
            message: "A record with this value already exists"
        },
        "23503": {
            statusCode: 409,
            message: "This operation conflicts with an existing relationship"
        },
        "23502": {
            statusCode: 400,
            message: "A required field is missing"
        },
        "22P02": {
            statusCode: 400,
            message: "Invalid input format"
        }
    };

    const databaseError = postgresErrors[err.code];

    const statusCode =
        databaseError?.statusCode ??
        err.statusCode ??
        err.status ??
        500;

    const safeStatusCode =
        statusCode >= 400 && statusCode < 600
            ? statusCode
            : 500;

    const message =
        databaseError?.message ??
        (safeStatusCode < 500
            ? err.message || "Request Failed"
            : "Internal Server Error");

    res.status(safeStatusCode).json({
        error: message
    });
}

export default errorMiddleware;
