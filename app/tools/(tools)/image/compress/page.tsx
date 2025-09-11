// app/tools/(tools)/image/compress/page.tsx
"use client";

import {
  ActivitySquare,
  CloudDownload,
  Crop,
  ImageDown,
  Image as ImageIcon,
  Link2,
  Loader2,
} from "lucide-react";
import * as React from "react";
import { useDropzone } from "react-dropzone";
// ✅ reusable controls
import {
  DimControls,
  type FitMode,
  FormatControls,
  type OutFormat,
  TargetSizeControl,
} from "@/components/image/controls";
import { ImageDropzone } from "@/components/image/image-dropzone";
import { ImagePreview, InfoPill } from "@/components/image/image-preview-meta";
import { ActionButton, ResetButton } from "@/components/shared/action-buttons";
import { ProcessLog } from "@/components/shared/process-log";
import ToolPageHeader from "@/components/shared/tool-page-header";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Separator } from "@/components/ui/separator";

// ✅ shared canvas utilities
import {
  type FitMode as BaseFitMode,
  type OutFormat as BaseOutFormat,
  canvasEncode,
  drawToCanvas,
  formatBytes,
  suggestName,
  triggerDownload,
} from "@/lib/canvas";
import { cn } from "@/lib/utils";

/* ------------------- types ------------------- */
interface LoadedImage {
  file: File;
  url: string;
  width: number;
  height: number;
  type: string;
  size: number;
}

/* ------------------- page ------------------- */
export default function ImageCompressPage() {
  const [img, setImg] = React.useState<LoadedImage | null>(null);

  // Resize controls
  const [locked, setLocked] = React.useState(true);
  const [fit, setFit] = React.useState<FitMode>("contain");
  const [scale, setScale] = React.useState<number | "">("");
  const [w, setW] = React.useState<number | "">("");
  const [h, setH] = React.useState<number | "">("");

  // Format/quality
  const [fmt, setFmt] = React.useState<OutFormat>("keep");
  const [quality, setQuality] = React.useState(80);
  const [bg, setBg] = React.useState("#ffffff");

  // Target size (optional)
  const [targetSize, setTargetSize] = React.useState<number | "">("");
  const [sizeUnit, setSizeUnit] = React.useState<"KB" | "MB">("KB");

  // UI
  const [running, setRunning] = React.useState(false);
  const [log, setLog] = React.useState("");

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
    setScale("");
    setFmt("keep");
    setQuality(80);
    setTargetSize("");
    setLog(`Loaded ${file.name} (${formatBytes(file.size)})`);
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

  // Aspect lock behavior
  React.useEffect(() => {
    if (!img) return;
    if (locked && typeof w === "number" && document.activeElement?.id === "width") {
      setH(Math.max(1, Math.round(w / ratio)));
    }
    if (locked && typeof h === "number" && document.activeElement?.id === "height") {
      setW(Math.max(1, Math.round(h * ratio)));
    }
  }, [w, h, ratio, locked, img]);

  // Scale → width/height
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
    setScale("");
    setW("");
    setH("");
    setFmt("keep");
    setQuality(80);
    setBg("#ffffff");
    setTargetSize("");
    setSizeUnit("KB");
    setRunning(false);
    setLog("");
  }

  async function run() {
    if (!img) return;

    try {
      setRunning(true);
      setLog("Compressing…");

      const actualFmt: Exclude<OutFormat, "keep"> = fmt === "keep" ? mimeToFmt(img.type) : fmt;
      const outW = typeof w === "number" ? w : img.width;
      const outH = typeof h === "number" ? h : img.height;
      const tgtBytes =
        targetSize === ""
          ? undefined
          : Math.max(1, Number(targetSize)) * (sizeUnit === "MB" ? 1024 * 1024 : 1024);

      // Draw to canvas using shared util
      const canvas = await drawToCanvas({
        srcUrl: img.url,
        srcW: img.width,
        srcH: img.height,
        outW,
        outH,
        fit: fit as BaseFitMode,
        background: actualFmt === "jpeg" ? bg : undefined,
      });

      // Encode (with optional target-size binary search)
      const blob =
        tgtBytes && actualFmt !== "png"
          ? await encodeToTargetBytes(canvas, toMime(actualFmt), tgtBytes, quality / 100)
          : await canvasEncode(canvas, actualFmt as BaseOutFormat, quality);

      const filename = suggestName(img.file.name, actualFmt as any);
      triggerDownload(blob, filename);
      setLog(
        `Done → ${filename} (${formatBytes(blob.size)}).${tgtBytes ? ` Target was ≤ ${formatBytes(tgtBytes)}.` : ""}`,
      );
    } catch (e: any) {
      setLog(`Error: ${e?.message || String(e)}`);
    } finally {
      setRunning(false);
    }
  }

  const lossy = fmt === "keep" && img ? !img.type.includes("png") : fmt !== "png";
  const imgLoaded = !!img;

  return (
    <>
      <ToolPageHeader
        icon={ImageDown}
        title="Image Compress"
        description="Shrink images for web & social. Drag & drop, paste (Ctrl/Cmd+V), or upload."
        actions={
          <>
            <ResetButton onClick={resetAll} />
            <ActionButton
              variant="default"
              label={running ? "Processing…" : "Compress & Download"}
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
            subtitle="PNG, JPEG, WEBP, GIF, SVG (GIF/SVG will be rasterized)"
          />
          <div className="grid gap-4">
            <ImagePreview
              url={img?.url}
              emptyNode={
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  <ImageIcon className="mr-2 h-4 w-4" /> No image selected
                </div>
              }
            />
            <div className="grid grid-cols-2 gap-3 text-xs">
              <InfoPill label="Source Size" value={img ? formatBytes(img.size) : "—"} />
              <InfoPill label="Source Type" value={img ? img.type || "—" : "—"} />
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

      {/* Settings (now using reusable controls) */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Settings</CardTitle>
          <CardDescription>
            Downscale (optional), pick output, and control size/quality.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-6 md:grid-cols-2">
          <DimControls
            imgLoaded={imgLoaded}
            locked={locked}
            onToggleLocked={setLocked}
            w={w}
            h={h}
            onW={setW}
            onH={setH}
            scale={scale}
            onScale={setScale}
            fit={fit}
            onFit={setFit}
          />

          <div className="space-y-4">
            <FormatControls
              fmt={fmt}
              onFmt={setFmt}
              quality={quality}
              onQuality={setQuality}
              lossy={lossy}
              bg={bg}
              onBg={setBg}
              showBgPicker={fmt === "jpeg" || (fmt === "keep" && img && img.type.includes("jpeg"))}
            />
            <TargetSizeControl
              unit={sizeUnit}
              onUnit={setSizeUnit}
              value={targetSize}
              onValue={setTargetSize}
            />
          </div>
        </CardContent>
      </GlassCard>

      <Separator className="my-4" />

      {/* Output & Log */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Output & Log</CardTitle>
          <CardDescription>Click Compress & Download to save the result.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <ActivitySquare className="h-4 w-4" /> Target Dimensions
              </span>
              <span className="font-medium">
                {typeof w === "number" && typeof h === "number" ? `${w} × ${h}px` : "—"}
              </span>
            </div>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
              <li>Canvas re-encoding strips EXIF/metadata by default.</li>
              <li>Animated GIFs will be flattened to a single frame.</li>
              <li>
                For the smallest size, try <b>WEBP</b> and reduce dimensions.
              </li>
            </ul>
          </div>

          <ProcessLog value={log} onClear={() => setLog("")} />
        </CardContent>
      </GlassCard>
    </>
  );
}

/* ------------------- helpers (local) ------------------- */

function numOrEmpty(v: string): number | "" {
  const n = Number(v);
  return Number.isNaN(n) ? "" : n;
}

function mimeToFmt(mime: string): Exclude<OutFormat, "keep"> {
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  return "jpeg";
}

function toMime(fmt: Exclude<OutFormat, "keep">) {
  return fmt === "png" ? "image/png" : fmt === "jpeg" ? "image/jpeg" : "image/webp";
}

function loadImageMeta(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = url;
  });
}

/** Binary-search encoder to hit a target size (lossy only) */
async function encodeToTargetBytes(
  canvas: HTMLCanvasElement,
  mime: string,
  targetBytes: number,
  initialQ: number, // 0..1
): Promise<Blob> {
  let lo = 0.05,
    hi = 1.0,
    best: Blob | null = null;
  let q = Math.max(lo, Math.min(hi, initialQ || 0.8));
  for (let i = 0; i < 8; i++) {
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), mime, q),
    );
    if (blob.size <= targetBytes) {
      best = blob;
      lo = q;
      q = (q + hi) / 2;
    } else {
      hi = q;
      q = (q + lo) / 2;
    }
  }
  return (
    best ??
    new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), mime, lo),
    )
  );
}
