// controllers/menuItemController.js
import MenuItem from "../models/menuItemModel.js";

class MenuItemController {
  static async create(req, res) {
    try {
      const created = await MenuItem.create(req.body);
      res.status(201).json({ success: true, data: created });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  static async getAll(req, res) {
    try {
      const items =
        req.query.withDrink === "1"
          ? await MenuItem.findAllWithDrink()
          : await MenuItem.findAll();
      res.status(200).json({ success: true, data: items });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  static async getById(req, res) {
    try {
      const item = await MenuItem.findById(req.params.id);
      if (!item)
        return res
          .status(404)
          .json({ success: false, message: "Menu item not found" });
      res.status(200).json({ success: true, data: item });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  static async update(req, res) {
    try {
      const updated = await MenuItem.update(req.params.id, req.body);
      if (!updated)
        return res
          .status(404)
          .json({ success: false, message: "Menu item not found" });
      res.status(200).json({ success: true, data: updated });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  static async delete(req, res) {
    try {
      const deleted = await MenuItem.delete(req.params.id);
      if (!deleted)
        return res
          .status(404)
          .json({ success: false, message: "Menu item not found" });
      res.status(200).json({ success: true, data: deleted });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  }
}

export default MenuItemController;