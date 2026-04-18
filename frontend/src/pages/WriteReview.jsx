import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import api, { handleError } from '../api/client';

export default function WriteReview() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({
    book: bookId || '',
    title: '',
    content: '',
    rating: 5
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/books?limit=100').then(res => setBooks(res.data.books));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (form.content.length < 100) {
      setError('Review phải dài ít nhất 100 ký tự');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/reviews', form);
      setSuccess(res.data.message);
      setTimeout(() => navigate('/cam-nhan'), 800);
    } catch (err) {
      setError(handleError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const charCount = form.content.length;

  return (
    <div className="paper-texture" style={{ minHeight: '100vh' }}>
      <div className="container" style={{ padding: '64px 24px', maxWidth: 800 }}>
        <div className="eyebrow">Cảm nhận mới</div>
        <h1 className="h-section" style={{ marginBottom: 12 }}>Chia sẻ cảm nhận</h1>
        <p style={{ color: 'var(--gray-text)', marginBottom: 40, maxWidth: 600, lineHeight: 1.7 }}>
          Bài viết của bạn sẽ được CLB xem xét trong 24h trước khi đăng lên trang chủ. Khi được duyệt bạn sẽ nhận thêm <strong>100 XP</strong>.
        </p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Chọn sách</label>
            <select className="form-select" value={form.book} onChange={(e) => setForm({ ...form, book: e.target.value })} required>
              <option value="">-- Chọn sách bạn đã đọc --</option>
              {books.map(b => (
                <option key={b._id} value={b._id}>{b.title} — {b.author}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Đánh giá</label>
            <div style={{ display: 'flex', gap: 4 }}>
              {[1,2,3,4,5].map(i => (
                <button key={i} type="button" onClick={() => setForm({ ...form, rating: i })}
                  style={{ padding: 4 }}>
                  <Star size={28} fill={i <= form.rating ? 'var(--amber)' : 'none'} color="var(--amber)" />
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tiêu đề bài viết</label>
            <input className="form-input" placeholder="Tóm gọn cảm nhận của bạn trong 1 câu"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              maxLength={200} required />
          </div>

          <div className="form-group">
            <label className="form-label">Nội dung (tối thiểu 100 ký tự)</label>
            <textarea className="form-textarea"
              placeholder="Hãy chia sẻ: Điều gì khiến bạn ấn tượng nhất? Nhân vật nào bạn yêu thích? Bài học gì bạn rút ra?..."
              value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
              minLength={100} maxLength={5000} required />
            <div style={{ fontSize: 12, color: charCount < 100 ? '#c00' : 'var(--sage)', marginTop: 6, textAlign: 'right' }}>
              {charCount} / 5000 ký tự {charCount < 100 && `(cần thêm ${100 - charCount} ký tự)`}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
              {submitting ? 'Đang gửi…' : 'Gửi cảm nhận'}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
