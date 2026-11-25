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
      className="section-anchor border-y border-black/6 bg-[var(--bg-canvas)] py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-green)]">
              Berita & Kabar Etoser
            </p>
            <h2
              id="news-heading"
              className="mt-3 text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.06] tracking-[-0.035em] text-[var(--ink-primary)]"
            >
              Cerita Terbaru
            </h2>
          </div>

          {hasMoreNews && (
            <a
              href="/berita"
              onClick={(event) => handleLinkClick(event, '/berita')}
              className="inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-[var(--surface-pill-border)] bg-white px-5 py-2 text-xs font-semibold text-[var(--ink-primary)] transition-colors hover:border-[var(--brand-green)]/40 hover:bg-[var(--brand-mint)] hover:text-[var(--brand-green-dark)] sm:self-auto sm:text-sm"
            >
              <span>Lihat Semua Berita ({items.length})</span>
              <span aria-hidden="true">→</span>
            </a>
          )}
        </div>

        {visibleNews.length === 0 ? (
          <div className="editorial-card mt-10 flex flex-col items-center justify-center px-6 py-16 text-center sm:py-20">
            <span
              aria-hidden="true"
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-mint)] text-lg font-bold text-[var(--brand-green-dark)]"
            >
              ✦
            </span>
            <h3 className="mt-4 text-lg font-bold tracking-[-0.02em] text-[var(--ink-primary)] sm:text-xl">
              Belum ada berita terbaru
            </h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--ink-muted)]">
              Kabar kegiatan dan prestasi Etoser akan segera hadir di sini.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {visibleNews.map((item) => {
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

                      <h3 className="mt-2.5 text-lg font-bold leading-snug tracking-[-0.025em] text-[var(--ink-primary)] transition-colors group-hover:text-[var(--brand-green-dark)] sm:text-xl">
                        {item.title}
                      </h3>

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
        )}
      </div>
    </section>
  );
}
