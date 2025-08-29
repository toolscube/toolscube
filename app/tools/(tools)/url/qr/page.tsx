'use client';

import SectionHeader from '@/components/root/section-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GlassCard, MotionGlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Copy, Download, Image as ImageIcon, Link as LinkIcon, QrCode, RefreshCcw, Wand2 } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import QRCode from 'react-qr-code';

export default function AdvancedQRPage() {
  const [value, setValue] = useState('https://tariqul.dev');
  const [size, setSize] = useState(320);
  const [margin, setMargin] = useState(16);
  const [level, setLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [fg, setFg] = useState('#0f172a'); // slate-900
  const [bg, setBg] = useState('#ffffff');
  const [rounded, setRounded] = useState(24); // container rounding (visual)

  // Gradient background behind transparent QR
  const [useGradient, setUseGradient] = useState(true);
  const [gradFrom, setGradFrom] = useState('#a78bfa'); // violet-400
  const [gradTo, setGradTo] = useState('#60a5fa'); // blue-400
  const [gradDir, setGradDir] = useState<'to-r' | 'to-b' | 'radial'>('to-r');

  // Logo overlay
  const [logoUrl, setLogoUrl] = useState('');
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoPct, setLogoPct] = useState(20); // % of QR size
  const [logoBg, setLogoBg] = useState(true);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // Derived
  const total = size + margin * 2;
  const hasLogo = !!logoDataUrl || !!logoUrl;

  // Copy helpers
  const copy = async (t: string) => {
    try {
      await navigator.clipboard.writeText(t);
    } catch {}
  };

  // Upload logo as data URL
  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(String(reader.result));
    reader.readAsDataURL(f);
  };

  // Export refs
  const svgWrapperRef = useRef<HTMLDivElement | null>(null);

  const downloadSVG = () => {
    const svg = svgWrapperRef.current?.querySelector('svg');
    if (!svg) return;
    const src = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([src], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qr.svg';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const downloadPNG = async () => {
    const svg = svgWrapperRef.current?.querySelector('svg');
    if (!svg) return;
    const src = new XMLSerializer().serializeToString(svg);
    const svg64 = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(src);

    const img = new Image();
    const scale = 2; // retina export
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = total * scale;
      canvas.height = total * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // background
      if (useGradient) {
        if (gradDir === 'radial') {
          const g = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2);
          g.addColorStop(0, gradFrom);
          g.addColorStop(1, gradTo);
          ctx.fillStyle = g as unknown as string;
        } else {
          const g = ctx.createLinearGradient(0, 0, gradDir === 'to-r' ? canvas.width : 0, gradDir === 'to-b' ? canvas.height : 0);
          g.addColorStop(0, gradFrom);
          g.addColorStop(1, gradTo);
          ctx.fillStyle = g as unknown as string;
        }
      } else {
        ctx.fillStyle = bg;
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // draw QR (centered with margin)
      const qrSize = size * scale;
      const pad = margin * scale;
      const imgEl = img as HTMLImageElement;
      ctx.drawImage(imgEl, pad, pad, qrSize, qrSize);

      // draw logo if any
      if (hasLogo) {
        const logo = new Image();
        const srcLogo = logoDataUrl || logoUrl;
        if (srcLogo) {
          logo.onload = () => {
            const l = size * (logoPct / 100) * scale;
            const x = (canvas.width - l) / 2;
            const y = (canvas.height - l) / 2;
            if (logoBg) {
              ctx.fillStyle = '#ffffff';
              const r = Math.max(8, l * 0.18);
              roundRect(ctx, x, y, l, l, r);
              ctx.fill();
            }
            ctx.drawImage(logo, x, y, l, l);
            finish();
          };
          logo.crossOrigin = 'anonymous';
          logo.src = srcLogo;
        } else {
          finish();
        }
      } else {
        finish();
      }

      function finish() {
        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'qr.png';
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        }, 'image/png');
      }
    };
    img.crossOrigin = 'anonymous';
    img.src = svg64;
  };

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  // Presets
  const applyPreset = (k: 'glass' | 'midnight' | 'sunset') => {
    if (k === 'glass') {
      setUseGradient(true);
      setGradFrom('#e9d5ff');
      setGradTo('#93c5fd');
      setGradDir('to-r');
      setFg('#0f172a');
      setRounded(24);
    } else if (k === 'midnight') {
      setUseGradient(false);
      setBg('#0b1220');
      setFg('#e2e8f0');
      setRounded(20);
    } else if (k === 'sunset') {
      setUseGradient(true);
      setGradFrom('#fb7185');
      setGradTo('#f59e0b');
      setGradDir('to-b');
      setFg('#111827');
      setRounded(28);
    }
  };

  const gradientStyle = useMemo(() => {
    if (!useGradient) return { background: bg } as React.CSSProperties;
    if (gradDir === 'radial') {
      return { background: `radial-gradient(circle at 50% 50%, ${gradFrom}, ${gradTo})` } as React.CSSProperties;
    }
    const dir = gradDir === 'to-r' ? 'to right' : 'to bottom';
    return { background: `linear-gradient(${dir}, ${gradFrom}, ${gradTo})` } as React.CSSProperties;
  }, [useGradient, gradDir, gradFrom, gradTo, bg]);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <SectionHeader title="QR Code (Advanced)" desc="Beautiful, export-ready QR with gradients, logo overlay, and precise controls." />

      <MotionGlassCard className="p-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          {/* Controls */}
          <div className="grid gap-6">
            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Content</Label>
                <Badge variant="secondary" className="gap-1">
                  <QrCode className="h-3.5 w-3.5" /> Live
                </Badge>
              </div>
              <div className="mt-2 flex gap-2">
                <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="https://example.com" className="bg-background/60 backdrop-blur" />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" onClick={() => setValue(window.location.href)}>
                        <LinkIcon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Use current page URL</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button variant="ghost" onClick={() => setValue('')}>
                  <RefreshCcw className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => copy(value)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Size: {size}px</Label>
                  <input type="range" min={160} max={512} value={size} onChange={(e) => setSize(Number(e.target.value))} />
                </div>
                <div className="grid gap-2">
                  <Label>Margin: {margin}px</Label>
                  <input type="range" min={0} max={48} value={margin} onChange={(e) => setMargin(Number(e.target.value))} />
                </div>
                <div className="grid gap-2">
                  <Label>Rounding: {rounded}px</Label>
                  <input type="range" min={0} max={40} value={rounded} onChange={(e) => setRounded(Number(e.target.value))} />
                </div>
                <div className="grid gap-2">
                  <Label>ECC Level</Label>
                  <Select value={level} onValueChange={(v) => setLevel(v as any)}>
                    <SelectTrigger className="bg-background/60 backdrop-blur">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">L (low)</SelectItem>
                      <SelectItem value="M">M (medium)</SelectItem>
                      <SelectItem value="Q">Q (quartile)</SelectItem>
                      <SelectItem value="H">H (high)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <Label>Colors</Label>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>Gradient</span>
                  <Switch checked={useGradient} onCheckedChange={setUseGradient} />
                </div>
              </div>

              {useGradient ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>From</Label>
                    <Input type="color" value={gradFrom} onChange={(e) => setGradFrom(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label>To</Label>
                    <Input type="color" value={gradTo} onChange={(e) => setGradTo(e.target.value)} />
                  </div>
                  <div className="grid gap-2 col-span-2">
                    <Label>Direction</Label>
                    <Select value={gradDir} onValueChange={(v) => setGradDir(v as any)}>
                      <SelectTrigger className="bg-background/60 backdrop-blur">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="to-r">Left → Right</SelectItem>
                        <SelectItem value="to-b">Top → Bottom</SelectItem>
                        <SelectItem value="radial">Radial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Foreground</Label>
                    <Input type="color" value={fg} onChange={(e) => setFg(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Background</Label>
                    <Input type="color" value={bg} onChange={(e) => setBg(e.target.value)} />
                  </div>
                </div>
              )}
            </GlassCard>

            <GlassCard className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <Label>Logo</Label>
                <Badge variant="outline" className="gap-1">
                  <ImageIcon className="h-3.5 w-3.5" /> Optional
                </Badge>
              </div>
              <div className="grid gap-3">
                <div className="flex gap-2">
                  <Input placeholder="https://…/logo.png" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
                  <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPick} />
                  <Button variant="outline" onClick={() => fileRef.current?.click()}>
                    Upload
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setLogoUrl('');
                      setLogoDataUrl(null);
                    }}>
                    Clear
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Size: {logoPct}%</Label>
                    <input type="range" min={10} max={36} value={logoPct} onChange={(e) => setLogoPct(Number(e.target.value))} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>White background</Label>
                    <Switch checked={logoBg} onCheckedChange={setLogoBg} />
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                <Wand2 className="h-4 w-4" /> Presets
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => applyPreset('glass')}>
                  Glass
                </Button>
                <Button size="sm" variant="outline" onClick={() => applyPreset('midnight')}>
                  Midnight
                </Button>
                <Button size="sm" variant="outline" onClick={() => applyPreset('sunset')}>
                  Sunset
                </Button>
              </div>
            </GlassCard>
          </div>

          {/* Preview */}
          <div className="grid gap-4">
            <GlassCard className="p-4">
              <div className="text-sm text-muted-foreground">Preview</div>
              <div className="mt-3 mx-auto flex items-center justify-center" style={{ width: total, height: total, padding: margin, borderRadius: rounded, ...gradientStyle }}>
                <div className="relative" ref={svgWrapperRef} style={{ width: size, height: size }}>
                  <QRCode value={value || ' '} size={size} level={level} fgColor={useGradient ? '#000000' : fg} bgColor={useGradient ? 'transparent' : bg} />
                  {hasLogo && (
                    <div
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden"
                      style={{ width: size * (logoPct / 100), height: size * (logoPct / 100), borderRadius: logoBg ? 12 : 0 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={(logoDataUrl || logoUrl) as string} alt="logo" className="h-full w-full object-contain" crossOrigin="anonymous" />
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>

            <div className="flex flex-wrap gap-2">
              <Button onClick={downloadPNG} className="gap-2">
                <Download className="h-4 w-4" /> Download PNG
              </Button>
              <Button variant="outline" onClick={downloadSVG} className="gap-2">
                <Download className="h-4 w-4" /> Download SVG
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setValue('https://tariqul.dev');
                  setUseGradient(true);
                  setGradFrom('#a78bfa');
                  setGradTo('#60a5fa');
                  setGradDir('to-r');
                  setFg('#0f172a');
                  setBg('#ffffff');
                  setRounded(24);
                  setLogoUrl('');
                  setLogoDataUrl(null);
                }}>
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </MotionGlassCard>
    </div>
  );
}
