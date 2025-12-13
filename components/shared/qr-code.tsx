"use client";

import QRCode from "qrcode";
import * as React from "react";

export type QrECL = "L" | "M" | "Q" | "H";
export type QrFormat = "png" | "svg";

export type QrLogo = {
  src: string;
  sizePct?: number;
  roundedPct?: number;
  pad?: number;
};

export type QrProps = {
  value: string;
  format?: QrFormat;
  size?: number;
  margin?: number;
  ecl?: QrECL;
  fg?: string;
  bg?: string;
  quietZone?: boolean;
  logo?: QrLogo | null;
  className?: string;
  canvasClassName?: string;
  svgClassName?: string;
  onDataUrl?: (dataUrl: string) => void;
};

export function QRCodeBox({
  value,
  format = "png",
  size = 200,
  margin = 1,
  ecl = "M",
  fg = "#000000",
  bg = "#ffffff",
  quietZone = true,
  logo = null,
  className,
  canvasClassName,
  svgClassName,
  onDataUrl,
}: QrProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [svgMarkup, setSvgMarkup] = React.useState<string>("");

  const opts = React.useMemo(
    () => ({
      width: size,
      margin: quietZone ? margin : 0,
      errorCorrectionLevel: ecl,
      color: { dark: fg, light: bg },
    }),
    [size, margin, quietZone, ecl, fg, bg],
  );

  React.useEffect(() => {
    let cancelled = false;

    const render = async () => {
      if (!value) {
        if (format === "svg") setSvgMarkup("");
        return;
      }

      if (format === "svg") {
        const svg = await QRCode.toString(value, { ...opts, type: "svg" });
        if (!cancelled) setSvgMarkup(svg);
        return;
      }

      // canvas / png
      if (!canvasRef.current) return;
      await QRCode.toCanvas(canvasRef.current, value, opts);

      if (logo?.src) {
        await overlayLogo(canvasRef.current, {
          src: logo.src,
          sizePct: logo.sizePct ?? 20,
          roundedPct: logo.roundedPct ?? 20,
          pad: logo.pad ?? 4,
        });
      }

      if (onDataUrl && canvasRef.current) {
        onDataUrl(canvasRef.current.toDataURL("image/png"));
      }
    };

    render();
    return () => {
      cancelled = true;
    };
  }, [value, format, opts, logo?.src, logo?.sizePct, logo?.roundedPct, logo?.pad, onDataUrl]);

  return (
    <div className={className}>
      {format === "svg" ? (
        <div className={svgClassName} dangerouslySetInnerHTML={{ __html: svgMarkup || "<svg/>" }} />
      ) : (
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className={canvasClassName}
          aria-label="QR Canvas"
        />
      )}
    </div>
  );
}

/* logo overlay helper */
async function overlayLogo(
  canvas: HTMLCanvasElement,
  cfg: { src: string; sizePct: number; roundedPct: number; pad: number },
) {
  return new Promise<void>((resolve) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return resolve();

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const w = canvas.width;
      const h = canvas.height;
      const size = Math.round((Math.min(w, h) * cfg.sizePct) / 100);
      const x = Math.round(w / 2 - size / 2);
      const y = Math.round(h / 2 - size / 2);
      const r = Math.round((size * cfg.roundedPct) / 100);

      const bgX = x - cfg.pad;
      const bgY = y - cfg.pad;
      const bgW = size + cfg.pad * 2;
      const bgH = size + cfg.pad * 2;

      roundedRect(ctx, bgX, bgY, bgW, bgH, r);
      ctx.fillStyle = "#ffffff";
      ctx.fill();

      ctx.drawImage(img, x, y, size, size);
      resolve();
    };
    img.onerror = () => resolve();
    img.src = cfg.src;
  });
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
