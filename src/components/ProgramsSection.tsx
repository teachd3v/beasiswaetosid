import { useState } from 'react';
import { ETOS_PROGRAMS, PROGRAM_CATEGORIES } from '../data/programsData';
import type { ProgramCategory } from '../data/programsData';

export function ProgramsSection() {
  const [selectedCategory, setSelectedCategory] = useState<ProgramCategory>('Semua');

  const filteredPrograms =
    selectedCategory === 'Semua'
      ? ETOS_PROGRAMS
      : ETOS_PROGRAMS.filter((p) => p.category === selectedCategory);

  return (
    <section
      id="program"
      aria-labelledby="program-heading"
      className="section-anchor border-y border-black/6 bg-[var(--bg-canvas)] py-9 sm:py-12 lg:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex flex-col gap-3 sm:gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-green)] sm:text-xs">
              Program Pembinaan
            </p>
            <h2
              id="program-heading"
              className="mt-1.5 text-[clamp(1.6rem,3.6vw,2.85rem)] font-bold leading-[1.08] tracking-[-0.035em] text-[var(--ink-primary)] sm:mt-2"
            >
              Tangguh dan Berdaya
            </h2>
          </div>

          <div
            role="group"
            aria-label="Filter kategori program"
            className="flex flex-wrap gap-1.5 sm:gap-2"
          >
            {PROGRAM_CATEGORIES.map((category) => {
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
                      : 'border-[var(--surface-pill-border)] bg-white text-[var(--ink-secondary)] hover:bg-[var(--surface-subtle)]'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-7 sm:gap-4 lg:grid-cols-3">
          {filteredPrograms.map((program) => (
            <article
              key={program.id}
              className="editorial-card group flex flex-col overflow-hidden"
            >
              <div className="relative aspect-16/10 w-full overflow-hidden bg-[var(--surface-placeholder)]">
                <img
                  src={program.imageSrc}
                  alt={program.imageAlt}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-103"
                />
                <span className="absolute left-2 top-2 inline-flex rounded-full bg-white/92 px-2 py-0.5 text-[10px] font-semibold text-[var(--brand-green-dark)] backdrop-blur-xs sm:left-3 sm:top-3 sm:px-3 sm:py-1 sm:text-xs">
                  {program.category}
                </span>
              </div>

              <div className="p-3 sm:p-5">
                <h3 className="text-xs font-bold leading-snug tracking-[-0.02em] text-[var(--ink-primary)] sm:text-lg">
                  {program.title}
                </h3>

                <p className="mt-2 hidden text-sm leading-relaxed text-[var(--ink-muted)] sm:block">
                  {program.shortDesc}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
