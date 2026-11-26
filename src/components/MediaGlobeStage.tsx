import { useCallback, useRef } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { ShowcaseMediaItem } from '../data/mediaItems';
import { HEADLINE_Z_INDEX } from '../engine/sphereMath';
import { useSphereOrbit } from '../hooks/useSphereOrbit';
import { MediaCard } from './MediaCard';

interface MediaGlobeStageProps {
  readonly items: readonly ShowcaseMediaItem[];
  readonly activeItemId: string | null;
  readonly isPaused: boolean;
  readonly reducedMotion: boolean;
  readonly onSelectMedia: (
    item: ShowcaseMediaItem,
    sourceEl: HTMLButtonElement,
  ) => void;
}

const MOBILE_INITIAL_EAGER_COUNT = 12;

export function MediaGlobeStage({
  items,
  activeItemId,
  isPaused,
  reducedMotion,
  onSelectMedia,
}: MediaGlobeStageProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);

  const { registerCard, getCardButtons } = useSphereOrbit({
    items,
    stageRef,
    isManuallyPaused: isPaused,
    isLightboxOpen: activeItemId !== null,
    reducedMotion,
  });

  const handleStageKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      const focused = document.activeElement;
      const buttons = getCardButtons();
      if (buttons.length === 0) return;

      const visibleFront = buttons.filter(
        (btn) => Number.parseFloat(btn.dataset.zNorm ?? '0') >= -0.15,
      );
      const pool = (visibleFront.length >= 3 ? visibleFront : buttons)
        .slice()
        .sort(
          (a, b) =>
            Number.parseFloat(a.dataset.screenX ?? '0') -
            Number.parseFloat(b.dataset.screenX ?? '0'),
        );

      const currentIdx = pool.indexOf(focused as HTMLButtonElement);
      if (currentIdx === -1) return;

      event.preventDefault();
      const step = event.key === 'ArrowRight' ? 1 : -1;
      const nextIdx = (currentIdx + step + pool.length) % pool.length;
      pool[nextIdx]?.focus();
    },
    [getCardButtons],
  );

  return (
    <section
      id="top"
      aria-labelledby="showcase-title"
      className="section-anchor relative flex min-h-[calc(100dvh-3.75rem)] w-full flex-col items-center justify-between overflow-x-clip border-b border-black/6 bg-[var(--bg-canvas)] pb-3"
    >
      <div
        ref={stageRef}
        role="group"
        aria-roledescription="Galeri bola foto 3D"
        aria-label="Bola dokumentasi ETOS ID. Seret untuk memutar, pilih foto untuk memperbesar, atau tekan panah kiri dan kanan saat fokus berada pada foto."
        onKeyDown={handleStageKeyDown}
        className="globe-stage relative flex h-[calc(100dvh-8.5rem)] min-h-[460px] w-full flex-1 items-center justify-center"
      >
        {/* Headline sits at z-index 0; back cards (< 0) render behind it and front cards (>= 0) pass over it */}
        <div
          style={{ zIndex: HEADLINE_Z_INDEX }}
          className="pointer-events-none relative flex max-w-[min(92vw,46rem)] flex-col items-center px-4 text-center"
        >
          <div aria-hidden="true" className="hero-glow-aura" />

          <h1
            id="showcase-title"
            style={{ fontFamily: 'var(--font-display)' }}
            className="hero-glow-title relative m-0 pb-1 text-[clamp(2.15rem,8.2vw,7.25rem)] font-extrabold leading-[0.9] tracking-[-0.04em]"
          >
            <span className="block">Ressillient</span>
            <span className="block">Generations</span>
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="relative z-10 mt-4 rounded-2xl border border-black/10 bg-white/95 px-5 py-3 text-sm text-[var(--ink-muted)]">
            Belum ada media dokumentasi yang dimuat.
          </div>
        ) : (
          <ul className="orbit-list">
            {items.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                isLightboxSource={activeItemId === item.id}
                isLazy={item.index >= MOBILE_INITIAL_EAGER_COUNT}
                registerCard={registerCard}
                onSelect={onSelectMedia}
              />
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center gap-3 px-4 text-center">
        <p className="text-xs font-normal tracking-[-0.01em] text-[var(--ink-muted)] sm:text-sm">
          {reducedMotion
            ? 'Mode gerak minimal · Seret untuk memutar atau klik foto'
            : 'Seret untuk memutar · Klik foto untuk memperbesar'}
        </p>

        <a
          href="#tentang-kami"
          aria-label="Gulir ke Tentang Kami"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/10 text-sm font-medium text-[var(--ink-secondary)] transition-colors hover:bg-black/5 hover:text-[var(--ink-primary)] active:scale-95"
        >
          <span aria-hidden="true">↓</span>
        </a>
      </div>
    </section>
  );
}
