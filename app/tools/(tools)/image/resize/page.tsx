"use client";

import {
  CloudDownload,
  Eye,
  EyeOff,
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
import InputField from "@/components/shared/form-fields/input-field";
import SelectField from "@/components/shared/form-fields/select-field";
import SwitchRow from "@/components/shared/form-fields/switch-row";
import { OutputPreview } from "@/components/shared/output-preview";
import { ProcessLog } from "@/components/shared/process-log";
import ToolPageHeader from "@/components/shared/tool-page-header";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { useAutoPreview } from "@/hooks/use-auto-preview";
import { useImageInput } from "@/hooks/use-image-input";
import {
  canvasEncode,
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
  const [anchor, setAnchor] = React.useState<Anchor>("center");

  const [fmt, setFmt] = React.useState<OutFormat>("webp");
  const [bg, setBg] = React.useState("#ffffff");
  const [quality, setQuality] = React.useState(90);

  const [scale, setScale] = React.useState<number | "">("");
  const [w, setW] = React.useState<number | "">("");
  const [h, setH] = React.useState<number | "">("");

  const [checker, setChecker] = React.useState(true);
  const [noUpscale, setNoUpscale] = React.useState(true);
  const [smoothQ, setSmoothQ] = React.useState<ImageSmoothingQuality>("high");

  const [hasAlpha, setHasAlpha] = React.useState<boolean | null>(null);

  const [running, setRunning] = React.useState(false);
  const [log, setLog] = React.useState("");

  const { img, getRootProps, getInputProps, isDragActive, setImg } = useImageInput({
    onImage: async (im) => {
      setW(im.width);
      setH(im.height);
      setScale("");
      setLog(`Loaded ${im.file.name} (${formatBytes(im.size ?? im.file.size)})`);
      setHasAlpha(await detectHasAlpha(im.url));
      setFmt(im.file.type.includes("png") ? "png" : im.file.type.includes("webp") ? "webp" : "webp");
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
    setHasAlpha(null);
    setChecker(true);
    setNoUpscale(true);
    setSmoothQ("high");
    setRunning(false);
    setLog("");
  }

  const numOrEmpty = (v: string): number | "" => {
    const n = Number(v);
    return Number.isNaN(n) ? "" : n;
  };

  // Auto Preview
  const { previewUrl, previewSize, previewBusy } = useAutoPreview(
    [img?.url, fit, anchor, fmt, quality, bg, w, h, noUpscale, smoothQ],
    async () => {
      if (!img || typeof w !== "number" || typeof h !== "number") return null;
      const outW = noUpscale ? Math.min(w, img.width) : w;
      const outH = noUpscale ? Math.min(h, img.height) : h;
      const canvas = await drawWithAnchor({
        srcUrl: img.url,
        srcW: img.width,
        srcH: img.height,
        outW: outW,
        outH: outH,
        fit,
        anchor,
        background: fmt === "jpeg" && hasAlpha ? bg : undefined,
        smoothing: smoothQ,
      });
      return await canvasEncode(canvas, fmt, quality);
    },
    300,
  );

  async function run() {
    if (!img || typeof w !== "number" || typeof h !== "number") return;
    try {
      setRunning(true);
      setLog("Processing…");
      const outW = noUpscale ? Math.min(w, img.width) : w;
      const outH = noUpscale ? Math.min(h, img.height) : h;

      const canvas = await drawWithAnchor({
        srcUrl: img.url,
        srcW: img.width,
        srcH: img.height,
        outW: outW,
        outH: outH,
        fit,
        anchor,
        background: fmt === "jpeg" && hasAlpha ? bg : undefined,
        smoothing: smoothQ,
      });

      const blob = await canvasEncode(canvas, fmt, quality);
      const filename = suggestName(img.file.name, "resized", fmt);
      triggerDownload(blob, filename);
      setLog(`Done → ${filename} (${formatBytes(blob.size)})`);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setLog(`Error: ${e.message}`);
      } else {
        setLog(`Error: ${String(e)}`);
      }
    } finally {
      setRunning(false);
    }
  }

  return (
    <>
      <ToolPageHeader
        icon={Maximize2}
        title="Image Resizer"
        description="Resize, convert, and optimize images with live preview."
        actions={
          <>
            <ResetButton onClick={resetAll} />
            <ActionButton
              variant="default"
              label={running ? "Processing…" : "Download"}
              icon={running ? Loader2 : CloudDownload}
              onClick={run}
              disabled={!img || running || previewBusy}
            />
          </>
        }
      />

      {/* Input / Meta */}
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
          </div>
        </CardContent>
      </GlassCard>

      <Separator className="my-4" />

      {/* Settings */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Settings</CardTitle>
          <CardDescription>Customize size, fit, focus, format, and quality.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          {/* Size / Ratio / Scale */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <InputField
                id="width"
                label="Width (px)"
                type="number"
                min={1}
                value={w}
                onChange={(e) => setW(numOrEmpty(e.target.value))}
                disabled={!img}
              />
              <InputField
                id="height"
                label="Height (px)"
                type="number"
                min={1}
                value={h}
                onChange={(e) => setH(numOrEmpty(e.target.value))}
                disabled={!img}
              />
            </div>

            <div className="flex flex-wrap items-end gap-4">
              <SwitchRow
                icon={Link2}
                label="Lock aspect ratio"
                checked={locked}
                onCheckedChange={setLocked}
              />
              <SwitchRow checked={noUpscale} onCheckedChange={setNoUpscale} label="No upscale" />

              <InputField
                className="w-full"
                id="scale"
                label="Scale (%)"
                type="number"
                min={1}
                placeholder="e.g. 50 for half"
                value={scale}
                onChange={(e) => setScale(numOrEmpty(e.target.value))}
                disabled={!img}
              />

              {/* Quick scales */}
              <div className="flex flex-wrap gap-2">
                {[50, 75, 200].map((p) => (
                  <ActionButton
                    key={p}
                    size="sm"
                    label={`${p}%`}
                    className="rounded text-xs"
                    onClick={() => setScale(p)}
                  />
                ))}
                <ActionButton
                  label="Reset size"
                  size="sm"
                  className="rounded text-xs"
                  onClick={() => {
                    setW(img?.width ?? "");
                    setH(img?.height ?? "");
                    setScale("");
                  }}
                />
                <ActionButton
                  size="sm"
                  icon={checker ? Eye : EyeOff}
                  label={`${checker ? "Hide" : "Show"} checkerboard`}
                  onClick={() => setChecker((v) => !v)}
                  className=" ml-auto"
                />
              </div>
            </div>
          </div>

          {/* Fit / Anchor / Format / Quality */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <SelectField
                label="Fit"
                value={fit}
                onValueChange={(v) => setFit(v as FitMode)}
                placeholder="Select fit"
                description="Contain keeps all content; Cover fills the frame (may be cropped)."
                options={[
                  { value: "contain", label: "Contain" },
                  { value: "cover", label: "Cover" },
                ]}
              />

              <SelectField
                label="Focus (cover)"
                value={anchor}
                onValueChange={(v) => setAnchor(v as Anchor)}
                disabled={fit !== "cover"}
                placeholder="Center"
                description="Determine the crop direction when filling the frame."
                options={[
                  { value: "top-left", label: "Top left" },
                  { value: "top", label: "Top" },
                  { value: "top-right", label: "Top right" },
                  { value: "left", label: "Left" },
                  { value: "center", label: "Center" },
                  { value: "right", label: "Right" },
                  { value: "bottom-left", label: "Bottom left" },
                  { value: "bottom", label: "Bottom" },
                  { value: "bottom-right", label: "Bottom right" },
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <SelectField
                label="Format"
                value={fmt}
                onValueChange={(v) => setFmt(v as OutFormat)}
                placeholder="Select format"
                description="WEBP is generally smaller; PNG is sharper for UI/graphics."
                options={[
                  { value: "webp", label: "WEBP (recommended)" },
                  { value: "jpeg", label: "JPEG" },
                  { value: "png", label: "PNG" },
                ]}
              />
              <SelectField
                label="Smoothing quality"
                value={smoothQ}
                onValueChange={(v) => setSmoothQ(v as ImageSmoothingQuality)}
                placeholder="high"
                options={[
                  { value: "low", label: "Low" },
                  { value: "medium", label: "Medium" },
                  { value: "high", label: "High" },
                ]}
              />

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

            {fmt === "jpeg" && hasAlpha && (
              <div className="flex items-center gap-3">
                <Label htmlFor="bg" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" /> Background (for transparency)
                </Label>
                <InputField
                  id="bg"
                  type="color"
                  className="h-9 w-16 p-1"
                  value={bg}
                  onChange={(e) => setBg(e.target.value)}
                />
              </div>
            )}
          </div>
        </CardContent>
      </GlassCard>

      <Separator className="my-4" />

      {/* Live Preview + Log */}
      <div className="grid gap-6 md:grid-cols-2">
        <OutputPreview
          title="Output Preview & Info"
          description={previewBusy ? "Rendering preview…" : "Live preview (after resize)."}
          previewUrl={previewUrl}
          size={previewSize}
          formatLabel={fmt.toUpperCase()}
          checker={checker}
          tips={
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>Canvas export removes EXIF/metadata.</li>
              <li>GIF ← single frame; SVG rasterized before resize.</li>
            </ul>
          }
        />
        <ProcessLog value={log} onClear={() => setLog("")} />
      </div>
    </>
  );
}

/* Helpers */

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
  const ctx = c.getContext("2d");
  if (!ctx) {
    throw new Error("2D canvas context is not supported in this environment.");
  }
  ctx.drawImage(img, 0, 0, w, h);
  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, w, h).data;
  } catch {
    return false;
  }
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] !== 255) return true;
  }
  return false;
}

/** Draw with contain/cover + anchor crop, background & smoothing */
async function drawWithAnchor(opts: {
  srcUrl: string;
  srcW: number;
  srcH: number;
  outW: number;
  outH: number;
  fit: FitMode;
  anchor: Anchor;
  background?: string;
  smoothing: ImageSmoothingQuality;
}): Promise<HTMLCanvasElement> {
  const { srcUrl, srcW, srcH, outW, outH, fit, anchor, background, smoothing } = opts;

  const imgEl = await createImageElement(srcUrl);

  const targetW = Math.max(1, Math.round(outW));
  const targetH = Math.max(1, Math.round(outH));
  const srcAspect = srcW / srcH;
  const dstAspect = targetW / targetH;

  // src crop (sx, sy, sw, sh) and dest (dx, dy, dw, dh)
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
    const scale = Math.max(targetW / srcW, targetH / srcH);
    const needW = Math.round(targetW / scale);
    const needH = Math.round(targetH / scale);

    const ax = anchor.includes("left") ? 0 : anchor.includes("right") ? 1 : 0.5;
    const ay = anchor.includes("top") ? 0 : anchor.includes("bottom") ? 1 : 0.5;

    sx = Math.round((srcW - needW) * ax);
    sy = Math.round((srcH - needH) * ay);
    sx = Math.max(0, Math.min(sx, srcW - needW));
    sy = Math.max(0, Math.min(sy, srcH - needH));

    sw = needW;
    sh = needH;
    dx = 0;
    dy = 0;
    dw = targetW;
    dh = targetH;
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas context is not supported in this environment.");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = smoothing as ImageSmoothingQuality;

  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, targetW, targetH);
  } else {
    ctx.clearRect(0, 0, targetW, targetH);
  }

  ctx.drawImage(imgEl, sx, sy, sw, sh, dx, dy, dw, dh);
  return canvas;
}
