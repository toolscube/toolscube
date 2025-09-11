"use client";
import {
  ActivitySquare,
  Check,
  CloudDownload,
  Copy,
  Crop,
  Eye,
  EyeOff,
  FileType2,
  Image as ImageIcon,
  Link2,
  Loader2,
  Palette,
  SlidersHorizontal,
} from "lucide-react";
import * as React from "react";
import { ImageDropzone } from "@/components/image/image-dropzone";
import { ImagePreview, InfoPill } from "@/components/image/image-preview-meta";
import { ActionButton, ResetButton } from "@/components/shared/action-buttons";
import { ProcessLog } from "@/components/shared/process-log";
import ToolPageHeader from "@/components/shared/tool-page-header";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
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
import { useImageInput } from "@/hooks/use-image-input";
import {
  convertImage,
  type FitMode, // ✅ NEW
  formatBytes,
  type OutFormat,
  resizeImage, // ✅ NEW
  suggestName,
  triggerDownload,
} from "@/lib/canvas";

export default function ImageConvertPage() {
  const [fmt, setFmt] = React.useState<OutFormat>("webp");
  const [quality, setQuality] = React.useState(90);
  const [bg, setBg] = React.useState("#ffffff");
  const [running, setRunning] = React.useState(false);
  const [log, setLog] = React.useState("");

  // ✅ NEW: preview state
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [previewSize, setPreviewSize] = React.useState<number | null>(null);

  // ✅ NEW: transparency checkerboard + auto detect
  const [checker, setChecker] = React.useState(true);
  const [hasAlpha, setHasAlpha] = React.useState<boolean | null>(null);

  // ✅ NEW: optional resize controls
  const [enableResize, setEnableResize] = React.useState(false);
  const [locked, setLocked] = React.useState(true);
  const [fit, setFit] = React.useState<FitMode>("contain");
  const [w, setW] = React.useState<number | "">("");
  const [h, setH] = React.useState<number | "">("");

  // ✅ NEW: optional simple filters
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [bright, setBright] = React.useState(100);
  const [contrast, setContrast] = React.useState(100);
  const [saturate, setSaturate] = React.useState(100);

  const { img, getRootProps, getInputProps, isDragActive, setImg } = useImageInput({
    onImage: async (im) => {
      // reset states
      clearPreview();
      setHasAlpha(await detectHasAlpha(im.url));
      // default format suggestion: if PNG/WebP keep, else WEBP
      const defFmt: OutFormat = im.file.type.includes("png")
        ? "png"
        : im.file.type.includes("webp")
          ? "webp"
          : "webp";
      setFmt(defFmt);
      setW(im.width);
      setH(im.height);
      setEnableResize(false);
    },
  });

  React.useEffect(() => {
    if (!img) return;
    if (locked && typeof w === "number" && document.activeElement?.id === "width") {
      const r = img.width / img.height;
      setH(Math.max(1, Math.round(w / r)));
    }
    if (locked && typeof h === "number" && document.activeElement?.id === "height") {
      const r = img.width / img.height;
      setW(Math.max(1, Math.round(h * r)));
    }
  }, [w, h, locked, img]);

  function numOrEmpty(v: string): number | "" {
    const n = Number(v);
    return Number.isNaN(n) ? "" : n;
  }

  function resetAll() {
    setImg(null);
    clearPreview();
    setFmt("webp");
    setQuality(90);
    setBg("#ffffff");
    setRunning(false);
    setLog("");
    setChecker(true);
    setHasAlpha(null);
    setEnableResize(false);
    setLocked(true);
    setFit("contain");
    setW("");
    setH("");
    setFiltersOpen(false);
    setBright(100);
    setContrast(100);
    setSaturate(100);
  }

  function clearPreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewSize(null);
  }

  // ✅ NEW: build-time filter string
  const filterCss = React.useMemo(
    () => `brightness(${bright}%) contrast(${contrast}%) saturate(${saturate}%)`,
    [bright, contrast, saturate],
  );

  async function runCommon(generateOnly = false) {
    if (!img) return null;

    setLog(generateOnly ? "Generating preview…" : "Converting…");

    // If resize enabled, use resizeImage with fit; otherwise convertImage (1:1)
    const baseOpts = {
      format: fmt,
      quality,
      background: fmt === "jpeg" && hasAlpha ? bg : undefined,
    } as const;

    // We support filters via 2-pass draw: draw to canvas with ctx.filter, then encode.
    // For both convert/resize, we funnel through a helper that respects filters.
    const out = await encodeWithFilters({
      srcUrl: img.url,
      srcW: img.width,
      srcH: img.height,
      outW: enableResize && typeof w === "number" ? w : img.width,
      outH: enableResize && typeof h === "number" ? h : img.height,
      fit: enableResize ? fit : "contain",
      ...baseOpts,
      filterCss,
      useResize: enableResize,
    });

    if (generateOnly) return out;

    const filename = suggestName(img.file.name, enableResize ? "resized" : "converted", fmt);
    triggerDownload(out.blob, filename);
    setLog(`Done → ${filename} (${formatBytes(out.blob.size)})`);
    return out;
  }

  async function preview() {
    if (!img) return;
    try {
      setRunning(true);
      const res = await runCommon(true);
      if (!res) return;
      clearPreview();
      const url = URL.createObjectURL(res.blob);
      setPreviewUrl(url);
      setPreviewSize(res.blob.size);
      setLog((s) => (s ? `${s}\n` : "") + "Preview generated.");
    } catch (e: any) {
      setLog(`Error: ${e?.message || String(e)}`);
    } finally {
      setRunning(false);
    }
  }

  async function run() {
    if (!img) return;
    try {
      setRunning(true);
      const res = await runCommon(false);
      if (res) {
        clearPreview();
        const url = URL.createObjectURL(res.blob);
        setPreviewUrl(url);
        setPreviewSize(res.blob.size);
      }
    } catch (e: any) {
      setLog(`Error: ${e?.message || String(e)}`);
    } finally {
      setRunning(false);
    }
  }

  return (
    <>
      <ToolPageHeader
        icon={FileType2}
        title="Image Converter"
        description="Convert images between PNG, JPEG, WEBP."
        actions={
          <>
            <Button
              variant="outline"
              onClick={preview}
              disabled={!img || running}
              className="gap-2"
            >
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
              {running ? "Processing…" : "Preview"}
            </Button>
            <ResetButton onClick={resetAll} />
            <ActionButton
              variant="default"
              label={running ? "Processing…" : "Convert & Download"}
              icon={running ? Loader2 : CloudDownload}
              onClick={run}
              disabled={!img || running}
            />
          </>
        }
      />

      {/* Uploader / Preview */}
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
            subtitle="PNG, JPEG, WEBP, GIF, SVG (SVG/GIF rasterized)"
          />

          <div className="grid gap-4">
            <div
              className={
                checker
                  ? "rounded-lg border p-2 bg-[linear-gradient(45deg,#00000011_25%,transparent_25%),linear-gradient(-45deg,#00000011_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#00000011_75%),linear-gradient(-45deg,transparent_75%,#00000011_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px]"
                  : "rounded-lg border p-2"
              }
            >
              <ImagePreview
                url={img?.url}
                emptyNode={
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    <ImageIcon className="mr-2 h-4 w-4" /> No image selected
                  </div>
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <InfoPill
                label="Source Size"
                value={img ? formatBytes(img.size ?? img.file.size) : "—"}
              />
              <InfoPill label="Source Type" value={img ? img.type || img.file.type || "—" : "—"} />
              <InfoPill label="Width" value={img ? `${img.width}px` : "—"} />
              <InfoPill label="Height" value={img ? `${img.height}px` : "—"} />
            </div>

            {/* ✅ NEW: quick presets */}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setFmt("webp");
                  setQuality(70);
                }}
              >
                Small web (WEBP 70)
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setFmt("webp");
                  setQuality(85);
                }}
              >
                Balanced (WEBP 85)
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setFmt("jpeg");
                  setQuality(92);
                }}
              >
                High quality (JPEG 92)
              </Button>
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
            Choose output format, quality, and optional resize/filters.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          {/* Format + Quality + Transparency */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Format</Label>
              <Select value={fmt} onValueChange={(v: OutFormat) => setFmt(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="webp">WEBP (recommended)</SelectItem>
                  <SelectItem value="jpeg">JPEG</SelectItem>
                  <SelectItem value="png">PNG</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                WEBP is usually the smallest. PNG is best for UI/graphics.
              </p>
            </div>

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
                <p className="text-xs text-muted-foreground">Higher = larger file size.</p>
              </div>
            )}

            {/* JPEG background only if transparency present */}
            {fmt === "jpeg" && hasAlpha && (
              <div className="space-y-2">
                <Label htmlFor="bg" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" /> Background (transparency will be filled)
                </Label>
                <div className="flex items-center gap-3">
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
                    className="w-36"
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            )}

            {/* Checkerboard toggle */}
            <div className="flex items-center gap-2 text-sm">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setChecker((v) => !v)}
                className="gap-2"
              >
                {checker ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {checker ? "Hide" : "Show"} checkerboard
              </Button>
            </div>
          </div>

          {/* ✅ NEW: Resize + Filters */}
          <div className="space-y-4">
            <div className="rounded-lg border p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Crop className="h-4 w-4" /> Resize while converting
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant={enableResize ? "default" : "outline"}
                  onClick={() => setEnableResize((v) => !v)}
                >
                  {enableResize ? "Enabled" : "Disabled"}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="width">Width (px)</Label>
                  <Input
                    id="width"
                    type="number"
                    min={1}
                    value={w}
                    onChange={(e) => setW(numOrEmpty(e.target.value))}
                    disabled={!img || !enableResize}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (px)</Label>
                  <Input
                    id="height"
                    type="number"
                    min={1}
                    value={h}
                    onChange={(e) => setH(numOrEmpty(e.target.value))}
                    disabled={!img || !enableResize}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={locked ? "default" : "outline"}
                    onClick={() => setLocked((v) => !v)}
                    className="gap-2"
                  >
                    <Link2 className="h-4 w-4" />
                    {locked ? "Locked" : "Unlocked"}
                  </Button>
                </div>

                <div className="w-44">
                  <Label className="text-sm">Fit</Label>
                  <Select
                    value={fit}
                    onValueChange={(v: FitMode) => setFit(v)}
                    disabled={!enableResize}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select fit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contain">Contain (no crop)</SelectItem>
                      <SelectItem value="cover">Cover (may crop)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ActivitySquare className="h-3.5 w-3.5" />
                  Fit: <span className="ml-1 font-medium text-foreground">{fit}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-3.5 w-3.5" />
                  Format:{" "}
                  <span className="ml-1 font-medium text-foreground">{fmt.toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="rounded-lg border p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <SlidersHorizontal className="h-4 w-4" /> Filters (optional)
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant={filtersOpen ? "default" : "outline"}
                  onClick={() => setFiltersOpen((v) => !v)}
                >
                  {filtersOpen ? "On" : "Off"}
                </Button>
              </div>

              {filtersOpen && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label>Brightness</Label>
                      <span className="text-xs text-muted-foreground">{bright}%</span>
                    </div>
                    <Slider
                      min={50}
                      max={150}
                      step={1}
                      value={[bright]}
                      onValueChange={([v]) => setBright(v)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label>Contrast</Label>
                      <span className="text-xs text-muted-foreground">{contrast}%</span>
                    </div>
                    <Slider
                      min={50}
                      max={150}
                      step={1}
                      value={[contrast]}
                      onValueChange={([v]) => setContrast(v)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label>Saturation</Label>
                      <span className="text-xs text-muted-foreground">{saturate}%</span>
                    </div>
                    <Slider
                      min={50}
                      max={150}
                      step={1}
                      value={[saturate]}
                      onValueChange={([v]) => setSaturate(v)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </GlassCard>

      <Separator className="my-4" />

      {/* Output & Log */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Output & Log</CardTitle>
          <CardDescription>Preview ও Convert দুটোই এখান থেকে কন্ট্রোল করো।</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border p-3">
            <div className="mb-2 text-sm font-medium">Preview (after conversion)</div>
            {!previewUrl ? (
              <div className="text-xs text-muted-foreground">
                Click <b>Preview</b> to see the processed output without downloading.
              </div>
            ) : (
              <>
                <div className="relative h-44 w-full overflow-hidden rounded bg-muted/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="after" className="h-full w-full object-contain" />
                </div>
                <div className="mt-2 grid grid-cols-2 gap-3 text-xs">
                  <InfoPill label="Output Size" value={formatBytes(previewSize ?? 0)} />
                  <InfoPill label="Format" value={fmt.toUpperCase()} />
                </div>
              </>
            )}

            <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
              <li>Canvas conversion strips EXIF/metadata by default.</li>
              <li>Animated GIFs flatten to a single frame.</li>
              <li>SVGs render to bitmap before converting.</li>
            </ul>
          </div>

          <ProcessLog value={log} onClear={() => setLog("")} />
        </CardContent>
      </GlassCard>
    </>
  );
}

/* ---------------- Helpers ---------------- */

async function encodeWithFilters(opts: {
  srcUrl: string;
  srcW: number;
  srcH: number;
  outW: number;
  outH: number;
  fit: FitMode;
  format: OutFormat;
  quality: number;
  background?: string;
  filterCss: string;
  useResize: boolean;
}): Promise<{ blob: Blob }> {
  const { srcUrl, srcW, srcH, outW, outH, fit, format, quality, background, filterCss, useResize } =
    opts;

  // Draw into a canvas with CSS filters applied, then encode.
  const img = await createImageElement(srcUrl);

  // compute target rect (same logic as resizeImage)
  const targetW = Math.max(1, Math.round(outW));
  const targetH = Math.max(1, Math.round(outH));
  const srcAspect = srcW / srcH;
  const dstAspect = targetW / targetH;

  let drawW = targetW;
  let drawH = targetH;

  if (useResize && fit === "contain") {
    if (srcAspect > dstAspect) {
      drawW = targetW;
      drawH = Math.round(targetW / srcAspect);
    } else {
      drawH = targetH;
      drawW = Math.round(targetH * srcAspect);
    }
  } else if (useResize && fit === "cover") {
    if (srcAspect > dstAspect) {
      drawH = targetH;
      drawW = Math.round(targetH * srcAspect);
    } else {
      drawW = targetW;
      drawH = Math.round(targetW / srcAspect);
    }
  } else {
    // no resize: keep native
    drawW = targetW;
    drawH = targetH;
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  (ctx as any).filter = filterCss;

  if (format === "jpeg" && background) {
    // apply filters

    ctx.fillStyle = background || "#ffffff";
    ctx.fillRect(0, 0, targetW, targetH);
  } else {
    ctx.clearRect(0, 0, targetW, targetH);
  }

  if (useResize && fit === "contain") {
    const dx = Math.round((targetW - drawW) / 2);
    const dy = Math.round((targetH - drawH) / 2);
    ctx.drawImage(img, 0, 0, srcW, srcH, dx, dy, drawW, drawH);
  } else if (useResize && fit === "cover") {
    const scale = Math.max(targetW / srcW, targetH / srcH);
    const sw = Math.round(targetW / scale);
    const sh = Math.round(targetH / scale);
    const sx = Math.round((srcW - sw) / 2);
    const sy = Math.round((srcH - sh) / 2);
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
  } else {
    // direct convert
    ctx.drawImage(img, 0, 0, targetW, targetH);
  }

  const mime = format === "png" ? "image/png" : format === "jpeg" ? "image/jpeg" : "image/webp";
  const q = Math.min(1, Math.max(0.01, quality / 100));
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Failed to encode image"))), mime, q);
  });
  return { blob };
}

function createImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/** Fast alpha check: downscale & scan A channel */
async function detectHasAlpha(url: string): Promise<boolean> {
  const img = await createImageElement(url);
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
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] !== 255) return true;
  }
  return false;
}
