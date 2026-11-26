import { useRef } from 'react';
import type { EtoserProfile } from '../data/etoserData';

interface EtoserCardProps {
  readonly profile: EtoserProfile;
  readonly reducedMotion: boolean;
  readonly onSelect: (
    profile: EtoserProfile,
    sourceEl: HTMLButtonElement,
  ) => void;
}

const MAX_TILT_DEG = 7;

export function EtoserCard({
  profile,
  reducedMotion,
  onSelect,
}: EtoserCardProps) {
  const cardRef = useRef<HTMLButtonElement | null>(null);
  const sheenRef = useRef<HTMLDivElement | null>(null);

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (reducedMotion || event.pointerType !== 'mouse') return;
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const xNorm = (event.clientX - rect.left) / rect.width;
    const yNorm = (event.clientY - rect.top) / rect.height;

    const rotateY = (xNorm - 0.5) * 2 * MAX_TILT_DEG;
    const rotateX = (0.5 - yNorm) * 2 * MAX_TILT_DEG;

    card.style.transform = `perspective(950px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;

    if (sheenRef.current) {
      sheenRef.current.style.opacity = '1';
      sheenRef.current.style.background = `radial-gradient(circle at ${(xNorm * 100).toFixed(1)}% ${(yNorm * 100).toFixed(1)}%, rgba(91, 198, 41, 0.22), rgba(255, 255, 255, 0) 60%)`;
    }
  };

  const handlePointerLeave = () => {
    const card = cardRef.current;
    if (card) {
      card.style.transform = '';
    }
    if (sheenRef.current) {
      sheenRef.current.style.opacity = '0';
    }
  };

  return (
    <button
      ref={cardRef}
      type="button"
      aria-haspopup="dialog"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={(event) => onSelect(profile, event.currentTarget)}
      className="etoser-tilt-card group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--surface-card-border)] bg-[var(--surface-card)] text-left shadow-xs hover:border-[var(--brand-green)]/35 hover:shadow-xl active:scale-[0.98]"
    >
      <div
        ref={sheenRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300"
      />

      <div className="relative aspect-4/3 w-full overflow-hidden bg-[var(--surface-placeholder)]">
        <img
          src={profile.photoSrc}
          alt={`Foto Etoser ${profile.name} dari ${profile.campusFull}`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute left-2 top-2 inline-flex items-center gap-1.5 rounded-full border border-black/8 bg-white/94 px-2 py-0.5 shadow-xs backdrop-blur-xs sm:left-3 sm:top-3 sm:gap-2 sm:px-2.5 sm:py-1">
          <img
            src={profile.campusLogoSrc}
            alt=""
            aria-hidden="true"
            className="h-4 w-4 object-contain sm:h-5 sm:w-5"
          />
          <span className="text-[10px] font-bold tracking-tight text-[var(--ink-primary)] sm:text-xs">
            {profile.campusShort}
          </span>
        </div>
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-between p-3 sm:p-4">
        <div>
          <span className="inline-flex rounded-full bg-[var(--brand-mint)] px-2 py-0.5 text-[9.5px] font-semibold text-[var(--brand-green-dark)] sm:px-2.5 sm:text-[11px]">
            {profile.interest}
          </span>

          <h2 className="mt-1.5 line-clamp-1 text-xs font-bold leading-snug tracking-[-0.02em] text-[var(--ink-primary)] transition-colors group-hover:text-[var(--brand-green-dark)] sm:mt-2 sm:text-base">
            {profile.name}
          </h2>

          <p className="mt-0.5 line-clamp-1 text-[10px] font-medium text-[var(--ink-muted)] sm:mt-1 sm:text-xs">
            {profile.major} · {profile.batch}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-black/6 pt-2.5 text-[10.5px] font-semibold text-[var(--brand-green-dark)] sm:mt-4 sm:pt-3 sm:text-xs">
          <span>Lihat profil</span>
          <span
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-1"
          >
            →
          </span>
        </div>
      </div>
    </button>
  );
}
