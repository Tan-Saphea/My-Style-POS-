import { Request, Response, NextFunction } from 'express';
import { SystemSetting } from '../models/SystemSetting.model.js';
import { writeAuditLog } from '../utils/domain.js';

const getOrCreateSettings = () => SystemSetting.findOneAndUpdate(
  { key: 'store' },
  { $setOnInsert: { key: 'store' } },
  { new: true, upsert: true, setDefaultsOnInsert: true }
);

export const getSettings = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await getOrCreateSettings();
    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    return next(error);
  }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await SystemSetting.findOneAndUpdate(
      { key: 'store' },
      { ...req.body, key: 'store' },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    await writeAuditLog(req, 'UPDATE_SETTINGS', 'SystemSetting', settings._id.toString(), {
      fields: Object.keys(req.body),
    });
    return res.status(200).json({ success: true, message: 'Settings updated successfully', data: settings });
  } catch (error) {
    return next(error);
  }
};
