"use client";

import {
  ActivitySquare,
  Check,
  Copy,
  Crop,
  Download,
  Image as ImageIcon,
  Link2,
  Loader2,
  Maximize2,
  RotateCcw,
  Upload,
} from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { useDropzone } from "react-dropzone";

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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type FitMode = "contain" | "cover";
type OutFormat = "png" | "jpeg" | "webp";

interface LoadedImage {
  file: File;
  url: string;
  width: number;
  height: number;
}

export default function ImageResizePage() {
  const [img, setImg] = React.useState<LoadedImage | null>(null);
  const [locked, setLocked] = React.useState(true);
  const [fit, setFit] = React.useState<FitMode>("contain");
  const [fmt, setFmt] = React.useState<OutFormat>("webp");
  const [bg, setBg] = React.useState("#ffffff"); // used when converting transparent → jpeg
  const [quality, setQuality] = React.useState(90); // 1..100
  const [scale, setScale] = React.useState<number | "">("");
  const [w, setW] = React.useState<number | "">("");
  const [h, setH] = React.useState<number | "">("");
  const [running, setRunning] = React.useState(false);
  const [log, setLog] = React.useState<string>("");
  const [copied, setCopied] = React.useState(false);

  const ratio = React.useMemo(() => {
    if (!img) return 1;
    return img.width / img.height;
  }, [img]);

  // drop / paste handlers
  const onDrop = React.useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const meta = await loadImageMeta(url);
    setImg({ file, url, width: meta.width, height: meta.height });
    // reset size inputs
    setW(meta.width);
    setH(meta.height);
    setScale("");
    setLog("");
  }, []);

  React.useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const item = e.clipboardData?.files?.[0];
      if (item?.type.startsWith("image/")) {
        onDrop([item]);
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [onDrop]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    onDrop,
  });

  // aspect lock behavior
  React.useEffect(() => {
    if (!img) return;
    // change width → adjust height
    if (locked && typeof w === "number" && document.activeElement?.id === "width") {
      setH(Math.max(1, Math.round(w / ratio)));
    }
    // change height → adjust width
    if (locked && typeof h === "number" && document.activeElement?.id === "height") {
      setW(Math.max(1, Math.round(h * ratio)));
    }
  }, [w, h, ratio, locked, img]);

  // scale → width/height
  React.useEffect(() => {
    if (!img) return;
    if (scale === "" || Number.isNaN(Number(scale))) return;
    const s = Math.max(1, Number(scale));
    setW(Math.max(1, Math.round((img.width * s) / 100)));
    setH(Math.max(1, Math.round((img.height * s) / 100)));
  }, [scale, img]);

  function resetAll() {
    if (img?.url) URL.revokeObjectURL(img.url);
    setImg(null);
    setLocked(true);
    setFit("contain");
    setFmt("webp");
    setBg("#ffffff");
    setQuality(90);
    setScale("");
    setW("");
    setH("");
    setRunning(false);
    setLog("");
  }

  async function run() {
    if (!img) return;
    try {
      setRunning(true);
      setLog("Processing…");

      const result = await resizeImage({
        srcUrl: img.url,
        srcW: img.width,
        srcH: img.height,
        outW: typeof w === "number" ? w : img.width,
        outH: typeof h === "number" ? h : img.height,
        fit,
        format: fmt,
        quality,
        background: bg,
      });

      // trigger download
      const filename = suggestName(img.file.name, fmt);
      triggerDownload(result.blob, filename);
      setLog(`Done → ${filename} (${formatBytes(result.blob.size)})`);
    } catch (e: any) {
      setLog(`Error: ${e?.message || String(e)}`);
    } finally {
      setRunning(false);
    }
  }

  function copyLog() {
    navigator.clipboard.writeText(log || "").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <MotionGlassCard>
        {/* Header */}
        <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <Maximize2 className="h-6 w-6" /> Image Resizer
            </h1>
            <p className="text-sm text-muted-foreground">
              Resize, convert, and optimize images. Drag & drop, paste (Ctrl/Cmd+V), or use the
              upload button.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={resetAll} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
            <Button onClick={run} className="gap-2" disabled={!img || running}>
              {running ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {running ? "Processing…" : "Resize & Download"}
            </Button>
          </div>
        </GlassCard>

        {/* Uploader / Preview */}
        <GlassCard>
          <CardHeader>
            <CardTitle className="text-base">Image</CardTitle>
            <CardDescription>Upload, drag & drop, or paste from clipboard.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-2">
            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={cn(
                "group relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-6 transition",
                isDragActive ? "border-primary bg-primary/5" : "hover:bg-muted/40",
              )}
            >
              <input {...getInputProps()} />
              <div className="pointer-events-none flex flex-col items-center gap-2 text-center">
                <div className="rounded-full bg-primary/10 p-3">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium">Drop image here, or click to browse</p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPEG, WEBP, GIF, SVG (rasterized)
                </p>
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
                  <Image
                    src={img.url}
                    alt="preview"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain"
                    priority
                  />
                )}
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

        {/* Settings */}
        <GlassCard>
          <CardHeader>
            <CardTitle className="text-base">Settings</CardTitle>
            <CardDescription>Customize size, fit mode, format, and quality.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            {/* Dimensions */}
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
              </div>
            </div>

            {/* Format / Fit / Quality */}
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
              </div>

              {/* Quality for lossy */}
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

              {/* Background color for JPEG transparency */}
              {fmt === "jpeg" && (
                <div className="flex items-center gap-3">
                  <Label htmlFor="bg">Background (for transparency)</Label>
                  <Input
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

        <Separator />

        {/* Output Preview & Logs */}
        <GlassCard>
          <CardHeader>
            <CardTitle className="text-base">Output Preview & Log</CardTitle>
            <CardDescription>
              Estimated output size depends on content & quality settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            {/* Estimated box */}
            <div className="space-y-3">
              <div className="rounded-lg border p-3">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Crop className="h-4 w-4" />
                    Target Dimensions
                  </span>
                  <span className="font-medium">
                    {typeof w === "number" && typeof h === "number" ? `${w} × ${h}px` : "—"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
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

              {/* Tips */}
              <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                <li>Paste directly from your clipboard (Ctrl/Cmd+V).</li>
                <li>
                  Use <span className="font-medium">Contain</span> to keep the full image without
                  cropping.
                </li>
                <li>WEBP is usually the smallest; PNG is best for sharp UI/graphics.</li>
              </ul>
            </div>

            {/* Log */}
            <div className="space-y-2">
              <Label className="text-sm">Process Log</Label>
              <Textarea readOnly value={log} className="min-h-[120px] font-mono" />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={copyLog}
                  disabled={!log}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  Copy
                </Button>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => setLog("")}>
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

function numOrEmpty(v: string): number | "" {
  const n = Number(v);
  return Number.isNaN(n) ? "" : n;
}

function suggestName(name: string, fmt: OutFormat) {
  const base = name.replace(/\.[^.]+$/, "");
  return `${base}-resized.${fmt === "jpeg" ? "jpg" : fmt}`;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function formatBytes(bytes: number) {
  const units = ["B", "KB", "MB", "GB"];
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

async function resizeImage(opts: {
  srcUrl: string;
  srcW: number;
  srcH: number;
  outW: number;
  outH: number;
  fit: FitMode;
  format: OutFormat;
  quality: number; // 1..100
  background: string;
}): Promise<{ blob: Blob }> {
  const { srcUrl, srcW, srcH, outW, outH, fit, format, quality, background } = opts;

  // compute target draw rect based on fit
  const targetW = Math.max(1, Math.round(outW));
  const targetH = Math.max(1, Math.round(outH));

  const srcAspect = srcW / srcH;
  const dstAspect = targetW / targetH;

  let drawW = targetW;
  let drawH = targetH;

  if (fit === "contain") {
    if (srcAspect > dstAspect) {
      drawW = targetW;
      drawH = Math.round(targetW / srcAspect);
    } else {
      drawH = targetH;
      drawW = Math.round(targetH * srcAspect);
    }
  } else {
    // cover
    if (srcAspect > dstAspect) {
      // crop width
      drawH = targetH;
      drawW = Math.round(targetH * srcAspect);
    } else {
      // crop height
      drawW = targetW;
      drawH = Math.round(targetW / srcAspect);
    }
  }

  // prepare canvas
  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d")!;

  // background for JPEG (to avoid black where transparent)
  if (format === "jpeg") {
    ctx.fillStyle = background || "#ffffff";
    ctx.fillRect(0, 0, targetW, targetH);
  } else {
    ctx.clearRect(0, 0, targetW, targetH);
  }

  const imgEl = await createImageElement(srcUrl);

  if (fit === "contain") {
    const dx = Math.round((targetW - drawW) / 2);
    const dy = Math.round((targetH - drawH) / 2);
    ctx.drawImage(imgEl, 0, 0, srcW, srcH, dx, dy, drawW, drawH);
  } else {
    // cover: draw scaled then center crop by drawing offset negative
    const scale = Math.max(targetW / srcW, targetH / srcH);
    const sw = Math.round(targetW / scale);
    const sh = Math.round(targetH / scale);
    const sx = Math.round((srcW - sw) / 2);
    const sy = Math.round((srcH - sh) / 2);
    ctx.drawImage(imgEl, sx, sy, sw, sh, 0, 0, targetW, targetH);
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

/* ------------------- tiny UI subcomp ------------------- */
function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-background/60 p-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-xs font-medium">{value}</div>
    </div>
  );
}
