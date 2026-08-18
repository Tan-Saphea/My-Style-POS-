import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { USER_ROLES } from '../constants/index.js';
import { updateSettingsBodySchema } from '../validation/schemas.js';

const router = Router();

// Publicly readable for Website, Mobile App, and POS customer storefront
router.get('/', getSettings);

// Protected Admin update
router.put(
  '/',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  validate({ body: updateSettingsBodySchema }),
  updateSettings
);

export const settingsRoutes = router;
