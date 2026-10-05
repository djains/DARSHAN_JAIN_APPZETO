export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', details?: any) {
    super(message, 400, 'BAD_REQUEST', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', details?: any) {
    super(message, 401, 'UNAUTHORIZED', details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', details?: any) {
    super(message, 403, 'FORBIDDEN', details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details?: any) {
    super(message, 404, 'NOT_FOUND', details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict / Resource lock failed', details?: any) {
    super(message, 409, 'CONFLICT', details);
  }
}

export class UnprocessableError extends AppError {
  constructor(message = 'Unprocessable Entity', details?: any) {
    super(message, 422, 'UNPROCESSABLE_ENTITY', details);
  }
}
