import ShiftEmployeeModel from '../models/shiftemployeeModel.js';
import ShiftModel from '../models/shiftModel.js';


class ShiftEmployeeController {
    // GET all assignments
    async getAllAssignments(req, res) {
        try {
            const assignments = await ShiftEmployeeModel.getAll();
            res.json({
                success: true,
                data: assignments
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }


    // GET assignments by shift ID
    async getAssignmentsByShiftId(req, res) {
        try {
            const assignments = await ShiftEmployeeModel.getByShiftId(req.params.shiftId);
            res.json({
                success: true,
                data: assignments
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // GET assignments by employee ID
    async getAssignmentsByEmployeeId(req, res) {
        try {
            const assignments = await ShiftEmployeeModel.getByEmployeeId(req.params.employeeId);
            res.json({
                success: true,
                data: assignments
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // POST create assignment
    async createAssignment(req, res) {
        try {
            
            const newAssignment = await ShiftEmployeeModel.create(req.body);
            res.status(201).json({
                success: true,
                data: newAssignment
            });
        } catch (error) {
            if (error.message.includes('duplicate key') || error.message.includes('already exists')) {
                return res.status(409).json({
                    success: false,
                    message: 'Employee is already assigned to this shift'
                });
            }
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // PUT update assignment
    async updateAssignment(req, res) {
        try {
            const updatedAssignment = await ShiftEmployeeModel.update(req.params.assignmentId, req.body);
            if (!updatedAssignment) {
                return res.status(404).json({
                    success: false,
                    message: 'Assignment not found'
                });
            }
            res.json({
                success: true,
                data: updatedAssignment
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // DELETE assignment
    async deleteAssignment(req, res) {
        try {
            const deletedAssignment = await ShiftEmployeeModel.delete(req.params.assignmentId);
            if (!deletedAssignment) {
                return res.status(404).json({
                    success: false,
                    message: 'Assignment not found'
                });
            }
            res.json({
                success: true,
                data: deletedAssignment,
                message: 'Assignment deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

export default new ShiftEmployeeController();