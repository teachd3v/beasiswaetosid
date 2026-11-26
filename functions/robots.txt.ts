import type { Bindings } from './api/types.ts';

function resolveSiteOrigin(requestUrl: string, configuredSiteUrl?: string): string {
  if (configuredSiteUrl?.trim()) {
    return configuredSiteUrl.trim().replace(/\/+$/, '');
  }
  return new URL(requestUrl).origin;
}

export const onRequestGet: PagesFunction<Bindings> = async (context) => {
  const origin = resolveSiteOrigin(context.request.url, context.env.SITE_URL);
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /admin/',
    'Disallow: /api/',
    '',
    `Sitemap: ${origin}/sitemap.xml`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
