import { Router } from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { USER_ROLES } from '../constants/index.js';
import {
  createProductBodySchema,
  idParamsSchema,
  productListQuerySchema,
  updateProductBodySchema,
} from '../validation/schemas.js';

const router = Router();

// Public catalog routes (reads active products, hides cost price for non-admins)
router.get('/', validate({ query: productListQuerySchema }), getProducts);
router.get('/:id', validate({ params: idParamsSchema }), getProductById);

// Protected Admin management routes
router.use(authenticate);
router.post('/', authorize(USER_ROLES.ADMIN), validate({ body: createProductBodySchema }), createProduct);
router.put('/:id', authorize(USER_ROLES.ADMIN), validate({ params: idParamsSchema, body: updateProductBodySchema }), updateProduct);
router.delete('/:id', authorize(USER_ROLES.ADMIN), validate({ params: idParamsSchema }), deleteProduct);

export const productRoutes = router;
