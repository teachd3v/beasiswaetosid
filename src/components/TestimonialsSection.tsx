import { useEffect, useRef, useState } from 'react';
import { ALUMNI_TESTIMONIALS } from '../data/testimonialsData';
import type { AlumniTestimonial } from '../data/testimonialsData';
import { fetchTestimonials } from '../services/cmsApi';

export function TestimonialsSection() {
  const [items, setItems] = useState<readonly AlumniTestimonial[]>(ALUMNI_TESTIMONIALS);
  const [flippedIds, setFlippedIds] = useState<ReadonlySet<string>>(() => new Set());
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void fetchTestimonials(controller.signal).then((data) => {
      if (!controller.signal.aborted) {
        setItems(data);
      }
    });
    return () => controller.abort();
  }, []);

  const toggleCard = (id: string) => {
    setFlippedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const scrollTrack = (direction: 'prev' | 'next') => {
    const track = trackRef.current;
    if (!track) return;
    const step = Math.max(260, Math.round(track.clientWidth * 0.72));
    track.scrollBy({
      left: direction === 'next' ? step : -step,
      behavior: 'smooth',
    });
  };

  return (
    <section
      id="testimoni"
      aria-labelledby="testimonials-heading"
      className="section-anchor bg-[var(--surface-subtle)] py-9 sm:py-12 lg:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-green)] sm:text-xs">
              Testimoni Alumni
            </p>
            <h2
              id="testimonials-heading"
              className="mt-1.5 text-[clamp(1.6rem,3.6vw,2.85rem)] font-bold leading-[1.08] tracking-[-0.035em] text-[var(--ink-primary)] sm:mt-2"
            >
              Suara Alumni
            </h2>
          </div>

          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <p className="text-[11px] font-medium text-[var(--ink-muted)] sm:text-sm">
              Geser atau klik foto untuk baca testimoni ↻
            </p>

            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={() => scrollTrack('prev')}
                aria-label="Geser testimoni ke kiri"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--surface-pill-border)] bg-white text-sm font-semibold text-[var(--ink-primary)] transition-colors hover:bg-neutral-100"
              >
                <span aria-hidden="true">←</span>
              </button>
              <button
                type="button"
                onClick={() => scrollTrack('next')}
                aria-label="Geser testimoni ke kanan"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--surface-pill-border)] bg-white text-sm font-semibold text-[var(--ink-primary)] transition-colors hover:bg-neutral-100"
              >
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>

        <div
          ref={trackRef}
          role="region"
          aria-label="Daftar testimoni alumni ETOS ID"
          className="no-scrollbar mt-5 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 sm:mt-7 sm:gap-4"
        >
          {items.map((item) => {
            const isFlipped = flippedIds.has(item.id);
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={isFlipped}
                aria-label={`${item.name}, ${item.campus} ${item.batch}. ${
                  isFlipped
                    ? 'Kembali ke foto alumni'
                    : 'Balik kartu untuk membaca testimoni'
                }`}
                onClick={() => toggleCard(item.id)}
                className="flip-scene group block h-[160px] w-[calc((100%-1rem)/3)] min-w-[104px] shrink-0 snap-start text-left transition-transform active:scale-[0.98] focus-visible:rounded-[var(--radius-card)] sm:h-[245px] sm:w-[225px] lg:h-[260px] lg:w-[245px]"
              >
                <div className={`flip-card-inner ${isFlipped ? 'is-flipped' : ''}`}>
                  {/* Sisi Depan: Full Gambar + Nama, Kampus, Angkatan */}
                  <div className="flip-card-face relative overflow-hidden border border-black/10 bg-[var(--surface-placeholder)]">
                    <img
                      src={item.photoSrc}
                      alt={`Foto alumni ${item.name}`}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-104"
                    />

                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10"
                    />

                    <span
                      aria-hidden="true"
                      className="absolute right-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-[10px] font-bold text-[var(--brand-green-dark)] backdrop-blur-xs transition-transform duration-300 group-hover:rotate-90 sm:right-3 sm:top-3 sm:h-8 sm:w-8 sm:text-xs"
                    >
                      ↻
                    </span>

                    <div className="absolute inset-x-0 bottom-0 p-2 text-white sm:p-4">
                      <p className="line-clamp-1 text-[11px] font-bold leading-tight tracking-[-0.02em] sm:text-base">
                        {item.name}
                      </p>
                      <p className="mt-0.5 line-clamp-1 text-[9px] font-medium text-white/85 sm:mt-1 sm:text-xs">
                        {item.campus} · {item.batch}
                      </p>
                    </div>
                  </div>

                  {/* Sisi Belakang: Isi Testimoni Lengkap */}
                  <div className="flip-card-face flip-card-back flex flex-col justify-between border border-[var(--brand-green-dark)] bg-[var(--brand-green-dark)] p-2.5 text-white sm:p-4">
                    <div className="min-h-0 overflow-y-auto no-scrollbar">
                      <div className="flex items-center justify-between gap-1 text-[9px] sm:text-[11px]">
                        <span className="truncate font-semibold uppercase tracking-[0.08em] text-[var(--brand-mint-strong)]">
                          {item.campus}
                        </span>
                        <span className="hidden text-white/75 sm:inline">{item.batch}</span>
                      </div>

                      <p className="mt-1.5 text-[10px] leading-snug text-white/95 sm:mt-2.5 sm:text-xs sm:leading-relaxed">
                        “{item.testimonial}”
                      </p>
                    </div>

                    <div className="mt-1.5 border-t border-white/15 pt-1.5 sm:mt-2.5 sm:pt-2.5">
                      <p className="hidden line-clamp-1 text-[11px] font-semibold text-[var(--brand-mint-strong)] sm:block">
                        {item.impact}
                      </p>
                      <div className="flex items-center justify-between text-[9px] text-white/85 sm:mt-1 sm:text-[11px]">
                        <span className="truncate font-semibold text-white">
                          {item.name}
                        </span>
                        <span className="shrink-0">↺</span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
