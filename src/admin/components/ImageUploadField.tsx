import { useMemo, useRef, useState } from 'react';
import { listMediaLibrary, uploadAdminImage } from '../../services/adminApi';
import type { MediaFolder, MediaLibraryItem } from '../../services/adminApi';

interface ImageUploadFieldProps {
  readonly label: string;
  readonly folder: MediaFolder;
  readonly valueKey: string;
  readonly previewUrl: string;
  readonly onChange: (result: {
    key: string;
    url: string;
    width?: number;
    height?: number;
  }) => void;
}

export function ImageUploadField({
  label,
  folder,
  valueKey,
  previewUrl,
  onChange,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [galleryItems, setGalleryItems] = useState<MediaLibraryItem[]>([]);
  const [galleryQuery, setGalleryQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'r2' | 'showcase'>('all');

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const uploaded = await uploadAdminImage(file, folder);
      onChange(uploaded);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengunggah gambar');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const openGallery = async () => {
    setGalleryOpen(true);
    setGalleryLoading(true);
    setGalleryError(null);
    try {
      const items = await listMediaLibrary();
      setGalleryItems(items);
    } catch (err) {
      setGalleryError(err instanceof Error ? err.message : 'Gagal memuat galeri media');
    } finally {
      setGalleryLoading(false);
    }
  };

  const filteredGallery = useMemo(() => {
    const q = galleryQuery.trim().toLowerCase();
    return galleryItems.filter((item) => {
      if (sourceFilter !== 'all' && item.source !== sourceFilter) return false;
      if (!q) return true;
      return (
        item.label.toLowerCase().includes(q) ||
        item.key.toLowerCase().includes(q) ||
        item.folder.toLowerCase().includes(q)
      );
    });
  }, [galleryItems, galleryQuery, sourceFilter]);

  const resolvedPreview =
    previewUrl ||
    (valueKey.startsWith('/') || valueKey.startsWith('http')
      ? valueKey
      : valueKey
        ? `/api/media/${valueKey}`
        : '');

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-neutral-700">{label}</label>
      <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3 sm:flex-row sm:items-center">
        <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-200">
          {resolvedPreview ? (
            <img
              src={resolvedPreview}
              alt="Preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[11px] text-neutral-500">
              Belum ada foto
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/webp,image/jpeg,image/png"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="rounded-lg bg-[var(--brand-green-dark)] px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {uploading ? 'Mengompres & Unggah...' : 'Unggah dari Komputer'}
            </button>
            <button
              type="button"
              onClick={() => void openGallery()}
              className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-100"
            >
              Pilih dari Galeri
            </button>
          </div>

          <input
            type="text"
            value={valueKey}
            onChange={(e) =>
              onChange({
                key: e.target.value,
                url:
                  e.target.value.startsWith('/') || e.target.value.startsWith('http')
                    ? e.target.value
                    : e.target.value
                      ? `/api/media/${e.target.value}`
                      : '',
              })
            }
            placeholder="R2 key atau path gambar, misal showcase/123.webp"
            className="w-full rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-xs text-neutral-800 focus:border-[var(--brand-green)] focus:outline-none"
          />

          {error && <p className="text-xs font-medium text-red-600">{error}</p>}
        </div>
      </div>

      {galleryOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="flex max-h-[85dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 px-5 py-3.5">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Pilih Gambar dari Galeri Media
                </h3>
                <p className="text-[11px] text-neutral-500">
                  Menampilkan foto yang sudah diunggah ke R2 dan koleksi Media Showcase.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setGalleryOpen(false)}
                className="rounded-lg border border-neutral-200 px-2.5 py-1 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
              >
                Tutup
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 bg-neutral-50 px-5 py-2.5">
              <div className="flex gap-1.5">
                {(
                  [
                    ['all', 'Semua'],
                    ['r2', 'Upload R2'],
                    ['showcase', 'Media Showcase'],
                  ] as const
                ).map(([val, text]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setSourceFilter(val)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      sourceFilter === val
                        ? 'bg-[var(--brand-green-dark)] text-white'
                        : 'border border-neutral-200 bg-white text-neutral-600'
                    }`}
                  >
                    {text}
                  </button>
                ))}
              </div>
              <input
                type="search"
                value={galleryQuery}
                onChange={(e) => setGalleryQuery(e.target.value)}
                placeholder="Cari nama file / judul..."
                className="rounded-lg border border-neutral-300 bg-white px-2.5 py-1 text-xs"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {galleryLoading ? (
                <p className="py-10 text-center text-xs text-neutral-500">Memuat galeri...</p>
              ) : galleryError ? (
                <p className="py-10 text-center text-xs text-red-600">{galleryError}</p>
              ) : filteredGallery.length === 0 ? (
                <p className="py-10 text-center text-xs text-neutral-500">
                  Belum ada foto yang cocok.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5">
                  {filteredGallery.map((item) => {
                    const selected = item.key === valueKey;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                          onChange({
                            key: item.key,
                            url: item.url,
                            width: item.width,
                            height: item.height,
                          });
                          setGalleryOpen(false);
                        }}
                        className={`group flex flex-col overflow-hidden rounded-xl border text-left transition-all ${
                          selected
                            ? 'border-[var(--brand-green-dark)] ring-2 ring-[var(--brand-green)]/30'
                            : 'border-neutral-200 hover:border-[var(--brand-green)]'
                        }`}
                      >
                        <div className="relative aspect-square w-full bg-neutral-100">
                          <img
                            src={item.url}
                            alt={item.label}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                          <span className="absolute left-1 top-1 rounded bg-black/65 px-1.5 py-0.5 text-[8.5px] font-semibold uppercase text-white">
                            {item.source === 'r2' ? item.folder : 'showcase'}
                          </span>
                        </div>
                        <div className="p-1.5">
                          <p
                            className="truncate text-[10px] font-semibold text-neutral-800"
                            title={item.label}
                          >
                            {item.label}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
