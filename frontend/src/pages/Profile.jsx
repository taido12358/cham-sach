import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Flame, Award, BookOpen, Edit3, Trophy } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import BookCard from '../components/BookCard';

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('reviews');

  const viewingSelf = !id || id === currentUser?.id;
  const userId = id || currentUser?.id;

  useEffect(() => {
    if (!userId) return;
    api.get(`/users/${userId}`).then(res => {
      setProfileData(res.data.user);
      setReviews(res.data.reviews || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div className="container" style={{ padding: 80 }}>Đang tải…</div>;
  if (!profileData) return <div className="container" style={{ padding: 80 }}>Không tìm thấy user</div>;

  const initials = profileData.name?.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase();

  return (
    <div>
      {/* Hero */}
      <section style={{ padding: '64px 0', background: 'var(--forest)', color: 'var(--cream)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 32, alignItems: 'center' }}>
          <div className="serif" style={{
            width: 120, height: 120, borderRadius: 999,
            background: 'var(--amber)', color: 'var(--forest)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 40
          }}>{initials}</div>

          <div>
            <div className="eyebrow" style={{ color: 'var(--amber)' }}>
              {profileData.className && `Lớp ${profileData.className}`} · Cấp {profileData.stats?.level || 1}
            </div>
            <h1 className="serif" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, marginBottom: 12 }}>
              {profileData.name}
            </h1>
            {profileData.bio && <p style={{ opacity: 0.85, maxWidth: 500, lineHeight: 1.6 }}>{profileData.bio}</p>}

            <div style={{ display: 'flex', gap: 32, marginTop: 20, flexWrap: 'wrap' }}>
              <Stat icon={<Flame size={18} />} value={profileData.stats?.streak || 0} label="Ngày liên tiếp" />
              <Stat icon={<BookOpen size={18} />} value={profileData.stats?.booksRead || 0} label="Sách đã đọc" />
              <Stat icon={<Edit3 size={18} />} value={profileData.stats?.reviewsWritten || 0} label="Bài đã viết" />
              <Stat icon={<Trophy size={18} />} value={profileData.stats?.xp || 0} label="XP" />
            </div>
          </div>
        </div>
      </section>

      {/* Badges */}
      {profileData.badges?.length > 0 && (
        <section style={{ padding: '32px 0', background: 'var(--ivory)', borderBottom: '1px solid var(--border)' }}>
          <div className="container">
            <div className="eyebrow">Huy hiệu</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
              {profileData.badges.map((b, i) => (
                <div key={i} style={{
                  padding: '8px 16px', borderRadius: 999,
                  background: 'var(--cream)', border: '1px solid var(--amber)',
                  display: 'flex', alignItems: 'center', gap: 8, fontSize: 13
                }}>
                  <Award size={16} color="var(--amber)" />
                  <span className="serif" style={{ fontStyle: 'italic', fontWeight: 600, color: 'var(--forest)' }}>{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tabs */}
      <section className="container" style={{ padding: '48px 24px' }}>
        <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid var(--border)', marginBottom: 32 }}>
          {[
            { id: 'reviews', label: `Bài viết (${reviews.length})` },
            { id: 'saved', label: `Sách đã lưu (${profileData.savedBooks?.length || 0})` }
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                padding: '12px 0', fontSize: 15, fontWeight: 500,
                color: tab === t.id ? 'var(--forest)' : 'var(--sage)',
                borderBottom: tab === t.id ? '2px solid var(--forest)' : '2px solid transparent',
                marginBottom: -1
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'reviews' && (
          reviews.length === 0 ? (
            <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--sage)' }}>
              {viewingSelf ? 'Bạn chưa có bài viết nào được duyệt.' : 'Chưa có bài viết được duyệt.'}
              {viewingSelf && <div style={{ marginTop: 16 }}><Link to="/viet-cam-nhan" className="btn btn-primary">Viết review đầu tiên</Link></div>}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {reviews.map(r => (
                <Link key={r._id} to={`/cam-nhan#${r._id}`} className="card">
                  <div style={{ fontSize: 12, color: 'var(--sage)', marginBottom: 6 }}>
                    Đọc "{r.book?.title}" · {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                  <h3 className="serif" style={{ fontSize: 20, fontWeight: 700, color: 'var(--forest)', marginBottom: 8 }}>{r.title}</h3>
                  <p className="serif" style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--gray-text)' }}>
                    {r.content.slice(0, 200)}{r.content.length > 200 ? '…' : ''}
                  </p>
                </Link>
              ))}
            </div>
          )
        )}

        {tab === 'saved' && (
          profileData.savedBooks?.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
              {profileData.savedBooks.map(book => <BookCard key={book._id} book={book} />)}
            </div>
          ) : (
            <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--sage)' }}>
              Chưa lưu sách nào.
            </div>
          )
        )}
      </section>
    </div>
  );
}

function Stat({ icon, value, label }) {
  return (
    <div>
      <div className="serif" style={{ fontSize: 24, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: 'var(--amber)' }}>{icon}</span>{value}
      </div>
      <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.7 }}>{label}</div>
    </div>
  );
}
