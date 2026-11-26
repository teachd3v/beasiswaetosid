import { useCallback, useEffect, useState } from 'react';
import { listCampuses, teamApi } from '../../services/adminApi';
import type { AdminTeamMemberItem, CampusOption } from '../../services/adminApi';
import { ImageUploadField } from '../components/ImageUploadField';

type GroupFilter = 'all' | 'department_head' | 'core_program' | 'regional_facilitator';

interface TeamFormState {
  id?: string;
  groupType: 'department_head' | 'core_program' | 'regional_facilitator';
  campusId: string;
  name: string;
  role: string;
  photoR2Key: string;
  photoUrl: string;
  sortOrder: number;
  isPublished: boolean;
}

const GROUP_LABELS: Record<AdminTeamMemberItem['groupType'], string> = {
  department_head: 'Ketua Departemen',
  core_program: 'Tim Inti Program',
  regional_facilitator: 'Fasilitator Daerah',
};

export function TeamManagerPage() {
  const [items, setItems] = useState<AdminTeamMemberItem[]>([]);
  const [campuses, setCampuses] = useState<CampusOption[]>([]);
  const [groupFilter, setGroupFilter] = useState<GroupFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<TeamFormState | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [list, campusList] = await Promise.all([teamApi.list(), listCampuses()]);
      setItems(list);
      setCampuses(campusList);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data tim');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void Promise.all([teamApi.list(), listCampuses()])
      .then(([list, campusList]) => {
        if (active) {
          setItems(list);
          setCampuses(campusList);
          setError(null);
        }
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Gagal memuat data tim');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered =
    groupFilter === 'all' ? items : items.filter((item) => item.groupType === groupFilter);

  const openCreate = () => {
    setForm({
      groupType: 'regional_facilitator',
      campusId: campuses[0]?.id ?? 'usk',
      name: '',
      role: 'PIC Fasilitator Daerah',
      photoR2Key: '',
      photoUrl: '',
      sortOrder: 1,
      isPublished: true,
    });
  };

  const openEdit = (item: AdminTeamMemberItem) => {
    setForm({
      id: item.id,
      groupType: item.groupType,
      campusId: item.campusId || campuses[0]?.id || '',
      name: item.name,
      role: item.role,
      photoR2Key: item.photoR2Key,
      photoUrl: item.photoUrl,
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
        groupType: form.groupType,
        campusId: form.groupType === 'regional_facilitator' ? form.campusId : null,
        name: form.name,
        role: form.role,
        photoR2Key: form.photoR2Key,
        sortOrder: Number(form.sortOrder) || 0,
        isPublished: form.isPublished,
      };
      if (form.id) {
        await teamApi.update(form.id, payload);
      } else {
        await teamApi.create(payload);
      }
      setForm(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan anggota tim');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: AdminTeamMemberItem) => {
    if (!window.confirm(`Hapus "${item.name}" dari Tim Kami?`)) return;
    try {
      await teamApi.remove(item.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus anggota tim');
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-neutral-900">Tim Kami</h1>
          <p className="text-xs text-neutral-500">
            Ketua Departemen, Tim Inti Program, dan Fasilitator Daerah ({items.length} orang).
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-xl bg-[var(--brand-green-dark)] px-3.5 py-2 text-xs font-semibold text-white hover:opacity-95"
        >
          + Tambah Anggota
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(
          [
            ['all', 'Semua'],
            ['department_head', 'Ketua Departemen'],
            ['core_program', 'Tim Inti'],
            ['regional_facilitator', 'Fasilitator Daerah'],
          ] as const
        ).map(([val, label]) => (
          <button
            key={val}
            type="button"
            onClick={() => setGroupFilter(val)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              groupFilter === val
                ? 'bg-neutral-900 text-white'
                : 'border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="py-10 text-center text-sm text-neutral-500">Memuat data tim...</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item) => (
            <article
              key={item.id}
              className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-3.5 shadow-2xs"
            >
              <div>
                <div className="flex items-center gap-3">
                  <img
                    src={item.photoUrl}
                    alt={item.name}
                    loading="lazy"
                    className="h-12 w-12 shrink-0 rounded-full bg-neutral-100 object-cover ring-2 ring-neutral-100"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-neutral-900" title={item.name}>
                      {item.name}
                    </p>
                    <p className="truncate text-xs text-neutral-500" title={item.role}>
                      {item.role}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-700">
                    {GROUP_LABELS[item.groupType]}
                  </span>
                  {item.campusShort && (
                    <span className="rounded-full bg-[var(--brand-mint)] px-2 py-0.5 text-[10px] font-semibold text-[var(--brand-green-dark)]">
                      {item.campusShort}
                    </span>
                  )}
                  {!item.isPublished && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                      Draft
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 flex gap-1.5 border-t border-neutral-100 pt-2.5">
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
            </article>
          ))}
        </div>
      )}

      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-base font-bold text-neutral-900">
              {form.id ? 'Edit Anggota Tim' : 'Tambah Anggota Tim'}
            </h2>
            <form onSubmit={handleSave} className="mt-4 space-y-3">
              <ImageUploadField
                label="Foto Anggota"
                folder="team"
                valueKey={form.photoR2Key}
                previewUrl={form.photoUrl}
                onChange={({ key, url }) =>
                  setForm((prev) => (prev ? { ...prev, photoR2Key: key, photoUrl: url } : prev))
                }
              />

              <div>
                <label className="block text-xs font-semibold text-neutral-700">Kelompok Struktur</label>
                <select
                  value={form.groupType}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      groupType: e.target.value as TeamFormState['groupType'],
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                >
                  <option value="department_head">Ketua Departemen</option>
                  <option value="core_program">Tim Inti Program</option>
                  <option value="regional_facilitator">Fasilitator Daerah</option>
                </select>
              </div>

              {form.groupType === 'regional_facilitator' && (
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
              )}

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
                <label className="block text-xs font-semibold text-neutral-700">Jabatan / Peran</label>
                <input
                  type="text"
                  required
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
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
