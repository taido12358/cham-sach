import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Heart, MessageCircle, Quote } from 'lucide-react';
import api from '../api/client';
import BookCard from '../components/BookCard';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/books?limit=3&featured=true'),
      api.get('/books?limit=3'),
      api.get('/reviews?limit=3')
    ]).then(([featured, all, rev]) => {
      // Gộp featured + sách thường, dedupe
      const ids = new Set();
      const combined = [...(featured.data.books || []), ...(all.data.books || [])]
        .filter(b => { if (ids.has(b._id)) return false; ids.add(b._id); return true; })
        .slice(0, 6);
      setBooks(combined);
      setReviews(rev.data.reviews || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="paper-texture">
      {/* HERO */}
      <section className="container" style={{ padding: '80px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40, alignItems: 'center' }}>
        <div className="fade-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <div style={{ height: 1, width: 48, background: 'var(--forest)' }} />
            <span style={{ fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 500, color: 'var(--heading)' }}>
              Tháng 4 · Số 08
            </span>
          </div>
          <h1 className="serif" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 700, lineHeight: 0.95, color: 'var(--heading)', letterSpacing: '-0.02em', marginBottom: 28 }}>
            Mỗi trang sách,<br/>
            <span style={{ fontStyle: 'italic', color: 'var(--amber)' }}>một thế giới</span>
          </h1>
          <p style={{ fontSize: 18, marginBottom: 32, maxWidth: 520, lineHeight: 1.7, color: 'var(--gray-text)' }}>
            Nơi học sinh THCS Đại Phúc cùng đọc, cùng viết, cùng chia sẻ — và biến việc đọc sách thành thói quen mỗi ngày.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Link to="/thu-vien" className="btn btn-primary btn-lg">
              Khám phá thư viện <ChevronRight size={18} />
            </Link>
            <Link to={user ? '/viet-cam-nhan' : '/dang-nhap'} className="btn btn-outline btn-lg">
              Viết cảm nhận
            </Link>
          </div>
        </div>

        <div className="hide-mobile" style={{ position: 'relative', height: 480 }}>
          {books[0] && <BookStack book={books[0]} top={40} right={0} rotate={6} color="var(--forest)" />}
          {books[1] && <BookStack book={books[1]} top={120} right={80} rotate={-3} color="var(--amber)" />}
          {books[2] && <BookStack book={books[2]} top={200} right={160} rotate={3} color="var(--ivory)" ink />}
        </div>
      </section>

      {/* FEATURED BOOKS */}
      <section style={{ padding: '80px 0', background: 'var(--ivory)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div className="eyebrow">01 — Thư viện</div>
              <h2 className="h-section">Sách đang đọc</h2>
            </div>
            <Link to="/thu-vien" style={{ fontSize: 14, fontWeight: 500, color: 'var(--heading)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              Xem tất cả <ChevronRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ aspectRatio: '3/4' }} />)}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
              {books.map(book => <BookCard key={book._id} book={book} />)}
            </div>
          )}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="container" style={{ padding: '80px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48, alignItems: 'flex-start' }}>
          <div>
            <div className="eyebrow">02 — Cảm nhận</div>
            <h2 className="h-section" style={{ marginBottom: 20 }}>Tiếng nói<br/><em>học sinh</em></h2>
            <p style={{ marginBottom: 24, lineHeight: 1.7, color: 'var(--gray-text)' }}>
              Mỗi tuần, CLB chọn ra những bài cảm nhận xuất sắc nhất để ghim lên trang chủ.
            </p>
            <Link to="/cam-nhan" className="btn btn-primary">Xem tất cả <ChevronRight size={16} /></Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {reviews.map((r, idx) => (
              <Link key={r._id} to={`/cam-nhan#${r._id}`} className="card">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
                  <div className="serif" style={{
                    width: 44, height: 44, borderRadius: 999,
                    background: 'var(--forest)', color: 'var(--on-brand)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 13, flexShrink: 0
                  }}>
                    {r.author?.name?.split(' ').map(w => w[0]).slice(-2).join('') || '?'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--heading)' }}>{r.author?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--sage)' }}>
                      {r.author?.className && `Lớp ${r.author.className} · `}Đọc "{r.book?.title}"
                    </div>
                  </div>
                  <span style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--sage)' }}>
                    #{String(idx+1).padStart(2, '0')}
                  </span>
                </div>
                <p className="serif" style={{ fontSize: 17, lineHeight: 1.7, marginBottom: 16, color: 'var(--ink)' }}>
                  "{r.content.slice(0, 180)}{r.content.length > 180 ? '…' : ''}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 13, color: 'var(--sage)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Heart size={14} /> {r.totalReactions || 0}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MessageCircle size={14} /> {r.comments?.length || 0}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section style={{ padding: '96px 0', background: 'var(--cream)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.3, backgroundImage: 'radial-gradient(circle, rgba(31,58,45,0.12) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="container" style={{ maxWidth: 800, textAlign: 'center', position: 'relative' }}>
          <div className="eyebrow">04 — Góc tri thức</div>
          <Quote size={48} color="var(--heading)" strokeWidth={1} style={{ margin: '0 auto 24px', opacity: 0.4 }} />
          <blockquote className="serif" style={{ fontStyle: 'italic', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 500, lineHeight: 1.25, marginBottom: 24, color: 'var(--heading)', letterSpacing: '-0.01em' }}>
            Sách mở ra trước mắt tôi những <span style={{ color: 'var(--amber)' }}>chân trời mới</span>, và đánh thức trong tôi những khao khát lớn lao.
          </blockquote>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontSize: 14 }}>
            <div style={{ height: 1, width: 48, background: 'var(--forest)' }} />
            <span style={{ color: 'var(--heading)', fontWeight: 500 }}>Maxim Gorky</span>
            <div style={{ height: 1, width: 48, background: 'var(--forest)' }} />
          </div>
        </div>
      </section>
    </div>
  );
}

function BookStack({ book, top, right, rotate, color, ink }) {
  return (
    <div className="book-hover" style={{
      position: 'absolute', top, right, width: 224, height: 300, borderRadius: 2,
      background: color === 'var(--ivory)' ? 'var(--ivory)' : `linear-gradient(135deg, ${book.coverColor || color} 0%, ${book.coverColor || color}dd 100%)`,
      border: color === 'var(--ivory)' ? '1px solid var(--border)' : 'none',
      boxShadow: 'var(--shadow-lift)',
      transform: `rotate(${rotate}deg)`,
      padding: 24,
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      color: ink ? 'var(--heading)' : 'white'
    }}>
      <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.6 }}>
        {book.featured ? 'Nổi bật' : 'Đang đọc'}
      </div>
      <div className="serif" style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.15 }}>
        {book.title}
      </div>
    </div>
  );
}
