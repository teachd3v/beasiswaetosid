import { useEffect, useState } from 'react';
import type { SectionId } from '../hooks/useActiveSection';
import type { AppRoute } from '../hooks/useRoute';

interface NavbarProps {
  readonly routeKind: AppRoute['kind'];
  readonly activeSection: SectionId;
  readonly onNavigate: (to: string) => void;
}

type NavEntry =
  | { readonly kind: 'section'; readonly id: SectionId; readonly label: string }
  | {
      readonly kind: 'page';
      readonly path: string;
      readonly routeKey: AppRoute['kind'];
      readonly label: string;
    };

const NAV_ENTRIES: readonly NavEntry[] = [
  { kind: 'section', id: 'top', label: 'Beranda' },
  { kind: 'section', id: 'tentang-kami', label: 'Tentang Kami' },
  { kind: 'section', id: 'program', label: 'Program' },
  { kind: 'page', path: '/etoser', routeKey: 'etoser', label: 'Etoser' },
  { kind: 'page', path: '/tim-kami', routeKey: 'team', label: 'Tim Kami' },
  { kind: 'section', id: 'testimoni', label: 'Testimoni' },
  { kind: 'section', id: 'berita', label: 'Berita' },
  { kind: 'section', id: 'faq', label: 'FAQ' },
];

export function Navbar({ routeKind, activeSection, onNavigate }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isHome = routeKind === 'home';

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const handleEntryClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    entry: NavEntry,
  ) => {
    setMobileMenuOpen(false);
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }

    if (entry.kind === 'page') {
      event.preventDefault();
      onNavigate(entry.path);
      return;
    }

    if (!isHome) {
      event.preventDefault();
      onNavigate(entry.id === 'top' ? '/' : `/#${entry.id}`);
    }
  };

  const isEntryActive = (entry: NavEntry): boolean => {
    if (entry.kind === 'page') {
      return routeKind === entry.routeKey;
    }
    if (isHome) {
      return activeSection === entry.id;
    }
    return (
      (routeKind === 'news-list' || routeKind === 'news-detail') &&
      entry.id === 'berita'
    );
  };

  const getEntryHref = (entry: NavEntry): string => {
    if (entry.kind === 'page') return entry.path;
    return isHome ? `#${entry.id}` : entry.id === 'top' ? '/' : `/#${entry.id}`;
  };

  return (
    <header className="nav-backdrop sticky top-0 z-900 border-b border-black/6">
      <nav
        aria-label="Navigasi utama"
        className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-8 sm:py-3.5"
      >
        <a
          href={isHome ? '#top' : '/'}
          aria-label="ETOS ID - ke awal halaman"
          onClick={(event) => handleEntryClick(event, NAV_ENTRIES[0])}
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
          {NAV_ENTRIES.map((entry) => {
            const isActive = isEntryActive(entry);
            return (
              <li key={entry.label}>
                <a
                  href={getEntryHref(entry)}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={(event) => handleEntryClick(event, entry)}
                  className={`inline-flex min-h-9 items-center whitespace-nowrap rounded-full px-3 text-sm font-medium transition-colors xl:px-3.5 ${
                    isActive
                      ? 'bg-[var(--brand-green-dark)] text-white'
                      : 'text-[var(--ink-secondary)] hover:bg-black/5 hover:text-[var(--ink-primary)]'
                  }`}
                >
                  {entry.label}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="flex shrink-0 items-center lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-section-nav"
            aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--surface-pill-border)] bg-white/90 px-3.5 py-2 text-xs font-semibold text-[var(--ink-primary)] transition-colors hover:bg-neutral-100 active:scale-[0.97]"
          >
            <span aria-hidden="true" className="text-sm leading-none">
              {mobileMenuOpen ? '✕' : '☰'}
            </span>
            <span>{mobileMenuOpen ? 'Tutup' : 'Menu'}</span>
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <>
          <div
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
            className="fixed inset-x-0 bottom-0 top-[61px] z-10 bg-black/20 backdrop-blur-[2px] lg:hidden"
          />
          <div
            id="mobile-section-nav"
            className="relative z-20 border-t border-black/6 bg-white/98 px-4 py-3 shadow-lg lg:hidden"
          >
            <ul className="flex flex-col gap-1">
              {NAV_ENTRIES.map((entry) => {
                const isActive = isEntryActive(entry);
                return (
                  <li key={entry.label}>
                    <a
                      href={getEntryHref(entry)}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={(event) => handleEntryClick(event, entry)}
                      className={`flex min-h-11 items-center rounded-xl px-3.5 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[var(--brand-mint)] text-[var(--brand-green-dark)]'
                          : 'text-[var(--ink-secondary)] hover:bg-black/5'
                      }`}
                    >
                      {entry.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </header>
  );
}
