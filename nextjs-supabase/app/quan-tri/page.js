import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Star } from 'lucide-react';
import { createClient } from '../../lib/supabase-server';
import ModerationActions from './moderation-actions';

export default async function ModerationPage({ searchParams }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/dang-nhap');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (!profile || !['admin', 'ctv'].includes(profile.role)) redirect('/');

  const tab = searchParams?.tab === 'rejected' ? 'rejected' : 'pending';

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, author:profiles(name, class_name), book:books(title)')
    .eq('status', tab)
    .order('created_at', { ascending: tab === 'pending' });

  return (
    <div className="paper-texture" style={{ minHeight: '100vh' }}>
      <div className="container" style={{ padding: '64px 24px' }}>
        <div className="eyebrow">Quản trị</div>
        <h1 className="h-section" style={{ marginBottom: 32 }}>Duyệt bài cảm nhận</h1>

        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          <Link href="/quan-tri?tab=pending" className={tab === 'pending' ? 'btn btn-primary' : 'btn btn-outline'}>
            Đang chờ duyệt
          </Link>
          <Link href="/quan-tri?tab=rejected" className={tab === 'rejected' ? 'btn btn-primary' : 'btn btn-outline'}>
            Đã từ chối
          </Link>
        </div>

        {!reviews || reviews.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--sage)' }}>
            {tab === 'pending' ? 'Không có bài nào đang chờ duyệt.' : 'Không có bài nào bị từ chối.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 800 }}>
            {reviews.map(r => (
              <article key={r.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 13, color: 'var(--sage)' }}>
                    {r.author?.name}{r.author?.class_name && `, Lớp ${r.author.class_name}`} · Đọc "{r.book?.title}"
                  </div>
                  <span className={`status-badge ${tab}`}>{tab === 'pending' ? 'Chờ duyệt' : 'Đã từ chối'}</span>
                </div>

                <h3 className="serif" style={{ fontSize: 20, fontWeight: 700, color: 'var(--heading)', marginBottom: 6 }}>{r.title}</h3>

                <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={14} fill={i <= r.rating ? 'var(--amber)' : 'none'} color="var(--amber)" />
                  ))}
                </div>

                <p className="serif" style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 12 }}>{r.content}</p>

                {r.moderation_note && (
                  <div style={{ fontSize: 13, color: '#c00', marginBottom: 12 }}>Lý do từ chối: {r.moderation_note}</div>
                )}

                {tab === 'pending' && <ModerationActions reviewId={r.id} />}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
