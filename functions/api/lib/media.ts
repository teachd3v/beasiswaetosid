import type { Bindings } from '../types.ts';

export const ALLOWED_MEDIA_FOLDERS = new Set([
  'showcase',
  'etoser',
  'news',
  'testimonials',
  'team',
]);

export const ALLOWED_MIME_TYPES = new Map<string, string>([
  ['image/webp', 'webp'],
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
]);

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Cek apakah sebuah key/path adalah object key R2 yang kita kelola
 * (bukan path statis `/media/...` atau URL eksternal `https://...`).
 */
export function isManagedR2Key(value: string | null | undefined): value is string {
  if (!value) return false;
  if (value.startsWith('/') || value.startsWith('http://') || value.startsWith('https://')) {
    return false;
  }
  const firstSegment = value.split('/')[0];
  return ALLOWED_MEDIA_FOLDERS.has(firstSegment);
}

/**
 * Ubah r2_key (atau path statis lama) menjadi URL yang bisa langsung dipakai di <img src>.
 */
export function resolveMediaUrl(
  value: string | null | undefined,
  r2PublicUrl?: string,
): string {
  if (!value) return '';
  if (value.startsWith('/') || value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }
  if (r2PublicUrl) {
    return `${r2PublicUrl.replace(/\/+$/, '')}/${value}`;
  }
  return `/api/media/${value}`;
}

/**
 * Hapus objek dari R2 hanya jika sudah tidak direferensikan oleh tabel manapun di D1.
 * Aman untuk media yang dipakai bersama lewat Media Library Picker.
 */
export async function deleteManagedR2Object(
  env: Bindings,
  oldKey: string | null | undefined,
  newKey?: string | null,
): Promise<void> {
  if (!isManagedR2Key(oldKey)) return;
  if (newKey && oldKey === newKey) return;

  try {
    const refCheck = await env.DB.prepare(
      `SELECT
        (SELECT COUNT(*) FROM media_items WHERE r2_key = ?) +
        (SELECT COUNT(*) FROM etosers WHERE photo_r2_key = ?) +
        (SELECT COUNT(*) FROM news WHERE cover_r2_key = ?) +
        (SELECT COUNT(*) FROM testimonials WHERE photo_r2_key = ?) +
        (SELECT COUNT(*) FROM team_members WHERE photo_r2_key = ?) AS total_refs`,
    )
      .bind(oldKey, oldKey, oldKey, oldKey, oldKey)
      .first<{ total_refs: number }>();

    if ((refCheck?.total_refs ?? 0) > 0) {
      return;
    }

    await env.MEDIA_BUCKET.delete(oldKey);
  } catch {
    // Jangan gagalkan operasi database jika pembersihan R2 gagal
  }
}

export function buildR2Key(folder: string, ext: string): string {
  const safeFolder = ALLOWED_MEDIA_FOLDERS.has(folder) ? folder : 'showcase';
  const rand = crypto.randomUUID().slice(0, 8);
  return `${safeFolder}/${Date.now()}-${rand}.${ext}`;
}
