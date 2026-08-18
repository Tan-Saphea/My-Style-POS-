import { Router } from 'express';
import { createSize, deleteSize, getSizes, updateSize } from '../controllers/masterData.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { USER_ROLES } from '../constants/index.js';
import { createSizeBodySchema, idParamsSchema, listQuerySchema, updateSizeBodySchema } from '../validation/schemas.js';

const router = Router();
router.use(authenticate);
router.get('/', validate({ query: listQuerySchema }), getSizes);
router.post('/', authorize(USER_ROLES.ADMIN), validate({ body: createSizeBodySchema }), createSize);
router.put('/:id', authorize(USER_ROLES.ADMIN), validate({ params: idParamsSchema, body: updateSizeBodySchema }), updateSize);
router.delete('/:id', authorize(USER_ROLES.ADMIN), validate({ params: idParamsSchema }), deleteSize);
export const sizeRoutes = router;
