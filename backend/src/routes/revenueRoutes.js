import express from 'express';
import revenueController from '../controllers/revenueController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Tất cả routes đều yêu cầu xác thực và chỉ cho manager/admin
router.use(authenticate);
router.use(authorize('manager', 'admin'));

// API endpoints
router.get('/overview', revenueController.getRevenueOverview);
router.get('/popular-items', revenueController.getPopularItems);
router.get('/distribution', revenueController.getRevenueDistribution);
router.get('/peak-hours', revenueController.getPeakHours);
router.get('/metrics', revenueController.getKeyMetrics);
router.get('/by-product', revenueController.getRevenueByProduct);

export default router;