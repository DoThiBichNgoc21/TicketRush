import { Router } from 'express';
import { registerAdmin, loginAdmin, registerUser, loginUser } from '../Controllers/authController.js';

const router = Router();

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.post('/user/register', registerUser);
router.post('/user/login', loginUser);

export default router;
