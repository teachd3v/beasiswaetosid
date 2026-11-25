import { useEffect, useRef, useState } from 'react';
import { EtoserCard } from '../components/EtoserCard';
import { ETOSER_PROFILES, ETOSER_REGIONS } from '../data/etoserData';
import type { EtoserProfile, EtoserRegion } from '../data/etoserData';

interface EtoserCatalogPageProps {
  readonly onNavigate: (to: string) => void;
  readonly reducedMotion: boolean;
}

export function EtoserCatalogPage({
  onNavigate,
  reducedMotion,
}: EtoserCatalogPageProps) {
  const [selectedRegion, setSelectedRegion] = useState<EtoserRegion>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    document.title = 'Katalog Profil Etoser · ETOS ID';
  }, []);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredProfiles = ETOSER_PROFILES.filter((profile) => {
    const matchesRegion =
      selectedRegion === 'Semua' || profile.region === selectedRegion;
    if (!matchesRegion) return false;
    if (!normalizedQuery) return true;
    return (
      profile.name.toLowerCase().includes(normalizedQuery) ||
      profile.campusShort.toLowerCase().includes(normalizedQuery) ||
      profile.campusFull.toLowerCase().includes(normalizedQuery) ||
      profile.major.toLowerCase().includes(normalizedQuery) ||
      profile.interest.toLowerCase().includes(normalizedQuery)
    );
  });

  const activeProfile: EtoserProfile | null =
    activeIndex !== null ? (filteredProfiles[activeIndex] ?? null) : null;

  useEffect(() => {
    if (!activeProfile) return;

    closeBtnRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setActiveIndex(null);
        lastTriggerRef.current?.focus();
        return;
      }
      if (event.key === 'ArrowLeft' && filteredProfiles.length > 1) {
        event.preventDefault();
        setActiveIndex((prev) =>
          prev === null
            ? null
            : (prev - 1 + filteredProfiles.length) % filteredProfiles.length,
        );
        return;
      }
      if (event.key === 'ArrowRight' && filteredProfiles.length > 1) {
        event.preventDefault();
        setActiveIndex((prev) =>
          prev === null ? null : (prev + 1) % filteredProfiles.length,
        );
        return;
      }
      if (event.key === 'Tab' && drawerRef.current) {
        const focusables = Array.from(
          drawerRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), a[href]',
          ),
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeProfile, filteredProfiles.length]);

  const handleCloseDrawer = () => {
    setActiveIndex(null);
    lastTriggerRef.current?.focus();
  };

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
    <main className="flex-1 bg-[var(--surface-subtle)] py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <a
          href="/"
          onClick={(event) => handleLinkClick(event, '/')}
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--surface-pill-border)] bg-white px-4 py-1.5 text-xs font-semibold text-[var(--ink-secondary)] transition-colors hover:text-[var(--brand-green-dark)] sm:text-sm"
        >
          <span aria-hidden="true">←</span>
          <span>Kembali ke Beranda</span>
        </a>

        <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-green)]">
              Katalog Etoser · 15 Kampus Mitra
            </p>
            <h1 className="mt-3 text-[clamp(2.25rem,4.5vw,3.5rem)] font-bold leading-[1.06] tracking-[-0.035em] text-[var(--ink-primary)]">
              Profil Etoser Nusantara
            </h1>
          </div>

          <div className="w-full lg:max-w-sm">
            <label htmlFor="etoser-search" className="sr-only">
              Cari profil Etoser
            </label>
            <input
              id="etoser-search"
              type="search"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setActiveIndex(null);
              }}
              placeholder="Cari nama, kampus, jurusan, minat..."
              className="min-h-11 w-full rounded-2xl border border-[var(--surface-pill-border)] bg-white px-4 py-2.5 text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:border-[var(--brand-green)] focus:outline-none"
            />
          </div>
        </div>

        <div
          role="group"
          aria-label="Filter wilayah kampus mitra"
          className="mt-6 flex flex-wrap items-center gap-2"
        >
          {ETOSER_REGIONS.map((region) => {
            const active = selectedRegion === region;
            const count =
              region === 'Semua'
                ? ETOSER_PROFILES.length
                : ETOSER_PROFILES.filter((p) => p.region === region).length;
            return (
              <button
                key={region}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setSelectedRegion(region);
                  setActiveIndex(null);
                }}
                className={`min-h-10 rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors sm:text-sm ${
                  active
                    ? 'border-[var(--brand-green-dark)] bg-[var(--brand-green-dark)] text-white'
                    : 'border-[var(--surface-pill-border)] bg-white text-[var(--ink-secondary)] hover:bg-neutral-50'
                }`}
              >
                {region} ({count})
              </button>
            );
          })}
        </div>

        {filteredProfiles.length === 0 ? (
          <div className="editorial-card mt-10 px-6 py-16 text-center">
            <p className="text-base font-bold text-[var(--ink-primary)]">
              Profil Etoser tidak ditemukan
            </p>
            <p className="mt-1.5 text-sm text-[var(--ink-muted)]">
              Coba kata kunci lain atau pilih wilayah &ldquo;Semua&rdquo;.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProfiles.map((profile, idx) => (
              <EtoserCard
                key={profile.id}
                profile={profile}
                reducedMotion={reducedMotion}
                onSelect={(_, sourceEl) => {
                  lastTriggerRef.current = sourceEl;
                  setActiveIndex(idx);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {activeProfile && (
        <div
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="etoser-drawer-title"
          className="fixed inset-0 z-1000 flex items-end justify-end sm:items-stretch"
        >
          <div
            onClick={handleCloseDrawer}
            aria-hidden="true"
            className="lightbox-backdrop fixed inset-0"
          />

          <aside className="drawer-panel relative z-10 flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-[var(--radius-viewer)] border-l border-black/10 bg-white shadow-2xl sm:max-h-dvh sm:max-w-lg sm:rounded-none">
            <div className="flex items-center justify-between gap-3 border-b border-black/8 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <img
                  src={activeProfile.campusLogoSrc}
                  alt={`Logo ${activeProfile.campusFull}`}
                  className="h-7 w-7 object-contain"
                />
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-[var(--ink-primary)]">
                    {activeProfile.campusShort}
                  </p>
                  <p className="truncate text-[11px] text-[var(--ink-muted)]">
                    {activeProfile.region}
                  </p>
                </div>
              </div>

              <button
                ref={closeBtnRef}
                type="button"
                onClick={handleCloseDrawer}
                aria-label="Tutup profil Etoser"
                className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-black/14 bg-white px-3.5 py-1.5 text-xs font-semibold text-[var(--ink-primary)] transition-colors hover:bg-[var(--surface-subtle)] sm:text-sm"
              >
                <span aria-hidden="true">✕</span>
                <span>Tutup</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="aspect-16/10 w-full overflow-hidden rounded-2xl bg-[var(--surface-placeholder)]">
                <img
                  src={activeProfile.photoSrc}
                  alt={`Foto ${activeProfile.name}`}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-[var(--brand-mint)] px-3 py-1 text-xs font-semibold text-[var(--brand-green-dark)]">
                  {activeProfile.interest}
                </span>
                <span className="text-xs font-medium text-[var(--ink-muted)]">
                  {activeProfile.batch}
                </span>
              </div>

              <h2
                id="etoser-drawer-title"
                className="mt-3 text-2xl font-bold tracking-[-0.03em] text-[var(--ink-primary)]"
              >
                {activeProfile.name}
              </h2>
              <p className="mt-1 text-sm font-medium text-[var(--ink-secondary)]">
                {activeProfile.major} · {activeProfile.campusFull}
              </p>

              <p className="mt-4 text-sm leading-relaxed text-[var(--ink-muted)] sm:text-base">
                {activeProfile.bio}
              </p>

              <div className="mt-6 rounded-2xl bg-[var(--brand-mint)]/75 p-4 sm:p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-green-dark)]">
                  Proyek Sosial Daerah
                </p>
                <p className="mt-1.5 text-sm font-bold leading-snug text-[var(--ink-primary)] sm:text-base">
                  {activeProfile.projectTitle}
                </p>
              </div>

              <div className="mt-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-muted)]">
                  Capaian & Aktivitas
                </p>
                <ul className="mt-3 space-y-2.5">
                  {activeProfile.achievements.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-sm leading-relaxed text-[var(--ink-secondary)]"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--brand-green)]"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {filteredProfiles.length > 1 && (
              <div className="flex items-center justify-between gap-2 border-t border-black/8 bg-[var(--surface-subtle)]/60 px-6 py-4">
                <button
                  type="button"
                  onClick={() =>
                    setActiveIndex((prev) =>
                      prev === null
                        ? null
                        : (prev - 1 + filteredProfiles.length) %
                          filteredProfiles.length,
                    )
                  }
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-black/14 bg-white px-4 py-1.5 text-xs font-semibold text-[var(--ink-primary)] transition-colors hover:bg-neutral-50 sm:text-sm"
                >
                  <span aria-hidden="true">←</span>
                  <span>Sebelumnya</span>
                </button>

                <span className="text-xs font-medium text-[var(--ink-muted)]">
                  {(activeIndex ?? 0) + 1} / {filteredProfiles.length}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setActiveIndex((prev) =>
                      prev === null ? null : (prev + 1) % filteredProfiles.length,
                    )
                  }
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-black/14 bg-white px-4 py-1.5 text-xs font-semibold text-[var(--ink-primary)] transition-colors hover:bg-neutral-50 sm:text-sm"
                >
                  <span>Berikutnya</span>
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}
