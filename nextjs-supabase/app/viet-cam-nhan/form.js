'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';
import { createClient } from '../../lib/supabase-browser';

export default function WriteReviewForm({ books, preselectedBook }) {
  const router = useRouter();
  const [form, setForm] = useState({
    book_id: preselectedBook || '',
    title: '',
    content: '',
    rating: 5
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (form.content.length < 100) {
      setError('Review phải dài ít nhất 100 ký tự');
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/dang-nhap');
      return;
    }

    const { error } = await supabase.from('reviews').insert({
      book_id: form.book_id,
      author_id: user.id,
      title: form.title,
      content: form.content,
      rating: form.rating,
      status: 'pending'
    });

    if (error) {
      setError(error.message);
      setSubmitting(false);
      return;
    }

    setSuccess('Đã gửi review! Chờ CLB duyệt trong 24h.');
    setTimeout(() => router.push('/cam-nhan'), 1500);
  };

  const charCount = form.content.length;

  return (
    <>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={submit}>
        <div className="form-group">
          <label className="form-label">Chọn sách</label>
          <select className="form-select" value={form.book_id}
            onChange={(e) => setForm({ ...form, book_id: e.target.value })} required>
            <option value="">-- Chọn sách bạn đã đọc --</option>
            {books.map(b => <option key={b.id} value={b.id}>{b.title} — {b.author}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Đánh giá</label>
          <div style={{ display: 'flex', gap: 4 }}>
            {[1,2,3,4,5].map(i => (
              <button key={i} type="button" onClick={() => setForm({ ...form, rating: i })} style={{ padding: 4 }}>
                <Star size={28} fill={i <= form.rating ? 'var(--amber)' : 'none'} color="var(--amber)" />
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Tiêu đề</label>
          <input className="form-input" placeholder="Tóm gọn cảm nhận trong 1 câu"
            value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            maxLength={200} required />
        </div>

        <div className="form-group">
          <label className="form-label">Nội dung (tối thiểu 100 ký tự)</label>
          <textarea className="form-textarea"
            placeholder="Điều gì khiến bạn ấn tượng nhất? Nhân vật nào bạn yêu thích? Bài học gì bạn rút ra?..."
            value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
            minLength={100} maxLength={5000} required />
          <div style={{ fontSize: 12, color: charCount < 100 ? '#c00' : 'var(--sage)', marginTop: 6, textAlign: 'right' }}>
            {charCount} / 5000 {charCount < 100 && `(cần thêm ${100 - charCount})`}
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
          {submitting ? 'Đang gửi…' : 'Gửi cảm nhận'}
        </button>
      </form>
    </>
  );
}
