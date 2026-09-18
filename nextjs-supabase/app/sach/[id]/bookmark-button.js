'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bookmark } from 'lucide-react';
import { createClient } from '../../../lib/supabase-browser';
import { useToast } from '../../toast-context';

export default function BookmarkButton({ bookId, initialBookmarked, currentUserId }) {
  const router = useRouter();
  const toast = useToast();
  const [bookmarked, setBookmarked] = useState(!!initialBookmarked);
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    if (!currentUserId) {
      router.push('/dang-nhap');
      return;
    }

    const next = !bookmarked;
    setBookmarked(next);
    setBusy(true);

    const supabase = createClient();
    const { error } = next
      ? await supabase.from('bookmarks').insert({ user_id: currentUserId, book_id: bookId })
      : await supabase.from('bookmarks').delete().eq('user_id', currentUserId).eq('book_id', bookId);

    setBusy(false);

    if (error) {
      setBookmarked(!next);
      toast.error(error.message);
      return;
    }

    toast.success(next ? 'Đã lưu sách' : 'Đã bỏ lưu sách');
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className="btn btn-outline"
      aria-pressed={bookmarked}
      aria-label={bookmarked ? 'Bỏ lưu sách khỏi tủ sách của tôi' : 'Lưu sách vào tủ sách của tôi'}
    >
      <Bookmark size={18} fill={bookmarked ? 'var(--amber)' : 'none'} color={bookmarked ? 'var(--amber)' : 'currentColor'} />
      {bookmarked ? 'Đã lưu' : 'Lưu sách'}
    </button>
  );
}
