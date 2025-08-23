// routes/revenueRoutes.js
import express from 'express';
import {
  getRevenueOverview,
  getPopularItems,
  getRevenueDistribution,
  getPeakHours,
  getKeyMetrics,
  getRevenueByProduct
} from '../controllers/revenueController.js';

const router = express.Router();

// Get revenue overview data
router.get('/overview', getRevenueOverview);

// Get popular items data
router.get('/popular-items', getPopularItems);

// Get revenue distribution by channel
router.get('/distribution', getRevenueDistribution);

// Get peak hours data
router.get('/peak-hours', getPeakHours);

// Get key metrics
router.get('/metrics', getKeyMetrics);

// Get revenue by product
router.get('/by-product', getRevenueByProduct);

export default router;