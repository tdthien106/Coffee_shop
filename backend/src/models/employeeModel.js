import pool from "../config/db.js";

class EmployeeModel {
    static async findAll() {
    const { rows } = await pool.query('SELECT * FROM employees');
    return rows;
  }

  // Lấy nhân viên theo ID
  static async findById(id) {
    const { rows } = await pool.query(
      'SELECT * FROM employees WHERE employee_id = $1', 
      [id]
    );
    return rows[0] || null;
  }

  // Tạo mới nhân viên
  static async create(data) {
    const { rows } = await pool.query(
      `INSERT INTO employees 
       (employee_id, user_id, position, salary) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [data.employee_id, data.user_id, data.position, data.salary]
    );
    return rows[0];
  }

  static async update(employeeId, updateData) {
    const fields = Object.keys(updateData);
    if (fields.length === 0) throw new Error('No fields to update');

    const setClause = fields
      .map((field, index) => `${field} = $${index + 1}`)
      .join(', ');

    try {
      const { rows } = await pool.query(
        `UPDATE employees 
         SET ${setClause} 
         WHERE employee_id = $${fields.length + 1}
         RETURNING *`,
        [...Object.values(updateData), employeeId]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('EmployeeModel.update error:', error);
      throw new Error('Failed to update employee');
    }
  }

  static async delete(employeeId) {
    try {
      const { rows } = await pool.query(
        'DELETE FROM employees WHERE employee_id = $1 RETURNING *',
        [employeeId]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('EmployeeModel.delete error:', error);
      throw new Error('Failed to delete employee');
    }
  }

  static async findByUserId(userId) {
    try {
    const { rows } = await pool.query(
      'SELECT * FROM employees WHERE user_id = $1',
      [userId]
    );
    return rows[0] || null;
    } catch (error) {
      console.error('EmployeeModel.findByUserId error:', error);
      throw new Error('Failed to fetch employee by user ID');
    }
  }
}

export default EmployeeModel;