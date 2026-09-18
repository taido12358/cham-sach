'use client';

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { createClient } from '../../lib/supabase-browser';
import { useToast } from '../toast-context';

export default function CommentsSection({ reviewId, currentUserId }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('comments')
      .select('*, author:profiles(id, name, class_name)')
      .eq('review_id', reviewId)
      .order('created_at');

    if (error) {
      toast.error(error.message);
    } else {
      setComments(data || []);
    }
    setLoaded(true);
    setLoading(false);
  };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && !loaded) load();
  };

  const submit = async (e) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (trimmed.length < 2 || trimmed.length > 500) {
      toast.error('Bình luận phải từ 2 đến 500 ký tự');
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('comments')
      .insert({ review_id: reviewId, author_id: currentUserId, content: trimmed })
      .select('*, author:profiles(id, name, class_name)')
      .single();

    if (error) {
      toast.error(error.message);
      setSubmitting(false);
      return;
    }

    setComments((current) => [...current, data]);
    setContent('');
    setSubmitting(false);
    toast.success('Đã đăng bình luận');
  };

  return (
    <div style={{ marginTop: 12 }}>
      <button type="button" onClick={toggle}
        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--sage)' }}>
        <MessageCircle size={15} /> {open ? 'Ẩn bình luận' : 'Xem bình luận'}
        {comments.length > 0 && ` (${comments.length})`}
      </button>

      {open && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          {loading ? (
            <div style={{ fontSize: 13, color: 'var(--sage)' }}>Đang tải bình luận…</div>
          ) : comments.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--sage)', marginBottom: 12 }}>Chưa có bình luận nào.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              {comments.map((c) => (
                <div key={c.id} style={{ display: 'flex', gap: 10 }}>
                  <div className="serif" style={{
                    width: 32, height: 32, borderRadius: 999, flexShrink: 0,
                    background: 'var(--forest)', color: 'var(--on-brand)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 11
                  }}>
                    {c.author?.name?.split(' ').map(w => w[0]).slice(-2).join('') || '?'}
                  </div>
                  <div>
                    <div style={{ fontSize: 13 }}>
                      <span style={{ fontWeight: 600, color: 'var(--heading)' }}>{c.author?.name}</span>
                      {c.author?.class_name && <span style={{ color: 'var(--sage)' }}> · Lớp {c.author.class_name}</span>}
                      <span style={{ color: 'var(--sage)' }}> · {new Date(c.created_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div style={{ fontSize: 14, marginTop: 2 }}>{c.content}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentUserId ? (
            <form onSubmit={submit} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <textarea
                className="form-textarea"
                placeholder="Viết bình luận…"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={500}
                style={{ minHeight: 60, fontFamily: 'var(--font-sans)', fontSize: 14 }}
              />
              <button type="submit" className="btn btn-primary" disabled={submitting} style={{ flexShrink: 0 }}>
                {submitting ? '…' : 'Gửi'}
              </button>
            </form>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--sage)' }}>Đăng nhập để bình luận.</div>
          )}
        </div>
      )}
    </div>
  );
}
