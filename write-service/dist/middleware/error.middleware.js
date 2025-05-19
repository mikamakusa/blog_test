"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
const logger_1 = require("../utils/logger");
class AppError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'AppError';
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, next) => {
    logger_1.logger.error('Error:', err);
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
        });
    }
    return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
    });
};
exports.errorHandler = errorHandler;
