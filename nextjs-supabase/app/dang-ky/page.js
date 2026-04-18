'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookMarked } from 'lucide-react';
import { createClient } from '../../lib/supabase-browser';

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', className: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { name: form.name, class_name: form.className }
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.refresh();
    router.push('/');
  };

  return (
    <div className="paper-texture" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: 480, padding: '64px 24px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 2, background: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <BookMarked size={28} color="var(--forest)" />
          </div>
          <h1 className="serif" style={{ fontSize: 36, fontWeight: 700, color: 'var(--forest)', marginBottom: 8 }}>Tham gia CLB</h1>
          <p style={{ color: 'var(--sage)' }}>Bắt đầu hành trình đọc sách</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Họ và tên</label>
            <input className="form-input" placeholder="Nguyễn Văn A"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Lớp</label>
            <input className="form-input" placeholder="8A"
              value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="email@truong.edu.vn"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Mật khẩu (ít nhất 6 ký tự)</label>
            <input className="form-input" type="password" placeholder="••••••••" minLength={6}
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: 12 }}>
            {loading ? 'Đang tạo…' : 'Tạo tài khoản'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--sage)' }}>
          Đã có tài khoản? <Link href="/dang-nhap" style={{ color: 'var(--forest)', fontWeight: 500, textDecoration: 'underline' }}>Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}
