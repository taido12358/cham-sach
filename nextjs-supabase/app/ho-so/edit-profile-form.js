'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit3 } from 'lucide-react';
import { createClient } from '../../lib/supabase-browser';
import { useToast } from '../toast-context';

export default function EditProfileForm({ profile }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button type="button" className="btn btn-outline" onClick={() => setOpen(true)} style={{ marginTop: 16 }}>
        <Edit3 size={16} /> Chỉnh sửa hồ sơ
      </button>
    );
  }

  return <EditForm profile={profile} onClose={() => setOpen(false)} />;
}

function EditForm({ profile, onClose }) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState({
    name: profile?.name || '',
    class_name: profile?.class_name || '',
    bio: profile?.bio || ''
  });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .update({ name: form.name, class_name: form.class_name, bio: form.bio })
      .eq('id', profile.id);

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success('Đã cập nhật hồ sơ');
    onClose?.();
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="card" style={{ marginTop: 24, maxWidth: 480 }}>
      <div className="form-group">
        <label className="form-label">Họ và tên</label>
        <input className="form-input" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </div>
      <div className="form-group">
        <label className="form-label">Lớp</label>
        <input className="form-input" value={form.class_name}
          onChange={(e) => setForm({ ...form, class_name: e.target.value })} />
      </div>
      <div className="form-group">
        <label className="form-label">Giới thiệu bản thân</label>
        <textarea className="form-textarea" style={{ minHeight: 100, fontFamily: 'var(--font-sans)' }}
          value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} maxLength={500} />
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Đang lưu…' : 'Lưu thay đổi'}
        </button>
        <button type="button" className="btn btn-outline" onClick={onClose}>Hủy</button>
      </div>
    </form>
  );
}
