import { Router } from 'express';
import { cancelSale, createOnlineSale, createSale, getSaleById, getSales, trackOnlineOrder, updateSaleDelivery } from '../controllers/sale.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { sensitiveOpLimiter } from '../middleware/rateLimit.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { USER_ROLES } from '../constants/index.js';
import { createOnlineSaleBodySchema, createSaleBodySchema, idParamsSchema, saleListQuerySchema, updateDeliveryStatusSchema } from '../validation/schemas.js';

const router = Router();

// Public online customer order & tracking endpoints (rate-limited)
router.post('/online', sensitiveOpLimiter, validate({ body: createOnlineSaleBodySchema }), createOnlineSale);
router.get('/track', trackOnlineOrder);

// Protected Admin/Cashier management endpoints
router.use(authenticate, authorize(USER_ROLES.ADMIN, USER_ROLES.CASHIER));
router.get('/', validate({ query: saleListQuerySchema }), getSales);
router.get('/:id', validate({ params: idParamsSchema }), getSaleById);
router.post('/', sensitiveOpLimiter, validate({ body: createSaleBodySchema }), createSale);
router.patch('/:id/delivery', sensitiveOpLimiter, validate({ params: idParamsSchema, body: updateDeliveryStatusSchema }), updateSaleDelivery);
router.patch('/:id/cancel', authorize(USER_ROLES.ADMIN), sensitiveOpLimiter, validate({ params: idParamsSchema }), cancelSale);

export const saleRoutes = router;
