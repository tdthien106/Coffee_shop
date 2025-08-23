import Router from 'express';
import ExportController from '../controllers/exportController.js';

const router = Router();

router.get('/orders', ExportController.getAllOrders);
router.get('/employees', ExportController.getAllEmployees);

export default router;