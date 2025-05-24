import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { userValidators } from '../utils/validators';
import { handleValidationErrors } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// POST /api/auth/register
router.post('/register', 
  userValidators.register(),
  handleValidationErrors,
  AuthController.register
);

// POST /api/auth/login
router.post('/login',
  userValidators.login(),
  handleValidationErrors,
  AuthController.login
);

// GET /api/auth/me (rota protegida)
router.get('/me',
  authenticateToken,
  AuthController.getProfile
);

// POST /api/auth/logout
router.post('/logout',
  authenticateToken,
  AuthController.logout
);

export default router;