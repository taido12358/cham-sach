import express from 'express';
import { db } from '../config/db.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/books
router.get('/', (req, res, next) => {
  try {
    const { category, search, featured, sort = '-createdAt', page = 1, limit = 12 } = req.query;
    let books = db.collection('books').all();

    if (category && category !== 'all') books = books.filter(b => b.category === category);
    if (featured === 'true') books = books.filter(b => b.featured);
    if (search) {
      const s = search.toLowerCase();
      books = books.filter(b =>
        b.title.toLowerCase().includes(s) ||
        b.author.toLowerCase().includes(s) ||
        b.summary?.toLowerCase().includes(s)
      );
    }

    // Sort
    const sortField = sort.replace('-', '');
    const sortDesc = sort.startsWith('-');
    books.sort((a, b) => {
      const av = a[sortField], bv = b[sortField];
      if (av < bv) return sortDesc ? 1 : -1;
      if (av > bv) return sortDesc ? -1 : 1;
      return 0;
    });

    const total = books.length;
    const pageNum = Number(page), limitNum = Number(limit);
    const paged = books.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.json({
      books: paged,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) }
    });
  } catch (err) { next(err); }
});

// GET /api/books/:id
router.get('/:id', optionalAuth, (req, res, next) => {
  try {
    const book = db.collection('books').findById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Không tìm thấy sách' });

    // Tăng read count
    db.collection('books').update(book._id, { readCount: (book.readCount || 0) + 1 });

    const isBookmarked = req.user
      ? (req.user.savedBooks || []).includes(book._id)
      : false;

    res.json({ book, isBookmarked });
  } catch (err) { next(err); }
});

// POST /api/books — chỉ admin/ctv
router.post('/', protect, authorize('admin', 'ctv'), (req, res, next) => {
  try {
    const { title, author, category, summary, ...rest } = req.body;
    if (!title || !author || !category || !summary) {
      return res.status(400).json({ error: 'Vui lòng điền đủ thông tin' });
    }
    if (summary.length < 200) {
      return res.status(400).json({ error: 'Tóm tắt phải dài ít nhất 200 ký tự' });
    }

    const book = db.collection('books').insert({
      title, author, category, summary, ...rest,
      coverColor: rest.coverColor || '#1F3A2D',
      featured: false, readCount: 0, ratingAvg: 0, ratingCount: 0,
      addedBy: req.user._id
    });
    res.status(201).json(book);
  } catch (err) { next(err); }
});

// PATCH /api/books/:id
router.patch('/:id', protect, authorize('admin', 'ctv'), (req, res, next) => {
  try {
    const book = db.collection('books').update(req.params.id, req.body);
    if (!book) return res.status(404).json({ error: 'Không tìm thấy sách' });
    res.json(book);
  } catch (err) { next(err); }
});

// DELETE /api/books/:id
router.delete('/:id', protect, authorize('admin'), (req, res, next) => {
  try {
    const ok = db.collection('books').delete(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Không tìm thấy sách' });
    res.json({ message: 'Đã xóa sách' });
  } catch (err) { next(err); }
});

// POST /api/books/:id/bookmark
router.post('/:id/bookmark', protect, (req, res, next) => {
  try {
    const users = db.collection('users');
    const user = users.findById(req.user._id);
    const bookId = req.params.id;
    const saved = user.savedBooks || [];
    const idx = saved.indexOf(bookId);

    if (idx > -1) saved.splice(idx, 1);
    else saved.push(bookId);

    users.update(user._id, { savedBooks: saved });
    res.json({ bookmarked: idx === -1, savedBooks: saved });
  } catch (err) { next(err); }
});

export default router;
