'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { createClient } from '../../lib/supabase-browser';

const categories = [
  { id: 'all', label: 'Tất cả' },
  { id: 'literature', label: 'Văn học' },
  { id: 'skills', label: 'Kỹ năng' },
  { id: 'history', label: 'Lịch sử' },
  { id: 'children', label: 'Thiếu nhi' }
];

const sortOptions = [
  { id: 'newest', label: 'Mới nhất' },
  { id: 'most_read', label: 'Đọc nhiều nhất' },
  { id: 'top_rated', label: 'Đánh giá cao nhất' }
];

const PAGE_SIZE = 12;

export default function LibraryPage() {
  return (
    <Suspense fallback={null}>
      <Library />
    </Suspense>
  );
}

function Library() {
  const searchParams = useSearchParams();
  const [books, setBooks] = useState([]);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Reset to page 1 whenever the filters change
  useEffect(() => {
    setPage(1);
  }, [category, search, sort]);

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      const supabase = createClient();
      let query = supabase.from('books').select('*', { count: 'exact' });

      if (category !== 'all') query = query.eq('category', category);
      if (search) query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%`);

      if (sort === 'most_read') query = query.order('read_count', { ascending: false });
      else if (sort === 'top_rated') query = query.order('rating_avg', { ascending: false });
      else query = query.order('created_at', { ascending: false });

      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      query = query.range(from, to);

      const { data, count } = await query;
      setBooks(data || []);
      setTotal(count || 0);
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [category, search, sort, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="paper-texture" style={{ minHeight: '100vh' }}>
      <div className="container" style={{ padding: '64px 24px' }}>
        <div className="eyebrow">Thư viện</div>
        <h1 className="h-section" style={{ marginBottom: 32 }}>Tất cả sách</h1>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
          <div style={{ position: 'relative', flex: '1 1 320px', maxWidth: 480 }}>
            <Search size={18} color="var(--sage)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
            <input className="form-input" placeholder="Tìm theo tên sách, tác giả…"
              value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 44 }} />
          </div>

          <select className="form-select" value={sort} onChange={(e) => setSort(e.target.value)} style={{ maxWidth: 220 }} aria-label="Sắp xếp">
            {sortOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 40 }}>
          {categories.map(c => (
            <button key={c.id} onClick={() => setCategory(c.id)}
              style={{
                padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 500,
                background: category === c.id ? 'var(--forest)' : 'transparent',
                color: category === c.id ? 'var(--on-brand)' : 'var(--heading)',
                border: '1px solid var(--heading)'
              }}>{c.label}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ color: 'var(--sage)' }}>Đang tải…</div>
        ) : books.length === 0 ? (
          <div style={{ padding: 80, textAlign: 'center', color: 'var(--sage)' }}>Không tìm thấy sách phù hợp.</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24, marginBottom: 40 }}>
              {books.map(book => (
                <Link key={book.id} href={`/sach/${book.id}`} className="book-hover" style={{ display: 'block' }}>
                  <div style={{
                    aspectRatio: '3/4', borderRadius: 2, padding: 28,
                    background: `linear-gradient(135deg, ${book.cover_color} 0%, ${book.cover_color}dd 100%)`,
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: 'white',
                    boxShadow: '0 20px 40px -20px rgba(31, 58, 45, 0.25)'
                  }}>
                    <span style={{
                      fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
                      padding: '4px 12px', borderRadius: 999, alignSelf: 'flex-start',
                      background: 'rgba(255,255,255,0.15)'
                    }}>{categories.find(c => c.id === book.category)?.label}</span>
                    <div>
                      <div className="serif" style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.15, marginBottom: 4 }}>{book.title}</div>
                      <div style={{ fontSize: 13, opacity: 0.75, fontStyle: 'italic' }}>— {book.author}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <nav className="pagination" aria-label="Điều hướng trang">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} aria-label="Trang trước">‹ Trước</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setPage(n)} aria-current={n === page ? 'page' : undefined}>{n}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} aria-label="Trang sau">Sau ›</button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}
