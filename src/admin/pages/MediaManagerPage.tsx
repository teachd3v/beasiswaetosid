import { useCallback, useEffect, useState } from 'react';
import { mediaApi } from '../../services/adminApi';
import type { AdminMediaItem } from '../../services/adminApi';
import { ImageUploadField } from '../components/ImageUploadField';

interface MediaFormState {
  id?: string;
  title: string;
  timestampLabel: string;
  alt: string;
  r2Key: string;
  previewUrl: string;
  width: number;
  height: number;
  sortOrder: number;
  isPublished: boolean;
}

const EMPTY_FORM: MediaFormState = {
  title: '',
  timestampLabel: 'Youth Inspiration Camp ETOS ID 2026',
  alt: '',
  r2Key: '',
  previewUrl: '',
  width: 1600,
  height: 900,
  sortOrder: 0,
  isPublished: true,
};

export function MediaManagerPage() {
  const [items, setItems] = useState<AdminMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<MediaFormState | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await mediaApi.list();
      setItems(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data media');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void mediaApi
      .list()
      .then((data) => {
        if (active) {
          setItems(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Gagal memuat data media');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, sortOrder: items.length + 1 });
  };

  const openEdit = (item: AdminMediaItem) => {
    setForm({
      id: item.id,
      title: item.title,
      timestampLabel: item.timestampLabel,
      alt: item.alt,
      r2Key: item.r2Key,
      previewUrl: item.url,
      width: item.width,
      height: item.height,
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
        title: form.title,
        timestampLabel: form.timestampLabel,
        alt: form.alt || form.title,
        r2Key: form.r2Key,
        width: Number(form.width) || 1600,
        height: Number(form.height) || 900,
        sortOrder: Number(form.sortOrder) || 0,
        isPublished: form.isPublished,
      };
      if (form.id) {
        await mediaApi.update(form.id, payload);
      } else {
        await mediaApi.create(payload);
      }
      setForm(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan media');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: AdminMediaItem) => {
    if (!window.confirm(`Hapus foto "${item.title}"?`)) return;
    try {
      await mediaApi.remove(item.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus media');
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-neutral-900">Media Foto Showcase (3D Globe)</h1>
          <p className="text-xs text-neutral-500">
            Total {items.length} foto dokumentasi tersimpan di D1 + R2.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-xl bg-[var(--brand-green-dark)] px-3.5 py-2 text-xs font-semibold text-white hover:opacity-95"
        >
          + Tambah Foto
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="py-10 text-center text-sm text-neutral-500">Memuat media...</p>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.map((item) => (
            <article
              key={item.id}
              className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xs"
            >
              <div className="relative aspect-4/3 bg-neutral-100">
                <img
                  src={item.url}
                  alt={item.alt}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <span
                  className={`absolute left-1.5 top-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
                    item.isPublished
                      ? 'bg-emerald-600/95 text-white'
                      : 'bg-neutral-800/85 text-white'
                  }`}
                >
                  #{item.sortOrder}
                </span>
              </div>
              <div className="flex flex-1 flex-col justify-between p-2">
                <div>
                  <h2 className="truncate text-[11px] font-bold text-neutral-900" title={item.title}>
                    {item.title}
                  </h2>
                  <p className="truncate text-[10px] text-neutral-500" title={item.timestampLabel}>
                    {item.timestampLabel}
                  </p>
                </div>
                <div className="mt-2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="flex-1 rounded-md border border-neutral-200 py-1 text-[10px] font-semibold text-neutral-700 hover:bg-neutral-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="rounded-md border border-red-200 px-2 py-1 text-[10px] font-semibold text-red-600 hover:bg-red-50"
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
              {form.id ? 'Edit Media Foto' : 'Tambah Media Foto'}
            </h2>
            <form onSubmit={handleSave} className="mt-4 space-y-3">
              <ImageUploadField
                label="Gambar Showcase"
                folder="showcase"
                valueKey={form.r2Key}
                previewUrl={form.previewUrl}
                onChange={({ key, url, width, height }) =>
                  setForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          r2Key: key,
                          previewUrl: url,
                          width: width ?? prev.width,
                          height: height ?? prev.height,
                        }
                      : prev,
                  )
                }
              />

              <div>
                <label className="block text-xs font-semibold text-neutral-700">Judul</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700">
                  Label Kegiatan / Timestamp
                </label>
                <input
                  type="text"
                  required
                  value={form.timestampLabel}
                  onChange={(e) => setForm({ ...form, timestampLabel: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700">
                  Alt Text (Aksesibilitas)
                </label>
                <input
                  type="text"
                  required
                  value={form.alt}
                  onChange={(e) => setForm({ ...form, alt: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700">Width</label>
                  <input
                    type="number"
                    value={form.width}
                    onChange={(e) => setForm({ ...form, width: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700">Height</label>
                  <input
                    type="number"
                    value={form.height}
                    onChange={(e) => setForm({ ...form, height: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700">Urutan</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                />
                Tampilkan di halaman publik (Published)
              </label>

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
