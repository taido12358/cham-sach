import { useEffect, useState } from 'react';
import { Star, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import api, { handleError } from '../api/client';
import { useToast } from '../context/ToastContext';

const TABS = [
  { id: 'pending', label: 'Chờ duyệt' },
  { id: 'rejected', label: 'Đã từ chối' }
];

export default function Admin() {
  const { toast } = useToast();
  const [tab, setTab] = useState('pending');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [rejectingId, setRejectingId] = useState(null);
  const [note, setNote] = useState('');
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    setLoading(true);
    setRejectingId(null);
    api.get(`/reviews?status=${tab}&limit=50`)
      .then(res => setReviews(res.data.reviews || []))
      .catch(err => toast.error(handleError(err)))
      .finally(() => setLoading(false));
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const moderate = async (id, status, moderationNote) => {
    setBusyId(id);
    try {
      await api.patch(`/reviews/${id}/moderate`, { status, note: moderationNote });
      setReviews(prev => prev.filter(r => r._id !== id));
      setRejectingId(null);
      setNote('');
      toast.success(status === 'approved' ? 'Đã duyệt bài viết' : 'Đã từ chối bài viết');
    } catch (err) {
      toast.error(handleError(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="paper-texture" style={{ minHeight: '100vh' }}>
      <div className="container" style={{ padding: '64px 24px' }}>
        <div className="eyebrow">Quản trị</div>
        <h1 className="h-section" style={{ marginBottom: 32 }}>Duyệt cảm nhận</h1>

        <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid var(--border)', marginBottom: 32 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                padding: '12px 0', fontSize: 15, fontWeight: 500,
                color: tab === t.id ? 'var(--heading)' : 'var(--sage)',
                borderBottom: tab === t.id ? '2px solid var(--heading)' : '2px solid transparent',
                marginBottom: -1
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 140 }} />)}
          </div>
        ) : reviews.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--sage)' }}>
            {tab === 'pending' ? 'Không có bài viết nào đang chờ duyệt.' : 'Không có bài viết nào bị từ chối.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {reviews.map(r => {
              const isExpanded = !!expanded[r._id];
              const content = isExpanded || r.content.length <= 280 ? r.content : `${r.content.slice(0, 280)}…`;
              return (
                <div key={r._id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 10, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--sage)', marginBottom: 4 }}>
                        Sách: <strong style={{ color: 'var(--heading)' }}>{r.book?.title || '—'}</strong>
                      </div>
                      <h3 className="serif" style={{ fontSize: 19, fontWeight: 700, color: 'var(--heading)' }}>{r.title}</h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} size={14} fill={i <= r.rating ? 'var(--amber)' : 'none'} color="var(--amber)" />
                      ))}
                    </div>
                  </div>

                  <div style={{ fontSize: 13, color: 'var(--sage)', marginBottom: 12 }}>
                    {r.author?.name}{r.author?.className && ` · Lớp ${r.author.className}`} · {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                  </div>

                  <p className="serif" style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--ink)', marginBottom: 8 }}>
                    {content}
                  </p>
                  {r.content.length > 280 && (
                    <button onClick={() => toggleExpand(r._id)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--forest-light)', marginBottom: 16 }}>
                      {isExpanded ? <>Thu gọn <ChevronUp size={14} /></> : <>Xem đầy đủ <ChevronDown size={14} /></>}
                    </button>
                  )}

                  {r.moderationNote && tab === 'rejected' && (
                    <div className="alert alert-info" style={{ marginBottom: 16 }}>Ghi chú: {r.moderationNote}</div>
                  )}

                  {rejectingId === r._id ? (
                    <div style={{ marginTop: 8 }}>
                      <textarea className="form-textarea" style={{ minHeight: 80, marginBottom: 10 }}
                        placeholder="Lý do từ chối (không bắt buộc)…" value={note} onChange={(e) => setNote(e.target.value)} />
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button className="btn btn-outline" disabled={busyId === r._id}
                          onClick={() => moderate(r._id, 'rejected', note)}
                          style={{ borderColor: '#c00', color: '#c00' }}>
                          Xác nhận từ chối
                        </button>
                        <button className="btn btn-outline" onClick={() => { setRejectingId(null); setNote(''); }}>Hủy</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 10, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                      {tab === 'pending' && (
                        <>
                          <button className="btn btn-primary" disabled={busyId === r._id}
                            onClick={() => moderate(r._id, 'approved')}>
                            <Check size={16} /> Duyệt
                          </button>
                          <button className="btn btn-outline" disabled={busyId === r._id}
                            style={{ borderColor: '#c00', color: '#c00' }}
                            onClick={() => { setRejectingId(r._id); setNote(''); }}>
                            <X size={16} /> Từ chối
                          </button>
                        </>
                      )}
                      {tab === 'rejected' && (
                        <button className="btn btn-primary" disabled={busyId === r._id}
                          onClick={() => moderate(r._id, 'approved')}>
                          <Check size={16} /> Duyệt lại
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
