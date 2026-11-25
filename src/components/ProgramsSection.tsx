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
      className="section-anchor border-y border-black/6 bg-[var(--bg-canvas)] py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-green)]">
              Program Pembinaan
            </p>
            <h2
              id="program-heading"
              className="mt-3 text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.06] tracking-[-0.035em] text-[var(--ink-primary)]"
            >
              Tangguh dan Berdaya
            </h2>
          </div>

          <div
            role="group"
            aria-label="Filter kategori program"
            className="flex flex-wrap gap-2"
          >
            {PROGRAM_CATEGORIES.map((category) => {
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
                      : 'border-[var(--surface-pill-border)] bg-white text-[var(--ink-secondary)] hover:bg-[var(--surface-subtle)]'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                <span className="absolute left-3.5 top-3.5 inline-flex rounded-full bg-white/92 px-3 py-1 text-xs font-semibold text-[var(--brand-green-dark)] backdrop-blur-xs">
                  {program.category}
                </span>
              </div>

              <div className="p-6 sm:p-7">
                <h3 className="text-xl font-bold tracking-[-0.025em] text-[var(--ink-primary)]">
                  {program.title}
                </h3>

                <p className="mt-2.5 text-sm leading-relaxed text-[var(--ink-muted)]">
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
