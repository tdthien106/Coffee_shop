import pool from '../config/db.js';

class ExportModel {
    static async getAllOrder(from, to) {
        const q = 'SELECT * FROM orders WHERE create_time >= $1 AND create_time <= $2 ORDER BY create_time DESC';
        const { rows } = await pool.query(q, [from, to]);
        return rows;
    }

    static async getAllEmployee() {
        const { rows } = await pool.query('SELECT * FROM employees ORDER BY employee_id');
        return rows;
    }
}

export default ExportModel;