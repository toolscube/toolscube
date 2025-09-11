// app/tools/(tools)/image/exif-remove/page.tsx
"use client";

import {
  Camera,
  Clock,
  Eye,
  EyeOff,
  FileType2,
  Image as ImageIcon,
  Info,
  Loader2,
  MapPin,
  Palette,
  RotateCcw,
  Shield,
} from "lucide-react";
import * as React from "react";
import { ImageDropzone } from "@/components/image/image-dropzone";
import { ImagePreview, InfoPill } from "@/components/image/image-preview-meta";
import { ActionButton, ResetButton } from "@/components/shared/action-buttons";
import { OutputPreview } from "@/components/shared/output-preview";
import { ProcessLog } from "@/components/shared/process-log";
import ToolPageHeader from "@/components/shared/tool-page-header";

import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard, MotionGlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useAutoPreview } from "@/hooks/use-auto-preview";
import { type LoadedImage, useImageInput } from "@/hooks/use-image-input";
import {
  canvasEncode,
  createImage,
  formatBytes,
  type OutFormat,
  suggestName,
  triggerDownload,
} from "@/lib/canvas";
import { cn } from "@/lib/utils";

/* ----------------------------- Types ----------------------------- */

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
  gps?: { lat?: number; lon?: number };
  _raw?: Record<string, string | number>;
};

type Risk = "gps" | "date" | "camera";

/* ----------------------------- Page ----------------------------- */

export default function ExifRemovePage() {
  const [fmt, setFmt] = React.useState<OutFormat>("jpeg");
  const [quality, setQuality] = React.useState(90);
  const [fixOrientation, setFixOrientation] = React.useState(true);

  const [checkerboard, setCheckerboard] = React.useState(true);
  const [bg, setBg] = React.useState("#ffffff");
  const [hasAlpha, setHasAlpha] = React.useState<boolean | null>(null);

  const [running, setRunning] = React.useState(false);
  const [log, setLog] = React.useState("");

  // image load + EXIF parse + alpha detect
  const { img, setImg, getRootProps, getInputProps, isDragActive } = useImageInput({
    onImage: async (im) => {
      const arrayBuf = await im.file.arrayBuffer();
      const exif = parseExifSafe(arrayBuf, im.file.type);

      const alpha = await detectHasAlpha(im.url);
      setHasAlpha(alpha);

      const defFmt: OutFormat = im.file.type.includes("png")
        ? "png"
        : im.file.type.includes("webp")
          ? "webp"
          : "jpeg";
      setFmt(defFmt);

      setImg({ ...im, type: im.file.type, size: im.file.size, exif } as LoadedImage & {
        exif?: ExifData | null;
      });
      setLog(`Loaded ${im.file.name} (${formatBytes(im.file.size)})`);
    },
  });

  const risks = React.useMemo<Risk[]>(() => {
    const xs = (img as any)?.exif as ExifData | undefined;
    if (!xs) return [];
    const r: Risk[] = [];
    if (xs.gps?.lat !== undefined && xs.gps?.lon !== undefined) r.push("gps");
    if (xs.dateTimeOriginal) r.push("date");
    if (xs.make || xs.model) r.push("camera");
    return r;
  }, [img]);

  function resetAll() {
    setImg(null);
    setFmt("jpeg");
    setQuality(90);
    setFixOrientation(true);
    setCheckerboard(true);
    setBg("#ffffff");
    setHasAlpha(null);
    setRunning(false);
    setLog("");
  }

  // ----------------- Auto Preview (debounced) -----------------
  const { previewUrl, previewSize, previewBusy } = useAutoPreview(
    [img?.url, fmt, quality, fixOrientation, hasAlpha, bg],
    async () => {
      if (!img) return null;
      const canvas = await reencodeToCanvas({
        srcUrl: (img as any).url,
        format: fmt,
        orientation: fixOrientation ? (img as any).exif?.orientation : 1,
        background: fmt === "jpeg" && hasAlpha ? bg : undefined,
      });
      return await canvasEncode(canvas, fmt, quality);
    },
    250,
  );

  async function run() {
    if (!img) return;
    try {
      setRunning(true);
      setLog("Removing EXIF and re-encoding…");

      const canvas = await reencodeToCanvas({
        srcUrl: (img as any).url,
        format: fmt,
        orientation: fixOrientation ? (img as any).exif?.orientation : 1,
        background: fmt === "jpeg" && hasAlpha ? bg : undefined,
      });

      const blob = await canvasEncode(canvas, fmt, quality);
      const filename = suggestName((img as any).file.name.replace(/\.[^.]+$/, ""), "no-exif", fmt);
      triggerDownload(blob, filename);
      setLog(
        `Done → ${filename} (${formatBytes(blob.size)}). All EXIF/metadata stripped; orientation ${fixOrientation ? "fixed if needed" : "not adjusted"}.`,
      );
    } catch (e: any) {
      setLog(`Error: ${e?.message || String(e)}`);
    } finally {
      setRunning(false);
    }
  }

  return (
    <>
      <ToolPageHeader
        icon={Shield}
        title="EXIF Remove"
        description="Strip camera, GPS, date/time and other metadata — fully in your browser."
        actions={
          <>
            <ResetButton onClick={resetAll} />
            <ActionButton
              variant="default"
              label={running ? "Processing…" : "Remove & Download"}
              icon={running ? Loader2 : Shield}
              onClick={run}
              disabled={!img || running || previewBusy}
            />
          </>
        }
      />

      {/* Uploader + Meta */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Image</CardTitle>
          <CardDescription>Upload, drag & drop, or paste from clipboard.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-2">
          <ImageDropzone
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            isDragActive={isDragActive}
            subtitle="JPEG, PNG, WEBP, GIF, SVG (GIF/SVG rasterized)"
          />

          <div className="grid gap-4">
            <div className={cn("rounded-lg border p-2", previewCheckerBg(checkerboard))}>
              <ImagePreview
                url={(img as any)?.url}
                emptyNode={
                  <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
                    <ImageIcon className="mr-2 h-4 w-4" />
                    No image selected
                  </div>
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <InfoPill
                label="Source Size"
                value={img ? formatBytes((img as any).file.size) : "—"}
              />
              <InfoPill label="Source Type" value={img ? (img as any).file.type || "—" : "—"} />
              <InfoPill label="Width" value={img ? `${(img as any).width}px` : "—"} />
              <InfoPill label="Height" value={img ? `${(img as any).height}px` : "—"} />
            </div>

            {/* Privacy risks */}
            <div className="flex flex-wrap gap-2">
              <RiskBadge
                active={risks.includes("gps")}
                icon={<MapPin className="h-3.5 w-3.5" />}
                label="GPS"
              />
              <RiskBadge
                active={risks.includes("date")}
                icon={<Clock className="h-3.5 w-3.5" />}
                label="Date/Time"
              />
              <RiskBadge
                active={risks.includes("camera")}
                icon={<Camera className="h-3.5 w-3.5" />}
                label="Camera"
              />
            </div>
          </div>
        </CardContent>
      </GlassCard>

      <Separator className="my-4" />

      {/* Settings */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Settings</CardTitle>
          <CardDescription>
            Choose output format, quality, and orientation handling.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
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
              <p className="text-xs text-muted-foreground">
                Re-encoding strips EXIF/metadata by default.
              </p>
            </div>

            {/* JPEG + alpha background helper */}
            {fmt === "jpeg" && hasAlpha && (
              <div className="rounded-md border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Transparent areas detected</span>
                  <span className="text-xs text-muted-foreground">JPEG needs a background</span>
                </div>
                <div className="flex items-center gap-3">
                  <Label htmlFor="bg" className="flex items-center gap-2">
                    <Palette className="h-4 w-4" /> Background
                  </Label>
                  <Input
                    id="bg"
                    type="color"
                    className="h-9 w-16 p-1"
                    value={bg}
                    onChange={(e) => setBg(e.target.value)}
                  />
                  <Input
                    aria-label="Background hex"
                    value={bg}
                    onChange={(e) => setBg(e.target.value)}
                    className="w-32"
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {fmt !== "png" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="quality">Quality</Label>
                  <span className="text-xs text-muted-foreground">{quality}</span>
                </div>
                <Slider
                  id="quality"
                  min={1}
                  max={100}
                  step={1}
                  value={[quality]}
                  onValueChange={([q]) => setQuality(q)}
                />
                <p className="text-xs text-muted-foreground">
                  Higher = larger file size (lossy formats).
                </p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Switch
                id="fix-orient"
                checked={fixOrientation}
                onCheckedChange={setFixOrientation}
              />
              <Label htmlFor="fix-orient" className="flex items-center gap-2">
                <FileType2 className="h-4 w-4" /> Auto-fix orientation (use EXIF if present)
              </Label>
            </div>

            <div className="flex items-center gap-3">
              <Switch id="checker" checked={checkerboard} onCheckedChange={setCheckerboard} />
              <Label htmlFor="checker" className="flex items-center gap-2">
                {checkerboard ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                Checkerboard preview (transparency)
              </Label>
            </div>
          </div>
        </CardContent>
      </GlassCard>

      <Separator className="my-4" />

      {/* Metadata + Live Preview + Log */}
      <div className="grid gap-6 md:grid-cols-2">
        <GlassCard>
          <CardHeader>
            <CardTitle className="text-base">Detected Metadata</CardTitle>
            <CardDescription>
              Quick view of common EXIF fields (camera, date, GPS, etc.).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!(img as any)?.exif ? (
              <div className="rounded-lg border p-3 text-sm text-muted-foreground">
                <Info className="mr-2 inline-block h-4 w-4" />
                No EXIF data detected or unsupported format.
              </div>
            ) : (
              <div className="rounded-lg border p-3 text-sm">
                <MetaRow
                  icon={<Camera className="h-3.5 w-3.5" />}
                  label="Camera"
                  value={joinVals((img as any).exif.make, (img as any).exif.model)}
                />
                <MetaRow
                  icon={<Clock className="h-3.5 w-3.5" />}
                  label="Taken"
                  value={(img as any).exif.dateTimeOriginal}
                />
                <MetaRow
                  icon={<Info className="h-3.5 w-3.5" />}
                  label="Orientation"
                  value={orientName((img as any).exif.orientation)}
                />
                <MetaRow
                  icon={<Info className="h-3.5 w-3.5" />}
                  label="Exposure"
                  value={(img as any).exif.exposureTime}
                />
                <MetaRow
                  icon={<Info className="h-3.5 w-3.5" />}
                  label="Aperture"
                  value={(img as any).exif.fNumber}
                />
                <MetaRow
                  icon={<Info className="h-3.5 w-3.5" />}
                  label="ISO"
                  value={(img as any).exif.iso?.toString()}
                />
                <MetaRow
                  icon={<MapPin className="h-3.5 w-3.5" />}
                  label="GPS"
                  value={
                    (img as any).exif.gps?.lat !== undefined &&
                    (img as any).exif.gps?.lon !== undefined
                      ? `${(img as any).exif.gps.lat.toFixed(6)}, ${(img as any).exif.gps.lon.toFixed(6)}`
                      : undefined
                  }
                />
                {(img as any).exif._raw &&
                  Object.entries((img as any).exif._raw)
                    .slice(0, 8)
                    .map(([k, v]: any) => (
                      <MetaRow
                        key={k}
                        icon={<Info className="h-3.5 w-3.5" />}
                        label={k}
                        value={String(v)}
                      />
                    ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              This tool re-encodes fully in your browser; canvas export removes EXIF/metadata by
              default.
            </p>
          </CardContent>
        </GlassCard>

        <OutputPreview
          title="Output Preview & Info"
          description={previewBusy ? "Rendering preview…" : "Live preview (after strip)."}
          previewUrl={previewUrl}
          size={previewSize}
          formatLabel={fmt.toUpperCase()}
          checker={checkerboard}
          tips={
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>EXIF/metadata are completely removed during re-encode.</li>
              <li>Animated GIFs flatten to a single frame; SVGs are rasterized.</li>
            </ul>
          }
        />
      </div>

      <Separator className="my-4" />

      <ProcessLog value={log} onClear={() => setLog("")} />
    </>
  );
}

/* ----------------------------- UI bits ----------------------------- */

function MetaRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between border-b py-1.5 last:border-0">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-muted-foreground">{label}</span>
      </div>
      <span className="ml-4 truncate text-right font-medium">{value ?? "—"}</span>
    </div>
  );
}

function RiskBadge({
  active,
  icon,
  label,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs",
        active
          ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
          : "text-muted-foreground",
      )}
      title={active ? `${label} present in EXIF` : `${label} not found`}
    >
      {icon}
      {label}
      {active && (
        <span className="ml-1 rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px]">risk</span>
      )}
    </span>
  );
}

function previewCheckerBg(enabled: boolean) {
  return enabled
    ? "bg-[linear-gradient(45deg,#00000011_25%,transparent_25%),linear-gradient(-45deg,#00000011_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#00000011_75%),linear-gradient(-45deg,transparent_75%,#00000011_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px]"
    : "";
}

/* ---------------------- Core (canvas) ---------------------- */

async function reencodeToCanvas(opts: {
  srcUrl: string;
  format: OutFormat;
  orientation?: number;
  background?: string;
}): Promise<HTMLCanvasElement> {
  const { srcUrl, format, orientation = 1, background } = opts;
  const imgEl = await createImage(srcUrl);
  const { canvas, ctx } = createOrientedCanvas(imgEl, orientation);
  if (format === "jpeg" && background) {
    const c2 = document.createElement("canvas");
    c2.width = canvas.width;
    c2.height = canvas.height;
    const ctx2 = c2.getContext("2d")!;
    ctx2.fillStyle = background;
    ctx2.fillRect(0, 0, c2.width, c2.height);
    ctx2.drawImage(canvas, 0, 0);
    canvas.width = c2.width;
    canvas.height = c2.height;
    ctx.drawImage(c2, 0, 0);
  }

  return canvas;
}

function createOrientedCanvas(img: HTMLImageElement, orientation: number) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  const w = img.naturalWidth;
  const h = img.naturalHeight;

  canvas.width = w;
  canvas.height = h;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  switch (orientation) {
    case 2:
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
      break;
    case 3:
      ctx.translate(w, h);
      ctx.rotate(Math.PI);
      break;
    case 4:
      ctx.translate(0, h);
      ctx.scale(1, -1);
      break;
    case 5:
      canvas.width = h;
      canvas.height = w;
      ctx.rotate(0.5 * Math.PI);
      ctx.scale(1, -1);
      ctx.translate(0, -h);
      break;
    case 6:
      canvas.width = h;
      canvas.height = w;
      ctx.rotate(0.5 * Math.PI);
      ctx.translate(0, -h);
      break;
    case 7:
      canvas.width = h;
      canvas.height = w;
      ctx.rotate(-0.5 * Math.PI);
      ctx.scale(1, -1);
      ctx.translate(-w, 0);
      break;
    case 8:
      canvas.width = h;
      canvas.height = w;
      ctx.rotate(-0.5 * Math.PI);
      ctx.translate(-w, 0);
      break;
    default:
      break;
  }
  ctx.drawImage(img, 0, 0);
  return { canvas, ctx };
}

/* ---------------------- Helpers ---------------------- */

function joinVals(...vals: (string | undefined)[]) {
  return vals.filter(Boolean).join(" ") || undefined;
}
function orientName(o?: number) {
  const map: Record<number, string> = {
    1: "Normal",
    2: "Mirror horizontal",
    3: "Rotate 180°",
    4: "Mirror vertical",
    5: "Mirror + rotate 90° CW",
    6: "Rotate 90° CW",
    7: "Mirror + rotate 90° CCW",
    8: "Rotate 90° CCW",
  };
  return o ? `${map[o] || `Unknown (${o})`}` : undefined;
}

/** Best-effort alpha detection (fast): downscale to ~256px and scan alpha channel. */
async function detectHasAlpha(url: string): Promise<boolean> {
  const img = await createImage(url);
  const maxDim = 256;
  const ratio = Math.max(img.naturalWidth, img.naturalHeight) / maxDim;
  const w = ratio > 1 ? Math.round(img.naturalWidth / ratio) : img.naturalWidth;
  const h = ratio > 1 ? Math.round(img.naturalHeight / ratio) : img.naturalHeight;

  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;
  for (let i = 3; i < data.length; i += 4) if (data[i] !== 255) return true;
  return false;
}

/* ------------------- Minimal EXIF parser (JPEG/APP1) ------------------- */

function parseExifSafe(buf: ArrayBuffer, mime: string): ExifData | null {
  try {
    if (!/jpe?g/i.test(mime)) return null;
    return parseExifFromJpeg(buf);
  } catch {
    return null;
  }
}

function parseExifFromJpeg(buf: ArrayBuffer): ExifData | null {
  const dv = new DataView(buf);
  let offset = 0;
  if (dv.getUint16(0) !== 0xffd8) return null;
  offset += 2;

  while (offset < dv.byteLength) {
    const marker = dv.getUint16(offset);
    offset += 2;
    if ((marker & 0xff00) !== 0xff00) break;
    const size = dv.getUint16(offset);
    offset += 2;

    if (marker === 0xffe1) {
      if (
        dv.getUint8(offset) === 0x45 &&
        dv.getUint8(offset + 1) === 0x78 &&
        dv.getUint8(offset + 2) === 0x69 &&
        dv.getUint8(offset + 3) === 0x66 &&
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
  const byteOrder = dv.getUint16(tiffOffset);
  const little = byteOrder === 0x4949;
  if (!little && byteOrder !== 0x4d4d) return null;

  const get16 = (o: number) => dv.getUint16(o, little);
  const get32 = (o: number) => dv.getUint32(o, little);

  if (get16(tiffOffset + 2) !== 0x2a) return null;

  const ifd0Offset = get32(tiffOffset + 4) + tiffOffset;
  const data: ExifData = { _raw: {} };

  const { exifIFDOffset, gpsIFDOffset } = readIFD0(dv, tiffOffset, ifd0Offset, little, data);
  if (exifIFDOffset) readExifIFD(dv, tiffOffset, exifIFDOffset, little, data);
  if (gpsIFDOffset) readGPSIFD(dv, tiffOffset, gpsIFDOffset, little, data);

  return data;
}

function readIFD0(
  dv: DataView,
  tiffBase: number,
  ifdOffset: number,
  little: boolean,
  data: ExifData,
): { exifIFDOffset?: number; gpsIFDOffset?: number } {
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
      case 0x010f:
        data.make = String(value);
        break;
      case 0x0110:
        data.model = String(value);
        break;
      case 0x0131:
        data.software = String(value);
        break;
      case 0x0112:
        data.orientation = Number(value);
        break;
      case 0x8769:
        exifIFDOffset = (Array.isArray(value) ? value[0] : value) as number;
        break;
      case 0x8825:
        gpsIFDOffset = (Array.isArray(value) ? value[0] : value) as number;
        break;
      default:
        if (typeof value !== "object") data._raw![`IFD0 0x${tag.toString(16)}`] = value as any;
    }
  }
  return {
    exifIFDOffset: exifIFDOffset ? exifIFDOffset + tiffBase : undefined,
    gpsIFDOffset: gpsIFDOffset ? gpsIFDOffset + tiffBase : undefined,
  };
}

function readExifIFD(
  dv: DataView,
  tiffBase: number,
  ifdOffset: number,
  little: boolean,
  data: ExifData,
) {
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
      case 0x9003:
        data.dateTimeOriginal = String(value);
        break;
      case 0x829a:
        data.exposureTime = formatRational(value);
        break;
      case 0x829d:
        data.fNumber = `f/${formatRational(value)}`;
        break;
      case 0x8827:
        data.iso = Array.isArray(value) ? Number(value[0]) : Number(value);
        break;
      case 0x920a:
        data.focalLength = `${formatRational(value)}mm`;
        break;
      default:
        if (typeof value !== "object") data._raw![`EXIF 0x${tag.toString(16)}`] = value as any;
    }
  }
}

function readGPSIFD(
  dv: DataView,
  tiffBase: number,
  ifdOffset: number,
  little: boolean,
  data: ExifData,
) {
  const get16 = (o: number) => dv.getUint16(o, little);
  const get32 = (o: number) => dv.getUint32(o, little);

  const entries = get16(ifdOffset);
  let lat: number | undefined,
    lon: number | undefined,
    latRef: string | undefined,
    lonRef: string | undefined;

  for (let i = 0; i < entries; i++) {
    const e = ifdOffset + 2 + i * 12;
    const tag = get16(e);
    const type = get16(e + 2);
    const count = get32(e + 4);
    const valueOffset = e + 8;
    const value = getTagValue(dv, tiffBase, type, count, valueOffset, little);

    switch (tag) {
      case 0x0001:
        latRef = String(value);
        break;
      case 0x0002:
        lat = rationalToDeg(value);
        break;
      case 0x0003:
        lonRef = String(value);
        break;
      case 0x0004:
        lon = rationalToDeg(value);
        break;
      default:
        if (typeof value !== "object") data._raw![`GPS 0x${tag.toString(16)}`] = value as any;
    }
  }
  if (lat !== undefined && lon !== undefined) {
    if (latRef === "S") lat = -lat;
    if (lonRef === "W") lon = -lon;
    data.gps = { lat, lon };
  }
}

/* ----- TIFF value helpers ----- */
function getTagValue(
  dv: DataView,
  tiffBase: number,
  type: number,
  count: number,
  valueOffset: number,
  little: boolean,
): any {
  const get16 = (o: number) => dv.getUint16(o, little);
  const get32 = (o: number) => dv.getUint32(o, little);
  const typeSizes: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 };
  const valueBytes = typeSizes[type] * count;
  const valuePtr = valueBytes > 4 ? get32(valueOffset) + tiffBase : valueOffset;

  switch (type) {
    case 2: {
      let s = "";
      for (let i = 0; i < count; i++) {
        const c = dv.getUint8(valuePtr + i);
        if (c === 0) break;
        s += String.fromCharCode(c);
      }
      return s.trim();
    }
    case 3: {
      if (count === 1) return get16(valuePtr);
      const arr: number[] = [];
      for (let i = 0; i < count; i++) arr.push(get16(valuePtr + i * 2));
      return arr;
    }
    case 4: {
      if (count === 1) return get32(valuePtr);
      const arr: number[] = [];
      for (let i = 0; i < count; i++) arr.push(get32(valuePtr + i * 4));
      return arr;
    }
    case 5: {
      if (count === 1) return [dv.getUint32(valuePtr, little), dv.getUint32(valuePtr + 4, little)];
      const arr: [number, number][] = [];
      for (let i = 0; i < count; i++) {
        const off = valuePtr + i * 8;
        arr.push([dv.getUint32(off, little), dv.getUint32(off + 4, little)]);
      }
      return arr;
    }
    case 10: {
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
      if (count === 1) return dv.getUint8(valuePtr);
      const arr: number[] = [];
      for (let i = 0; i < count; i++) arr.push(dv.getUint8(valuePtr + i));
      return arr;
    }
    case 9: {
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
  if (Array.isArray(v) && v.length === 2 && typeof v[0] === "number" && typeof v[1] === "number") {
    if (v[1] === 0) return `${v[0]}/0`;
    const dec = v[0] / v[1];
    if (dec < 1) return `1/${Math.round(1 / dec)}`;
    return dec.toFixed(3).replace(/\.?0+$/, "");
  }
  if (Array.isArray(v) && Array.isArray(v[0])) return formatRational(v[0]);
  return String(v);
}

function rationalToDeg(v: any): number | undefined {
  if (!Array.isArray(v)) return undefined;
  const toNum = (r: [number, number]) => (r[1] ? r[0] / r[1] : 0);
  const [d, m, s] = v;
  return toNum(d) + toNum(m) / 60 + toNum(s) / 3600;
}
