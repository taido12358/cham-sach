import Link from 'next/link';
import { Flame, BookOpen, Edit3, Trophy, Award } from 'lucide-react';
import { createClient } from '../../lib/supabase-server';

export default async function Profile() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null; // middleware đã redirect

  const [{ data: profile }, { data: reviews }, { data: badges }, { data: bookmarks }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('reviews').select('*, book:books(title, cover_color)').eq('author_id', user.id).order('created_at', { ascending: false }),
    supabase.from('badges').select('*').eq('user_id', user.id),
    supabase.from('bookmarks').select('book:books(id, title, author, cover_color, category)').eq('user_id', user.id)
  ]);

  const initials = profile?.name?.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase() || '?';
  const approvedReviews = reviews?.filter(r => r.status === 'approved') || [];
  const pendingReviews = reviews?.filter(r => r.status === 'pending') || [];

  return (
    <div>
      <section style={{ padding: '64px 0', background: 'var(--forest)', color: 'var(--cream)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 32, alignItems: 'center' }}>
          <div className="serif" style={{
            width: 120, height: 120, borderRadius: 999, background: 'var(--amber)', color: 'var(--forest)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 40
          }}>{initials}</div>

          <div>
            <div className="eyebrow" style={{ color: 'var(--amber)' }}>
              {profile?.class_name && `Lớp ${profile.class_name} · `}Cấp {profile?.level || 1}
            </div>
            <h1 className="serif" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, marginBottom: 20 }}>
              {profile?.name}
            </h1>

            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
              <Stat icon={<Flame size={18} />} value={profile?.streak || 0} label="Ngày liên tiếp" />
              <Stat icon={<Edit3 size={18} />} value={approvedReviews.length} label="Bài đã duyệt" />
              <Stat icon={<BookOpen size={18} />} value={bookmarks?.length || 0} label="Sách đã lưu" />
              <Stat icon={<Trophy size={18} />} value={profile?.xp || 0} label="XP" />
            </div>
          </div>
        </div>
      </section>

      {badges?.length > 0 && (
        <section style={{ padding: '32px 0', background: 'var(--ivory)', borderBottom: '1px solid var(--border)' }}>
          <div className="container">
            <div className="eyebrow">Huy hiệu</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
              {badges.map(b => (
                <div key={b.id} style={{
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

      <section className="container" style={{ padding: '48px 24px' }}>
        <h2 className="h-section" style={{ marginBottom: 24 }}>Bài viết của tôi</h2>

        {pendingReviews.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 13, color: 'var(--amber)', fontWeight: 500, marginBottom: 12 }}>⏳ Đang chờ duyệt ({pendingReviews.length})</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {pendingReviews.map(r => (
                <div key={r.id} className="card" style={{ opacity: 0.7 }}>
                  <div style={{ fontSize: 12, color: 'var(--sage)', marginBottom: 4 }}>"{r.book?.title}"</div>
                  <div className="serif" style={{ fontSize: 18, fontWeight: 600, color: 'var(--forest)' }}>{r.title}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {approvedReviews.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--sage)' }}>
            Bạn chưa có bài viết nào được duyệt.
            <div style={{ marginTop: 16 }}>
              <Link href="/viet-cam-nhan" className="btn btn-primary">Viết review đầu tiên</Link>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {approvedReviews.map(r => (
              <div key={r.id} className="card">
                <div style={{ fontSize: 12, color: 'var(--sage)', marginBottom: 6 }}>
                  "{r.book?.title}" · {new Date(r.created_at).toLocaleDateString('vi-VN')}
                </div>
                <h3 className="serif" style={{ fontSize: 20, fontWeight: 700, color: 'var(--forest)', marginBottom: 8 }}>{r.title}</h3>
                <p className="serif" style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--gray-text)' }}>
                  {r.content.slice(0, 200)}{r.content.length > 200 ? '…' : ''}
                </p>
              </div>
            ))}
          </div>
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
