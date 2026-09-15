import './globals.css';
import Link from 'next/link';
import { BookMarked } from 'lucide-react';
import { createClient } from '../lib/supabase-server';
import UserMenu from './user-menu';
import ThemeToggle from './theme-toggle';
import HeaderSearch from './header-search';
import { ToastProvider } from './toast-context';
import Footer from './footer';

export const metadata = {
  title: 'Trang Sách · CLB THCS Đại Phúc',
  description: 'Nơi học sinh cùng đọc, cùng viết, cùng chia sẻ văn hóa đọc.'
};

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') {
      document.documentElement.setAttribute('data-theme', stored);
    }
  } catch (e) {}
})();
`;

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
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <ToastProvider>
          <header style={{
            position: 'sticky', top: 0, zIndex: 50,
            backdropFilter: 'blur(12px)',
            background: 'color-mix(in srgb, var(--cream) 90%, transparent)',
            borderBottom: '1px solid var(--border)'
          }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 2, background: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookMarked size={20} color="var(--on-brand)" />
                  </div>
                  <div>
                    <div className="serif" style={{ fontSize: 18, fontWeight: 700, lineHeight: 1, color: 'var(--heading)' }}>Trang Sách</div>
                    <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--sage)', marginTop: 2 }}>CLB THCS Đại Phúc</div>
                  </div>
                </Link>
                <nav style={{ display: 'flex', gap: 32, fontSize: 14, fontWeight: 500 }}>
                  <Link href="/thu-vien" style={{ color: 'var(--heading)' }}>Thư viện</Link>
                  <Link href="/cam-nhan" style={{ color: 'var(--heading)' }}>Cảm nhận</Link>
                </nav>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <HeaderSearch />
                <ThemeToggle />
                <UserMenu profile={profile} />
              </div>
            </div>
          </header>

          <main style={{ minHeight: 'calc(100vh - 300px)' }}>{children}</main>

          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
