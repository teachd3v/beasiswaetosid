/**
 * Penerima sinkronisasi artikel dari Editorial Hub.
 * Format tanda tangan harus sama dengan @ecosys/core-editorial (hmac.ts) di monorepo:
 * HMAC-SHA256 hex atas `${timestamp}.${rawBody}`, toleransi jam 5 menit.
 */

export type SyncAction = 'upsert' | 'delete';

export interface EditorialSyncPayload {
  action: SyncAction;
  external_uuid: string;
  slug: string;
  title: string;
  excerpt: string;
  content_html: string;
  cover_image_url?: string | null;
  author_name: string;
  category: string;
  tags: string[];
  seo: {
    meta_title?: string | null;
    meta_description?: string | null;
    canonical_url?: string | null;
  };
  published_at: string;
}

export type NewsCategory = 'Prestasi' | 'Aktivitas & Monev' | 'Program';

const encoder = new TextEncoder();
const MAX_CLOCK_SKEW_SECONDS = 300;

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function sign(secret: string, timestamp: string, rawBody: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(`${timestamp}.${rawBody}`));
  return toHex(sig);
}

export async function verifyEditorialSignature(
  secret: string | undefined,
  rawBody: string,
  timestampHeader: string | null,
  signatureHeader: string | null,
): Promise<{ valid: boolean; reason?: string }> {
  if (!secret) return { valid: false, reason: 'EDITORIAL_SYNC_SECRET belum dikonfigurasi' };
  if (!timestampHeader || !signatureHeader) {
    return { valid: false, reason: 'Header tanda tangan tidak lengkap' };
  }

  const ts = Number(timestampHeader);
  if (!Number.isFinite(ts)) return { valid: false, reason: 'Timestamp tidak valid' };

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > MAX_CLOCK_SKEW_SECONDS) {
    return { valid: false, reason: 'Tanda tangan kedaluwarsa' };
  }

  const expected = await sign(secret, timestampHeader, rawBody);
  if (!timingSafeEqualHex(expected, signatureHeader.toLowerCase())) {
    return { valid: false, reason: 'Tanda tangan HMAC tidak cocok' };
  }

  return { valid: true };
}

/** ID baris `news` untuk artikel dari hub, agar bisa dibedakan dari berita yang dibuat di CMS lokal. */
export function hubNewsId(externalUuid: string): string {
  return `hub-${externalUuid}`;
}

const NEWS_CATEGORIES: readonly NewsCategory[] = ['Prestasi', 'Aktivitas & Monev', 'Program'];

/** Kategori hub berupa teks bebas; tabel `news` hanya menerima tiga nilai. */
export function mapCategory(raw: string | null | undefined): NewsCategory {
  const value = (raw ?? '').trim().toLowerCase();
  const exact = NEWS_CATEGORIES.find((c) => c.toLowerCase() === value);
  if (exact) return exact;
  if (value.includes('prestasi')) return 'Prestasi';
  if (value.includes('monev') || value.includes('aktivitas') || value.includes('kegiatan')) {
    return 'Aktivitas & Monev';
  }
  return 'Program';
}

const MONTHS_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

/** "2026-02-26T03:00:00Z" -> "26 Februari 2026" (zona waktu WIB). */
export function formatDateLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const wib = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return `${wib.getUTCDate()} ${MONTHS_ID[wib.getUTCMonth()]} ${wib.getUTCFullYear()}`;
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '–',
  mdash: '—',
  hellip: '…',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
};

function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] === '#') {
      const code =
        entity[1] === 'x' || entity[1] === 'X'
          ? Number.parseInt(entity.slice(2), 16)
          : Number.parseInt(entity.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
  });
}

/**
 * Halaman berita ETOS ID merender isi sebagai daftar paragraf teks biasa,
 * jadi HTML dari hub dipecah per blok lalu dibersihkan dari tag.
 * Format inline (tebal, tautan) tidak ikut terbawa.
 */
export function htmlToParagraphs(html: string): string[] {
  const withBreaks = html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n• ')
    .replace(/<\/(p|div|h[1-6]|li|blockquote|figcaption|tr|ul|ol|section|article)>/gi, '\n');

  return decodeEntities(withBreaks.replace(/<[^>]+>/g, ''))
    .split(/\n+/)
    .map((line) => line.replace(/[ \t ]+/g, ' ').trim())
    .filter((line) => line.length > 0 && line !== '•');
}
