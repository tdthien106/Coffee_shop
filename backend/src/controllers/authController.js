import bcrypt from 'bcrypt';
import User from '../models/userModel.js';

class AuthController {
  static async login(req, res) {
    try {
      const { username, password } = req.body || {};
      if (!username || !password)
        return res.status(400).json({ success:false, message:'username & password are required' });

      const user = await User.findByUsername(username);
      if (!user) return res.status(401).json({ success:false, message:'Invalid credentials' });

      // Nếu DB đã hash: bcrypt.compare; nếu chưa hash: so sánh plaintext
      let ok = false;
      try { ok = await bcrypt.compare(password, user.password); } catch(_) { ok = false; }
      if (!ok) ok = (password === user.password);
      if (!ok) return res.status(401).json({ success:false, message:'Invalid credentials' });

      // Lưu user tối thiểu vào session
      req.session.user = {
        user_id: user.user_id,
        username: user.username,
        role: (user.role || 'Staff').toLowerCase(), // 'manager' | 'staff'
        name: user.name,
        email: user.email
      };

      return res.status(200).json({ success:true, data: req.session.user });
    } catch (e) {
      console.error(e);
      res.status(500).json({ success:false, message:e.message });
    }
  }

  static async me(req, res) {
    if (!req.session.user) return res.status(401).json({ success:false, message:'Not logged in' });
    return res.json({ success:true, data: req.session.user });
  }

  static async logout(req, res) {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ success:false, message:'Logout failed' });
      res.clearCookie('connect.sid');
      res.json({ success:true });
    });
  }
}
export default AuthController;
