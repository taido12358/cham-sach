import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { BookMarked, Search, LogOut, User, ChevronDown, Menu, X, Sun, Moon, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/client';

const categoryLabels = {
  literature: 'Văn học',
  skills: 'Kỹ năng',
  history: 'Lịch sử',
  children: 'Thiếu nhi'
};

export default function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  const isStaff = user?.role === 'admin' || user?.role === 'ctv';
  const initials = user?.name?.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase() || '';

  const links = [
    { to: '/thu-vien', label: 'Thư viện' },
    { to: '/cam-nhan', label: 'Cảm nhận' },
    { to: '/thu-thach', label: 'Thử thách' }
  ];

  // Debounced search
  useEffect(() => {
    if (!searchOpen || !query.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    const t = setTimeout(() => {
      api.get(`/books?search=${encodeURIComponent(query.trim())}&limit=5`)
        .then(res => setResults(res.data.books || []))
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(t);
  }, [query, searchOpen]);

  // Close on outside click / Escape
  useEffect(() => {
    const onClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const submitSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchOpen(false);
    navigate(`/thu-vien?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      backdropFilter: 'blur(12px)',
      background: 'color-mix(in srgb, var(--cream) 90%, transparent)',
      borderBottom: '1px solid var(--border)'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 2, background: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookMarked size={20} color="var(--on-brand)" />
            </div>
            <div className="hide-mobile">
              <div className="serif" style={{ fontSize: 18, fontWeight: 700, lineHeight: 1, color: 'var(--heading)' }}>Trang Sách</div>
              <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--sage)', marginTop: 2 }}>CLB THCS Đại Phúc</div>
            </div>
          </Link>

          <nav className="hide-mobile" style={{ display: 'flex', gap: 32, fontSize: 14, fontWeight: 500 }}>
            {links.map(l => (
              <NavLink key={l.to} to={l.to} style={({ isActive }) => ({
                color: isActive ? 'var(--amber)' : 'var(--heading)',
                paddingBottom: 4,
                borderBottom: isActive ? '1px solid var(--amber)' : '1px solid transparent'
              })}>
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div ref={searchRef} style={{ position: 'relative' }}>
            {searchOpen ? (
              <form onSubmit={submitSearch} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 14px', borderRadius: 999,
                  background: 'var(--ivory)', border: '1px solid var(--heading)', width: 220
                }}>
                  <Search size={14} color="var(--sage)" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Tìm sách…"
                    aria-label="Tìm kiếm sách"
                    style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, width: '100%', color: 'var(--ink)' }}
                  />
                </div>

                {(query.trim() || searching) && (
                  <div style={{
                    position: 'absolute', top: 48, right: 0, width: 320,
                    background: 'var(--ivory)', border: '1px solid var(--border)', borderRadius: 2,
                    boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)', overflow: 'hidden', zIndex: 60
                  }}>
                    {searching ? (
                      <div style={{ padding: 16, fontSize: 13, color: 'var(--sage)' }}>Đang tìm…</div>
                    ) : results.length === 0 ? (
                      <div style={{ padding: 16, fontSize: 13, color: 'var(--sage)' }}>Không tìm thấy sách nào.</div>
                    ) : (
                      <>
                        {results.map(b => (
                          <Link key={b._id} to={`/sach/${b._id}`} onClick={() => setSearchOpen(false)}
                            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</div>
                              <div style={{ fontSize: 12, color: 'var(--sage)', fontStyle: 'italic' }}>{b.author}</div>
                            </div>
                            <span style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 999, background: 'var(--cream)', color: 'var(--heading)', flexShrink: 0 }}>
                              {categoryLabels[b.category] || b.category}
                            </span>
                          </Link>
                        ))}
                        <button type="submit" style={{ display: 'block', width: '100%', padding: '10px 14px', fontSize: 13, fontWeight: 500, color: 'var(--forest-light)', textAlign: 'left' }}>
                          Xem tất cả kết quả →
                        </button>
                      </>
                    )}
                  </div>
                )}
              </form>
            ) : (
              <button className="hide-mobile" aria-label="Tìm kiếm sách" style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 16px', borderRadius: 999, fontSize: 13,
                background: 'var(--ivory)', border: '1px solid var(--border)', color: 'var(--sage)'
              }} onClick={openSearch}>
                <Search size={14} /> Tìm sách…
              </button>
            )}
          </div>

          <button className="hide-desktop" aria-label="Tìm kiếm sách" onClick={() => (searchOpen ? navigate('/thu-vien') : openSearch())} style={{ color: 'var(--heading)' }}>
            <Search size={20} />
          </button>

          <button className="theme-toggle" onClick={toggleTheme} aria-label="Chuyển giao diện sáng/tối">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-label="Menu tài khoản"
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <div className="serif" style={{
                  width: 40, height: 40, borderRadius: 999,
                  background: 'var(--forest)', color: 'var(--on-brand)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 13
                }}>{initials}</div>
                <ChevronDown size={14} className="hide-mobile" color="var(--heading)" />
              </button>

              {userMenuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 52, minWidth: 220,
                  background: 'var(--ivory)', border: '1px solid var(--border)', borderRadius: 2,
                  boxShadow: '0 10px 30px -10px rgba(0,0,0,0.15)', overflow: 'hidden'
                }}>
                  <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--heading)' }}>{user.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--sage)' }}>{user.className && `Lớp ${user.className} · `}Cấp {user.stats?.level || 1}</div>
                  </div>
                  <Link to="/ho-so" onClick={() => setUserMenuOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', fontSize: 14 }}>
                    <User size={16} /> Hồ sơ của tôi
                  </Link>
                  {isStaff && (
                    <Link to="/quan-tri" onClick={() => setUserMenuOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', fontSize: 14 }}>
                      <ShieldCheck size={16} /> Quản trị
                    </Link>
                  )}
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

          <button className="hide-desktop" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'} style={{ color: 'var(--heading)' }}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="hide-desktop" style={{ borderTop: '1px solid var(--border)', padding: '12px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {links.map(l => (
            <NavLink key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
              style={{ padding: '12px 0', fontSize: 15, color: 'var(--heading)', fontWeight: 500 }}>
              {l.label}
            </NavLink>
          ))}
          {isStaff && (
            <NavLink to="/quan-tri" onClick={() => setMenuOpen(false)}
              style={{ padding: '12px 0', fontSize: 15, color: 'var(--heading)', fontWeight: 500 }}>
              Quản trị
            </NavLink>
          )}
        </div>
      )}
    </header>
  );
}
