import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookMarked } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { handleError } from '../api/client';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(handleError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="paper-texture" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: 480, padding: '64px 24px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 56, height: 56, borderRadius: 2, background: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <BookMarked size={28} color="var(--on-brand)" />
          </div>
          <h1 className="serif" style={{ fontSize: 36, fontWeight: 700, color: 'var(--heading)', marginBottom: 8 }}>
            Chào mừng trở lại
          </h1>
          <p style={{ color: 'var(--sage)' }}>Đăng nhập để tiếp tục hành trình đọc sách</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="email@truong.edu.vn"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <input className="form-input" type="password" placeholder="••••••••"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: 12 }}>
            {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--sage)' }}>
          Chưa có tài khoản? <Link to="/dang-ky" style={{ color: 'var(--heading)', fontWeight: 500, textDecoration: 'underline' }}>Tham gia CLB</Link>
        </div>

        <div style={{ marginTop: 32, padding: 16, background: 'var(--ivory)', border: '1px solid var(--border)', borderRadius: 2, fontSize: 13, color: 'var(--gray-text)' }}>
          <strong>Tài khoản demo:</strong><br/>
          Admin: admin@daiphuc.edu.vn / admin123<br/>
          Student: minhanh@student.edu.vn / student123
        </div>
      </div>
    </div>
  );
}
