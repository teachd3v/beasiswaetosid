import { useEffect, useState } from 'react';
import type { NewsItem } from '../data/newsData';
import { fetchNewsList } from '../services/newsApi';

const INITIAL_VISIBLE_COUNT = 3;

interface NewsSectionProps {
  readonly onNavigate: (to: string) => void;
}

export function NewsSection({ onNavigate }: NewsSectionProps) {
  const [items, setItems] = useState<readonly NewsItem[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    void fetchNewsList(controller.signal).then((data) => {
      if (!controller.signal.aborted) {
        setItems(data);
      }
    });
    return () => controller.abort();
  }, []);

  const visibleNews = items.slice(0, INITIAL_VISIBLE_COUNT);
  const hasMoreNews = items.length > INITIAL_VISIBLE_COUNT;

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
    <section
      id="berita"
      aria-labelledby="news-heading"
      className="section-anchor border-y border-black/6 bg-[var(--bg-canvas)] py-9 sm:py-12 lg:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-green)] sm:text-xs">
              Berita & Kabar Etoser
            </p>
            <h2
              id="news-heading"
              className="mt-1.5 text-[clamp(1.6rem,3.6vw,2.85rem)] font-bold leading-[1.08] tracking-[-0.035em] text-[var(--ink-primary)] sm:mt-2"
            >
              Cerita Terbaru
            </h2>
          </div>

          {hasMoreNews && (
            <a
              href="/berita"
              onClick={(event) => handleLinkClick(event, '/berita')}
              className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border border-[var(--surface-pill-border)] bg-white px-3 py-1.5 text-[11px] font-semibold text-[var(--ink-primary)] transition-colors hover:border-[var(--brand-green)]/40 hover:bg-[var(--brand-mint)] hover:text-[var(--brand-green-dark)] sm:min-h-10 sm:px-4 sm:py-2 sm:text-sm"
            >
              <span>Semua ({items.length})</span>
              <span aria-hidden="true">→</span>
            </a>
          )}
        </div>

        {visibleNews.length === 0 ? (
          <div className="editorial-card mt-5 flex flex-col items-center justify-center px-6 py-12 text-center sm:mt-7">
            <span
              aria-hidden="true"
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--brand-mint)] text-base font-bold text-[var(--brand-green-dark)]"
            >
              ✦
            </span>
            <h3 className="mt-3 text-base font-bold tracking-[-0.02em] text-[var(--ink-primary)] sm:text-lg">
              Belum ada berita terbaru
            </h3>
            <p className="mt-1.5 max-w-md text-xs leading-relaxed text-[var(--ink-muted)] sm:text-sm">
              Kabar kegiatan dan prestasi Etoser akan segera hadir di sini.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-7 sm:gap-4 lg:grid-cols-3">
            {visibleNews.map((item) => {
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

                      <h3 className="mt-1.5 line-clamp-2 text-xs font-bold leading-snug tracking-[-0.02em] text-[var(--ink-primary)] transition-colors group-hover:text-[var(--brand-green-dark)] sm:mt-2 sm:text-lg">
                        {item.title}
                      </h3>

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
        )}
      </div>
    </section>
  );
}
