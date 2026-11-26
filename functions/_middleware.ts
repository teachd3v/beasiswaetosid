import { resolveMediaUrl } from './api/lib/media.ts';
import type { Bindings } from './api/types.ts';

interface PageSeoMeta {
  title: string;
  description: string;
  canonicalUrl: string;
  ogType: 'website' | 'article';
  ogImage: string;
  robots: string;
  jsonLd: Record<string, unknown>[];
}

const DEFAULT_IMAGE_PATH = '/media/YIC_ETOS_ID_2026_001.webp';

function resolveSiteOrigin(requestUrl: string, configuredSiteUrl?: string): string {
  if (configuredSiteUrl?.trim()) {
    return configuredSiteUrl.trim().replace(/\/+$/, '');
  }
  return new URL(requestUrl).origin;
}

function toAbsoluteUrl(urlOrPath: string, origin: string): string {
  if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
    return urlOrPath;
  }
  return `${origin}${urlOrPath.startsWith('/') ? '' : '/'}${urlOrPath}`;
}

function isStaticAssetPath(pathname: string): boolean {
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/assets/') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    return true;
  }
  return /\.[a-z0-9]{2,6}$/i.test(pathname);
}

async function resolvePageMeta(
  pathname: string,
  origin: string,
  env: Bindings,
): Promise<PageSeoMeta> {
  const cleanPath = pathname.replace(/\/+$/, '') || '/';
  const defaultImage = toAbsoluteUrl(DEFAULT_IMAGE_PATH, origin);

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Beasiswa ETOS ID — Dompet Dhuafa',
    alternateName: 'ETOS ID',
    url: origin,
    logo: toAbsoluteUrl('/logo/etos-id_net.svg', origin),
    description:
      'Program beasiswa dan pembinaan sarjana 8 semester oleh Beastudi Indonesia — Dompet Dhuafa di 15 Perguruan Tinggi Negeri mitra di Indonesia.',
  };

  if (cleanPath === '/admin' || cleanPath.startsWith('/admin/')) {
    return {
      title: 'Admin CMS · Beasiswa ETOS ID',
      description: 'Panel manajemen konten Beasiswa ETOS ID.',
      canonicalUrl: `${origin}${cleanPath}`,
      ogType: 'website',
      ogImage: defaultImage,
      robots: 'noindex, nofollow',
      jsonLd: [],
    };
  }

  if (cleanPath === '/etoser') {
    return {
      title: 'Katalog Profil Etoser · Beasiswa ETOS ID',
      description:
        'Kenali para penerima manfaat Beasiswa ETOS ID dari 15 PTN mitra di Indonesia beserta proyek sosial, minat keilmuan, dan prestasinya.',
      canonicalUrl: `${origin}/etoser`,
      ogType: 'website',
      ogImage: defaultImage,
      robots: 'index, follow, max-image-preview:large',
      jsonLd: [
        organizationSchema,
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Beranda', item: origin },
            { '@type': 'ListItem', position: 2, name: 'Profil Etoser', item: `${origin}/etoser` },
          ],
        },
      ],
    };
  }

  if (cleanPath === '/tim-kami') {
    return {
      title: 'Tim Kami · Pengelola & Fasilitator Daerah ETOS ID',
      description:
        'Struktur pengelola pusat Beastudi Indonesia, tim inti program ETOS ID, dan fasilitator daerah di 15 kampus mitra seluruh Indonesia.',
      canonicalUrl: `${origin}/tim-kami`,
      ogType: 'website',
      ogImage: defaultImage,
      robots: 'index, follow, max-image-preview:large',
      jsonLd: [
        organizationSchema,
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Beranda', item: origin },
            { '@type': 'ListItem', position: 2, name: 'Tim Kami', item: `${origin}/tim-kami` },
          ],
        },
      ],
    };
  }

  if (cleanPath === '/berita') {
    return {
      title: 'Berita & Kabar Etoser · Beasiswa ETOS ID',
      description:
        'Kumpulan berita terbaru seputar prestasi Etoser, aktivitas pembinaan, monitoring & evaluasi, serta program unggulan Beasiswa ETOS ID.',
      canonicalUrl: `${origin}/berita`,
      ogType: 'website',
      ogImage: defaultImage,
      robots: 'index, follow, max-image-preview:large',
      jsonLd: [
        organizationSchema,
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Beranda', item: origin },
            { '@type': 'ListItem', position: 2, name: 'Berita', item: `${origin}/berita` },
          ],
        },
      ],
    };
  }

  if (cleanPath.startsWith('/berita/')) {
    const slug = decodeURIComponent(cleanPath.slice('/berita/'.length));
    try {
      const article = await env.DB.prepare(
        `SELECT slug, title, category, published_at, updated_at, cover_r2_key, excerpt
         FROM news
         WHERE slug = ? AND status = 'published'`,
      )
        .bind(slug)
        .first<{
          slug: string;
          title: string;
          category: string;
          published_at: string;
          updated_at: string;
          cover_r2_key: string | null;
          excerpt: string;
        }>();

      if (article) {
        const canonicalUrl = `${origin}/berita/${encodeURIComponent(article.slug)}`;
        const resolvedCover = article.cover_r2_key
          ? toAbsoluteUrl(resolveMediaUrl(article.cover_r2_key, env.R2_PUBLIC_URL), origin)
          : defaultImage;

        return {
          title: `${article.title} · Berita ETOS ID`,
          description: article.excerpt,
          canonicalUrl,
          ogType: 'article',
          ogImage: resolvedCover,
          robots: 'index, follow, max-image-preview:large',
          jsonLd: [
            {
              '@context': 'https://schema.org',
              '@type': 'NewsArticle',
              headline: article.title,
              description: article.excerpt,
              image: [resolvedCover],
              datePublished: article.published_at,
              dateModified: article.updated_at || article.published_at,
              articleSection: article.category,
              author: {
                '@type': 'Organization',
                name: 'Beasiswa ETOS ID — Dompet Dhuafa',
                url: origin,
              },
              publisher: {
                '@type': 'Organization',
                name: 'Beasiswa ETOS ID — Dompet Dhuafa',
                logo: {
                  '@type': 'ImageObject',
                  url: toAbsoluteUrl('/logo/etos-id_net.svg', origin),
                },
              },
              mainEntityOfPage: canonicalUrl,
            },
            {
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Beranda', item: origin },
                { '@type': 'ListItem', position: 2, name: 'Berita', item: `${origin}/berita` },
                { '@type': 'ListItem', position: 3, name: article.title, item: canonicalUrl },
              ],
            },
          ],
        };
      }
    } catch {
      // fallback ke meta default jika D1 belum terhubung
    }
  }

  return {
    title: 'Beasiswa ETOS ID · Dompet Dhuafa',
    description:
      'Beasiswa ETOS ID Dompet Dhuafa adalah program beasiswa dan pembinaan sarjana 8 semester di 15 PTN mitra untuk mencetak SDM strategis daerah yang berintegritas, profesional, dan transformatif.',
    canonicalUrl: `${origin}/`,
    ogType: 'website',
    ogImage: defaultImage,
    robots: 'index, follow, max-image-preview:large',
    jsonLd: [
      organizationSchema,
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Beasiswa ETOS ID',
        url: origin,
      },
    ],
  };
}

export const onRequest: PagesFunction<Bindings> = async (context) => {
  const url = new URL(context.request.url);

  if (context.request.method !== 'GET' || isStaticAssetPath(url.pathname)) {
    return context.next();
  }

  const response = await context.next();
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('text/html')) {
    return response;
  }

  const origin = resolveSiteOrigin(context.request.url, context.env.SITE_URL);
  const meta = await resolvePageMeta(url.pathname, origin, context.env);

  const rewriter = new HTMLRewriter()
    .on('title', {
      element(el) {
        el.setInnerContent(meta.title);
      },
    })
    .on('meta[name="description"]', {
      element(el) {
        el.setAttribute('content', meta.description);
      },
    })
    .on('meta[name="robots"]', {
      element(el) {
        el.setAttribute('content', meta.robots);
      },
    })
    .on('link[rel="canonical"]', {
      element(el) {
        el.setAttribute('href', meta.canonicalUrl);
      },
    })
    .on('meta[property="og:type"]', {
      element(el) {
        el.setAttribute('content', meta.ogType);
      },
    })
    .on('meta[property="og:title"]', {
      element(el) {
        el.setAttribute('content', meta.title);
      },
    })
    .on('meta[property="og:description"]', {
      element(el) {
        el.setAttribute('content', meta.description);
      },
    })
    .on('meta[property="og:url"]', {
      element(el) {
        el.setAttribute('content', meta.canonicalUrl);
      },
    })
    .on('meta[property="og:image"]', {
      element(el) {
        el.setAttribute('content', meta.ogImage);
      },
    })
    .on('meta[name="twitter:title"]', {
      element(el) {
        el.setAttribute('content', meta.title);
      },
    })
    .on('meta[name="twitter:description"]', {
      element(el) {
        el.setAttribute('content', meta.description);
      },
    })
    .on('meta[name="twitter:image"]', {
      element(el) {
        el.setAttribute('content', meta.ogImage);
      },
    })
    .on('head', {
      element(el) {
        for (const schema of meta.jsonLd) {
          const serialized = JSON.stringify(schema).replace(/</g, '\\u003c');
          el.append(`<script type="application/ld+json">${serialized}</script>`, {
            html: true,
          });
        }
      },
    });

  const rewritten = rewriter.transform(response);
  if (meta.robots.startsWith('noindex')) {
    const headers = new Headers(rewritten.headers);
    headers.set('X-Robots-Tag', 'noindex, nofollow');
    return new Response(rewritten.body, {
      status: rewritten.status,
      statusText: rewritten.statusText,
      headers,
    });
  }

  return rewritten;
};
