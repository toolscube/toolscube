import { copyToClipboard } from '@/lib/clipboard';
import QRCode from 'qrcode';
import { useCallback } from 'react';

type LogoOpt = { src: string; sizePct: number; roundedPct?: number; pad?: number };
type Args = {
  value: string;
  size: number;
  margin: number;
  ecl: ECL;
  fg: string;
  bg: string;
  quietZone?: boolean;
  logo?: LogoOpt | null;
};

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

function makeOptions(a: Args, width: number) {
  return {
    width,
    margin: a.quietZone ? a.margin : 0,
    color: { dark: a.fg, light: a.bg },
    errorCorrectionLevel: a.ecl,
  } as const;
}

async function overlayLogo(canvas: HTMLCanvasElement, logo: LogoOpt) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = () => res(im);
    im.onerror = rej;
    im.src = logo.src;
  });

  const w = canvas.width;
  const h = canvas.height;
  const size = Math.round((Math.min(w, h) * logo.sizePct) / 100);
  const x = Math.round(w / 2 - size / 2);
  const y = Math.round(h / 2 - size / 2);
  const pad = logo.pad ?? 4;
  const r = Math.round(size * ((logo.roundedPct ?? 20) / 100));

  ctx.save();
  // white rounded pad under logo for contrast
  ctx.beginPath();
  const rx = x - pad,
    ry = y - pad,
    rw = size + pad * 2,
    rh = size + pad * 2;
  const rr = Math.min(r, rw / 2, rh / 2);
  ctx.moveTo(rx + rr, ry);
  ctx.arcTo(rx + rw, ry, rx + rw, ry + rh, rr);
  ctx.arcTo(rx + rw, ry + rh, rx, ry + rh, rr);
  ctx.arcTo(rx, ry + rh, rx, ry, rr);
  ctx.arcTo(rx, ry, rx + rw, ry, rr);
  ctx.closePath();
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.restore();

  ctx.drawImage(img, x, y, size, size);
}

export function useQrExport(args: Args) {
  const getPngDataUrl = useCallback(
    async (scale = 1) => {
      const exportSize = clamp(Math.round(args.size * (scale || 1)), 64, 4096);
      const canvas = document.createElement('canvas');
      await QRCode.toCanvas(canvas, args.value || 'Scan me', makeOptions(args, exportSize));
      if (args.logo) await overlayLogo(canvas, args.logo);
      return canvas.toDataURL('image/png');
    },
    [args],
  );

  /** Copies PNG data URL to clipboard. */
  const copyPngDataUrl = useCallback(
    async (scale = 1) => {
      const url = await getPngDataUrl(scale);
      return copyToClipboard(url);
    },
    [getPngDataUrl],
  );

  /** Triggers a PNG download. */
  const downloadPNG = useCallback(
    async (filename = 'qrcode.png', scale = 1) => {
      const url = await getPngDataUrl(scale);
      const a = document.createElement('a');
      a.download = filename;
      a.href = url;
      a.click();
    },
    [getPngDataUrl],
  );

  /** Triggers an SVG download. */
  const downloadSVG = useCallback(
    async (filename = 'qrcode.svg') => {
      const svg = await QRCode.toString(args.value || 'Scan me', { ...makeOptions(args, args.size), type: 'svg' });
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.download = filename;
      a.href = url;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    },
    [args],
  );

  return { getPngDataUrl, copyPngDataUrl, downloadPNG, downloadSVG };
}
