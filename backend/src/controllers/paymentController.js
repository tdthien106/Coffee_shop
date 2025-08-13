// controllers/paymentController.js
import pool from '../config/db.js';
import Payment from '../models/paymentModel.js';
import { randomUUID } from 'crypto';

class PaymentController {
  // POST /payments
  static async process(req, res) {
    const client = await pool.connect();
    try {
      const order_id = req.body.order_id ?? req.body.orderID;
      const method   = req.body.method;
      const amount   = req.body.amount;
      const payment_id = req.body.payment_id ?? req.body.paymentID ?? randomUUID();

      await client.query('BEGIN'); // FKs are DEFERRABLE so we can do both inside one tx

      // insert payment
      const payment = await Payment.create(
        { payment_id, order_id, method, amount, payment_date: req.body.payment_date },
        client
      );

      // link to order + (optional) set status
      await client.query(
        'UPDATE orders SET payment_id = $1, status = COALESCE(status, $2) WHERE order_id = $3',
        [payment.payment_id, 'PAID', order_id]
      );

      await client.query('COMMIT');
      return res.status(201).json({ success: true, data: payment });
    } catch (e) {
      await client.query('ROLLBACK');
      return res.status(500).json({ success: false, message: e.message });
    } finally {
      client.release();
    }
  }

  // GET /payments/:orderId
  static async getByOrderId(req, res) {
    try {
      const orderId = req.params.orderId;
      const payment = await Payment.findByOrderId(orderId);
      if (!payment) {
        return res.status(404).json({ success: false, message: 'Payment not found for this order' });
      }
      return res.status(200).json({ success: true, data: payment });
    } catch (e) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }
}

export default PaymentController;
