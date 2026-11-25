import { useRef, useState } from 'react';
import { ALUMNI_TESTIMONIALS } from '../data/testimonialsData';

export function TestimonialsSection() {
  const [flippedIds, setFlippedIds] = useState<ReadonlySet<string>>(() => new Set());
  const trackRef = useRef<HTMLDivElement | null>(null);

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
    const step = Math.max(300, Math.round(track.clientWidth * 0.72));
    track.scrollBy({
      left: direction === 'next' ? step : -step,
      behavior: 'smooth',
    });
  };

  return (
    <section
      id="testimoni"
      aria-labelledby="testimonials-heading"
      className="section-anchor bg-[var(--surface-subtle)] py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-green)]">
              Testimoni Alumni
            </p>
            <h2
              id="testimonials-heading"
              className="mt-3 text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.06] tracking-[-0.035em] text-[var(--ink-primary)]"
            >
              Suara Alumni
            </h2>
          </div>

          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <p className="text-xs font-medium text-[var(--ink-muted)] sm:text-sm">
              Geser atau klik foto untuk baca testimoni ↻
            </p>

            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={() => scrollTrack('prev')}
                aria-label="Geser testimoni ke kiri"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--surface-pill-border)] bg-white text-sm font-semibold text-[var(--ink-primary)] transition-colors hover:bg-neutral-100"
              >
                <span aria-hidden="true">←</span>
              </button>
              <button
                type="button"
                onClick={() => scrollTrack('next')}
                aria-label="Geser testimoni ke kanan"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--surface-pill-border)] bg-white text-sm font-semibold text-[var(--ink-primary)] transition-colors hover:bg-neutral-100"
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
          className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2"
        >
          {ALUMNI_TESTIMONIALS.map((item) => {
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
                className="flip-scene group block h-[270px] w-[240px] shrink-0 snap-start text-left focus-visible:rounded-[var(--radius-card)] sm:h-[285px] sm:w-[260px] lg:h-[295px] lg:w-[270px]"
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
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/82 via-black/22 to-black/10"
                    />

                    <span
                      aria-hidden="true"
                      className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-xs font-bold text-[var(--brand-green-dark)] backdrop-blur-xs transition-transform duration-300 group-hover:rotate-90"
                    >
                      ↻
                    </span>

                    <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">
                      <p className="text-base font-bold leading-tight tracking-[-0.02em] sm:text-lg">
                        {item.name}
                      </p>
                      <p className="mt-1 text-xs font-medium text-white/85">
                        {item.campus} · {item.batch}
                      </p>
                    </div>
                  </div>

                  {/* Sisi Belakang: Isi Testimoni Lengkap */}
                  <div className="flip-card-face flip-card-back flex flex-col justify-between border border-[var(--brand-green-dark)] bg-[var(--brand-green-dark)] p-4 text-white sm:p-5">
                    <div className="min-h-0 overflow-y-auto no-scrollbar">
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="font-semibold uppercase tracking-[0.12em] text-[var(--brand-mint-strong)]">
                          Alumni {item.campus}
                        </span>
                        <span className="text-white/75">{item.batch}</span>
                      </div>

                      <p className="mt-3 text-xs leading-relaxed text-white/95 sm:text-[13px]">
                        “{item.testimonial}”
                      </p>
                    </div>

                    <div className="mt-3 border-t border-white/15 pt-3">
                      <p className="line-clamp-1 text-[11px] font-semibold text-[var(--brand-mint-strong)]">
                        {item.impact}
                      </p>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-white/80">
                        <span className="font-semibold text-white">{item.name}</span>
                        <span>Kembali ↺</span>
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
