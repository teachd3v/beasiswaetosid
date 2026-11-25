export interface ShowcaseMediaItem {
  readonly id: string;
  readonly index: number;
  readonly thumbSrc: string;
  readonly fullSrc: string;
  readonly width: number;
  readonly height: number;
  readonly title: string;
  readonly timestampLabel: string;
  readonly alt: string;
}

const THREE_TWO_INDICES = new Set([1, 7, 8, 11, 14, 28, 39, 43]);

// 25 foto pilihan tersebar merata dari keseluruhan dokumentasi YIC ETOS ID 2026
const SELECTED_SEQUENCES: readonly number[] = [
  1, 3, 5, 7, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 39, 40, 41, 42,
  43,
];

export const SHOWCASE_MEDIA_ITEMS: readonly ShowcaseMediaItem[] = SELECTED_SEQUENCES.map(
  (seq, idx) => {
    const fileNumber = String(seq).padStart(3, '0');
    const displayNumber = String(idx + 1).padStart(2, '0');
    const src = `/media/YIC_ETOS_ID_2026_${fileNumber}.webp`;
    const isThreeTwo = THREE_TWO_INDICES.has(seq);

    return {
      id: `yic-etos-2026-${fileNumber}`,
      index: idx,
      thumbSrc: src,
      fullSrc: src,
      width: 1600,
      height: isThreeTwo ? 1069 : 900,
      title: `Dokumentasi YIC ETOS ID #${displayNumber}`,
      timestampLabel: 'Youth Inspiration Camp ETOS ID 2026',
      alt: `Dokumentasi Youth Inspiration Camp ETOS ID 2026 #${displayNumber}`,
    };
  },
);
