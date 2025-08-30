// app/tools/(tools)/image/exif-remove/page.tsx
'use client';

import { Camera, Check, Clock, Copy, Download, FileType2, Image as ImageIcon, Info, Loader2, MapPin, RotateCcw, Shield, Upload } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';
import { useDropzone } from 'react-dropzone';

import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard, MotionGlassCard } from '@/components/ui/glass-card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type OutFormat = 'jpeg' | 'png' | 'webp';

interface LoadedImage {
  file: File;
  url: string;
  width: number;
  height: number;
  type: string;
  size: number;
  exif?: ExifData | null;
}

type ExifData = {
  make?: string;
  model?: string;
  software?: string;
  dateTimeOriginal?: string;
  orientation?: number;
  exposureTime?: string;
  fNumber?: string;
  iso?: number;
  focalLength?: string;
  gps?: {
    lat?: number;
    lon?: number;
  };
  // raw map of found tags (displayed as extra rows)
  _raw?: Record<string, string | number>;
};

export default function ExifRemovePage() {
  const [img, setImg] = React.useState<LoadedImage | null>(null);
  const [fmt, setFmt] = React.useState<OutFormat>('jpeg');
  const [quality, setQuality] = React.useState(90); // lossy only
  const [fixOrientation, setFixOrientation] = React.useState(true);
  const [running, setRunning] = React.useState(false);
  const [log, setLog] = React.useState('');
  const [copied, setCopied] = React.useState(false);

  const onDrop = React.useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const arrayBuf = await file.arrayBuffer();
    const exif = parseExifSafe(arrayBuf, file.type);
    const meta = await loadImageMeta(url);

    setImg({
      file,
      url,
      width: meta.width,
      height: meta.height,
      type: file.type,
      size: file.size,
      exif,
    });

    // choose default output format based on source
    const defaultFmt: OutFormat = file.type.includes('png') ? 'png' : file.type.includes('webp') ? 'webp' : 'jpeg';
    setFmt(defaultFmt);
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

  function resetAll() {
    if (img?.url) URL.revokeObjectURL(img.url);
    setImg(null);
    setFmt('jpeg');
    setQuality(90);
    setFixOrientation(true);
    setRunning(false);
    setLog('');
  }

  async function run() {
    if (!img) return;

    try {
      setRunning(true);
      setLog('Removing EXIF and re-encoding…');

      const result = await reencodeWithoutMetadata({
        srcUrl: img.url,
        format: fmt,
        quality,
        orientation: fixOrientation ? img.exif?.orientation : 1,
      });

      const filename = suggestNameNoExif(img.file.name, fmt);
      triggerDownload(result.blob, filename);
      setLog(`Done → ${filename} (${formatBytes(result.blob.size)}). All EXIF/metadata stripped; orientation ${fixOrientation ? 'fixed if needed' : 'not adjusted'}.`);
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

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <MotionGlassCard>
        {/* Header */}
        <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <Shield className="h-6 w-6" /> EXIF Remove
            </h1>
            <p className="text-sm text-muted-foreground">Remove sensitive metadata (camera, GPS, dates) from images. Drag & drop, paste (Ctrl/Cmd+V), or click to upload.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={resetAll} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
            <Button onClick={run} className="gap-2" disabled={!img || running}>
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {running ? 'Processing…' : 'Remove & Download'}
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
                <p className="text-xs text-muted-foreground">JPEG, PNG, WEBP, GIF, SVG (GIF/SVG will be rasterized)</p>
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
                  <Image src={img.url} alt="preview" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain" priority />
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
            <CardDescription>Choose output format, quality, and orientation handling.</CardDescription>
          </CardHeader>

          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Format</Label>
              <Select value={fmt} onValueChange={(v: OutFormat) => setFmt(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jpeg">JPEG</SelectItem>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="webp">WEBP</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Re-encoding strips EXIF/metadata.</p>
            </div>

            {fmt !== 'png' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="quality">Quality</Label>
                  <span className="text-xs text-muted-foreground">{quality}</span>
                </div>
                <Slider id="quality" min={1} max={100} step={1} value={[quality]} onValueChange={([q]) => setQuality(q)} />
                <p className="text-xs text-muted-foreground">Higher = larger file size (lossy formats).</p>
              </div>
            )}

            <div className="col-span-2 flex items-center gap-3">
              <Switch id="fix-orient" checked={fixOrientation} onCheckedChange={setFixOrientation} />
              <Label htmlFor="fix-orient" className="flex items-center gap-2">
                <FileType2 className="h-4 w-4" /> Auto-fix orientation (uses EXIF Orientation if present)
              </Label>
            </div>
          </CardContent>
        </GlassCard>

        <Separator />

        {/* Detected Metadata & Log */}
        <GlassCard className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Detected Metadata</CardTitle>
            <CardDescription>Quick view of common EXIF fields (camera, date, GPS, etc.).</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              {!img?.exif ? (
                <div className="rounded-lg border p-3 text-sm text-muted-foreground">
                  <Info className="mr-2 inline-block h-4 w-4" />
                  No EXIF data detected or unsupported format.
                </div>
              ) : (
                <div className="rounded-lg border p-3 text-sm">
                  <MetaRow icon={<Camera className="h-3.5 w-3.5" />} label="Camera" value={joinVals(img.exif.make, img.exif.model)} />
                  <MetaRow icon={<Clock className="h-3.5 w-3.5" />} label="Taken" value={img.exif.dateTimeOriginal} />
                  <MetaRow icon={<Info className="h-3.5 w-3.5" />} label="Orientation" value={orientName(img.exif.orientation)} />
                  <MetaRow icon={<Info className="h-3.5 w-3.5" />} label="Exposure" value={img.exif.exposureTime} />
                  <MetaRow icon={<Info className="h-3.5 w-3.5" />} label="Aperture" value={img.exif.fNumber} />
                  <MetaRow icon={<Info className="h-3.5 w-3.5" />} label="ISO" value={img.exif.iso?.toString()} />
                  <MetaRow
                    icon={<MapPin className="h-3.5 w-3.5" />}
                    label="GPS"
                    value={img.exif.gps?.lat !== undefined && img.exif.gps?.lon !== undefined ? `${img.exif.gps.lat.toFixed(6)}, ${img.exif.gps.lon.toFixed(6)}` : undefined}
                  />

                  {/* extra rows */}
                  {img.exif._raw &&
                    Object.entries(img.exif._raw)
                      .slice(0, 8)
                      .map(([k, v]) => <MetaRow key={k} icon={<Info className="h-3.5 w-3.5" />} label={k} value={String(v)} />)}
                </div>
              )}

              <p className="text-xs text-muted-foreground">Note: This tool re-encodes the image in-browser; Canvas export removes EXIF/metadata by default.</p>
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

/* ------------------- helpers & EXIF parsing ------------------- */

function joinVals(...vals: (string | undefined)[]) {
  return vals.filter(Boolean).join(' ') || undefined;
}

function suggestNameNoExif(name: string, fmt: OutFormat) {
  const base = name.replace(/\.[^.]+$/, '');
  return `${base}-no-exif.${fmt === 'jpeg' ? 'jpg' : fmt}`;
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

function orientName(o?: number) {
  const map: Record<number, string> = {
    1: 'Normal',
    2: 'Mirror horizontal',
    3: 'Rotate 180°',
    4: 'Mirror vertical',
    5: 'Mirror + rotate 90° CW',
    6: 'Rotate 90° CW',
    7: 'Mirror + rotate 90° CCW',
    8: 'Rotate 90° CCW',
  };
  return o ? `${map[o] || `Unknown (${o})`}` : undefined;
}

function loadImageMeta(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = url;
  });
}

async function reencodeWithoutMetadata(opts: {
  srcUrl: string;
  format: OutFormat;
  quality: number; // 1..100
  orientation?: number;
}): Promise<{ blob: Blob }> {
  const { srcUrl, format, quality, orientation } = opts;
  const imgEl = await createImageElement(srcUrl);

  // apply EXIF orientation if requested
  const { canvas, ctx } = createOrientedCanvas(imgEl, orientation ?? 1);

  const mime = format === 'png' ? 'image/png' : format === 'jpeg' ? 'image/jpeg' : 'image/webp';
  const q = Math.min(1, Math.max(0.01, quality / 100));

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Failed to encode image'))), mime, q);
  });

  return { blob };
}

function createOrientedCanvas(img: HTMLImageElement, orientation: number) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  const w = img.naturalWidth;
  const h = img.naturalHeight;

  // default
  canvas.width = w;
  canvas.height = h;

  // apply transforms per EXIF orientation
  switch (orientation) {
    case 2: // mirror horizontal
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
      break;
    case 3: // rotate 180
      ctx.translate(w, h);
      ctx.rotate(Math.PI);
      break;
    case 4: // mirror vertical
      ctx.translate(0, h);
      ctx.scale(1, -1);
      break;
    case 5: // mirror + rotate 90 CW
      canvas.width = h;
      canvas.height = w;
      ctx.rotate(0.5 * Math.PI);
      ctx.scale(1, -1);
      ctx.translate(0, -h);
      break;
    case 6: // rotate 90 CW
      canvas.width = h;
      canvas.height = w;
      ctx.rotate(0.5 * Math.PI);
      ctx.translate(0, -h);
      break;
    case 7: // mirror + rotate 90 CCW
      canvas.width = h;
      canvas.height = w;
      ctx.rotate(-0.5 * Math.PI);
      ctx.scale(1, -1);
      ctx.translate(-w, 0);
      break;
    case 8: // rotate 90 CCW
      canvas.width = h;
      canvas.height = w;
      ctx.rotate(-0.5 * Math.PI);
      ctx.translate(-w, 0);
      break;
    default:
      // 1: normal
      break;
  }

  ctx.drawImage(img, 0, 0);
  return { canvas, ctx };
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

/* ------------------- tiny UI subcomps ------------------- */
function MetaRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between border-b py-1.5 last:border-0">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-muted-foreground">{label}</span>
      </div>
      <span className="ml-4 truncate text-right font-medium">{value ?? '—'}</span>
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-background/60 p-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-xs font-medium">{value}</div>
    </div>
  );
}

/* ------------------- Minimal EXIF parser (JPEG/APP1) ------------------- */
/* This reads a subset of EXIF: Make, Model, DateTimeOriginal, Orientation, ExposureTime, FNumber, ISOSpeedRatings, FocalLength, GPS. */

function parseExifSafe(buf: ArrayBuffer, mime: string): ExifData | null {
  try {
    if (!mime.includes('jpeg') && !mime.includes('jpg')) return null; // minimal parser for JPEG
    return parseExifFromJpeg(buf);
  } catch {
    return null;
  }
}

function parseExifFromJpeg(buf: ArrayBuffer): ExifData | null {
  const dv = new DataView(buf);
  let offset = 0;

  // SOI 0xFFD8
  if (dv.getUint16(0) !== 0xffd8) return null;
  offset += 2;

  // iterate segments
  while (offset < dv.byteLength) {
    const marker = dv.getUint16(offset);
    offset += 2;
    if ((marker & 0xff00) !== 0xff00) break;
    const size = dv.getUint16(offset);
    offset += 2;

    // APP1 (Exif)
    if (marker === 0xffe1) {
      // Exif header
      if (
        dv.getUint8(offset) === 0x45 && // E
        dv.getUint8(offset + 1) === 0x78 && // x
        dv.getUint8(offset + 2) === 0x69 && // i
        dv.getUint8(offset + 3) === 0x66 && // f
        dv.getUint8(offset + 4) === 0x00 &&
        dv.getUint8(offset + 5) === 0x00
      ) {
        const tiffOffset = offset + 6;
        return parseTiffIFDs(dv, tiffOffset);
      }
    }

    offset += size - 2;
  }
  return null;
}

function parseTiffIFDs(dv: DataView, tiffOffset: number): ExifData | null {
  // Byte order
  const byteOrder = dv.getUint16(tiffOffset);
  const little = byteOrder === 0x4949; // 'II'
  if (!little && byteOrder !== 0x4d4d) return null;

  const get16 = (o: number) => dv.getUint16(o, little);
  const get32 = (o: number) => dv.getUint32(o, little);

  // TIFF magic 0x002A
  if (get16(tiffOffset + 2) !== 0x2a) return null;

  const ifd0Offset = get32(tiffOffset + 4) + tiffOffset;
  const data: ExifData = { _raw: {} };

  const { nextIFDOffset, exifIFDOffset, gpsIFDOffset } = readIFD0(dv, tiffOffset, ifd0Offset, little, data);

  if (exifIFDOffset) readExifIFD(dv, tiffOffset, exifIFDOffset, little, data);
  if (gpsIFDOffset) readGPSIFD(dv, tiffOffset, gpsIFDOffset, little, data);

  // IFD1 (thumbnail) is at nextIFDOffset if needed; not required
  return data;
}

function readIFD0(dv: DataView, tiffBase: number, ifdOffset: number, little: boolean, data: ExifData): { nextIFDOffset?: number; exifIFDOffset?: number; gpsIFDOffset?: number } {
  const get16 = (o: number) => dv.getUint16(o, little);
  const get32 = (o: number) => dv.getUint32(o, little);

  const entries = get16(ifdOffset);
  let exifIFDOffset: number | undefined;
  let gpsIFDOffset: number | undefined;

  for (let i = 0; i < entries; i++) {
    const e = ifdOffset + 2 + i * 12;
    const tag = get16(e);
    const type = get16(e + 2);
    const count = get32(e + 4);
    const valueOffset = e + 8;
    const value = getTagValue(dv, tiffBase, type, count, valueOffset, little);

    switch (tag) {
      case 0x010f: // Make
        data.make = String(value);
        break;
      case 0x0110: // Model
        data.model = String(value);
        break;
      case 0x0131: // Software
        data.software = String(value);
        break;
      case 0x0112: // Orientation
        data.orientation = Number(value);
        break;
      case 0x8769: // ExifIFDPointer
        exifIFDOffset = (Array.isArray(value) ? value[0] : value) as number;
        break;
      case 0x8825: // GPSInfoIFDPointer
        gpsIFDOffset = (Array.isArray(value) ? value[0] : value) as number;
        break;
      default:
        // store small set to _raw
        if (typeof value !== 'object') data._raw![`IFD0 0x${tag.toString(16)}`] = value as any;
    }
  }

  const nextIFDOffset = get32(ifdOffset + 2 + entries * 12);
  return {
    nextIFDOffset: nextIFDOffset ? nextIFDOffset + tiffBase : undefined,
    exifIFDOffset: exifIFDOffset ? exifIFDOffset + tiffBase : undefined,
    gpsIFDOffset: gpsIFDOffset ? gpsIFDOffset + tiffBase : undefined,
  };
}

function readExifIFD(dv: DataView, tiffBase: number, ifdOffset: number, little: boolean, data: ExifData) {
  const get16 = (o: number) => dv.getUint16(o, little);
  const get32 = (o: number) => dv.getUint32(o, little);

  const entries = get16(ifdOffset);
  for (let i = 0; i < entries; i++) {
    const e = ifdOffset + 2 + i * 12;
    const tag = get16(e);
    const type = get16(e + 2);
    const count = get32(e + 4);
    const valueOffset = e + 8;
    const value = getTagValue(dv, tiffBase, type, count, valueOffset, little);

    switch (tag) {
      case 0x9003: // DateTimeOriginal
        data.dateTimeOriginal = String(value);
        break;
      case 0x829a: // ExposureTime (rational)
        data.exposureTime = formatRational(value);
        break;
      case 0x829d: // FNumber
        data.fNumber = `f/${formatRational(value)}`;
        break;
      case 0x8827: // ISOSpeedRatings
        data.iso = Array.isArray(value) ? Number(value[0]) : Number(value);
        break;
      case 0x920a: // FocalLength
        data.focalLength = `${formatRational(value)}mm`;
        break;
      default:
        if (typeof value !== 'object') data._raw![`EXIF 0x${tag.toString(16)}`] = value as any;
    }
  }
}

function readGPSIFD(dv: DataView, tiffBase: number, ifdOffset: number, little: boolean, data: ExifData) {
  const get16 = (o: number) => dv.getUint16(o, little);
  const get32 = (o: number) => dv.getUint32(o, little);

  const entries = get16(ifdOffset);
  let lat: number | undefined;
  let lon: number | undefined;
  let latRef: string | undefined;
  let lonRef: string | undefined;

  for (let i = 0; i < entries; i++) {
    const e = ifdOffset + 2 + i * 12;
    const tag = get16(e);
    const type = get16(e + 2);
    const count = get32(e + 4);
    const valueOffset = e + 8;
    const value = getTagValue(dv, tiffBase, type, count, valueOffset, little);

    switch (tag) {
      case 0x0001: // GPSLatitudeRef
        latRef = String(value);
        break;
      case 0x0002: // GPSLatitude (rational[3])
        lat = rationalToDeg(value);
        break;
      case 0x0003: // GPSLongitudeRef
        lonRef = String(value);
        break;
      case 0x0004: // GPSLongitude (rational[3])
        lon = rationalToDeg(value);
        break;
      default:
        if (typeof value !== 'object') data._raw![`GPS 0x${tag.toString(16)}`] = value as any;
    }
  }

  if (lat !== undefined && lon !== undefined) {
    if (latRef === 'S') lat = -lat;
    if (lonRef === 'W') lon = -lon;
    data.gps = { lat, lon };
  }
}

/* ----- TIFF/EXIF value readers ----- */
function getTagValue(dv: DataView, tiffBase: number, type: number, count: number, valueOffset: number, little: boolean): any {
  const get16 = (o: number) => dv.getUint16(o, little);
  const get32 = (o: number) => dv.getUint32(o, little);

  const typeSizes: Record<number, number> = {
    1: 1, // BYTE
    2: 1, // ASCII
    3: 2, // SHORT
    4: 4, // LONG
    5: 8, // RATIONAL
    7: 1, // UNDEFINED
    9: 4, // SLONG
    10: 8, // SRATIONAL
  };

  const valueBytes = typeSizes[type] * count;

  // NOTE: get32 already captures endianness; don't pass a second arg
  const valuePtr = valueBytes > 4 ? get32(valueOffset) + tiffBase : valueOffset;

  switch (type) {
    case 2: {
      // ASCII
      let s = '';
      for (let i = 0; i < count; i++) {
        const c = dv.getUint8(valuePtr + i);
        if (c === 0) break;
        s += String.fromCharCode(c);
      }
      return s.trim();
    }
    case 3: {
      // SHORT
      if (count === 1) return get16(valuePtr);
      const arr: number[] = [];
      for (let i = 0; i < count; i++) arr.push(get16(valuePtr + i * 2));
      return arr;
    }
    case 4: {
      // LONG
      if (count === 1) return get32(valuePtr);
      const arr: number[] = [];
      for (let i = 0; i < count; i++) arr.push(get32(valuePtr + i * 4));
      return arr;
    }
    case 5: {
      // RATIONAL (unsigned)
      if (count === 1) return [dv.getUint32(valuePtr, little), dv.getUint32(valuePtr + 4, little)];
      const arr: [number, number][] = [];
      for (let i = 0; i < count; i++) {
        const off = valuePtr + i * 8;
        arr.push([dv.getUint32(off, little), dv.getUint32(off + 4, little)]);
      }
      return arr;
    }
    case 10: {
      // SRATIONAL (signed)
      if (count === 1) return [dv.getInt32(valuePtr, little), dv.getInt32(valuePtr + 4, little)];
      const arr: [number, number][] = [];
      for (let i = 0; i < count; i++) {
        const off = valuePtr + i * 8;
        arr.push([dv.getInt32(off, little), dv.getInt32(off + 4, little)]);
      }
      return arr;
    }
    case 1:
    case 7: {
      // BYTE / UNDEFINED
      if (count === 1) return dv.getUint8(valuePtr);
      const arr: number[] = [];
      for (let i = 0; i < count; i++) arr.push(dv.getUint8(valuePtr + i));
      return arr;
    }
    case 9: {
      // SLONG (signed 32)
      if (count === 1) return dv.getInt32(valuePtr, little);
      const arr: number[] = [];
      for (let i = 0; i < count; i++) arr.push(dv.getInt32(valuePtr + i * 4, little));
      return arr;
    }
    default:
      return undefined;
  }
}

function formatRational(v: any): string {
  if (Array.isArray(v) && v.length === 2 && typeof v[0] === 'number' && typeof v[1] === 'number') {
    if (v[1] === 0) return `${v[0]}/0`;
    // Try to show fractions like 1/125s if small
    const dec = v[0] / v[1];
    if (dec < 1) return `1/${Math.round(1 / dec)}`;
    return dec.toFixed(3).replace(/\.?0+$/, '');
  }
  if (Array.isArray(v) && Array.isArray(v[0])) return formatRational(v[0]);
  return String(v);
}

function rationalToDeg(v: any): number | undefined {
  if (!Array.isArray(v)) return undefined;
  // v = [[degN,degD],[minN,minD],[secN,secD]]
  const toNum = (r: [number, number]) => (r[1] ? r[0] / r[1] : 0);
  const [d, m, s] = v;
  return toNum(d) + toNum(m) / 60 + toNum(s) / 3600;
}
