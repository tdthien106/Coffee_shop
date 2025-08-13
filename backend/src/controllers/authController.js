import pool from "../config/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

class AuthController {
  async login(req, res) {
    const { username, password } = req.body;

    try {
      // 1. Kiểm tra user tồn tại
      const user = await pool.query(
        `SELECT u.user_id, u.username, u.password, e.position 
         FROM users u
         LEFT JOIN employees e ON u.user_id = e.user_id
         WHERE u.username = $1`,
        [username]
      );

      if (user.rows.length === 0) {
        return res.status(401).json({ error: "Username doess not exit" });
      }

      const userData = user.rows[0];

      // 2. Kiểm tra mật khẩu
      const validPassword = await bcrypt.compare(password, userData.password);
      if (!validPassword) {
        return res.status(401).json({ error: "" });
      }

      // 3. Tạo JWT token với thông tin role
      const token = jwt.sign(
        {
          userId: userData.user_id,
          role: userData.position || 'customer' // Mặc định là customer nếu không có position
        },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );

      // 4. Trả về thông tin đăng nhập
      res.json({
        token,
        user: {
          id: userData.user_id,
          role: userData.position || 'customer'
        }
      });

    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Lỗi hệ thống" });
    }
  }
}

export default new AuthController();