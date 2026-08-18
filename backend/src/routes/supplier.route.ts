import { Router } from 'express';
import { createSupplier, deleteSupplier, getSuppliers, updateSupplier } from '../controllers/masterData.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { USER_ROLES } from '../constants/index.js';
import { createSupplierBodySchema, idParamsSchema, listQuerySchema, updateSupplierBodySchema } from '../validation/schemas.js';

const router = Router();
router.use(authenticate, authorize(USER_ROLES.ADMIN));
router.get('/', validate({ query: listQuerySchema }), getSuppliers);
router.post('/', validate({ body: createSupplierBodySchema }), createSupplier);
router.put('/:id', validate({ params: idParamsSchema, body: updateSupplierBodySchema }), updateSupplier);
router.delete('/:id', validate({ params: idParamsSchema }), deleteSupplier);
export const supplierRoutes = router;
