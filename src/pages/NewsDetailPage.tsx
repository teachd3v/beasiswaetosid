import { useEffect, useState } from 'react';
import type { NewsItem } from '../data/newsData';
import { fetchNewsBySlug, fetchNewsList } from '../services/newsApi';
import { applyClientSeo } from '../lib/seo';

interface NewsDetailPageProps {
  readonly slug: string;
  readonly onNavigate: (to: string) => void;
}

export function NewsDetailPage({ slug, onNavigate }: NewsDetailPageProps) {
  const [article, setArticle] = useState<NewsItem | null | undefined>(undefined);
  const [allNews, setAllNews] = useState<readonly NewsItem[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    void Promise.all([
      fetchNewsBySlug(slug, controller.signal),
      fetchNewsList(controller.signal),
    ]).then(([found, list]) => {
      if (controller.signal.aborted) return;
      setArticle(found);
      setAllNews(list);
      applyClientSeo({
        title: found ? `${found.title} · Berita ETOS ID` : 'Berita Tidak Ditemukan · ETOS ID',
        description: found?.excerpt,
        path: found ? `/berita/${encodeURIComponent(found.slug)}` : `/berita/${encodeURIComponent(slug)}`,
        noIndex: !found,
      });
    });

    return () => controller.abort();
  }, [slug]);

  const handleLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    to: string,
  ) => {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }
    event.preventDefault();
    onNavigate(to);
  };

  if (article === undefined) {
    return (
      <main className="flex-1 bg-[var(--bg-canvas)] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <p className="text-sm text-[var(--ink-muted)]">Memuat berita...</p>
        </div>
      </main>
    );
  }

  if (article === null) {
    return (
      <main className="flex-1 bg-[var(--bg-canvas)] py-24">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-green)]">
            404 · Berita Tidak Ditemukan
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-[var(--ink-primary)]">
            Artikel yang kamu cari tidak tersedia
          </h1>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="/berita"
              onClick={(event) => handleLinkClick(event, '/berita')}
              className="inline-flex min-h-11 items-center rounded-full bg-[var(--brand-green-dark)] px-5 py-2 text-sm font-semibold text-white"
            >
              Lihat Semua Berita
            </a>
            <a
              href="/"
              onClick={(event) => handleLinkClick(event, '/')}
              className="inline-flex min-h-11 items-center rounded-full border border-[var(--surface-pill-border)] px-5 py-2 text-sm font-semibold text-[var(--ink-primary)]"
            >
              Kembali ke Beranda
            </a>
          </div>
        </div>
      </main>
    );
  }

  const currentIdx = allNews.findIndex((item) => item.slug === article.slug);
  const prevArticle = currentIdx > 0 ? allNews[currentIdx - 1] : null;
  const nextArticle =
    currentIdx >= 0 && currentIdx < allNews.length - 1 ? allNews[currentIdx + 1] : null;
  const relatedNews = allNews.filter((item) => item.slug !== article.slug).slice(0, 3);

  return (
    <main className="flex-1 bg-[var(--bg-canvas)] py-7 sm:py-10 lg:py-12">
      <article className="mx-auto max-w-7xl px-4 sm:px-8">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-medium text-[var(--ink-muted)] sm:text-sm">
          <a
            href="/"
            onClick={(event) => handleLinkClick(event, '/')}
            className="transition-colors hover:text-[var(--brand-green-dark)]"
          >
            Beranda
          </a>
          <span aria-hidden="true">/</span>
          <a
            href="/berita"
            onClick={(event) => handleLinkClick(event, '/berita')}
            className="transition-colors hover:text-[var(--brand-green-dark)]"
          >
            Berita
          </a>
        </nav>

        <header className="mt-6">
          <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm">
            <span className="inline-flex rounded-full bg-[var(--brand-mint)] px-3.5 py-1 font-semibold text-[var(--brand-green-dark)]">
              {article.category}
            </span>
            <span className="text-[var(--ink-muted)]">
              {article.dateLabel}
              {article.location ? ` · ${article.location}` : ''}
            </span>
          </div>

          <h1 className="mt-4 text-[clamp(1.65rem,4.5vw,3.1rem)] font-bold leading-[1.12] tracking-[-0.035em] text-[var(--ink-primary)]">
            {article.title}
          </h1>

          <p className="mt-4 text-base leading-relaxed text-[var(--ink-muted)] sm:text-lg">
            {article.excerpt}
          </p>
        </header>

        {article.coverSrc && (
          <figure className="mt-8 overflow-hidden rounded-[var(--radius-viewer)] bg-[var(--surface-placeholder)]">
            <img
              src={article.coverSrc}
              alt={article.title}
              className="aspect-16/9 max-h-[540px] w-full object-cover"
            />
          </figure>
        )}

        <div className="mt-9 space-y-5 text-base leading-[1.85] text-[var(--ink-secondary)] sm:text-lg">
          {article.content.map((paragraph, idx) => (
            <p key={`${article.id}-p-${idx}`}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-12 grid gap-4 border-t border-black/8 pt-8 sm:grid-cols-2">
          {prevArticle ? (
            <a
              href={`/berita/${prevArticle.slug}`}
              onClick={(event) => handleLinkClick(event, `/berita/${prevArticle.slug}`)}
              className="editorial-card editorial-card-interactive p-5"
            >
              <span className="text-xs font-semibold text-[var(--ink-muted)]">
                ← Berita Sebelumnya
              </span>
              <p className="mt-1.5 line-clamp-2 text-sm font-bold text-[var(--ink-primary)]">
                {prevArticle.title}
              </p>
            </a>
          ) : (
            <div />
          )}

          {nextArticle && (
            <a
              href={`/berita/${nextArticle.slug}`}
              onClick={(event) => handleLinkClick(event, `/berita/${nextArticle.slug}`)}
              className="editorial-card editorial-card-interactive p-5 text-left sm:text-right"
            >
              <span className="text-xs font-semibold text-[var(--ink-muted)]">
                Berita Berikutnya →
              </span>
              <p className="mt-1.5 line-clamp-2 text-sm font-bold text-[var(--ink-primary)]">
                {nextArticle.title}
              </p>
            </a>
          )}
        </div>
      </article>

      {relatedNews.length > 0 && (
        <section className="mx-auto mt-10 max-w-7xl border-t border-black/8 px-4 pt-8 sm:mt-14 sm:px-8 sm:pt-10">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold tracking-[-0.025em] text-[var(--ink-primary)] sm:text-2xl">
              Berita Lainnya
            </h2>
            <a
              href="/berita"
              onClick={(event) => handleLinkClick(event, '/berita')}
              className="text-xs font-semibold text-[var(--brand-green-dark)] hover:underline sm:text-sm"
            >
              Semua Berita →
            </a>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-6 sm:gap-4 md:grid-cols-3">
            {relatedNews.map((item) => {
              const href = `/berita/${item.slug}`;
              return (
                <a
                  key={item.id}
                  href={href}
                  onClick={(event) => handleLinkClick(event, href)}
                  className="editorial-card editorial-card-interactive group flex flex-col overflow-hidden"
                >
                  {item.coverSrc && (
                    <div className="aspect-16/10 w-full overflow-hidden bg-[var(--surface-placeholder)]">
                      <img
                        src={item.coverSrc}
                        alt={item.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-104"
                      />
                    </div>
                  )}
                  <div className="p-3 sm:p-5">
                    <p className="text-[10px] text-[var(--ink-muted)] sm:text-xs">{item.dateLabel}</p>
                    <h3 className="mt-1.5 line-clamp-2 text-xs font-bold text-[var(--ink-primary)] group-hover:text-[var(--brand-green-dark)] sm:mt-2 sm:text-base">
                      {item.title}
                    </h3>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
