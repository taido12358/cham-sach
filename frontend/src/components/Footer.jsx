import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookMarked } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Footer() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');

  const subscribe = () => {
    toast.success('Cảm ơn bạn đã đăng ký! (bản demo, email chưa được lưu)');
    setEmail('');
  };

  return (
    <footer style={{ padding: '48px 0', background: 'var(--forest)', color: 'rgba(247, 243, 234, 0.7)' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 2, background: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookMarked size={20} color="var(--forest)" />
            </div>
            <div className="serif" style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-brand)' }}>Trang Sách</div>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.7 }}>CLB Sách THCS Đại Phúc — Lan tỏa văn hóa đọc, kết nối tâm hồn trẻ.</p>
        </div>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16, color: 'var(--amber)' }}>Khám phá</div>
          <ul style={{ listStyle: 'none', fontSize: 14, lineHeight: 2 }}>
            <li><Link to="/thu-vien">Thư viện</Link></li>
            <li><Link to="/cam-nhan">Cảm nhận</Link></li>
            <li><Link to="/thu-thach">Thử thách</Link></li>
          </ul>
        </div>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16, color: 'var(--amber)' }}>Về CLB</div>
          <ul style={{ listStyle: 'none', fontSize: 14, lineHeight: 2 }}>
            <li>Thành viên</li>
            <li>Hoạt động</li>
            <li>Liên hệ</li>
          </ul>
        </div>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16, color: 'var(--amber)' }}>Bản tin tuần</div>
          <p style={{ fontSize: 14, marginBottom: 12 }}>Gợi ý sách mỗi Chủ nhật</p>
          <form onSubmit={(e) => { e.preventDefault(); subscribe(); }} style={{ display: 'flex' }}>
            <input placeholder="email của bạn" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              aria-label="Email đăng ký bản tin"
              style={{ flex: 1, padding: '8px 12px', borderRadius: '2px 0 0 2px', fontSize: 13, background: 'rgba(255,255,255,0.1)', color: 'var(--on-brand)', border: 'none', outline: 'none' }} />
            <button type="submit" style={{ padding: '0 16px', borderRadius: '0 2px 2px 0', fontWeight: 500, fontSize: 13, background: 'var(--amber)', color: 'var(--forest)' }}>OK</button>
          </form>
        </div>
      </div>
      <div className="container" style={{ paddingTop: 32, marginTop: 32, fontSize: 12, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        © 2026 CLB Sách THCS Đại Phúc · Làm bằng ♥ và trang sách
      </div>
    </footer>
  );
}
