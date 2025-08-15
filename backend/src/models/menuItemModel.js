// models/menuItemModel.js
import pool from "../config/db.js";

class MenuItem {
  static async create({
    item_id,
    name,
    category,
    description = null,
    base_price,
    cost = null,
  }) {
    const q = `INSERT INTO menu_item(item_id, name, category, description, base_price, cost)
               VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;
    const v = [item_id, name, category, description, base_price, cost];
    const { rows } = await pool.query(q, v);
    return rows[0];
  }

  static async findAll() {
    const { rows } = await pool.query(
      "SELECT * FROM menu_item ORDER BY item_id"
    );
    return rows;
  }

  static async findById(id) {
    const { rows } = await pool.query(
      "SELECT * FROM menu_item WHERE item_id = $1",
      [id]
    );
    return rows[0];
  }

  static async update(id, payload) {
    const fields = ["name", "category", "description", "base_price", "cost"];
    const sets = [];
    const values = [];
    fields.forEach((f) => {
      const col = f === "base_price" ? '"base_price"' : `"${f}"`;
      if (payload[f] !== undefined) {
        sets.push(`${col} = $${sets.length + 1}`);
        values.push(payload[f]);
      }
    });
    if (!sets.length) return await this.findById(id);
    values.push(id);
    const q = `UPDATE menu_item SET ${sets.join(", ")} WHERE item_id = $${
      values.length
    } RETURNING *`;
    const { rows } = await pool.query(q, values);
    return rows[0];
  }

  static async delete(id) {
    const { rows } = await pool.query(
      "DELETE FROM menu_item WHERE item_id = $1 RETURNING *",
      [id]
    );
    return rows[0];
  }

  // tiện: lấy menu kèm info Drink
   static async findAllWithDrink() {
      const q = `
        SELECT
          mi.item_id,
          mi.name,
          mi.category,
          mi.description,
          mi.base_price,
          mi.cost,
          d.unit,
          d.price,            -- giá trong drink (nếu bạn cần)
          d.recipe_id,
          d.image_url         -- ẢNH từ drink
        FROM menu_item mi
        LEFT JOIN drink d
          ON d.drink_id = mi.item_id
        ORDER BY mi.item_id
      `;
      const { rows } = await pool.query(q);
    return rows;
  }
}

export default MenuItem;
