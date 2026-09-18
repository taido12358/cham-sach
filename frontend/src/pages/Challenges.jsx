import { useEffect, useState } from 'react';
import { Flame, Trophy } from 'lucide-react';
import api, { handleError } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Challenges() {
  const { user, refresh } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const streak = user?.stats?.streak || 0;

  useEffect(() => {
    api.get('/users/leaderboard?limit=10')
      .then(res => setLeaderboard(res.data))
      .catch(console.error);
  }, []);

  const checkin = async () => {
    setMessage(''); setError('');
    try {
      const res = await api.post('/users/me/checkin');
      setMessage(res.data.message);
      if (res.data.newBadges?.length) {
        setMessage(`${res.data.message} 🏅 Nhận huy hiệu: ${res.data.newBadges.map(b => b.name).join(', ')}`);
      }
      await refresh();
    } catch (err) {
      setError(handleError(err));
    }
  };

  return (
    <div>
      {/* Challenge */}
      <section style={{ padding: '80px 0', background: 'var(--forest)', color: 'var(--on-brand)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48 }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--amber)' }}>Thử thách</div>
            <h1 className="serif" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, marginBottom: 24 }}>
              7 ngày<br/>đọc sách
            </h1>
            <p style={{ opacity: 0.85, lineHeight: 1.7, marginBottom: 32, maxWidth: 440 }}>
              Đọc ít nhất 20 phút mỗi ngày trong 7 ngày liên tiếp. Check-in hàng ngày để duy trì streak và nhận huy hiệu <em className="serif" style={{ color: 'var(--amber)' }}>"Bạn đồng hành"</em>.
            </p>

            {user ? (
              <div>
                {message && <div className="alert alert-success" style={{ marginBottom: 20 }}>{message}</div>}
                {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 12 }}>
                    <span>Streak hiện tại</span>
                    <span style={{ color: 'var(--amber)', fontWeight: 600 }}>{streak} ngày 🔥</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[1,2,3,4,5,6,7].map(d => (
                      <div key={d} style={{
                        flex: 1, height: 40, borderRadius: 2,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700,
                        background: d <= streak ? 'var(--amber)' : 'rgba(255,255,255,0.08)',
                        color: d <= streak ? 'var(--forest)' : 'rgba(255,255,255,0.4)',
                        border: `1px solid ${d <= streak ? 'var(--amber)' : 'rgba(255,255,255,0.15)'}`
                      }}>
                        {d <= streak ? '✓' : `D${d}`}
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={checkin} className="btn btn-amber btn-lg">
                  <Flame size={18} /> Check-in hôm nay
                </button>
              </div>
            ) : (
              <div style={{ padding: 24, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                Đăng nhập để tham gia thử thách và tích lũy XP.
              </div>
            )}
          </div>

          {/* Leaderboard */}
          <div style={{ padding: 24, background: 'rgba(255,255,255,0.05)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h3 className="serif" style={{ fontSize: 24, fontWeight: 700 }}>Bảng xếp hạng</h3>
              <Trophy size={24} color="var(--amber)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {leaderboard.map((u, i) => {
                const isMe = u._id === user?.id;
                const medals = ['🥇', '🥈', '🥉'];
                return (
                  <div key={u._id} style={{
                    padding: 12, borderRadius: 2,
                    display: 'flex', alignItems: 'center', gap: 16,
                    background: isMe ? 'rgba(200, 132, 28, 0.15)' : 'transparent',
                    border: isMe ? '1px solid rgba(200, 132, 28, 0.3)' : '1px solid transparent'
                  }}>
                    <div style={{ width: 32, textAlign: 'center', fontSize: 18 }}>
                      {medals[i] || <span style={{ fontSize: 13, opacity: 0.5 }}>#{i+1}</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500 }}>{u.name} {isMe && <span style={{ fontSize: 11, opacity: 0.6 }}>(bạn)</span>}</div>
                      <div style={{ fontSize: 11, opacity: 0.7 }}>
                        {u.className && `Lớp ${u.className} · `}Cấp {u.stats?.level || 1}
                      </div>
                    </div>
                    <div className="serif" style={{ fontWeight: 700, color: 'var(--amber)' }}>{u.stats?.xp || 0} XP</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
