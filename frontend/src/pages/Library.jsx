import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import BookCard from '../components/BookCard';

const categories = [
  { id: 'all', label: 'Tất cả' },
  { id: 'literature', label: 'Văn học' },
  { id: 'skills', label: 'Kỹ năng' },
  { id: 'history', label: 'Lịch sử' },
  { id: 'children', label: 'Thiếu nhi' }
];

const sortOptions = [
  { value: '-createdAt', label: 'Mới nhất' },
  { value: '-readCount', label: 'Đọc nhiều nhất' },
  { value: '-ratingAvg', label: 'Đánh giá cao nhất' }
];

const PAGE_WINDOW = 7;

export default function Library() {
  const [searchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [sort, setSort] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [category, search, sort]);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams();
      if (category !== 'all') params.set('category', category);
      if (search) params.set('search', search);
      params.set('sort', sort);
      params.set('page', String(page));
      params.set('limit', '12');

      api.get(`/books?${params}`)
        .then(res => {
          setBooks(res.data.books);
          if (res.data.pagination) setPagination(res.data.pagination);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 300); // debounce search

    return () => clearTimeout(t);
  }, [category, search, sort, page]);

  const pageNumbers = () => {
    const total = pagination.pages || 1;
    if (total <= PAGE_WINDOW) return Array.from({ length: total }, (_, i) => i + 1);
    const nums = new Set([1, total, page, page - 1, page + 1]);
    return [...nums].filter(n => n >= 1 && n <= total).sort((a, b) => a - b);
  };

  return (
    <div className="paper-texture" style={{ minHeight: '100vh' }}>
      <div className="container" style={{ padding: '64px 24px' }}>
        <div className="eyebrow">Thư viện</div>
        <h1 className="h-section" style={{ marginBottom: 32 }}>Tất cả sách</h1>

        {/* Search + sort */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
          <div style={{ position: 'relative', flex: '1 1 320px', maxWidth: 480 }}>
            <Search size={18} color="var(--sage)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              className="form-input"
              placeholder="Tìm theo tên sách, tác giả…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 44 }}
            />
          </div>

          <select className="form-select" value={sort} onChange={(e) => setSort(e.target.value)}
            style={{ width: 'auto', minWidth: 180 }}>
            {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Category filter */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 40 }}>
          {categories.map(c => (
            <button key={c.id} onClick={() => setCategory(c.id)}
              style={{
                padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 500,
                background: category === c.id ? 'var(--forest)' : 'transparent',
                color: category === c.id ? 'var(--on-brand)' : 'var(--heading)',
                border: '1px solid var(--heading)'
              }}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Books grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ aspectRatio: '3/4' }} />)}
          </div>
        ) : books.length === 0 ? (
          <div style={{ padding: 80, textAlign: 'center', color: 'var(--sage)' }}>
            Không tìm thấy sách nào phù hợp.
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
              {books.map(book => <BookCard key={book._id} book={book} />)}
            </div>

            {pagination.pages > 1 && (
              <nav className="pagination" aria-label="Điều hướng trang">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} aria-label="Trang trước">
                  ‹
                </button>
                {pageNumbers().map((n, i, arr) => (
                  <span key={n} style={{ display: 'flex', alignItems: 'center' }}>
                    {i > 0 && arr[i - 1] !== n - 1 && <span style={{ padding: '0 4px', color: 'var(--sage)' }}>…</span>}
                    <button onClick={() => setPage(n)} aria-current={page === n ? 'page' : undefined}>{n}</button>
                  </span>
                ))}
                <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page >= pagination.pages} aria-label="Trang sau">
                  ›
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}
