import { useCallback, useEffect, useRef, useState } from 'react';
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
import { NewsDetailPage } from './pages/NewsDetailPage';
import { NewsListPage } from './pages/NewsListPage';

export function App() {
  const { route, navigate } = useRoute();
  const isHome = route.kind === 'home';
  const reducedMotion = useReducedMotion();
  const activeSection = useActiveSection(isHome);
  const [isOrbitPaused, setIsOrbitPaused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const pendingReturnIndexRef = useRef<number | null>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (isHome) {
      document.title = 'ETOS ID · Ressillient Generations';
    }
  }, [isHome]);

  const activeItem: ShowcaseMediaItem | null =
    isHome && selectedIndex !== null ? (SHOWCASE_MEDIA_ITEMS[selectedIndex] ?? null) : null;

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
      if (prev === null) return null;
      return (prev - 1 + SHOWCASE_MEDIA_ITEMS.length) % SHOWCASE_MEDIA_ITEMS.length;
    });
  }, []);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => {
      if (prev === null) return null;
      return (prev + 1) % SHOWCASE_MEDIA_ITEMS.length;
    });
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--bg-canvas)] text-[var(--ink-primary)]">
      <Navbar
        isHome={isHome}
        activeSection={activeSection}
        isOrbitPaused={isOrbitPaused}
        onToggleOrbit={() => setIsOrbitPaused((prev) => !prev)}
        onNavigate={navigate}
        reducedMotion={reducedMotion}
      />

      {route.kind === 'home' && (
        <main className="flex flex-1 flex-col">
          <MediaGlobeStage
            items={SHOWCASE_MEDIA_ITEMS}
            activeItemId={activeItem?.id ?? null}
            isPaused={isOrbitPaused}
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

      {route.kind === 'news-list' && <NewsListPage onNavigate={navigate} />}

      {route.kind === 'news-detail' && (
        <NewsDetailPage slug={route.slug} onNavigate={navigate} />
      )}

      <Footer />

      <MediaDetailLightbox
        item={activeItem}
        originRect={originRect}
        totalCount={SHOWCASE_MEDIA_ITEMS.length}
        reducedMotion={reducedMotion}
        onClose={handleCloseLightbox}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </div>
  );
}

export default App;
