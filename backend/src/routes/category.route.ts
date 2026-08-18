import { Router } from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/category.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createCategoryBodySchema,
  idParamsSchema,
  listQuerySchema,
  updateCategoryBodySchema,
} from '../validation/schemas.js';
import { USER_ROLES } from '../constants/index.js';

const router = Router();

router.use(authenticate);
router.get('/', validate({ query: listQuerySchema }), getCategories);
router.post('/', authorize(USER_ROLES.ADMIN), validate({ body: createCategoryBodySchema }), createCategory);
router.put('/:id', authorize(USER_ROLES.ADMIN), validate({ params: idParamsSchema, body: updateCategoryBodySchema }), updateCategory);
router.delete('/:id', authorize(USER_ROLES.ADMIN), validate({ params: idParamsSchema }), deleteCategory);

export const categoryRoutes: Router = router;
