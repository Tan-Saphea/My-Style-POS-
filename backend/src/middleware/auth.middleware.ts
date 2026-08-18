import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { User, IUser } from '../models/User.model.js';
import { UserRole } from '../constants/index.js';

// Extend Express Request interface to attach authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

interface JwtPayload {
  userId: string;
  role: UserRole;
}

/**
 * Middleware to authenticate requests using JWT access tokens.
 * Checks Authorization header (Bearer <token>) or signed cookies.
 */
export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    // 1. Extract from Authorization Header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    // 2. Fallback to HttpOnly Cookie
    else if (req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
    }

    if (!token) {
      return next(ApiError.unauthorized('Authentication token is missing. Please log in.'));
    }

    // 3. Verify Token
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;

    // 4. Fetch User from DB
    const user = await User.findById(decoded.userId).select('-password');
    if (!user || user.status !== 'active') {
      return next(ApiError.unauthorized('User account does not exist or is inactive.'));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(ApiError.unauthorized('Access token has expired. Please refresh token.'));
    }
    return next(ApiError.unauthorized('Invalid authentication token.'));
  }
};

/**
 * Middleware to restrict route access to specific roles.
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('User not authenticated.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(`Access denied. Role "${req.user.role}" does not have sufficient permissions.`)
      );
    }

    next();
  };
};
