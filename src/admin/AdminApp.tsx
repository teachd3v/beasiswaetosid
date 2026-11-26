import { useEffect, useState } from 'react';
import { getCurrentAdmin, logoutAdmin } from '../services/adminApi';
import type { AdminUser } from '../services/adminApi';
import { applyClientSeo } from '../lib/seo';
import { EtoserManagerPage } from './pages/EtoserManagerPage';
import { LoginPage } from './pages/LoginPage';
import { MediaManagerPage } from './pages/MediaManagerPage';
import { NewsManagerPage } from './pages/NewsManagerPage';
import { TeamManagerPage } from './pages/TeamManagerPage';
import { TestimonialsManagerPage } from './pages/TestimonialsManagerPage';

type AdminTab = 'media' | 'etosers' | 'news' | 'testimonials' | 'team';

interface NavItem {
  readonly id: AdminTab;
  readonly label: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  { id: 'media', label: 'Media Foto' },
  { id: 'etosers', label: 'Data Etoser' },
  { id: 'news', label: 'Berita' },
  { id: 'testimonials', label: 'Testimoni' },
  { id: 'team', label: 'Tim Kami' },
];

function NavIcon({ id }: { readonly id: AdminTab }) {
  switch (id) {
    case 'media':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 shrink-0">
          <rect x="3" y="4" width="18" height="16" rx="2.5" />
          <circle cx="8.5" cy="9.5" r="1.5" />
          <path d="m21 15-4.5-4.5a1.5 1.5 0 0 0-2.1 0L6 19" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'etosers':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 shrink-0">
          <path d="M12 3 2 8l10 5 10-5-10-5Z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 10.5v5.5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22 8v6" strokeLinecap="round" />
        </svg>
      );
    case 'news':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 shrink-0">
          <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H17a1.5 1.5 0 0 1 1.5 1.5V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5.5Z" />
          <path d="M18.5 8H20a1 1 0 0 1 1 1v9a3 3 0 0 1-3 3" strokeLinecap="round" />
          <path d="M8 8.5h6M8 12.5h6M8 16.5h4" strokeLinecap="round" />
        </svg>
      );
    case 'testimonials':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 shrink-0">
          <path d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v6A2.5 2.5 0 0 1 16.5 15H11l-4 4v-4H7.5A2.5 2.5 0 0 1 5 12.5v-6Z" strokeLinejoin="round" />
          <path d="M9 8.5h6M9 11.5h4" strokeLinecap="round" />
        </svg>
      );
    case 'team':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 shrink-0">
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 19a5.5 5.5 0 0 1 11 0" strokeLinecap="round" />
          <circle cx="16.5" cy="9" r="2.2" />
          <path d="M15.5 19a4.5 4.5 0 0 1 5 0" strokeLinecap="round" />
        </svg>
      );
  }
}

function parseTab(subPath: string): AdminTab {
  const clean = subPath.replace(/^\/+/, '').split('/')[0];
  if (
    clean === 'media' ||
    clean === 'etosers' ||
    clean === 'news' ||
    clean === 'testimonials' ||
    clean === 'team'
  ) {
    return clean;
  }
  return 'media';
}

interface AdminAppProps {
  readonly subPath: string;
  readonly onNavigate: (to: string) => void;
}

export default function AdminApp({ subPath, onNavigate }: AdminAppProps) {
  const [user, setUser] = useState<AdminUser | null | undefined>(undefined);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeTab = parseTab(subPath);
  const activeLabel = NAV_ITEMS.find((t) => t.id === activeTab)?.label ?? 'CMS';

  useEffect(() => {
    applyClientSeo({
      title: `${activeLabel} · Admin ETOS ID`,
      noIndex: true,
    });
  }, [activeLabel]);

  useEffect(() => {
    let mounted = true;
    void getCurrentAdmin().then((admin) => {
      if (mounted) setUser(admin);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await logoutAdmin().catch(() => undefined);
    setUser(null);
  };

  if (user === undefined) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-neutral-50 text-sm text-neutral-600">
        Memeriksa sesi admin...
      </div>
    );
  }

  if (user === null) {
    return (
      <LoginPage
        onSuccess={(loggedIn) => setUser(loggedIn)}
        onBackHome={() => onNavigate('/')}
      />
    );
  }

  const handleSelectTab = (id: AdminTab) => {
    onNavigate(`/admin/${id}`);
    setMobileOpen(false);
  };

  return (
    <div className="flex min-h-dvh bg-neutral-100 text-neutral-900">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-neutral-200 bg-white transition-all duration-200 lg:sticky lg:top-0 lg:h-dvh ${
          collapsed ? 'lg:w-[72px]' : 'lg:w-60'
        } ${mobileOpen ? 'w-60 translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo + Collapse Toggle */}
        <div
          className={`flex h-14 items-center border-b border-neutral-100 px-3 ${
            collapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <a
            href="/admin"
            onClick={(e) => {
              e.preventDefault();
              handleSelectTab('media');
            }}
            className="flex items-center gap-2.5 overflow-hidden"
            title="CMS Beasiswa ETOS ID"
          >
            <img
              src="/logo/etos-id_net.svg"
              alt="Logo ETOS ID"
              className={`h-7 w-auto object-contain transition-all ${
                collapsed ? 'max-w-[36px]' : 'max-w-[120px]'
              }`}
            />
          </a>

          {!collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              title="Ciutkan sidebar"
              aria-label="Ciutkan sidebar"
              className="hidden h-7 w-7 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 lg:inline-flex"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav aria-label="Menu Admin CMS" className="flex-1 space-y-1 p-2.5">
          {NAV_ITEMS.map((item) => {
            const active = item.id === activeTab;
            return (
              <button
                key={item.id}
                type="button"
                title={collapsed ? item.label : undefined}
                onClick={() => handleSelectTab(item.id)}
                className={`flex w-full items-center rounded-xl py-2.5 text-xs font-semibold transition-colors ${
                  collapsed ? 'justify-center px-2' : 'gap-3 px-3'
                } ${
                  active
                    ? 'bg-[var(--brand-green-dark)] text-white shadow-2xs'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
              >
                <NavIcon id={item.id} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="space-y-1 border-t border-neutral-100 p-2.5">
          {collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              title="Perluas sidebar"
              aria-label="Perluas sidebar"
              className="hidden w-full items-center justify-center rounded-xl py-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 lg:flex"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          <button
            type="button"
            onClick={() => onNavigate('/')}
            title={collapsed ? 'Lihat Website' : undefined}
            className={`flex w-full items-center rounded-xl py-2 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 ${
              collapsed ? 'justify-center px-2' : 'gap-3 px-3'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 shrink-0">
              <path d="M14 5h5v5M19 5l-9 9" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4" strokeLinecap="round" />
            </svg>
            {!collapsed && <span>Lihat Website</span>}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            title={collapsed ? 'Keluar' : undefined}
            className={`flex w-full items-center rounded-xl py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 ${
              collapsed ? 'justify-center px-2' : 'gap-3 px-3'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 shrink-0">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" />
              <path d="m16 17 5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {!collapsed && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Buka menu navigasi"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50 lg:hidden"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              </svg>
            </button>
            <img
              src="/logo/etos-id_net.svg"
              alt="ETOS ID"
              className="h-6 w-auto object-contain lg:hidden"
            />
            <span className="hidden text-sm font-bold text-neutral-900 lg:inline">
              {activeLabel}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              Lihat Website ↗
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-5 sm:px-6">
          {activeTab === 'media' && <MediaManagerPage />}
          {activeTab === 'etosers' && <EtoserManagerPage />}
          {activeTab === 'news' && <NewsManagerPage />}
          {activeTab === 'testimonials' && <TestimonialsManagerPage />}
          {activeTab === 'team' && <TeamManagerPage />}
        </main>
      </div>
    </div>
  );
}
