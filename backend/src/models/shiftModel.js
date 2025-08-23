import pool from "../config/db.js";

class ShiftModel {
    static async findAll() {
        const { rows } = await pool.query('SELECT * FROM shifts');
        return rows;
    }

    // Lấy ca làm việc theo ID
    static async getById(shiftId) {
        const { rows } = await pool.query(
            'SELECT * FROM shifts WHERE shift_id = $1',
            [shiftId]
        );
        return rows[0] || null;
    }

    static async getShiftsByDateRange(startDate, endDate) {
        const query = `
            SELECT 
                shift_id AS "shiftID",
                start_time AS "start",
                end_time AS "end"
            FROM shifts
            WHERE start_time >= $1 AND end_time <= $2
            ORDER BY start_time; `;

        const { rows } = await pool.query(query, [startDate, endDate]);
        return rows;
    }

}

export default ShiftModel;