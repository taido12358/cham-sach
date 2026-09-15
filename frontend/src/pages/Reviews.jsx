import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Edit3 } from 'lucide-react';
import api, { handleError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const REACTIONS = [
  { type: 'inspired', emoji: '✨', label: 'Truyền cảm hứng' },
  { type: 'moved', emoji: '😭', label: 'Làm tôi khóc' },
  { type: 'thoughtful', emoji: '💭', label: 'Đáng suy ngẫm' },
  { type: 'fun', emoji: '😄', label: 'Hài hước' }
];

const PAGE_WINDOW = 7;

export default function Reviews() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // comments state, keyed by review id
  const [commentsOpen, setCommentsOpen] = useState({});
  const [commentsCache, setCommentsCache] = useState({});
  const [commentsLoading, setCommentsLoading] = useState({});
  const [draft, setDraft] = useState({});
  const [posting, setPosting] = useState({});

  useEffect(() => {
    setLoading(true);
    api.get(`/reviews?limit=10&sort=-createdAt&page=${page}`)
      .then(res => {
        setReviews(res.data.reviews);
        if (res.data.pagination) setPagination(res.data.pagination);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  const react = async (reviewId, type) => {
    if (!user) return;
    try {
      const res = await api.post(`/reviews/${reviewId}/react`, { type });
      setReviews(prev => prev.map(r =>
        r._id === reviewId ? { ...r, reactions: res.data.reactions, totalReactions: res.data.totalReactions } : r
      ));
    } catch (err) { console.error(err); }
  };

  const hasReacted = (review, type) =>
    review.reactions?.[type]?.some(id => id === user?.id || id?._id === user?.id);

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

  const pageNumbers = () => {
    const total = pagination.pages || 1;
    if (total <= PAGE_WINDOW) return Array.from({ length: total }, (_, i) => i + 1);
    const nums = new Set([1, total, page, page - 1, page + 1]);
    return [...nums].filter(n => n >= 1 && n <= total).sort((a, b) => a - b);
  };

  return (
    <div className="paper-texture" style={{ minHeight: '100vh' }}>
      <div className="container" style={{ padding: '64px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="eyebrow">Cảm nhận</div>
            <h1 className="h-section">Tiếng nói học sinh</h1>
          </div>
          {user && (
            <Link to="/viet-cam-nhan" className="btn btn-primary">
              <Edit3 size={16} /> Viết review mới
            </Link>
          )}
        </div>

        {loading ? (
          <div>Đang tải…</div>
        ) : reviews.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--sage)' }}>
            Chưa có cảm nhận nào. Hãy là người đầu tiên chia sẻ!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 800 }}>
            {reviews.map(r => {
              const isOpen = !!commentsOpen[r._id];
              const comments = commentsCache[r._id];
              const commentCount = comments ? comments.length : (r.comments?.length || 0);
              return (
                <article key={r._id} id={r._id} className="card">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                    <div className="serif" style={{
                      width: 48, height: 48, borderRadius: 999,
                      background: 'var(--forest)', color: 'var(--on-brand)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 14, flexShrink: 0
                    }}>
                      {r.author?.name?.split(' ').map(w => w[0]).slice(-2).join('') || '?'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: 'var(--heading)' }}>{r.author?.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--sage)' }}>
                        {r.author?.className && `Lớp ${r.author.className} · `}
                        Đọc <Link to={`/sach/${r.book?._id}`} style={{ textDecoration: 'underline' }}>"{r.book?.title}"</Link>
                      </div>
                    </div>
                  </div>

                  <h3 className="serif" style={{ fontSize: 22, fontWeight: 700, color: 'var(--heading)', marginBottom: 12 }}>{r.title}</h3>
                  <p className="serif" style={{ fontSize: 17, lineHeight: 1.8, color: 'var(--ink)', marginBottom: 20 }}>
                    {r.content}
                  </p>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                    {REACTIONS.map(r_ => {
                      const count = r.reactions?.[r_.type]?.length || 0;
                      const reacted = hasReacted(r, r_.type);
                      return (
                        <button key={r_.type} onClick={() => react(r._id, r_.type)}
                          title={r_.label}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '6px 12px', borderRadius: 999,
                            background: reacted ? 'rgba(200, 132, 28, 0.15)' : 'transparent',
                            border: `1px solid ${reacted ? 'var(--amber)' : 'var(--border)'}`,
                            fontSize: 13, color: 'var(--heading)'
                          }}>
                          <span style={{ fontSize: 16 }}>{r_.emoji}</span>
                          {count > 0 && <span>{count}</span>}
                        </button>
                      );
                    })}
                    <button onClick={() => toggleComments(r._id)}
                      style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--sage)' }}>
                      <MessageCircle size={14} /> {isOpen ? 'Ẩn bình luận' : `Xem bình luận (${commentCount})`}
                    </button>
                  </div>

                  {isOpen && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                      {commentsLoading[r._id] ? (
                        <div style={{ fontSize: 13, color: 'var(--sage)' }}>Đang tải bình luận…</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
                          {(comments || []).length === 0 ? (
                            <div style={{ fontSize: 13, color: 'var(--sage)' }}>Chưa có bình luận nào.</div>
                          ) : (
                            comments.map(c => (
                              <div key={c._id} style={{ display: 'flex', gap: 10 }}>
                                <div className="serif" style={{
                                  width: 32, height: 32, borderRadius: 999,
                                  background: 'var(--forest)', color: 'var(--on-brand)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontWeight: 700, fontSize: 11, flexShrink: 0
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
                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <textarea
                            className="form-textarea"
                            style={{ minHeight: 60, flex: 1 }}
                            placeholder="Viết bình luận…"
                            value={draft[r._id] || ''}
                            onChange={(e) => setDraft(prev => ({ ...prev, [r._id]: e.target.value }))}
                          />
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
                </article>
              );
            })}
          </div>
        )}

        {pagination.pages > 1 && (
          <nav className="pagination" aria-label="Điều hướng trang">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} aria-label="Trang trước">‹</button>
            {pageNumbers().map((n, i, arr) => (
              <span key={n} style={{ display: 'flex', alignItems: 'center' }}>
                {i > 0 && arr[i - 1] !== n - 1 && <span style={{ padding: '0 4px', color: 'var(--sage)' }}>…</span>}
                <button onClick={() => setPage(n)} aria-current={page === n ? 'page' : undefined}>{n}</button>
              </span>
            ))}
            <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page >= pagination.pages} aria-label="Trang sau">›</button>
          </nav>
        )}
      </div>
    </div>
  );
}
