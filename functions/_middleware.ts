import { resolveMediaUrl } from './api/lib/media.ts';
import type { Bindings } from './api/types.ts';

interface PageSeoMeta {
  title: string;
  description: string;
  canonicalUrl: string;
  ogType: 'website' | 'article';
  ogImage: string;
  ogImageAlt: string;
  articlePublishedTime?: string;
  articleSection?: string;
  robots: string;
  jsonLd: Record<string, unknown>[];
}

const DEFAULT_IMAGE_PATH = '/og-home.jpg';

const HOME_FAQ_ITEMS = [
  {
    q: 'Siapa saja yang dapat mendaftar Beasiswa ETOS ID?',
    a: 'Calon mahasiswa baru yang telah diterima di salah satu Perguruan Tinggi Negeri (PTN) mitra ETOS ID pada tahun seleksi berjalan, beragama Islam, memiliki prestasi akademik maupun organisasi, mendapat izin orang tua/wali, serta berkomitmen mengikuti pembinaan selama 8 semester.',
  },
  {
    q: 'Apakah penerima KIP Kuliah dapat mendaftar ETOS ID?',
    a: 'Tidak. Pendaftar yang sudah atau sedang menjadi penerima beasiswa KIP Kuliah tidak dapat mendaftar Beasiswa ETOS ID agar manfaat beasiswa dapat menjangkau lebih banyak mahasiswa yang membutuhkan.',
  },
  {
    q: 'Bagaimana jika orang tua tidak memiliki slip gaji resmi?',
    a: 'Jika orang tua bekerja di sektor non-formal atau tidak memiliki slip gaji resmi, berkas tersebut dapat diganti dengan Surat Keterangan Penghasilan dari RT/RW atau kelurahan/desa setempat yang mencantumkan perkiraan nominal penghasilan.',
  },
  {
    q: 'Bagaimana jika biaya pendidikan ditanggung oleh wali?',
    a: 'Apabila biaya hidup dan pendidikan ditanggung oleh wali (bukan orang tua kandung), maka dokumen penghasilan yang dilampirkan disesuaikan dengan pihak wali yang menjadi penanggung jawab finansial.',
  },
  {
    q: 'Dokumen administrasi apa saja yang umumnya perlu disiapkan?',
    a: 'Secara umum pendaftar menyiapkan identitas diri (KTP/Kartu Pelajar), Kartu Keluarga, bukti diterima di PTN mitra, ijazah atau SKL, slip gaji/surat keterangan penghasilan, foto rumah, serta sertifikat prestasi atau keaktifan organisasi jika ada.',
  },
  {
    q: 'Apa saja fasilitas yang didapatkan penerima manfaat ETOS ID?',
    a: 'Penerima manfaat (Etoser) mendapatkan dukungan biaya pendidikan (UKT) selama 8 semester, tunjangan aktivitas, program pengembangan kapasitas (capacity building), pendampingan mentor, persiapan karier, dan jejaring nasional lintas kampus mitra.',
  },
  {
    q: 'Apakah Etoser wajib mengikuti seluruh rangkaian program pembinaan?',
    a: 'Ya. Setiap mahasiswa yang dinyatakan lolos sebagai Etoser wajib berkomitmen mengikuti seluruh aktivitas dan kurikulum pembinaan ETOS ID selama 8 semester dari awal hingga prosesi kelulusan.',
  },
];

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

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
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
      ogImageAlt: 'Admin CMS Beasiswa ETOS ID',
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
      ogImageAlt: 'Katalog Profil Etoser Beasiswa ETOS ID',
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
      ogImageAlt: 'Tim Pengelola dan Fasilitator Daerah Beasiswa ETOS ID',
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
      ogImageAlt: 'Berita dan Kabar Etoser Beasiswa ETOS ID',
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
        `SELECT slug, title, category, published_at, updated_at, cover_r2_key, og_r2_key, excerpt
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
          og_r2_key: string | null;
          excerpt: string;
        }>();

      if (article) {
        const canonicalUrl = `${origin}/berita/${encodeURIComponent(article.slug)}`;
        const chosenImageKey = article.og_r2_key || article.cover_r2_key;
        const resolvedOgImage = chosenImageKey
          ? toAbsoluteUrl(resolveMediaUrl(chosenImageKey, env.R2_PUBLIC_URL), origin)
          : defaultImage;

        return {
          title: `${article.title} · Berita ETOS ID`,
          description: article.excerpt,
          canonicalUrl,
          ogType: 'article',
          ogImage: resolvedOgImage,
          ogImageAlt: article.title,
          articlePublishedTime: article.published_at,
          articleSection: article.category,
          robots: 'index, follow, max-image-preview:large',
          jsonLd: [
            {
              '@context': 'https://schema.org',
              '@type': 'NewsArticle',
              headline: article.title,
              description: article.excerpt,
              image: [resolvedOgImage],
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
    ogImageAlt: 'Beasiswa ETOS ID · Dompet Dhuafa',
    robots: 'index, follow, max-image-preview:large',
    jsonLd: [
      organizationSchema,
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Beasiswa ETOS ID',
        url: origin,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: HOME_FAQ_ITEMS.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a,
          },
        })),
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
    .on('meta[property="og:image:alt"]', {
      element(el) {
        el.setAttribute('content', meta.ogImageAlt);
      },
    })
    .on('meta[name="twitter:title"]', {
      element(el) {
        el.setAttribute('content', meta.title);
      },
    })
    .on('meta[name="twitter:image"]', {
      element(el) {
        el.setAttribute('content', meta.ogImage);
      },
    })
    .on('head', {
      element(el) {
        if (meta.articlePublishedTime) {
          el.append(
            `<meta property="article:published_time" content="${escapeAttr(meta.articlePublishedTime)}" />`,
            { html: true },
          );
        }
        if (meta.articleSection) {
          el.append(
            `<meta property="article:section" content="${escapeAttr(meta.articleSection)}" />`,
            { html: true },
          );
        }
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
