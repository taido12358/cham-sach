import Link from 'next/link';
import { Edit3 } from 'lucide-react';
import { createClient } from '../../lib/supabase-server';
import ReactionBar from './reaction-bar';
import CommentsSection from './comments-section';

const PAGE_SIZE = 10;

export default async function ReviewsPage({ searchParams }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const page = Math.max(1, parseInt(searchParams?.page, 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: reviews, count } = await supabase
    .from('reviews')
    .select(`
      *,
      author:profiles(id, name, class_name),
      book:books(id, title),
      reactions(type, user_id)
    `, { count: 'exact' })
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .range(from, to);

  const totalPages = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE));

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
                    background: 'var(--forest)', color: 'var(--on-brand)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 14, flexShrink: 0
                  }}>
                    {r.author?.name?.split(' ').map(w => w[0]).slice(-2).join('')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--heading)' }}>{r.author?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--sage)' }}>
                      {r.author?.class_name && `Lớp ${r.author.class_name} · `}
                      Đọc <Link href={`/sach/${r.book?.id}`} style={{ textDecoration: 'underline' }}>"{r.book?.title}"</Link>
                    </div>
                  </div>
                </div>

                <h3 className="serif" style={{ fontSize: 22, fontWeight: 700, color: 'var(--heading)', marginBottom: 12 }}>{r.title}</h3>
                <p className="serif" style={{ fontSize: 17, lineHeight: 1.8, marginBottom: 20 }}>{r.content}</p>

                <ReactionBar reviewId={r.id} reactions={r.reactions || []} currentUserId={user?.id} />
                <CommentsSection reviewId={r.id} currentUserId={user?.id} />
              </article>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav className="pagination" aria-label="Điều hướng trang" style={{ marginTop: 40 }}>
            {page === 1 ? (
              <span aria-disabled="true" aria-label="Trang trước">‹ Trước</span>
            ) : (
              <Link href={`/cam-nhan?page=${page - 1}`} aria-label="Trang trước">‹ Trước</Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              n === page ? (
                <span key={n} aria-current="page">{n}</span>
              ) : (
                <Link key={n} href={`/cam-nhan?page=${n}`}>{n}</Link>
              )
            ))}
            {page === totalPages ? (
              <span aria-disabled="true" aria-label="Trang sau">Sau ›</span>
            ) : (
              <Link href={`/cam-nhan?page=${page + 1}`} aria-label="Trang sau">Sau ›</Link>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
