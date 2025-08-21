import pool from "../config/db.js";

class Payment {
  /** Tạo payment (tự sinh payment_id nếu không truyền) */
  static async create(data, client = pool) {
    const payment_id  = data.payment_id ?? data.paymentID ?? ("P" + Date.now());
    const order_id    = data.order_id   ?? data.orderID;
    const method      = data.method || "cash";
    if(data.amount === undefined || data.amount === null) {
      throw new Error("amount is required");
    }
    const amount      = Number(data.amount || 0);
    const paymentDate = data.payment_date ?? null;

    const { rows } = await client.query(
      `INSERT INTO payment (payment_id, order_id, method, amount, payment_date)
       VALUES ($1, $2, $3, $4, COALESCE($5, now()))
       RETURNING *`,
      [payment_id, order_id, method, amount, paymentDate]
    );
    return rows[0];
  
  }

  /** Tạo payment **và** gắn vào orders (transaction an toàn) */
  static async createAndAttach({ order_id, method = "cash", amount, status = "PAID" }) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const payment = await this.create({ order_id, method, amount }, client);

      await client.query(
        `UPDATE orders
           SET payment_id = $2, status = $3
         WHERE order_id = $1`,
        [order_id, payment.payment_id, status]
      );

      await client.query("COMMIT");
      return payment;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  static async findByOrderId(orderId) {
    const { rows } = await pool.query(
      `SELECT * FROM payment
       WHERE order_id = $1
       ORDER BY payment_date DESC
       LIMIT 1`,
      [orderId]
    );
    return rows[0];
  }

  static async findById(id) {
    const { rows } = await pool.query(
      `SELECT * FROM payment WHERE payment_id = $1`,
      [id]
    );
    return rows[0];
  }
}

export default Payment;
