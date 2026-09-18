import express from 'express';
import crypto from 'node:crypto';
import { db } from '../config/db.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

const BAD_WORDS = ['spam', 'fuck', 'shit'];
const containsBadWords = (text) =>
  BAD_WORDS.some(w => (text || '').toLowerCase().includes(w));

// Helper: populate author + book cho một review
const populateReview = (review) => {
  if (!review) return null;
  const author = db.collection('users').findById(review.author);
  const book = db.collection('books').findById(review.book);
  return {
    ...review,
    totalReactions: Object.values(review.reactions || {}).reduce((sum, arr) => sum + (arr?.length || 0), 0),
    author: author ? {
      _id: author._id, id: author._id, name: author.name,
      className: author.className, avatar: author.avatar, role: author.role
    } : null,
    book: book ? {
      _id: book._id, id: book._id, title: book.title,
      author: book.author, coverColor: book.coverColor, category: book.category
    } : null
  };
};

// GET /api/reviews
router.get('/', optionalAuth, (req, res, next) => {
  try {
    const { status = 'approved', book, author, sort = '-createdAt', page = 1, limit = 10 } = req.query;
    const isStaff = req.user && ['admin', 'ctv'].includes(req.user.role);
    const isOwnAuthor = req.user && author && author === req.user._id;

    // Chỉ approved là public. Các status khác (pending/rejected/all) chỉ admin/ctv
    // hoặc chính tác giả (khi lọc theo author=chính mình) mới xem được.
    if (status !== 'approved' && !isStaff && !isOwnAuthor) {
      return res.status(403).json({ error: 'Bạn không có quyền xem các review này' });
    }

    let reviews = db.collection('reviews').all();

    if (status !== 'all') reviews = reviews.filter(r => r.status === status);
    if (book) reviews = reviews.filter(r => r.book === book);
    if (author) reviews = reviews.filter(r => r.author === author);

    const sortField = sort.replace('-', '');
    const sortDesc = sort.startsWith('-');
    reviews.sort((a, b) => {
      const av = a[sortField], bv = b[sortField];
      if (av < bv) return sortDesc ? 1 : -1;
      if (av > bv) return sortDesc ? -1 : 1;
      return 0;
    });

    const total = reviews.length;
    const pageNum = Number(page), limitNum = Number(limit);
    const paged = reviews.slice((pageNum - 1) * limitNum, pageNum * limitNum).map(populateReview);

    res.json({
      reviews: paged,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) }
    });
  } catch (err) { next(err); }
});

// GET /api/reviews/:id
router.get('/:id', (req, res, next) => {
  try {
    const review = db.collection('reviews').findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Không tìm thấy review' });

    // Populate comments author
    const populated = populateReview(review);
    populated.comments = (review.comments || []).map(c => {
      const a = db.collection('users').findById(c.author);
      return { ...c, author: a ? { _id: a._id, name: a.name, className: a.className, avatar: a.avatar } : null };
    });

    res.json(populated);
  } catch (err) { next(err); }
});

// POST /api/reviews
router.post('/', protect, (req, res, next) => {
  try {
    const { book, title, content, rating } = req.body;
    if (!book || !title || !content || !rating) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' });
    }
    if (content.length < 100) {
      return res.status(400).json({ error: 'Review phải dài ít nhất 100 ký tự' });
    }
    if (!db.collection('books').findById(book)) {
      return res.status(404).json({ error: 'Sách không tồn tại' });
    }

    const hasBadWords = containsBadWords(content) || containsBadWords(title);
    // DEMO: auto-approve review ngay. Khi deploy production, đổi 'approved' → 'pending'
    // để bật lại moderation workflow (admin/ctv phải duyệt trước khi public)
    const status = hasBadWords ? 'rejected' : 'approved';

    const review = db.collection('reviews').insert({
      book, author: req.user._id, title, content, rating: Number(rating), status,
      moderationNote: hasBadWords ? 'Tự động reject vì chứa từ không phù hợp' : null,
      featured: false,
      reactions: { inspired: [], moved: [], thoughtful: [], fun: [] },
      comments: []
    });
    console.log(`📝 Review mới đã lưu: "${title}" (${status}) — by user ${req.user._id}`);

    // +50 XP cho đóng góp
    const users = db.collection('users');
    const user = users.findById(req.user._id);
    const newXp = (user.stats?.xp || 0) + 50;
    const newLevel = calculateLevel(newXp);
    users.update(user._id, {
      stats: {
        ...user.stats,
        xp: newXp, level: newLevel,
        reviewsWritten: (user.stats?.reviewsWritten || 0) + 1
      }
    });

    res.status(201).json({
      review: populateReview(review),
      message: hasBadWords
        ? 'Review không được duyệt vì chứa ngôn từ không phù hợp'
        : 'Đã đăng cảm nhận thành công! Bạn nhận được +50 XP 🎉'
    });
  } catch (err) { next(err); }
});

// PATCH /api/reviews/:id/moderate
router.patch('/:id/moderate', protect, authorize('admin', 'ctv'), (req, res, next) => {
  try {
    const { status, note } = req.body;
    const review = db.collection('reviews').update(req.params.id, {
      status, moderationNote: note
    });
    if (!review) return res.status(404).json({ error: 'Không tìm thấy review' });

    // +100 XP nếu approved
    if (status === 'approved') {
      const users = db.collection('users');
      const author = users.findById(review.author);
      if (author) {
        const newXp = (author.stats?.xp || 0) + 100;
        users.update(author._id, {
          stats: { ...author.stats, xp: newXp, level: calculateLevel(newXp) }
        });
      }
    }

    res.json(populateReview(review));
  } catch (err) { next(err); }
});

// POST /api/reviews/:id/react
router.post('/:id/react', protect, (req, res, next) => {
  try {
    const { type } = req.body;
    if (!['inspired', 'moved', 'thoughtful', 'fun'].includes(type)) {
      return res.status(400).json({ error: 'Loại reaction không hợp lệ' });
    }

    const review = db.collection('reviews').findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Không tìm thấy review' });

    const reactions = review.reactions || { inspired: [], moved: [], thoughtful: [], fun: [] };
    const list = reactions[type] || [];
    const userId = req.user._id;
    const idx = list.indexOf(userId);

    if (idx > -1) list.splice(idx, 1);
    else list.push(userId);

    reactions[type] = list;
    const updated = db.collection('reviews').update(review._id, { reactions });

    const totalReactions = Object.values(reactions).reduce((s, a) => s + a.length, 0);
    res.json({ reactions: updated.reactions, totalReactions });
  } catch (err) { next(err); }
});

// POST /api/reviews/:id/comments
router.post('/:id/comments', protect, (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || content.length < 2) return res.status(400).json({ error: 'Vui lòng viết bình luận' });
    if (containsBadWords(content)) return res.status(400).json({ error: 'Bình luận chứa ngôn từ không phù hợp' });

    const review = db.collection('reviews').findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Không tìm thấy review' });

    const newComment = {
      _id: crypto.randomUUID(),
      author: req.user._id,
      content,
      createdAt: new Date().toISOString()
    };
    const comments = [...(review.comments || []), newComment];
    db.collection('reviews').update(review._id, { comments });

    const author = db.collection('users').findById(req.user._id);
    res.status(201).json({
      ...newComment,
      author: { _id: author._id, name: author.name, className: author.className }
    });
  } catch (err) { next(err); }
});

// DELETE /api/reviews/:id
router.delete('/:id', protect, (req, res, next) => {
  try {
    const review = db.collection('reviews').findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Không tìm thấy review' });

    if (review.author !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Bạn không có quyền xóa review này' });
    }

    db.collection('reviews').delete(review._id);
    res.json({ message: 'Đã xóa review' });
  } catch (err) { next(err); }
});

// Helper
function calculateLevel(xp) {
  let level = 1, total = 0, required = 100;
  while (total + required <= xp) {
    total += required;
    level++;
    required = level * 100;
  }
  return level;
}

export default router;
