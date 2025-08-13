
import Drink from "../models/drinkModel.js";

class DrinkController {
  static async create(req, res) {
    try {
      const created = await Drink.create(req.body);
      res.status(201).json({ success: true, data: created });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  }
  static async getAll(req, res) {
    try {
      const rows = await Drink.findAll();
      res.status(200).json({ success: true, data: rows });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  }
  static async getById(req, res) {
    try {
      const row = await Drink.findById(req.params.id);
      if (!row)
        return res
          .status(404)
          .json({ success: false, message: "Drink not found" });
      res.status(200).json({ success: true, data: row });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  }
  static async update(req, res) {
    try {
      const row = await Drink.update(req.params.id, req.body);
      if (!row)
        return res
          .status(404)
          .json({ success: false, message: "Drink not found" });
      res.status(200).json({ success: true, data: row });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  }
  static async delete(req, res) {
    try {
      const row = await Drink.delete(req.params.id);
      if (!row)
        return res
          .status(404)
          .json({ success: false, message: "Drink not found" });
      res.status(200).json({ success: true, data: row });
    } catch (e) {
      res.status(409).json({ success: false, message: e.message });
    }
  }
}
export default DrinkController;
