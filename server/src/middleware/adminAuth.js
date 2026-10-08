import { authenticate } from './auth.js';

export const requireAdmin = (req, res, next) => {
  authenticate(req, res, () => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!req.user.is_admin && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin authorization required' });
    }
    next();
  });
};

export default requireAdmin;
