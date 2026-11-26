import { useEffect, useMemo, useState } from 'react';
import {
  CORE_PROGRAM_TEAM,
  DEPARTMENT_HEAD,
  REGIONAL_FACILITATORS,
} from '../data/teamData';
import { fetchTeamData } from '../services/cmsApi';
import type { PublicTeamPayload } from '../services/cmsApi';

interface TeamPageProps {
  readonly onNavigate: (to: string) => void;
}

export function TeamPage({ onNavigate }: TeamPageProps) {
  const [team, setTeam] = useState<PublicTeamPayload>({
    departmentHead: DEPARTMENT_HEAD,
    coreProgramTeam: CORE_PROGRAM_TEAM,
    regionalFacilitators: REGIONAL_FACILITATORS,
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    document.title = 'Tim Kami · ETOS ID';
    const controller = new AbortController();
    void fetchTeamData(controller.signal).then((data) => {
      if (!controller.signal.aborted) {
        setTeam(data);
      }
    });
    return () => controller.abort();
  }, []);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredCampuses = useMemo(() => {
    if (!normalizedQuery) return team.regionalFacilitators;
    return team.regionalFacilitators.filter(
      (group) =>
        group.campusShort.toLowerCase().includes(normalizedQuery) ||
        group.campusFull.toLowerCase().includes(normalizedQuery) ||
        group.facilitators.some((f) =>
          f.name.toLowerCase().includes(normalizedQuery),
        ),
    );
  }, [team.regionalFacilitators, normalizedQuery]);

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

        <div className="mt-4 max-w-2xl sm:mt-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-green)] sm:text-xs">
            Struktur Pengelola
          </p>
          <h1 className="mt-1.5 text-[clamp(1.65rem,3.8vw,2.85rem)] font-bold leading-[1.08] tracking-[-0.035em] text-[var(--ink-primary)] sm:mt-2">
            Tim Kami
          </h1>
        </div>

        {/* Bagan Organisasi: Level 1 & Level 2 */}
        <section aria-label="Struktur pengelola pusat" className="mt-6 sm:mt-8">
          {/* Level 1: Ketua Departemen */}
          {team.departmentHead && (
            <div className="flex justify-center">
              <article className="editorial-card w-full max-w-sm overflow-hidden border-[var(--brand-green)]/30 shadow-xs">
                <div className="flex items-center gap-4 p-4 sm:flex-col sm:p-5 sm:text-center">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[var(--surface-placeholder)] ring-2 ring-[var(--brand-mint-strong)] sm:h-24 sm:w-24 sm:rounded-full">
                    <img
                      src={team.departmentHead.photoSrc}
                      alt={`Foto ${team.departmentHead.name}`}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <span className="inline-flex rounded-full bg-[var(--brand-green-dark)] px-2.5 py-0.5 text-[10px] font-semibold text-white sm:px-3 sm:py-1 sm:text-xs">
                      {team.departmentHead.role}
                    </span>
                    <h2 className="mt-1.5 text-base font-bold tracking-[-0.02em] text-[var(--ink-primary)] sm:mt-2 sm:text-xl">
                      {team.departmentHead.name}
                    </h2>
                  </div>
                </div>
              </article>
            </div>
          )}

          {/* Garis penghubung Level 1 -> Level 2 */}
          <div aria-hidden="true" className="flex flex-col items-center">
            <div className="h-5 w-0.5 bg-[var(--brand-green)]/35 sm:h-7" />
            <div className="hidden h-0.5 w-[66.7%] bg-[var(--brand-green)]/35 md:block" />
          </div>

          {/* Level 2: 3 Pengelola Program */}
          <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
            {team.coreProgramTeam.map((member) => (
              <div key={member.id} className="flex flex-col items-center">
                <div
                  aria-hidden="true"
                  className="hidden h-5 w-0.5 bg-[var(--brand-green)]/35 md:block"
                />
                <article className="editorial-card flex h-full w-full items-center gap-3.5 p-3.5 sm:flex-col sm:p-5 sm:text-center">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[var(--surface-placeholder)] ring-2 ring-[var(--brand-mint)] sm:h-20 sm:w-20 sm:rounded-full">
                    <img
                      src={member.photoSrc}
                      alt={`Foto ${member.name}`}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <span className="inline-flex rounded-full bg-[var(--brand-mint)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--brand-green-dark)] sm:px-3 sm:py-1 sm:text-xs">
                      {member.role}
                    </span>
                    <h3 className="mt-1.5 text-sm font-bold tracking-[-0.02em] text-[var(--ink-primary)] sm:mt-2 sm:text-lg">
                      {member.name}
                    </h3>
                  </div>
                </article>
              </div>
            ))}
          </div>

          {/* Garis penghubung Level 2 -> Level 3 */}
          <div aria-hidden="true" className="flex justify-center">
            <div className="h-6 w-0.5 bg-[var(--brand-green)]/35 sm:h-9" />
          </div>
        </section>

        {/* Level 3: Tim Fasilitator Daerah */}
        <section
          aria-labelledby="fasil-heading"
          className="editorial-card p-4 sm:p-6 lg:p-7"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-green)] sm:text-xs">
                Pendamping Wilayah · 15 Kampus Mitra
              </p>
              <h2
                id="fasil-heading"
                className="mt-1 text-lg font-bold tracking-[-0.025em] text-[var(--ink-primary)] sm:text-2xl"
              >
                Tim Fasilitator Daerah
              </h2>
            </div>

            <div className="w-full sm:w-64">
              <label htmlFor="fasil-search" className="sr-only">
                Cari kampus atau nama fasilitator
              </label>
              <input
                id="fasil-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Cari kampus atau nama fasil..."
                className="min-h-9 w-full rounded-xl border border-[var(--surface-pill-border)] bg-[var(--surface-subtle)]/60 px-3 py-1.5 text-xs text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:border-[var(--brand-green)] focus:bg-white focus:outline-none sm:min-h-10 sm:px-3.5 sm:text-sm"
              />
            </div>
          </div>

          {filteredCampuses.length === 0 ? (
            <p className="py-10 text-center text-sm text-[var(--ink-muted)]">
              Fasilitator atau kampus tidak ditemukan.
            </p>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {filteredCampuses.map((group) => (
                <div
                  key={group.campusShort}
                  className="rounded-2xl border border-black/8 bg-[var(--surface-subtle)]/55 p-3.5 sm:p-4"
                >
                  <div className="flex items-center gap-2.5 border-b border-black/6 pb-2.5">
                    <img
                      src={group.campusLogoSrc}
                      alt={`Logo ${group.campusFull}`}
                      loading="lazy"
                      decoding="async"
                      className="h-7 w-7 shrink-0 object-contain sm:h-8 sm:w-8"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-[var(--ink-primary)] sm:text-sm">
                        {group.campusShort}
                      </p>
                      <p className="truncate text-[10px] text-[var(--ink-muted)] sm:text-[11px]">
                        {group.campusFull}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2.5">
                    {group.facilitators.map((fasil) => (
                      <div
                        key={fasil.id}
                        className="flex flex-col items-center rounded-xl bg-white p-2.5 text-center shadow-2xs"
                      >
                        <div className="h-12 w-12 overflow-hidden rounded-full bg-[var(--surface-placeholder)] sm:h-14 sm:w-14">
                          <img
                            src={fasil.photoSrc}
                            alt={`Foto ${fasil.name}`}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <p className="mt-2 line-clamp-1 text-[11px] font-bold leading-tight text-[var(--ink-primary)] sm:text-xs">
                          {fasil.name}
                        </p>
                        <p className="mt-0.5 line-clamp-1 text-[9.5px] font-medium text-[var(--brand-green-dark)] sm:text-[10.5px]">
                          {fasil.role}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
