"use client";
import {
  ActivitySquare,
  CloudDownload,
  Crop,
  Eye,
  EyeOff,
  Focus,
  Image as ImageIcon,
  Link2,
  Loader2,
  Maximize2,
  Palette,
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
import { Switch } from "@/components/ui/switch";
import { useImageInput } from "@/hooks/use-image-input";
import {
  type FitMode,
  formatBytes,
  type OutFormat,
  suggestName,
  triggerDownload,
} from "@/lib/canvas";

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

export default function ImageResizePage() {
  const [locked, setLocked] = React.useState(true);
  const [fit, setFit] = React.useState<FitMode>("contain");
  const [anchor, setAnchor] = React.useState<Anchor>("center"); // NEW
  const [fmt, setFmt] = React.useState<OutFormat>("webp");
  const [bg, setBg] = React.useState("#ffffff");
  const [quality, setQuality] = React.useState(90);
  const [scale, setScale] = React.useState<number | "">("");
  const [w, setW] = React.useState<number | "">("");
  const [h, setH] = React.useState<number | "">("");
  const [running, setRunning] = React.useState(false);
  const [log, setLog] = React.useState("");

  // NEW: preview + alpha + checker + smoothing + noUpscale
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [previewSize, setPreviewSize] = React.useState<number | null>(null);
  const [hasAlpha, setHasAlpha] = React.useState<boolean | null>(null);
  const [checker, setChecker] = React.useState(true);
  const [noUpscale, setNoUpscale] = React.useState(true);
  const [smoothQ, setSmoothQ] = React.useState<CanvasImageSmoothingQuality>("high");

  const { img, getRootProps, getInputProps, isDragActive, setImg } = useImageInput({
    onImage: async (im) => {
      setW(im.width);
      setH(im.height);
      setScale("");
      setLog("");
      setHasAlpha(await detectHasAlpha(im.url));
      setFmt(
        im.file.type.includes("png") ? "png" : im.file.type.includes("webp") ? "webp" : "webp",
      );
      clearPreview();
    },
  });

  const ratio = React.useMemo(() => (!img ? 1 : img.width / img.height), [img]);

  React.useEffect(() => {
    if (!img) return;
    if (locked && typeof w === "number" && document.activeElement?.id === "width")
      setH(Math.max(1, Math.round(w / ratio)));
    if (locked && typeof h === "number" && document.activeElement?.id === "height")
      setW(Math.max(1, Math.round(h * ratio)));
  }, [w, h, ratio, locked, img]);

  React.useEffect(() => {
    if (!img) return;
    if (scale === "" || Number.isNaN(Number(scale))) return;
    const s = Math.max(1, Number(scale));
    const targetW = Math.max(1, Math.round((img.width * s) / 100));
    const targetH = Math.max(1, Math.round((img.height * s) / 100));
    setW(noUpscale ? Math.min(targetW, img.width) : targetW);
    setH(noUpscale ? Math.min(targetH, img.height) : targetH);
  }, [scale, img, noUpscale]);

  function resetAll() {
    setImg(null);
    setLocked(true);
    setFit("contain");
    setAnchor("center");
    setFmt("webp");
    setBg("#ffffff");
    setQuality(90);
    setScale("");
    setW("");
    setH("");
    setRunning(false);
    setLog("");
    clearPreview();
    setHasAlpha(null);
    setChecker(true);
    setNoUpscale(true);
    setSmoothQ("high");
  }

  function clearPreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewSize(null);
  }

  const numOrEmpty = (v: string): number | "" => {
    const n = Number(v);
    return Number.isNaN(n) ? "" : n;
  };

  // ---- Core draw with anchor (cover) + contain + background + smoothing ----
  async function drawAndEncode(opts: {
    srcUrl: string;
    srcW: number;
    srcH: number;
    outW: number;
    outH: number;
    fit: FitMode;
    anchor: Anchor;
    format: OutFormat;
    quality: number;
    background?: string;
    smoothing: CanvasImageSmoothingQuality;
  }): Promise<{ blob: Blob }> {
    const { srcUrl, srcW, srcH, outW, outH, fit, anchor, format, quality, background, smoothing } =
      opts;
    const imgEl = await createImageElement(srcUrl);

    const targetW = Math.max(1, Math.round(outW));
    const targetH = Math.max(1, Math.round(outH));
    const srcAspect = srcW / srcH;
    const dstAspect = targetW / targetH;

    // Compute draw rects
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
      // cover with anchor crop
      const scale = Math.max(targetW / srcW, targetH / srcH);
      const needW = Math.round(targetW / scale);
      const needH = Math.round(targetH / scale);

      // anchor offsets
      const ax = anchor.includes("left") ? 0 : anchor.includes("right") ? 1 : 0.5;
      const ay = anchor.includes("top") ? 0 : anchor.includes("bottom") ? 1 : 0.5;

      sx = Math.round((srcW - needW) * ax);
      sy = Math.round((srcH - needH) * ay);

      // clamp inside
      sx = Math.max(0, Math.min(sx, srcW - needW));
      sy = Math.max(0, Math.min(sy, srcH - needH));

      sw = needW;
      sh = needH;
      // dest covers fully
      dx = 0;
      dy = 0;
      dw = targetW;
      dh = targetH;
    }

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = smoothing;

    if (format === "jpeg" && background) {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, targetW, targetH);
    } else {
      ctx.clearRect(0, 0, targetW, targetH);
    }

    ctx.drawImage(imgEl, sx, sy, sw, sh, dx, dy, dw, dh);

    const mime = format === "png" ? "image/png" : format === "jpeg" ? "image/jpeg" : "image/webp";
    const q = Math.min(1, Math.max(0.01, quality / 100));
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Failed to encode image"))), mime, q);
    });
    return { blob };
  }

  async function preview() {
    if (!img) return;
    try {
      setRunning(true);
      setLog("Generating preview…");
      const outW = typeof w === "number" ? w : img.width;
      const outH = typeof h === "number" ? h : img.height;
      const cappedW = noUpscale ? Math.min(outW, img.width) : outW;
      const cappedH = noUpscale ? Math.min(outH, img.height) : outH;

      const res = await drawAndEncode({
        srcUrl: img.url,
        srcW: img.width,
        srcH: img.height,
        outW: cappedW,
        outH: cappedH,
        fit,
        anchor,
        format: fmt,
        quality,
        background: fmt === "jpeg" && hasAlpha ? bg : undefined,
        smoothing: smoothQ,
      });
      clearPreview();
      const url = URL.createObjectURL(res.blob);
      setPreviewUrl(url);
      setPreviewSize(res.blob.size);
      setLog((s) => (s ? `${s}\n` : "") + "Preview ready.");
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
      setLog("Processing…");
      const outW = typeof w === "number" ? w : img.width;
      const outH = typeof h === "number" ? h : img.height;
      const cappedW = noUpscale ? Math.min(outW, img.width) : outW;
      const cappedH = noUpscale ? Math.min(outH, img.height) : outH;

      const result = await drawAndEncode({
        srcUrl: img.url,
        srcW: img.width,
        srcH: img.height,
        outW: cappedW,
        outH: cappedH,
        fit,
        anchor,
        format: fmt,
        quality,
        background: fmt === "jpeg" && hasAlpha ? bg : undefined,
        smoothing: smoothQ,
      });

      const filename = suggestName(img.file.name, "resized", fmt);
      triggerDownload(result.blob, filename);
      setLog(`Done → ${filename} (${formatBytes(result.blob.size)})`);

      // keep preview in panel
      clearPreview();
      const url = URL.createObjectURL(result.blob);
      setPreviewUrl(url);
      setPreviewSize(result.blob.size);
    } catch (e: any) {
      setLog(`Error: ${e?.message || String(e)}`);
    } finally {
      setRunning(false);
    }
  }

  return (
    <>
      <ToolPageHeader
        icon={Maximize2}
        title="Image Resizer"
        description="Resize, convert, and optimize images. Drag & drop, paste (Ctrl/Cmd+V), or upload."
        actions={
          <>
            <Button
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted"
              onClick={preview}
              disabled={!img || running}
            >
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
              {running ? "Processing…" : "Preview"}
            </Button>
            <ResetButton onClick={resetAll} />
            <ActionButton
              variant="default"
              label={running ? "Processing…" : "Resize & Download"}
              icon={running ? Loader2 : CloudDownload}
              onClick={run}
              disabled={!img || running}
            />
          </>
        }
      />

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
            subtitle="PNG, JPEG, WEBP, GIF, SVG (rasterized)"
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
              <InfoPill label="Source Size" value={img ? formatBytes(img.file.size) : "—"} />
              <InfoPill label="Source Type" value={img ? img.file.type || "—" : "—"} />
              <InfoPill label="Width" value={img ? `${img.width}px` : "—"} />
              <InfoPill label="Height" value={img ? `${img.height}px` : "—"} />
            </div>

            {/* Quick scale presets */}
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded border px-2.5 py-1 text-xs hover:bg-muted"
                onClick={() => setScale(50)}
              >
                50%
              </button>
              <button
                className="rounded border px-2.5 py-1 text-xs hover:bg-muted"
                onClick={() => setScale(75)}
              >
                75%
              </button>
              <button
                className="rounded border px-2.5 py-1 text-xs hover:bg-muted"
                onClick={() => setScale(200)}
              >
                200%
              </button>
              <button
                className="rounded border px-2.5 py-1 text-xs hover:bg-muted"
                onClick={() => {
                  setW(img?.width ?? "");
                  setH(img?.height ?? "");
                  setScale("");
                }}
              >
                Reset size
              </button>
            </div>
          </div>
        </CardContent>
      </GlassCard>

      <Separator className="my-4" />

      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Settings</CardTitle>
          <CardDescription>Customize size, fit, focus, format, quality.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="width">Width (px)</Label>
                <Input
                  id="width"
                  type="number"
                  min={1}
                  value={w}
                  onChange={(e) => setW(numOrEmpty(e.target.value))}
                  disabled={!img}
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
                  disabled={!img}
                />
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
                <Input
                  id="scale"
                  type="number"
                  min={1}
                  placeholder="e.g. 50 for half"
                  className="w-36"
                  value={scale}
                  onChange={(e) => setScale(numOrEmpty(e.target.value))}
                  disabled={!img}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch checked={noUpscale} onCheckedChange={setNoUpscale} id="no-upscale" />
                <Label htmlFor="no-upscale" className="text-sm">
                  No upscale
                </Label>
              </div>

              <div className="flex items-center gap-2">
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
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Fit</Label>
                <Select value={fit} onValueChange={(v: FitMode) => setFit(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contain">Contain</SelectItem>
                    <SelectItem value="cover">Cover</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Contain keeps all content; Cover fills the box.
                </p>
              </div>

              {/* Focus anchor (cover only) */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Focus className="h-4 w-4" /> Focus (cover)
                </Label>
                <Select
                  value={anchor}
                  onValueChange={(v: Anchor) => setAnchor(v)}
                  disabled={fit !== "cover"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Center" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top-left">Top left</SelectItem>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="top-right">Top right</SelectItem>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                    <SelectItem value="bottom-left">Bottom left</SelectItem>
                    <SelectItem value="bottom">Bottom</SelectItem>
                    <SelectItem value="bottom-right">Bottom right</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Crop bias when filling frame.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
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
                <p className="text-xs text-muted-foreground">WEBP balances size and quality.</p>
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
                </div>
              )}
            </div>

            {/* JPEG bg only if transparency detected */}
            {fmt === "jpeg" && hasAlpha && (
              <div className="flex items-center gap-3">
                <Label htmlFor="bg" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" /> Background (for transparency)
                </Label>
                <Input
                  id="bg"
                  type="color"
                  className="h-9 w-16 p-1"
                  value={bg}
                  onChange={(e) => setBg(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Smoothing quality</Label>
              <Select
                value={smoothQ}
                onValueChange={(v: CanvasImageSmoothingQuality) => setSmoothQ(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="high" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">low</SelectItem>
                  <SelectItem value="medium">medium</SelectItem>
                  <SelectItem value="high">high</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </GlassCard>

      <Separator className="my-4" />

      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Output Preview & Log</CardTitle>
          <CardDescription>Estimated output depends on content &amp; quality.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <div className="rounded-lg border p-3">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Crop className="h-4 w-4" /> Target Dimensions
                </span>
                <span className="font-medium">
                  {typeof w === "number" && typeof h === "number"
                    ? `${noUpscale && img ? Math.min(w, img.width) : w} × ${noUpscale && img ? Math.min(h, img.height) : h}px`
                    : "—"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ActivitySquare className="h-3.5 w-3.5" /> Fit:
                  <span className="ml-1 font-medium text-foreground">{fit}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-3.5 w-3.5" /> Format:
                  <span className="ml-1 font-medium text-foreground">{fmt.toUpperCase()}</span>
                </div>
              </div>

              <div className="mt-3">
                <div className="mb-1 text-xs text-muted-foreground">Preview (after resize)</div>
                {!previewUrl ? (
                  <div className="text-xs text-muted-foreground">
                    Click <b>Preview</b> to see output without downloading.
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
              </div>

              <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                <li>Canvas export removes EXIF/metadata.</li>
                <li>GIFs flatten to a single frame; SVG rasterized.</li>
              </ul>
            </div>
          </div>

          <ProcessLog value={log} onClear={() => setLog("")} />
        </CardContent>
      </GlassCard>
    </>
  );
}

/* ---------------- Helpers ---------------- */

function createImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/** Fast alpha check: downscale & scan alpha channel */
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
