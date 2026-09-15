'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { createClient } from '../lib/supabase-browser';

const categoryLabel = { literature: 'Văn học', skills: 'Kỹ năng', history: 'Lịch sử', children: 'Thiếu nhi' };

export default function HeaderSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function onClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('books')
        .select('id,title,author,category')
        .or(`title.ilike.%${q}%,author.ilike.%${q}%`)
        .limit(5);
      setResults(data || []);
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const goToLibrary = () => {
    setOpen(false);
    router.push(`/thu-vien?q=${encodeURIComponent(q)}`);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    goToLibrary();
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Tìm kiếm sách"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36 }}
        >
          <Search size={18} color="var(--heading)" />
        </button>
      ) : (
        <div style={{ position: 'relative' }}>
          <form onSubmit={onSubmit} style={{ position: 'relative' }}>
            <Search size={16} color="var(--sage)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              ref={inputRef}
              className="form-input"
              placeholder="Tìm sách, tác giả…"
              aria-label="Tìm sách, tác giả"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ width: 220, padding: '8px 36px 8px 34px', fontSize: 14 }}
            />
            <button
              type="button"
              onClick={() => { setQ(''); setOpen(false); }}
              aria-label="Đóng tìm kiếm"
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
            >
              <X size={14} color="var(--sage)" />
            </button>
          </form>

          {q.trim() && (
            <div style={{
              position: 'absolute', top: 48, right: 0, width: 320,
              background: 'var(--ivory)', border: '1px solid var(--border)', borderRadius: 2,
              boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)', overflow: 'hidden', zIndex: 60
            }}>
              {loading ? (
                <div style={{ padding: 16, fontSize: 13, color: 'var(--sage)' }}>Đang tìm…</div>
              ) : results.length === 0 ? (
                <div style={{ padding: 16, fontSize: 13, color: 'var(--sage)' }}>Không tìm thấy sách phù hợp.</div>
              ) : (
                <div>
                  {results.map((b) => (
                    <Link
                      key={b.id}
                      href={`/sach/${b.id}`}
                      onClick={() => setOpen(false)}
                      style={{ display: 'block', padding: '10px 16px', borderBottom: '1px solid var(--border)' }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--heading)' }}>{b.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--sage)' }}>
                        {b.author} · {categoryLabel[b.category] || b.category}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={goToLibrary}
                style={{ display: 'block', width: '100%', textAlign: 'center', padding: 12, fontSize: 13, fontWeight: 500, color: 'var(--amber)', borderTop: '1px solid var(--border)' }}
              >
                Xem tất cả kết quả →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
