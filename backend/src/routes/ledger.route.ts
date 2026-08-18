import { Router } from 'express';
import { getAuditLogs, getPayments } from '../controllers/ledger.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { USER_ROLES } from '../constants/index.js';
import { searchQuerySchema } from '../validation/schemas.js';

export const paymentRoutes = Router();
paymentRoutes.use(authenticate, authorize(USER_ROLES.ADMIN, USER_ROLES.CASHIER));
paymentRoutes.get('/', validate({ query: searchQuerySchema }), getPayments);

export const auditLogRoutes = Router();
auditLogRoutes.use(authenticate, authorize(USER_ROLES.ADMIN));
auditLogRoutes.get('/', validate({ query: searchQuerySchema }), getAuditLogs);
