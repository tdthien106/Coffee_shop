import OrderModel from "../models/orderModel.js";

class OrderController {
  async create(req, res) {
    const order = await OrderModel.create(
      req.body.order_id,
      req.body.staff_id
    );
    res.json(order);
  }

  async addItem(req, res) {
    const item = await OrderModel.addItem(
      req.params.orderId,
      req.body.drink_id,
      req.body.quantity
    );
    res.json(item);
  }

  async getOrder(req, res) {
    const order = await OrderModel.get(req.params.orderId);
    res.json(order || {});
  }
}

export default new OrderController();