import pool from "../config/db.js";
import ShiftModel from "./shiftModel.js";

class ShiftEmployeeModel {
    static async getAll() {
        try {
            const { rows } = await pool.query(`
                SELECT se.*, s.start_time, s.end_time 
                FROM shift_employee se 
                JOIN shifts s ON se.shift_id = s.shift_id 
                ORDER BY s.start_time
            `);
            return rows;
        } catch (error) {
            console.error('ShiftEmployeeModel.getAll error:', error);
            throw new Error('Failed to fetch shift assignments');
        }
    }

    static async getByShiftId(shiftId) {
        try {
            const { rows } = await pool.query(`
                SELECT se.*, s.start_time, s.end_time 
                FROM shift_employee se 
                JOIN shifts s ON se.shift_id = s.shift_id 
                WHERE se.shift_id = $1
            `, [shiftId]);
            return rows;
        } catch (error) {
            console.error('ShiftEmployeeModel.getByShiftId error:', error);
            throw new Error('Failed to fetch shift assignments');
        }
    }

    static async getByEmployeeId(employeeId) {
        try {
            const { rows } = await pool.query(`
                SELECT se.*, s.start_time, s.end_time 
                FROM shift_employee se 
                JOIN shifts s ON se.shift_id = s.shift_id 
                WHERE se.employee_id = $1
                ORDER BY s.start_time
            `, [employeeId]);
            return rows;
        } catch (error) {
            console.error('ShiftEmployeeModel.getByEmployeeId error:', error);
            throw new Error('Failed to fetch employee assignments');
        }
    }

    static async create({ date, ca, employeeId }) {
        // 1. Tạo shift nếu chưa có
        const shift = await ShiftModel.createShift({ date, ca });

        // 2. Gán nhân viên vào shift
        const query = `
            INSERT INTO shift_employee (shift_id, employee_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
            RETURNING shift_id AS "shiftID", employee_id AS "employeeID";
        `;

        const { rows } = await pool.query(query, [shift.shiftID, employeeId]);
        // Nếu đã tồn tại thì rows = []
        if (rows.length === 0) {
            return { shiftID: shift.shiftID, employeeID: employeeId, message: "Đã tồn tại" };
        }
        return rows[0];
    }


    static async update( shiftID, newEmployeeId ) {
        const query = `
            UPDATE shift_employee
            SET employee_id = $2
            WHERE shift_id = $1
            RETURNING shift_id AS "shiftID", employee_id AS "employeeID";
        `;

        const { rows } = await pool.query(query, [shiftID, newEmployeeId]);

        if (rows.length === 0) {
            throw new Error("Không tìm thấy shiftID để update");
        }

        return rows[0];
    }



    static async delete(shiftID) {
        const query = `
            DELETE FROM shift_employee
            WHERE shift_id = $1
            RETURNING shift_id AS "shiftID", employee_id AS "employeeID";
        `;

        const { rows } = await pool.query(query, [shiftID]);

        if (rows.length === 0) {
            throw new Error(`Không tìm thấy shiftID ${shiftID} để xóa`);
        }

        return rows[0];
    }




}

export default ShiftEmployeeModel;