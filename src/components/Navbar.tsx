import { useState } from 'react';
import type { SectionId } from '../hooks/useActiveSection';

interface NavbarProps {
  readonly isHome: boolean;
  readonly activeSection: SectionId;
  readonly isOrbitPaused: boolean;
  readonly onToggleOrbit: () => void;
  readonly onNavigate: (to: string) => void;
  readonly reducedMotion: boolean;
}

const NAV_LINKS: readonly { readonly id: SectionId; readonly label: string }[] = [
  { id: 'top', label: 'Beranda' },
  { id: 'tentang-kami', label: 'Tentang Kami' },
  { id: 'program', label: 'Program' },
  { id: 'testimoni', label: 'Testimoni' },
  { id: 'berita', label: 'Berita' },
  { id: 'faq', label: 'FAQ' },
];

export function Navbar({
  isHome,
  activeSection,
  isOrbitPaused,
  onToggleOrbit,
  onNavigate,
  reducedMotion,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSectionClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    id: SectionId,
  ) => {
    setMobileMenuOpen(false);
    if (!isHome) {
      event.preventDefault();
      onNavigate(id === 'top' ? '/' : `/#${id}`);
    }
  };

  return (
    <header className="nav-backdrop sticky top-0 z-900 border-b border-black/6">
      <nav
        aria-label="Navigasi utama"
        className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-8 sm:py-3.5"
      >
        <a
          href={isHome ? '#top' : '/'}
          aria-label="ETOS ID - ke awal halaman"
          onClick={(event) => handleSectionClick(event, 'top')}
          className="inline-flex min-h-11 items-center rounded-lg px-1"
        >
          <img
            src="/logo/etos-id_net.svg"
            alt="Logo ETOS ID"
            width={118}
            height={40}
            className="h-8 w-auto select-none sm:h-9"
          />
        </a>

        <ul className="hidden items-center gap-0.5 rounded-full border border-[var(--surface-pill-border)] bg-white/75 p-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const isActive = isHome
              ? activeSection === link.id
              : link.id === 'berita';
            const href = isHome ? `#${link.id}` : link.id === 'top' ? '/' : `/#${link.id}`;
            return (
              <li key={link.id}>
                <a
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={(event) => handleSectionClick(event, link.id)}
                  className={`inline-flex min-h-9 items-center whitespace-nowrap rounded-full px-3.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--brand-green-dark)] text-white'
                      : 'text-[var(--ink-secondary)] hover:bg-black/5 hover:text-[var(--ink-primary)]'
                  }`}
                >
                  {link.label}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="flex shrink-0 items-center gap-2">
          {isHome && !reducedMotion && (
            <button
              type="button"
              onClick={onToggleOrbit}
              aria-pressed={isOrbitPaused}
              className="inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-full border border-[var(--surface-pill-border)] bg-white/90 px-3 py-2 text-xs font-medium text-[var(--ink-primary)] transition-colors hover:bg-neutral-100 sm:gap-2 sm:px-4 sm:text-sm"
            >
              <span
                aria-hidden="true"
                className={`h-2 w-2 rounded-full ${
                  isOrbitPaused ? 'bg-neutral-400' : 'bg-[var(--brand-green)]'
                }`}
              />
              <span>{isOrbitPaused ? 'Putar Orbit' : 'Jeda Orbit'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-section-nav"
            aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-[var(--surface-pill-border)] bg-white/90 text-sm font-medium text-[var(--ink-primary)] transition-colors hover:bg-neutral-100 lg:hidden"
          >
            <span aria-hidden="true">{mobileMenuOpen ? '✕' : '☰'}</span>
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div
          id="mobile-section-nav"
          className="border-t border-black/6 bg-white/95 px-4 py-3 lg:hidden"
        >
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = isHome
                ? activeSection === link.id
                : link.id === 'berita';
              const href = isHome ? `#${link.id}` : link.id === 'top' ? '/' : `/#${link.id}`;
              return (
                <li key={link.id}>
                  <a
                    href={href}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={(event) => handleSectionClick(event, link.id)}
                    className={`flex min-h-11 items-center rounded-xl px-3.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[var(--brand-mint)] text-[var(--brand-green-dark)]'
                        : 'text-[var(--ink-secondary)] hover:bg-black/5'
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </header>
  );
}
