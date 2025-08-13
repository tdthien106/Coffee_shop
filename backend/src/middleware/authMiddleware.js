export const requireLogin = (req, res, next) => {
  if (!req.session?.user)
    return res.status(401).json({ success:false, message:'Unauthorized' });
  next();
};

export const requireRole = (...roles) => {
  const allow = roles.map(r => r.toLowerCase());
  return (req, res, next) => {
    const u = req.session?.user;
    if (!u) return res.status(401).json({ success:false, message:'Unauthorized' });
    if (!allow.includes(u.role))
      return res.status(403).json({ success:false, message:'Forbidden: insufficient role' });
    next();
  };
};
