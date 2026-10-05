import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validateRequest } from '../../middleware/validate.js';
import { RegisterSchema, LoginSchema } from './auth.schema.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();

router.post('/register', validateRequest(RegisterSchema), AuthController.register);
router.post('/login', validateRequest(LoginSchema), AuthController.login);
router.get('/me', authenticateToken, AuthController.me);

export default router;
