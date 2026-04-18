import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { BookMarked, Search, LogOut, User, ChevronDown, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const initials = user?.name?.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase() || '';

  const links = [
    { to: '/thu-vien', label: 'Thư viện' },
    { to: '/cam-nhan', label: 'Cảm nhận' },
    { to: '/thu-thach', label: 'Thử thách' }
  ];

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      backdropFilter: 'blur(12px)',
      background: 'rgba(247, 243, 234, 0.9)',
      borderBottom: '1px solid var(--border)'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 2, background: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookMarked size={20} color="var(--cream)" />
            </div>
            <div className="hide-mobile">
              <div className="serif" style={{ fontSize: 18, fontWeight: 700, lineHeight: 1, color: 'var(--forest)' }}>Trang Sách</div>
              <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--sage)', marginTop: 2 }}>CLB THCS Đại Phúc</div>
            </div>
          </Link>

          <nav className="hide-mobile" style={{ display: 'flex', gap: 32, fontSize: 14, fontWeight: 500 }}>
            {links.map(l => (
              <NavLink key={l.to} to={l.to} style={({ isActive }) => ({
                color: isActive ? 'var(--amber)' : 'var(--forest)',
                paddingBottom: 4,
                borderBottom: isActive ? '1px solid var(--amber)' : '1px solid transparent'
              })}>
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="hide-mobile" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: 999, fontSize: 13,
            background: 'var(--ivory)', border: '1px solid var(--border)', color: 'var(--sage)'
          }} onClick={() => navigate('/thu-vien')}>
            <Search size={14} /> Tìm sách…
          </button>

          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <div className="serif" style={{
                  width: 40, height: 40, borderRadius: 999,
                  background: 'var(--forest)', color: 'var(--cream)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 13
                }}>{initials}</div>
                <ChevronDown size={14} className="hide-mobile" color="var(--forest)" />
              </button>

              {userMenuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 52, minWidth: 220,
                  background: 'var(--ivory)', border: '1px solid var(--border)', borderRadius: 2,
                  boxShadow: '0 10px 30px -10px rgba(0,0,0,0.15)', overflow: 'hidden'
                }}>
                  <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--forest)' }}>{user.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--sage)' }}>{user.className && `Lớp ${user.className} · `}Cấp {user.stats?.level || 1}</div>
                  </div>
                  <Link to="/ho-so" onClick={() => setUserMenuOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', fontSize: 14 }}>
                    <User size={16} /> Hồ sơ của tôi
                  </Link>
                  <button onClick={() => { logout(); setUserMenuOpen(false); navigate('/'); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', width: '100%', fontSize: 14, color: '#c00' }}>
                    <LogOut size={16} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/dang-nhap" className="btn btn-outline" style={{ padding: '8px 16px' }}>Đăng nhập</Link>
              <Link to="/dang-ky" className="btn btn-primary hide-mobile" style={{ padding: '8px 16px' }}>Tham gia</Link>
            </div>
          )}

          <button className="hide-desktop" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="hide-desktop" style={{ borderTop: '1px solid var(--border)', padding: '12px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {links.map(l => (
            <NavLink key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
              style={{ padding: '12px 0', fontSize: 15, color: 'var(--forest)', fontWeight: 500 }}>
              {l.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
