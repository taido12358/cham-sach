'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, User, LogOut } from 'lucide-react';
import { createClient } from '../lib/supabase-browser';

export default function UserMenu({ profile }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push('/');
  };

  if (!profile) {
    return (
      <div style={{ display: 'flex', gap: 8 }}>
        <Link href="/dang-nhap" className="btn btn-outline" style={{ padding: '8px 16px' }}>Đăng nhập</Link>
        <Link href="/dang-ky" className="btn btn-primary" style={{ padding: '8px 16px' }}>Tham gia</Link>
      </div>
    );
  }

  const initials = profile.name?.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase() || '?';

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div className="serif" style={{
          width: 40, height: 40, borderRadius: 999,
          background: 'var(--forest)', color: 'var(--cream)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 13
        }}>{initials}</div>
        <ChevronDown size={14} color="var(--forest)" />
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 52, minWidth: 220,
          background: 'var(--ivory)', border: '1px solid var(--border)', borderRadius: 2,
          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.15)', overflow: 'hidden'
        }}>
          <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 600, color: 'var(--forest)' }}>{profile.name}</div>
            <div style={{ fontSize: 12, color: 'var(--sage)' }}>
              {profile.class_name && `Lớp ${profile.class_name} · `}Cấp {profile.level || 1}
            </div>
          </div>
          <Link href="/ho-so" onClick={() => setOpen(false)}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', fontSize: 14 }}>
            <User size={16} /> Hồ sơ
          </Link>
          <button onClick={logout}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', width: '100%', fontSize: 14, color: '#c00' }}>
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}
