"use client";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Copy,
  Download,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  Palette,
  Sparkles,
  Type,
  Upload,
} from "lucide-react";
import React from "react";
import {
  ActionButton,
  CopyButton,
  ExportBlobButton,
  ExportTextButton,
  ResetButton,
} from "@/components/shared/action-buttons";
import InputField from "@/components/shared/form-fields/input-field";
import SelectField from "@/components/shared/form-fields/select-field";
import SwitchRow from "@/components/shared/form-fields/switch-row";
import TextareaField from "@/components/shared/form-fields/textarea-field";
import ToolPageHeader from "@/components/shared/tool-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard, MotionGlassCard } from "@/components/ui/glass-card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

type Align = "left" | "center" | "right";

type State = {
  /* Canvas */
  w: number;
  h: number;

  /* Content */
  title: string;
  subtitle: string;
  badge: string;
  brand: string;

  /* Typography */
  titleSize: number;
  subtitleSize: number;
  titleWeight: number;
  subtitleWeight: number;
  lineHeight: number;
  fontFamily: string;
  align: Align;
  padX: number;
  padY: number;
  gap: number;

  /* Guides */
  showGrid: boolean;
  showSafe: boolean;

  /* Colors */
  fg: string;
  accent: string;
  useGradient: boolean;
  bg1: string;
  bg2: string;
  gradAngle: number;

  /* BG image & logo */
  bgImage?: string;
  bgImageOpacity: number;
  bgBlur: number;
  logo?: string;
  logoSize: number;
  logoCorner: "tl" | "tr" | "bl" | "br";
  logoRound: number;

  /* Effects */
  dropShadow: boolean;
  shadowStrength: number;
  overlayTint: string;
  overlayOn: boolean;

  /* Text outline */
  outlineOn: boolean;
  outlineWidth: number;
  outlineColor: string;

  /* Watermark */
  watermarkOn: boolean;
  watermarkOpacity: number;

  /* Export */
  jpgQuality: number;
};

/* -------------------------------------------------------------------------- */
/*                                 Defaults                                   */
/* -------------------------------------------------------------------------- */

const DEFAULT: State = {
  w: 1200,
  h: 630,

  title: "Your Catchy Post Title",
  subtitle: "Optional subtitle goes here to add context for social previews.",
  badge: "Tools Hub",
  brand: "naturalsefaa.com",

  titleSize: 92,
  subtitleSize: 36,
  titleWeight: 800,
  subtitleWeight: 500,
  lineHeight: 1.2,
  fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto",

  align: "left",
  padX: 96,
  padY: 96,
  gap: 18,

  showGrid: false,
  showSafe: false,

  fg: "#0f172a",
  accent: "#22c55e",
  useGradient: true,
  bg1: "#f8fafc",
  bg2: "#e2e8f0",
  gradAngle: 135,

  bgImage: undefined,
  bgImageOpacity: 0.25,
  bgBlur: 0,
  logo: undefined,
  logoSize: 120,
  logoCorner: "tr",
  logoRound: 24,

  dropShadow: true,
  shadowStrength: 24,
  overlayTint: "rgba(255,255,255,0.0)",
  overlayOn: false,

  outlineOn: false,
  outlineWidth: 2,
  outlineColor: "rgba(255,255,255,0.6)",

  watermarkOn: true,
  watermarkOpacity: 0.35,

  jpgQuality: 0.92,
};

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

const PRESETS_SIZE: Array<[number, number, string]> = [
  [1200, 630, "1200×630"],
  [1024, 512, "1024×512"],
  [800, 418, "800×418"],
  [1080, 1080, "1080×1080"],
];

const PRESETS_STYLE: Array<{
  name: string;
  fg: string;
  accent: string;
  bg1: string;
  bg2: string;
  angle: number;
}> = [
  {
    name: "Mint Breeze",
    fg: "#0f172a",
    accent: "#22c55e",
    bg1: "#f8fafc",
    bg2: "#e2e8f0",
    angle: 135,
  },
  {
    name: "Midnight",
    fg: "#e5e7eb",
    accent: "#60a5fa",
    bg1: "#0b1220",
    bg2: "#111827",
    angle: 135,
  },
  { name: "Candy", fg: "#111827", accent: "#f472b6", bg1: "#fee2e2", bg2: "#fef3c7", angle: 45 },
  { name: "Ocean", fg: "#ecfeff", accent: "#38bdf8", bg1: "#0ea5e9", bg2: "#0c4a6e", angle: 160 },
];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
function degToRad(d: number) {
  return (d * Math.PI) / 180;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  lineHeightPx: number,
  maxLines?: number,
) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";

  for (let i = 0; i < words.length; i++) {
    const test = line ? `${line} ${words[i]}` : words[i];
    const w = ctx.measureText(test).width;
    if (w > maxWidth && line) {
      lines.push(line);
      line = words[i];
      if (maxLines && lines.length >= maxLines) break;
    } else {
      line = test;
    }
  }
  if ((!maxLines || lines.length < maxLines) && line) lines.push(line);

  if (maxLines && lines.length === maxLines) {
    let last = lines[lines.length - 1];
    while (ctx.measureText(`${last}…`).width > maxWidth && last.length > 0) last = last.slice(0, -1);
    lines[lines.length - 1] = `${last}…`;
  }
  const height = lines.length * lineHeightPx;
  return { lines, height };
}

async function canvasToClipboard(canvas: HTMLCanvasElement) {
  if (typeof window === "undefined") {
    throw new Error("Clipboard copy is only available in the browser.");
  }
  const ClipboardItemCtor = (window as any).ClipboardItem as
    | (new (
        items: Record<string, Blob>,
      ) => ClipboardItem)
    | undefined;
  if (!navigator.clipboard || typeof ClipboardItemCtor !== "function") {
    throw new Error("Clipboard API not supported");
  }
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Blob failed"))), "image/png");
  });
  const item = new ClipboardItemCtor({ [blob.type]: blob });
  await navigator.clipboard.write([item]);
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: "image/png" | "image/jpeg",
  quality?: number,
): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Blob failed"))), type, quality),
  );
}

/* -------------------------------------------------------------------------- */
/*                                    Page                                    */
/* -------------------------------------------------------------------------- */

export default function OGBuilderPage() {
  const [s, setS] = React.useState<State>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("og-builder-v2");
        if (raw) return { ...DEFAULT, ...JSON.parse(raw) } as State;
      } catch {}
    }
    return DEFAULT;
  });

  const [copied, setCopied] = React.useState(false);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const bgImgRef = React.useRef<HTMLImageElement | null>(null);
  const logoRef = React.useRef<HTMLImageElement | null>(null);

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = s.w;
    canvas.height = s.h;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ---- Background (solid or gradient)
    if (s.useGradient) {
      const ang = degToRad(s.gradAngle);
      const cx = s.w / 2;
      const cy = s.h / 2;
      const r = Math.hypot(s.w, s.h);
      const x0 = cx + Math.cos(ang) * -r;
      const y0 = cy + Math.sin(ang) * -r;
      const x1 = cx + Math.cos(ang) * r;
      const y1 = cy + Math.sin(ang) * r;
      const g = ctx.createLinearGradient(x0, y0, x1, y1);
      g.addColorStop(0, s.bg1);
      g.addColorStop(1, s.bg2);
      ctx.fillStyle = g;
    } else {
      ctx.fillStyle = s.bg1;
    }
    ctx.fillRect(0, 0, s.w, s.h);

    // ---- Optional background image (cover)
    if (bgImgRef.current) {
      const img = bgImgRef.current;
      const scale = Math.max(s.w / img.width, s.h / img.height);
      const iw = img.width * scale;
      const ih = img.height * scale;
      const ix = (s.w - iw) / 2;
      const iy = (s.h - ih) / 2;

      ctx.save();
      if (s.bgBlur > 0) ctx.filter = `blur(${s.bgBlur}px)`;
      ctx.globalAlpha = clamp(s.bgImageOpacity, 0, 1);
      ctx.drawImage(img, ix, iy, iw, ih);
      ctx.restore();
    }

    // ---- Overlay tint
    if (s.overlayOn) {
      ctx.fillStyle = s.overlayTint;
      ctx.fillRect(0, 0, s.w, s.h);
    }

    // ---- Safe area
    if (s.showSafe) {
      ctx.save();
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 2;
      ctx.strokeRect(s.padX, s.padY, s.w - s.padX * 2, s.h - s.padY * 2);
      ctx.restore();
    }

    // ---- Grid
    if (s.showGrid) {
      ctx.save();
      ctx.strokeStyle = "rgba(0,0,0,0.06)";
      for (let x = 0; x <= s.w; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, s.h);
        ctx.stroke();
      }
      for (let y = 0; y <= s.h; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(s.w, y);
        ctx.stroke();
      }
      ctx.restore();
    }

    // ---- Text area
    const areaX = s.padX;
    const areaY = s.padY;
    const areaW = s.w - s.padX * 2;

    // ---- Badge
    if (s.badge.trim()) {
      const badgePadX = 18;
      const badgePadY = 8;
      ctx.save();
      ctx.font = `600 22px ${s.fontFamily}`;
      const tw = ctx.measureText(s.badge).width;
      const bx = areaX;
      const by = areaY;
      const bw = tw + badgePadX * 2;
      const bh = 22 + badgePadY * 2;

      roundRect(ctx, bx, by, bw, bh, 999);
      ctx.fillStyle = s.accent;
      ctx.fill();

      ctx.fillStyle = "#0a0a0a";
      ctx.textBaseline = "middle";
      ctx.fillText(s.badge, bx + badgePadX, by + bh / 2 + 1);
      ctx.restore();
    }

    // ---- Start Y after badge
    let curY = areaY + (s.badge.trim() ? 56 : 0);

    // ---- Title
    ctx.save();
    ctx.textBaseline = "top";
    ctx.font = `${s.titleWeight} ${s.titleSize}px ${s.fontFamily}`;

    const titleWrap = wrapText(ctx, s.title, areaW, s.titleSize * s.lineHeight, 4);
    const baseX =
      s.align === "left" ? areaX : s.align === "center" ? areaX + areaW / 2 : areaX + areaW;

    for (let i = 0; i < titleWrap.lines.length; i++) {
      const line = titleWrap.lines[i];
      const w = ctx.measureText(line).width;
      const x = s.align === "left" ? baseX : s.align === "center" ? baseX - w / 2 : baseX - w;

      if (s.outlineOn && s.outlineWidth > 0) {
        ctx.lineWidth = s.outlineWidth;
        ctx.strokeStyle = s.outlineColor;
        ctx.strokeText(line, x, curY + i * s.titleSize * s.lineHeight);
      }

      ctx.fillStyle = s.fg;
      if (s.dropShadow) {
        ctx.shadowColor = "rgba(0,0,0,0.18)";
        ctx.shadowBlur = s.shadowStrength;
        ctx.shadowOffsetY = Math.max(4, Math.round(s.shadowStrength / 3));
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.fillText(line, x, curY + i * s.titleSize * s.lineHeight);
    }
    curY += titleWrap.height + s.gap;
    ctx.restore();

    // ---- Subtitle
    if (s.subtitle.trim()) {
      ctx.save();
      ctx.textBaseline = "top";
      ctx.font = `${s.subtitleWeight} ${s.subtitleSize}px ${s.fontFamily}`;

      const subWrap = wrapText(ctx, s.subtitle, areaW, s.subtitleSize * 1.35, 5);
      const base2X =
        s.align === "left" ? areaX : s.align === "center" ? areaX + areaW / 2 : areaX + areaW;

      for (let i = 0; i < subWrap.lines.length; i++) {
        const line = subWrap.lines[i];
        const w = ctx.measureText(line).width;
        const x = s.align === "left" ? base2X : s.align === "center" ? base2X - w / 2 : base2X - w;

        if (s.outlineOn && s.outlineWidth > 0) {
          ctx.lineWidth = Math.max(1, Math.round(s.outlineWidth * 0.75));
          ctx.strokeStyle = s.outlineColor;
          ctx.strokeText(line, x, curY + i * s.subtitleSize * 1.35);
        }

        ctx.fillStyle = `${s.fg} cc`;
        if (s.dropShadow) {
          ctx.shadowColor = "rgba(0,0,0,0.12)";
          ctx.shadowBlur = Math.max(8, Math.round(s.shadowStrength / 1.8));
          ctx.shadowOffsetY = Math.max(3, Math.round(s.shadowStrength / 4));
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.fillText(line, x, curY + i * s.subtitleSize * 1.35);
      }
      curY += subWrap.height;
      ctx.restore();
    }

    // ---- Watermark
    if (s.watermarkOn && s.brand.trim()) {
      ctx.save();
      ctx.font = `600 26px ${s.fontFamily}`;
      ctx.fillStyle = `rgba(0,0,0,${clamp(s.watermarkOpacity, 0, 1)})`;
      ctx.textBaseline = "alphabetic";
      const tw = ctx.measureText(s.brand).width;
      const x = s.w - s.padX - tw;
      const y = s.h - s.padY;
      ctx.fillText(s.brand, x, y);
      ctx.restore();
    }

    // ---- Logo
    if (logoRef.current) {
      const img = logoRef.current;
      const size = s.logoSize;
      let x = s.padX;
      let y = s.padY;
      if (s.logoCorner === "tr") x = s.w - s.padX - size;
      if (s.logoCorner === "bl") y = s.h - s.padY - size;
      if (s.logoCorner === "br") {
        x = s.w - s.padX - size;
        y = s.h - s.padY - size;
      }

      ctx.save();
      roundRect(ctx, x, y, size, size, s.logoRound);
      ctx.clip();
      ctx.drawImage(img, x, y, size, size);
      ctx.restore();
    }
  }

  // Persist minimal state (skip volatile objectURLs)
  React.useEffect(() => {
    const { bgImage, logo, ...persist } = s;
    localStorage.setItem("og-builder-v2", JSON.stringify(persist));
  }, [s]);

  // Load images when URLs change
  React.useEffect(() => {
    if (!s.bgImage) {
      bgImgRef.current = null;
      return;
    }
    const url = s.bgImage;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      bgImgRef.current = img;
      draw();
    };
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [s.bgImage]);

  React.useEffect(() => {
    if (!s.logo) {
      logoRef.current = null;
      return;
    }
    const url = s.logo;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      logoRef.current = img;
      draw();
    };
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [s.logo]);

  // Redraw on state changes
  React.useEffect(() => {
    draw();
  }, [s]);

  function resetAll() {
    setS(DEFAULT);
    setCopied(false);
  }

  function onBgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setS((p) => ({ ...p, bgImage: url }));
  }
  function onLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setS((p) => ({ ...p, logo: url }));
  }

  async function copyImage() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      await canvasToClipboard(canvas);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "og-image.png";
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        }
      }, "image/png");
    }
  }

  async function getPngBlob() {
    const canvas = canvasRef.current;
    if (!canvas) throw new Error("No canvas");
    return canvasToBlob(canvas, "image/png");
  }
  async function getJpgBlob() {
    const canvas = canvasRef.current;
    if (!canvas) throw new Error("No canvas");
    return canvasToBlob(canvas, "image/jpeg", clamp(s.jpgQuality, 0.1, 1));
  }

  function applyStylePreset(p: (typeof PRESETS_STYLE)[number]) {
    setS((prev) => ({
      ...prev,
      fg: p.fg,
      accent: p.accent,
      bg1: p.bg1,
      bg2: p.bg2,
      gradAngle: p.angle,
      useGradient: true,
    }));
  }

  function exportConfigText() {
    return JSON.stringify(s, null, 2);
  }

  async function importConfigFromFile(file?: File) {
    if (!file) return;
    const text = await file.text();
    try {
      const cfg = JSON.parse(text);
      setS((p) => ({ ...p, ...cfg }));
    } catch {
      alert("Invalid JSON configuration.");
    }
  }

  function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
  ) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  const previewScale = 0.42;
  const importRef = React.useRef<HTMLInputElement | null>(null);

  return (
    <>
      <ToolPageHeader
        title="OG Image Builder"
        description="Create crisp Open Graph images with presets, gradients, images, logos, text outline, and exports."
        icon={Sparkles}
        actions={
          <>
            <ActionButton
              icon={Upload}
              label="Import Config"
              onClick={() => importRef.current?.click()}
            />

            <input
              ref={importRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => importConfigFromFile(e.target.files?.[0] || undefined)}
            />
            {/* <CopyButton icon={Copy} active={copied} onClick={copyImage} label="Copy PNG" /> */}
            <ActionButton icon={Copy} onClick={copyImage} label="Copy PNG" />

            <ExportBlobButton
              icon={Download}
              label="Export PNG"
              filename="og-image.png"
              getBlob={getPngBlob}
            />
            <ExportBlobButton
              icon={Download}
              label="Export JPG"
              filename="og-image.jpg"
              getBlob={getJpgBlob}
            />
            <ExportTextButton
              icon={Download}
              label="Export Config"
              filename="og-config.json"
              getText={exportConfigText}
            />
            <ResetButton onClick={resetAll} />
          </>
        }
      />

      {/* Top: Quick presets */}
      <GlassCard className="shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] p-3">
          <div className="flex flex-wrap items-center gap-2">
            <Label className="flex items-center gap-2">
              <Palette className="h-4 w-4" /> Quick Styles
            </Label>
            {PRESETS_STYLE.map((p) => (
              <Button
                key={p.name}
                size="sm"
                variant="outline"
                onClick={() => applyStylePreset(p)}
                className="gap-2"
              >
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ background: `linear-gradient(135deg, ${p.bg1}, ${p.bg2})` }}
                />
                {p.name}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Label className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" /> Size
            </Label>
            {PRESETS_SIZE.map(([w, h, label]) => (
              <Button
                key={label}
                size="sm"
                variant={s.w === w && s.h === h ? "default" : "outline"}
                onClick={() => setS((p) => ({ ...p, w, h }))}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </GlassCard>

      <Separator className="my-6" />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Controls */}
        <div className="space-y-6">
          {/* Content */}
          <GlassCard className="shadow-sm">
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Type className="h-4 w-4" /> Text
                </Label>
              </div>

              <TextareaField
                id="title"
                label="Title"
                value={s.title}
                onChange={(e) => setS((p) => ({ ...p, title: e.target.value }))}
                placeholder="Write a short, bold headline…"
                autoResize
                className="min-h-[88px]"
              />
              <TextareaField
                id="subtitle"
                label="Subtitle"
                value={s.subtitle}
                onChange={(e) => setS((p) => ({ ...p, subtitle: e.target.value }))}
                placeholder="Optional subheading…"
                autoResize
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <InputField
                  id="badge"
                  label="Badge"
                  value={s.badge}
                  onChange={(e) => setS((p) => ({ ...p, badge: e.target.value }))}
                  placeholder="Tools Hub"
                />
                <InputField
                  id="brand"
                  label="Brand / Watermark"
                  value={s.brand}
                  onChange={(e) => setS((p) => ({ ...p, brand: e.target.value }))}
                  placeholder="your-domain.com"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <InputField
                  id="titleSize"
                  type="number"
                  label="Title size"
                  value={String(s.titleSize)}
                  min={24}
                  max={180}
                  onChange={(e) =>
                    setS((p) => ({ ...p, titleSize: clamp(Number(e.target.value) || 64, 24, 180) }))
                  }
                />
                <InputField
                  id="subtitleSize"
                  type="number"
                  label="Subtitle size"
                  value={String(s.subtitleSize)}
                  min={16}
                  max={96}
                  onChange={(e) =>
                    setS((p) => ({
                      ...p,
                      subtitleSize: clamp(Number(e.target.value) || 28, 16, 96),
                    }))
                  }
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <InputField
                  id="titleWeight"
                  type="number"
                  label="Title weight"
                  value={String(s.titleWeight)}
                  min={300}
                  max={900}
                  onChange={(e) =>
                    setS((p) => ({
                      ...p,
                      titleWeight: clamp(Number(e.target.value) || 800, 300, 900),
                    }))
                  }
                />
                <InputField
                  id="subtitleWeight"
                  type="number"
                  label="Subtitle weight"
                  value={String(s.subtitleWeight)}
                  min={300}
                  max={900}
                  onChange={(e) =>
                    setS((p) => ({
                      ...p,
                      subtitleWeight: clamp(Number(e.target.value) || 500, 300, 900),
                    }))
                  }
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <InputField
                  id="lineHeight"
                  type="number"
                  step="0.05"
                  label="Line height"
                  value={String(s.lineHeight)}
                  min={1}
                  max={1.6}
                  onChange={(e) =>
                    setS((p) => ({
                      ...p,
                      lineHeight: clamp(Number(e.target.value) || 1.2, 1, 1.6),
                    }))
                  }
                />
                <InputField
                  id="gap"
                  type="number"
                  label="Gap"
                  value={String(s.gap)}
                  min={0}
                  max={80}
                  onChange={(e) =>
                    setS((p) => ({ ...p, gap: clamp(Number(e.target.value) || 18, 0, 80) }))
                  }
                />
                <InputField
                  id="fontFamily"
                  label="Font family"
                  value={s.fontFamily}
                  onChange={(e) => setS((p) => ({ ...p, fontFamily: e.target.value }))}
                  placeholder="Inter, Poppins, …"
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <Button
                  type="button"
                  variant={s.align === "left" ? "default" : "outline"}
                  onClick={() => setS((p) => ({ ...p, align: "left" }))}
                  className="gap-2"
                >
                  <AlignLeft className="h-4 w-4" /> Left
                </Button>
                <Button
                  type="button"
                  variant={s.align === "center" ? "default" : "outline"}
                  onClick={() => setS((p) => ({ ...p, align: "center" }))}
                  className="gap-2"
                >
                  <AlignCenter className="h-4 w-4" /> Center
                </Button>
                <Button
                  type="button"
                  variant={s.align === "right" ? "default" : "outline"}
                  onClick={() => setS((p) => ({ ...p, align: "right" }))}
                  className="gap-2"
                >
                  <AlignRight className="h-4 w-4" /> Right
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <InputField
                  id="padX"
                  type="number"
                  label="Padding X"
                  value={String(s.padX)}
                  min={24}
                  max={240}
                  onChange={(e) =>
                    setS((p) => ({ ...p, padX: clamp(Number(e.target.value) || 96, 24, 240) }))
                  }
                />
                <InputField
                  id="padY"
                  type="number"
                  label="Padding Y"
                  value={String(s.padY)}
                  min={24}
                  max={240}
                  onChange={(e) =>
                    setS((p) => ({ ...p, padY: clamp(Number(e.target.value) || 96, 24, 240) }))
                  }
                />
              </div>
            </div>
          </GlassCard>

          {/* Colors */}
          <GlassCard className="shadow-sm">
            <div className="p-4 space-y-3">
              <Label className="flex items-center gap-2">
                <Palette className="h-4 w-4" /> Colors
              </Label>

              <div className="grid gap-3 sm:grid-cols-2">
                <InputField
                  id="fg"
                  label="Text"
                  type="color"
                  value={s.fg}
                  onChange={(e) => setS((p) => ({ ...p, fg: e.target.value }))}
                />
                <InputField
                  id="accent"
                  label="Accent"
                  type="color"
                  value={s.accent}
                  onChange={(e) => setS((p) => ({ ...p, accent: e.target.value }))}
                />
              </div>

              <SwitchRow
                label="Use gradient background"
                checked={s.useGradient}
                onCheckedChange={(v) => setS((p) => ({ ...p, useGradient: v }))}
              />

              <div className="grid gap-3 sm:grid-cols-3">
                <InputField
                  id="bg1"
                  type="color"
                  label={s.useGradient ? "Color 1" : "Background"}
                  value={s.bg1}
                  onChange={(e) => setS((p) => ({ ...p, bg1: e.target.value }))}
                />
                <InputField
                  id="bg2"
                  type="color"
                  label="Color 2"
                  value={s.bg2}
                  disabled={!s.useGradient}
                  onChange={(e) => setS((p) => ({ ...p, bg2: e.target.value }))}
                />
                <InputField
                  id="angle"
                  type="number"
                  label="Angle"
                  value={String(s.gradAngle)}
                  disabled={!s.useGradient}
                  onChange={(e) =>
                    setS((p) => ({
                      ...p,
                      gradAngle: (((Number(e.target.value) || 0) % 360) + 360) % 360,
                    }))
                  }
                />
              </div>
            </div>
          </GlassCard>

          {/* Media */}
          <GlassCard className="shadow-sm">
            <div className="p-4 space-y-3">
              <Label className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" /> Background & Logo
              </Label>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Background image</Label>
                  <div className="flex gap-2">
                    <input type="file" accept="image/*" onChange={onBgUpload} />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setS((p) => ({ ...p, bgImage: undefined }))}
                      disabled={!s.bgImage}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Logo</Label>
                  <div className="flex gap-2">
                    <input type="file" accept="image/*" onChange={onLogoUpload} />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setS((p) => ({ ...p, logo: undefined }))}
                      disabled={!s.logo}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <InputField
                  id="bgOpacity"
                  type="number"
                  step="0.05"
                  label="BG opacity"
                  value={String(s.bgImageOpacity)}
                  onChange={(e) =>
                    setS((p) => ({
                      ...p,
                      bgImageOpacity: clamp(Number(e.target.value) || 0.25, 0, 1),
                    }))
                  }
                />
                <InputField
                  id="bgBlur"
                  type="number"
                  label="BG blur"
                  value={String(s.bgBlur)}
                  onChange={(e) =>
                    setS((p) => ({ ...p, bgBlur: clamp(Number(e.target.value) || 0, 0, 60) }))
                  }
                />
                <InputField
                  id="logoSize"
                  type="number"
                  label="Logo size"
                  value={String(s.logoSize)}
                  onChange={(e) =>
                    setS((p) => ({
                      ...p,
                      logoSize: clamp(Number(e.target.value) || 120, 48, 300),
                    }))
                  }
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <InputField
                  id="logoRound"
                  type="number"
                  label="Logo radius"
                  value={String(s.logoRound)}
                  onChange={(e) =>
                    setS((p) => ({
                      ...p,
                      logoRound: clamp(Number(e.target.value) || 24, 0, 150),
                    }))
                  }
                />

                <SelectField
                  id="logoCorner"
                  label="Logo corner"
                  value={s.logoCorner}
                  onValueChange={(v) =>
                    setS((p) => ({ ...p, logoCorner: v as State["logoCorner"] }))
                  }
                  options={[
                    { value: "tl", label: "Top-Left" },
                    { value: "tr", label: "Top-Right" },
                    { value: "bl", label: "Bottom-Left" },
                    { value: "br", label: "Bottom-Right" },
                  ]}
                />

                <div className="space-y-2">
                  <Label>Watermark</Label>
                  <div className="flex items-center justify-between gap-3">
                    <SwitchRow
                      label="Show"
                      checked={s.watermarkOn}
                      onCheckedChange={(v) => setS((p) => ({ ...p, watermarkOn: v }))}
                    />
                    <InputField
                      id="wmOpacity"
                      type="number"
                      step="0.05"
                      label="Opacity"
                      value={String(s.watermarkOpacity)}
                      onChange={(e) =>
                        setS((p) => ({
                          ...p,
                          watermarkOpacity: clamp(Number(e.target.value) || 0.35, 0, 1),
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Effects & Guides */}
          <GlassCard className="shadow-sm">
            <div className="p-4 space-y-3">
              <Label className="flex items-center gap-2">
                <Layers className="h-4 w-4" /> Effects & Guides
              </Label>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <SwitchRow
                    label="Drop shadow"
                    checked={s.dropShadow}
                    onCheckedChange={(v) => setS((p) => ({ ...p, dropShadow: v }))}
                  />
                  <InputField
                    id="shadowStrength"
                    type="number"
                    label="Shadow strength"
                    value={String(s.shadowStrength)}
                    onChange={(e) =>
                      setS((p) => ({
                        ...p,
                        shadowStrength: clamp(Number(e.target.value) || 24, 0, 80),
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <SwitchRow
                    label="Overlay tint"
                    checked={s.overlayOn}
                    onCheckedChange={(v) => setS((p) => ({ ...p, overlayOn: v }))}
                  />
                  <InputField
                    id="overlay"
                    label="Overlay rgba()"
                    value={s.overlayTint}
                    onChange={(e) => setS((p) => ({ ...p, overlayTint: e.target.value }))}
                    placeholder="rgba(0,0,0,0.15)"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <SwitchRow
                    label="Text outline"
                    checked={s.outlineOn}
                    onCheckedChange={(v) => setS((p) => ({ ...p, outlineOn: v }))}
                  />
                  <InputField
                    id="outlineWidth"
                    type="number"
                    label="Outline width"
                    value={String(s.outlineWidth)}
                    onChange={(e) =>
                      setS((p) => ({
                        ...p,
                        outlineWidth: clamp(Number(e.target.value) || 2, 0, 12),
                      }))
                    }
                    disabled={!s.outlineOn}
                  />
                  <InputField
                    id="outlineColor"
                    type="text"
                    label="Outline color"
                    value={s.outlineColor}
                    onChange={(e) => setS((p) => ({ ...p, outlineColor: e.target.value }))}
                    disabled={!s.outlineOn}
                  />
                </div>

                <div className="space-y-2">
                  <SwitchRow
                    label="Show grid"
                    checked={s.showGrid}
                    onCheckedChange={(v) => setS((p) => ({ ...p, showGrid: v }))}
                  />
                  <SwitchRow
                    label="Show safe area"
                    checked={s.showSafe}
                    onCheckedChange={(v) => setS((p) => ({ ...p, showSafe: v }))}
                  />
                  <InputField
                    id="jpgQ"
                    type="number"
                    step="0.01"
                    label="JPG quality"
                    value={String(s.jpgQuality)}
                    onChange={(e) =>
                      setS((p) => ({
                        ...p,
                        jpgQuality: clamp(Number(e.target.value) || 0.92, 0.1, 1),
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Canvas size (custom) */}
          <GlassCard className="shadow-sm">
            <div className="p-4 space-y-3">
              <Label className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" /> Canvas
              </Label>
              <div className="grid gap-3 sm:grid-cols-2">
                <InputField
                  id="cw"
                  type="number"
                  label="Width"
                  value={String(s.w)}
                  min={400}
                  max={4096}
                  onChange={(e) =>
                    setS((p) => ({ ...p, w: clamp(Number(e.target.value) || 1200, 400, 4096) }))
                  }
                />
                <InputField
                  id="ch"
                  type="number"
                  label="Height"
                  value={String(s.h)}
                  min={400}
                  max={4096}
                  onChange={(e) =>
                    setS((p) => ({ ...p, h: clamp(Number(e.target.value) || 630, 400, 4096) }))
                  }
                />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right: Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Live Preview</Label>
              <p className="text-xs text-muted-foreground">
                Scaled preview. Exports render at full resolution.
              </p>
            </div>
            <Badge variant="secondary">
              {s.w}×{s.h}
            </Badge>
          </div>

          <div className="rounded-xl border bg-muted/20 p-4 overflow-auto">
            <div
              className="relative mx-auto"
              style={{
                width: Math.round(s.w * previewScale),
                height: Math.round(s.h * previewScale),
              }}
            >
              <canvas
                ref={canvasRef}
                className="h-full w-full rounded-lg shadow-sm"
                style={{
                  width: Math.round(s.w * previewScale),
                  height: Math.round(s.h * previewScale),
                  imageRendering: "auto",
                }}
              />
            </div>
          </div>
          <div className="px-4 pb-4 text-xs text-muted-foreground">
            Tip: Keep titles concise. Use high-contrast colors. Test multiple sizes.
          </div>
        </div>
      </div>
    </>
  );
}
