import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import api from '../api/client';
import BookCard from '../components/BookCard';

const categories = [
  { id: 'all', label: 'Tất cả' },
  { id: 'literature', label: 'Văn học' },
  { id: 'skills', label: 'Kỹ năng' },
  { id: 'history', label: 'Lịch sử' },
  { id: 'children', label: 'Thiếu nhi' }
];

export default function Library() {
  const [books, setBooks] = useState([]);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams();
      if (category !== 'all') params.set('category', category);
      if (search) params.set('search', search);
      params.set('limit', '24');

      api.get(`/books?${params}`)
        .then(res => setBooks(res.data.books))
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 300); // debounce search

    return () => clearTimeout(t);
  }, [category, search]);

  return (
    <div className="paper-texture" style={{ minHeight: '100vh' }}>
      <div className="container" style={{ padding: '64px 24px' }}>
        <div className="eyebrow">Thư viện</div>
        <h1 className="h-section" style={{ marginBottom: 32 }}>Tất cả sách</h1>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 24, maxWidth: 480 }}>
          <Search size={18} color="var(--sage)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            className="form-input"
            placeholder="Tìm theo tên sách, tác giả…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 44 }}
          />
        </div>

        {/* Category filter */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 40 }}>
          {categories.map(c => (
            <button key={c.id} onClick={() => setCategory(c.id)}
              style={{
                padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 500,
                background: category === c.id ? 'var(--forest)' : 'transparent',
                color: category === c.id ? 'var(--cream)' : 'var(--forest)',
                border: '1px solid var(--forest)'
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
            {books.map(book => <BookCard key={book._id} book={book} />)}
          </div>
        )}
      </div>
    </div>
  );
}
