import { Router } from 'express';
import { adjustStock, getInventory, getInventoryHistory, getLowStock } from '../controllers/inventory.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { sensitiveOpLimiter } from '../middleware/rateLimit.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { USER_ROLES } from '../constants/index.js';
import { adjustStockBodySchema, inventoryHistoryQuerySchema, searchQuerySchema } from '../validation/schemas.js';

const router = Router();
router.use(authenticate);
router.get('/', validate({ query: searchQuerySchema }), getInventory);
router.get('/low-stock', authorize(USER_ROLES.ADMIN), getLowStock);
router.get('/history', authorize(USER_ROLES.ADMIN), validate({ query: inventoryHistoryQuerySchema }), getInventoryHistory);
router.post('/adjustments', authorize(USER_ROLES.ADMIN), sensitiveOpLimiter, validate({ body: adjustStockBodySchema }), adjustStock);
export const inventoryRoutes = router;
