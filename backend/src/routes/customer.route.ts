import { Router } from 'express';
import { createCustomer, deleteCustomer, getCustomers, updateCustomer } from '../controllers/masterData.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { USER_ROLES } from '../constants/index.js';
import { createCustomerBodySchema, idParamsSchema, listQuerySchema, updateCustomerBodySchema } from '../validation/schemas.js';

const router = Router();
router.use(authenticate, authorize(USER_ROLES.ADMIN, USER_ROLES.CASHIER));
router.get('/', validate({ query: listQuerySchema }), getCustomers);
router.post('/', validate({ body: createCustomerBodySchema }), createCustomer);
router.put('/:id', validate({ params: idParamsSchema, body: updateCustomerBodySchema }), updateCustomer);
router.delete('/:id', authorize(USER_ROLES.ADMIN), validate({ params: idParamsSchema }), deleteCustomer);
export const customerRoutes = router;
