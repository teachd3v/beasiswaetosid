import { useEffect, useState } from 'react';
import { NEWS_CATEGORIES } from '../data/newsData';
import type { NewsCategory, NewsItem } from '../data/newsData';
import { fetchNewsList } from '../services/newsApi';
import { applyClientSeo } from '../lib/seo';

interface NewsListPageProps {
  readonly onNavigate: (to: string) => void;
}

export function NewsListPage({ onNavigate }: NewsListPageProps) {
  const [items, setItems] = useState<readonly NewsItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('Semua');

  useEffect(() => {
    applyClientSeo({
      title: 'Berita & Kabar Etoser · Beasiswa ETOS ID',
      description:
        'Kumpulan berita terbaru seputar prestasi Etoser, aktivitas pembinaan, monitoring & evaluasi, serta program unggulan Beasiswa ETOS ID.',
      path: '/berita',
    });
    const controller = new AbortController();
    void fetchNewsList(controller.signal).then((data) => {
      if (!controller.signal.aborted) {
        setItems(data);
      }
    });
    return () => controller.abort();
  }, []);

  const filteredNews =
    selectedCategory === 'Semua'
      ? items
      : items.filter((item) => item.category === selectedCategory);

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

  return (
    <main className="flex-1 bg-[var(--surface-subtle)] py-7 sm:py-10 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <a
          href="/#berita"
          onClick={(event) => handleLinkClick(event, '/#berita')}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[var(--surface-pill-border)] bg-white px-3.5 py-1.5 text-xs font-semibold text-[var(--ink-secondary)] transition-colors hover:text-[var(--brand-green-dark)] sm:min-h-10 sm:px-4 sm:text-sm"
        >
          <span aria-hidden="true">←</span>
          <span>Kembali ke Beranda</span>
        </a>

        <div className="mt-4 flex flex-col gap-3 sm:mt-6 sm:gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-green)] sm:text-xs">
              Arsip Berita
            </p>
            <h1 className="mt-1.5 text-[clamp(1.65rem,3.8vw,2.85rem)] font-bold leading-[1.08] tracking-[-0.035em] text-[var(--ink-primary)] sm:mt-2">
              Semua Berita ETOS ID
            </h1>
          </div>

          <div
            role="group"
            aria-label="Filter kategori berita"
            className="flex flex-wrap gap-1.5 sm:gap-2"
          >
            {NEWS_CATEGORIES.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedCategory(category)}
                  className={`min-h-8 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10.5px] font-semibold transition-colors sm:min-h-10 sm:px-4 sm:py-2 sm:text-sm ${
                    active
                      ? 'border-[var(--brand-green-dark)] bg-[var(--brand-green-dark)] text-white'
                      : 'border-[var(--surface-pill-border)] bg-white text-[var(--ink-secondary)] hover:bg-neutral-50'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-7 sm:gap-4 lg:grid-cols-3">
          {filteredNews.map((item) => {
            const href = `/berita/${item.slug}`;
            return (
              <a
                key={item.id}
                href={href}
                onClick={(event) => handleLinkClick(event, href)}
                className="editorial-card editorial-card-interactive group flex flex-col overflow-hidden text-left"
              >
                <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-[var(--surface-placeholder)]">
                  {item.coverSrc ? (
                    <img
                      src={item.coverSrc}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-104"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[var(--brand-mint)]/50 text-xs font-semibold text-[var(--brand-green-dark)]">
                      ETOS ID
                    </div>
                  )}
                  <span className="absolute left-2 top-2 z-10 inline-flex rounded-full bg-white/92 px-2 py-0.5 text-[10px] font-semibold text-[var(--brand-green-dark)] backdrop-blur-xs sm:left-3 sm:top-3 sm:px-3 sm:py-1 sm:text-xs">
                    {item.category}
                  </span>
                </div>

                <div className="flex flex-1 flex-col justify-between p-3 sm:p-5">
                  <div>
                    <p className="text-[10px] font-medium text-[var(--ink-muted)] sm:text-xs">
                      {item.dateLabel}
                      {item.location ? ` · ${item.location}` : ''}
                    </p>

                    <h2 className="mt-1.5 line-clamp-2 text-xs font-bold leading-snug tracking-[-0.02em] text-[var(--ink-primary)] transition-colors group-hover:text-[var(--brand-green-dark)] sm:mt-2 sm:text-lg">
                      {item.title}
                    </h2>

                    <p className="mt-2 hidden line-clamp-2 text-sm leading-relaxed text-[var(--ink-muted)] sm:block">
                      {item.excerpt}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-black/6 pt-2.5 text-[11px] font-semibold text-[var(--brand-green-dark)] sm:mt-5 sm:pt-3.5 sm:text-xs">
                    <span>Baca</span>
                    <span
                      aria-hidden="true"
                      className="transition-transform group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </main>
  );
}
