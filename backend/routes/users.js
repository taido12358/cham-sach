import express from 'express';
import { db } from '../config/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const toSafeUser = (u) => {
  if (!u) return null;
  const { password, ...rest } = u;
  return { id: u._id, ...rest };
};

function calculateLevel(xp) {
  let level = 1, total = 0, required = 100;
  while (total + required <= xp) {
    total += required;
    level++;
    required = level * 100;
  }
  return level;
}

// GET /api/users/leaderboard
router.get('/leaderboard', (req, res, next) => {
  try {
    const { limit = 10, className } = req.query;
    let users = db.collection('users').all();
    if (className) users = users.filter(u => u.className === className);

    users = users
      .filter(u => u.role === 'student') // Chỉ hiện học sinh
      .sort((a, b) => (b.stats?.xp || 0) - (a.stats?.xp || 0))
      .slice(0, Number(limit))
      .map(u => ({
        _id: u._id, id: u._id, name: u.name, className: u.className,
        avatar: u.avatar, stats: u.stats, badges: u.badges
      }));

    res.json(users);
  } catch (err) { next(err); }
});

// GET /api/users/:id
router.get('/:id', (req, res, next) => {
  try {
    const user = db.collection('users').findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Không tìm thấy user' });

    // Populate savedBooks
    const savedBooks = (user.savedBooks || []).map(id => {
      const b = db.collection('books').findById(id);
      return b ? { _id: b._id, title: b.title, author: b.author, coverColor: b.coverColor, category: b.category } : null;
    }).filter(Boolean);

    // Tất cả reviews của user (approved + pending + rejected)
    // User xem được bài pending của chính mình
    const reviews = db.collection('reviews')
      .find({ author: req.params.id })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20)
      .map(r => {
        const book = db.collection('books').findById(r.book);
        return {
          ...r,
          book: book ? { _id: book._id, title: book.title, author: book.author, coverColor: book.coverColor } : null
        };
      });

    res.json({
      user: { ...toSafeUser(user), savedBooks },
      reviews
    });
  } catch (err) { next(err); }
});

// PATCH /api/users/me
router.patch('/me', protect, (req, res, next) => {
  try {
    const allowed = ['name', 'className', 'bio', 'avatar'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const updated = db.collection('users').update(req.user._id, updates);
    res.json(toSafeUser(updated));
  } catch (err) { next(err); }
});

// POST /api/users/me/checkin
router.post('/me/checkin', protect, (req, res, next) => {
  try {
    const user = db.collection('users').findById(req.user._id);
    const now = new Date();
    const last = user.stats?.lastCheckin ? new Date(user.stats.lastCheckin) : null;
    let streak = user.stats?.streak || 0;

    if (last) {
      const hours = (now - last) / (1000 * 60 * 60);
      if (hours < 20) {
        return res.status(400).json({ error: 'Bạn đã check-in hôm nay rồi. Hãy quay lại vào ngày mai!' });
      }
      streak = hours < 48 ? streak + 1 : 1;
    } else {
      streak = 1;
    }

    const newXp = (user.stats?.xp || 0) + 20;
    const newLevel = calculateLevel(newXp);

    // Kiểm tra badge mới
    const badges = [...(user.badges || [])];
    const newBadges = [];
    if (streak === 7 && !badges.some(b => b.name === 'Bạn đồng hành')) {
      const badge = { name: 'Bạn đồng hành', earnedAt: now.toISOString() };
      badges.push(badge); newBadges.push(badge);
    }
    if (streak === 30 && !badges.some(b => b.name === 'Mọt sách bền bỉ')) {
      const badge = { name: 'Mọt sách bền bỉ', earnedAt: now.toISOString() };
      badges.push(badge); newBadges.push(badge);
    }

    db.collection('users').update(user._id, {
      stats: { ...user.stats, xp: newXp, level: newLevel, streak, lastCheckin: now.toISOString() },
      badges
    });

    res.json({
      streak, xp: newXp, level: newLevel, newBadges,
      message: `Check-in thành công! Streak: ${streak} ngày 🔥`
    });
  } catch (err) { next(err); }
});

// GET /api/users/me/stats
router.get('/me/stats', protect, (req, res, next) => {
  try {
    const user = db.collection('users').findById(req.user._id);
    const approvedCount = db.collection('reviews').count({ author: req.user._id, status: 'approved' });
    const pendingCount = db.collection('reviews').count({ author: req.user._id, status: 'pending' });

    res.json({
      ...user.stats,
      savedBooks: (user.savedBooks || []).length,
      approvedReviews: approvedCount,
      pendingReviews: pendingCount,
      badges: user.badges || []
    });
  } catch (err) { next(err); }
});

export default router;
