"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const appErrors_js_1 = require("../errors/appErrors.js");
const zod_1 = require("zod");
const errorHandler = (err, _req, res, _next) => {
    let statusCode = 500;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred';
    let details = undefined;
    if (err instanceof appErrors_js_1.AppError) {
        statusCode = err.statusCode;
        code = err.code;
        message = err.message;
        details = err.details;
    }
    else if (err instanceof zod_1.ZodError) {
        statusCode = 400;
        code = 'VALIDATION_ERROR';
        message = 'Invalid request payload';
        details = err.errors.map(e => ({ path: e.path.join('.'), message: e.message }));
    }
    else if (err.name === 'MongoServerError' && err.code === 11000) {
        statusCode = 409;
        code = 'DUPLICATE_KEY';
        message = 'Resource already exists';
        details = err.keyValue;
    }
    else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        statusCode = 401;
        code = 'INVALID_TOKEN';
        message = 'Authentication token is invalid or expired';
    }
    res.status(statusCode).json({
        error: {
            code,
            message,
            ...(details ? { details } : {})
        }
    });
};
exports.errorHandler = errorHandler;
