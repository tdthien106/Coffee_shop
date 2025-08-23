import pool from "../config/db.js";

class ShiftEmployeeModel {
    static async getAll() {
        try {
            const { rows } = await pool.query(`
                SELECT se.*, s.start_time, s.end_time 
                FROM shift_employees se 
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
                FROM shift_employees se 
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
                FROM shift_employees se 
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

    static async create(assignmentData) {
        const { shift_id, employee_id, role, notes } = assignmentData;
        
        try {
            const { rows } = await pool.query(`
                INSERT INTO shift_employees (shift_id, employee_id, role, notes) 
                VALUES ($1, $2, $3, $4) 
                RETURNING *
            `, [shift_id, employee_id, role, notes || null]);
            return rows[0];
        } catch (error) {
            console.error('ShiftEmployeeModel.create error:', error);
            throw new Error('Failed to create shift assignment');
        }
    }

    static async update(assignmentId, assignmentData) {
        const { role, notes } = assignmentData;
        
        try {
            const { rows } = await pool.query(`
                UPDATE shift_employees 
                SET role = $1, notes = $2 
                WHERE assignment_id = $3 
                RETURNING *
            `, [role, notes || null, assignmentId]);
            return rows[0] || null;
        } catch (error) {
            console.error('ShiftEmployeeModel.update error:', error);
            throw new Error('Failed to update shift assignment');
        }
    }

    static async delete(assignmentId) {
        try {
            const { rows } = await pool.query(`
                DELETE FROM shift_employees 
                WHERE assignment_id = $1 
                RETURNING *
            `, [assignmentId]);
            return rows[0] || null;
        } catch (error) {
            console.error('ShiftEmployeeModel.delete error:', error);
            throw new Error('Failed to delete shift assignment');
        }
    }


}

export default ShiftEmployeeModel;