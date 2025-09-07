"use client";

import {
  Check,
  Copy,
  Download,
  FileType2,
  Image as ImageIcon,
  Loader2,
  Palette,
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type OutFormat = "png" | "jpeg" | "webp";

interface LoadedImage {
  file: File;
  url: string;
  width: number;
  height: number;
  type: string;
  size: number;
}

export default function ImageConvertPage() {
  const [img, setImg] = React.useState<LoadedImage | null>(null);
  const [fmt, setFmt] = React.useState<OutFormat>("webp");
  const [quality, setQuality] = React.useState(90); // 1..100 (lossy only)
  const [bg, setBg] = React.useState("#ffffff"); // background for JPEG to handle transparency
  const [running, setRunning] = React.useState(false);
  const [log, setLog] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  const onDrop = React.useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const meta = await loadImageMeta(url);
    setImg({ file, url, width: meta.width, height: meta.height, type: file.type, size: file.size });
    setLog("");
  }, []);

  React.useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const item = e.clipboardData?.files?.[0];
      if (item && item.type.startsWith("image/")) onDrop([item]);
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [onDrop]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    onDrop,
  });

  function resetAll() {
    if (img?.url) URL.revokeObjectURL(img.url);
    setImg(null);
    setFmt("webp");
    setQuality(90);
    setBg("#ffffff");
    setRunning(false);
    setLog("");
  }

  async function run() {
    if (!img) return;
    try {
      setRunning(true);
      setLog("Converting…");

      const result = await convertImage({
        srcUrl: img.url,
        outW: img.width,
        outH: img.height,
        format: fmt,
        quality,
        background: bg,
      });

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
              <FileType2 className="h-6 w-6" /> Image Converter
            </h1>
            <p className="text-sm text-muted-foreground">
              Convert images between PNG, JPEG, and WEBP. Drag & drop, paste (Ctrl/Cmd+V), or click
              to upload.
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
              {running ? "Processing…" : "Convert & Download"}
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
                  PNG, JPEG, WEBP, GIF, SVG (SVG/GIF will be rasterized)
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
                <InfoPill label="Source Size" value={img ? formatBytes(img.size) : "—"} />
                <InfoPill label="Source Type" value={img ? img.type || "—" : "—"} />
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
            <CardDescription>Choose output format and fine-tune quality.</CardDescription>
          </CardHeader>

          <CardContent className="grid gap-6 md:grid-cols-2">
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
                <p className="text-xs text-muted-foreground">Higher = larger file size.</p>
              </div>
            )}

            {/* Background color for JPEG (handles transparency) */}
            {fmt === "jpeg" && (
              <div className="space-y-2">
                <Label htmlFor="bg" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" /> Background (for transparent images)
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
                <p className="text-xs text-muted-foreground">
                  Used only when the source has transparency.
                </p>
              </div>
            )}
          </CardContent>
        </GlassCard>

        <Separator />

        {/* Output & Log */}
        <GlassCard>
          <CardHeader>
            <CardTitle className="text-base">Output & Log</CardTitle>
            <CardDescription>Click Convert & Download to save the converted file.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <FileType2 className="h-4 w-4" />
                  Target Format
                </span>
                <span className="font-medium">{fmt.toUpperCase()}</span>
              </div>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                <li>Canvas conversion strips EXIF/metadata by default.</li>
                <li>Animated GIFs will be flattened to a single frame.</li>
                <li>For vector SVGs, we render to bitmap before converting.</li>
              </ul>
            </div>

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

function suggestName(name: string, fmt: OutFormat) {
  const base = name.replace(/\.[^.]+$/, "");
  return `${base}-converted.${fmt === "jpeg" ? "jpg" : fmt}`;
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

async function convertImage(opts: {
  srcUrl: string;
  outW: number;
  outH: number;
  format: OutFormat;
  quality: number; // 1..100
  background: string;
}): Promise<{ blob: Blob }> {
  const { srcUrl, outW, outH, format, quality, background } = opts;

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d")!;

  // JPEG needs background to replace transparency
  if (format === "jpeg") {
    ctx.fillStyle = background || "#ffffff";
    ctx.fillRect(0, 0, outW, outH);
  } else {
    ctx.clearRect(0, 0, outW, outH);
  }

  const imgEl = await createImageElement(srcUrl);
  // draw at native size (convert only)
  ctx.drawImage(imgEl, 0, 0, outW, outH);

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
