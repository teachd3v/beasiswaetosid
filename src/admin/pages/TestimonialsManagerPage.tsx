import { useCallback, useEffect, useState } from 'react';
import { testimonialApi } from '../../services/adminApi';
import type { AdminTestimonialItem } from '../../services/adminApi';
import { ImageUploadField } from '../components/ImageUploadField';

interface TestimonialFormState {
  id?: string;
  name: string;
  campus: string;
  batch: string;
  photoR2Key: string;
  photoUrl: string;
  testimonial: string;
  impact: string;
  sortOrder: number;
  isPublished: boolean;
}

export function TestimonialsManagerPage() {
  const [items, setItems] = useState<AdminTestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<TestimonialFormState | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setItems(await testimonialApi.list());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat testimoni');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void testimonialApi
      .list()
      .then((data) => {
        if (active) {
          setItems(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Gagal memuat testimoni');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const openCreate = () => {
    setForm({
      name: '',
      campus: '',
      batch: 'Angkatan 2020',
      photoR2Key: '',
      photoUrl: '',
      testimonial: '',
      impact: '',
      sortOrder: items.length + 1,
      isPublished: true,
    });
  };

  const openEdit = (item: AdminTestimonialItem) => {
    setForm({
      id: item.id,
      name: item.name,
      campus: item.campus,
      batch: item.batch,
      photoR2Key: item.photoR2Key,
      photoUrl: item.photoUrl,
      testimonial: item.testimonial,
      impact: item.impact,
      sortOrder: item.sortOrder,
      isPublished: item.isPublished,
    });
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        campus: form.campus,
        batch: form.batch,
        photoR2Key: form.photoR2Key,
        testimonial: form.testimonial,
        impact: form.impact,
        sortOrder: Number(form.sortOrder) || 0,
        isPublished: form.isPublished,
      };
      if (form.id) {
        await testimonialApi.update(form.id, payload);
      } else {
        await testimonialApi.create(payload);
      }
      setForm(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan testimoni');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: AdminTestimonialItem) => {
    if (!window.confirm(`Hapus testimoni dari "${item.name}"?`)) return;
    try {
      await testimonialApi.remove(item.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus testimoni');
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-neutral-900">Testimoni Alumni</h1>
          <p className="text-xs text-neutral-500">Total {items.length} testimoni alumni.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-xl bg-[var(--brand-green-dark)] px-3.5 py-2 text-xs font-semibold text-white hover:opacity-95"
        >
          + Tambah Testimoni
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="py-10 text-center text-sm text-neutral-500">Memuat testimoni...</p>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs"
            >
              <div>
                <div className="flex items-center gap-3">
                  <img
                    src={item.photoUrl}
                    alt={item.name}
                    className="h-12 w-12 shrink-0 rounded-xl bg-neutral-100 object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-neutral-900">{item.name}</p>
                    <p className="truncate text-xs text-neutral-500">
                      {item.campus} · {item.batch}
                    </p>
                  </div>
                </div>
                <p className="mt-3 line-clamp-4 text-xs leading-relaxed text-neutral-700">
                  “{item.testimonial}”
                </p>
                <p className="mt-2 text-xs font-semibold text-[var(--brand-green-dark)]">
                  {item.impact}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3">
                <span className="text-[11px] text-neutral-400">
                  {item.isPublished ? 'Published' : 'Draft'} · #{item.sortOrder}
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="rounded-lg border border-neutral-200 px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-base font-bold text-neutral-900">
              {form.id ? 'Edit Testimoni Alumni' : 'Tambah Testimoni Alumni'}
            </h2>
            <form onSubmit={handleSave} className="mt-4 space-y-3">
              <ImageUploadField
                label="Foto Alumni"
                folder="testimonials"
                valueKey={form.photoR2Key}
                previewUrl={form.photoUrl}
                onChange={({ key, url }) =>
                  setForm((prev) => (prev ? { ...prev, photoR2Key: key, photoUrl: url } : prev))
                }
              />

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700">Nama</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700">Kampus</label>
                  <input
                    type="text"
                    required
                    value={form.campus}
                    onChange={(e) => setForm({ ...form, campus: e.target.value })}
                    placeholder="UNAND"
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700">Angkatan</label>
                  <input
                    type="text"
                    required
                    value={form.batch}
                    onChange={(e) => setForm({ ...form, batch: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700">
                  Kiprah / Dampak Saat Ini
                </label>
                <input
                  type="text"
                  required
                  value={form.impact}
                  onChange={(e) => setForm({ ...form, impact: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700">Kutipan Testimoni</label>
                <textarea
                  rows={4}
                  required
                  value={form.testimonial}
                  onChange={(e) => setForm({ ...form, testimonial: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  />
                  Published
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-neutral-700">Urutan</span>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                    className="w-20 rounded-lg border border-neutral-300 px-2.5 py-1.5 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setForm(null)}
                  className="rounded-lg border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-[var(--brand-green-dark)] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
