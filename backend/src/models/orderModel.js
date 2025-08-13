import pool from "../config/db.js";

class OrderModel {
  static async create(orderId, staffId) {
    const { rows } = await pool.query(
      `INSERT INTO orders (order_id, staff_id) 
       VALUES ($1, $2) RETURNING *`,
      [orderId, staffId]
    );
    return rows[0];
  }

  static async addItem(orderId, drinkId, quantity) {
    const { rows } = await pool.query(
      `INSERT INTO order_detail (order_id, drink_id, quantity) 
       VALUES ($1, $2, $3) RETURNING *`,
      [orderId, drinkId, quantity]
    );
    return rows[0];
  }

  static async get(orderId) {
    const { rows } = await pool.query(
      `SELECT * FROM orders WHERE order_id = $1`,
      [orderId]
    );
    return rows[0];
  }
}

export default OrderModel;