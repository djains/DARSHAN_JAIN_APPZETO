import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UnauthorizedError, ForbiddenError } from '../errors/appErrors.js';

export interface JwtPayload {
  userId: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateToken = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or malformed authorization token');
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired authentication token');
  }
};

export const requireRole = (role: 'USER' | 'ADMIN') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('User authentication required');
    }
    if (req.user.role !== role) {
      throw new ForbiddenError(`Access denied. Requires ${role} role.`);
    }
    next();
  };
};
