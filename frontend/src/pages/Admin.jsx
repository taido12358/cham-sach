import { useState } from 'react';
import ReviewModeration from '../components/ReviewModeration';
import AdminBooks from './AdminBooks';

const MAIN_TABS = [
  { id: 'reviews', label: 'Duyệt bài' },
  { id: 'books', label: 'Quản lý sách' }
];

export default function Admin() {
  const [mainTab, setMainTab] = useState('reviews');

  return (
    <div className="paper-texture" style={{ minHeight: '100vh' }}>
      <div className="container" style={{ padding: '64px 24px' }}>
        <div className="eyebrow">Quản trị</div>
        <h1 className="h-section" style={{ marginBottom: 32 }}>
          {mainTab === 'reviews' ? 'Duyệt cảm nhận' : 'Quản lý sách'}
        </h1>

        <div style={{ display: 'flex', gap: 8, marginBottom: 40 }}>
          {MAIN_TABS.map(t => (
            <button key={t.id} onClick={() => setMainTab(t.id)}
              className={t.id === mainTab ? 'btn btn-primary' : 'btn btn-outline'}>
              {t.label}
            </button>
          ))}
        </div>

        {mainTab === 'reviews' ? <ReviewModeration /> : <AdminBooks />}
      </div>
    </div>
  );
}
