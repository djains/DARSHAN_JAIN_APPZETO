import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/appErrors.js';
import { ZodError } from 'zod';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';
  let details: any = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Invalid request payload';
    details = err.errors.map(e => ({ path: e.path.join('.'), message: e.message }));
  } else if (err.name === 'MongoServerError' && err.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_KEY';
    message = 'Resource already exists';
    details = err.keyValue;
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
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
