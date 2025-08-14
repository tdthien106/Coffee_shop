// controllers/authController.js
import pool from "../config/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

function signToken({ user_id, username, role }) {
  return jwt.sign(
    { userId: user_id, username, role: role || 'customer' },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
}

async function inferRole(userId) {
  const q = async (sql, v) => (await pool.query(sql, v)).rowCount > 0;
  if (await q(`SELECT 1 FROM admins   WHERE user_id = $1`, [userId])) return 'admin';
  if (await q(`SELECT 1 FROM managers WHERE user_id = $1`, [userId])) return 'manager';
  if (await q(`SELECT 1 FROM staffs   WHERE user_id = $1`, [userId])) return 'staff';
  return 'customer';
}

class AuthController {
  async login(req, res) {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ success:false, message:'Missing username/password' });
    }

    try {
      const { rows } = await pool.query(
        `SELECT user_id, username, password FROM users WHERE username = $1`,
        [username]
      );
      if (!rows[0]) {
        return res.status(401).json({ success:false, message:'Username does not exist' });
      }
      const user = rows[0];

      // Nếu DB cũ còn plaintext, cho phép fallback so sánh thường
      let ok = false;
      if (user.password?.startsWith('$2')) {
        ok = await bcrypt.compare(password, user.password);
      } else {
        ok = (password === user.password);
      }
      if (!ok) {
        return res.status(401).json({ success:false, message:'Invalid password' });
      }

      const role = await inferRole(user.user_id);
      const token = signToken({ user_id: user.user_id, username: user.username, role });

      return res.json({
        success: true,
        token,
        user: { user_id: user.user_id, username: user.username, role }
      });
    } catch (e) {
      console.error('Login error:', e);
      res.status(500).json({ success:false, message:'Internal server error' });
    }
  }

  async me(req, res) {
    // với JWT: req.user gán bởi requireLogin
    res.json({ success:true, data: req.user || null });
  }

  async logout(_req, res) {
    // JWT không lưu server-side, FE chỉ cần xoá token
    res.json({ success:true });
  }
}

export default new AuthController();
