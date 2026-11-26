import { uploadOgCardJpeg } from '../../services/adminApi';

export interface OgCardInput {
  readonly title: string;
  readonly category: string;
  readonly dateLabel: string;
  readonly location?: string;
  readonly coverUrl?: string;
  readonly slug?: string;
}

const OG_W = 1200;
const OG_H = 630;

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word;
      if (lines.length === maxLines - 1) {
        break;
      }
    }
  }

  if (current) {
    lines.push(current);
  }

  if (lines.length === maxLines) {
    const remainingWords = words.slice(lines.join(' ').split(/\s+/).length);
    if (remainingWords.length > 0) {
      let last = lines[maxLines - 1];
      while (ctx.measureText(`${last}…`).width > maxWidth && last.length > 3) {
        last = last.slice(0, -1).trimEnd();
      }
      lines[maxLines - 1] = `${last}…`;
    }
  }

  return lines.slice(0, maxLines);
}

/**
 * Render kartu Open Graph branded 1200x630 (JPEG) di browser admin,
 * lalu unggah langsung ke bucket R2 `og/`.
 */
export async function generateAndUploadNewsOgCard(
  input: OgCardInput,
): Promise<{ key: string; url: string }> {
  const canvas = document.createElement('canvas');
  canvas.width = OG_W;
  canvas.height = OG_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D tidak tersedia di browser ini.');
  }

  // 1. Background hijau gelap elegan ETOS ID
  const bgGrad = ctx.createLinearGradient(0, 0, OG_W, OG_H);
  bgGrad.addColorStop(0, '#05271a');
  bgGrad.addColorStop(0.55, '#0b4a32');
  bgGrad.addColorStop(1, '#106646');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, OG_W, OG_H);

  // 2. Foto cover di sisi kanan (full height, object-cover) + gradient fade halus dari kiri
  const [coverImg, logoImg] = await Promise.all([
    input.coverUrl ? loadImage(input.coverUrl) : Promise.resolve(null),
    loadImage('/logo/etos-id_net.svg'),
  ]);

  if (coverImg && coverImg.naturalWidth > 0) {
    const imgX = 480;
    const imgW = OG_W - imgX;
    const imgH = OG_H;
    const scale = Math.max(imgW / coverImg.naturalWidth, imgH / coverImg.naturalHeight);
    const drawW = coverImg.naturalWidth * scale;
    const drawH = coverImg.naturalHeight * scale;
    const dx = imgX + (imgW - drawW) / 2;
    const dy = (imgH - drawH) / 2;

    ctx.save();
    ctx.beginPath();
    ctx.rect(imgX, 0, imgW, imgH);
    ctx.clip();
    ctx.drawImage(coverImg, dx, dy, drawW, drawH);
    ctx.restore();

    // Gradient mask agar transisi kiri->kanan mulus dan teks 100% terbaca
    const maskGrad = ctx.createLinearGradient(440, 0, 860, 0);
    maskGrad.addColorStop(0, 'rgba(6, 44, 30, 1)');
    maskGrad.addColorStop(0.45, 'rgba(6, 44, 30, 0.85)');
    maskGrad.addColorStop(1, 'rgba(6, 44, 30, 0.12)');
    ctx.fillStyle = maskGrad;
    ctx.fillRect(440, 0, OG_W - 440, OG_H);

    // Vignette bawah halus
    const bottomGrad = ctx.createLinearGradient(0, OG_H - 180, 0, OG_H);
    bottomGrad.addColorStop(0, 'rgba(5, 39, 26, 0)');
    bottomGrad.addColorStop(1, 'rgba(5, 39, 26, 0.75)');
    ctx.fillStyle = bottomGrad;
    ctx.fillRect(440, OG_H - 180, OG_W - 440, 180);
  } else {
    // Dekorasi geometris halus jika artikel belum punya cover
    ctx.fillStyle = 'rgba(110, 231, 183, 0.08)';
    ctx.beginPath();
    ctx.arc(1030, 140, 230, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(960, 520, 180, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Aksen garis vertikal mint di tepi kiri
  ctx.fillStyle = '#34d399';
  ctx.fillRect(0, 0, 14, OG_H);

  // 4. Logo pill putih di kiri atas
  const padX = 68;
  drawRoundedRect(ctx, padX, 54, 178, 56, 28);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  if (logoImg && logoImg.naturalWidth > 0) {
    const logoH = 30;
    const logoW = Math.min(132, (logoImg.naturalWidth / logoImg.naturalHeight) * logoH);
    ctx.drawImage(logoImg, padX + (178 - logoW) / 2, 54 + (56 - logoH) / 2, logoW, logoH);
  } else {
    ctx.fillStyle = '#0d5c3e';
    ctx.font = '800 22px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText('ETOS ID', padX + 42, 89);
  }

  // 5. Badge kategori
  const catText = input.category.toUpperCase();
  ctx.font = '700 18px "Plus Jakarta Sans", system-ui, sans-serif';
  const catW = ctx.measureText(catText).width + 38;
  drawRoundedRect(ctx, padX + 194, 62, catW, 40, 20);
  ctx.fillStyle = 'rgba(52, 211, 153, 0.22)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(110, 231, 183, 0.55)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = '#a7f3d0';
  ctx.fillText(catText, padX + 194 + 19, 88);

  // 6. Judul Berita (maks 4 baris, font bold tajam)
  const titleMaxWidth = coverImg ? 660 : 1040;
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 48px "Plus Jakarta Sans", system-ui, sans-serif';
  const lines = wrapLines(ctx, input.title, titleMaxWidth, 4);
  let textY = 205;
  for (const line of lines) {
    ctx.fillText(line, padX, textY);
    textY += 62;
  }

  // 7. Garis pemisah tipis + Footer metadata
  const footerY = OG_H - 96;
  ctx.fillStyle = 'rgba(167, 243, 208, 0.35)';
  ctx.fillRect(padX, footerY - 26, 120, 4);

  const metaLine = [input.dateLabel, input.location].filter(Boolean).join('  ·  ');
  ctx.fillStyle = '#d1fae5';
  ctx.font = '600 22px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(metaLine || 'Berita & Kabar Etoser', padX, footerY + 12);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
  ctx.font = '500 18px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('Beasiswa ETOS ID · Dompet Dhuafa', padX, footerY + 44);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', 0.82),
  );
  if (!blob) {
    throw new Error('Gagal merender gambar OG JPEG.');
  }

  const safeSlug = (input.slug || 'berita').replace(/[^a-z0-9-]+/gi, '-').slice(0, 60);
  const file = new File([blob], `og-${safeSlug}.jpg`, { type: 'image/jpeg' });
  return uploadOgCardJpeg(file);
}
