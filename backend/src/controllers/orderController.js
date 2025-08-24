import OrderModel from "../models/orderModel.js";

class OrderController {
  static async create(req, res) {
    const staffIdFromSession = req.session?.user?.user_id;
    const staffId = staffIdFromSession || req.body.staff_id;
    if (!staffId) return res.status(401).json({ success:false, message:'Missing staff_id' });

    const orderId = req.body.order_id || generateOrderId();
    const items = Array.isArray(req.body.items) ? req.body.items : [];

    try {
      let created;
      if (items.length) {
        created = await OrderModel.createWithItems(orderId, staffId, items);
      } else {
        created = await OrderModel.create(orderId, staffId);
      }

      await updateRevenueCache();
      res.status(201).json({ success:true, data: created });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success:false, message: err.message });
    }
  }

  static async addItem(req, res) {
    try {
      const { drink_id, quantity, unit_price, discount, note} = req.body;
      const item = await OrderModel.addItem(
        req.params.orderId,
        drink_id,
        Number(quantity ?? 1),
        unit_price ?? null ,
        Number(discount ?? 0),
        note ?? null
      );
      res.json({ success:true, data:item });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success:false, message: err.message });
    }
  }

  static async getOrder(req, res) {
    try {
      const order = await OrderModel.getWithItems(req.params.orderId);
      if (!order) return res.status(404).json({ success:false, message:'Order not found' });
      res.json({ success:true, data: order });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success:false, message: err.message });
    }
  }
}

function generateOrderId() {
  const s = new Date().toISOString().replace(/[-:.TZ]/g, "");
  return `O${s}`;
}

// Hàm cập nhật cache revenue
async function updateRevenueCache() {
  try {
    // Xóa cache hoặc cập nhật thống kê
    // Có thể implement caching mechanism ở đây
    console.log('Revenue cache updated after order creation');
  } catch (error) {
    console.error('Error updating revenue cache:', error);
  }
}

export default OrderController;
