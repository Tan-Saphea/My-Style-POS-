import { Router } from 'express';
import { healthRoutes } from './health.route.js';
import { authRoutes } from './auth.route.js';
import { categoryRoutes } from './category.route.js';
import { productRoutes } from './product.route.js';
import { saleRoutes } from './sale.route.js';
import { dashboardRoutes } from './dashboard.route.js';
import { sizeRoutes } from './size.route.js';
import { colorRoutes } from './color.route.js';
import { customerRoutes } from './customer.route.js';
import { supplierRoutes } from './supplier.route.js';
import { userRoutes } from './user.route.js';
import { purchaseRoutes } from './purchase.route.js';
import { inventoryRoutes } from './inventory.route.js';
import { paymentRoutes, auditLogRoutes } from './ledger.route.js';
import { reportRoutes } from './report.route.js';
import { settingsRoutes } from './settings.route.js';

const router = Router();

// Mount Health Check Route
router.use('/health', healthRoutes);

// Mount API Module Routes
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/sizes', sizeRoutes);
router.use('/colors', colorRoutes);
router.use('/customers', customerRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/users', userRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/sales', saleRoutes);
router.use('/payments', paymentRoutes);
router.use('/audit-logs', auditLogRoutes);
router.use('/reports', reportRoutes);
router.use('/settings', settingsRoutes);
router.use('/dashboard', dashboardRoutes);

export const v1Routes: Router = router;
