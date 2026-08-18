import { Router } from 'express';
import {
  cancelPurchase,
  createPurchase,
  deletePurchase,
  getPurchaseById,
  getPurchases,
  receivePurchase,
  updatePurchase,
} from '../controllers/purchase.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { sensitiveOpLimiter } from '../middleware/rateLimit.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { USER_ROLES } from '../constants/index.js';
import { createPurchaseBodySchema, idParamsSchema, purchaseListQuerySchema, updatePurchaseBodySchema } from '../validation/schemas.js';

const router = Router();
router.use(authenticate, authorize(USER_ROLES.ADMIN));
router.get('/', validate({ query: purchaseListQuerySchema }), getPurchases);
router.get('/:id', validate({ params: idParamsSchema }), getPurchaseById);
router.post('/', sensitiveOpLimiter, validate({ body: createPurchaseBodySchema }), createPurchase);
router.put('/:id', sensitiveOpLimiter, validate({ params: idParamsSchema, body: updatePurchaseBodySchema }), updatePurchase);
router.patch('/:id/receive', sensitiveOpLimiter, validate({ params: idParamsSchema }), receivePurchase);
router.patch('/:id/cancel', sensitiveOpLimiter, validate({ params: idParamsSchema }), cancelPurchase);
router.delete('/:id', sensitiveOpLimiter, validate({ params: idParamsSchema }), deletePurchase);
export const purchaseRoutes = router;
