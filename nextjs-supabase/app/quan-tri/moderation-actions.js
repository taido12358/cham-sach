'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X } from 'lucide-react';
import { createClient } from '../../lib/supabase-browser';
import { useToast } from '../toast-context';

export default function ModerationActions({ reviewId }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [showRejectNote, setShowRejectNote] = useState(false);
  const [note, setNote] = useState('');

  const approve = async () => {
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from('reviews').update({ status: 'approved' }).eq('id', reviewId);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Đã duyệt bài viết');
    router.refresh();
  };

  const reject = async () => {
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from('reviews')
      .update({ status: 'rejected', moderation_note: note || null })
      .eq('id', reviewId);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Đã từ chối bài viết');
    setShowRejectNote(false);
    setNote('');
    router.refresh();
  };

  return (
    <div style={{ marginTop: 16 }}>
      {!showRejectNote ? (
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn-primary" disabled={busy} onClick={approve}>
            <Check size={16} /> Duyệt
          </button>
          <button type="button" className="btn btn-outline" disabled={busy} onClick={() => setShowRejectNote(true)}>
            <X size={16} /> Từ chối
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <input
            className="form-input"
            placeholder="Lý do từ chối (tùy chọn)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ maxWidth: 320 }}
          />
          <button type="button" className="btn btn-primary" disabled={busy} onClick={reject}
            style={{ background: '#8B0000' }}>
            Xác nhận từ chối
          </button>
          <button type="button" className="btn btn-outline" disabled={busy} onClick={() => setShowRejectNote(false)}>
            Hủy
          </button>
        </div>
      )}
    </div>
  );
}
