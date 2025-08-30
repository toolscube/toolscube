'use client';

import { ActivitySquare, Check, Copy, Crop, Download, ImageDown, Image as ImageIcon, Link2, Loader2, RotateCcw, Upload } from 'lucide-react';
import NextImage from 'next/image';
import * as React from 'react';
import { useDropzone } from 'react-dropzone';

import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard, MotionGlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type FitMode = 'contain' | 'cover';
type OutFormat = 'keep' | 'jpeg' | 'png' | 'webp';

interface LoadedImage {
  file: File;
  url: string;
  width: number;
  height: number;
  type: string;
  size: number;
}

export default function ImageCompressPage() {
  const [img, setImg] = React.useState<LoadedImage | null>(null);

  // Resize controls
  const [locked, setLocked] = React.useState(true);
  const [fit, setFit] = React.useState<FitMode>('contain');
  const [scale, setScale] = React.useState<number | ''>('');
  const [w, setW] = React.useState<number | ''>('');
  const [h, setH] = React.useState<number | ''>('');

  // Format/quality
  const [fmt, setFmt] = React.useState<OutFormat>('keep');
  const [quality, setQuality] = React.useState(80); // 1..100
  const [bg, setBg] = React.useState('#ffffff'); // for JPEG transparency / contain letterbox

  // Target size (optional)
  const [targetSize, setTargetSize] = React.useState<number | ''>(''); // in KB
  const [sizeUnit, setSizeUnit] = React.useState<'KB' | 'MB'>('KB');

  // UI
  const [running, setRunning] = React.useState(false);
  const [log, setLog] = React.useState('');
  const [copied, setCopied] = React.useState(false);

  const ratio = React.useMemo(() => (img ? img.width / img.height : 1), [img]);

  const onDrop = React.useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const meta = await loadImageMeta(url);
    setImg({
      file,
      url,
      width: meta.width,
      height: meta.height,
      type: file.type,
      size: file.size,
    });
    // reset controls
    setW(meta.width);
    setH(meta.height);
    setScale('');
    setFmt('keep');
    setQuality(80);
    setTargetSize('');
    setLog(`Loaded ${file.name} (${formatBytes(file.size)})`);
  }, []);

  React.useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const item = e.clipboardData?.files?.[0];
      if (item && item.type.startsWith('image/')) onDrop([item]);
    }
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [onDrop]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    multiple: false,
    onDrop,
  });

  // Aspect lock behavior
  React.useEffect(() => {
    if (!img) return;
    if (locked && typeof w === 'number' && document.activeElement?.id === 'width') {
      setH(Math.max(1, Math.round(w / ratio)));
    }
    if (locked && typeof h === 'number' && document.activeElement?.id === 'height') {
      setW(Math.max(1, Math.round(h * ratio)));
    }
  }, [w, h, ratio, locked, img]);

  // Scale → width/height
  React.useEffect(() => {
    if (!img) return;
    if (scale === '' || isNaN(Number(scale))) return;
    const s = Math.max(1, Number(scale));
    setW(Math.max(1, Math.round((img.width * s) / 100)));
    setH(Math.max(1, Math.round((img.height * s) / 100)));
  }, [scale, img]);

  function resetAll() {
    if (img?.url) URL.revokeObjectURL(img.url);
    setImg(null);
    setLocked(true);
    setFit('contain');
    setScale('');
    setW('');
    setH('');
    setFmt('keep');
    setQuality(80);
    setBg('#ffffff');
    setTargetSize('');
    setSizeUnit('KB');
    setRunning(false);
    setLog('');
  }

  async function run() {
    if (!img) return;

    try {
      setRunning(true);
      setLog('Compressing…');

      const actualFmt: Exclude<OutFormat, 'keep'> = fmt === 'keep' ? mimeToFmt(img.type) : fmt;
      const outW = typeof w === 'number' ? w : img.width;
      const outH = typeof h === 'number' ? h : img.height;
      const tgtBytes = targetSize === '' ? undefined : Math.max(1, Number(targetSize)) * (sizeUnit === 'MB' ? 1024 * 1024 : 1024);

      const { blob } = await compress({
        srcUrl: img.url,
        srcW: img.width,
        srcH: img.height,
        outW,
        outH,
        fit,
        format: actualFmt,
        quality,
        background: bg,
        targetBytes: tgtBytes,
      });

      const filename = suggestName(img.file.name, actualFmt);
      triggerDownload(blob, filename);
      setLog(`Done → ${filename} (${formatBytes(blob.size)}).${tgtBytes ? ` Target was ≤ ${formatBytes(tgtBytes)}.` : ''}`);
    } catch (e: any) {
      setLog(`Error: ${e?.message || String(e)}`);
    } finally {
      setRunning(false);
    }
  }

  function copyLog() {
    navigator.clipboard.writeText(log || '').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1100);
    });
  }

  const lossy = fmt === 'keep' && img ? !img.type.includes('png') : fmt !== 'png';

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <MotionGlassCard>
        {/* Header */}
        <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <ImageDown className="h-6 w-6" /> Image Compress
            </h1>
            <p className="text-sm text-muted-foreground">Shrink images for web & social. Drag & drop, paste (Ctrl/Cmd+V), or click to upload.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={resetAll} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
            <Button onClick={run} className="gap-2" disabled={!img || running}>
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {running ? 'Processing…' : 'Compress & Download'}
            </Button>
          </div>
        </GlassCard>

        {/* Uploader / Preview */}
        <GlassCard className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Image</CardTitle>
            <CardDescription>Upload, drag & drop, or paste from clipboard.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-2">
            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={cn(
                'group relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-6 transition',
                isDragActive ? 'border-primary bg-primary/5' : 'hover:bg-muted/40',
              )}>
              <input {...getInputProps()} />
              <div className="pointer-events-none flex flex-col items-center gap-2 text-center">
                <div className="rounded-full bg-primary/10 p-3">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium">Drop image here, or click to browse</p>
                <p className="text-xs text-muted-foreground">PNG, JPEG, WEBP, GIF, SVG (GIF/SVG will be rasterized)</p>
              </div>
            </div>

            {/* Preview + Meta */}
            <div className="grid gap-4">
              <div className="relative h-56 w-full overflow-hidden rounded-lg border bg-muted/40">
                {!img ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    <ImageIcon className="mr-2 h-4 w-4" />
                    No image selected
                  </div>
                ) : (
                  <NextImage src={img.url} alt="preview" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain" priority />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <InfoPill label="Source Size" value={img ? formatBytes(img.size) : '—'} />
                <InfoPill label="Source Type" value={img ? img.type || '—' : '—'} />
                <InfoPill label="Width" value={img ? `${img.width}px` : '—'} />
                <InfoPill label="Height" value={img ? `${img.height}px` : '—'} />
              </div>
            </div>
          </CardContent>
        </GlassCard>

        {/* Settings */}
        <GlassCard className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Settings</CardTitle>
            <CardDescription>Downscale (optional), pick output, and control size/quality.</CardDescription>
          </CardHeader>

          <CardContent className="grid gap-6 md:grid-cols-2">
            {/* Dimensions */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="width">Width (px)</Label>
                  <Input id="width" type="number" min={1} value={w} onChange={(e) => setW(numOrEmpty(e.target.value))} disabled={!img} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (px)</Label>
                  <Input id="height" type="number" min={1} value={h} onChange={(e) => setH(numOrEmpty(e.target.value))} disabled={!img} />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch checked={locked} onCheckedChange={setLocked} id="lock" />
                  <Label htmlFor="lock" className="flex items-center gap-1">
                    <Link2 className="h-4 w-4" /> Lock aspect ratio
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Label htmlFor="scale" className="text-sm text-muted-foreground">
                    Scale (%)
                  </Label>
                  <Input id="scale" type="number" min={1} placeholder="e.g. 50 for half" className="w-36" value={scale} onChange={(e) => setScale(numOrEmpty(e.target.value))} disabled={!img} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Fit</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Select value={fit} onValueChange={(v: FitMode) => setFit(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contain">Contain (no crop)</SelectItem>
                      <SelectItem value="cover">Cover (fills, may crop)</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="rounded-md border p-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Crop className="h-3.5 w-3.5" />
                      <span>
                        <span className="font-medium">Contain</span> centers with padding; <span className="font-medium">Cover</span> fills box (smart crop).
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Format & Size */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Output Format</Label>
                <Select value={fmt} onValueChange={(v: OutFormat) => setFmt(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Keep original" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="keep">Keep original</SelectItem>
                    <SelectItem value="webp">WEBP (recommended)</SelectItem>
                    <SelectItem value="jpeg">JPEG</SelectItem>
                    <SelectItem value="png">PNG</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">WEBP is typically the smallest; PNG is best for sharp UI/graphics.</p>
              </div>

              {/* Quality (lossy only) */}
              <div className="space-y-2 opacity-100">
                <div className="flex items-center justify-between">
                  <Label htmlFor="quality" className={cn(!lossy && 'text-muted-foreground')}>
                    Quality {lossy ? '' : '(lossless)'}
                  </Label>
                  <span className="text-xs text-muted-foreground">{quality}</span>
                </div>
                <Slider id="quality" min={1} max={100} step={1} value={[quality]} onValueChange={([q]) => setQuality(q)} disabled={!lossy} />
                {!lossy && <p className="text-xs text-muted-foreground">PNG ignores quality; consider WEBP/JPEG to reduce size.</p>}
              </div>

              {/* Background color (used if JPEG + contain padding) */}
              {(fmt === 'jpeg' || (fmt === 'keep' && img && img.type.includes('jpeg'))) && (
                <div className="space-y-2">
                  <Label htmlFor="bg" className="text-sm">
                    Background (for transparency / contain padding)
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input id="bg" type="color" className="h-9 w-16 p-1" value={bg} onChange={(e) => setBg(e.target.value)} />
                    <Input aria-label="Background hex" value={bg} onChange={(e) => setBg(e.target.value)} className="w-36" />
                  </div>
                </div>
              )}

              {/* Target size */}
              <div className="space-y-2">
                <Label htmlFor="target">Target Size (optional)</Label>
                <div className="flex items-center gap-2">
                  <Input id="target" type="number" min={1} placeholder="e.g. 180" className="w-36" value={targetSize} onChange={(e) => setTargetSize(numOrEmpty(e.target.value))} />
                  <Select value={sizeUnit} onValueChange={(v: 'KB' | 'MB') => setSizeUnit(v)}>
                    <SelectTrigger className="w-28">
                      <SelectValue placeholder="KB" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KB">KB</SelectItem>
                      <SelectItem value="MB">MB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground">Tries to meet the target by adjusting quality (lossy formats). PNG cannot target size precisely.</p>
              </div>
            </div>
          </CardContent>
        </GlassCard>

        <Separator />

        {/* Output & Log */}
        <GlassCard className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Output & Log</CardTitle>
            <CardDescription>Click Compress & Download to save the result.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <ActivitySquare className="h-4 w-4" />
                  Target Dimensions
                </span>
                <span className="font-medium">{typeof w === 'number' && typeof h === 'number' ? `${w} × ${h}px` : '—'}</span>
              </div>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                <li>Canvas re-encoding strips EXIF/metadata by default.</li>
                <li>Animated GIFs will be flattened to a single frame.</li>
                <li>For the smallest size, try **WEBP** and reduce dimensions.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Process Log</Label>
              <Textarea readOnly value={log} className="min-h-[120px] font-mono" />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={copyLog} disabled={!log}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  Copy
                </Button>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => setLog('')}>
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </GlassCard>
      </MotionGlassCard>
    </div>
  );
}

/* ------------------- helpers ------------------- */

function numOrEmpty(v: string): number | '' {
  const n = Number(v);
  return isNaN(n) ? '' : n;
}

function mimeToFmt(mime: string): Exclude<OutFormat, 'keep'> {
  if (mime.includes('png')) return 'png';
  if (mime.includes('webp')) return 'webp';
  return 'jpeg';
}

function suggestName(name: string, fmt: Exclude<OutFormat, 'keep'>) {
  const base = name.replace(/\.[^.]+$/, '');
  return `${base}-compressed.${fmt === 'jpeg' ? 'jpg' : fmt}`;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function formatBytes(bytes: number) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

function loadImageMeta(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = url;
  });
}

async function compress(opts: {
  srcUrl: string;
  srcW: number;
  srcH: number;
  outW: number;
  outH: number;
  fit: FitMode;
  format: Exclude<OutFormat, 'keep'>;
  quality: number; // 1..100
  background: string;
  targetBytes?: number;
}): Promise<{ blob: Blob }> {
  const { srcUrl, srcW, srcH, outW, outH, fit, format, quality, background, targetBytes } = opts;

  // prepare canvas with draw (contain/cover)
  const { canvas } = await drawCanvas({
    srcUrl,
    srcW,
    srcH,
    outW,
    outH,
    fit,
    format,
    background,
  });

  const mime = format === 'png' ? 'image/png' : format === 'jpeg' ? 'image/jpeg' : 'image/webp';
  const q = Math.min(1, Math.max(0.01, quality / 100));

  // If targetBytes requested and lossy format → binary search on quality
  if (targetBytes && format !== 'png') {
    const blob = await toTargetSize(canvas, mime, targetBytes, q);
    return { blob };
  }

  // Single encode
  const blob = await canvasToBlob(canvas, mime, q);
  return { blob };
}

async function drawCanvas(opts: {
  srcUrl: string;
  srcW: number;
  srcH: number;
  outW: number;
  outH: number;
  fit: FitMode;
  format: Exclude<OutFormat, 'keep'>;
  background: string;
}): Promise<{ canvas: HTMLCanvasElement }> {
  const { srcUrl, srcW, srcH, outW, outH, fit, format, background } = opts;

  const targetW = Math.max(1, Math.round(outW));
  const targetH = Math.max(1, Math.round(outH));

  const srcAspect = srcW / srcH;
  const dstAspect = targetW / targetH;

  let drawW = targetW;
  let drawH = targetH;

  if (fit === 'contain') {
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

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d')!;

  // JPEG needs background to replace transparency; also used when contain pads
  if (format === 'jpeg') {
    ctx.fillStyle = background || '#ffffff';
    ctx.fillRect(0, 0, targetW, targetH);
  } else {
    ctx.clearRect(0, 0, targetW, targetH);
  }

  const imgEl = await createImageElement(srcUrl);

  if (fit === 'contain') {
    const dx = Math.round((targetW - drawW) / 2);
    const dy = Math.round((targetH - drawH) / 2);
    ctx.drawImage(imgEl, 0, 0, srcW, srcH, dx, dy, drawW, drawH);
  } else {
    const scale = Math.max(targetW / srcW, targetH / srcH);
    const sw = Math.round(targetW / scale);
    const sh = Math.round(targetH / scale);
    const sx = Math.round((srcW - sw) / 2);
    const sy = Math.round((srcH - sh) / 2);
    ctx.drawImage(imgEl, sx, sy, sw, sh, 0, 0, targetW, targetH);
  }

  return { canvas };
}

function createImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, q: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Failed to encode image'))), mime, q);
  });
}

async function toTargetSize(canvas: HTMLCanvasElement, mime: string, targetBytes: number, initialQ: number): Promise<Blob> {
  let lo = 0.05;
  let hi = 1.0;
  let best: Blob | null = null;

  // Start near the requested quality
  let q = Math.max(lo, Math.min(hi, initialQ));

  for (let i = 0; i < 8; i++) {
    const blob = await canvasToBlob(canvas, mime, q);
    if (blob.size <= targetBytes) {
      best = blob; // good — try higher quality but stay under target
      lo = q;
      q = (q + hi) / 2;
    } else {
      hi = q;
      q = (q + lo) / 2;
    }
  }

  if (best) return best;

  // If we never went under target, return the smallest (hi bound)
  return canvasToBlob(canvas, mime, lo);
}

/* ------------------- tiny UI subcomp ------------------- */
function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-background/60 p-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-xs font-medium">{value}</div>
    </div>
  );
}
