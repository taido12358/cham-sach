import Link from 'next/link';
import { Edit3 } from 'lucide-react';
import { createClient } from '../../lib/supabase-server';
import ReactionBar from './reaction-bar';

export default async function ReviewsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      *,
      author:profiles(id, name, class_name),
      book:books(id, title),
      reactions(type, user_id)
    `)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(30);

  return (
    <div className="paper-texture" style={{ minHeight: '100vh' }}>
      <div className="container" style={{ padding: '64px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="eyebrow">Cảm nhận</div>
            <h1 className="h-section">Tiếng nói học sinh</h1>
          </div>
          {user && (
            <Link href="/viet-cam-nhan" className="btn btn-primary">
              <Edit3 size={16} /> Viết review mới
            </Link>
          )}
        </div>

        {!reviews || reviews.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--sage)' }}>
            Chưa có cảm nhận nào.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 800 }}>
            {reviews.map(r => (
              <article key={r.id} className="card">
                <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
                  <div className="serif" style={{
                    width: 48, height: 48, borderRadius: 999,
                    background: 'var(--forest)', color: 'var(--cream)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 14, flexShrink: 0
                  }}>
                    {r.author?.name?.split(' ').map(w => w[0]).slice(-2).join('')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--forest)' }}>{r.author?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--sage)' }}>
                      {r.author?.class_name && `Lớp ${r.author.class_name} · `}
                      Đọc <Link href={`/sach/${r.book?.id}`} style={{ textDecoration: 'underline' }}>"{r.book?.title}"</Link>
                    </div>
                  </div>
                </div>

                <h3 className="serif" style={{ fontSize: 22, fontWeight: 700, color: 'var(--forest)', marginBottom: 12 }}>{r.title}</h3>
                <p className="serif" style={{ fontSize: 17, lineHeight: 1.8, marginBottom: 20 }}>{r.content}</p>

                <ReactionBar reviewId={r.id} reactions={r.reactions || []} currentUserId={user?.id} />
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
