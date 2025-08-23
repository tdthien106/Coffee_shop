import ExportModel from '../models/exportModel.js';

class ExportController {
    static async getAllOrders(req, res) {
        const { from, to } = req.query;
        try {
            const orders = await ExportModel.getAllOrder(from, to);
            res.json(orders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async getAllEmployees(req, res) {
        try {
            const employees = await ExportModel.getAllEmployee();
            res.json(employees);
        } catch (error) {
            console.error('Error fetching employees:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

export default ExportController;