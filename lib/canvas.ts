export type FitMode = "contain" | "cover";
export type OutFormat = "webp" | "jpeg" | "png" | "avif";
type Anchor =
  | "center"
  | "top-left"
  | "top"
  | "top-right"
  | "left"
  | "right"
  | "bottom-left"
  | "bottom"
  | "bottom-right";

export function formatBytes(bytes: number) {
  const units = ["B", "KB", "MB", "GB"];
  let i = 0,
    n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

export function suggestName(name: string, suffix: string, fmt: OutFormat) {
  const base = name.replace(/\.[^.]+$/, "");
  const ext = fmt === "jpeg" ? "jpg" : fmt;
  return `${base}-${suffix}.${ext}`;
}

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function mimeFromFormat(fmt: OutFormat) {
  switch (fmt) {
    case "png":
      return "image/png";
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    case "avif":
      return "image/avif";
  }
}

export async function browserSupportsMime(mime: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 2;
  const ok = await new Promise<boolean>((resolve) => {
    try {
      c.toBlob((b) => resolve(!!b), mime, 0.8);
    } catch {
      resolve(false);
    }
  });
  return ok;
}

export async function drawToCanvas(opts: {
  srcUrl: string;
  srcW: number;
  srcH: number;
  outW: number;
  outH: number;
  fit: FitMode;
  background?: string;
  filterCss?: string;
}): Promise<HTMLCanvasElement> {
  const { srcUrl, srcW, srcH, outW, outH, fit, background, filterCss } = opts;
  const targetW = Math.max(1, Math.round(outW));
  const targetH = Math.max(1, Math.round(outH));
  const srcAspect = srcW / srcH;
  const dstAspect = targetW / targetH;

  let drawW = targetW,
    drawH = targetH;
  if (fit === "contain") {
    if (srcAspect > dstAspect) {
      drawW = targetW;
      drawH = Math.round(targetW / srcAspect);
    } else {
      drawH = targetH;
      drawW = Math.round(targetH * srcAspect);
    }
  } else {
    if (srcAspect > dstAspect) {
      drawH = targetH;
      drawW = Math.round(targetH * srcAspect);
    } else {
      drawW = targetW;
      drawH = Math.round(targetW / srcAspect);
    }
  }

  const img = await createImage(srcUrl);
  const c = document.createElement("canvas");
  c.width = targetW;
  c.height = targetH;

  const ctx = c.getContext("2d");
  if (!ctx) {
    throw new Error("2D canvas context is not supported in this environment.");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (filterCss) {
    ctx.filter = filterCss;
  }

  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, targetW, targetH);
  } else ctx.clearRect(0, 0, targetW, targetH);

  if (fit === "contain") {
    const dx = Math.round((targetW - drawW) / 2);
    const dy = Math.round((targetH - drawH) / 2);
    ctx.drawImage(img, 0, 0, srcW, srcH, dx, dy, drawW, drawH);
  } else {
    const scale = Math.max(targetW / srcW, targetH / srcH);
    const sw = Math.round(targetW / scale);
    const sh = Math.round(targetH / scale);
    const sx = Math.round((srcW - sw) / 2);
    const sy = Math.round((srcH - sh) / 2);
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
  }
  return c;
}

export async function canvasEncode(canvas: HTMLCanvasElement, fmt: OutFormat, quality: number) {
  const mime = mimeFromFormat(fmt);
  const q = Math.min(1, Math.max(0.01, quality / 100));
  const supported = await browserSupportsMime(mime);
  const finalMime = supported ? mime : "image/webp";
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Failed to encode image"))),
      finalMime,
      q,
    );
  });
}

export function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = url;
  });
}

export async function convertImage(opts: {
  srcUrl: string;
  outW: number;
  outH: number;
  format: OutFormat;
  quality: number;
  background?: string;
}): Promise<{ blob: Blob }> {
  const c = await drawToCanvas({
    srcUrl: opts.srcUrl,
    srcW: opts.outW,
    srcH: opts.outH,
    outW: opts.outW,
    outH: opts.outH,
    fit: "contain",
    background: opts.format === "jpeg" ? (opts.background ?? "#ffffff") : undefined,
  });
  const blob = await canvasEncode(c, opts.format, opts.quality);
  return { blob };
}

export async function resizeImage(opts: {
  srcUrl: string;
  srcW: number;
  srcH: number;
  outW: number;
  outH: number;
  fit: FitMode;
  format: OutFormat;
  quality: number;
  background?: string;
  filterCss?: string;
}): Promise<{ blob: Blob }> {
  const c = await drawToCanvas({
    srcUrl: opts.srcUrl,
    srcW: opts.srcW,
    srcH: opts.srcH,
    outW: opts.outW,
    outH: opts.outH,
    fit: opts.fit,
    background: opts.format === "jpeg" ? (opts.background ?? "#ffffff") : undefined,
    filterCss: opts.filterCss,
  });
  const blob = await canvasEncode(c, opts.format, opts.quality);
  return { blob };
}

export async function detectHasAlpha(url: string): Promise<boolean> {
  const img = await createImage(url);
  const maxDim = 256;
  const ratio = Math.max(img.naturalWidth, img.naturalHeight) / maxDim;
  const w = ratio > 1 ? Math.round(img.naturalWidth / ratio) : img.naturalWidth;
  const h = ratio > 1 ? Math.round(img.naturalHeight / ratio) : img.naturalHeight;

  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("2D canvas context is not supported in this environment.");
  ctx.drawImage(img, 0, 0, w, h);
  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, w, h).data;
  } catch {
    return false;
  }

  for (let i = 3; i < data.length; i += 4) {
    if (data[i] !== 255) return true;
  }
  return false;
}

export async function drawWithAnchor(opts: {
  srcUrl: string;
  srcW: number;
  srcH: number;
  outW: number;
  outH: number;
  fit: FitMode;
  anchor: Anchor;
  background?: string;
  smoothing: ImageSmoothingQuality;
}): Promise<HTMLCanvasElement> {
  const { srcUrl, srcW, srcH, outW, outH, fit, anchor, background, smoothing } = opts;

  const imgEl = await createImage(srcUrl);

  const targetW = Math.max(1, Math.round(outW));
  const targetH = Math.max(1, Math.round(outH));
  const srcAspect = srcW / srcH;
  const dstAspect = targetW / targetH;

  let sx = 0,
    sy = 0,
    sw = srcW,
    sh = srcH;
  let dx = 0,
    dy = 0,
    dw = targetW,
    dh = targetH;

  if (fit === "contain") {
    if (srcAspect > dstAspect) {
      dw = targetW;
      dh = Math.round(targetW / srcAspect);
      dx = Math.round((targetW - dw) / 2);
      dy = Math.round((targetH - dh) / 2);
    } else {
      dh = targetH;
      dw = Math.round(targetH * srcAspect);
      dx = Math.round((targetW - dw) / 2);
      dy = Math.round((targetH - dh) / 2);
    }
  } else {
    const scale = Math.max(targetW / srcW, targetH / srcH);
    const needW = Math.round(targetW / scale);
    const needH = Math.round(targetH / scale);

    const ax = anchor.includes("left") ? 0 : anchor.includes("right") ? 1 : 0.5;
    const ay = anchor.includes("top") ? 0 : anchor.includes("bottom") ? 1 : 0.5;

    sx = Math.round((srcW - needW) * ax);
    sy = Math.round((srcH - needH) * ay);
    sx = Math.max(0, Math.min(sx, srcW - needW));
    sy = Math.max(0, Math.min(sy, srcH - needH));

    sw = needW;
    sh = needH;
    dx = 0;
    dy = 0;
    dw = targetW;
    dh = targetH;
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas context is not supported in this environment.");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = smoothing as ImageSmoothingQuality;

  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, targetW, targetH);
  } else {
    ctx.clearRect(0, 0, targetW, targetH);
  }

  ctx.drawImage(imgEl, sx, sy, sw, sh, dx, dy, dw, dh);
  return canvas;
}
