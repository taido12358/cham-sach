import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Edit3 } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const REACTIONS = [
  { type: 'inspired', emoji: '✨', label: 'Truyền cảm hứng' },
  { type: 'moved', emoji: '😭', label: 'Làm tôi khóc' },
  { type: 'thoughtful', emoji: '💭', label: 'Đáng suy ngẫm' },
  { type: 'fun', emoji: '😄', label: 'Hài hước' }
];

export default function Reviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reviews?limit=20&sort=-createdAt')
      .then(res => setReviews(res.data.reviews))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
            {reviews.map(r => (
              <article key={r._id} id={r._id} className="card">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                  <div className="serif" style={{
                    width: 48, height: 48, borderRadius: 999,
                    background: 'var(--forest)', color: 'var(--cream)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 14, flexShrink: 0
                  }}>
                    {r.author?.name?.split(' ').map(w => w[0]).slice(-2).join('') || '?'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--forest)' }}>{r.author?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--sage)' }}>
                      {r.author?.className && `Lớp ${r.author.className} · `}
                      Đọc <Link to={`/sach/${r.book?._id}`} style={{ textDecoration: 'underline' }}>"{r.book?.title}"</Link>
                    </div>
                  </div>
                </div>

                <h3 className="serif" style={{ fontSize: 22, fontWeight: 700, color: 'var(--forest)', marginBottom: 12 }}>{r.title}</h3>
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
                          fontSize: 13, color: 'var(--forest)'
                        }}>
                        <span style={{ fontSize: 16 }}>{r_.emoji}</span>
                        {count > 0 && <span>{count}</span>}
                      </button>
                    );
                  })}
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--sage)' }}>
                    <MessageCircle size={14} /> {r.comments?.length || 0}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
