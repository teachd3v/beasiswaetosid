interface ClientSeoOptions {
  readonly title: string;
  readonly description?: string;
  readonly path?: string;
  readonly noIndex?: boolean;
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Sinkronkan <title>, meta description, canonical, dan robots saat navigasi SPA di sisi client.
 * Untuk crawler & social share preview, edge middleware (`functions/_middleware.ts`)
 * juga menginjeksi tag yang sama langsung pada HTML awal.
 */
export function applyClientSeo({
  title,
  description,
  path,
  noIndex = false,
}: ClientSeoOptions): void {
  document.title = title;
  upsertMeta('property', 'og:title', title);
  upsertMeta('name', 'twitter:title', title);

  if (description) {
    upsertMeta('name', 'description', description);
  }

  upsertMeta(
    'name',
    'robots',
    noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
  );

  const canonicalUrl = `${window.location.origin}${path ?? window.location.pathname}`;
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', canonicalUrl);
  upsertMeta('property', 'og:url', canonicalUrl);
}
