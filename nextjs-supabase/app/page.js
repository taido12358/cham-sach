import Link from 'next/link';
import { ChevronRight, Quote } from 'lucide-react';
import { createClient } from '../lib/supabase-server';

export default async function Home() {
  const supabase = createClient();

  // Fetch song song - server component
  const [{ data: featuredBooks }, { data: recentBooks }, { data: reviews }] = await Promise.all([
    supabase.from('books').select('*').eq('featured', true).limit(3),
    supabase.from('books').select('*').order('created_at', { ascending: false }).limit(6),
    supabase.from('reviews').select('*, author:profiles(name, class_name), book:books(title)').eq('status', 'approved').order('created_at', { ascending: false }).limit(3)
  ]);

  // Dedupe books
  const bookIds = new Set();
  const books = [...(featuredBooks || []), ...(recentBooks || [])]
    .filter(b => { if (bookIds.has(b.id)) return false; bookIds.add(b.id); return true; })
    .slice(0, 6);

  return (
    <div className="paper-texture">
      {/* HERO */}
      <section className="container" style={{ padding: '80px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40, alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <div style={{ height: 1, width: 48, background: 'var(--forest)' }} />
            <span style={{ fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 500, color: 'var(--forest)' }}>
              Tháng 4 · Số 08
            </span>
          </div>
          <h1 className="serif" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 700, lineHeight: 0.95, color: 'var(--forest)', letterSpacing: '-0.02em', marginBottom: 28 }}>
            Mỗi trang sách,<br/>
            <span style={{ fontStyle: 'italic', color: 'var(--amber)' }}>một thế giới</span>
          </h1>
          <p style={{ fontSize: 18, marginBottom: 32, maxWidth: 520, lineHeight: 1.7, color: 'var(--gray-text)' }}>
            Nơi học sinh THCS Đại Phúc cùng đọc, cùng viết, cùng chia sẻ — và biến việc đọc sách thành thói quen mỗi ngày.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Link href="/thu-vien" className="btn btn-primary btn-lg">
              Khám phá thư viện <ChevronRight size={18} />
            </Link>
            <Link href="/viet-cam-nhan" className="btn btn-outline btn-lg">Viết cảm nhận</Link>
          </div>
        </div>
      </section>

      {/* BOOKS */}
      <section style={{ padding: '80px 0', background: 'var(--ivory)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div className="eyebrow">01 — Thư viện</div>
              <h2 className="h-section">Sách đang đọc</h2>
            </div>
            <Link href="/thu-vien" style={{ fontSize: 14, fontWeight: 500, color: 'var(--forest)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              Xem tất cả <ChevronRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
            {books.map(book => (
              <Link key={book.id} href={`/sach/${book.id}`} className="book-hover" style={{ display: 'block' }}>
                <div style={{
                  aspectRatio: '3/4', borderRadius: 2, padding: 28,
                  background: `linear-gradient(135deg, ${book.cover_color} 0%, ${book.cover_color}dd 100%)`,
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: 'white',
                  boxShadow: '0 0 0 1px rgba(31, 58, 45, 0.08), 0 20px 40px -20px rgba(31, 58, 45, 0.25)'
                }}>
                  <span style={{
                    fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
                    padding: '4px 12px', borderRadius: 999, alignSelf: 'flex-start',
                    background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)'
                  }}>{categoryLabel(book.category)}</span>
                  <div>
                    <div className="serif" style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.15, marginBottom: 6 }}>{book.title}</div>
                    <div style={{ fontSize: 13, opacity: 0.75, fontStyle: 'italic' }}>— {book.author}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      {reviews?.length > 0 && (
        <section className="container" style={{ padding: '80px 24px' }}>
          <div className="eyebrow">02 — Cảm nhận</div>
          <h2 className="h-section" style={{ marginBottom: 40 }}>Tiếng nói học sinh</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            {reviews.map(r => (
              <Link key={r.id} href="/cam-nhan" className="card">
                <div style={{ fontSize: 12, color: 'var(--sage)', marginBottom: 8 }}>
                  {r.author?.name}{r.author?.class_name && `, Lớp ${r.author.class_name}`} · "{r.book?.title}"
                </div>
                <h3 className="serif" style={{ fontSize: 20, fontWeight: 700, color: 'var(--forest)', marginBottom: 12 }}>{r.title}</h3>
                <p className="serif" style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink)' }}>
                  "{r.content.slice(0, 150)}{r.content.length > 150 ? '…' : ''}"
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* QUOTE */}
      <section style={{ padding: '96px 0', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <div className="eyebrow">Góc tri thức</div>
          <Quote size={48} color="var(--forest)" strokeWidth={1} style={{ margin: '0 auto 24px', opacity: 0.4 }} />
          <blockquote className="serif" style={{ fontStyle: 'italic', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 500, lineHeight: 1.25, color: 'var(--forest)' }}>
            Sách mở ra trước mắt tôi những <span style={{ color: 'var(--amber)' }}>chân trời mới</span>, và đánh thức trong tôi những khao khát lớn lao.
          </blockquote>
          <div style={{ marginTop: 20, fontSize: 14, color: 'var(--forest)', fontWeight: 500 }}>— Maxim Gorky</div>
        </div>
      </section>
    </div>
  );
}

function categoryLabel(c) {
  return { literature: 'Văn học', skills: 'Kỹ năng', history: 'Lịch sử', children: 'Thiếu nhi' }[c] || c;
}
