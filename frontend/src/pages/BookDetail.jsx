import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Users, Bookmark, ChevronLeft, Edit3, ExternalLink, MessageCircle } from 'lucide-react';
import api, { handleError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BookCard from '../components/BookCard';

const categoryLabels = {
  literature: 'Văn học',
  skills: 'Kỹ năng',
  history: 'Lịch sử',
  children: 'Thiếu nhi'
};

export default function BookDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [related, setRelated] = useState([]);

  const [commentsOpen, setCommentsOpen] = useState({});
  const [commentsCache, setCommentsCache] = useState({});
  const [commentsLoading, setCommentsLoading] = useState({});
  const [draft, setDraft] = useState({});
  const [posting, setPosting] = useState({});

  useEffect(() => {
    setLoading(true);
    setRelated([]);
    Promise.all([
      api.get(`/books/${id}`),
      api.get(`/reviews?book=${id}&limit=10`)
    ]).then(([bookRes, reviewsRes]) => {
      setBook(bookRes.data.book);
      setBookmarked(bookRes.data.isBookmarked);
      setReviews(reviewsRes.data.reviews);

      const category = bookRes.data.book?.category;
      if (category) {
        api.get(`/books?category=${category}&limit=5`)
          .then(res => setRelated((res.data.books || []).filter(b => b._id !== id).slice(0, 4)))
          .catch(() => setRelated([]));
      }
    }).catch(err => setError(handleError(err))).finally(() => setLoading(false));
  }, [id]);

  const toggleBookmark = async () => {
    if (!user) return;
    try {
      const res = await api.post(`/books/${id}/bookmark`);
      setBookmarked(res.data.bookmarked);
      toast.success(res.data.bookmarked ? 'Đã lưu sách' : 'Đã bỏ lưu sách');
    } catch (err) {
      toast.error(handleError(err));
    }
  };

  const toggleComments = async (reviewId) => {
    const willOpen = !commentsOpen[reviewId];
    setCommentsOpen(prev => ({ ...prev, [reviewId]: willOpen }));
    if (willOpen && !commentsCache[reviewId]) {
      setCommentsLoading(prev => ({ ...prev, [reviewId]: true }));
      try {
        const res = await api.get(`/reviews/${reviewId}`);
        setCommentsCache(prev => ({ ...prev, [reviewId]: res.data.comments || [] }));
      } catch (err) {
        toast.error(handleError(err));
      } finally {
        setCommentsLoading(prev => ({ ...prev, [reviewId]: false }));
      }
    }
  };

  const postComment = async (reviewId) => {
    const content = (draft[reviewId] || '').trim();
    if (!content) return;
    setPosting(prev => ({ ...prev, [reviewId]: true }));
    try {
      const res = await api.post(`/reviews/${reviewId}/comments`, { content });
      setCommentsCache(prev => ({ ...prev, [reviewId]: [...(prev[reviewId] || []), res.data] }));
      setReviews(prev => prev.map(r =>
        r._id === reviewId ? { ...r, comments: [...(r.comments || []), res.data] } : r
      ));
      setDraft(prev => ({ ...prev, [reviewId]: '' }));
      toast.success('Đã đăng bình luận');
    } catch (err) {
      toast.error(handleError(err));
    } finally {
      setPosting(prev => ({ ...prev, [reviewId]: false }));
    }
  };

  if (loading) return <div className="container" style={{ padding: 80, textAlign: 'center' }}>Đang tải…</div>;
  if (error) return <div className="container" style={{ padding: 80, textAlign: 'center', color: '#c00' }}>{error}</div>;
  if (!book) return null;

  return (
    <div>
      <div className="container" style={{ padding: '32px 24px 16px' }}>
        <Link to="/thu-vien" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--sage)' }}>
          <ChevronLeft size={16} /> Về thư viện
        </Link>
      </div>

      {/* Hero */}
      <section style={{ padding: '40px 0 80px', background: 'var(--ivory)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 1fr) 2fr', gap: 48, alignItems: 'flex-start' }}>
          {/* Cover */}
          <div style={{
            aspectRatio: '3/4', borderRadius: 2, padding: 32,
            background: `linear-gradient(135deg, ${book.coverColor} 0%, ${book.coverColor}cc 100%)`,
            color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            boxShadow: 'var(--shadow-card)', position: 'sticky', top: 100
          }}>
            <span style={{
              fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
              padding: '4px 12px', borderRadius: 999, alignSelf: 'flex-start',
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)'
            }}>
              {categoryLabels[book.category]}
            </span>
            <div>
              <div className="serif" style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>{book.title}</div>
              <div style={{ fontStyle: 'italic', opacity: 0.8 }}>— {book.author}</div>
            </div>
          </div>

          {/* Info */}
          <div>
            <div className="eyebrow">{categoryLabels[book.category]}</div>
            <h1 className="serif" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, color: 'var(--heading)', lineHeight: 1.05, marginBottom: 12, letterSpacing: '-0.02em' }}>
              {book.title}
            </h1>
            <div className="serif" style={{ fontSize: 20, fontStyle: 'italic', color: 'var(--sage)', marginBottom: 24 }}>
              — {book.author}
            </div>

            <div style={{ display: 'flex', gap: 24, marginBottom: 32, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Star size={18} fill="var(--amber)" color="var(--amber)" />
                <span style={{ fontWeight: 600 }}>{book.ratingAvg?.toFixed(1) || '—'}</span>
                <span style={{ color: 'var(--sage)' }}>({book.ratingCount || 0})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--sage)' }}>
                <Users size={18} /> {book.readCount || 0} người đã đọc
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 40, flexWrap: 'wrap' }}>
              <Link to={user ? `/viet-cam-nhan/${book._id}` : '/dang-nhap'} className="btn btn-primary btn-lg">
                <Edit3 size={18} /> Viết cảm nhận
              </Link>
              {user && (
                <button onClick={toggleBookmark} className="btn btn-outline btn-lg" aria-label={bookmarked ? 'Bỏ lưu sách' : 'Lưu sách'}>
                  <Bookmark size={18} fill={bookmarked ? 'var(--heading)' : 'none'} />
                  {bookmarked ? 'Đã lưu' : 'Lưu sách'}
                </button>
              )}
            </div>

            {/* Summary */}
            <section style={{ marginBottom: 40 }}>
              <div className="eyebrow">Tóm tắt</div>
              <p className="serif" style={{ fontSize: 18, lineHeight: 1.8, color: 'var(--ink)' }}>
                {book.summary}
              </p>
            </section>

            {/* Excerpt */}
            {book.excerpt && (
              <section style={{ marginBottom: 40, padding: 24, background: 'var(--cream)', borderLeft: '3px solid var(--amber)' }}>
                <div className="eyebrow">Trích đoạn</div>
                <p className="serif" style={{ fontSize: 17, lineHeight: 1.8, fontStyle: 'italic', color: 'var(--ink)' }}>
                  "{book.excerpt}"
                </p>
              </section>
            )}

            {/* Legal links */}
            {book.legalLinks?.length > 0 && (
              <section style={{ marginBottom: 40 }}>
                <div className="eyebrow">Đọc sách tại</div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {book.legalLinks.map((link, i) => (
                    <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                      <ExternalLink size={16} /> {link.name}
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Tags */}
            {book.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {book.tags.map(tag => (
                  <span key={tag} style={{
                    padding: '4px 12px', borderRadius: 999, fontSize: 12,
                    background: 'var(--cream)', color: 'var(--heading)', border: '1px solid var(--border)'
                  }}>#{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="container" style={{ padding: '80px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}>
          <h2 className="h-section">Cảm nhận ({reviews.length})</h2>
          <Link to={user ? `/viet-cam-nhan/${book._id}` : '/dang-nhap'} className="btn btn-primary">
            <Edit3 size={16} /> Viết review
          </Link>
        </div>

        {reviews.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--sage)' }}>
            Chưa có cảm nhận nào cho sách này. Hãy là người đầu tiên!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {reviews.map(r => {
              const isOpen = !!commentsOpen[r._id];
              const comments = commentsCache[r._id];
              const commentCount = comments ? comments.length : (r.comments?.length || 0);
              return (
                <div key={r._id} className="card">
                  <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
                    <div className="serif" style={{
                      width: 44, height: 44, borderRadius: 999,
                      background: 'var(--forest)', color: 'var(--on-brand)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 13
                    }}>
                      {r.author?.name?.split(' ').slice(-1)[0][0] || '?'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: 'var(--heading)' }}>{r.author?.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--sage)' }}>
                        {r.author?.className && `Lớp ${r.author.className} · `}
                        {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} size={14} fill={i <= r.rating ? 'var(--amber)' : 'none'} color="var(--amber)" />
                      ))}
                    </div>
                  </div>
                  <h3 className="serif" style={{ fontSize: 20, fontWeight: 700, color: 'var(--heading)', marginBottom: 8 }}>{r.title}</h3>
                  <p className="serif" style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--ink)', marginBottom: 16 }}>{r.content}</p>

                  <button onClick={() => toggleComments(r._id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--sage)', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                    <MessageCircle size={14} /> {isOpen ? 'Ẩn bình luận' : `Xem bình luận (${commentCount})`}
                  </button>

                  {isOpen && (
                    <div style={{ marginTop: 14 }}>
                      {commentsLoading[r._id] ? (
                        <div style={{ fontSize: 13, color: 'var(--sage)' }}>Đang tải bình luận…</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 14 }}>
                          {(comments || []).length === 0 ? (
                            <div style={{ fontSize: 13, color: 'var(--sage)' }}>Chưa có bình luận nào.</div>
                          ) : (
                            comments.map(c => (
                              <div key={c._id} style={{ display: 'flex', gap: 10 }}>
                                <div className="serif" style={{
                                  width: 28, height: 28, borderRadius: 999,
                                  background: 'var(--forest)', color: 'var(--on-brand)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontWeight: 700, fontSize: 10, flexShrink: 0
                                }}>
                                  {c.author?.name?.split(' ').slice(-1)[0]?.[0] || '?'}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--heading)' }}>{c.author?.name}</span>
                                    <span style={{ fontSize: 11, color: 'var(--sage)' }}>{new Date(c.createdAt).toLocaleDateString('vi-VN')}</span>
                                  </div>
                                  <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink)' }}>{c.content}</div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                      {user ? (
                        <div style={{ display: 'flex', gap: 10 }}>
                          <textarea className="form-textarea" style={{ minHeight: 52, flex: 1 }}
                            placeholder="Viết bình luận…"
                            value={draft[r._id] || ''}
                            onChange={(e) => setDraft(prev => ({ ...prev, [r._id]: e.target.value }))} />
                          <button className="btn btn-primary" disabled={posting[r._id] || !(draft[r._id] || '').trim()}
                            onClick={() => postComment(r._id)}>
                            {posting[r._id] ? '…' : 'Gửi'}
                          </button>
                        </div>
                      ) : (
                        <div style={{ fontSize: 13, color: 'var(--sage)' }}>
                          <Link to="/dang-nhap" style={{ textDecoration: 'underline' }}>Đăng nhập</Link> để bình luận.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Related books */}
      {related.length > 0 && (
        <section className="container" style={{ padding: '0 24px 80px' }}>
          <div className="eyebrow">Có thể bạn thích</div>
          <h2 className="h-section" style={{ marginBottom: 32 }}>Sách cùng thể loại</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24 }}>
            {related.map(b => <BookCard key={b._id} book={b} />)}
          </div>
        </section>
      )}
    </div>
  );
}
