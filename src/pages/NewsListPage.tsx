import { useEffect, useState } from 'react';
import { NEWS_CATEGORIES } from '../data/newsData';
import type { NewsCategory, NewsItem } from '../data/newsData';
import { fetchNewsList } from '../services/newsApi';

interface NewsListPageProps {
  readonly onNavigate: (to: string) => void;
}

export function NewsListPage({ onNavigate }: NewsListPageProps) {
  const [items, setItems] = useState<readonly NewsItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('Semua');

  useEffect(() => {
    document.title = 'Berita · ETOS ID';
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
    <main className="flex-1 bg-[var(--surface-subtle)] py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <a
          href="/#berita"
          onClick={(event) => handleLinkClick(event, '/#berita')}
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--surface-pill-border)] bg-white px-4 py-1.5 text-xs font-semibold text-[var(--ink-secondary)] transition-colors hover:text-[var(--brand-green-dark)] sm:text-sm"
        >
          <span aria-hidden="true">←</span>
          <span>Kembali ke Beranda</span>
        </a>

        <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-green)]">
              Arsip Berita
            </p>
            <h1 className="mt-3 text-[clamp(2.25rem,4.5vw,3.5rem)] font-bold leading-[1.06] tracking-[-0.035em] text-[var(--ink-primary)]">
              Semua Berita ETOS ID
            </h1>
          </div>

          <div
            role="group"
            aria-label="Filter kategori berita"
            className="flex flex-wrap gap-2"
          >
            {NEWS_CATEGORIES.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedCategory(category)}
                  className={`min-h-11 rounded-full border px-4 py-2 text-xs font-semibold transition-colors sm:text-sm ${
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

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredNews.map((item) => {
            const href = `/berita/${item.slug}`;
            return (
              <a
                key={item.id}
                href={href}
                onClick={(event) => handleLinkClick(event, href)}
                className="editorial-card editorial-card-interactive group flex flex-col overflow-hidden text-left"
              >
                {item.coverSrc && (
                  <div className="relative aspect-16/10 w-full overflow-hidden bg-[var(--surface-placeholder)]">
                    <img
                      src={item.coverSrc}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-104"
                    />
                    <span className="absolute left-3.5 top-3.5 inline-flex rounded-full bg-white/92 px-3 py-1 text-xs font-semibold text-[var(--brand-green-dark)] backdrop-blur-xs">
                      {item.category}
                    </span>
                  </div>
                )}

                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <p className="text-xs font-medium text-[var(--ink-muted)]">
                      {item.dateLabel}
                      {item.location ? ` · ${item.location}` : ''}
                    </p>

                    <h2 className="mt-2.5 text-lg font-bold leading-snug tracking-[-0.025em] text-[var(--ink-primary)] transition-colors group-hover:text-[var(--brand-green-dark)] sm:text-xl">
                      {item.title}
                    </h2>

                    <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-[var(--ink-muted)]">
                      {item.excerpt}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-black/6 pt-4 text-xs font-semibold text-[var(--brand-green-dark)]">
                    <span>Baca selengkapnya</span>
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
