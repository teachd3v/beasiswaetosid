import { useState } from 'react';
import {
  ABOUT_METRICS,
  CORE_VALUES,
  MISSION_LIST,
  PARTNER_CAMPUSES,
  VISION_TEXT,
} from '../data/aboutData';

type AboutTab = 'visi-misi' | 'nilai' | 'kampus';

const ABOUT_TABS: readonly { readonly id: AboutTab; readonly label: string }[] = [
  { id: 'visi-misi', label: 'Visi & Misi' },
  { id: 'nilai', label: '4 Nilai Utama' },
  { id: 'kampus', label: 'Kampus Mitra' },
];

export function AboutSection() {
  const [activeTab, setActiveTab] = useState<AboutTab>('visi-misi');

  return (
    <section
      id="tentang-kami"
      aria-labelledby="about-heading"
      className="section-anchor bg-[var(--surface-subtle)] py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-green)]">
              Tentang Kami
            </p>
            <h2
              id="about-heading"
              className="mt-3 text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.06] tracking-[-0.035em] text-[var(--ink-primary)]"
            >
              Cetak SDM Strategis Daerah
            </h2>
          </div>

          <div className="lg:col-span-5">
            <p className="text-base leading-relaxed text-[var(--ink-muted)] sm:text-lg">
              Program Beasiswa Pembinaan Sarjana naungan GREAT Edunesia Dompet Dhuafa.
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ABOUT_METRICS.map((metric) => (
            <div key={metric.label} className="editorial-card p-6">
              <p className="text-[clamp(1.65rem,2.8vw,2.25rem)] font-extrabold tracking-[-0.04em] text-[var(--brand-green-dark)]">
                {metric.value}
              </p>
              <p className="mt-2 text-sm font-medium text-[var(--ink-secondary)]">
                {metric.label}
              </p>
            </div>
          ))}
        </div>

        <div className="editorial-card mt-8 p-6 sm:p-10">
          <div
            role="tablist"
            aria-label="Informasi mendalam tentang ETOS ID"
            className="inline-flex flex-wrap gap-2 rounded-2xl bg-[var(--surface-subtle)] p-1.5"
          >
            {ABOUT_TABS.map((tab) => {
              const selected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`about-tab-${tab.id}`}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  aria-controls={`about-panel-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`min-h-11 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                    selected
                      ? 'bg-[var(--brand-green-dark)] text-white shadow-xs'
                      : 'text-[var(--ink-secondary)] hover:bg-white/80 hover:text-[var(--ink-primary)]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div
            id={`about-panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`about-tab-${activeTab}`}
            className="mt-8"
          >
            {activeTab === 'visi-misi' && (
              <div className="grid gap-8 lg:grid-cols-12">
                <div className="rounded-2xl bg-[var(--brand-mint)]/70 p-6 sm:p-8 lg:col-span-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-green-dark)]">
                    Visi ETOS ID
                  </p>
                  <p className="mt-3 text-lg font-semibold leading-snug tracking-[-0.02em] text-[var(--ink-primary)] sm:text-xl">
                    “{VISION_TEXT}”
                  </p>
                </div>

                <div className="lg:col-span-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-muted)]">
                    Misi Utama
                  </p>
                  <ol className="mt-4 space-y-4">
                    {MISSION_LIST.map((mission, idx) => (
                      <li
                        key={mission}
                        className="flex items-start gap-4 rounded-2xl border border-black/6 bg-[var(--surface-subtle)]/60 p-4 sm:p-5"
                      >
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand-green)] text-xs font-bold text-white">
                          0{idx + 1}
                        </span>
                        <p className="pt-0.5 text-sm leading-relaxed text-[var(--ink-secondary)] sm:text-base">
                          {mission}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            {activeTab === 'nilai' && (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {CORE_VALUES.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-black/8 bg-[var(--surface-subtle)]/55 p-6"
                  >
                    <h3 className="text-xl font-bold tracking-[-0.025em] text-[var(--brand-green-dark)]">
                      {item.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-[var(--ink-muted)]">
                      {item.summary}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'kampus' && (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                {PARTNER_CAMPUSES.map((campus) => (
                  <li
                    key={campus.shortName}
                    title={campus.fullName}
                    className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-black/8 bg-[var(--surface-subtle)]/70 px-4 py-5 text-center transition-colors hover:border-[var(--brand-green)]/30 hover:bg-white"
                  >
                    <img
                      src={campus.logoSrc}
                      alt={`Logo ${campus.fullName}`}
                      loading="lazy"
                      decoding="async"
                      className="h-14 w-14 object-contain select-none sm:h-16 sm:w-16"
                    />
                    <span className="text-sm font-bold tracking-tight text-[var(--ink-primary)]">
                      {campus.shortName}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
