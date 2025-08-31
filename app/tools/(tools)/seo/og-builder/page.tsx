'use client';

import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard, MotionGlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

import { AlignCenter, AlignLeft, AlignRight, Check, Copy, Download, Grid as GridIcon, Image, Image as ImageIcon, Layers, LayoutGrid, Palette, RotateCcw, Sparkles, Type, Upload } from 'lucide-react';

// ---------------- Types ----------------
type Align = 'left' | 'center' | 'right';

type State = {
  // Canvas size
  w: number;
  h: number;

  // Content
  title: string;
  subtitle: string;
  badge: string;
  brand: string;

  // Typography
  titleSize: number;
  subtitleSize: number;
  titleWeight: number; // 400/600/800
  subtitleWeight: number;
  lineHeight: number; // multiplier
  fontFamily: string;

  // Layout
  align: Align;
  padX: number; // px
  padY: number; // px
  gap: number; // space between title/subtitle
  showGrid: boolean;
  showSafe: boolean;

  // Colors
  fg: string; // text color
  accent: string; // badge color
  // background: solid or gradient
  useGradient: boolean;
  bg1: string;
  bg2: string;
  gradAngle: number; // degrees

  // Background image & logo
  bgImage?: string; // objectURL
  bgImageOpacity: number;
  bgBlur: number; // px (simple blur via shadow draws)
  logo?: string; // objectURL
  logoSize: number; // px
  logoCorner: 'tl' | 'tr' | 'bl' | 'br';
  logoRound: number; // radius

  // Effects
  dropShadow: boolean;
  shadowStrength: number; // blur px
  overlayTint: string; // rgba
  overlayOn: boolean;

  // Watermark
  watermarkOn: boolean;
  watermarkOpacity: number;

  // Export
  jpgQuality: number; // 0..1
};

const DEFAULT: State = {
  w: 1200,
  h: 630,

  title: 'Your Catchy Post Title',
  subtitle: 'Optional subtitle goes here to add context for social previews.',
  badge: 'Tools Hub',
  brand: 'naturalsefaa.com',

  titleSize: 92,
  subtitleSize: 36,
  titleWeight: 800,
  subtitleWeight: 500,
  lineHeight: 1.2,
  fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto',

  align: 'left',
  padX: 96,
  padY: 96,
  gap: 18,
  showGrid: false,
  showSafe: false,

  fg: '#0f172a',
  accent: '#22c55e',

  useGradient: true,
  bg1: '#f8fafc',
  bg2: '#e2e8f0',
  gradAngle: 135,

  bgImage: undefined,
  bgImageOpacity: 0.25,
  bgBlur: 0,
  logo: undefined,
  logoSize: 120,
  logoCorner: 'tr',
  logoRound: 24,

  dropShadow: true,
  shadowStrength: 24,
  overlayTint: 'rgba(255,255,255,0.0)',
  overlayOn: false,

  watermarkOn: true,
  watermarkOpacity: 0.35,

  jpgQuality: 0.92,
};

// ---------------- Helpers ----------------
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function degToRad(d: number) {
  return (d * Math.PI) / 180;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, lineHeightPx: number, maxLines?: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';

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

  // Ellipsis if truncated
  if (maxLines && lines.length > maxLines) {
    lines.length = maxLines;
  }
  if (maxLines && lines.length === maxLines) {
    // ensure last line fits with ellipsis
    let last = lines[lines.length - 1];
    while (ctx.measureText(`${last}…`).width > maxWidth && last.length > 0) {
      last = last.slice(0, -1);
    }
    lines[lines.length - 1] = `${last}…`;
  }

  const height = lines.length * lineHeightPx;
  return { lines, height };
}

async function canvasToClipboard(canvas: HTMLCanvasElement) {
  if (!('clipboard' in navigator) || !(window as any).ClipboardItem) throw new Error('Clipboard API not supported.');
  return new Promise<void>((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) return reject(new Error('Failed to create image blob.'));
      try {
        const item = new (window as any).ClipboardItem({ [blob.type]: blob });
        await navigator.clipboard.write([item]);
        resolve();
      } catch (e) {
        reject(e);
      }
    }, 'image/png');
  });
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ---------------- Main Page ----------------
export default function OGBuilderPage() {
  const [s, setS] = React.useState<State>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('og-builder-v1');
        if (raw) return { ...DEFAULT, ...JSON.parse(raw) } as State;
      } catch {}
    }
    return DEFAULT;
  });

  const [copied, setCopied] = React.useState(false);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const bgImgRef = React.useRef<HTMLImageElement | null>(null);
  const logoRef = React.useRef<HTMLImageElement | null>(null);

  // Persist settings
  React.useEffect(() => {
    const { bgImage, logo, ...toSave } = s; // skip volatile objectURLs (we still save boolean info)
    localStorage.setItem('og-builder-v1', JSON.stringify(toSave));
  }, [s]);

  // Load images whenever objectURL changes
  // Background image loader
  React.useEffect(() => {
    if (!s.bgImage) {
      bgImgRef.current = null;
      return;
    }
    const url = s.bgImage;
    const img: HTMLImageElement = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      bgImgRef.current = img;
      draw(); // ensure one more paint after load
    };
    img.src = url;
    return () => {
      URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.bgImage]);

  // Logo loader
  React.useEffect(() => {
    if (!s.logo) {
      logoRef.current = null;
      return;
    }
    const url = s.logo;
    const img: HTMLImageElement = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      logoRef.current = img;
      draw();
    };
    img.src = url;
    return () => {
      URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.logo]);

  // Redraw
  React.useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s]);

  function resetAll() {
    setS(DEFAULT);
    setCopied(false);
  }

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = s.w;
    canvas.height = s.h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background (solid or gradient)
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

    // Optional background image
    if (bgImgRef.current) {
      const img = bgImgRef.current;
      // cover
      const scale = Math.max(s.w / img.width, s.h / img.height);
      const iw = img.width * scale;
      const ih = img.height * scale;
      const ix = (s.w - iw) / 2;
      const iy = (s.h - ih) / 2;

      if (s.bgBlur > 0) {
        ctx.save();
        ctx.filter = `blur(${s.bgBlur}px)`;
        ctx.globalAlpha = clamp(s.bgImageOpacity, 0, 1);
        ctx.drawImage(img, ix, iy, iw, ih);
        ctx.restore();
      } else {
        ctx.save();
        ctx.globalAlpha = clamp(s.bgImageOpacity, 0, 1);
        ctx.drawImage(img, ix, iy, iw, ih);
        ctx.restore();
      }
    }

    // Optional overlay tint
    if (s.overlayOn) {
      ctx.fillStyle = s.overlayTint;
      ctx.fillRect(0, 0, s.w, s.h);
    }

    // Safe area
    if (s.showSafe) {
      ctx.save();
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 2;
      ctx.strokeRect(s.padX, s.padY, s.w - s.padX * 2, s.h - s.padY * 2);
      ctx.restore();
    }

    // Grid overlay
    if (s.showGrid) {
      ctx.save();
      ctx.strokeStyle = 'rgba(0,0,0,0.06)';
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

    // Text block rect
    const areaX = s.padX;
    const areaY = s.padY;
    const areaW = s.w - s.padX * 2;
    const areaH = s.h - s.padY * 2;

    // Draw badge
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

      // rounded rect
      ctx.fillStyle = s.accent;
      roundRect(ctx, bx, by, bw, bh, 999);
      ctx.fill();

      ctx.fillStyle = '#0a0a0a';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.badge, bx + badgePadX, by + bh / 2 + 1);
      ctx.restore();
    }

    // Compute text start Y
    let curY = areaY + (s.badge.trim() ? 56 : 0);

    // Title
    ctx.save();
    ctx.fillStyle = s.fg;
    ctx.textBaseline = 'top';
    ctx.font = `${s.titleWeight} ${s.titleSize}px ${s.fontFamily}`;
    if (s.dropShadow) {
      ctx.shadowColor = 'rgba(0,0,0,0.18)';
      ctx.shadowBlur = s.shadowStrength;
      ctx.shadowOffsetY = Math.max(4, Math.round(s.shadowStrength / 3));
    }
    const titleWrap = wrapText(ctx, s.title, areaW, s.titleSize * s.lineHeight, 4);
    const titleX = s.align === 'left' ? areaX : s.align === 'center' ? areaX + areaW / 2 : areaX + areaW;

    for (let i = 0; i < titleWrap.lines.length; i++) {
      const line = titleWrap.lines[i];
      const w = ctx.measureText(line).width;
      const drawX = s.align === 'left' ? titleX : s.align === 'center' ? titleX - w / 2 : titleX - w;
      ctx.fillText(line, drawX, curY + i * s.titleSize * s.lineHeight);
    }
    curY += titleWrap.height + s.gap;
    ctx.restore();

    // Subtitle
    if (s.subtitle.trim()) {
      ctx.save();
      ctx.fillStyle = s.fg + 'cc'; // slight transparency
      ctx.textBaseline = 'top';
      ctx.font = `${s.subtitleWeight} ${s.subtitleSize}px ${s.fontFamily}`;
      if (s.dropShadow) {
        ctx.shadowColor = 'rgba(0,0,0,0.12)';
        ctx.shadowBlur = Math.max(8, Math.round(s.shadowStrength / 1.8));
        ctx.shadowOffsetY = Math.max(3, Math.round(s.shadowStrength / 4));
      }

      const subWrap = wrapText(ctx, s.subtitle, areaW, s.subtitleSize * 1.35, 5);
      const subX = s.align === 'left' ? areaX : s.align === 'center' ? areaX + areaW / 2 : areaX + areaW;

      for (let i = 0; i < subWrap.lines.length; i++) {
        const line = subWrap.lines[i];
        const w = ctx.measureText(line).width;
        const drawX = s.align === 'left' ? subX : s.align === 'center' ? subX - w / 2 : subX - w;
        ctx.fillText(line, drawX, curY + i * s.subtitleSize * 1.35);
      }
      curY += subWrap.height;
      ctx.restore();
    }

    // Brand watermark (bottom-right)
    if (s.watermarkOn && s.brand.trim()) {
      ctx.save();
      ctx.font = `600 26px ${s.fontFamily}`;
      ctx.fillStyle = `rgba(0,0,0,${clamp(s.watermarkOpacity, 0, 1)})`;
      ctx.textBaseline = 'alphabetic';
      const tw = ctx.measureText(s.brand).width;
      const x = s.w - s.padX - tw;
      const y = s.h - s.padY;
      ctx.fillText(s.brand, x, y);
      ctx.restore();
    }

    // Logo (corner)
    if (logoRef.current) {
      const img = logoRef.current;
      const size = s.logoSize;
      let x = s.padX;
      let y = s.padY;
      if (s.logoCorner === 'tr') {
        x = s.w - s.padX - size;
      } else if (s.logoCorner === 'bl') {
        y = s.h - s.padY - size;
      } else if (s.logoCorner === 'br') {
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

  // Rounded rectangle helper
  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  // Upload handlers
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

  // Exports
  function downloadPNG() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      downloadBlob('og-image.png', blob);
    }, 'image/png');
  }
  function downloadJPG() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        downloadBlob('og-image.jpg', blob);
      },
      'image/jpeg',
      clamp(s.jpgQuality, 0.1, 1),
    );
  }
  async function copyToClipboard() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      await canvasToClipboard(canvas);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      // fallback: download instead
      downloadPNG();
    }
  }

  // Preview scale (fit canvas to container)
  const previewScale = 0.4; // nice balanced preview

  return (
    <MotionGlassCard>
      {/* Header */}
      <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Sparkles className="h-6 w-6" /> OG Image Builder
          </h1>
          <p className="text-sm text-muted-foreground">Create crisp Open Graph images for social platforms — solid/gradient backgrounds, text, logo, and exports.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={resetAll} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          <Button variant="outline" onClick={copyToClipboard} className="gap-2">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy
          </Button>
          <Button variant="outline" onClick={downloadJPG} className="gap-2">
            <Download className="h-4 w-4" /> JPG
          </Button>
          <Button onClick={downloadPNG} className="gap-2">
            <Download className="h-4 w-4" /> PNG
          </Button>
        </div>
      </GlassCard>

      {/* Designer */}
      <GlassCard className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Design</CardTitle>
          <CardDescription>Edit content, colors, layout and preview live.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-2">
          {/* Controls */}
          <div className="space-y-6">
            {/* Presets & Size */}
            <div className="rounded-md border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" /> Size
                </Label>
                <div className="flex gap-2">
                  {[
                    [1200, 630, '1200×630'],
                    [1200, 628, '1200×628'],
                    [1024, 512, '1024×512'],
                    [800, 418, '800×418'],
                    [1080, 1080, '1080×1080'],
                  ].map(([w, h, label]) => (
                    <Button key={label} type="button" variant={s.w === w && s.h === h ? 'default' : 'outline'} size="sm" onClick={() => setS((p) => ({ ...p, w: w as number, h: h as number }))}>
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="w">Width</Label>
                  <Input id="w" type="number" value={s.w} onChange={(e) => setS((p) => ({ ...p, w: clamp(Number(e.target.value) || 1200, 400, 4096) }))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="h">Height</Label>
                  <Input id="h" type="number" value={s.h} onChange={(e) => setS((p) => ({ ...p, h: clamp(Number(e.target.value) || 630, 400, 4096) }))} />
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="rounded-md border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Type className="h-4 w-4" /> Text
                </Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Textarea id="title" value={s.title} onChange={(e) => setS((p) => ({ ...p, title: e.target.value }))} className="min-h-[88px]" placeholder="Write a short, bold headline…" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Textarea id="subtitle" value={s.subtitle} onChange={(e) => setS((p) => ({ ...p, subtitle: e.target.value }))} placeholder="Optional subheading for context…" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="badge">Badge</Label>
                  <Input id="badge" value={s.badge} onChange={(e) => setS((p) => ({ ...p, badge: e.target.value }))} placeholder="e.g. Tools Hub" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="brand">Brand/Watermark</Label>
                  <Input id="brand" value={s.brand} onChange={(e) => setS((p) => ({ ...p, brand: e.target.value }))} placeholder="your-domain.com" />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="titleSize">Title Size</Label>
                  <Input id="titleSize" type="number" value={s.titleSize} onChange={(e) => setS((p) => ({ ...p, titleSize: clamp(Number(e.target.value) || 64, 24, 180) }))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="subtitleSize">Subtitle Size</Label>
                  <Input id="subtitleSize" type="number" value={s.subtitleSize} onChange={(e) => setS((p) => ({ ...p, subtitleSize: clamp(Number(e.target.value) || 28, 16, 96) }))} />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="titleWeight">Title Weight</Label>
                  <Input id="titleWeight" type="number" value={s.titleWeight} onChange={(e) => setS((p) => ({ ...p, titleWeight: clamp(Number(e.target.value) || 800, 300, 900) }))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="subtitleWeight">Subtitle Weight</Label>
                  <Input id="subtitleWeight" type="number" value={s.subtitleWeight} onChange={(e) => setS((p) => ({ ...p, subtitleWeight: clamp(Number(e.target.value) || 500, 300, 900) }))} />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="lineHeight">Line Height</Label>
                  <Input id="lineHeight" type="number" step="0.05" value={s.lineHeight} onChange={(e) => setS((p) => ({ ...p, lineHeight: clamp(Number(e.target.value) || 1.2, 1, 1.6) }))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gap">Gap</Label>
                  <Input id="gap" type="number" value={s.gap} onChange={(e) => setS((p) => ({ ...p, gap: clamp(Number(e.target.value) || 18, 0, 80) }))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="font">Font Family</Label>
                  <Input id="font" value={s.fontFamily} onChange={(e) => setS((p) => ({ ...p, fontFamily: e.target.value }))} placeholder="Inter, Poppins, Playfair Display, …" />
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <Button type="button" variant={s.align === 'left' ? 'default' : 'outline'} onClick={() => setS((p) => ({ ...p, align: 'left' }))} className="gap-2">
                  <AlignLeft className="h-4 w-4" /> Left
                </Button>
                <Button type="button" variant={s.align === 'center' ? 'default' : 'outline'} onClick={() => setS((p) => ({ ...p, align: 'center' }))} className="gap-2">
                  <AlignCenter className="h-4 w-4" /> Center
                </Button>
                <Button type="button" variant={s.align === 'right' ? 'default' : 'outline'} onClick={() => setS((p) => ({ ...p, align: 'right' }))} className="gap-2">
                  <AlignRight className="h-4 w-4" /> Right
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="padX">Padding X</Label>
                  <Input id="padX" type="number" value={s.padX} onChange={(e) => setS((p) => ({ ...p, padX: clamp(Number(e.target.value) || 96, 24, 240) }))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="padY">Padding Y</Label>
                  <Input id="padY" type="number" value={s.padY} onChange={(e) => setS((p) => ({ ...p, padY: clamp(Number(e.target.value) || 96, 24, 240) }))} />
                </div>
              </div>
            </div>

            {/* Colors */}
            <div className="rounded-md border p-4 space-y-3">
              <Label className="flex items-center gap-2">
                <Palette className="h-4 w-4" /> Colors
              </Label>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="fg">Text</Label>
                  <Input id="fg" type="color" value={s.fg} onChange={(e) => setS((p) => ({ ...p, fg: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="accent">Accent</Label>
                  <Input id="accent" type="color" value={s.accent} onChange={(e) => setS((p) => ({ ...p, accent: e.target.value }))} />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Gradient Background</Label>
                  <p className="text-xs text-muted-foreground">Toggle solid/gradient background fill.</p>
                </div>
                <Switch checked={s.useGradient} onCheckedChange={(v) => setS((p) => ({ ...p, useGradient: v }))} />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="bg1">{s.useGradient ? 'Color 1' : 'Background'}</Label>
                  <Input id="bg1" type="color" value={s.bg1} onChange={(e) => setS((p) => ({ ...p, bg1: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bg2">Color 2</Label>
                  <Input id="bg2" type="color" disabled={!s.useGradient} value={s.bg2} onChange={(e) => setS((p) => ({ ...p, bg2: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="angle">Angle</Label>
                  <Input
                    id="angle"
                    type="number"
                    disabled={!s.useGradient}
                    value={s.gradAngle}
                    onChange={(e) => setS((p) => ({ ...p, gradAngle: (((Number(e.target.value) || 0) % 360) + 360) % 360 }))}
                  />
                </div>
              </div>
            </div>

            {/* Background & Logo */}
            <div className="rounded-md border p-4 space-y-3">
              <Label className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" /> Background & Logo
              </Label>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2">
                    <Image className="h-4 w-4" /> Background Image
                  </Label>
                  <div className="flex gap-2">
                    <Input type="file" accept="image/*" onChange={onBgUpload} />
                    <Button type="button" variant="outline" onClick={() => setS((p) => ({ ...p, bgImage: undefined }))} disabled={!s.bgImage}>
                      Remove
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2">
                    <Upload className="h-4 w-4" /> Logo
                  </Label>
                  <div className="flex gap-2">
                    <Input type="file" accept="image/*" onChange={onLogoUpload} />
                    <Button type="button" variant="outline" onClick={() => setS((p) => ({ ...p, logo: undefined }))} disabled={!s.logo}>
                      Remove
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="bgOpacity">BG Opacity</Label>
                  <Input id="bgOpacity" type="number" step="0.05" value={s.bgImageOpacity} onChange={(e) => setS((p) => ({ ...p, bgImageOpacity: clamp(Number(e.target.value) || 0.25, 0, 1) }))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bgBlur">BG Blur</Label>
                  <Input id="bgBlur" type="number" value={s.bgBlur} onChange={(e) => setS((p) => ({ ...p, bgBlur: clamp(Number(e.target.value) || 0, 0, 60) }))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="logoSize">Logo Size</Label>
                  <Input id="logoSize" type="number" value={s.logoSize} onChange={(e) => setS((p) => ({ ...p, logoSize: clamp(Number(e.target.value) || 120, 48, 300) }))} />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="logoRound">Logo Radius</Label>
                  <Input id="logoRound" type="number" value={s.logoRound} onChange={(e) => setS((p) => ({ ...p, logoRound: clamp(Number(e.target.value) || 24, 0, 150) }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Logo Corner</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
                      <Button key={c} type="button" variant={s.logoCorner === c ? 'default' : 'outline'} size="sm" onClick={() => setS((p) => ({ ...p, logoCorner: c }))}>
                        {c.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Watermark</Label>
                  <div className="flex items-center justify-between">
                    <Switch checked={s.watermarkOn} onCheckedChange={(v) => setS((p) => ({ ...p, watermarkOn: v }))} />
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Opacity</span>
                      <Input
                        type="number"
                        step="0.05"
                        className="w-24"
                        value={s.watermarkOpacity}
                        onChange={(e) => setS((p) => ({ ...p, watermarkOpacity: clamp(Number(e.target.value) || 0.35, 0, 1) }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Effects & Toggles */}
            <div className="rounded-md border p-4 space-y-3">
              <Label className="flex items-center gap-2">
                <Layers className="h-4 w-4" /> Effects
              </Label>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Drop Shadow</Label>
                  <div className="flex items-center justify-between">
                    <Switch checked={s.dropShadow} onCheckedChange={(v) => setS((p) => ({ ...p, dropShadow: v }))} />
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Strength</span>
                      <Input type="number" className="w-24" value={s.shadowStrength} onChange={(e) => setS((p) => ({ ...p, shadowStrength: clamp(Number(e.target.value) || 24, 0, 80) }))} />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Overlay Tint</Label>
                  <div className="flex items-center justify-between">
                    <Switch checked={s.overlayOn} onCheckedChange={(v) => setS((p) => ({ ...p, overlayOn: v }))} />
                    <Input type="text" placeholder="rgba(0,0,0,0.15)" className="w-40" value={s.overlayTint} onChange={(e) => setS((p) => ({ ...p, overlayTint: e.target.value }))} />
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <GridIcon className="h-4 w-4" /> Grid
                    </Label>
                    <p className="text-xs text-muted-foreground">Design-time alignment grid.</p>
                  </div>
                  <Switch checked={s.showGrid} onCheckedChange={(v) => setS((p) => ({ ...p, showGrid: v }))} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <LayoutGrid className="h-4 w-4" /> Safe Area
                    </Label>
                    <p className="text-xs text-muted-foreground">Shows content padding bounds.</p>
                  </div>
                  <Switch checked={s.showSafe} onCheckedChange={(v) => setS((p) => ({ ...p, showSafe: v }))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="jpgQ">JPG Quality</Label>
                  <Input id="jpgQ" type="number" step="0.01" value={s.jpgQuality} onChange={(e) => setS((p) => ({ ...p, jpgQuality: clamp(Number(e.target.value) || 0.92, 0.1, 1) }))} />
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Live Preview</Label>
                <p className="text-xs text-muted-foreground">Scaled preview (export renders full resolution).</p>
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
                }}>
                <canvas
                  ref={canvasRef}
                  className="h-full w-full rounded-lg shadow-sm"
                  style={{
                    width: Math.round(s.w * previewScale),
                    height: Math.round(s.h * previewScale),
                    imageRendering: 'auto',
                  }}
                />
              </div>
            </div>
            <div className="text-xs text-muted-foreground">Tips: Keep titles concise (3–5 words). Use high-contrast colors. Test multiple sizes (1200×630, 1024×512, 1080×1080).</div>
          </div>
        </CardContent>
      </GlassCard>
    </MotionGlassCard>
  );
}
