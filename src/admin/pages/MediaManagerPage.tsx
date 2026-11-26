import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  deleteMediaLibraryObject,
  listMediaLibrary,
  uploadAdminImage,
} from '../../services/adminApi';
import type { MediaFolder, MediaLibraryItem } from '../../services/adminApi';

const FOLDER_OPTIONS: readonly { id: 'all' | MediaFolder; label: string }[] = [
  { id: 'all', label: 'Semua' },
  { id: 'showcase', label: 'Showcase' },
  { id: 'news', label: 'Berita' },
  { id: 'etoser', label: 'Etoser' },
  { id: 'testimonials', label: 'Testimoni' },
  { id: 'team', label: 'Tim Kami' },
];

export function MediaManagerPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [items, setItems] = useState<MediaLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadFolder, setUploadFolder] = useState<MediaFolder>('showcase');
  const [folderFilter, setFolderFilter] = useState<'all' | MediaFolder>('all');
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<MediaLibraryItem | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await listMediaLibrary();
      setItems(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat galeri media');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void listMediaLibrary()
      .then((data) => {
        if (active) {
          setItems(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Gagal memuat galeri media');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (folderFilter !== 'all' && item.folder !== folderFilter) return false;
      if (!q) return true;
      return (
        item.label.toLowerCase().includes(q) ||
        item.key.toLowerCase().includes(q) ||
        item.folder.toLowerCase().includes(q)
      );
    });
  }, [items, folderFilter, query]);

  const handleUploadFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        await uploadAdminImage(file, uploadFolder);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengunggah gambar ke R2');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleCopy = async (item: MediaLibraryItem) => {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopiedKey(item.key);
      window.setTimeout(() => setCopiedKey(null), 1500);
    } catch {
      // ignore clipboard errors
    }
  };

  const handleDelete = async (item: MediaLibraryItem) => {
    if (!window.confirm(`Hapus file "${item.label}" permanen dari bucket R2?`)) return;
    setError(null);
    try {
      await deleteMediaLibraryObject(item.key);
      if (previewItem?.key === item.key) setPreviewItem(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus file R2');
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-neutral-900">Galeri Media Foto (R2 Storage)</h1>
          <p className="text-xs text-neutral-500">
            Pustaka semua file gambar ({items.length} file). Bisa dipilih ulang di Hero 3D, Berita,
            Etoser, Testimoni, dan Tim Kami.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={uploadFolder}
            onChange={(e) => setUploadFolder(e.target.value as MediaFolder)}
            aria-label="Folder tujuan upload"
            className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-700"
          >
            <option value="showcase">Folder: showcase</option>
            <option value="news">Folder: news</option>
            <option value="etoser">Folder: etoser</option>
            <option value="testimonials">Folder: testimonials</option>
            <option value="team">Folder: team</option>
          </select>

          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/webp,image/jpeg,image/png"
            onChange={handleUploadFiles}
            className="hidden"
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="rounded-xl bg-[var(--brand-green-dark)] px-3.5 py-2 text-xs font-semibold text-white hover:opacity-95 disabled:opacity-50"
          >
            {uploading ? 'Mengompres & Unggah...' : '+ Unggah Foto ke Galeri'}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {FOLDER_OPTIONS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFolderFilter(f.id)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                folderFilter === f.id
                  ? 'bg-neutral-900 text-white'
                  : 'border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari nama file / folder..."
          className="rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-xs"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="py-10 text-center text-sm text-neutral-500">Memuat galeri media...</p>
      ) : filtered.length === 0 ? (
        <p className="py-10 text-center text-xs text-neutral-500">
          Tidak ada gambar pada filter ini.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filtered.map((item) => (
            <article
              key={item.key}
              className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xs"
            >
              <button
                type="button"
                onClick={() => setPreviewItem(item)}
                className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-neutral-100 text-left"
              >
                <img
                  src={item.url}
                  alt={item.label}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover object-center transition-transform hover:scale-105"
                />
                <span className="absolute left-1.5 top-1.5 z-10 rounded-full bg-black/70 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-white">
                  {item.folder}
                </span>
              </button>
              <div className="flex flex-1 flex-col justify-between p-2">
                <p className="truncate text-[10.5px] font-semibold text-neutral-800" title={item.label}>
                  {item.label}
                </p>
                <div className="mt-2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => void handleCopy(item)}
                    className="flex-1 rounded-md border border-neutral-200 py-1 text-[10px] font-semibold text-neutral-700 hover:bg-neutral-50"
                  >
                    {copiedKey === item.key ? 'Disalin!' : 'Salin URL'}
                  </button>
                  {item.source === 'r2' && (
                    <button
                      type="button"
                      onClick={() => void handleDelete(item)}
                      className="rounded-md border border-red-200 px-2 py-1 text-[10px] font-semibold text-red-600 hover:bg-red-50"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {previewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="max-h-[90dvh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-neutral-900">{previewItem.label}</p>
                <p className="truncate text-[11px] text-neutral-500">{previewItem.key}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="rounded-lg border border-neutral-200 px-2.5 py-1 text-xs font-semibold text-neutral-600"
              >
                Tutup
              </button>
            </div>
            <div className="flex max-h-[65dvh] items-center justify-center bg-neutral-100 p-4">
              <img
                src={previewItem.url}
                alt={previewItem.label}
                className="max-h-[60dvh] max-w-full rounded-lg object-contain"
              />
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-neutral-200 px-4 py-3">
              <code className="truncate text-[11px] text-neutral-600">{previewItem.url}</code>
              <button
                type="button"
                onClick={() => void handleCopy(previewItem)}
                className="shrink-0 rounded-lg bg-[var(--brand-green-dark)] px-3 py-1.5 text-xs font-semibold text-white"
              >
                {copiedKey === previewItem.key ? 'URL Disalin!' : 'Salin URL'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
