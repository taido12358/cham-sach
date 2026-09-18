'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';
import { createClient } from '../../lib/supabase-browser';
import { useToast } from '../toast-context';
import BookForm from './book-form';

const categoryLabels = { literature: 'Văn học', skills: 'Kỹ năng', history: 'Lịch sử', children: 'Thiếu nhi' };

export default function BooksPanel({ books }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 24 }}>
        {showAdd ? (
          <BookForm onDone={() => setShowAdd(false)} onCancel={() => setShowAdd(false)} />
        ) : (
          <button type="button" className="btn btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Thêm sách mới
          </button>
        )}
      </div>

      {!books || books.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--sage)' }}>
          Chưa có sách nào.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {books.map((book) => (
            editingId === book.id ? (
              <BookForm key={book.id} book={book} onDone={() => setEditingId(null)} onCancel={() => setEditingId(null)} />
            ) : (
              <BookRow key={book.id} book={book} onEdit={() => setEditingId(book.id)} />
            )
          ))}
        </div>
      )}
    </div>
  );
}

function BookRow({ book, onEdit }) {
  const router = useRouter();
  const toast = useToast();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from('books').delete().eq('id', book.id);
    setBusy(false);

    if (error) {
      toast.error(error.message);
      setConfirmingDelete(false);
      return;
    }

    toast.success('Đã xóa sách');
    router.refresh();
  };

  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      <div
        aria-hidden="true"
        style={{
          width: 40, height: 52, borderRadius: 2, flexShrink: 0,
          background: `linear-gradient(135deg, ${book.cover_color} 0%, ${book.cover_color}cc 100%)`
        }}
      />
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontWeight: 600, color: 'var(--heading)', display: 'flex', alignItems: 'center', gap: 6 }}>
          {book.title}
          {book.featured && <Star size={13} fill="var(--amber)" color="var(--amber)" />}
        </div>
        <div style={{ fontSize: 13, color: 'var(--sage)' }}>
          {book.author} · {categoryLabels[book.category] || book.category}
        </div>
      </div>
      <div style={{ fontSize: 13, color: 'var(--sage)', minWidth: 150 }}>
        {book.read_count} lượt đọc · {book.rating_avg ? Number(book.rating_avg).toFixed(1) : '—'}★ ({book.rating_count})
      </div>

      {!confirmingDelete ? (
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn-outline" onClick={onEdit} aria-label={`Sửa sách ${book.title}`}>
            <Pencil size={14} /> Sửa
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setConfirmingDelete(true)}
            aria-label={`Xóa sách ${book.title}`}
            style={{ borderColor: '#c00', color: '#c00' }}
          >
            <Trash2 size={14} /> Xóa
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 13 }}>Xóa sách này?</span>
          <button type="button" className="btn btn-primary" disabled={busy} onClick={remove} style={{ background: '#8B0000' }}>
            Có
          </button>
          <button type="button" className="btn btn-outline" disabled={busy} onClick={() => setConfirmingDelete(false)}>
            Không
          </button>
        </div>
      )}
    </div>
  );
}
