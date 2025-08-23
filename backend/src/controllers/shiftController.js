import ShiftModel from '../models/shiftModel.js';

class ShiftController {
    // GET all shifts
    async getAllShifts(req, res) {
        try {
            const shifts = await ShiftModel.findAll();
            res.json({
                success: true,
                data: shifts
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // GET shift by ID
    async getShiftById(req, res) {
        try {
            const shift = await ShiftModel.getById(req.params.shiftId);
            if (!shift) {
                return res.status(404).json({
                    success: false,
                    message: 'Shift not found'
                });
            }
            res.json({
                success: true,
                data: shift
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

export default new ShiftController();