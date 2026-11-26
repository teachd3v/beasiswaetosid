import { useEffect, useMemo, useRef, useState } from 'react';
import { EtoserCard } from '../components/EtoserCard';
import { ETOSER_PROFILES } from '../data/etoserData';
import type { EtoserProfile } from '../data/etoserData';

interface EtoserCatalogPageProps {
  readonly onNavigate: (to: string) => void;
  readonly reducedMotion: boolean;
}

interface CampusGroup {
  readonly campusShort: string;
  readonly campusFull: string;
  readonly campusLogoSrc: string;
  readonly profiles: readonly EtoserProfile[];
}

export function EtoserCatalogPage({
  onNavigate,
  reducedMotion,
}: EtoserCatalogPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openCampuses, setOpenCampuses] = useState<ReadonlySet<string>>(
    () => new Set([ETOSER_PROFILES[0]?.campusShort ?? '']),
  );
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    document.title = 'Katalog Profil Etoser · ETOS ID';
  }, []);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredProfiles = useMemo(
    () =>
      ETOSER_PROFILES.filter((profile) => {
        if (!normalizedQuery) return true;
        return (
          profile.name.toLowerCase().includes(normalizedQuery) ||
          profile.campusShort.toLowerCase().includes(normalizedQuery) ||
          profile.campusFull.toLowerCase().includes(normalizedQuery) ||
          profile.major.toLowerCase().includes(normalizedQuery) ||
          profile.interest.toLowerCase().includes(normalizedQuery)
        );
      }),
    [normalizedQuery],
  );

  const campusGroups = useMemo<readonly CampusGroup[]>(() => {
    const map = new Map<string, EtoserProfile[]>();
    for (const profile of filteredProfiles) {
      const list = map.get(profile.campusShort);
      if (list) {
        list.push(profile);
      } else {
        map.set(profile.campusShort, [profile]);
      }
    }
    return Array.from(map.values()).map((profiles) => {
      const first = profiles[0];
      return {
        campusShort: first.campusShort,
        campusFull: first.campusFull,
        campusLogoSrc: first.campusLogoSrc,
        profiles,
      };
    });
  }, [filteredProfiles]);

  const activeIndex =
    activeProfileId !== null
      ? filteredProfiles.findIndex((p) => p.id === activeProfileId)
      : -1;
  const activeProfile: EtoserProfile | null =
    activeIndex >= 0 ? (filteredProfiles[activeIndex] ?? null) : null;

  const isSearching = normalizedQuery.length > 0;
  const allVisibleOpen =
    campusGroups.length > 0 &&
    campusGroups.every((group) => openCampuses.has(group.campusShort));

  const toggleCampus = (campusShort: string) => {
    setOpenCampuses((prev) => {
      const next = new Set(prev);
      if (next.has(campusShort)) {
        next.delete(campusShort);
      } else {
        next.add(campusShort);
      }
      return next;
    });
  };

  const handleToggleAllCampuses = () => {
    if (allVisibleOpen) {
      setOpenCampuses(new Set());
    } else {
      setOpenCampuses(new Set(campusGroups.map((g) => g.campusShort)));
    }
  };

  useEffect(() => {
    if (!activeProfile) return;

    closeBtnRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setActiveProfileId(null);
        lastTriggerRef.current?.focus();
        return;
      }
      if (event.key === 'ArrowLeft' && filteredProfiles.length > 1) {
        event.preventDefault();
        const prevIdx =
          (activeIndex - 1 + filteredProfiles.length) % filteredProfiles.length;
        setActiveProfileId(filteredProfiles[prevIdx]?.id ?? null);
        return;
      }
      if (event.key === 'ArrowRight' && filteredProfiles.length > 1) {
        event.preventDefault();
        const nextIdx = (activeIndex + 1) % filteredProfiles.length;
        setActiveProfileId(filteredProfiles[nextIdx]?.id ?? null);
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
  }, [activeIndex, activeProfile, filteredProfiles]);

  const handleCloseDrawer = () => {
    setActiveProfileId(null);
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
    <main className="flex-1 bg-[var(--surface-subtle)] py-7 sm:py-10 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <a
          href="/"
          onClick={(event) => handleLinkClick(event, '/')}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[var(--surface-pill-border)] bg-white px-3.5 py-1.5 text-xs font-semibold text-[var(--ink-secondary)] transition-colors hover:text-[var(--brand-green-dark)] sm:min-h-10 sm:px-4 sm:text-sm"
        >
          <span aria-hidden="true">←</span>
          <span>Kembali ke Beranda</span>
        </a>

        <div className="mt-4 flex flex-col gap-3 sm:mt-6 sm:gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-green)] sm:text-xs">
              Katalog Etoser · {campusGroups.length} Kampus Mitra
            </p>
            <h1 className="mt-1.5 text-[clamp(1.65rem,3.8vw,2.85rem)] font-bold leading-[1.08] tracking-[-0.035em] text-[var(--ink-primary)] sm:mt-2">
              Profil Etoser Nusantara
            </h1>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto">
            <div className="w-full sm:w-72">
              <label htmlFor="etoser-search" className="sr-only">
                Cari profil Etoser
              </label>
              <input
                id="etoser-search"
                type="search"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setActiveProfileId(null);
                }}
                placeholder="Cari nama, kampus, jurusan..."
                className="min-h-10 w-full rounded-xl border border-[var(--surface-pill-border)] bg-white px-3.5 py-2 text-xs text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:border-[var(--brand-green)] focus:outline-none sm:min-h-11 sm:rounded-2xl sm:px-4 sm:text-sm"
              />
            </div>

            {!isSearching && campusGroups.length > 1 && (
              <button
                type="button"
                onClick={handleToggleAllCampuses}
                className="min-h-9 self-start whitespace-nowrap rounded-full border border-[var(--surface-pill-border)] bg-white px-3.5 py-1.5 text-[11px] font-semibold text-[var(--brand-green-dark)] transition-colors hover:bg-[var(--brand-mint)] sm:min-h-11 sm:self-auto sm:px-4 sm:py-2 sm:text-xs"
              >
                {allVisibleOpen ? 'Tutup Semua' : 'Buka Semua'}
              </button>
            )}
          </div>
        </div>

        {campusGroups.length === 0 ? (
          <div className="editorial-card mt-6 px-6 py-12 text-center">
            <p className="text-base font-bold text-[var(--ink-primary)]">
              Profil Etoser tidak ditemukan
            </p>
            <p className="mt-1.5 text-sm text-[var(--ink-muted)]">
              Coba kata kunci pencarian lainnya.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-2.5 sm:mt-7 sm:space-y-3">
            {campusGroups.map((group) => {
              const isOpen = isSearching || openCampuses.has(group.campusShort);
              return (
                <section
                  key={group.campusShort}
                  aria-labelledby={`campus-trigger-${group.campusShort}`}
                  className={`editorial-card overflow-hidden transition-colors ${
                    isOpen ? 'border-[var(--brand-green)]/30' : ''
                  }`}
                >
                  <button
                    id={`campus-trigger-${group.campusShort}`}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`campus-panel-${group.campusShort}`}
                    onClick={() => toggleCampus(group.campusShort)}
                    className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left transition-colors hover:bg-[var(--surface-subtle)]/50 sm:px-5 sm:py-4"
                  >
                    <div className="flex min-w-0 items-center gap-3 sm:gap-3.5">
                      <img
                        src={group.campusLogoSrc}
                        alt={`Logo ${group.campusFull}`}
                        loading="lazy"
                        decoding="async"
                        className="h-8 w-8 shrink-0 object-contain sm:h-10 sm:w-10"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold tracking-tight text-[var(--ink-primary)] sm:text-base">
                          {group.campusShort}
                        </p>
                        <p className="truncate text-[11px] text-[var(--ink-muted)] sm:text-xs">
                          {group.campusFull}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                      <span className="rounded-full bg-[var(--brand-mint)] px-2.5 py-0.5 text-[10.5px] font-semibold text-[var(--brand-green-dark)] sm:px-3 sm:py-1 sm:text-xs">
                        {group.profiles.length} Etoser
                      </span>
                      <span
                        aria-hidden="true"
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-300 sm:h-8 sm:w-8 ${
                          isOpen
                            ? 'rotate-45 border-[var(--brand-green-dark)] bg-[var(--brand-green-dark)] text-white'
                            : 'border-black/12 bg-[var(--surface-subtle)] text-[var(--ink-primary)]'
                        }`}
                      >
                        <svg
                          viewBox="0 0 16 16"
                          fill="none"
                          className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                        >
                          <path
                            d="M8 3.25V12.75M3.25 8H12.75"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                    </div>
                  </button>

                  <div
                    id={`campus-panel-${group.campusShort}`}
                    role="region"
                    aria-labelledby={`campus-trigger-${group.campusShort}`}
                    className={`faq-accordion-content ${isOpen ? 'is-open' : ''}`}
                  >
                    <div className="faq-accordion-inner">
                      <div className="border-t border-black/6 bg-[var(--surface-subtle)]/40 p-3 sm:p-5">
                        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                          {group.profiles.map((profile) => (
                            <EtoserCard
                              key={profile.id}
                              profile={profile}
                              reducedMotion={reducedMotion}
                              onSelect={(selected, sourceEl) => {
                                lastTriggerRef.current = sourceEl;
                                setActiveProfileId(selected.id);
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              );
            })}
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
              <div className="flex min-w-0 items-center gap-2.5">
                <img
                  src={activeProfile.campusLogoSrc}
                  alt={`Logo ${activeProfile.campusFull}`}
                  className="h-7 w-7 shrink-0 object-contain"
                />
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-[var(--ink-primary)]">
                    {activeProfile.campusShort}
                  </p>
                  <p className="truncate text-[11px] text-[var(--ink-muted)]">
                    {activeProfile.campusFull}
                  </p>
                </div>
              </div>

              <button
                ref={closeBtnRef}
                type="button"
                onClick={handleCloseDrawer}
                aria-label="Tutup profil Etoser"
                className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border border-black/14 bg-white px-3.5 py-1.5 text-xs font-semibold text-[var(--ink-primary)] transition-colors hover:bg-[var(--surface-subtle)] sm:text-sm"
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
              <div className="flex items-center justify-between gap-2 border-t border-black/8 bg-[var(--surface-subtle)]/60 px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
                <button
                  type="button"
                  onClick={() => {
                    const prevIdx =
                      (activeIndex - 1 + filteredProfiles.length) %
                      filteredProfiles.length;
                    setActiveProfileId(filteredProfiles[prevIdx]?.id ?? null);
                  }}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-black/14 bg-white px-4 py-2 text-xs font-semibold text-[var(--ink-primary)] transition-colors hover:bg-neutral-50 sm:text-sm"
                >
                  <span aria-hidden="true">←</span>
                  <span>Sebelumnya</span>
                </button>

                <span className="text-xs font-medium text-[var(--ink-muted)]">
                  {activeIndex + 1} / {filteredProfiles.length}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    const nextIdx = (activeIndex + 1) % filteredProfiles.length;
                    setActiveProfileId(filteredProfiles[nextIdx]?.id ?? null);
                  }}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-black/14 bg-white px-4 py-2 text-xs font-semibold text-[var(--ink-primary)] transition-colors hover:bg-neutral-50 sm:text-sm"
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
