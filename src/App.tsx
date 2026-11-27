import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AboutSection } from './components/AboutSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { MediaDetailLightbox } from './components/MediaDetailLightbox';
import { MediaGlobeStage } from './components/MediaGlobeStage';
import { Navbar } from './components/Navbar';
import { NewsSection } from './components/NewsSection';
import { ProgramsSection } from './components/ProgramsSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { SHOWCASE_MEDIA_ITEMS } from './data/mediaItems';
import type { ShowcaseMediaItem } from './data/mediaItems';
import { useActiveSection } from './hooks/useActiveSection';
import { useReducedMotion } from './hooks/useReducedMotion';
import { useRoute } from './hooks/useRoute';
import { EtoserCatalogPage } from './pages/EtoserCatalogPage';
import { NewsDetailPage } from './pages/NewsDetailPage';
import { NewsListPage } from './pages/NewsListPage';
import { TeamPage } from './pages/TeamPage';
import { fetchShowcaseMedia } from './services/cmsApi';
import { applyClientSeo } from './lib/seo';

const AdminApp = lazy(() => import('./admin/AdminApp'));
const HERO_MAX_DESKTOP = 25;
const HERO_MAX_MOBILE = 15;

export function App() {
  const { route, navigate } = useRoute();
  const isHome = route.kind === 'home';
  const isAdmin = route.kind === 'admin';
  const reducedMotion = useReducedMotion();
  const activeSection = useActiveSection(isHome);
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false,
  );
  const [mediaItems, setMediaItems] =
    useState<readonly ShowcaseMediaItem[]>(SHOWCASE_MEDIA_ITEMS);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const pendingReturnIndexRef = useRef<number | null>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = (event: MediaQueryListEvent) => setIsMobileViewport(event.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const visibleMediaItems = useMemo(() => {
    const limit = isMobileViewport ? HERO_MAX_MOBILE : HERO_MAX_DESKTOP;
    return mediaItems.slice(0, limit).map((item, idx) => ({
      ...item,
      index: idx,
    }));
  }, [mediaItems, isMobileViewport]);

  useEffect(() => {
    if (isAdmin) return;
    const controller = new AbortController();
    void fetchShowcaseMedia(controller.signal).then((items) => {
      if (!controller.signal.aborted) {
        setMediaItems(items);
      }
    });
    return () => controller.abort();
  }, [isAdmin]);

  useEffect(() => {
    if (isHome) {
      applyClientSeo({
        title: 'Beasiswa ETOS ID · Dompet Dhuafa',
        description:
          'Beasiswa ETOS ID Dompet Dhuafa adalah program beasiswa dan pembinaan sarjana 8 semester di 16 PTN mitra untuk mencetak SDM strategis daerah yang berintegritas, profesional, dan transformatif.',
        path: '/',
      });
    }
  }, [isHome]);

  const activeItem: ShowcaseMediaItem | null =
    isHome && selectedIndex !== null ? (visibleMediaItems[selectedIndex] ?? null) : null;

  useEffect(() => {
    if (selectedIndex !== null || pendingReturnIndexRef.current === null) return;

    const returnIndex = pendingReturnIndexRef.current;
    pendingReturnIndexRef.current = null;

    const cardBtn = document.querySelector<HTMLButtonElement>(
      `[data-card-index="${returnIndex}"]`,
    );
    if (cardBtn) {
      cardBtn.focus();
      return;
    }
    lastTriggerRef.current?.focus();
  }, [selectedIndex]);

  const handleSelectMedia = useCallback(
    (item: ShowcaseMediaItem, sourceEl: HTMLButtonElement) => {
      lastTriggerRef.current = sourceEl;
      pendingReturnIndexRef.current = null;
      setOriginRect(sourceEl.getBoundingClientRect());
      setSelectedIndex(item.index);
    },
    [],
  );

  const handleCloseLightbox = useCallback(() => {
    setSelectedIndex((current) => {
      pendingReturnIndexRef.current = current;
      return null;
    });
    setOriginRect(null);
  }, []);

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) => {
      if (prev === null || visibleMediaItems.length === 0) return null;
      return (prev - 1 + visibleMediaItems.length) % visibleMediaItems.length;
    });
  }, [visibleMediaItems.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => {
      if (prev === null || visibleMediaItems.length === 0) return null;
      return (prev + 1) % visibleMediaItems.length;
    });
  }, [visibleMediaItems.length]);

  if (route.kind === 'admin') {
    return (
      <Suspense
        fallback={
          <div className="flex min-h-dvh items-center justify-center bg-neutral-50 text-sm text-neutral-600">
            Memuat panel admin CMS...
          </div>
        }
      >
        <AdminApp subPath={route.subPath} onNavigate={navigate} />
      </Suspense>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--bg-canvas)] text-[var(--ink-primary)]">
      <Navbar
        routeKind={route.kind}
        activeSection={activeSection}
        onNavigate={navigate}
      />

      {route.kind === 'home' && (
        <main className="flex flex-1 flex-col">
          <MediaGlobeStage
            items={visibleMediaItems}
            activeItemId={activeItem?.id ?? null}
            isPaused={false}
            reducedMotion={reducedMotion}
            onSelectMedia={handleSelectMedia}
          />

          <AboutSection />
          <ProgramsSection />
          <TestimonialsSection />
          <NewsSection onNavigate={navigate} />
          <FaqSection />
        </main>
      )}

      {route.kind === 'etoser' && (
        <EtoserCatalogPage onNavigate={navigate} reducedMotion={reducedMotion} />
      )}

      {route.kind === 'team' && <TeamPage onNavigate={navigate} />}

      {route.kind === 'news-list' && <NewsListPage onNavigate={navigate} />}

      {route.kind === 'news-detail' && (
        <NewsDetailPage slug={route.slug} onNavigate={navigate} />
      )}

      <Footer />

      <MediaDetailLightbox
        item={activeItem}
        originRect={originRect}
        totalCount={visibleMediaItems.length}
        reducedMotion={reducedMotion}
        onClose={handleCloseLightbox}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </div>
  );
}

export default App;
