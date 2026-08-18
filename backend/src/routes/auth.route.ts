import { Router } from 'express';
import {
  login,
  getMe,
  updateMe,
  logout,
  refreshAccessToken,
  changePassword,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimit.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { loginBodySchema, changePasswordBodySchema, updateProfileBodySchema } from '../validation/schemas.js';

const router = Router();

router.post('/login', authLimiter, validate({ body: loginBodySchema }), login);
router.post('/refresh', authLimiter, refreshAccessToken);
router.get('/me', authenticate, getMe);
router.patch('/me', authenticate, validate({ body: updateProfileBodySchema }), updateMe);
router.post('/change-password', authLimiter, authenticate, validate({ body: changePasswordBodySchema }), changePassword);
router.post('/logout', authenticate, logout);

export const authRoutes: Router = router;
