import express from 'express';
import { exportReport } from '../controllers/exportController.js';

const router = express.Router();

router.post('/', exportReport);

export default router;