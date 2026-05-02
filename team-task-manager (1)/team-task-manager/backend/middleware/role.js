// Middleware to restrict routes to admins only
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied. Admins only.' });
};

// Middleware to allow both admin and member but attach role info
const requireMember = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'member')) {
    return next();
  }
  return res.status(403).json({ message: 'Access denied.' });
};

module.exports = { requireAdmin, requireMember };
