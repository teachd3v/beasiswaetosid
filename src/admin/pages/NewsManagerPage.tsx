import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminNewsApi } from '../../services/adminApi';
import type { AdminNewsItem } from '../../services/adminApi';
import { ImageUploadField } from '../components/ImageUploadField';

type NewsCategory = 'Program' | 'Prestasi' | 'Aktivitas & Monev';

const CATEGORIES: readonly NewsCategory[] = ['Program', 'Prestasi', 'Aktivitas & Monev'];

interface NewsFormState {
  id?: string;
  slug: string;
  title: string;
  category: NewsCategory;
  dateLabel: string;
  publishedAt: string;
  location: string;
  coverR2Key: string;
  coverUrl: string;
  excerpt: string;
  contentText: string;
  status: 'draft' | 'published';
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 160);
}

export function NewsManagerPage() {
  const [items, setItems] = useState<AdminNewsItem[]>([]);
  const [openCategories, setOpenCategories] = useState<ReadonlySet<NewsCategory>>(
    () => new Set(CATEGORIES),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<NewsFormState | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setItems(await adminNewsApi.list());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data berita');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void adminNewsApi
      .list()
      .then((data) => {
        if (active) {
          setItems(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Gagal memuat data berita');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const groupedByCategory = useMemo(
    () =>
      CATEGORIES.map((category) => ({
        category,
        articles: items.filter((item) => item.category === category),
      })),
    [items],
  );

  const allOpen = CATEGORIES.every((c) => openCategories.has(c));

  const toggleCategory = (category: NewsCategory) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const toggleAll = () => {
    setOpenCategories(allOpen ? new Set() : new Set(CATEGORIES));
  };

  const openCreate = (presetCategory: NewsCategory = 'Program') => {
    const today = new Date().toISOString().slice(0, 10);
    setForm({
      slug: '',
      title: '',
      category: presetCategory,
      dateLabel: new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date()),
      publishedAt: today,
      location: '',
      coverR2Key: '',
      coverUrl: '',
      excerpt: '',
      contentText: '',
      status: 'draft',
    });
  };

  const openEdit = (item: AdminNewsItem) => {
    setForm({
      id: item.id,
      slug: item.slug,
      title: item.title,
      category: item.category,
      dateLabel: item.dateLabel,
      publishedAt: item.publishedAt,
      location: item.location,
      coverR2Key: item.coverR2Key,
      coverUrl: item.coverUrl,
      excerpt: item.excerpt,
      contentText: item.content.join('\n\n'),
      status: item.status,
    });
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setError(null);
    try {
      const paragraphs = form.contentText
        .split(/\n+/)
        .map((p) => p.trim())
        .filter(Boolean);

      const payload = {
        slug: form.slug || slugify(form.title),
        title: form.title,
        category: form.category,
        dateLabel: form.dateLabel,
        publishedAt: form.publishedAt,
        location: form.location,
        coverR2Key: form.coverR2Key,
        excerpt: form.excerpt,
        content: paragraphs,
        status: form.status,
      };
      if (form.id) {
        await adminNewsApi.update(form.id, payload);
      } else {
        await adminNewsApi.create(payload);
      }
      setForm(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan berita');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: AdminNewsItem) => {
    if (!window.confirm(`Hapus berita "${item.title}"?`)) return;
    try {
      await adminNewsApi.remove(item.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus berita');
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-neutral-900">Manajemen Berita & Artikel</h1>
          <p className="text-xs text-neutral-500">Total {items.length} artikel di database D1.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleAll}
            className="rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            {allOpen ? 'Tutup Semua' : 'Buka Semua'}
          </button>
          <button
            type="button"
            onClick={() => openCreate()}
            className="rounded-xl bg-[var(--brand-green-dark)] px-3.5 py-1.5 text-xs font-semibold text-white hover:opacity-95"
          >
            + Tulis Berita Baru
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="py-10 text-center text-sm text-neutral-500">Memuat berita...</p>
      ) : (
        <div className="space-y-3">
          {groupedByCategory.map(({ category, articles }) => {
            const isOpen = openCategories.has(category);
            return (
              <div
                key={category}
                className="overflow-hidden rounded-xl border border-neutral-200 bg-white"
              >
                <button
                  type="button"
                  onClick={() => toggleCategory(category)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-50"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-bold text-neutral-900">{category}</span>
                    <span className="rounded-full bg-[var(--brand-mint)] px-2 py-0.5 text-[10px] font-semibold text-[var(--brand-green-dark)]">
                      {articles.length} Berita
                    </span>
                  </div>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`h-4 w-4 text-neutral-400 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  >
                    <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {isOpen && (
                  <div className="border-t border-neutral-100 bg-neutral-50/60 p-3.5">
                    {articles.length === 0 ? (
                      <p className="py-4 text-center text-xs text-neutral-400">
                        Belum ada berita pada kategori {category}.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                        {articles.map((item) => (
                          <article
                            key={item.id}
                            className="flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xs"
                          >
                            <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-neutral-100">
                              {item.coverUrl ? (
                                <img
                                  src={item.coverUrl}
                                  alt={item.title}
                                  loading="lazy"
                                  className="absolute inset-0 h-full w-full object-cover object-center"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 text-xs font-medium text-neutral-400">
                                  Belum ada cover
                                </div>
                              )}
                              <span
                                className={`absolute left-2 top-2 z-10 rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-xs ${
                                  item.status === 'published'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-amber-500 text-white'
                                }`}
                              >
                                {item.status === 'published' ? 'Published' : 'Draft'}
                              </span>
                            </div>

                            <div className="flex flex-1 flex-col justify-between p-3">
                              <div>
                                <p className="text-[10.5px] text-neutral-400">
                                  {item.dateLabel}
                                  {item.location ? ` · ${item.location}` : ''}
                                </p>
                                <h2 className="mt-1 line-clamp-2 text-sm font-bold text-neutral-900">
                                  {item.title}
                                </h2>
                                <p className="mt-1 line-clamp-2 text-xs text-neutral-500">
                                  {item.excerpt}
                                </p>
                              </div>

                              <div className="mt-3 flex gap-2 border-t border-neutral-100 pt-2.5">
                                <button
                                  type="button"
                                  onClick={() => openEdit(item)}
                                  className="flex-1 rounded-lg border border-neutral-200 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(item)}
                                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                                >
                                  Hapus
                                </button>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-base font-bold text-neutral-900">
              {form.id ? 'Edit Berita' : 'Tulis Berita Baru'}
            </h2>
            <form onSubmit={handleSave} className="mt-4 space-y-3">
              <ImageUploadField
                label="Gambar Cover Berita"
                folder="news"
                valueKey={form.coverR2Key}
                previewUrl={form.coverUrl}
                onChange={({ key, url }) =>
                  setForm((prev) => (prev ? { ...prev, coverR2Key: key, coverUrl: url } : prev))
                }
              />

              <div>
                <label className="block text-xs font-semibold text-neutral-700">Judul Berita</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => {
                    const nextTitle = e.target.value;
                    setForm((prev) =>
                      prev
                        ? {
                            ...prev,
                            title: nextTitle,
                            slug: prev.id ? prev.slug : slugify(nextTitle),
                          }
                        : prev,
                    );
                  }}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700">Slug URL</label>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700">Kategori</label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category: e.target.value as NewsCategory,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  >
                    <option value="Program">Program</option>
                    <option value="Prestasi">Prestasi</option>
                    <option value="Aktivitas & Monev">Aktivitas & Monev</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700">
                    Tanggal Publikasi
                  </label>
                  <input
                    type="date"
                    required
                    value={form.publishedAt}
                    onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700">
                    Label Tanggal Tampil
                  </label>
                  <input
                    type="text"
                    required
                    value={form.dateLabel}
                    onChange={(e) => setForm({ ...form, dateLabel: e.target.value })}
                    placeholder="18 Oktober 2026"
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700">Lokasi</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Bogor"
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700">
                  Ringkasan (Excerpt)
                </label>
                <textarea
                  rows={2}
                  required
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700">
                  Isi Berita (pisahkan antar paragraf dengan Enter)
                </label>
                <textarea
                  rows={6}
                  required
                  value={form.contentText}
                  onChange={(e) => setForm({ ...form, contentText: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700">Status</label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value as 'draft' | 'published' })
                  }
                  className="mt-1 w-48 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                >
                  <option value="draft">Draft (Belum Tayang)</option>
                  <option value="published">Published (Tayang)</option>
                </select>
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
