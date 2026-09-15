'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();
  const [q, setQ] = useState('');

  const submit = (e) => {
    e.preventDefault();
    router.push(`/thu-vien?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="paper-texture" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ textAlign: 'center', padding: 64 }}>
        <div className="serif" style={{ fontSize: 120, fontWeight: 700, color: 'var(--heading)', lineHeight: 1 }}>404</div>
        <h1 className="serif" style={{ fontSize: 32, fontWeight: 600, marginTop: 16, marginBottom: 16, color: 'var(--heading)' }}>
          Trang sách này chưa được viết…
        </h1>
        <p style={{ color: 'var(--sage)', marginBottom: 32 }}>Có thể đường link bạn đi bị nhầm, hoặc nội dung đã được chuyển đi.</p>

        <form onSubmit={submit} style={{ position: 'relative', maxWidth: 420, margin: '0 auto 24px' }}>
          <Search size={18} color="var(--sage)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            className="form-input"
            placeholder="Tìm sách trong thư viện…"
            aria-label="Tìm sách trong thư viện"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ paddingLeft: 44 }}
          />
        </form>

        <Link href="/" className="btn btn-primary btn-lg">Về trang chủ</Link>
      </div>
    </div>
  );
}
