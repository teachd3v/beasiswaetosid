import { useEffect, useState } from 'react';

export type SectionId =
  | 'top'
  | 'tentang-kami'
  | 'program'
  | 'testimoni'
  | 'berita'
  | 'faq';

const SECTION_IDS: readonly SectionId[] = [
  'top',
  'tentang-kami',
  'program',
  'testimoni',
  'berita',
  'faq',
];

export function useActiveSection(enabled = true): SectionId {
  const [activeId, setActiveId] = useState<SectionId>('top');

  useEffect(() => {
    if (!enabled) return;
    const elements = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (elements.length === 0) return;

    const visibleRatios = new Map<SectionId, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id as SectionId;
          visibleRatios.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }

        let bestId: SectionId | null = null;
        let bestRatio = 0;
        for (const id of SECTION_IDS) {
          const ratio = visibleRatios.get(id) ?? 0;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        }

        if (bestId) {
          setActiveId(bestId);
        }
      },
      {
        rootMargin: '-20% 0px -45% 0px',
        threshold: [0, 0.15, 0.35, 0.6, 0.85],
      },
    );

    for (const el of elements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [enabled]);

  return activeId;
}
