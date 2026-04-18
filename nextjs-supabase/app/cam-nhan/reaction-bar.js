'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase-browser';

const REACTIONS = [
  { type: 'inspired', emoji: '✨' },
  { type: 'moved', emoji: '😭' },
  { type: 'thoughtful', emoji: '💭' },
  { type: 'fun', emoji: '😄' }
];

export default function ReactionBar({ reviewId, reactions: initialReactions, currentUserId }) {
  const router = useRouter();
  const [reactions, setReactions] = useState(initialReactions);

  const toggle = async (type) => {
    if (!currentUserId) {
      router.push('/dang-nhap');
      return;
    }

    const supabase = createClient();
    const existing = reactions.find(r => r.type === type && r.user_id === currentUserId);

    // Optimistic update
    if (existing) {
      setReactions(reactions.filter(r => !(r.type === type && r.user_id === currentUserId)));
      await supabase.from('reactions').delete()
        .eq('review_id', reviewId).eq('user_id', currentUserId).eq('type', type);
    } else {
      setReactions([...reactions, { type, user_id: currentUserId }]);
      await supabase.from('reactions').insert({ review_id: reviewId, user_id: currentUserId, type });
    }
  };

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
      {REACTIONS.map(({ type, emoji }) => {
        const count = reactions.filter(r => r.type === type).length;
        const reacted = reactions.some(r => r.type === type && r.user_id === currentUserId);
        return (
          <button key={type} onClick={() => toggle(type)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 999,
              background: reacted ? 'rgba(200, 132, 28, 0.15)' : 'transparent',
              border: `1px solid ${reacted ? 'var(--amber)' : 'var(--border)'}`,
              fontSize: 13, color: 'var(--forest)'
            }}>
            <span style={{ fontSize: 16 }}>{emoji}</span>
            {count > 0 && <span>{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
