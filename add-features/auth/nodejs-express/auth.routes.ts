import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authMiddleware } from './auth.middleware';

const router = Router();
const authController = new AuthController();

// Public Routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected Routes (requires valid JWT)
router.get('/me', authMiddleware, authController.getProfile);

export default router;
