export type FitMode = "contain" | "cover";
export type OutFormat = "png" | "jpeg" | "webp";

export async function createImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

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

export function suggestName(name: string, suffix: string, fmt: OutFormat) {
  const base = name.replace(/\.[^.]+$/, "");
  return `${base}-${suffix}.${fmt === "jpeg" ? "jpg" : fmt}`;
}

export async function convertImage(opts: {
  srcUrl: string;
  outW: number;
  outH: number;
  format: OutFormat;
  quality: number;
  background?: string;
}) {
  const { srcUrl, outW, outH, format, quality, background } = opts;
  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d")!;
  if (format === "jpeg") {
    ctx.fillStyle = background || "#ffffff";
    ctx.fillRect(0, 0, outW, outH);
  } else {
    ctx.clearRect(0, 0, outW, outH);
  }
  const img = await createImageElement(srcUrl);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, outW, outH);

  const mime = format === "png" ? "image/png" : format === "jpeg" ? "image/jpeg" : "image/webp";
  const q = Math.min(1, Math.max(0.01, quality / 100));
  const blob = await new Promise<Blob>((res, rej) => {
    canvas.toBlob((b) => (b ? res(b) : rej(new Error("Failed to encode image"))), mime, q);
  });
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
}) {
  const { srcUrl, srcW, srcH, outW, outH, fit, format, quality, background } = opts;

  const targetW = Math.max(1, Math.round(outW));
  const targetH = Math.max(1, Math.round(outH));
  const srcAspect = srcW / srcH,
    dstAspect = targetW / targetH;

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

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d")!;

  if (format === "jpeg") {
    ctx.fillStyle = background || "#ffffff";
    ctx.fillRect(0, 0, targetW, targetH);
  } else {
    ctx.clearRect(0, 0, targetW, targetH);
  }

  const img = await createImageElement(srcUrl);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

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

  const mime = format === "png" ? "image/png" : format === "jpeg" ? "image/jpeg" : "image/webp";
  const q = Math.min(1, Math.max(0.01, quality / 100));
  const blob = await new Promise<Blob>((res, rej) => {
    canvas.toBlob((b) => (b ? res(b) : rej(new Error("Failed to encode image"))), mime, q);
  });
  return { blob };
}
