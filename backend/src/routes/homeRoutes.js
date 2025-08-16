import express from 'express';
import { getDashboardStats } from '../controllers/homeController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const homeRoutes = express.Router();

// Only managers and admins can access these endpoints
homeRoutes.get('/dashboard', authenticate, authorize(['manager', 'admin']), getDashboardStats);

export default homeRoutes;