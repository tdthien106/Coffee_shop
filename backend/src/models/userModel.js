import pool from "../config/db.js";

class UserModel {
    static async findAll() {
        try {
            const { rows } = await pool.query('SELECT * FROM users');
            return rows;
        } catch (error) {
            console.error('UserModel.findAll error:', error);
            throw new Error('Failed to fetch users');
        }
    }

    static async findById(userId) {
        try {
            const { rows } = await pool.query(
                'SELECT * FROM users WHERE user_id = $1',
                [userId]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('UserModel.findById error:', error);
            throw new Error('Failed to fetch user');
        }
    }

    static async create(userData) {
        const {
            user_id,
            name,
            gender,
            birthday,
            phone_number,
            email,
            username,
            password
        } = userData;

        try {
            const { rows } = await pool.query(
                `INSERT INTO users (
                    user_id, name, gender, birthday, 
                    phone_number, email, username, password
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *`,
                [user_id, name, gender, birthday, phone_number, email, username, password]
            );
            return rows[0];
        } catch (error) {
            console.error('UserModel.create error:', error);
            throw new Error('Failed to create user');
        }
    }

    static async update(userId, updateData) {
        const fields = Object.keys(updateData);
        if (fields.length === 0) throw new Error('No fields to update');

        const setClause = fields
            .map((field, index) => `${field} = $${index + 1}`)
            .join(', ');

        try {
            const { rows } = await pool.query(
                `UPDATE users 
                SET ${setClause} 
                WHERE user_id = $${fields.length + 1}
                RETURNING *`,
                [...Object.values(updateData), userId]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('UserModel.update error:', error);
            throw new Error('Failed to update user');
        }
    }

    static async delete(userId) {
        try {
            const { rows } = await pool.query(
                'DELETE FROM users WHERE user_id = $1 RETURNING *',
                [userId]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('UserModel.delete error:', error);
            throw new Error('Failed to delete user');
        }
    }

    static async findByUsername(username) {
    const q = `
      SELECT u.user_id, u.username, u.password, u.name, u.email,
             COALESCE(e.position, 'Staff') AS role
      FROM users u
      LEFT JOIN employees e ON e.user_id = u.user_id
      WHERE u.username = $1
      LIMIT 1
    `;
    const { rows } = await pool.query(q, [username]);
    return rows[0];
  }
}

export default UserModel;