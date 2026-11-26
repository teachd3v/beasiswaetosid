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
      className="section-anchor bg-[var(--surface-subtle)] py-9 sm:py-12 lg:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="grid gap-3 sm:gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-green)] sm:text-xs">
              Tentang Kami
            </p>
            <h2
              id="about-heading"
              className="mt-1.5 text-[clamp(1.6rem,3.6vw,2.85rem)] font-bold leading-[1.08] tracking-[-0.035em] text-[var(--ink-primary)] sm:mt-2"
            >
              Cetak SDM Strategis Daerah
            </h2>
          </div>

          <div className="lg:col-span-5">
            <p className="text-sm leading-relaxed text-[var(--ink-muted)] sm:text-base">
              Program Beasiswa Pembinaan Sarjana naungan GREAT Edunesia Dompet Dhuafa.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:mt-7 sm:gap-3 lg:grid-cols-5">
          {ABOUT_METRICS.map((metric, idx) => (
            <div
              key={metric.label}
              className={`editorial-card flex flex-col p-3 sm:p-4 ${
                idx === ABOUT_METRICS.length - 1 ? 'col-span-2 lg:col-span-1' : ''
              }`}
            >
              <p className="whitespace-nowrap text-base font-extrabold leading-tight tracking-[-0.03em] text-[var(--brand-green-dark)] sm:text-xl lg:text-[clamp(1.15rem,1.45vw,1.5rem)]">
                {metric.value}
              </p>
              <p className="mt-0.5 text-[11px] font-medium leading-snug text-[var(--ink-secondary)] sm:mt-1.5 sm:text-xs">
                {metric.label}
              </p>
            </div>
          ))}
        </div>

        <div className="editorial-card mt-4 p-4 sm:mt-6 sm:p-7">
          <div
            role="tablist"
            aria-label="Informasi mendalam tentang ETOS ID"
            className="grid w-full grid-cols-3 gap-1 rounded-xl bg-[var(--surface-subtle)] p-1 sm:inline-flex sm:w-auto sm:gap-1.5 sm:rounded-2xl sm:p-1.5"
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
                  className={`min-h-9 whitespace-nowrap rounded-lg px-2 py-1.5 text-center text-[11px] font-semibold transition-colors sm:min-h-10 sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm ${
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
            className="mt-4 sm:mt-6"
          >
            {activeTab === 'visi-misi' && (
              <div className="grid gap-4 sm:gap-6 lg:grid-cols-12">
                <div className="rounded-2xl bg-[var(--brand-mint)]/70 p-4 sm:p-6 lg:col-span-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-green-dark)] sm:text-xs">
                    Visi ETOS ID
                  </p>
                  <p className="mt-2 text-base font-semibold leading-snug tracking-[-0.02em] text-[var(--ink-primary)] sm:mt-2.5 sm:text-lg">
                    “{VISION_TEXT}”
                  </p>
                </div>

                <div className="lg:col-span-7">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-muted)] sm:text-xs">
                    Misi Utama
                  </p>
                  <ol className="mt-2.5 space-y-2.5 sm:mt-3 sm:space-y-3">
                    {MISSION_LIST.map((mission, idx) => (
                      <li
                        key={mission}
                        className="flex items-start gap-3 rounded-xl border border-black/6 bg-[var(--surface-subtle)]/60 p-3 sm:gap-3.5 sm:rounded-2xl sm:p-4"
                      >
                        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand-green)] text-[11px] font-bold text-white sm:h-8 sm:w-8 sm:text-xs">
                          0{idx + 1}
                        </span>
                        <p className="pt-0.5 text-xs leading-relaxed text-[var(--ink-secondary)] sm:text-sm">
                          {mission}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            {activeTab === 'nilai' && (
              <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
                {CORE_VALUES.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-black/8 bg-[var(--surface-subtle)]/55 p-3.5 sm:rounded-2xl sm:p-5"
                  >
                    <h3 className="text-base font-bold tracking-[-0.025em] text-[var(--brand-green-dark)] sm:text-lg">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-[var(--ink-muted)] sm:mt-2 sm:text-sm">
                      {item.summary}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'kampus' && (
              <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-5">
                {PARTNER_CAMPUSES.map((campus) => (
                  <li
                    key={campus.shortName}
                    title={campus.fullName}
                    className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-black/8 bg-[var(--surface-subtle)]/70 px-2 py-2.5 text-center transition-colors hover:border-[var(--brand-green)]/30 hover:bg-white sm:gap-2.5 sm:rounded-2xl sm:px-4 sm:py-4"
                  >
                    <img
                      src={campus.logoSrc}
                      alt={`Logo ${campus.fullName}`}
                      loading="lazy"
                      decoding="async"
                      className="h-9 w-9 object-contain select-none sm:h-14 sm:w-14"
                    />
                    <span className="text-[11px] font-bold tracking-tight text-[var(--ink-primary)] sm:text-sm">
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
