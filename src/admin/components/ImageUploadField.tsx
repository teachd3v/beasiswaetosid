import { useRef, useState } from 'react';
import { uploadAdminImage } from '../../services/adminApi';
import type { MediaFolder } from '../../services/adminApi';

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

  const resolvedPreview =
    previewUrl || (valueKey.startsWith('/') || valueKey.startsWith('http') ? valueKey : valueKey ? `/api/media/${valueKey}` : '');

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
              {uploading ? 'Mengompres & Unggah...' : 'Pilih & Unggah ke R2'}
            </button>
            <span className="text-[11px] text-neutral-500">
              Auto-WebP · maks 1600px
            </span>
          </div>

          <input
            type="text"
            value={valueKey}
            onChange={(e) =>
              onChange({
                key: e.target.value,
                url: e.target.value.startsWith('/') || e.target.value.startsWith('http')
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
    </div>
  );
}
