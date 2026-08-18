import { Router } from 'express';
import { createUser, deleteUser, getUsers, updateUser } from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { USER_ROLES } from '../constants/index.js';
import { createUserBodySchema, idParamsSchema, listQuerySchema, updateUserBodySchema } from '../validation/schemas.js';

const router = Router();
router.use(authenticate, authorize(USER_ROLES.ADMIN));
router.get('/', validate({ query: listQuerySchema }), getUsers);
router.post('/', validate({ body: createUserBodySchema }), createUser);
router.put('/:id', validate({ params: idParamsSchema, body: updateUserBodySchema }), updateUser);
router.delete('/:id', validate({ params: idParamsSchema }), deleteUser);
export const userRoutes = router;
