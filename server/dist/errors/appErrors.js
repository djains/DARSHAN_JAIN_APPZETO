"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnprocessableError = exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    code;
    details;
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.AppError = AppError;
class BadRequestError extends AppError {
    constructor(message = 'Bad Request', details) {
        super(message, 400, 'BAD_REQUEST', details);
    }
}
exports.BadRequestError = BadRequestError;
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized', details) {
        super(message, 401, 'UNAUTHORIZED', details);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Forbidden', details) {
        super(message, 403, 'FORBIDDEN', details);
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends AppError {
    constructor(message = 'Resource not found', details) {
        super(message, 404, 'NOT_FOUND', details);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message = 'Conflict / Resource lock failed', details) {
        super(message, 409, 'CONFLICT', details);
    }
}
exports.ConflictError = ConflictError;
class UnprocessableError extends AppError {
    constructor(message = 'Unprocessable Entity', details) {
        super(message, 422, 'UNPROCESSABLE_ENTITY', details);
    }
}
exports.UnprocessableError = UnprocessableError;
