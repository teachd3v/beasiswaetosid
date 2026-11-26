import type { Bindings } from './api/types.ts';

function resolveSiteOrigin(requestUrl: string, configuredSiteUrl?: string): string {
  if (configuredSiteUrl?.trim()) {
    return configuredSiteUrl.trim().replace(/\/+$/, '');
  }
  return new URL(requestUrl).origin;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const onRequestGet: PagesFunction<Bindings> = async (context) => {
  const origin = resolveSiteOrigin(context.request.url, context.env.SITE_URL);
  const today = new Date().toISOString().slice(0, 10);

  const staticRoutes = [
    { path: '/', changefreq: 'weekly', priority: '1.0', lastmod: today },
    { path: '/etoser', changefreq: 'weekly', priority: '0.9', lastmod: today },
    { path: '/berita', changefreq: 'daily', priority: '0.9', lastmod: today },
    { path: '/tim-kami', changefreq: 'monthly', priority: '0.8', lastmod: today },
  ];

  let newsRows: { slug: string; updated_at: string | null; published_at: string | null }[] = [];
  try {
    const { results } = await context.env.DB.prepare(
      `SELECT slug, updated_at, published_at
       FROM news
       WHERE status = 'published'
       ORDER BY published_at DESC`,
    ).all<{ slug: string; updated_at: string | null; published_at: string | null }>();
    newsRows = results;
  } catch {
    // Fallback ke static routes saja jika D1 belum tersedia
  }

  const urls = [
    ...staticRoutes.map(
      (r) => `  <url>
    <loc>${escapeXml(`${origin}${r.path}`)}</loc>
    <lastmod>${escapeXml(r.lastmod)}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`,
    ),
    ...newsRows.map((row) => {
      const lastmod = (row.updated_at || row.published_at || today).slice(0, 10);
      return `  <url>
    <loc>${escapeXml(`${origin}/berita/${encodeURIComponent(row.slug)}`)}</loc>
    <lastmod>${escapeXml(lastmod)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600, stale-while-revalidate=3600',
    },
  });
};
