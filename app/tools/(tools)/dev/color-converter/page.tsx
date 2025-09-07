"use client";

import {
  Contrast as ContrastIcon,
  Copy,
  Download,
  Droplet,
  Pipette as EyeDropperIcon,
  Blend as Gradient,
  Layers,
  Palette,
  RefreshCw,
  Shuffle,
} from "lucide-react";
import * as React from "react";
import { ColorField } from "@/components/shared/color-field";
import { InputField } from "@/components/shared/form-fields/input-field";
import { Button } from "@/components/ui/button";
import { GlassCard, MotionGlassCard } from "@/components/ui/glass-card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/* --------------------------------- types --------------------------------- */

type RGB = { r: number; g: number; b: number };
type HSL = { h: number; s: number; l: number };
type HSV = { h: number; s: number; v: number };
type CMYK = { c: number; m: number; y: number; k: number };

/* ------------------------------- utilities ------------------------------- */

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const round = (n: number, p = 0) => Math.round(n * 10 ** p) / 10 ** p;
const HEX_RX = /^#?([\da-f]{3}|[\da-f]{6}|[\da-f]{8})$/i;
const RGB_CSV_RX =
  /^\s*rgba?\s*\(\s*([+-]?\d+(?:\.\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?)\s*(?:,\s*([+-]?\d*(?:\.\d+)?)\s*)?\)\s*$/i;
const HSL_CSV_RX =
  /^\s*hsla?\s*\(\s*([+-]?\d+(?:\.\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?)%\s*,\s*([+-]?\d+(?:\.\d+)?)%\s*(?:,\s*([+-]?\d*(?:\.\d+)?)\s*)?\)\s*$/i;
const HSV_CSV_RX =
  /^\s*hsva?\s*\(\s*([+-]?\d+(?:\.\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?)%\s*,\s*([+-]?\d+(?:\.\d+)?)%\s*(?:,\s*([+-]?\d*(?:\.\d+)?)\s*)?\)\s*$/i;

function hexToRgb(hex: string): RGB | null {
  const m = HEX_RX.exec(hex.trim());
  if (!m) return null;
  let h = m[1]!.toLowerCase();
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  if (h.length === 8) h = h.slice(2); // ignore alpha part if present
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function rgbToHex({ r, g, b }: RGB) {
  return (
    "#" + [r, g, b].map((x) => clamp(Math.round(x), 0, 255).toString(16).padStart(2, "0")).join("")
  );
}

function rgbToHsl({ r, g, b }: RGB): HSL {
  const R = r / 255,
    G = g / 255,
    B = b / 255;
  const max = Math.max(R, G, B),
    min = Math.min(R, G, B);
  let h = 0,
    s = 0,
    l = (max + min) / 2;
  const d = max - min;
  if (d) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case R:
        h = 60 * (((G - B) / d) % 6);
        break;
      case G:
        h = 60 * ((B - R) / d + 2);
        break;
      case B:
        h = 60 * ((R - G) / d + 4);
        break;
    }
  }
  if (h < 0) h += 360;
  return { h, s: s * 100, l: l * 100 };
}
function hslToRgb({ h, s, l }: HSL): RGB {
  const S = clamp(s, 0, 100) / 100;
  const L = clamp(l, 0, 100) / 100;
  const C = (1 - Math.abs(2 * L - 1)) * S;
  const X = C * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = L - C / 2;
  let r1 = 0,
    g1 = 0,
    b1 = 0;
  if (0 <= h && h < 60) [r1, g1, b1] = [C, X, 0];
  else if (60 <= h && h < 120) [r1, g1, b1] = [X, C, 0];
  else if (120 <= h && h < 180) [r1, g1, b1] = [0, C, X];
  else if (180 <= h && h < 240) [r1, g1, b1] = [0, X, C];
  else if (240 <= h && h < 300) [r1, g1, b1] = [X, 0, C];
  else [r1, g1, b1] = [C, 0, X];
  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

function rgbToHsv({ r, g, b }: RGB): HSV {
  const R = r / 255,
    G = g / 255,
    B = b / 255;
  const max = Math.max(R, G, B),
    min = Math.min(R, G, B);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    switch (max) {
      case R:
        h = 60 * (((G - B) / d) % 6);
        break;
      case G:
        h = 60 * ((B - R) / d + 2);
        break;
      case B:
        h = 60 * ((R - G) / d + 4);
        break;
    }
  }
  if (h < 0) h += 360;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  return { h, s: s * 100, v: v * 100 };
}
function hsvToRgb({ h, s, v }: HSV): RGB {
  const S = clamp(s, 0, 100) / 100;
  const V = clamp(v, 0, 100) / 100;
  const C = V * S;
  const X = C * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = V - C;
  let r1 = 0,
    g1 = 0,
    b1 = 0;
  if (0 <= h && h < 60) [r1, g1, b1] = [C, X, 0];
  else if (60 <= h && h < 120) [r1, g1, b1] = [X, C, 0];
  else if (120 <= h && h < 180) [r1, g1, b1] = [0, C, X];
  else if (180 <= h && h < 240) [r1, g1, b1] = [0, X, C];
  else if (240 <= h && h < 300) [r1, g1, b1] = [X, 0, C];
  else [r1, g1, b1] = [C, 0, X];
  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

function rgbToCmyk({ r, g, b }: RGB): CMYK {
  const R = r / 255,
    G = g / 255,
    B = b / 255;
  const k = 1 - Math.max(R, G, B);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  const c = (1 - R - k) / (1 - k);
  const m = (1 - G - k) / (1 - k);
  const y = (1 - B - k) / (1 - k);
  return { c: c * 100, m: m * 100, y: y * 100, k: k * 100 };
}

function contrastOn({ r, g, b }: RGB) {
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}
function withAlphaHex(hex: string, a: number) {
  const alpha = clamp(Math.round(a * 255), 0, 255)
    .toString(16)
    .padStart(2, "0");
  return `#${alpha}${hex.replace(/^#/, "")}`.toLowerCase();
}
function copy(text: string) {
  navigator.clipboard.writeText(text);
}

function luminance({ r, g, b }: RGB) {
  const toLin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const R = toLin(r),
    G = toLin(g),
    B = toLin(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}
function contrastRatio(a: RGB, b: RGB) {
  const L1 = luminance(a),
    L2 = luminance(b);
  const [hi, lo] = L1 >= L2 ? [L1, L2] : [L2, L1];
  return (hi + 0.05) / (lo + 0.05);
}
function wcagBadge(ratio: number) {
  // returns {normal, large}
  const normal = ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : "Fail";
  const large = ratio >= 4.5 ? "AAA" : ratio >= 3 ? "AA" : "Fail";
  return { normal, large };
}

/* parse any input string (hex/rgb/hsl/hsv) -> RGB, alpha */
function parseColor(input: string): { rgb: RGB; a: number } | null {
  const s = input.trim();

  const mh = HEX_RX.exec(s);
  if (mh) {
    if (mh[1]!.length === 8) {
      const a = parseInt(mh[1]!.slice(0, 2), 16) / 255;
      const rgb = hexToRgb("#" + mh[1]!.slice(2));
      return rgb ? { rgb, a } : null;
    }
    const rgb = hexToRgb(s.startsWith("#") ? s : "#" + s);
    return rgb ? { rgb, a: 1 } : null;
  }

  const mr = RGB_CSV_RX.exec(s);
  if (mr) {
    const r = clamp(parseFloat(mr[1]!), 0, 255);
    const g = clamp(parseFloat(mr[2]!), 0, 255);
    const b = clamp(parseFloat(mr[3]!), 0, 255);
    const a = mr[4] != null ? clamp(parseFloat(mr[4]!), 0, 1) : 1;
    return { rgb: { r, g, b }, a };
  }

  const mhsl = HSL_CSV_RX.exec(s);
  if (mhsl) {
    const h = ((parseFloat(mhsl[1]!) % 360) + 360) % 360;
    const ss = clamp(parseFloat(mhsl[2]!), 0, 100);
    const ll = clamp(parseFloat(mhsl[3]!), 0, 100);
    const a = mhsl[4] != null ? clamp(parseFloat(mhsl[4]!), 0, 1) : 1;
    const rgb = hslToRgb({ h, s: ss, l: ll });
    return { rgb, a };
  }

  const mhsv = HSV_CSV_RX.exec(s);
  if (mhsv) {
    const h = ((parseFloat(mhsv[1]!) % 360) + 360) % 360;
    const ss = clamp(parseFloat(mhsv[2]!), 0, 100);
    const vv = clamp(parseFloat(mhsv[3]!), 0, 100);
    const a = mhsv[4] != null ? clamp(parseFloat(mhsv[4]!), 0, 1) : 1;
    const rgb = hsvToRgb({ h, s: ss, v: vv });
    return { rgb, a };
  }

  return null;
}

function randomHex() {
  const n = Math.floor(Math.random() * 0xffffff);
  return "#" + n.toString(16).padStart(6, "0");
}

/* ---------------------------------- Page ---------------------------------- */

const RECENT_KEY = "toolshub.color.recent";

export default function ColorConverterPage() {
  // single source of truth
  const [rgb, setRgb] = React.useState<RGB>({ r: 30, g: 144, b: 255 });
  const [alpha, setAlpha] = React.useState(1);

  // derived formats
  const hex = React.useMemo(() => rgbToHex(rgb), [rgb]);
  const hsl = React.useMemo(() => rgbToHsl(rgb), [rgb]);
  const hsv = React.useMemo(() => rgbToHsv(rgb), [rgb]);
  const cmyk = React.useMemo(() => rgbToCmyk(rgb), [rgb]);

  // text mirrors
  const [hexInput, setHexInput] = React.useState(hex);
  const [rgbInput, setRgbInput] = React.useState(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
  const [hslInput, setHslInput] = React.useState(
    `hsl(${round(hsl.h)}, ${round(hsl.s)}%, ${round(hsl.l)}%)`,
  );
  const [hsvInput, setHsvInput] = React.useState(
    `hsv(${round(hsv.h)}, ${round(hsv.s)}%, ${round(hsv.v)}%)`,
  );

  React.useEffect(() => {
    setHexInput(hex);
    setRgbInput(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
    setHslInput(`hsl(${round(hsl.h)}, ${round(hsl.s)}%, ${round(hsl.l)}%)`);
    setHsvInput(`hsv(${round(hsv.h)}, ${round(hsv.s)}%, ${round(hsv.v)}%)`);
  }, [hex, rgb, hsl.h, hsl.s, hsl.l, hsv.h, hsv.s, hsv.v]);

  // recent colors
  const [recent, setRecent] = React.useState<string[]>([]);
  React.useEffect(() => {
    try {
      const r = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
      if (Array.isArray(r)) setRecent(r);
    } catch {}
  }, []);
  React.useEffect(() => {
    const id = setTimeout(() => {
      try {
        const next = [hex, ...recent.filter((h) => h !== hex)].slice(0, 12);
        setRecent(next);
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {}
    }, 120);
    return () => clearTimeout(id);
  }, [hex]); // eslint-disable-line react-hooks/exhaustive-deps

  // gradient builder
  const [gradHex, setGradHex] = React.useState("#ffffff");
  const gradRgb = React.useMemo(() => hexToRgb(gradHex) ?? { r: 255, g: 255, b: 255 }, [gradHex]);
  const [angle, setAngle] = React.useState(90);

  // contrast checker
  const [bgHex, setBgHex] = React.useState("#000000");
  const [fgHex, setFgHex] = React.useState("#ffffff");
  const bgRgb = React.useMemo(() => hexToRgb(bgHex) ?? { r: 0, g: 0, b: 0 }, [bgHex]);
  const fgRgb = React.useMemo(() => hexToRgb(fgHex) ?? { r: 255, g: 255, b: 255 }, [fgHex]);
  const ratio = React.useMemo(() => round(contrastRatio(bgRgb, fgRgb), 2), [bgRgb, fgRgb]);
  const wcag = React.useMemo(() => wcagBadge(ratio), [ratio]);

  // palette (tints & shades)
  const shades = React.useMemo(() => {
    const base = rgbToHsl(rgb);
    return new Array(10).fill(0).map((_, i) => {
      const l = clamp(base.l - 40 + i * (80 / 9), 0, 100);
      const col = hslToRgb({ h: base.h, s: base.s, l });
      return { rgb: col, hex: rgbToHex(col) };
    });
  }, [rgb]);

  const bg = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  const fg = contrastOn(rgb);

  const exportPaletteAsCSS = () => {
    const body =
      `:root{\n` + shades.map((s, i) => `  --color-${(i + 1) * 100}: ${s.hex};`).join("\n") + `\n}`;
    copy(body);
  };

  const exportPaletteAsJSON = () => {
    copy(
      JSON.stringify(
        shades.map((s) => s.hex),
        null,
        2,
      ),
    );
  };

  const reset = () => {
    setRgb({ r: 30, g: 144, b: 255 });
    setAlpha(1);
    setGradHex("#ffffff");
    setAngle(90);
  };

  return (
    <MotionGlassCard className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <GlassCard className="mb-6 px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <Palette className="h-6 w-6" /> Color Converter
            </h1>
            <p className="text-sm text-muted-foreground">
              Convert HEX ↔ RGB ↔ HSL (+HSV, CMYK), eyedropper, contrast checker, harmonies,
              gradient builder, and exportable palettes.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2" onClick={reset}>
              <RefreshCw className="h-4 w-4" /> Reset
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() =>
                copy(
                  JSON.stringify(
                    {
                      hex,
                      rgba: { r: rgb.r, g: rgb.g, b: rgb.b, a: round(alpha, 2) },
                      hsl: { h: round(hsl.h), s: round(hsl.s), l: round(hsl.l) },
                      hsv: { h: round(hsv.h), s: round(hsv.s), v: round(hsv.v) },
                      cmyk: {
                        c: round(cmyk.c),
                        m: round(cmyk.m),
                        y: round(cmyk.y),
                        k: round(cmyk.k),
                      },
                    },
                    null,
                    2,
                  ),
                )
              }
            >
              <Copy className="h-4 w-4" /> Copy JSON
            </Button>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_1fr]">
        {/* LEFT: Inputs */}
        <GlassCard className="shadow-sm">
          <div className="grid gap-4 p-4">
            {/* picker & hex */}
            <ColorField
              id="main"
              value={hex}
              onChange={(v) => {
                const rgbNew = hexToRgb(v);
                if (rgbNew) setRgb(rgbNew);
              }}
              labelNode={
                <div className="flex items-center gap-2">
                  <Droplet className="h-4 w-4" />
                  <span>Pick & HEX</span>
                </div>
              }
            />

            {/* Row: alpha + quick actions */}
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
              <div className="space-y-2">
                <Label htmlFor="alpha">Alpha</Label>
                <div className="flex items-center gap-3">
                  <input
                    id="alpha"
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round(alpha * 100)}
                    onChange={(e) => setAlpha(Number(e.target.value) / 100)}
                    className="w-full"
                  />
                  <span className="w-12 text-right text-sm tabular-nums">
                    {Math.round(alpha * 100)}%
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                className="gap-2"
                onClick={async () => {
                  // Eyedropper API (if available)
                  const AnyWin = window as any;
                  if (AnyWin.EyeDropper) {
                    try {
                      const result = await new AnyWin.EyeDropper().open();
                      const rgbNew = hexToRgb(result.sRGBHex);
                      if (rgbNew) setRgb(rgbNew);
                    } catch {}
                  } else {
                    alert("Eyedropper not supported in this browser.");
                  }
                }}
              >
                <EyeDropperIcon className="h-4 w-4" /> Eyedropper
              </Button>

              <Button
                variant="outline"
                className="gap-2"
                onClick={() => {
                  const h = randomHex();
                  const rgbNew = hexToRgb(h);
                  if (rgbNew) setRgb(rgbNew);
                }}
              >
                <Shuffle className="h-4 w-4" /> Random
              </Button>

              <Button
                variant="outline"
                className="gap-2"
                onClick={() => copy(alpha < 1 ? withAlphaHex(hex, alpha) : hex)}
              >
                <Copy className="h-4 w-4" /> Copy HEX
              </Button>
            </div>

            {/* Text inputs */}
            <div className="grid gap-3 md:grid-cols-2">
              <InputField
                id="hex-text"
                label="HEX"
                placeholder="#1e90ff or #AARRGGBB"
                value={hexInput}
                onChange={(v) => {
                  setHexInput(v);
                  const parsed = parseColor(v);
                  if (parsed) {
                    setRgb(parsed.rgb);
                    if (HEX_RX.test(v) && v.replace("#", "").length === 8) setAlpha(parsed.a);
                  }
                }}
                rightSlot={
                  <CopyBtn onClick={() => copy(alpha < 1 ? withAlphaHex(hex, alpha) : hex)} />
                }
                inputClassName="font-mono"
              />

              <InputField
                id="rgb-text"
                label="RGB / RGBA"
                placeholder="rgb(30, 144, 255) or rgba(30,144,255,0.6)"
                value={rgbInput}
                onChange={(v) => {
                  setRgbInput(v);
                  const parsed = parseColor(v);
                  if (parsed) setRgb(parsed.rgb);
                }}
                rightSlot={
                  <CopyBtn
                    onClick={() =>
                      copy(
                        alpha < 1
                          ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${round(alpha, 2)})`
                          : `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
                      )
                    }
                  />
                }
                inputClassName="font-mono"
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <InputField
                id="hsl-text"
                label="HSL / HSLA"
                placeholder="hsl(210, 100%, 56%) or hsla(210,100%,56%,0.6)"
                value={hslInput}
                onChange={(v) => {
                  setHslInput(v);
                  const parsed = parseColor(v);
                  if (parsed) setRgb(parsed.rgb);
                }}
                rightSlot={
                  <CopyBtn
                    onClick={() =>
                      copy(
                        alpha < 1
                          ? `hsla(${round(hsl.h)}, ${round(hsl.s)}%, ${round(hsl.l)}%, ${round(
                              alpha,
                              2,
                            )})`
                          : `hsl(${round(hsl.h)}, ${round(hsl.s)}%, ${round(hsl.l)}%)`,
                      )
                    }
                  />
                }
                inputClassName="font-mono"
              />

              <InputField
                id="hsv-text"
                label="HSV"
                placeholder="hsv(210, 88%, 100%)"
                value={hsvInput}
                onChange={(v) => {
                  setHsvInput(v);
                  const parsed = parseColor(v);
                  if (parsed) setRgb(parsed.rgb);
                }}
                rightSlot={
                  <CopyBtn
                    onClick={() => copy(`hsv(${round(hsv.h)}, ${round(hsv.s)}%, ${round(hsv.v)}%)`)}
                  />
                }
                inputClassName="font-mono"
              />
            </div>

            {/* CMYK (display only) */}
            <StatRow
              label="CMYK"
              value={`cmyk(${round(cmyk.c)}%, ${round(cmyk.m)}%, ${round(cmyk.y)}%, ${round(cmyk.k)}%)`}
              onCopy={() =>
                copy(
                  `cmyk(${round(cmyk.c)}%, ${round(cmyk.m)}%, ${round(cmyk.y)}%, ${round(
                    cmyk.k,
                  )}%)`,
                )
              }
            />

            {/* Paste any color */}
            <InputField
              id="any"
              label="Paste any color"
              placeholder="#09f, rgb(0,153,255), hsl(200,100%,50%), hsla(...), rgba(...), hsv(...), #AARRGGBB"
              value={""}
              onChange={() => {}}
              rightSlot={
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={async () => {
                    const clip = await navigator.clipboard.readText();
                    const parsed = parseColor(clip);
                    if (parsed) {
                      setRgb(parsed.rgb);
                      setAlpha(parsed.a);
                    }
                  }}
                >
                  <Copy className="h-4 w-4" /> Paste & Convert
                </Button>
              }
              inputProps={{ readOnly: true }}
            />

            {/* Recent */}
            {recent.length > 0 && (
              <div className="space-y-2">
                <Label>Recent</Label>
                <div className="flex flex-wrap gap-2">
                  {recent.map((h) => (
                    <button
                      key={h}
                      title={h}
                      className="h-8 w-8 rounded-md border"
                      style={{ background: h }}
                      onClick={() => {
                        const rgbNew = hexToRgb(h);
                        if (rgbNew) setRgb(rgbNew);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </GlassCard>

        {/* RIGHT: Preview, palette, tools */}
        <GlassCard className="shadow-sm">
          <div className="grid gap-4 p-4">
            {/* Preview & format quick copies */}
            <div className="rounded-xl border overflow-hidden">
              <div
                className="h-44 w-full"
                style={{
                  background: bg,
                  backgroundImage:
                    "linear-gradient(45deg, rgba(0,0,0,.06) 25%, transparent 25%), linear-gradient(-45deg, rgba(0,0,0,.06) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(0,0,0,.06) 75%), linear-gradient(-45deg, transparent 75%, rgba(0,0,0,.06) 75%)",
                  backgroundSize: "20px 20px",
                  backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                }}
              />
              <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2">
                <StatRow label="HEX" value={hex} onCopy={() => copy(hex)} />
                <StatRow
                  label="HEX with alpha"
                  value={withAlphaHex(hex, alpha)}
                  onCopy={() => copy(withAlphaHex(hex, alpha))}
                />
                <StatRow
                  label="RGB"
                  value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`}
                  onCopy={() => copy(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)}
                />
                <StatRow
                  label="HSL"
                  value={`hsl(${round(hsl.h)}, ${round(hsl.s)}%, ${round(hsl.l)}%)`}
                  onCopy={() => copy(`hsl(${round(hsl.h)}, ${round(hsl.s)}%, ${round(hsl.l)}%)`)}
                />
              </div>
            </div>

            <Separator />

            {/* Contrast checker */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <ContrastIcon className="h-4 w-4" /> Contrast Checker
                </Label>
                <div className="text-xs text-muted-foreground">
                  Ratio: <b>{ratio}:1</b> • Normal: <b>{wcag.normal}</b> • Large:{" "}
                  <b>{wcag.large}</b>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <ColorField id="bg" label="Background" value={bgHex} onChange={setBgHex} />
                <ColorField id="fg" label="Foreground" value={fgHex} onChange={setFgHex} />
              </div>
              <div className="rounded-lg border p-4" style={{ background: bgHex, color: fgHex }}>
                <div className="text-xl font-semibold">The quick brown fox jumps</div>
                <div className="text-sm opacity-80">
                  Large text preview — ensure at least AA for readability.
                </div>
              </div>
            </div>

            <Separator />

            {/* Gradient builder */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Gradient className="h-4 w-4" /> Gradient Builder
                </Label>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={() =>
                    copy(`background: linear-gradient(${angle}deg, ${hex} 0%, ${gradHex} 100%);`)
                  }
                >
                  <Copy className="h-4 w-4" /> Copy CSS
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <ColorField id="grad" label="End color" value={gradHex} onChange={setGradHex} />
                <div className="space-y-2">
                  <Label htmlFor="angle">Angle</Label>
                  <div className="flex items-center gap-3">
                    <input
                      id="angle"
                      type="range"
                      min={0}
                      max={360}
                      value={angle}
                      onChange={(e) => setAngle(Number(e.target.value))}
                      className="w-full"
                    />
                    <span className="w-12 text-right text-sm">{angle}°</span>
                  </div>
                </div>
              </div>
              <div
                className="h-24 w-full rounded-lg border"
                style={{ background: `linear-gradient(${angle}deg, ${hex}, ${gradHex})` }}
              />
            </div>

            <Separator />

            {/* Palette */}
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Layers className="h-4 w-4" /> Palette (tints & shades)
              </Label>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="gap-2" onClick={exportPaletteAsJSON}>
                  <Copy className="h-4 w-4" /> Copy JSON
                </Button>
                <Button size="sm" variant="outline" className="gap-2" onClick={exportPaletteAsCSS}>
                  <Copy className="h-4 w-4" /> Copy CSS vars
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
              {shades.map(({ hex: h }, i) => (
                <div key={i} className="group">
                  <button
                    className="h-10 w-full rounded-md border transition hover:ring-2 hover:ring-primary"
                    style={{ backgroundColor: h }}
                    title={h}
                    onClick={() => copy(h)}
                  />
                  <div className="pointer-events-none mt-1 select-none text-center text-[11px] text-muted-foreground">
                    {i + 1}
                  </div>
                </div>
              ))}
            </div>

            {/* Harmonies */}
            <Separator />
            <Harmonies base={rgb} />
          </div>
        </GlassCard>
      </div>
    </MotionGlassCard>
  );
}

/* ------------------------------- components ------------------------------- */

function CopyBtn({ onClick }: { onClick: () => void }) {
  const [ok, setOk] = React.useState(false);
  return (
    <Button
      size="sm"
      variant="outline"
      className="gap-2"
      onClick={() => {
        onClick();
        setOk(true);
        setTimeout(() => setOk(false), 900);
      }}
      aria-label="Copy"
    >
      <Copy className="h-4 w-4" />
      {ok ? "Copied" : "Copy"}
    </Button>
  );
}

function StatRow({ label, value, onCopy }: { label: string; value: string; onCopy: () => void }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
      <div className="min-w-[140px] text-xs text-muted-foreground">{label}</div>
      <div className="flex-1 truncate font-mono text-sm">{value}</div>
      <Button size="sm" variant="outline" className="gap-2" onClick={onCopy}>
        <Copy className="h-4 w-4" /> Copy
      </Button>
    </div>
  );
}

function Harmonies({ base }: { base: RGB }) {
  const hsl = rgbToHsl(base);
  const toHex = (h: number, s = hsl.s, l = hsl.l) =>
    rgbToHex(hslToRgb({ h: ((h % 360) + 360) % 360, s, l }));

  const groups: { title: string; colors: string[] }[] = [
    { title: "Complementary", colors: [toHex(hsl.h), toHex(hsl.h + 180)] },
    { title: "Analogous", colors: [toHex(hsl.h - 30), toHex(hsl.h), toHex(hsl.h + 30)] },
    { title: "Triadic", colors: [toHex(hsl.h), toHex(hsl.h + 120), toHex(hsl.h + 240)] },
    {
      title: "Tetradic",
      colors: [toHex(hsl.h), toHex(hsl.h + 90), toHex(hsl.h + 180), toHex(hsl.h + 270)],
    },
  ];

  return (
    <div className="grid gap-3">
      <Label className="flex items-center gap-2">
        <Palette className="h-4 w-4" /> Harmonies
      </Label>
      {groups.map((g) => (
        <div key={g.title} className="rounded-lg border p-3">
          <div className="mb-2 text-xs text-muted-foreground">{g.title}</div>
          <div className="flex flex-wrap gap-2">
            {g.colors.map((c) => (
              <button
                key={c}
                className="h-8 w-8 rounded-md border"
                style={{ background: c }}
                title={c}
                onClick={() => copy(c)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
