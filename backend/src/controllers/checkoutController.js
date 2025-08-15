// controllers/checkoutController.js
import pool from "../config/db.js";
import OrderModel from "../models/orderModel.js";
import PaymentModel from "../models/paymentModel.js";

export default class CheckoutController {
  static async checkout(req, res) {
    try {
      // body: { staff_id, method, items:[{drink_id, quantity, note}] }
      const { staff_id, method = "cash", items = [] } = req.body;
      if (!staff_id || !items.length) {
        return res.status(400).json({ success:false, message:"Missing staff_id or items" });
      }

      const order_id = "O" + Date.now();

      // 1) Create order
      await OrderModel.create(order_id, staff_id, { status: "PENDING" });

      // 2) Add items
      for (const it of items) {
        await OrderModel.addItem(
          order_id,
          it.drink_id,
          it.quantity ?? 1,
          it.note ?? null
        );
      }

      // 3) Tổng tiền từ DB
      const amount = await OrderModel.totalAmount(order_id);

      // 4) Payment
      const pay = await PaymentModel.create({ order_id, method, amount });

      // 5) Gắn vào orders + set trạng thái
      await OrderModel.attachPayment(order_id, pay.payment_id, { status: "PAID" });

      res.json({
        success: true,
        data: { order_id, payment_id: pay.payment_id, amount, method }
      });
    } catch (e) {
      console.error("checkout error", e);
      res.status(500).json({ success:false, message:e.message });
    }
  }
}
