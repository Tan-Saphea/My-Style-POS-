import { Router } from 'express';
import { createColor, deleteColor, getColors, updateColor } from '../controllers/masterData.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { USER_ROLES } from '../constants/index.js';
import { createColorBodySchema, idParamsSchema, listQuerySchema, updateColorBodySchema } from '../validation/schemas.js';

const router = Router();
router.use(authenticate);
router.get('/', validate({ query: listQuerySchema }), getColors);
router.post('/', authorize(USER_ROLES.ADMIN), validate({ body: createColorBodySchema }), createColor);
router.put('/:id', authorize(USER_ROLES.ADMIN), validate({ params: idParamsSchema, body: updateColorBodySchema }), updateColor);
router.delete('/:id', authorize(USER_ROLES.ADMIN), validate({ params: idParamsSchema }), deleteColor);
export const colorRoutes = router;
