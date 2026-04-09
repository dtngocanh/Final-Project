import ErrorHandler from "../utils/errorHandler.js";

export const errorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    // 1. Handle Mongoose Bad Object ID
    if (err.name === "CastError") {
        err = new ErrorHandler(`Resourse not found. Invalid: $ {err.path}`, 400);
    }

    // 2. Handle Mongoose Duplicate Key Error
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err = new ErrorHandler(message, 400);
    }

    // 3. Handle Wrong JWT Error
    if (err.name === "JsonWebTokenError") {
        err = new ErrorHandler("JSON Web Token is invalid, try again", 400);
    }

    // 4. Handle Expired JWT Error
    if (err.name === "TokenExpiredError") {
        err = new ErrorHandler("JSON Web Token has expired, try again", 400);
    }

    // 5. Extract Mongoose Validation Errors
    const message = err.errors
        ? Object.values(err.errors).map(val => val.message).join(", ")
        : err.message;

    res.status(err.statusCode).json({
        success: false,
        message: message,
    });
}