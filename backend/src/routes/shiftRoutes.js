import express from 'express';
import shiftController from '../controllers/shiftController.js';

const router = express.Router();


router.get('/', shiftController.getAllShifts);
router.get('/:shiftId', shiftController.getShiftById);

export default router;