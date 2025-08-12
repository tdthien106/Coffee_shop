import pool from '../config/db.js';

class User {
  static async create(userData) {
    const query = `INSERT INTO "User" (userID, name, email, username, password) 
                   VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    const values = [userData.userID, userData.name, userData.email, 
                   userData.username, userData.password];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findAll() {
    const { rows } = await pool.query('SELECT * FROM "User"');
    return rows;
  }

  static async findByUsername(username) {
    const { rows } = await pool.query('SELECT * FROM "User" WHERE username = $1', [username]);
    return rows[0];
  }
}

export default User;