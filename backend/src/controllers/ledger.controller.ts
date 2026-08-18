import { Request, Response, NextFunction } from 'express';
import { Payment } from '../models/Payment.model.js';
import { AuditLog } from '../models/AuditLog.model.js';
import { escapeRegex } from '../utils/domain.js';

export const getPayments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: Record<string, unknown> = {};
    if (req.query.search) {
      const pattern = new RegExp(escapeRegex(String(req.query.search)), 'i');
      filter.$or = [{ invoiceNumber: pattern }, { method: pattern }];
    }
    const payments = await Payment.find(filter)
      .populate('sale', 'invoiceNumber customer grandTotal saleStatus')
      .populate('receivedBy', 'name username')
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: payments });
  } catch (error) {
    return next(error);
  }
};

export const getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: Record<string, unknown> = {};
    if (req.query.search) {
      const pattern = new RegExp(escapeRegex(String(req.query.search)), 'i');
      filter.$or = [{ action: pattern }, { entity: pattern }, { entityId: pattern }];
    }
    const logs = await AuditLog.find(filter)
      .populate('user', 'name username role')
      .sort({ createdAt: -1 })
      .limit(1000);
    return res.status(200).json({ success: true, data: logs });
  } catch (error) {
    return next(error);
  }
};
