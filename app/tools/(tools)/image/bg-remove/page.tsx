"use client";

import {
  Check,
  CloudDownload,
  Copy,
  Eraser,
  Highlighter,
  ImageOff,
  Info,
  Layers,
  Loader2,
  Palette,
  Pipette,
  Upload,
  Wand,
} from "lucide-react";
import * as React from "react";
import { useDropzone } from "react-dropzone";
import { ActionButton, ResetButton } from "@/components/shared/action-buttons";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/* types */
type Mode = "auto" | "chroma" | "manual";

interface LoadedImage {
  file: File;
  url: string;
  width: number;
  height: number;
  type: string;
  size: number;
}

export default function BgRemovePage() {
  const [img, setImg] = React.useState<LoadedImage | null>(null);

  // Mode & params
  const [mode, setMode] = React.useState<Mode>("auto");
  const [tolerance, setTolerance] = React.useState(28);
  const [feather, setFeather] = React.useState(2);
  const [cleanup, setCleanup] = React.useState(1);
  const [invert, setInvert] = React.useState(false);

  // Chroma
  const [keyHex, setKeyHex] = React.useState("#ffffff");
  const [pickerActive, setPickerActive] = React.useState(false);

  // Manual brush
  const [brushErase, setBrushErase] = React.useState(true);
  const [brushSize, setBrushSize] = React.useState(28);

  // UI
  const [running, setRunning] = React.useState(false);
  const [log, setLog] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  // canvases
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const overlayRef = React.useRef<HTMLCanvasElement | null>(null);

  // drop / paste
  const onDrop = React.useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const meta = await loadImageMeta(url);

    setImg({ file, url, width: meta.width, height: meta.height, type: file.type, size: file.size });
    setLog(`Loaded ${file.name} (${formatBytes(file.size)})`);

    requestAnimationFrame(() => {
      initCanvases(url, meta.width, meta.height, canvasRef, overlayRef);
    });
  }, []);

  React.useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const item = e.clipboardData?.files?.[0];
      if (item?.type.startsWith("image/")) onDrop([item]);
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
    setMode("auto");
    setTolerance(28);
    setFeather(2);
    setCleanup(1);
    setInvert(false);
    setKeyHex("#ffffff");
    setPickerActive(false);
    setBrushErase(true);
    setBrushSize(28);
    setRunning(false);
    setLog("");
    if (canvasRef.current) clearCanvas(canvasRef.current);
    if (overlayRef.current) clearCanvas(overlayRef.current);
  }

  async function run() {
    if (!img || !canvasRef.current) return;
    try {
      setRunning(true);
      setLog("Removing background…");

      const base = await ensureBaseDrawn(img.url, canvasRef.current);

      let mask: Uint8ClampedArray = new Uint8ClampedArray(base.width * base.height);

      if (mode === "auto") {
        mask = floodMask(base, tolerance);
      } else if (mode === "chroma") {
        const key = hexToRgb(keyHex);
        mask = chromaMask(base, key, tolerance);
      } else {
        const ov = overlayRef.current;
        if (ov) {
          mask = overlayEraseMask(ov);
        }
      }

      if (invert) invertMask(mask);

      // refine
      if (cleanup > 0) {
        for (let i = 0; i < cleanup; i++) {
          erode(mask, base.width, base.height);
          dilate(mask, base.width, base.height);
        }
      }
      if (feather > 0) gaussianBlur(mask, base.width, base.height, feather);

      // apply mask to base → transparent PNG
      applyMaskToBase(base, mask);

      // redraw canvas
      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) throw new Error("2D context unavailable");
      ctx.putImageData(base, 0, 0);

      // clear overlay after apply (optional)
      if (overlayRef.current && mode === "manual") clearCanvas(overlayRef.current);

      // download
      const blob = await canvasToBlob(canvasRef.current, "image/png", 1);
      const filename = suggestName(img.file.name);
      triggerDownload(blob, filename);
      setLog(`Done → ${filename} (${formatBytes(blob.size)})`);
    } catch (e: any) {
      setLog(`Error: ${e?.message || String(e)}`);
    } finally {
      setRunning(false);
    }
  }

  // color picker from image
  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!pickerActive || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * canvasRef.current.width);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * canvasRef.current.height);
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    const { data } = ctx.getImageData(x, y, 1, 1);
    setKeyHex(rgbToHex({ r: data[0], g: data[1], b: data[2] }));
    setPickerActive(false);
  }

  // simple brush painting on overlay (manual mode)
  React.useEffect(() => {
    const ov = overlayRef.current;
    if (!ov) return;

    let drawing = false;

    function isTouchEvent(e: MouseEvent | TouchEvent): e is TouchEvent {
      return "touches" in e;
    }

    function pos(e: MouseEvent | TouchEvent) {
      const rect = ov.getBoundingClientRect();
      const cx = isTouchEvent(e) ? (e.touches[0]?.clientX ?? 0) : e.clientX;
      const cy = isTouchEvent(e) ? (e.touches[0]?.clientY ?? 0) : e.clientY;
      const x = ((cx - rect.left) / rect.width) * ov.width;
      const y = ((cy - rect.top) / rect.height) * ov.height;
      return { x, y };
    }

    const start = (e: MouseEvent | TouchEvent) => {
      if (mode !== "manual") return;
      drawing = true;
      drawDot(pos(e));
    };
    const move = (e: MouseEvent | TouchEvent) => {
      if (!drawing || mode !== "manual") return;
      drawDot(pos(e));
    };
    const end = () => {
      drawing = false;
    };

    function drawDot(p: { x: number; y: number }) {
      const ctx = ov.getContext("2d");
      if (!ctx) return;
      // erase = paint white (alpha>0 becomes mask); restore = erase painted area
      ctx.globalCompositeOperation = brushErase ? "source-over" : "destination-out";
      ctx.fillStyle = "rgba(255,255,255,1)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // listeners bound to the narrowed element
    ov.addEventListener("mousedown", start as EventListener);
    ov.addEventListener("mousemove", move as EventListener);
    window.addEventListener("mouseup", end as EventListener);

    ov.addEventListener("touchstart", start as EventListener, { passive: true });
    ov.addEventListener("touchmove", move as EventListener, { passive: true });
    window.addEventListener("touchend", end as EventListener);

    return () => {
      ov.removeEventListener("mousedown", start as EventListener);
      ov.removeEventListener("mousemove", move as EventListener);
      window.removeEventListener("mouseup", end as EventListener);

      ov.removeEventListener("touchstart", start as EventListener);
      ov.removeEventListener("touchmove", move as EventListener);
      window.removeEventListener("touchend", end as EventListener);
    };
  }, [mode, brushErase, brushSize]);

  return (
    <>
      {/* Header */}
      <ToolPageHeader
        icon={Wand}
        title="Background Remover"
        description="Erase backgrounds in the browser. Drag & drop, paste (Ctrl/Cmd+V), or click to upload."
        actions={
          <>
            <ResetButton onClick={resetAll} />
            <ActionButton
              variant="default"
              label={running ? "Processing…" : "Download"}
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
                PNG, JPEG, WEBP, GIF, SVG (GIF/SVG will be rasterized)
              </p>
            </div>
          </div>

          {/* Preview + Meta */}
          <div className="grid gap-4">
            <div className="relative h-72 w-full overflow-hidden rounded-lg border">
              {/* checkerboard */}
              <div className="absolute inset-0 bg-[linear-gradient(45deg,#0000_25%,#00000011_25%_50%,#0000_50%_75%,#00000011_75%_100%)] [background-size:16px_16px]" />
              {!img ? (
                <div className="relative z-10 flex h-full items-center justify-center text-sm text-muted-foreground">
                  <ImageOff className="mr-2 h-4 w-4" />
                  No image selected
                </div>
              ) : (
                <div className="relative z-10 h-full w-full">
                  <canvas
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    className={cn(
                      "absolute inset-0 h-full w-full",
                      pickerActive && "cursor-crosshair",
                    )}
                  />
                  {/* brush overlay */}
                  <canvas
                    ref={overlayRef}
                    className={cn(
                      "absolute inset-0 h-full w-full",
                      mode === "manual" ? "cursor-crosshair" : "pointer-events-none",
                    )}
                  />
                </div>
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

      <Separator className="my-4" />

      {/* Settings */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Settings</CardTitle>
          <CardDescription>Choose a method and refine the edges.</CardDescription>
        </CardHeader>

        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Mode</Label>
              <Select value={mode} onValueChange={(v: Mode) => setMode(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto (Smart Flood)</SelectItem>
                  <SelectItem value="chroma">Chroma Key (Pick Color)</SelectItem>
                  <SelectItem value="manual">Manual Brush</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Auto works best for solid/simple backgrounds. Use Chroma if you know the background
                color. Manual for fine control.
              </p>
            </div>

            {mode !== "manual" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="tol">Tolerance</Label>
                  <span className="text-xs text-muted-foreground">{tolerance}</span>
                </div>
                <Slider
                  id="tol"
                  min={0}
                  max={128}
                  step={1}
                  value={[tolerance]}
                  onValueChange={([v]) => setTolerance(v)}
                />
                <p className="text-xs text-muted-foreground">Higher removes a wider color range.</p>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="feather">Feather</Label>
                <span className="text-xs text-muted-foreground">{feather}px</span>
              </div>
              <Slider
                id="feather"
                min={0}
                max={8}
                step={1}
                value={[feather]}
                onValueChange={([v]) => setFeather(v)}
              />
              <p className="text-xs text-muted-foreground">
                Softens the edge for a smoother cutout.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="clean">Edge Cleanup</Label>
                <span className="text-xs text-muted-foreground">{cleanup}</span>
              </div>
              <Slider
                id="clean"
                min={0}
                max={3}
                step={1}
                value={[cleanup]}
                onValueChange={([v]) => setCleanup(v)}
              />
              <p className="text-xs text-muted-foreground">
                Removes speckles/holes (morphological refine).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Switch id="inv" checked={invert} onCheckedChange={setInvert} />
              <Label htmlFor="inv" className="flex items-center gap-2">
                <Layers className="h-4 w-4" /> Invert selection (keep background instead)
              </Label>
            </div>
          </div>

          {/* Chroma / Manual controls */}
          <div className="space-y-4">
            {mode === "chroma" && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Palette className="h-4 w-4" /> Chroma Key Color
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="color"
                    className="h-9 w-16 p-1"
                    value={keyHex}
                    onChange={(e) => setKeyHex(e.target.value)}
                  />
                  <Input
                    value={keyHex}
                    onChange={(e) => setKeyHex(e.target.value)}
                    className="w-36"
                    placeholder="#ffffff"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn("gap-2", pickerActive && "ring-2 ring-primary")}
                    onClick={() => setPickerActive((s) => !s)}
                  >
                    <Pipette className="h-4 w-4" />{" "}
                    {pickerActive ? "Pick (active)" : "Pick from image"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Tip: click anywhere on the preview to sample the color.
                </p>
              </div>
            )}

            {mode === "manual" && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant={brushErase ? "default" : "outline"}
                    className="gap-2"
                    onClick={() => setBrushErase(true)}
                  >
                    <Eraser className="h-4 w-4" /> Erase
                  </Button>
                  <Button
                    type="button"
                    variant={!brushErase ? "default" : "outline"}
                    className="gap-2"
                    onClick={() => setBrushErase(false)}
                  >
                    <Highlighter className="h-4 w-4" /> Restore
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="bsize">Brush Size</Label>
                    <span className="text-xs text-muted-foreground">{brushSize}px</span>
                  </div>
                  <Slider
                    id="bsize"
                    min={6}
                    max={120}
                    step={2}
                    value={[brushSize]}
                    onValueChange={([v]) => setBrushSize(v)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Paint on the image: <span className="font-medium">Erase</span> marks background,{" "}
                  <span className="font-medium">Restore</span> protects foreground.
                </p>
              </div>
            )}

            <div className="rounded-md border p-3 text-xs text-muted-foreground">
              <div className="mb-1 flex items-center gap-2">
                <Info className="h-3.5 w-3.5" />
                <span className="text-foreground font-medium">Tips</span>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                <li>Auto works best with solid or lightly textured backdrops.</li>
                <li>Use Chroma mode for green/blue screens or white backgrounds.</li>
                <li>After auto/chroma, switch to Manual to fix leftover edges.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </GlassCard>

      <Separator className="my-4" />

      {/* Log */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Process Log</CardTitle>
          <CardDescription>Export is PNG with transparency.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea readOnly value={log} className="min-h-[120px] font-mono" />
          <div className="mt-2 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() =>
                navigator.clipboard.writeText(log || "").then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1100);
                })
              }
              disabled={!log}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              Copy
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setLog("")}>
              Clear
            </Button>
          </div>
        </CardContent>
      </GlassCard>
    </>
  );
}

/* helpers & image ops */

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

// change the function signature only
async function initCanvases(
  srcUrl: string,
  _w: number,
  _h: number,
  baseRef: React.RefObject<HTMLCanvasElement | null>,
  overlayRef: React.RefObject<HTMLCanvasElement | null>,
) {
  const base = baseRef.current;
  const overlay = overlayRef.current;
  if (!base || !overlay) return;

  const imgEl = await createImageElement(srcUrl);

  base.width = imgEl.naturalWidth;
  base.height = imgEl.naturalHeight;
  const bctx = base.getContext("2d");
  if (!bctx) return;
  bctx.clearRect(0, 0, base.width, base.height);
  bctx.drawImage(imgEl, 0, 0);

  overlay.width = base.width;
  overlay.height = base.height;
  clearCanvas(overlay);
}

async function ensureBaseDrawn(srcUrl: string, canvas: HTMLCanvasElement) {
  const ctxExisting = canvas.getContext("2d");
  if (ctxExisting) {
    const w = canvas.width;
    const h = canvas.height;
    if (w && h) return ctxExisting.getImageData(0, 0, w, h);
  }
  const imgEl = await createImageElement(srcUrl);
  canvas.width = imgEl.naturalWidth;
  canvas.height = imgEl.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D context unavailable");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(imgEl, 0, 0);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function suggestName(name: string) {
  const base = name.replace(/\.[^.]+$/, "");
  return `${base}-bg-removed.png`;
}

function clearCanvas(c: HTMLCanvasElement) {
  const ctx = c.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, c.width, c.height);
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

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, q: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Failed to encode image"))), mime, q);
  });
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

/* ---------- mask builders ---------- */

// Auto: flood from 4 corners with color distance threshold
function floodMask(base: ImageData, tol: number): Uint8ClampedArray {
  const { width: w, height: h, data } = base;
  const mask = new Uint8ClampedArray(w * h);
  const seeds: [number, number][] = [
    [0, 0],
    [w - 1, 0],
    [0, h - 1],
    [w - 1, h - 1],
  ];
  const visited = new Uint8Array(w * h);

  const seedCols = seeds.map(([sx, sy]) => {
    const i = (sy * w + sx) * 4;
    return { r: data[i], g: data[i + 1], b: data[i + 2] };
  });

  const q: number[] = [];
  for (const [sx, sy] of seeds) {
    const idx = sy * w + sx;
    q.push(idx);
    visited[idx] = 1;
  }

  while (q.length) {
    const idx = q.pop()!;
    const x = idx % w;
    const y = (idx / w) | 0;
    const i = idx * 4;

    const px = { r: data[i], g: data[i + 1], b: data[i + 2] };
    for (let s = 0; s < seedCols.length; s++) {
      if (colorDist(px, seedCols[s]) <= tol) {
        mask[idx] = 255;
        break;
      }
    }

    const neigh = [idx - 1, idx + 1, idx - w, idx + w];
    for (const n of neigh) {
      if (n < 0 || n >= w * h) continue;
      const nx = n % w;
      const ny = (n / w) | 0;
      if (Math.abs(nx - x) + Math.abs(ny - y) !== 1) continue;
      if (!visited[n]) {
        visited[n] = 1;
        q.push(n);
      }
    }
  }

  return mask;
}

// Chroma: remove pixels close to a chosen color
function chromaMask(
  base: ImageData,
  key: { r: number; g: number; b: number },
  tol: number,
): Uint8ClampedArray {
  const { width: w, height: h, data } = base;
  const out = new Uint8ClampedArray(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const px = { r: data[i], g: data[i + 1], b: data[i + 2] };
      if (colorDist(px, key) <= tol) out[y * w + x] = 255;
    }
  }
  return out;
}

// Manual: interpret overlay alpha>0 as "erase"
function overlayEraseMask(overlay: HTMLCanvasElement): Uint8ClampedArray {
  const w = overlay.width;
  const h = overlay.height;
  const ctx = overlay.getContext("2d");
  if (!ctx) return new Uint8ClampedArray(w * h);
  const { data } = ctx.getImageData(0, 0, w, h);
  const out = new Uint8ClampedArray(w * h);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    out[p] = data[i + 3] > 0 ? 255 : 0;
  }
  return out;
}

/* ---------- mask refine ---------- */

function invertMask(mask: Uint8ClampedArray) {
  for (let i = 0; i < mask.length; i++) mask[i] = 255 - mask[i];
}

function gaussianBlur(mask: Uint8ClampedArray, w: number, h: number, radius: number) {
  if (radius < 1) return;
  const kernel = buildGaussian(radius);
  const tmp = new Uint8ClampedArray(mask.length);

  // horizontal
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let acc = 0,
        ksum = 0;
      for (let k = -radius; k <= radius; k++) {
        const xx = Math.min(w - 1, Math.max(0, x + k));
        const v = mask[y * w + xx];
        const kv = kernel[Math.abs(k)];
        acc += v * kv;
        ksum += kv;
      }
      tmp[y * w + x] = acc / ksum;
    }
  }
  // vertical
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      let acc = 0,
        ksum = 0;
      for (let k = -radius; k <= radius; k++) {
        const yy = Math.min(h - 1, Math.max(0, y + k));
        const v = tmp[yy * w + x];
        const kv = kernel[Math.abs(k)];
        acc += v * kv;
        ksum += kv;
      }
      mask[y * w + x] = acc / ksum;
    }
  }
}

function buildGaussian(r: number) {
  const sigma = r / 2;
  const k: number[] = [];
  for (let i = 0; i <= r; i++) k[i] = Math.exp(-(i * i) / (2 * sigma * sigma));
  return k;
}

function erode(mask: Uint8ClampedArray, w: number, h: number) {
  const out = mask.slice();
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      if (mask[i] && mask[i - 1] && mask[i + 1] && mask[i - w] && mask[i + w]) {
        out[i] = 255;
      } else {
        out[i] = 0;
      }
    }
  }
  for (let i = 0; i < out.length; i++) mask[i] = out[i];
}

function dilate(mask: Uint8ClampedArray, w: number, h: number) {
  const out = mask.slice();
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      if (mask[i] || mask[i - 1] || mask[i + 1] || mask[i - w] || mask[i + w]) {
        out[i] = 255;
      } else {
        out[i] = 0;
      }
    }
  }
  for (let i = 0; i < out.length; i++) mask[i] = out[i];
}

/* ---------- apply mask ---------- */

function applyMaskToBase(base: ImageData, mask: Uint8ClampedArray) {
  const { data } = base;
  for (let p = 0, i = 0; p < mask.length; p++, i += 4) {
    const m = mask[p]; // 0 keep, 255 remove, feather in-between if blur applied
    data[i + 3] = Math.max(0, Math.min(255, 255 - m)); // invert for alpha (remove→transparent)
  }
}

/* ---------- color utils ---------- */

function colorDist(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }) {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const n = parseInt(
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h,
    16,
  );
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex({ r, g, b }: { r: number; g: number; b: number }) {
  const to = (v: number) => v.toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

/* ---------- tiny UI subcomp ---------- */
function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-background/60 p-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-xs font-medium">{value}</div>
    </div>
  );
}
