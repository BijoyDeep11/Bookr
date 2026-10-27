function errorMiddleware(err, req, res, next) {

    if (res.headersSent) {
        return next(err);
    }

    console.error(err);

    const statusCode = err.statusCode ?? err.status ?? 500;

    const safeStatusCode =
        statusCode >= 400 && statusCode < 600
            ? statusCode
            : 500;

    res.status(safeStatusCode).json({
        error: safeStatusCode < 500
        ? (err.message || "Request Failed")
        : "Internal Server Error"
    });
}

export default errorMiddleware;