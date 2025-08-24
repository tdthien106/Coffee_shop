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

    static async createShift({ date, ca }) {
        // date: '2025-08-22'
        // ca: 'C1' | 'C2' | 'C3'

        // Format shift_id
        const formattedDate = date.replace(/-/g, ''); // "20250822"
        const shiftID = `SH_${formattedDate}_${ca}`;

        // Mapping giờ làm
        const caMap = {
            C1: [6, 12],
            C2: [12, 18],
            C3: [18, 24]
        };

        if (!caMap[ca]) {
            throw new Error("Ca không hợp lệ, chỉ cho phép C1, C2, C3");
        }

        const [startHour, endHour] = caMap[ca];
        const start = `${date} ${String(startHour).padStart(2, "0")}:00:00`;
        const end =   `${date} ${String(endHour).padStart(2, "0")}:00:00`;

        const query = `
            INSERT INTO shifts (shift_id, start_time, end_time)
            VALUES ($1, $2, $3)
            ON CONFLICT (shift_id) DO NOTHING
            RETURNING shift_id AS "shiftID", start_time AS "start", end_time AS "end";
        `;

        const { rows } = await pool.query(query, [shiftID, start, end]);
        // Nếu shift đã tồn tại thì rows rỗng → lấy shift từ DB
        if (rows.length === 0) {
            const { rows: existing } = await pool.query(
                `SELECT shift_id AS "shiftID", start_time AS "start", end_time AS "end"
                FROM shifts WHERE shift_id = $1`, [shiftID]
            );
            return existing[0];
        }
        return rows[0];
    }



}

export default ShiftModel;