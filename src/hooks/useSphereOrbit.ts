import { useCallback, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { ShowcaseMediaItem } from '../data/mediaItems';
import {
  axisAngle,
  computeDepthVisuals,
  createFibonacciSpherePoints,
  multiplyQuat,
  normalizeQuat,
  pitchQuat,
  projectPoint,
  quatToMat3,
  yawQuat,
} from '../engine/sphereMath';
import type { EllipsoidRadii, Quaternion, Vec3 } from '../engine/sphereMath';

interface CardNodes {
  el: HTMLLIElement;
  btn: HTMLButtonElement;
  img: HTMLImageElement;
  aspect: number;
}

interface UseSphereOrbitOptions {
  readonly items: readonly ShowcaseMediaItem[];
  readonly stageRef: RefObject<HTMLDivElement | null>;
  readonly isManuallyPaused: boolean;
  readonly isLightboxOpen: boolean;
  readonly reducedMotion: boolean;
}

const ROTATION_SPEED = 0.09; // rad/s
const AUTO_AXIS_TILT = 0.35; // ~20deg tilted diagonal spin
const VIEW_TILT = 0.12; // look slightly down onto the globe
const PARALLAX_YAW = 0.22;
const PARALLAX_PITCH = 0.1;
const PARALLAX_EASE = 4;
const DRAG_THRESHOLD_PX = 6;
const INERTIA_DECAY = 2.2;
const AUTO_EASE = 3;
const HOVER_AUTO_FACTOR = 0.2;
const STILL_RELEASE_MS = 90;
const VELOCITY_SMOOTHING = 0.4;
const MOBILE_MAX_WIDTH = 720;
const MOBILE_PHOTO_COUNT = 12;

const AUTO_AXIS = [
  Math.sin(AUTO_AXIS_TILT),
  Math.cos(AUTO_AXIS_TILT),
  0,
] as const;

const lerpFactor = (rate: number, dt: number) => 1 - Math.exp(-rate * dt);
const expoOut = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

export function useSphereOrbit({
  items,
  stageRef,
  isManuallyPaused,
  isLightboxOpen,
  reducedMotion,
}: UseSphereOrbitOptions) {
  const cardsRef = useRef<(CardNodes | undefined)[]>([]);
  const introProgressRef = useRef<number[]>([]);
  const blurCacheRef = useRef<number[]>([]);
  const zIndexCacheRef = useRef<number[]>([]);
  const activeCountRef = useRef(0);
  const pointsRef = useRef<Vec3[]>([]);
  const radiiRef = useRef<EllipsoidRadii>({ rx: 460, ry: 220, rz: 380 });
  const focalRef = useRef(988);

  const orientationRef = useRef<Quaternion>(yawQuat(-0.4));
  const pausedRef = useRef(isManuallyPaused);
  const lightboxOpenRef = useRef(isLightboxOpen);
  const reducedMotionRef = useRef(reducedMotion);
  const introStartRef = useRef<number | null>(null);
  const introDoneRef = useRef(reducedMotion);
  const preloadedFullRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    pausedRef.current = isManuallyPaused;
    lightboxOpenRef.current = isLightboxOpen;
    reducedMotionRef.current = reducedMotion;
  }, [isManuallyPaused, isLightboxOpen, reducedMotion]);

  const registerCard = useCallback(
    (
      index: number,
      refs: { el: HTMLLIElement; btn: HTMLButtonElement; img: HTMLImageElement } | null,
    ) => {
      if (!refs) {
        cardsRef.current[index] = undefined;
        return;
      }
      const item = items[index];
      const existingProgress = introProgressRef.current[index];
      introProgressRef.current[index] =
        existingProgress ?? (reducedMotionRef.current ? 1 : 0);
      blurCacheRef.current[index] = -1;
      zIndexCacheRef.current[index] = Number.NaN;
      cardsRef.current[index] = {
        el: refs.el,
        btn: refs.btn,
        img: refs.img,
        aspect: item ? item.width / item.height : 1.5,
      };
    },
    [items],
  );

  const getCardButtons = useCallback(
    () =>
      cardsRef.current
        .slice(0, activeCountRef.current)
        .map((c) => c?.btn)
        .filter((btn): btn is HTMLButtonElement => Boolean(btn)),
    [],
  );

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const layout = () => {
      const vw = stage.clientWidth;
      const vh = stage.clientHeight;
      if (vw <= 0 || vh <= 0) return;

      const mobile = vw < MOBILE_MAX_WIDTH;
      const nextCount = mobile
        ? Math.min(MOBILE_PHOTO_COUNT, items.length)
        : items.length;

      if (nextCount !== activeCountRef.current) {
        activeCountRef.current = nextCount;
        pointsRef.current = createFibonacciSpherePoints(nextCount, {
          yLimit: 0.96,
          jitter: 0.08,
          seed: 7,
        });
        for (let i = 0; i < cardsRef.current.length; i += 1) {
          const card = cardsRef.current[i];
          if (!card) continue;
          card.el.hidden = i >= nextCount;
          if (i >= nextCount) {
            introProgressRef.current[i] = Math.max(
              introProgressRef.current[i] ?? 0,
              1,
            );
          }
        }
      }

      const base = Math.min(Math.max(Math.min(vw, vh * 1.6) * 0.1, 72), 165);
      const rx = vw * (mobile ? 0.42 : 0.36);
      const ry = vh * (mobile ? 0.32 : 0.3);
      const rz = Math.min(vw * 0.3, 420);

      radiiRef.current = { rx, ry, rz };
      focalRef.current = rz * 2.6;

      for (let i = 0; i < nextCount; i += 1) {
        const card = cardsRef.current[i];
        if (!card) continue;
        const w = Math.round(base * Math.sqrt(card.aspect));
        const h = Math.round(base / Math.sqrt(card.aspect));
        const s = card.el.style;
        s.width = `${w}px`;
        s.height = `${h}px`;
        s.marginLeft = `${-w / 2}px`;
        s.marginTop = `${-h / 2}px`;
      }
    };

    const render = (extraYaw = 0, extraPitch = 0) => {
      const m = quatToMat3(
        multiplyQuat(
          pitchQuat(VIEW_TILT + extraPitch),
          multiplyQuat(yawQuat(extraYaw), orientationRef.current),
        ),
      );
      const count = activeCountRef.current;
      const points = pointsRef.current;
      const radii = radiiRef.current;
      const focal = focalRef.current;

      for (let i = 0; i < count; i += 1) {
        const card = cardsRef.current[i];
        const point = points[i];
        if (!card || !point) continue;

        const p = projectPoint(point, m, radii, focal);
        const k = introProgressRef.current[i] ?? 1;

        card.el.style.transform = `translate3d(${(p.x * k).toFixed(1)}px, ${(p.y * k).toFixed(1)}px, 0) scale(${(p.scale * k).toFixed(3)})`;
        card.el.style.opacity = (
          (0.5 + p.depth * 0.5) *
          Math.min(1, k * 1.5)
        ).toFixed(3);

        const visual = computeDepthVisuals(p.depth);
        if (visual.zIndex !== zIndexCacheRef.current[i]) {
          card.el.style.zIndex = String(visual.zIndex);
          zIndexCacheRef.current[i] = visual.zIndex;
        }

        if (visual.blurPx !== blurCacheRef.current[i]) {
          card.img.style.filter = visual.blurPx ? `blur(${visual.blurPx}px)` : '';
          blurCacheRef.current[i] = visual.blurPx;
        }

        card.btn.dataset.zNorm = (p.depth * 2 - 1).toFixed(3);
        card.btn.dataset.screenX = p.x.toFixed(1);
      }
    };

    layout();

    // Pointer / drag / parallax state kept completely outside React state for zero re-renders.
    let targetX = 0;
    let targetY = 0;
    let parallaxX = 0;
    let parallaxY = 0;
    let pressed = false;
    let dragging = false;
    let touchScrollAborted = false;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastY = 0;
    let lastMoveT = 0;
    let pendingYaw = 0;
    let pendingPitch = 0;
    let velYaw = 0;
    let velPitch = 0;
    let swallowClick = false;
    let hovering = false;
    let keyboardFocus = false;
    let autoFactor = 1;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      pressed = true;
      dragging = false;
      touchScrollAborted = false;
      swallowClick = false;
      startX = lastX = e.clientX;
      startY = lastY = e.clientY;
      lastMoveT = e.timeStamp;
      velYaw = velPitch = 0;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') {
        const r = stage.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          targetX = ((e.clientX - r.left) / r.width) * 2 - 1;
          targetY = ((e.clientY - r.top) / r.height) * 2 - 1;
        }
      }
      if (!pressed || touchScrollAborted) return;

      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      if (!dragging && Math.hypot(deltaX, deltaY) > DRAG_THRESHOLD_PX) {
        // On touch devices, let predominantly vertical gestures scroll the page naturally.
        if (e.pointerType === 'touch' && Math.abs(deltaY) > Math.abs(deltaX) * 1.15) {
          touchScrollAborted = true;
          pressed = false;
          return;
        }
        dragging = true;
        stage.setPointerCapture(e.pointerId);
        stage.classList.add('is-dragging');
      }

      if (dragging) {
        const k = Math.PI / Math.max(1, stage.clientWidth);
        const dYaw = (e.clientX - lastX) * k;
        const dPitch = (e.clientY - lastY) * k;
        const dt = Math.max((e.timeStamp - lastMoveT) / 1000, 1 / 240);
        pendingYaw += dYaw;
        pendingPitch += dPitch;
        velYaw += (dYaw / dt - velYaw) * VELOCITY_SMOOTHING;
        velPitch += (dPitch / dt - velPitch) * VELOCITY_SMOOTHING;
        lastMoveT = e.timeStamp;
      }

      lastX = e.clientX;
      lastY = e.clientY;
    };

    const onPointerRelease = (e: PointerEvent) => {
      if (!pressed) return;
      pressed = false;
      if (dragging) {
        swallowClick = true;
        if (e.timeStamp - lastMoveT > STILL_RELEASE_MS) velYaw = velPitch = 0;
        stage.classList.remove('is-dragging');
        if (stage.hasPointerCapture(e.pointerId)) {
          stage.releasePointerCapture(e.pointerId);
        }
      }
      dragging = false;
    };

    const onPointerLeave = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') targetX = targetY = 0;
    };

    const onClickCapture = (e: MouseEvent) => {
      if (!swallowClick) return;
      swallowClick = false;
      e.stopPropagation();
      e.preventDefault();
    };

    const onPointerOver = (e: PointerEvent) => {
      const btn = (e.target as Element).closest<HTMLButtonElement>('.orbit-card');
      if (e.pointerType === 'mouse') hovering = Boolean(btn);
      if (btn) {
        const idx = Number(btn.dataset.cardIndex);
        if (!Number.isNaN(idx) && !preloadedFullRef.current.has(idx) && items[idx]) {
          preloadedFullRef.current.add(idx);
          const pre = new Image();
          pre.src = items[idx].fullSrc;
        }
      }
    };

    const onPointerOut = (e: PointerEvent) => {
      if (
        e.pointerType === 'mouse' &&
        !(e.relatedTarget as Element | null)?.closest?.('.orbit-card')
      ) {
        hovering = false;
      }
    };

    const onFocusIn = (e: FocusEvent) => {
      const target = e.target as Element;
      keyboardFocus = target.matches('.orbit-card:focus-visible');
      const btn = target.closest<HTMLButtonElement>('.orbit-card');
      if (btn) {
        const idx = Number(btn.dataset.cardIndex);
        if (!Number.isNaN(idx) && !preloadedFullRef.current.has(idx) && items[idx]) {
          preloadedFullRef.current.add(idx);
          const pre = new Image();
          pre.src = items[idx].fullSrc;
        }
      }
    };

    const onFocusOut = () => {
      keyboardFocus = false;
    };

    stage.addEventListener('pointerdown', onPointerDown);
    stage.addEventListener('pointermove', onPointerMove);
    stage.addEventListener('pointerup', onPointerRelease);
    stage.addEventListener('pointercancel', onPointerRelease);
    stage.addEventListener('pointerleave', onPointerLeave);
    stage.addEventListener('click', onClickCapture, true);
    stage.addEventListener('pointerover', onPointerOver);
    stage.addEventListener('pointerout', onPointerOut);
    stage.addEventListener('focusin', onFocusIn);
    stage.addEventListener('focusout', onFocusOut);

    if (reducedMotionRef.current) {
      for (let i = 0; i < items.length; i += 1) {
        introProgressRef.current[i] = 1;
      }
      introDoneRef.current = true;
      render();
    } else if (!introDoneRef.current) {
      introStartRef.current = performance.now();
    }

    let rafId = 0;
    let lastFrameTime = 0;
    let onScreen = true;

    const tick = (now: number) => {
      const dt = lastFrameTime ? Math.min((now - lastFrameTime) / 1000, 1 / 20) : 0;
      lastFrameTime = now;

      // Update smooth expo.out intro swirl & expansion without GSAP overhead.
      let introSpin = 0;
      if (!introDoneRef.current && introStartRef.current !== null) {
        if (reducedMotionRef.current) {
          for (let i = 0; i < items.length; i += 1) {
            introProgressRef.current[i] = 1;
          }
          introDoneRef.current = true;
        } else {
          const elapsed = (now - introStartRef.current) / 1000;
          const count = activeCountRef.current;
          let allDone = true;
          for (let i = 0; i < count; i += 1) {
            const delay = (i % 9) * 0.028;
            const progress = Math.max(0, Math.min(1, (elapsed - delay) / 1.35));
            introProgressRef.current[i] = expoOut(progress);
            if (progress < 1) allDone = false;
          }
          const spinT = Math.max(0, Math.min(1, elapsed / 2.1));
          introSpin = -1.2 * (1 - expoOut(spinT));
          if (allDone && spinT >= 1) introDoneRef.current = true;
        }
      }

      if (!lightboxOpenRef.current) {
        const pFactor = lerpFactor(PARALLAX_EASE, dt);
        parallaxX += (targetX - parallaxX) * pFactor;
        parallaxY += (targetY - parallaxY) * pFactor;

        let dragYaw: number;
        let dragPitch: number;
        if (dragging) {
          dragYaw = pendingYaw;
          dragPitch = pendingPitch;
        } else {
          dragYaw = velYaw * dt;
          dragPitch = velPitch * dt;
          const decay = Math.exp(-INERTIA_DECAY * dt);
          velYaw *= decay;
          velPitch *= decay;
          if (Math.hypot(velYaw, velPitch) < 0.002) velYaw = velPitch = 0;
        }
        pendingYaw = pendingPitch = 0;

        const autoTarget =
          reducedMotionRef.current ||
          pausedRef.current ||
          dragging ||
          keyboardFocus
            ? 0
            : hovering
              ? HOVER_AUTO_FACTOR
              : 1;
        autoFactor += (autoTarget - autoFactor) * lerpFactor(AUTO_EASE, dt);
        if (Math.abs(autoFactor - autoTarget) < 0.001) autoFactor = autoTarget;

        const spin = -ROTATION_SPEED * autoFactor * dt;
        if (spin) {
          orientationRef.current = normalizeQuat(
            multiplyQuat(
              axisAngle(AUTO_AXIS[0], AUTO_AXIS[1], AUTO_AXIS[2], spin),
              orientationRef.current,
            ),
          );
        }

        if (dragYaw !== 0 || dragPitch !== 0) {
          orientationRef.current = normalizeQuat(
            multiplyQuat(
              pitchQuat(dragPitch),
              multiplyQuat(yawQuat(dragYaw), orientationRef.current),
            ),
          );
        }

        const pxYaw = reducedMotionRef.current ? 0 : parallaxX * PARALLAX_YAW;
        const pxPitch = reducedMotionRef.current ? 0 : -parallaxY * PARALLAX_PITCH;
        render(pxYaw - introSpin, pxPitch);
      }

      rafId = requestAnimationFrame(tick);
    };

    const syncLoop = () => {
      const shouldRun = onScreen && !document.hidden;
      if (shouldRun && !rafId) {
        lastFrameTime = 0;
        rafId = requestAnimationFrame(tick);
      } else if (!shouldRun && rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      onScreen = entry?.isIntersecting ?? true;
      syncLoop();
    });
    intersectionObserver.observe(stage);

    const resizeObserver = new ResizeObserver(() => {
      layout();
      render();
    });
    resizeObserver.observe(stage);

    document.addEventListener('visibilitychange', syncLoop);
    syncLoop();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', syncLoop);
      stage.removeEventListener('pointerdown', onPointerDown);
      stage.removeEventListener('pointermove', onPointerMove);
      stage.removeEventListener('pointerup', onPointerRelease);
      stage.removeEventListener('pointercancel', onPointerRelease);
      stage.removeEventListener('pointerleave', onPointerLeave);
      stage.removeEventListener('click', onClickCapture, true);
      stage.removeEventListener('pointerover', onPointerOver);
      stage.removeEventListener('pointerout', onPointerOut);
      stage.removeEventListener('focusin', onFocusIn);
      stage.removeEventListener('focusout', onFocusOut);
    };
  }, [items, stageRef]);

  return {
    registerCard,
    getCardButtons,
  };
}
