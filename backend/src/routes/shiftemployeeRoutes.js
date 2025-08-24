import express from 'express';
import shiftEmployeeController from '../controllers/shiftemployeeController.js';

const router = express.Router();

// Routes cụ thể phải để trước
router.get('/', shiftEmployeeController.getAllAssignments);
router.get('/shift/:shiftId', shiftEmployeeController.getAssignmentsByShiftId);
router.get('/employee/:employeeId', shiftEmployeeController.getAssignmentsByEmployeeId);

router.post('/create', shiftEmployeeController.createAssignment);
router.put('/:shiftID', shiftEmployeeController.updateAssignment);
router.delete('/delete/:ShiftID', shiftEmployeeController.deleteAssignments);

export default router;
