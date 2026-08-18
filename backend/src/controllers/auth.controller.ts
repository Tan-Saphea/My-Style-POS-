import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.model.js';
import { AuditLog } from '../models/AuditLog.model.js';
import { ApiError } from '../utils/ApiError.js';

interface RefreshPayload {
  userId: string;
}

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/v1/auth',
};

const generateTokens = (userId: string, role: string) => {
  const accessToken = jwt.sign({ userId, role }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
  const refreshToken = jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });

  return { accessToken, refreshToken };
};

const setRefreshCookie = (res: Response, token: string): void => {
  res.cookie('refresh_token', token, refreshCookieOptions);
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;
    const normalizedUsername = username.toLowerCase();
    const user = await User.findOne({
      $or: [{ username: normalizedUsername }, { email: normalizedUsername }],
    }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      throw ApiError.unauthorized('Invalid username or password.');
    }
    if (user.status !== 'active') {
      throw ApiError.forbidden('Your account is not active. Please contact an administrator.');
    }

    user.lastLogin = new Date();
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);
    setRefreshCookie(res, refreshToken);

    await AuditLog.create({
      user: user._id,
      action: 'LOGIN',
      entity: 'User',
      entityId: user._id.toString(),
      details: { username: user.username },
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { user: user.toJSON(), accessToken },
    });
  } catch (error) {
    return next(error);
  }
};

export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) throw ApiError.unauthorized('Refresh token is missing. Please log in.');

    let decoded: RefreshPayload;
    try {
      decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshPayload;
    } catch {
      throw ApiError.unauthorized('Refresh token is invalid or expired. Please log in.');
    }

    const user = await User.findById(decoded.userId);
    if (!user || user.status !== 'active') {
      throw ApiError.unauthorized('User account does not exist or is inactive.');
    }

    const tokens = generateTokens(user._id.toString(), user.role);
    setRefreshCookie(res, tokens.refreshToken);

    return res.status(200).json({
      success: true,
      message: 'Session refreshed',
      data: { accessToken: tokens.accessToken, user: user.toJSON() },
    });
  } catch (error) {
    return next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw ApiError.unauthorized('Not authenticated');
    return res.status(200).json({ success: true, data: req.user.toJSON() });
  } catch (error) {
    return next(error);
  }
};

export const updateMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw ApiError.unauthorized('Not authenticated');

    const allowedFields = ['name', 'email', 'phone', 'gender', 'position', 'avatar'] as const;
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        const val = req.body[field];
        if (field === 'gender' && (!val || val === '')) {
          req.user.set(field, undefined);
        } else {
          req.user.set(field, val);
        }
      }
    }
    await req.user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: req.user.toJSON(),
    });
  } catch (error) {
    return next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw ApiError.unauthorized('Not authenticated');

    const user = await User.findById(req.user._id).select('+password');
    if (!user) throw ApiError.notFound('User account not found');
    if (!(await user.comparePassword(req.body.currentPassword))) {
      throw ApiError.badRequest('Current password is incorrect.');
    }

    user.password = req.body.newPassword;
    await user.save();

    return res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    return next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.clearCookie('refresh_token', {
      httpOnly: refreshCookieOptions.httpOnly,
      secure: refreshCookieOptions.secure,
      sameSite: refreshCookieOptions.sameSite,
      path: refreshCookieOptions.path,
    });

    if (req.user?._id) {
      await AuditLog.create({
        user: req.user._id,
        action: 'LOGOUT',
        entity: 'User',
        entityId: req.user._id.toString(),
        ipAddress: req.ip,
      });
    }

    return res.status(200).json({ success: true, message: 'Logout successful' });
  } catch (error) {
    return next(error);
  }
};
