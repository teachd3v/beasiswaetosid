import { NEWS_ITEMS } from '../data/newsData';
import type { NewsItem } from '../data/newsData';

const NEWS_API_BASE = (import.meta.env.VITE_NEWS_API_URL as string | undefined)?.replace(
  /\/$/,
  '',
);

/**
 * Service API Berita ETOS ID.
 * Jika env `VITE_NEWS_API_URL` diisi, data akan diambil dari endpoint REST:
 * - GET `${VITE_NEWS_API_URL}/berita`
 * - GET `${VITE_NEWS_API_URL}/berita/:slug`
 * Jika belum dikonfigurasi, otomatis memakai 5 berita dummy lokal.
 */
export async function fetchNewsList(signal?: AbortSignal): Promise<readonly NewsItem[]> {
  if (NEWS_API_BASE) {
    try {
      const res = await fetch(`${NEWS_API_BASE}/berita`, { signal });
      if (res.ok) {
        const data = (await res.json()) as NewsItem[];
        if (Array.isArray(data)) return data;
      }
    } catch {
      // Fallback ke data lokal jika API belum tersedia
    }
  }
  return NEWS_ITEMS;
}

export async function fetchNewsBySlug(
  slug: string,
  signal?: AbortSignal,
): Promise<NewsItem | null> {
  if (NEWS_API_BASE) {
    try {
      const res = await fetch(`${NEWS_API_BASE}/berita/${encodeURIComponent(slug)}`, {
        signal,
      });
      if (res.ok) {
        return (await res.json()) as NewsItem;
      }
      if (res.status === 404) return null;
    } catch {
      // Fallback ke data lokal jika API belum tersedia
    }
  }
  return NEWS_ITEMS.find((item) => item.slug === slug) ?? null;
}
