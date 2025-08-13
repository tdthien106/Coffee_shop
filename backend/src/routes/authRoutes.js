import { Router } from 'express';
import AuthController from '../controllers/authController.js';
import { requireLogin, requireRole } from '../middleware/authMiddleware.js';

const authRoutes = Router();
authRoutes.post('/login', AuthController.login);
// authRoutes.get('/me', requireLogin, AuthController.me);
// authRoutes.post('/logout', requireLogin, AuthController.logout);

//ví dụ: chỉ Manager mới được gọi
// authRoutes.get('/manager-only', requireRole('manager'), (req,res)=>{
//   res.json({ success:true, secret:'Only managers see this' });
// });

export default authRoutes;
