import { useCallback, useEffect, useMemo, useState } from 'react';
import { etoserApi, listCampuses } from '../../services/adminApi';
import type { AdminEtoserItem, CampusOption } from '../../services/adminApi';
import { ImageUploadField } from '../components/ImageUploadField';

interface EtoserFormState {
  id?: string;
  name: string;
  campusId: string;
  major: string;
  batch: string;
  photoR2Key: string;
  photoUrl: string;
  interest: string;
  projectTitle: string;
  bio: string;
  achievementsText: string;
  sortOrder: number;
  isPublished: boolean;
}

export function EtoserManagerPage() {
  const [items, setItems] = useState<AdminEtoserItem[]>([]);
  const [campuses, setCampuses] = useState<CampusOption[]>([]);
  const [query, setQuery] = useState('');
  const [openCampuses, setOpenCampuses] = useState<ReadonlySet<string>>(() => new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<EtoserFormState | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [list, campusList] = await Promise.all([etoserApi.list(), listCampuses()]);
      setItems(list);
      setCampuses(campusList);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data etoser');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void Promise.all([etoserApi.list(), listCampuses()])
      .then(([list, campusList]) => {
        if (active) {
          setItems(list);
          setCampuses(campusList);
          if (campusList[0]?.id) {
            setOpenCampuses(new Set([campusList[0].id]));
          }
          setError(null);
        }
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Gagal memuat data etoser');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const normalizedQuery = query.trim().toLowerCase();

  const groupedByCampus = useMemo(() => {
    const filtered = items.filter((item) => {
      if (!normalizedQuery) return true;
      return (
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.campusShort.toLowerCase().includes(normalizedQuery) ||
        item.major.toLowerCase().includes(normalizedQuery)
      );
    });

    const campusLookup = new Map(campuses.map((c) => [c.id, c]));
    const groups = new Map<
      string,
      { campusId: string; shortName: string; fullName: string; logoUrl: string; members: AdminEtoserItem[] }
    >();

    for (const item of filtered) {
      const c = campusLookup.get(item.campusId);
      let g = groups.get(item.campusId);
      if (!g) {
        g = {
          campusId: item.campusId,
          shortName: c?.shortName ?? item.campusShort,
          fullName: c?.fullName ?? item.campusShort,
          logoUrl: c?.logoUrl ?? '',
          members: [],
        };
        groups.set(item.campusId, g);
      }
      g.members.push(item);
    }

    return Array.from(groups.values());
  }, [items, campuses, normalizedQuery]);

  const allOpen =
    groupedByCampus.length > 0 &&
    groupedByCampus.every((g) => openCampuses.has(g.campusId));

  const toggleCampus = (campusId: string) => {
    setOpenCampuses((prev) => {
      const next = new Set(prev);
      if (next.has(campusId)) next.delete(campusId);
      else next.add(campusId);
      return next;
    });
  };

  const toggleAll = () => {
    if (allOpen) {
      setOpenCampuses(new Set());
    } else {
      setOpenCampuses(new Set(groupedByCampus.map((g) => g.campusId)));
    }
  };

  const openCreate = (presetCampusId?: string) => {
    setForm({
      name: '',
      campusId: presetCampusId ?? campuses[0]?.id ?? 'usk',
      major: '',
      batch: 'Angkatan 2024',
      photoR2Key: '',
      photoUrl: '',
      interest: '',
      projectTitle: '',
      bio: '',
      achievementsText: '',
      sortOrder: items.length + 1,
      isPublished: true,
    });
  };

  const openEdit = (item: AdminEtoserItem) => {
    setForm({
      id: item.id,
      name: item.name,
      campusId: item.campusId,
      major: item.major,
      batch: item.batch,
      photoR2Key: item.photoR2Key,
      photoUrl: item.photoUrl,
      interest: item.interest,
      projectTitle: item.projectTitle,
      bio: item.bio,
      achievementsText: item.achievements.join('\n'),
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
        campusId: form.campusId,
        major: form.major,
        batch: form.batch,
        photoR2Key: form.photoR2Key,
        interest: form.interest,
        projectTitle: form.projectTitle,
        bio: form.bio,
        achievements: form.achievementsText
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean),
        sortOrder: Number(form.sortOrder) || 0,
        isPublished: form.isPublished,
      };
      if (form.id) {
        await etoserApi.update(form.id, payload);
      } else {
        await etoserApi.create(payload);
      }
      setForm(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan profil etoser');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: AdminEtoserItem) => {
    if (!window.confirm(`Hapus profil Etoser "${item.name}"?`)) return;
    try {
      await etoserApi.remove(item.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus etoser');
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-neutral-900">Data Profil Etoser</h1>
          <p className="text-xs text-neutral-500">
            Total {items.length} profil Etoser pada {groupedByCampus.length} kampus mitra.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama / kampus / jurusan..."
            className="rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-xs"
          />
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
            + Tambah Etoser
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="py-10 text-center text-sm text-neutral-500">Memuat profil etoser...</p>
      ) : (
        <div className="grid grid-cols-1 items-start gap-3 md:grid-cols-2 xl:grid-cols-3">
          {groupedByCampus.map((group) => {
            const isOpen = normalizedQuery.length > 0 || openCampuses.has(group.campusId);
            return (
              <div
                key={group.campusId}
                className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => toggleCampus(group.campusId)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-2.5 px-3.5 py-2.5 text-left transition-colors hover:bg-neutral-50"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    {group.logoUrl && (
                      <img
                        src={group.logoUrl}
                        alt={group.shortName}
                        className="h-6 w-6 shrink-0 object-contain"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-xs font-bold text-neutral-900">
                          {group.shortName}
                        </span>
                        <span className="shrink-0 rounded-full bg-[var(--brand-mint)] px-1.5 py-0.5 text-[9.5px] font-semibold text-[var(--brand-green-dark)]">
                          {group.members.length}
                        </span>
                      </div>
                      <p className="truncate text-[10.5px] text-neutral-500">{group.fullName}</p>
                    </div>
                  </div>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  >
                    <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {isOpen && (
                  <div className="border-t border-neutral-100 bg-neutral-50/60 p-2">
                    <div className="grid grid-cols-3 gap-1.5">
                      {group.members.map((item) => (
                        <article
                          key={item.id}
                          className="flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white"
                        >
                          <div className="relative aspect-square bg-neutral-100">
                            <img
                              src={item.photoUrl}
                              alt={item.name}
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                            {!item.isPublished && (
                              <span className="absolute left-1 top-1 rounded-full bg-neutral-800/85 px-1 py-0.5 text-[8px] font-semibold text-white">
                                Draft
                              </span>
                            )}
                          </div>
                          <div className="flex flex-1 flex-col justify-between p-1.5">
                            <div>
                              <p
                                className="truncate text-[10px] font-bold leading-tight text-neutral-900"
                                title={item.name}
                              >
                                {item.name}
                              </p>
                              <p
                                className="truncate text-[9px] text-neutral-500"
                                title={item.major}
                              >
                                {item.major}
                              </p>
                            </div>
                            <div className="mt-1.5 flex gap-1">
                              <button
                                type="button"
                                onClick={() => openEdit(item)}
                                className="flex-1 rounded border border-neutral-200 py-0.5 text-[9px] font-semibold text-neutral-700 hover:bg-neutral-50"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(item)}
                                className="rounded border border-red-200 px-1.5 py-0.5 text-[9px] font-semibold text-red-600 hover:bg-red-50"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-base font-bold text-neutral-900">
              {form.id ? 'Edit Profil Etoser' : 'Tambah Profil Etoser'}
            </h2>
            <form onSubmit={handleSave} className="mt-4 space-y-3">
              <ImageUploadField
                label="Foto Etoser"
                folder="etoser"
                valueKey={form.photoR2Key}
                previewUrl={form.photoUrl}
                onChange={({ key, url }) =>
                  setForm((prev) => (prev ? { ...prev, photoR2Key: key, photoUrl: url } : prev))
                }
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700">Kampus Mitra</label>
                  <select
                    value={form.campusId}
                    onChange={(e) => setForm({ ...form, campusId: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  >
                    {campuses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.shortName} — {c.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700">Jurusan</label>
                  <input
                    type="text"
                    required
                    value={form.major}
                    onChange={(e) => setForm({ ...form, major: e.target.value })}
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
                <div>
                  <label className="block text-xs font-semibold text-neutral-700">Bidang Minat</label>
                  <input
                    type="text"
                    required
                    value={form.interest}
                    onChange={(e) => setForm({ ...form, interest: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700">
                  Judul Proyek Sosial
                </label>
                <input
                  type="text"
                  required
                  value={form.projectTitle}
                  onChange={(e) => setForm({ ...form, projectTitle: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700">Bio Singkat</label>
                <textarea
                  rows={3}
                  required
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700">
                  Prestasi (1 baris = 1 poin)
                </label>
                <textarea
                  rows={3}
                  value={form.achievementsText}
                  onChange={(e) => setForm({ ...form, achievementsText: e.target.value })}
                  placeholder="Juara 1 Karya Tulis Ilmiah&#10;Mentor Kuliah Tak Gentar"
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
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
