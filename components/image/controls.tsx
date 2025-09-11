"use client";

import { Crop, Link2, Palette } from "lucide-react";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

export type FitMode = "contain" | "cover";
export type OutFormat = "keep" | "jpeg" | "png" | "webp";

/* ---------------- Dimensions ---------------- */
export function DimControls({
  imgLoaded,
  locked,
  onToggleLocked,
  w,
  h,
  onW,
  onH,
  scale,
  onScale,
  fit,
  onFit,
}: {
  imgLoaded: boolean;
  locked: boolean;
  onToggleLocked: (v: boolean) => void;
  w: number | "";
  h: number | "";
  onW: (n: number | "") => void;
  onH: (n: number | "") => void;
  scale: number | "";
  onScale: (n: number | "") => void;
  fit: FitMode;
  onFit: (v: FitMode) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="width">Width (px)</Label>
          <Input
            id="width"
            type="number"
            min={1}
            value={w}
            onChange={(e) => onW(numOrEmpty(e.target.value))}
            disabled={!imgLoaded}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="height">Height (px)</Label>
          <Input
            id="height"
            type="number"
            min={1}
            value={h}
            onChange={(e) => onH(numOrEmpty(e.target.value))}
            disabled={!imgLoaded}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Switch checked={locked} onCheckedChange={onToggleLocked} id="lock" />
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
            placeholder="e.g. 50"
            className="w-36"
            value={scale}
            onChange={(e) => onScale(numOrEmpty(e.target.value))}
            disabled={!imgLoaded}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Fit</Label>
        <div className="grid grid-cols-2 gap-3">
          <Select value={fit} onValueChange={(v: FitMode) => onFit(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select fit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="contain">Contain (no crop)</SelectItem>
              <SelectItem value="cover">Cover (fills, may crop)</SelectItem>
            </SelectContent>
          </Select>
          <div className="rounded-md border p-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Crop className="h-3.5 w-3.5" />
              <span>
                <span className="font-medium">Contain</span> centers;{" "}
                <span className="font-medium">Cover</span> fills (may crop).
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Format ---------------- */
export function FormatControls({
  fmt,
  onFmt,
  quality,
  onQuality,
  lossy,
  bg,
  onBg,
  showBgPicker,
}: {
  fmt: OutFormat;
  onFmt: (v: OutFormat) => void;
  quality: number;
  onQuality: (v: number) => void;
  lossy: boolean;
  bg: string;
  onBg: (v: string) => void;
  showBgPicker: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Output Format</Label>
        <Select value={fmt} onValueChange={(v: OutFormat) => onFmt(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Keep original" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="keep">Keep original</SelectItem>
            <SelectItem value="webp">WEBP (recommended)</SelectItem>
            <SelectItem value="jpeg">JPEG</SelectItem>
            <SelectItem value="png">PNG</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="quality" className={!lossy ? "text-muted-foreground" : undefined}>
            Quality {lossy ? "" : "(lossless)"}
          </Label>
          <span className="text-xs text-muted-foreground">{quality}</span>
        </div>
        <Slider
          id="quality"
          min={1}
          max={100}
          step={1}
          value={[quality]}
          onValueChange={([q]) => onQuality(q)}
          disabled={!lossy}
        />
      </div>

      {showBgPicker && (
        <div className="space-y-2">
          <Label htmlFor="bg" className="text-sm flex items-center gap-2">
            <Palette className="h-4 w-4" /> Background
          </Label>
          <div className="flex items-center gap-3">
            <Input
              id="bg"
              type="color"
              className="h-9 w-16 p-1"
              value={bg}
              onChange={(e) => onBg(e.target.value)}
            />
            <Input
              aria-label="Background hex"
              value={bg}
              onChange={(e) => onBg(e.target.value)}
              className="w-36"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Target size ---------------- */
export function TargetSizeControl({
  unit,
  onUnit,
  value,
  onValue,
}: {
  unit: "KB" | "MB";
  onUnit: (v: "KB" | "MB") => void;
  value: number | "";
  onValue: (n: number | "") => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="target">Target Size (optional)</Label>
      <div className="flex items-center gap-2">
        <Input
          id="target"
          type="number"
          min={1}
          placeholder="e.g. 180"
          className="w-36"
          value={value}
          onChange={(e) => onValue(numOrEmpty(e.target.value))}
        />
        <Select value={unit} onValueChange={(v: "KB" | "MB") => onUnit(v)}>
          <SelectTrigger className="w-28">
            <SelectValue placeholder="KB" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="KB">KB</SelectItem>
            <SelectItem value="MB">MB</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

/* helper */
function numOrEmpty(v: string): number | "" {
  const n = Number(v);
  return Number.isNaN(n) ? "" : n;
}
