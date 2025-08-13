// middlewares/paymentMiddleware.js
import pool from '../config/db.js';

export const validateProcessPayment = async (req, res, next) => {
  const order_id = req.body.order_id ?? req.body.orderID;
  const method   = req.body.method;
  const amount   = req.body.amount;

  if (!order_id || !method || amount === undefined) {
    return res.status(400).json({
      success: false,
      message: 'order_id, method, amount are required'
    });
  }
  if (Number(amount) < 0) {
    return res.status(400).json({ success: false, message: 'amount must be >= 0' });
  }

  // Order must exist
  const { rows } = await pool.query('SELECT order_id, payment_id, status FROM orders WHERE order_id = $1', [order_id]);
  if (!rows[0]) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  // Optional: prevent paying twice
  if (rows[0].payment_id) {
    return res.status(409).json({ success: false, message: 'Order already has a payment' });
  }

  next();
};
