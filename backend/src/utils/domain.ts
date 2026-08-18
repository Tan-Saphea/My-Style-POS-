import type { Request } from 'express';
import type { ClientSession } from 'mongoose';
import { AuditLog } from '../models/AuditLog.model.js';

export const roundMoney = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const writeAuditLog = async (
  req: Request,
  action: string,
  entity: string,
  entityId?: string,
  details?: Record<string, unknown>,
  session?: ClientSession | null
): Promise<void> => {
  if (!req.user?._id) return;

  await AuditLog.create(
    [
      {
        user: req.user._id,
        action,
        entity,
        entityId,
        details,
        ipAddress: req.ip,
      },
    ],
    session ? { session } : undefined
  );
};
