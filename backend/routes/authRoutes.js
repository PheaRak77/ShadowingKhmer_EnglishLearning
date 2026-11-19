import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/google-client-id', AuthController.getGoogleClientId);
router.post('/register/send-code', AuthController.sendRegistrationCode);
router.post('/register/verify', AuthController.verifyRegistrationCode);
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.post('/google', AuthController.googleAuth);
router.post('/google/connect', authenticateToken, AuthController.connectGoogleAccount);
router.get('/me', authenticateToken, AuthController.getMe);

export default router;
