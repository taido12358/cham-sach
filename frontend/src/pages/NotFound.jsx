import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const submit = (e) => {
    e.preventDefault();
    navigate(`/thu-vien?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="paper-texture" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ textAlign: 'center', padding: 64, maxWidth: 560 }}>
        <div className="serif" style={{ fontSize: 120, fontWeight: 700, color: 'var(--heading)', lineHeight: 1 }}>404</div>
        <h1 className="serif" style={{ fontSize: 32, fontWeight: 600, marginTop: 16, marginBottom: 16, color: 'var(--heading)' }}>
          Trang sách này chưa được viết…
        </h1>
        <p style={{ color: 'var(--sage)', marginBottom: 32 }}>Có thể đường link bạn đi bị nhầm, hoặc nội dung đã được chuyển đi.</p>

        <Link to="/" className="btn btn-primary btn-lg" style={{ marginBottom: 32 }}>Về trang chủ</Link>

        <form onSubmit={submit} style={{ position: 'relative', marginBottom: 24 }}>
          <Search size={18} color="var(--sage)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            className="form-input"
            placeholder="Tìm sách bạn đang muốn xem…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ paddingLeft: 44 }}
          />
        </form>

        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', fontSize: 14, flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: 'var(--heading)', textDecoration: 'underline' }}>Trang chủ</Link>
          <Link to="/thu-vien" style={{ color: 'var(--heading)', textDecoration: 'underline' }}>Thư viện</Link>
          <Link to="/cam-nhan" style={{ color: 'var(--heading)', textDecoration: 'underline' }}>Cảm nhận</Link>
        </div>
      </div>
    </div>
  );
}
