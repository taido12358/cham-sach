import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../config/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'demo_secret_doi_khi_deploy_that';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

const signToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

const toSafeUser = (u) => {
  if (!u) return null;
  const { password, ...rest } = u;
  return { id: u._id, ...rest };
};

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, className } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    const users = db.collection('users');
    if (users.findOne({ email: email.toLowerCase() })) {
      return res.status(400).json({ error: 'Email đã được sử dụng' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = users.insert({
      name, email: email.toLowerCase(), password: hash,
      className: className || '',
      role: 'student', avatar: '', bio: '',
      stats: { booksRead: 0, reviewsWritten: 0, xp: 0, level: 1, streak: 0, lastCheckin: null },
      badges: [], savedBooks: []
    });

    res.status(201).json({ token: signToken(user._id), user: toSafeUser(user) });
  } catch (err) { next(err); }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập email và mật khẩu' });
    }

    const user = db.collection('users').findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }

    res.json({ token: signToken(user._id), user: toSafeUser(user) });
  } catch (err) { next(err); }
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json({ user: { id: req.user._id, ...req.user } });
});

export default router;
