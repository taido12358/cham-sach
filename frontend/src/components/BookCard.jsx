import { Link } from 'react-router-dom';
import { Star, Users, Bookmark } from 'lucide-react';

const categoryLabels = {
  literature: 'Văn học',
  skills: 'Kỹ năng',
  history: 'Lịch sử',
  children: 'Thiếu nhi'
};

export default function BookCard({ book, onBookmark, bookmarked }) {
  const coverStyle = {
    aspectRatio: '3/4',
    borderRadius: 2,
    position: 'relative',
    background: `linear-gradient(135deg, ${book.coverColor || '#1F3A2D'} 0%, ${book.coverColor || '#1F3A2D'}dd 100%)`,
    padding: 28,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-card)'
  };

  return (
    <Link to={`/sach/${book._id}`} className="book-hover" style={{ display: 'block' }}>
      <div style={coverStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{
            fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
            padding: '4px 12px', borderRadius: 999,
            background: 'rgba(255,255,255,0.15)', color: 'white', backdropFilter: 'blur(10px)'
          }}>
            {categoryLabels[book.category]}
          </span>
          {onBookmark && (
            <button onClick={(e) => { e.preventDefault(); onBookmark(book._id); }} style={{ color: 'rgba(255,255,255,0.8)' }}>
              <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>
        <div>
          <div className="serif" style={{ fontSize: 24, fontWeight: 700, color: 'white', lineHeight: 1.15, marginBottom: 6 }}>
            {book.title}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontStyle: 'italic' }}>— {book.author}</div>
        </div>
        {book.featured && (
          <div className="serif" style={{
            position: 'absolute', top: 16, right: 16,
            fontStyle: 'italic', fontSize: 11, padding: '4px 10px', borderRadius: 2,
            background: 'var(--amber)', color: 'white'
          }}>Nổi bật</div>
        )}
      </div>
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Star size={14} fill="var(--amber)" color="var(--amber)" />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--forest)' }}>
            {book.ratingAvg?.toFixed(1) || '—'}
          </span>
        </div>
        <div style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--sage)' }}>
          <Users size={12} /> {book.readCount || 0} người đã đọc
        </div>
      </div>
    </Link>
  );
}
