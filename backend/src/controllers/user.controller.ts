import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.model.js';
import { Sale } from '../models/Sale.model.js';
import { Purchase } from '../models/Purchase.model.js';
import { Payment } from '../models/Payment.model.js';
import { ApiError } from '../utils/ApiError.js';
import { escapeRegex, writeAuditLog } from '../utils/domain.js';

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: Record<string, unknown> = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      const pattern = new RegExp(escapeRegex(String(req.query.search)), 'i');
      filter.$or = [{ name: pattern }, { username: pattern }, { email: pattern }, { role: pattern }];
    }
    const users = await User.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    return next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.create(req.body);
    await writeAuditLog(req, 'CREATE_USER', 'User', user._id.toString(), {
      username: user.username,
      role: user.role,
    });
    return res.status(201).json({ success: true, data: user });
  } catch (error) {
    return next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id).select('+password');
    if (!user) throw ApiError.notFound('Employee account not found');

    const removesActiveAdmin =
      user.role === 'admin' &&
      user.status === 'active' &&
      ((req.body.role && req.body.role !== 'admin') ||
        (req.body.status && req.body.status !== 'active'));
    if (removesActiveAdmin && (await User.countDocuments({ role: 'admin', status: 'active' })) <= 1) {
      throw ApiError.conflict('The system must retain at least one active administrator.');
    }

    const allowedFields = [
      'name',
      'username',
      'email',
      'phone',
      'gender',
      'position',
      'role',
      'password',
      'status',
    ] as const;
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) user.set(field, req.body[field]);
    }
    await user.save();

    await writeAuditLog(req, 'UPDATE_USER', 'User', user._id.toString(), {
      fields: Object.keys(req.body).filter((field) => field !== 'password'),
    });
    return res.status(200).json({ success: true, data: user.toJSON() });
  } catch (error) {
    return next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (String(req.user?._id) === req.params.id) {
      throw ApiError.conflict('You cannot delete your own account.');
    }

    const user = await User.findById(req.params.id);
    if (!user) throw ApiError.notFound('Employee account not found');
    if (user.role === 'admin' && user.status === 'active' &&
        (await User.countDocuments({ role: 'admin', status: 'active' })) <= 1) {
      throw ApiError.conflict('The system must retain at least one active administrator.');
    }

    const hasHistory = await Promise.all([
      Sale.exists({ cashier: user._id }),
      Purchase.exists({ $or: [{ createdBy: user._id }, { receivedBy: user._id }] }),
      Payment.exists({ receivedBy: user._id }),
    ]);
    if (hasHistory.some(Boolean)) {
      throw ApiError.conflict('Employee has transaction history. Deactivate the account instead.');
    }

    await user.deleteOne();
    await writeAuditLog(req, 'DELETE_USER', 'User', user._id.toString(), { username: user.username });
    return res.status(200).json({ success: true, message: 'Employee account deleted successfully' });
  } catch (error) {
    return next(error);
  }
};
