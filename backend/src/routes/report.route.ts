import { Router } from 'express';
import { getInventoryReport, getProfitReport, getPurchaseReport, getSalesReport, getTopProductsReport } from '../controllers/report.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { USER_ROLES } from '../constants/index.js';
import { reportQuerySchema } from '../validation/schemas.js';

const router = Router();
router.use(authenticate, authorize(USER_ROLES.ADMIN));
router.get('/sales', validate({ query: reportQuerySchema }), getSalesReport);
router.get('/profit', validate({ query: reportQuerySchema }), getProfitReport);
router.get('/purchases', validate({ query: reportQuerySchema }), getPurchaseReport);
router.get('/inventory', getInventoryReport);
router.get('/top-products', validate({ query: reportQuerySchema }), getTopProductsReport);
export const reportRoutes = router;
