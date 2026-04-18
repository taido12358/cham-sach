import './globals.css';
import Link from 'next/link';
import { BookMarked } from 'lucide-react';
import { createClient } from '../lib/supabase-server';
import UserMenu from './user-menu';

export const metadata = {
  title: 'Trang Sách · CLB THCS Đại Phúc',
  description: 'Nơi học sinh cùng đọc, cùng viết, cùng chia sẻ văn hóa đọc.'
};

export default async function RootLayout({ children }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    profile = data;
  }

  return (
    <html lang="vi">
      <body>
        <header style={{
          position: 'sticky', top: 0, zIndex: 50,
          backdropFilter: 'blur(12px)',
          background: 'rgba(247, 243, 234, 0.9)',
          borderBottom: '1px solid var(--border)'
        }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 2, background: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookMarked size={20} color="var(--cream)" />
                </div>
                <div>
                  <div className="serif" style={{ fontSize: 18, fontWeight: 700, lineHeight: 1, color: 'var(--forest)' }}>Trang Sách</div>
                  <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--sage)', marginTop: 2 }}>CLB THCS Đại Phúc</div>
                </div>
              </Link>
              <nav style={{ display: 'flex', gap: 32, fontSize: 14, fontWeight: 500 }}>
                <Link href="/thu-vien" style={{ color: 'var(--forest)' }}>Thư viện</Link>
                <Link href="/cam-nhan" style={{ color: 'var(--forest)' }}>Cảm nhận</Link>
              </nav>
            </div>

            <UserMenu profile={profile} />
          </div>
        </header>

        <main style={{ minHeight: 'calc(100vh - 300px)' }}>{children}</main>

        <footer style={{ padding: '48px 0', background: 'var(--forest)', color: 'rgba(247, 243, 234, 0.7)', marginTop: 80 }}>
          <div className="container" style={{ textAlign: 'center', fontSize: 13 }}>
            © 2026 CLB Sách THCS Đại Phúc · Làm bằng ♥ và trang sách
          </div>
        </footer>
      </body>
    </html>
  );
}
