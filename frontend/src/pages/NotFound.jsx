import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="paper-texture" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ textAlign: 'center', padding: 64 }}>
        <div className="serif" style={{ fontSize: 120, fontWeight: 700, color: 'var(--forest)', lineHeight: 1 }}>404</div>
        <h1 className="serif" style={{ fontSize: 32, fontWeight: 600, marginTop: 16, marginBottom: 16, color: 'var(--forest)' }}>
          Trang sách này chưa được viết…
        </h1>
        <p style={{ color: 'var(--sage)', marginBottom: 32 }}>Có thể đường link bạn đi bị nhầm, hoặc nội dung đã được chuyển đi.</p>
        <Link to="/" className="btn btn-primary btn-lg">Về trang chủ</Link>
      </div>
    </div>
  );
}
