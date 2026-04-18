import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'demo_secret_doi_khi_deploy_that';

export const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ error: 'Bạn cần đăng nhập để truy cập' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.collection('users').findById(decoded.id);
    if (!user) return res.status(401).json({ error: 'Tài khoản không tồn tại' });

    // Gắn user vào req (không gồm password)
    const { password, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

export const optionalAuth = (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = db.collection('users').findById(decoded.id);
      if (user) {
        const { password, ...safeUser } = user;
        req.user = safeUser;
      }
    } catch (err) { /* ignore */ }
  }
  next();
};

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      error: `Chỉ ${roles.join(', ')} mới có quyền thực hiện hành động này`
    });
  }
  next();
};
