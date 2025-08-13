// models/drinkModel.js
import pool from '../config/db.js';

class Drink {
  static async create(data) {
    const drink_id  = data.drink_id ?? data.drinkID;
    const name      = data.name;
    const unit      = data.unit ?? null;
    const price     = data.price;
    const recipe_id = data.recipe_id ?? data.recipeID ?? null;

    const q = `
      INSERT INTO drink (drink_id, name, unit, price, recipe_id)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING *
    `;
    const v = [drink_id, name, unit, price, recipe_id];
    const { rows } = await pool.query(q, v);
    return rows[0];
  }

  static async findAll() {
    const { rows } = await pool.query('SELECT * FROM drink ORDER BY drink_id');
    return rows;
  }

  static async findById(id) {
    const { rows } = await pool.query('SELECT * FROM drink WHERE drink_id = $1', [id]);
    return rows[0];
  }

  static async update(id, payload) {
    const map = {
      name: payload.name,
      unit: payload.unit,
      price: payload.price,
      recipe_id: payload.recipe_id ?? payload.recipeID
    };
    const sets = [];
    const vals = [];
    Object.entries(map).forEach(([col, val]) => {
      if (val !== undefined) { vals.push(val); sets.push(`${col} = $${vals.length}`); }
    });
    if (!sets.length) return await this.findById(id);
    vals.push(id);
    const q = `UPDATE drink SET ${sets.join(', ')} WHERE drink_id = $${vals.length} RETURNING *`;
    const { rows } = await pool.query(q, vals);
    return rows[0];
  }

  static async delete(id) {
    const { rows } = await pool.query('DELETE FROM drink WHERE drink_id = $1 RETURNING *', [id]);
    return rows[0];
  }
}

export default Drink;
