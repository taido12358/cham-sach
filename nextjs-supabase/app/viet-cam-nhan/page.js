import { createClient } from '../../lib/supabase-server';
import WriteReviewForm from './form';

export default async function WriteReviewPage({ searchParams }) {
  const supabase = createClient();
  const { data: books } = await supabase.from('books').select('id, title, author').order('title');

  return (
    <div className="paper-texture" style={{ minHeight: '100vh' }}>
      <div className="container" style={{ padding: '64px 24px', maxWidth: 800 }}>
        <div className="eyebrow">Cảm nhận mới</div>
        <h1 className="h-section" style={{ marginBottom: 12 }}>Chia sẻ cảm nhận</h1>
        <p style={{ color: 'var(--gray-text)', marginBottom: 40, maxWidth: 600, lineHeight: 1.7 }}>
          Bài viết sẽ được CLB xem xét trong 24h trước khi đăng lên trang chủ.
        </p>

        <WriteReviewForm books={books || []} preselectedBook={searchParams?.book} />
      </div>
    </div>
  );
}
