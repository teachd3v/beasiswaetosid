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
      className="etoser-tilt-card group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--surface-card-border)] bg-[var(--surface-card)] text-left shadow-xs hover:border-[var(--brand-green)]/35 hover:shadow-xl"
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

        <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/94 px-2.5 py-1 shadow-xs backdrop-blur-xs">
          <img
            src={profile.campusLogoSrc}
            alt=""
            aria-hidden="true"
            className="h-5 w-5 object-contain"
          />
          <span className="text-xs font-bold tracking-tight text-[var(--ink-primary)]">
            {profile.campusShort}
          </span>
        </div>
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-between p-5">
        <div>
          <span className="inline-flex rounded-full bg-[var(--brand-mint)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--brand-green-dark)]">
            {profile.interest}
          </span>

          <h2 className="mt-2.5 text-lg font-bold leading-snug tracking-[-0.025em] text-[var(--ink-primary)] transition-colors group-hover:text-[var(--brand-green-dark)]">
            {profile.name}
          </h2>

          <p className="mt-1 text-xs font-medium text-[var(--ink-muted)]">
            {profile.major} · {profile.batch}
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-black/6 pt-3.5 text-xs font-semibold text-[var(--brand-green-dark)]">
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
