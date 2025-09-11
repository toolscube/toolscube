"use client";
import {
  ActivitySquare,
  CloudDownload,
  Crop,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Images,
  Link2,
  Loader2,
  Palette,
  SlidersHorizontal,
} from "lucide-react";
import * as React from "react";
import { ImageDropzone } from "@/components/image/image-dropzone";
import { ImagePreview, InfoPill } from "@/components/image/image-preview-meta";
import { ActionButton, ResetButton } from "@/components/shared/action-buttons";
import InputField from "@/components/shared/form-fields/input-field";
import SelectField from "@/components/shared/form-fields/select-field";
import { OutputPreview } from "@/components/shared/output-preview";
import { ProcessLog } from "@/components/shared/process-log";
import { Range } from "@/components/shared/range";
import ToolPageHeader from "@/components/shared/tool-page-header";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { useAutoPreview } from "@/hooks/use-auto-preview";
import { useImageInput } from "@/hooks/use-image-input";
import {
  browserSupportsMime,
  detectHasAlpha,
  type FitMode,
  formatBytes,
  type OutFormat,
  resizeImage,
  suggestName,
  triggerDownload,
} from "@/lib/canvas";

export default function ImageConvertClient() {
  const [fmt, setFmt] = React.useState<OutFormat>("webp");
  const [quality, setQuality] = React.useState(90);
  const [bg, setBg] = React.useState("#ffffff");
  const [running, setRunning] = React.useState(false);
  const [log, setLog] = React.useState("");

  const [checker, setChecker] = React.useState(true);
  const [hasAlpha, setHasAlpha] = React.useState<boolean | null>(null);

  const [enableResize, setEnableResize] = React.useState(false);
  const [locked, setLocked] = React.useState(true);
  const [fit, setFit] = React.useState<FitMode>("contain");
  const [w, setW] = React.useState<number | "">("");
  const [h, setH] = React.useState<number | "">("");

  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [bright, setBright] = React.useState(100);
  const [contrast, setContrast] = React.useState(100);
  const [saturate, setSaturate] = React.useState(100);

  const [avifOk, setAvifOk] = React.useState<boolean | null>(null);

  const { img, getRootProps, getInputProps, isDragActive, setImg } = useImageInput({
    onImage: async (im) => {
      setHasAlpha(await detectHasAlpha(im.url));
      setFmt(im.file.type.includes("png") ? "png" : "webp");
      setW(im.width);
      setH(im.height);
      setEnableResize(false);
      setLog(`Loaded ${im.file.name} (${formatBytes(im.size ?? im.file.size)})`);
    },
  });

  React.useEffect(() => {
    (async () => setAvifOk(await browserSupportsMime("image/avif")))();
  }, []);

  React.useEffect(() => {
    if (!img) return;
    if (locked && typeof w === "number" && document.activeElement?.id === "width") {
      setH(Math.max(1, Math.round((w * img.height) / img.width)));
    }
    if (locked && typeof h === "number" && document.activeElement?.id === "height") {
      setW(Math.max(1, Math.round((h * img.width) / img.height)));
    }
  }, [w, h, locked, img]);

  const filterCss = React.useMemo(
    () =>
      filtersOpen ? `brightness(${bright}%) contrast(${contrast}%) saturate(${saturate}%)` : "",
    [filtersOpen, bright, contrast, saturate],
  );

  const numOrEmpty = (v: string): number | "" => {
    const n = Number(v);
    return Number.isNaN(n) ? "" : n;
  };

  function resetAll() {
    setImg(null);
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

  // Auto Preview
  const { previewUrl, previewSize, previewBusy } = useAutoPreview(
    [img?.url, fmt, quality, bg, enableResize, w, h, fit, filtersOpen, bright, contrast, saturate],
    async () => {
      if (!img) return null;
      const outW = enableResize && typeof w === "number" ? w : img.width;
      const outH = enableResize && typeof h === "number" ? h : img.height;
      const blob = (
        await resizeImage({
          srcUrl: img.url,
          srcW: img.width,
          srcH: img.height,
          outW,
          outH,
          fit,
          format: fmt,
          quality,
          background: fmt === "jpeg" && hasAlpha ? bg : undefined,
          filterCss,
        })
      ).blob;
      return blob;
    },
    350,
  );

  async function run() {
    if (!img) return;
    try {
      setRunning(true);
      const outW = enableResize && typeof w === "number" ? w : img.width;
      const outH = enableResize && typeof h === "number" ? h : img.height;

      const { blob } = await resizeImage({
        srcUrl: img.url,
        srcW: img.width,
        srcH: img.height,
        outW,
        outH,
        fit,
        format: fmt,
        quality,
        background: fmt === "jpeg" && hasAlpha ? bg : undefined,
        filterCss,
      });

      const filename = suggestName(img.file.name, enableResize ? "resized" : "converted", fmt);
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

  const lossy = fmt !== "png";

  return (
    <>
      <ToolPageHeader
        icon={Images}
        title="Image Converter"
        description="Convert between PNG, JPEG, WEBP, AVIF (auto-preview)."
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

      {/* Input */}
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
            subtitle="PNG, JPEG, WEBP, GIF, SVG (GIF/SVG rasterized)"
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
          </div>
        </CardContent>
      </GlassCard>

      <Separator className="my-4" />

      {/* Settings */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Settings</CardTitle>
          <CardDescription>
            Format, quality, optional resize & filters (live preview).
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <SelectField
              className="w-fit"
              label="Format"
              description="AVIF/WEBP is usually the smallest; PNG is good for UI/graphics."
              value={fmt}
              onValueChange={(v) => setFmt(v as OutFormat)}
              options={[
                { value: "webp", label: "WEBP (recommended)" },
                { value: "jpeg", label: "JPEG" },
                { value: "png", label: "PNG" },
                { value: "avif", label: "AVIF" },
              ]}
            />

            {lossy && (
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
                <p className="text-xs text-muted-foreground">High quality = large file.</p>
              </div>
            )}

            {fmt === "jpeg" && hasAlpha && (
              <div className="space-y-2">
                <Label htmlFor="bg" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" /> Background (fill transparency)
                </Label>
                <div className="flex items-center gap-3">
                  <InputField
                    id="bg"
                    type="color"
                    className="h-9 w-16 p-1"
                    value={bg}
                    onChange={(e) => setBg(e.target.value)}
                  />
                  <InputField
                    aria-label="Background hex"
                    value={bg}
                    onChange={(e) => setBg(e.target.value)}
                    className="w-36"
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            )}

            {/* quick presets */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Small web", fmt: "webp", quality: 70 },
                { label: "Balanced", fmt: "webp", quality: 85 },
                { label: "High quality", fmt: "jpeg", quality: 92 },
                {
                  label: avifOk === false ? "AVIF" : "Ultra small",
                  fmt: "avif",
                  quality: 60,
                  disabled: avifOk === false,
                  title: avifOk === false ? "AVIF not supported in this browser" : "",
                },
              ].map(({ label, fmt, quality, disabled, title }) => (
                <Button
                  key={label}
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setFmt(fmt as OutFormat);
                    setQuality(quality);
                  }}
                  disabled={disabled}
                  title={title}
                >
                  {label}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-sm">
              <ActionButton
                size="sm"
                onClick={() => setChecker((v) => !v)}
                icon={checker ? Eye : EyeOff}
                label={`${checker ? "Hide" : "Show"} checkerboard`}
              />
            </div>
          </div>

          {/* Resize + Filters */}
          <div className="space-y-4">
            <div className="rounded-lg border p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Crop className="h-4 w-4" /> Resize while converting
                </div>
                <ActionButton
                  size="sm"
                  variant={enableResize ? "default" : "outline"}
                  onClick={() => setEnableResize((v) => !v)}
                  label={enableResize ? "Enabled" : "Disabled"}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <InputField
                  id="width"
                  type="number"
                  label="Width (px)"
                  min={1}
                  value={w}
                  onChange={(e) => setW(numOrEmpty(e.target.value))}
                  disabled={!img || !enableResize}
                />
                <InputField
                  id="height"
                  type="number"
                  label="Height (px)"
                  min={1}
                  value={h}
                  onChange={(e) => setH(numOrEmpty(e.target.value))}
                  disabled={!img || !enableResize}
                />
              </div>

              <div className="flex flex-wrap items-end gap-4">
                <ActionButton
                  size="sm"
                  icon={Link2}
                  label={locked ? "Locked" : "Unlocked"}
                  variant={locked ? "default" : "outline"}
                  onClick={() => setLocked((v) => !v)}
                />

                <SelectField
                  label="Fit"
                  value={fit}
                  onValueChange={(v) => setFit(v as FitMode)}
                  disabled={!enableResize}
                  placeholder="Select fit"
                  options={[
                    { value: "contain", label: "Contain (no crop)" },
                    { value: "cover", label: "Cover (may crop)" },
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ActivitySquare className="h-3.5 w-3.5" /> Fit:{" "}
                  <span className="ml-1 font-medium text-foreground">{fit}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-3.5 w-3.5" /> Format:{" "}
                  <span className="ml-1 font-medium text-foreground">{fmt.toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <SlidersHorizontal className="h-4 w-4" /> Filters (optional)
                </div>
                <ActionButton
                  size="sm"
                  label={filtersOpen ? "On" : "Off"}
                  variant={filtersOpen ? "default" : "outline"}
                  onClick={() => setFiltersOpen((v) => !v)}
                />
              </div>

              {filtersOpen && (
                <div className="space-y-3">
                  <Range label="Brightness" value={bright} onChange={setBright} />
                  <Range label="Contrast" value={contrast} onChange={setContrast} />
                  <Range label="Saturation" value={saturate} onChange={setSaturate} />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </GlassCard>

      <Separator className="my-4" />

      {/* Live Output Preview + Log */}
      <div className="grid gap-6 md:grid-cols-2">
        <OutputPreview
          title="Output Preview"
          description={previewBusy ? "Rendering preview…" : "Live preview of the converted image."}
          previewUrl={previewUrl}
          size={previewSize}
          formatLabel={fmt.toUpperCase()}
          checker={checker}
          tips={
            <ul className="list-disc pl-5 space-y-1">
              <li>Canvas re-encoding strips EXIF/metadata by default.</li>
              <li>Animated GIFs flatten to a single frame.</li>
              <li>
                Smallest sizes: try <b>AVIF/WEBP</b> and reduce dimensions.
              </li>
            </ul>
          }
        />

        <ProcessLog value={log} onClear={() => setLog("")} />
      </div>
    </>
  );
}
