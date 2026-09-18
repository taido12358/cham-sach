'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X } from 'lucide-react';
import { createClient } from '../../lib/supabase-browser';
import { useToast } from '../toast-context';

const CATEGORIES = [
  { id: 'literature', label: 'Văn học' },
  { id: 'skills', label: 'Kỹ năng' },
  { id: 'history', label: 'Lịch sử' },
  { id: 'children', label: 'Thiếu nhi' }
];

const emptyLink = () => ({ name: '', url: '' });

function toFormState(book) {
  return {
    title: book?.title || '',
    author: book?.author || '',
    category: book?.category || 'literature',
    summary: book?.summary || '',
    excerpt: book?.excerpt || '',
    cover_color: book?.cover_color || '#1F3A2D',
    cover_image: book?.cover_image || '',
    tags: (book?.tags || []).join(', '),
    featured: !!book?.featured,
    legal_links: book?.legal_links?.length
      ? book.legal_links.map((l) => ({ name: l.name || '', url: l.url || '' }))
      : [emptyLink()]
  };
}

export default function BookForm({ book, onDone, onCancel }) {
  const router = useRouter();
  const toast = useToast();
  const isEdit = !!book;
  const [form, setForm] = useState(() => toFormState(book));
  const [saving, setSaving] = useState(false);

  const setField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const setLink = (index, field, value) => {
    setForm((f) => {
      const links = [...f.legal_links];
      links[index] = { ...links[index], [field]: value };
      return { ...f, legal_links: links };
    });
  };

  const addLink = () => setForm((f) => ({ ...f, legal_links: [...f.legal_links, emptyLink()] }));
  const removeLink = (index) => setForm((f) => ({ ...f, legal_links: f.legal_links.filter((_, i) => i !== index) }));

  const summaryLength = form.summary.trim().length;
  const summaryValid = summaryLength >= 200;

  const submit = async (e) => {
    e.preventDefault();
    if (!summaryValid) {
      toast.error(`Tóm tắt cần tối thiểu 200 ký tự (hiện có ${summaryLength})`);
      return;
    }

    setSaving(true);
    const supabase = createClient();

    const payload = {
      title: form.title.trim(),
      author: form.author.trim(),
      category: form.category,
      summary: form.summary.trim(),
      excerpt: form.excerpt.trim() || null,
      cover_color: form.cover_color,
      cover_image: form.cover_image.trim() || null,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      legal_links: form.legal_links
        .filter((l) => l.name.trim() || l.url.trim())
        .map((l) => ({ name: l.name.trim(), url: l.url.trim() })),
      featured: form.featured
    };

    let error;
    if (isEdit) {
      ({ error } = await supabase.from('books').update(payload).eq('id', book.id));
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      ({ error } = await supabase.from('books').insert({ ...payload, added_by: user?.id || null }));
    }

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(isEdit ? 'Đã cập nhật sách' : 'Đã thêm sách mới');
    router.refresh();
    onDone?.();
  };

  return (
    <form onSubmit={submit} className="card" style={{ marginBottom: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div className="form-group">
          <label className="form-label">Tên sách</label>
          <input className="form-input" value={form.title} onChange={(e) => setField('title', e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label">Tác giả</label>
          <input className="form-input" value={form.author} onChange={(e) => setField('author', e.target.value)} required />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div className="form-group">
          <label className="form-label">Thể loại</label>
          <select className="form-select" value={form.category} onChange={(e) => setField('category', e.target.value)}>
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Màu bìa</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              type="color"
              value={form.cover_color}
              onChange={(e) => setField('cover_color', e.target.value)}
              aria-label="Chọn màu bìa"
              style={{ width: 44, height: 40, padding: 2, border: '1px solid var(--border)', borderRadius: 2, background: 'var(--ivory)' }}
            />
            <div
              aria-hidden="true"
              style={{
                flex: 1, height: 40, borderRadius: 2,
                background: `linear-gradient(135deg, ${form.cover_color} 0%, ${form.cover_color}cc 100%)`
              }}
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Tóm tắt (tối thiểu 200 ký tự)</label>
        <textarea className="form-textarea" value={form.summary} onChange={(e) => setField('summary', e.target.value)} required />
        <div style={{ fontSize: 12, color: summaryValid ? 'var(--sage)' : '#c00', marginTop: 6, textAlign: 'right' }}>
          {summaryLength} / 200 {!summaryValid && `(cần thêm ${200 - summaryLength})`}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Trích đoạn (không bắt buộc)</label>
        <textarea
          className="form-textarea"
          style={{ minHeight: 100 }}
          value={form.excerpt}
          onChange={(e) => setField('excerpt', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Ảnh bìa (URL, không bắt buộc)</label>
        <input className="form-input" value={form.cover_image} onChange={(e) => setField('cover_image', e.target.value)} placeholder="https://…" />
      </div>

      <div className="form-group">
        <label className="form-label">Tag (cách nhau bởi dấu phẩy)</label>
        <input className="form-input" value={form.tags} onChange={(e) => setField('tags', e.target.value)} placeholder="phiêu lưu, tuổi thơ, …" />
      </div>

      <div className="form-group">
        <label className="form-label">Liên kết pháp lý / nguồn</label>
        {form.legal_links.map((link, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <input
              className="form-input"
              placeholder="Tên nguồn"
              value={link.name}
              onChange={(e) => setLink(i, 'name', e.target.value)}
              style={{ flex: '1 1 160px' }}
            />
            <input
              className="form-input"
              placeholder="https://…"
              value={link.url}
              onChange={(e) => setLink(i, 'url', e.target.value)}
              style={{ flex: '2 1 220px' }}
            />
            {form.legal_links.length > 1 && (
              <button type="button" className="btn btn-outline" onClick={() => removeLink(i)} aria-label="Xóa liên kết này">
                <X size={14} />
              </button>
            )}
          </div>
        ))}
        <button type="button" className="btn btn-outline" onClick={addLink} style={{ marginTop: 4 }}>
          <Plus size={14} /> Thêm liên kết
        </button>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: 14 }}>
        <input type="checkbox" checked={form.featured} onChange={(e) => setField('featured', e.target.checked)} />
        Sách nổi bật
      </label>

      <div style={{ display: 'flex', gap: 12 }}>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Đang lưu…' : isEdit ? 'Lưu thay đổi' : 'Thêm sách'}
        </button>
        <button type="button" className="btn btn-outline" disabled={saving} onClick={onCancel}>Hủy</button>
      </div>
    </form>
  );
}
