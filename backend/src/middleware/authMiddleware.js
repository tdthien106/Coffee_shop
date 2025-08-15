// middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';

// Lấy token từ Authorization header hoặc cookie "token"
function extractToken(req) {
  const h = req.headers.authorization || '';
  if (h.startsWith('Bearer ')) return h.slice(7);
  return req.cookies?.token || null; // nếu bạn set cookie phía server
}

export const requireLogin = (req, res, next) => {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ success:false, message:'Unauthorized' });

  try {
      const p = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { user_id: p.userId, role: String(p.role || '').toLowerCase(), username: p.username };
    next();
  } catch (e) {
    return res.status(401).json({ success:false, message:'Unauthorized' });
  }
};

export const requireRole = (...roles) => {
  const allow = roles.map(r => String(r).toLowerCase());
  return (req, res, next) => {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ success:false, message:'Unauthorized' });

    try {
      const p = jwt.verify(token, process.env.JWT_SECRET);
      const role = String(p.role || '').toLowerCase();
      if (!allow.includes(role)) {
        return res.status(403).json({ success:false, message:'Forbidden: insufficient role' });
      }
      req.user = { user_id: p.userId, role, username: p.username };
      next();
    } catch {
      return res.status(401).json({ success:false, message:'Unauthorized' });
    }
  };
};
