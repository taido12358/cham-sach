import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Star, Users, ChevronLeft, Edit3 } from 'lucide-react';
import { createClient } from '../../../lib/supabase-server';
import BookmarkButton from './bookmark-button';
import CommentsSection from '../../cam-nhan/comments-section';

export default async function BookDetail({ params }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: book } = await supabase.from('books').select('*').eq('id', params.id).single();
  if (!book) notFound();

  // Tăng read count (fire-and-forget)
  supabase.from('books').update({ read_count: book.read_count + 1 }).eq('id', params.id).then();

  let bookmarked = false;
  if (user) {
    const { data: existingBookmark } = await supabase
      .from('bookmarks')
      .select('book_id')
      .eq('user_id', user.id)
      .eq('book_id', params.id)
      .maybeSingle();
    bookmarked = !!existingBookmark;
  }

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, author:profiles(name, class_name)')
    .eq('book_id', params.id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  const { data: relatedBooks } = await supabase
    .from('books')
    .select('*')
    .eq('category', book.category)
    .neq('id', params.id)
    .limit(4);

  const categoryLabels = { literature: 'Văn học', skills: 'Kỹ năng', history: 'Lịch sử', children: 'Thiếu nhi' };
  const categoryLabel = categoryLabels[book.category];

  return (
    <div>
      <div className="container" style={{ padding: '32px 24px 16px' }}>
        <Link href="/thu-vien" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--sage)' }}>
          <ChevronLeft size={16} /> Về thư viện
        </Link>
      </div>

      <section style={{ padding: '40px 0 80px', background: 'var(--ivory)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 1fr) 2fr', gap: 48, alignItems: 'flex-start' }}>
          <div style={{
            aspectRatio: '3/4', borderRadius: 2, padding: 32,
            background: `linear-gradient(135deg, ${book.cover_color} 0%, ${book.cover_color}cc 100%)`,
            color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            boxShadow: '0 20px 40px -20px rgba(0,0,0,0.3)'
          }}>
            <span style={{
              fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
              padding: '4px 12px', borderRadius: 999, alignSelf: 'flex-start',
              background: 'rgba(255,255,255,0.15)'
            }}>{categoryLabel}</span>
            <div>
              <div className="serif" style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>{book.title}</div>
              <div style={{ fontStyle: 'italic', opacity: 0.8 }}>— {book.author}</div>
            </div>
          </div>

          <div>
            <div className="eyebrow">{categoryLabel}</div>
            <h1 className="serif" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, color: 'var(--heading)', lineHeight: 1.05, marginBottom: 12 }}>
              {book.title}
            </h1>
            <div className="serif" style={{ fontSize: 20, fontStyle: 'italic', color: 'var(--sage)', marginBottom: 24 }}>
              — {book.author}
            </div>

            <div style={{ display: 'flex', gap: 24, marginBottom: 32, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Star size={18} fill="var(--amber)" color="var(--amber)" />
                <span style={{ fontWeight: 600 }}>{book.rating_avg?.toFixed(1) || '—'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--sage)' }}>
                <Users size={18} /> {book.read_count} người đã đọc
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href={`/viet-cam-nhan?book=${book.id}`} className="btn btn-primary btn-lg">
                <Edit3 size={18} /> Viết cảm nhận
              </Link>
              <BookmarkButton bookId={book.id} initialBookmarked={bookmarked} currentUserId={user?.id} />
            </div>

            <section style={{ marginTop: 40, marginBottom: 32 }}>
              <div className="eyebrow">Tóm tắt</div>
              <p className="serif" style={{ fontSize: 18, lineHeight: 1.8 }}>{book.summary}</p>
            </section>

            {book.excerpt && (
              <section style={{ padding: 24, background: 'var(--cream)', borderLeft: '3px solid var(--amber)' }}>
                <div className="eyebrow">Trích đoạn</div>
                <p className="serif" style={{ fontSize: 17, lineHeight: 1.8, fontStyle: 'italic' }}>"{book.excerpt}"</p>
              </section>
            )}
          </div>
        </div>
      </section>

      <section className="container" style={{ padding: '80px 24px' }}>
        <h2 className="h-section" style={{ marginBottom: 32 }}>Cảm nhận ({reviews?.length || 0})</h2>
        {reviews?.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--sage)' }}>
            Chưa có cảm nhận nào. Hãy là người đầu tiên!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {reviews.map(r => (
              <div key={r.id} className="card">
                <div style={{ fontSize: 13, color: 'var(--sage)', marginBottom: 8 }}>
                  {r.author?.name}{r.author?.class_name && `, Lớp ${r.author.class_name}`} · {new Date(r.created_at).toLocaleDateString('vi-VN')}
                </div>
                <h3 className="serif" style={{ fontSize: 20, fontWeight: 700, color: 'var(--heading)', marginBottom: 8 }}>{r.title}</h3>
                <p className="serif" style={{ fontSize: 16, lineHeight: 1.8 }}>{r.content}</p>
                <CommentsSection reviewId={r.id} currentUserId={user?.id} />
              </div>
            ))}
          </div>
        )}
      </section>

      {relatedBooks?.length > 0 && (
        <section className="container" style={{ padding: '0 24px 80px' }}>
          <div className="eyebrow">Có thể bạn thích</div>
          <h2 className="h-section" style={{ marginBottom: 32 }}>Sách cùng thể loại</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
            {relatedBooks.map(rb => (
              <Link key={rb.id} href={`/sach/${rb.id}`} className="book-hover" style={{ display: 'block' }}>
                <div style={{
                  aspectRatio: '3/4', borderRadius: 2, padding: 20,
                  background: `linear-gradient(135deg, ${rb.cover_color} 0%, ${rb.cover_color}dd 100%)`,
                  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', color: 'white',
                  boxShadow: '0 16px 32px -16px rgba(31, 58, 45, 0.25)'
                }}>
                  <div className="serif" style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.15, marginBottom: 4 }}>{rb.title}</div>
                  <div style={{ fontSize: 12, opacity: 0.75, fontStyle: 'italic' }}>— {rb.author}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
