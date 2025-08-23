import express from 'express';
import shiftEmployeeController from '../controllers/shiftemployeeController.js';

const router = express.Router();

// Routes cụ thể phải để trước
router.get('/', shiftEmployeeController.getAllAssignments);
router.get('/shift/:shiftId', shiftEmployeeController.getAssignmentsByShiftId);
router.get('/employee/:employeeId', shiftEmployeeController.getAssignmentsByEmployeeId);
router.get('/:assignmentId', shiftEmployeeController.getAssignmentById);

router.post('/', shiftEmployeeController.createAssignment);
router.put('/:assignmentId', shiftEmployeeController.updateAssignment);
router.delete('/:assignmentId', shiftEmployeeController.deleteAssignment);

export default router;
