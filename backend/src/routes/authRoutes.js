import { Router } from 'express';
import AuthController from '../controllers/authController.js';
import { requireLogin, requireRole } from '../middleware/authMiddleware.js';

const router = Router();
router.post('/login', AuthController.login);
router.get('/me', requireLogin, AuthController.me);
router.post('/logout', requireLogin, AuthController.logout);

// ví dụ: chỉ Manager mới được gọi
router.get('/manager-only', requireRole('manager'), (req,res)=>{
  res.json({ success:true, secret:'Only managers see this' });
});

export default router;
