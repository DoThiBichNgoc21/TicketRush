import { Router } from 'express';
import { registerAdmin, loginAdmin, registerUser, loginUser, verifyEmail, resendVerificationEmail } from '../Controllers/authController.js';

const router = Router();

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.post('/user/register', registerUser);
router.post('/user/login', loginUser);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification-email', resendVerificationEmail);

export default router;
