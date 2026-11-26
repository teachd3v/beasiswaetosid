import { NEWS_ITEMS } from '../data/newsData';
import type { NewsItem } from '../data/newsData';

const NEWS_API_BASE = (import.meta.env.VITE_NEWS_API_URL as string | undefined)?.replace(
  /\/$/,
  '',
);

/**
 * Service API Berita ETOS ID.
 * Default mengambil dari Pages Functions `/api/public/news` (D1).
 * Jika env `VITE_NEWS_API_URL` diisi, memakai base URL kustom tersebut.
 * Jika API belum tersedia (misal mode Vite murni), otomatis fallback ke data lokal.
 */
export async function fetchNewsList(signal?: AbortSignal): Promise<readonly NewsItem[]> {
  const url = NEWS_API_BASE ? `${NEWS_API_BASE}/berita` : '/api/public/news';
  try {
    const res = await fetch(url, {
      signal,
      headers: { Accept: 'application/json' },
    });
    const contentType = res.headers.get('content-type') ?? '';
    if (res.ok && contentType.includes('application/json')) {
      const data = (await res.json()) as NewsItem[];
      if (Array.isArray(data)) return data;
    }
  } catch {
    // Fallback ke data lokal jika API belum tersedia
  }
  return NEWS_ITEMS;
}

export async function fetchNewsBySlug(
  slug: string,
  signal?: AbortSignal,
): Promise<NewsItem | null> {
  const encoded = encodeURIComponent(slug);
  const url = NEWS_API_BASE ? `${NEWS_API_BASE}/berita/${encoded}` : `/api/public/news/${encoded}`;
  try {
    const res = await fetch(url, {
      signal,
      headers: { Accept: 'application/json' },
    });
    const contentType = res.headers.get('content-type') ?? '';
    if (res.ok && contentType.includes('application/json')) {
      return (await res.json()) as NewsItem;
    }
    if (res.status === 404 && contentType.includes('application/json')) {
      return null;
    }
  } catch {
    // Fallback ke data lokal jika API belum tersedia
  }
  return NEWS_ITEMS.find((item) => item.slug === slug) ?? null;
}
