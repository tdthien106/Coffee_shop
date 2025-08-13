// models/paymentModel.js
import pool from '../config/db.js';

class Payment {
  static async create(data, client = pool) {
    const payment_id = data.payment_id ?? data.paymentID ?? null; // có thể tự truyền hoặc generate ở controller
    const order_id   = data.order_id   ?? data.orderID;
    const method     = data.method;
    const amount     = data.amount;
    const payment_date = data.payment_date ?? null;

    const q = `
      INSERT INTO payment (payment_id, order_id, method, amount, payment_date)
      VALUES ($1, $2, $3, $4, COALESCE($5, now()))
      RETURNING *
    `;
    const v = [payment_id, order_id, method, amount, payment_date];
    const { rows } = await client.query(q, v);
    return rows[0];
  }

  static async findByOrderId(orderId) {
    const { rows } = await pool.query(
      'SELECT * FROM payment WHERE order_id = $1 ORDER BY payment_date DESC LIMIT 1',
      [orderId]
    );
    return rows[0];
  }

  static async findById(id) {
    const { rows } = await pool.query('SELECT * FROM payment WHERE payment_id = $1', [id]);
    return rows[0];
  }
}

export default Payment;
