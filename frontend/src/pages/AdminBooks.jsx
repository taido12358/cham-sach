import { useEffect, useState } from 'react';
import { Star, Users, Pencil, Trash2, Plus, X } from 'lucide-react';
import api, { handleError } from '../api/client';
import { useToast } from '../context/ToastContext';

const categories = [
  { id: 'literature', label: 'Văn học' },
  { id: 'skills', label: 'Kỹ năng' },
  { id: 'history', label: 'Lịch sử' },
  { id: 'children', label: 'Thiếu nhi' }
];

const categoryLabels = categories.reduce((acc, c) => ({ ...acc, [c.id]: c.label }), {});

const emptyForm = {
  title: '',
  author: '',
  category: 'literature',
  summary: '',
  excerpt: '',
  coverColor: '#1F3A2D',
  tags: '',
  legalLinks: [],
  featured: false
};

export default function AdminBooks() {
  const { toast } = useToast();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const loadBooks = () => {
    setLoading(true);
    api.get('/books?limit=100&sort=-createdAt')
      .then(res => setBooks(res.data.books || []))
      .catch(err => toast.error(handleError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(loadBooks, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => {
    setEditingBook(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (book) => {
    setEditingBook(book);
    setForm({
      title: book.title || '',
      author: book.author || '',
      category: book.category || 'literature',
      summary: book.summary || '',
      excerpt: book.excerpt || '',
      coverColor: book.coverColor || '#1F3A2D',
      tags: (book.tags || []).join(', '),
      legalLinks: (book.legalLinks || []).map(l => ({ name: l.name || '', url: l.url || '' })),
      featured: !!book.featured
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingBook(null);
    setForm(emptyForm);
  };

  const updateLegalLink = (idx, field, value) => {
    setForm(prev => ({
      ...prev,
      legalLinks: prev.legalLinks.map((l, i) => (i === idx ? { ...l, [field]: value } : l))
    }));
  };
  const addLegalLink = () => setForm(prev => ({ ...prev, legalLinks: [...prev.legalLinks, { name: '', url: '' }] }));
  const removeLegalLink = (idx) => setForm(prev => ({ ...prev, legalLinks: prev.legalLinks.filter((_, i) => i !== idx) }));

  const charCount = form.summary.length;

  const submit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.author.trim() || !form.category || !form.summary.trim()) {
      toast.error('Vui lòng điền đủ thông tin bắt buộc');
      return;
    }
    if (form.summary.trim().length < 200) {
      toast.error('Tóm tắt phải dài ít nhất 200 ký tự');
      return;
    }

    const payload = {
      title: form.title.trim(),
      author: form.author.trim(),
      category: form.category,
      summary: form.summary.trim(),
      excerpt: form.excerpt.trim(),
      coverColor: form.coverColor,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      legalLinks: form.legalLinks
        .filter(l => l.name.trim() || l.url.trim())
        .map(l => ({ name: l.name.trim(), url: l.url.trim() }))
    };
    if (editingBook) payload.featured = form.featured;

    setSubmitting(true);
    try {
      if (editingBook) {
        const res = await api.patch(`/books/${editingBook._id}`, payload);
        setBooks(prev => prev.map(b => (b._id === editingBook._id ? res.data : b)));
        toast.success('Đã cập nhật sách');
      } else {
        const res = await api.post('/books', payload);
        setBooks(prev => [res.data, ...prev]);
        toast.success('Đã thêm sách mới');
      }
      closeForm();
    } catch (err) {
      toast.error(handleError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const deleteBook = async (id) => {
    setBusyId(id);
    try {
      await api.delete(`/books/${id}`);
      setBooks(prev => prev.filter(b => b._id !== id));
      toast.success('Đã xóa sách');
    } catch (err) {
      toast.error(handleError(err));
    } finally {
      setBusyId(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div>
      {!showForm && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> Thêm sách mới
          </button>
        </div>
      )}

      {showForm && (
        <div className="card" style={{ marginBottom: 40 }}>
          <h2 className="serif" style={{ fontSize: 20, fontWeight: 700, color: 'var(--heading)', marginBottom: 24 }}>
            {editingBook ? 'Sửa thông tin sách' : 'Thêm sách mới'}
          </h2>
          <form onSubmit={submit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 4 }}>
              <div className="form-group">
                <label className="form-label">Tên sách</label>
                <input className="form-input" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Tác giả</label>
                <input className="form-input" value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 4 }}>
              <div className="form-group">
                <label className="form-label">Thể loại</label>
                <select className="form-select" value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Màu bìa sách</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input type="color" value={form.coverColor}
                    onChange={(e) => setForm({ ...form, coverColor: e.target.value })}
                    style={{ width: 48, height: 40, border: '1px solid var(--border)', borderRadius: 2, background: 'var(--ivory)', padding: 2, cursor: 'pointer' }} />
                  <div style={{
                    width: 48, height: 48, borderRadius: 2, flexShrink: 0,
                    background: `linear-gradient(135deg, ${form.coverColor} 0%, ${form.coverColor}dd 100%)`,
                    boxShadow: 'var(--shadow-card)'
                  }} />
                  <span style={{ fontSize: 13, color: 'var(--sage)' }}>{form.coverColor}</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Tóm tắt (tối thiểu 200 ký tự)</label>
              <textarea className="form-textarea" value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })} required />
              <div style={{ fontSize: 12, color: charCount < 200 ? '#c00' : 'var(--sage)', marginTop: 6, textAlign: 'right' }}>
                {charCount} ký tự {charCount < 200 && `(cần thêm ${200 - charCount} ký tự)`}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Trích đoạn (không bắt buộc)</label>
              <textarea className="form-textarea" style={{ minHeight: 100 }} value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
            </div>

            <div className="form-group">
              <label className="form-label">Tags (cách nhau bởi dấu phẩy)</label>
              <input className="form-input" placeholder="vd: phiêu lưu, gia đình, tuổi thơ"
                value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            </div>

            <div className="form-group">
              <label className="form-label">Liên kết tham khảo</label>
              {form.legalLinks.map((link, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <input className="form-input" placeholder="Tên liên kết" value={link.name}
                    onChange={(e) => updateLegalLink(idx, 'name', e.target.value)} style={{ flex: 1 }} />
                  <input className="form-input" placeholder="https://…" value={link.url}
                    onChange={(e) => updateLegalLink(idx, 'url', e.target.value)} style={{ flex: 2 }} />
                  <button type="button" className="btn btn-outline" onClick={() => removeLegalLink(idx)}
                    style={{ borderColor: '#c00', color: '#c00', padding: '0 14px' }} aria-label="Xóa liên kết">
                    <X size={16} />
                  </button>
                </div>
              ))}
              <button type="button" className="btn btn-outline" onClick={addLegalLink} style={{ fontSize: 13 }}>
                <Plus size={14} /> Thêm liên kết
              </button>
            </div>

            {editingBook && (
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" id="featured" checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  style={{ width: 18, height: 18, cursor: 'pointer' }} />
                <label htmlFor="featured" style={{ fontSize: 14, color: 'var(--ink)', cursor: 'pointer' }}>
                  Đánh dấu là sách nổi bật
                </label>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
                {submitting ? 'Đang lưu…' : editingBook ? 'Lưu thay đổi' : 'Thêm sách'}
              </button>
              <button type="button" className="btn btn-outline" onClick={closeForm}>Hủy</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 88 }} />)}
        </div>
      ) : books.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--sage)' }}>
          Chưa có sách nào trong thư viện.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {books.map(book => (
            <div key={book._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{
                width: 56, height: 56, borderRadius: 2, flexShrink: 0,
                background: `linear-gradient(135deg, ${book.coverColor || '#1F3A2D'} 0%, ${book.coverColor || '#1F3A2D'}dd 100%)`,
                boxShadow: 'var(--shadow-card)'
              }} />

              <div style={{ flex: '1 1 240px', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                  <h3 className="serif" style={{ fontSize: 17, fontWeight: 700, color: 'var(--heading)' }}>{book.title}</h3>
                  {book.featured && <span className="status-badge approved">Nổi bật</span>}
                </div>
                <div style={{ fontSize: 13, color: 'var(--sage)', fontStyle: 'italic', marginBottom: 8 }}>— {book.author}</div>
                <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--sage)', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{
                    fontSize: 11, padding: '3px 10px', borderRadius: 999, border: '1px solid var(--border)',
                    color: 'var(--heading)', textTransform: 'uppercase', letterSpacing: '0.05em'
                  }}>
                    {categoryLabels[book.category] || book.category}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Star size={12} fill="var(--amber)" color="var(--amber)" /> {book.ratingAvg?.toFixed(1) || '—'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Users size={12} /> {book.readCount || 0} lượt đọc
                  </span>
                </div>
              </div>

              {confirmDeleteId === book._id ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--sage)' }}>Bạn chắc chắn?</span>
                  <button className="btn btn-outline" disabled={busyId === book._id}
                    onClick={() => deleteBook(book._id)}
                    style={{ borderColor: '#c00', color: '#c00' }}>
                    Xóa
                  </button>
                  <button className="btn btn-outline" onClick={() => setConfirmDeleteId(null)}>Hủy</button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-outline" onClick={() => openEdit(book)}>
                    <Pencil size={14} /> Sửa
                  </button>
                  <button className="btn btn-outline" onClick={() => setConfirmDeleteId(book._id)}
                    style={{ borderColor: '#c00', color: '#c00' }}>
                    <Trash2 size={14} /> Xóa
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
