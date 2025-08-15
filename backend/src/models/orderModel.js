import pool from "../config/db.js";

// Lấy giá từ bảng drink
async function getDrinkPrice(drinkId, client = pool) {
  const { rows } = await client.query(
    `SELECT price FROM drink WHERE drink_id = $1`,
    [drinkId]
  );
  if (!rows[0]) throw new Error(`Drink not found: ${drinkId}`);
  return Number(rows[0].price || 0);
}

// Tính total cho 1 dòng
function calcTotal(unitPrice, quantity, discount = 0) {
  const up = Number(unitPrice || 0);
  const q = Number(quantity || 1);
  const d = Math.max(0, Number(discount || 0)); // %
  const gross = up * q;
  return Math.max(0, Math.round(gross * (1 - d / 100)));
}

class OrderModel {
  /* ---------- ORDER BASE ---------- */
  static async create(orderId, staffId, { status = "CREATED" } = {}) {
    const { rows } = await pool.query(
      `INSERT INTO orders (order_id, staff_id, status, payment_id)
       VALUES ($1, $2, $3, NULL)
       RETURNING *`,
      [orderId, staffId, status]
    );
    return rows[0];
  }

  static async get(orderId) {
    const { rows } = await pool.query(
      `SELECT * FROM orders WHERE order_id = $1`,
      [orderId]
    );
    return rows[0] || null;
  }

  static async getWithItems(orderId) {
    const order = await this.get(orderId);
    if (!order) return null;

    const { rows: items } = await pool.query(
      `SELECT od.order_detail_id, od.order_id, od.drink_id, d.name,
              d.price AS unit_price, od.quantity, od.discount, od.total, od.note
       FROM order_detail od
       LEFT JOIN drink d ON d.drink_id = od.drink_id
       WHERE od.order_id = $1
       ORDER BY od.order_detail_id`,
      [orderId]
    );

    return { ...order, items };
  }

  /* ---------- ORDER DETAIL ---------- */
  static async addItem(
    orderId,
    drinkId,
    quantity,
    unitPrice = null,
    discount = 0,
    note = null
  ) {
    const client = await pool.connect();
    try {
      const price = unitPrice ?? (await getDrinkPrice(drinkId, client));
      const total = calcTotal(price, quantity, discount);
      const orderDetailId = `${orderId}-${drinkId}-${Date.now()}`;

      // Nếu bảng order_detail có cột note -> insert kèm; nếu không, xoá "note" ở dưới
      const { rows } = await client.query(
        `INSERT INTO order_detail
           (order_detail_id, order_id, drink_id, quantity, discount, total, note)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [orderDetailId, orderId, drinkId, quantity, discount, total, note]
      );
      return rows[0];
    } finally {
      client.release();
    }
  }

  static async createWithItems(orderId, staffId, items = []) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const r1 = await client.query(
        `INSERT INTO orders (order_id, staff_id, status, payment_id)
         VALUES ($1, $2, 'CREATED', NULL)
         RETURNING *`,
        [orderId, staffId]
      );
      const order = r1.rows[0];

      for (const it of items) {
        const drinkId  = it.drink_id;
        const quantity = Number(it.quantity || 1);
        const discount = Number(it.discount || 0);
        const price    = it.unit_price ?? (await getDrinkPrice(drinkId, client));
        const total    = calcTotal(price, quantity, discount);
        const odId     = `${orderId}-${drinkId}-${Date.now()}-${Math.floor(Math.random()*1000)}`;

        await client.query(
          `INSERT INTO order_detail
             (order_detail_id, order_id, drink_id, quantity, discount, total, note)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [odId, orderId, drinkId, quantity, discount, total, it.note ?? null]
        );
      }

      await client.query("COMMIT");

      const { rows: itemsRows } = await pool.query(
        `SELECT od.order_detail_id, od.order_id, od.drink_id, d.name,
                d.price AS unit_price, od.quantity, od.discount, od.total, od.note
         FROM order_detail od
         LEFT JOIN drink d ON d.drink_id = od.drink_id
         WHERE od.order_id = $1
         ORDER BY od.order_detail_id`,
        [orderId]
      );

      return { ...order, items: itemsRows };
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  /* ---------- SUM & PAYMENT LINK ---------- */
  static async totalAmount(orderId) {
    const { rows } = await pool.query(
      `SELECT COALESCE(SUM(total),0) AS amount
       FROM order_detail WHERE order_id = $1`,
      [orderId]
    );
    return Number(rows[0]?.amount || 0);
  }

  static async attachPayment(order_id, payment_id, { status = "PAID" } = {}) {
    const { rows } = await pool.query(
      `UPDATE orders
       SET payment_id = $2, status = $3
       WHERE order_id = $1
       RETURNING *`,
      [order_id, payment_id, status]
    );
    return rows[0];
  }
}

export default OrderModel;
