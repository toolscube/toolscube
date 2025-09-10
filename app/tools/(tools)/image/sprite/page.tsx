"use client";

import {
  ArrowDown,
  ArrowUp,
  Brush,
  Check,
  Copy,
  Download,
  Grid2X2,
  Info,
  LayoutGrid,
  Loader2,
  MoveHorizontal,
  RotateCcw,
  Trash2,
  Upload,
} from "lucide-react";
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

/* ---------------- types ---------------- */
type LayoutMode = "grid";
type SizeMode = "uniform" | "auto";
type OutFormat = "png" | "webp";

interface LoadedIcon {
  id: string;
  name: string;
  file: File;
  url: string;
  width: number;
  height: number;
}

interface SpritePlacement {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  name: string;
}

/* ---------------- component ---------------- */
export default function SpriteSheetPage() {
  const [icons, setIcons] = React.useState<LoadedIcon[]>([]);
  const [running, setRunning] = React.useState(false);
  const [log, setLog] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  // Layout / sizing
  const [_layout] = React.useState<LayoutMode>("grid");
  const [sizeMode, setSizeMode] = React.useState<SizeMode>("uniform");
  const [columns, setColumns] = React.useState<number>(8);
  const [cellW, setCellW] = React.useState<number | "">("");
  const [cellH, setCellH] = React.useState<number | "">("");
  const [gap, setGap] = React.useState(2);
  const [pad, setPad] = React.useState(2);

  // Output
  const [fmt, setFmt] = React.useState<OutFormat>("png");
  const [quality, setQuality] = React.useState(90); // webp only
  const [transparent, setTransparent] = React.useState(true);
  const [bg, setBg] = React.useState("#ffffff");

  // CSS
  const [sheetClass, setSheetClass] = React.useState("sprite");
  const [classPrefix, setClassPrefix] = React.useState("icon");

  // dropzone
  const onDrop = React.useCallback(async (files: File[]) => {
    const next: LoadedIcon[] = [];
    for (const f of files) {
      if (!f.type.startsWith("image/")) continue;
      const url = URL.createObjectURL(f);
      const { width, height } = await loadImageMeta(url);
      next.push({
        id: cryptoRandom(),
        name: sanitizeName(f.name),
        file: f,
        url,
        width,
        height,
      });
    }
    setIcons((prev) => [...prev, ...next]);
    setLog((l) => l + (next.length ? `Added ${next.length} file(s)\n` : ""));
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
    multiple: true,
    onDrop,
  });

  function resetAll() {
    icons.forEach((i) => URL.revokeObjectURL(i.url));
    setIcons([]);
    setRunning(false);
    setLog("");
    setColumns(8);
    setSizeMode("uniform");
    setCellW("");
    setCellH("");
    setGap(2);
    setPad(2);
    setFmt("png");
    setQuality(90);
    setTransparent(true);
    setBg("#ffffff");
    setSheetClass("sprite");
    setClassPrefix("icon");
  }

  function removeAt(idx: number) {
    setIcons((prev) => {
      const cp = prev.slice();
      const [removed] = cp.splice(idx, 1);
      if (removed) URL.revokeObjectURL(removed.url);
      return cp;
    });
  }

  function move(idx: number, dir: -1 | 1) {
    setIcons((prev) => {
      const cp = prev.slice();
      const j = idx + dir;
      if (j < 0 || j >= cp.length) return cp;
      [cp[idx], cp[j]] = [cp[j], cp[idx]];
      return cp;
    });
  }

  async function run() {
    if (icons.length === 0) return;
    try {
      setRunning(true);
      setLog("Building sprite…");

      const settings = calculateSettings(icons, {
        sizeMode,
        cellW,
        cellH,
        columns,
        gap,
        pad,
      });

      const { canvas, placements } = await buildSprite(icons, settings);

      const mime = fmt === "png" ? "image/png" : "image/webp";
      const q = fmt === "webp" ? Math.min(1, Math.max(0.01, quality / 100)) : 1;

      if (!transparent && fmt === "png") {
        // flatten to solid bg if requested
        fillBackground(canvas, bg);
      } else if (!transparent && fmt === "webp") {
        fillBackground(canvas, bg);
      } else if (transparent) {
        // ensure transparent background
        // nothing to do; canvas already cleared
      }

      const blob = await canvasToBlob(canvas, mime, q);

      // downloads
      const spriteName = `sprite-${icons.length}.${fmt}`;
      triggerDownload(blob, spriteName);

      const css = generateCSS({
        placements,
        sheetClass,
        classPrefix,
        spriteFilename: spriteName,
        sheetW: canvas.width,
        sheetH: canvas.height,
      });
      const json = JSON.stringify(
        {
          image: spriteName,
          width: canvas.width,
          height: canvas.height,
          sprites: placements.reduce<
            Record<string, { x: number; y: number; w: number; h: number }>
          >((acc, p) => {
            acc[p.name] = { x: p.x, y: p.y, w: p.w, h: p.h };
            return acc;
          }, {}),
        },
        null,
        2,
      );

      triggerDownload(new Blob([css], { type: "text/css;charset=utf-8" }), "sprite.css");
      triggerDownload(new Blob([json], { type: "application/json;charset=utf-8" }), "sprite.json");

      setLog(
        `Done → ${spriteName} (${formatBytes(blob.size)})\n` +
          `Also generated sprite.css and sprite.json\n` +
          `Sheet: ${canvas.width}×${canvas.height}px, Icons: ${icons.length}\n`,
      );
    } catch (err: any) {
      setLog(`Error: ${err?.message || String(err)}`);
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

  // derived
  const maxW = icons.length ? Math.max(...icons.map((i) => i.width)) : 0;
  const maxH = icons.length ? Math.max(...icons.map((i) => i.height)) : 0;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <MotionGlassCard>
        {/* Header */}
        <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <LayoutGrid className="h-6 w-6" /> Sprite Sheet Maker
            </h1>
            <p className="text-sm text-muted-foreground">
              Combine icons into a single image with generated CSS classes & JSON map. Drag & drop,
              paste (Ctrl/Cmd+V), or click to upload.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={resetAll} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
            <Button onClick={run} className="gap-2" disabled={!icons.length || running}>
              {running ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {running ? "Building…" : "Build & Download"}
            </Button>
          </div>
        </GlassCard>

        {/* Upload & List */}
        <GlassCard>
          <CardHeader>
            <CardTitle className="text-base">Icons</CardTitle>
            <CardDescription>Upload multiple images and reorder as needed.</CardDescription>
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
                <p className="text-sm font-medium">Drop images here, or click to browse</p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPEG, WEBP, GIF, SVG (GIF/SVG will be rasterized)
                </p>
              </div>
            </div>

            {/* List */}
            <div className="grid gap-3">
              {icons.length === 0 ? (
                <div className="rounded-lg border p-3 text-sm text-muted-foreground">
                  No files yet — add some icons to build a sprite.
                </div>
              ) : (
                <div className="max-h-72 overflow-auto rounded-lg border">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-background">
                      <tr className="text-left">
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2 w-24">Size</th>
                        <th className="px-3 py-2 w-40">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {icons.map((ic, i) => (
                        <tr key={ic.id} className="border-t">
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <span className="inline-block h-5 w-5 overflow-hidden rounded border bg-muted/40">
                                {/* tiny preview with CSS background */}
                                <span
                                  className="block h-full w-full"
                                  style={{
                                    backgroundImage: `url(${ic.url})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                  }}
                                />
                              </span>
                              <span className="truncate">{ic.name}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">
                            {ic.width}×{ic.height}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => move(i, -1)}
                                disabled={i === 0}
                                title="Move up"
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => move(i, +1)}
                                disabled={i === icons.length - 1}
                                title="Move down"
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => removeAt(i)}
                                title="Remove"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </CardContent>
        </GlassCard>

        {/* Settings */}
        <GlassCard>
          <CardHeader>
            <CardTitle className="text-base">Layout & Output</CardTitle>
            <CardDescription>Configure grid, sizes, and output format.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            {/* Layout */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Grid2X2 className="h-4 w-4" /> Columns
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={1}
                    value={columns}
                    onChange={(e) => setColumns(Math.max(1, Number(e.target.value || 1)))}
                    className="w-28"
                  />
                  <div className="text-xs text-muted-foreground">Row-major placement</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MoveHorizontal className="h-4 w-4" /> Gap (px)
                </Label>
                <Slider
                  min={0}
                  max={32}
                  step={1}
                  value={[gap]}
                  onValueChange={([v]) => setGap(v)}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Brush className="h-4 w-4" /> Padding (px)
                </Label>
                <Slider
                  min={0}
                  max={32}
                  step={1}
                  value={[pad]}
                  onValueChange={([v]) => setPad(v)}
                />
              </div>

              <div className="space-y-2">
                <Label>Icon Size Mode</Label>
                <Select value={sizeMode} onValueChange={(v: SizeMode) => setSizeMode(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="uniform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uniform">Uniform (cells)</SelectItem>
                    <SelectItem value="auto">Auto (use intrinsic)</SelectItem>
                  </SelectContent>
                </Select>
                {sizeMode === "uniform" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Cell W</Label>
                      <Input
                        type="number"
                        min={1}
                        placeholder={`${Math.max(1, maxW)}`}
                        value={cellW}
                        onChange={(e) => setCellW(numOrEmpty(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cell H</Label>
                      <Input
                        type="number"
                        min={1}
                        placeholder={`${Math.max(1, maxH)}`}
                        value={cellH}
                        onChange={(e) => setCellH(numOrEmpty(e.target.value))}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Each sprite keeps its own width/height.
                  </p>
                )}
              </div>
            </div>

            {/* Output */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Format</Label>
                <Select value={fmt} onValueChange={(v: OutFormat) => setFmt(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="PNG" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG (lossless)</SelectItem>
                    <SelectItem value="webp">WEBP (smaller)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {fmt === "webp" && (
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

              <div className="space-y-2">
                <Label>Background</Label>
                <div className="flex items-center gap-3">
                  <Switch checked={transparent} onCheckedChange={setTransparent} id="transparent" />
                  <Label htmlFor="transparent" className="text-sm">
                    Transparent
                  </Label>
                </div>
                {!transparent && (
                  <div className="mt-2 flex items-center gap-3">
                    <Input
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
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>CSS Classes</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Input
                      value={sheetClass}
                      onChange={(e) => setSheetClass(e.target.value)}
                      placeholder="sprite"
                    />
                    <div className="text-xs text-muted-foreground">Base class (sprite sheet)</div>
                  </div>
                  <div className="space-y-1">
                    <Input
                      value={classPrefix}
                      onChange={(e) => setClassPrefix(e.target.value)}
                      placeholder="icon"
                    />
                    <div className="text-xs text-muted-foreground">Per-icon class prefix</div>
                  </div>
                </div>
              </div>

              <div className="rounded-md border p-3 text-xs text-muted-foreground">
                <div className="mb-1 flex items-center gap-2">
                  <Info className="h-3.5 w-3.5" />
                  <span className="text-foreground font-medium">Output</span>
                </div>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Image: <span className="font-medium">sprite.png/webp</span>
                  </li>
                  <li>
                    CSS: <span className="font-medium">.sprite</span> container +{" "}
                    <span className="font-medium">.{classPrefix}-name</span> classes
                  </li>
                  <li>JSON map with x/y/w/h for each icon</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </GlassCard>

        <Separator />

        {/* Log */}
        <GlassCard>
          <CardHeader>
            <CardTitle className="text-base">Process Log</CardTitle>
            <CardDescription>Sprite + CSS + JSON will download automatically.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea readOnly value={log} className="min-h-[120px] font-mono" />
            <div className="mt-2 flex gap-2">
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
          </CardContent>
        </GlassCard>
      </MotionGlassCard>
    </div>
  );
}

/* ---------------- sprite build logic ---------------- */

function calculateSettings(
  icons: LoadedIcon[],
  opts: {
    sizeMode: SizeMode;
    cellW: number | "";
    cellH: number | "";
    columns: number;
    gap: number;
    pad: number;
  },
) {
  const maxW = Math.max(...icons.map((i) => i.width));
  const maxH = Math.max(...icons.map((i) => i.height));
  const cellWidth =
    opts.sizeMode === "uniform" ? (typeof opts.cellW === "number" ? opts.cellW : maxW) : 0;
  const cellHeight =
    opts.sizeMode === "uniform" ? (typeof opts.cellH === "number" ? opts.cellH : maxH) : 0;
  return {
    layout: "grid" as const,
    columns: Math.max(1, Math.floor(opts.columns)),
    gap: Math.max(0, Math.floor(opts.gap)),
    pad: Math.max(0, Math.floor(opts.pad)),
    sizeMode: opts.sizeMode,
    cellW: Math.max(1, Math.floor(cellWidth || 1)),
    cellH: Math.max(1, Math.floor(cellHeight || 1)),
  };
}

async function buildSprite(
  icons: LoadedIcon[],
  settings: ReturnType<typeof calculateSettings>,
): Promise<{ canvas: HTMLCanvasElement; placements: SpritePlacement[] }> {
  const imgs = await Promise.all(
    icons.map((i) => createImageElement(i.url).then((el) => ({ el, ic: i }))),
  );

  const n = icons.length;
  const cols = settings.columns;
  const rows = Math.ceil(n / cols);

  let sheetW = 0;
  let sheetH = 0;

  if (settings.sizeMode === "uniform") {
    // grid of fixed cells
    sheetW = settings.pad * 2 + settings.cellW * cols + settings.gap * (cols - 1);
    sheetH = settings.pad * 2 + settings.cellH * rows + settings.gap * (rows - 1);
  } else {
    // auto size: use intrinsic sizes; compute per row max heights and column widths
    const colWidths = new Array(cols).fill(0);
    const rowHeights = new Array(rows).fill(0);
    for (let i = 0; i < n; i++) {
      const c = i % cols;
      const r = Math.floor(i / cols);
      colWidths[c] = Math.max(colWidths[c], icons[i].width);
      rowHeights[r] = Math.max(rowHeights[r], icons[i].height);
    }
    sheetW = settings.pad * 2 + colWidths.reduce((a, b) => a + b, 0) + settings.gap * (cols - 1);
    sheetH = settings.pad * 2 + rowHeights.reduce((a, b) => a + b, 0) + settings.gap * (rows - 1);
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(sheetW));
  canvas.height = Math.max(1, Math.round(sheetH));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D context unavailable");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const placements: SpritePlacement[] = [];

  // Draw
  if (settings.sizeMode === "uniform") {
    for (let i = 0; i < n; i++) {
      const c = i % cols;
      const r = Math.floor(i / cols);
      const x = settings.pad + c * (settings.cellW + settings.gap);
      const y = settings.pad + r * (settings.cellH + settings.gap);

      // center each icon within its cell
      const ic = icons[i];
      const { el } = imgs[i];
      const dx = x + Math.floor((settings.cellW - ic.width) / 2);
      const dy = y + Math.floor((settings.cellH - ic.height) / 2);

      ctx.drawImage(el, dx, dy);
      placements.push({ id: ic.id, x, y, w: settings.cellW, h: settings.cellH, name: ic.name });
    }
  } else {
    // auto: variable cells per item
    const colX: number[] = [];
    const rowY: number[] = [];
    // compute column start X and row start Y
    let accX = settings.pad;
    for (let c = 0; c < cols; c++) {
      const wcol = Math.max(...icons.filter((_, i) => i % cols === c).map((ic) => ic.width), 0);
      colX[c] = accX;
      accX += wcol + (c < cols - 1 ? settings.gap : 0);
    }
    let accY = settings.pad;
    for (let r = 0; r < rows; r++) {
      const hrow = Math.max(...icons.slice(r * cols, r * cols + cols).map((ic) => ic.height), 0);
      rowY[r] = accY;
      accY += hrow + (r < rows - 1 ? settings.gap : 0);
    }

    for (let i = 0; i < n; i++) {
      const c = i % cols;
      const r = Math.floor(i / cols);
      const x = colX[c];
      const y = rowY[r];
      const ic = icons[i];
      ctx.drawImage(imgs[i].el, x, y);
      placements.push({ id: ic.id, x, y, w: ic.width, h: ic.height, name: ic.name });
    }
  }

  return { canvas, placements };
}

/* ---------------- CSS generation ---------------- */

function generateCSS(opts: {
  placements: SpritePlacement[];
  sheetClass: string;
  classPrefix: string;
  spriteFilename: string;
  sheetW: number;
  sheetH: number;
}) {
  const { placements, sheetClass, classPrefix, spriteFilename, sheetW, sheetH } = opts;

  const esc = (s: string) => s.replace(/[^a-zA-Z0-9_-]/g, "-");

  const lines: string[] = [];
  lines.push(`.${sheetClass} {`);
  lines.push(`  background-image: url("${spriteFilename}");`);
  lines.push(`  background-repeat: no-repeat;`);
  lines.push(`  display: inline-block;`);
  lines.push(`}`);
  lines.push("");

  // helpful for responsive scaling via background-size if needed
  lines.push(`/* Sheet size: ${sheetW}x${sheetH}px */`);

  for (const p of placements) {
    const cls = `.${classPrefix}-${esc(p.name.replace(/\.[^.]+$/, ""))}`;
    lines.push(`${cls} {`);
    lines.push(`  width: ${p.w}px;`);
    lines.push(`  height: ${p.h}px;`);
    lines.push(`  background-position: -${p.x}px -${p.y}px;`);
    lines.push(`}`);
  }

  return `${lines.join("\n")}\n`;
}

/* ---------------- helpers ---------------- */

function numOrEmpty(v: string): number | "" {
  const n = Number(v);
  return Number.isNaN(n) ? "" : n;
}

function sanitizeName(name: string) {
  return name.replace(/\s+/g, "-").toLowerCase();
}

function cryptoRandom() {
  if ("randomUUID" in crypto) return (crypto as any).randomUUID();
  return Math.random().toString(36).slice(2);
}

function fillBackground(canvas: HTMLCanvasElement, color: string) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const _img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.globalCompositeOperation = "destination-over";
  ctx.fillStyle = color || "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

function loadImageMeta(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = url;
  });
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
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Failed to encode sprite"))), mime, q);
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
