"use client";

import {
  ActionButton,
  CopyButton,
  ResetButton,
} from "@/components/shared/action-buttons";
import ColorField from "@/components/shared/color-field";
import InputField from "@/components/shared/form-fields/input-field";
import ToolPageHeader from "@/components/shared/tool-page-header";
import { CardContent } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Contrast as ContrastIcon,
  Droplet,
  Pipette as EyeDropperIcon,
  Blend as Gradient,
  Layers,
  Palette,
  Shuffle,
} from "lucide-react";
import * as React from "react";

/* types */
type RGB = { r: number; g: number; b: number };
type HSL = { h: number; s: number; l: number };
type HSV = { h: number; s: number; v: number };
type CMYK = { c: number; m: number; y: number; k: number };

/* utilities */
const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));
const round = (n: number, p = 0) => Math.round(n * 10 ** p) / 10 ** p;
const HEX_RX = /^#?([\da-f]{3}|[\da-f]{6}|[\da-f]{8})$/i;
const RGB_CSV_RX =
  /^\s*rgba?\s*\(\s*([+-]?\d+(?:\.\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?)\s*(?:,\s*([+-]?\d*(?:\.\d+)?)\s*)?\)\s*$/i;
const HSL_CSV_RX =
  /^\s*hsla?\s*\(\s*([+-]?\d+(?:\.\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?)%\s*,\s*([+-]?\d+(?:\.\d+)?)%\s*(?:,\s*([+-]?\d*(?:\.\d+)?)\s*)?\)\s*$/i;
const HSV_CSV_RX =
  /^\s*hsva?\s*\(\s*([+-]?\d+(?:\.\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?)%\s*,\s*([+-]?\d+(?:\.\d+)?)%\s*(?:,\s*([+-]?\d*(?:\.\d+)?)\s*)?\)\s*$/i;

function hexToRgb(hex: string): RGB | null {
  const match = HEX_RX.exec(hex.trim());
  if (!match || typeof match[1] !== "string") return null;

  let body = match[1].toLowerCase();

  if (body.length === 3) {
    body = body
      .split("")
      .map((c) => c + c)
      .join("");
  } else if (body.length === 8) {
    body = body.slice(2);
  } else if (body.length !== 6) {
    return null;
  }

  const r = parseInt(body.slice(0, 2), 16);
  const g = parseInt(body.slice(2, 4), 16);
  const b = parseInt(body.slice(4, 6), 16);

  return { r, g, b };
}
function rgbToHex({ r, g, b }: RGB) {
  return `#${[r, g, b]
    .map((x) => clamp(Math.round(x), 0, 255).toString(16).padStart(2, "0"))
    .join("")}`;
}

function rgbToHsl({ r, g, b }: RGB): HSL {
  const R = r / 255,
    G = g / 255,
    B = b / 255;
  const max = Math.max(R, G, B),
    min = Math.min(R, G, B);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;
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
function withAlphaHex(hex: string, a: number) {
  const alpha = clamp(Math.round(a * 255), 0, 255)
    .toString(16)
    .padStart(2, "0");
  return `#${alpha}${hex.replace(/^#/, "")}`.toLowerCase();
}
function tryParseAlpha(regex: RegExp, input: string): number | null {
  const match = regex.exec(input);
  const raw = match?.[4];
  if (raw == null || raw === "") return null;

  const n = Number(raw);
  if (Number.isNaN(n)) return null;

  return clamp(n, 0, 1);
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
  const normal = ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : "Fail";
  const large = ratio >= 4.5 ? "AAA" : ratio >= 3 ? "AA" : "Fail";
  return { normal, large };
}

function parseColor(input: string): { rgb: RGB; a: number } | null {
  const s = input.trim();

  const hexMatch = HEX_RX.exec(s);
  if (hexMatch) {
    const body = hexMatch[1];
    if (typeof body !== "string") return null;
    if (body.length === 8) {
      const a = parseInt(body.slice(0, 2), 16) / 255;
      const rgb = hexToRgb(`#${body.slice(2)}`);
      return rgb ? { rgb, a } : null;
    }
    const rgb = hexToRgb(s.startsWith("#") ? s : `#${s}`);
    return rgb ? { rgb, a: 1 } : null;
  }

  const rgbMatch = RGB_CSV_RX.exec(s);
  if (rgbMatch) {
    const r = clamp(parseFloat(rgbMatch[1] ?? "0"), 0, 255);
    const g = clamp(parseFloat(rgbMatch[2] ?? "0"), 0, 255);
    const b = clamp(parseFloat(rgbMatch[3] ?? "0"), 0, 255);
    const a = rgbMatch[4] != null ? clamp(parseFloat(rgbMatch[4]), 0, 1) : 1;
    return { rgb: { r, g, b }, a };
  }

  const hslMatch = HSL_CSV_RX.exec(s);
  if (hslMatch) {
    const h = ((parseFloat(hslMatch[1] ?? "0") % 360) + 360) % 360;
    const ss = clamp(parseFloat(hslMatch[2] ?? "0"), 0, 100);
    const ll = clamp(parseFloat(hslMatch[3] ?? "0"), 0, 100);
    const a = hslMatch[4] != null ? clamp(parseFloat(hslMatch[4]), 0, 1) : 1;
    const rgb = hslToRgb({ h, s: ss, l: ll });
    return { rgb, a };
  }

  const hsvMatch = HSV_CSV_RX.exec(s);
  if (hsvMatch) {
    const h = ((parseFloat(hsvMatch[1] ?? "0") % 360) + 360) % 360;
    const ss = clamp(parseFloat(hsvMatch[2] ?? "0"), 0, 100);
    const vv = clamp(parseFloat(hsvMatch[3] ?? "0"), 0, 100);
    const a = hsvMatch[4] != null ? clamp(parseFloat(hsvMatch[4]), 0, 1) : 1;
    const rgb = hsvToRgb({ h, s: ss, v: vv });
    return { rgb, a };
  }

  return null;
}

function randomHex() {
  const n = Math.floor(Math.random() * 0xffffff);
  return `#${n.toString(16).padStart(6, "0")}`;
}

const RECENT_KEY = "toolscube.color.recent";

export default function ColorConverterClient() {
  const [rgb, setRgb] = React.useState<RGB>({ r: 30, g: 144, b: 255 });
  const [alpha, setAlpha] = React.useState(1);

  const hex = React.useMemo(() => rgbToHex(rgb), [rgb]);
  const hsl = React.useMemo(() => rgbToHsl(rgb), [rgb]);
  const hsv = React.useMemo(() => rgbToHsv(rgb), [rgb]);
  const cmyk = React.useMemo(() => rgbToCmyk(rgb), [rgb]);

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

  // recent colors (load once)
  const [recent, setRecent] = React.useState<string[]>([]);
  React.useEffect(() => {
    try {
      const r = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
      if (Array.isArray(r)) setRecent(r.slice(0, 12));
    } catch {}
  }, []);

  // save on hex change
  React.useEffect(() => {
    const id = setTimeout(() => {
      try {
        setRecent((prev) => {
          const next = [hex, ...prev.filter((h) => h !== hex)].slice(0, 12);
          localStorage.setItem(RECENT_KEY, JSON.stringify(next));
          return next;
        });
      } catch {}
    }, 120);
    return () => clearTimeout(id);
  }, [hex]);

  // gradient builder
  const [gradHex, setGradHex] = React.useState("#ffffff");
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

  const reset = () => {
    setRgb({ r: 30, g: 144, b: 255 });
    setAlpha(1);
    setGradHex("#ffffff");
    setAngle(90);
  };

  return (
    <>
      <ToolPageHeader
        icon={Palette}
        title="Palette"
        description="Convert HEX, RGB, HSL, build gradients, check contrast, and export tints & shades."
        actions={
          <>
            <ResetButton onClick={reset} />
            <CopyButton
              variant="default"
              getText={() =>
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
                )
              }
            />
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.05fr_1fr]">
        {/* LEFT */}
        <GlassCard>
          <CardContent className="grid gap-4">
            {/* picker & hex */}
            <ColorField
              id="main"
              value={hex}
              onChange={(nextHex: string) => {
                const rgbNew = hexToRgb(nextHex);
                if (rgbNew) setRgb(rgbNew);
              }}
              icon={Droplet}
              label="Pick & HEX"
            />

            {/* alpha & quick actions */}
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
              <div className="flex items-center gap-3">
                <InputField
                  label="Alpha"
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

              <ActionButton
                icon={EyeDropperIcon}
                label="Eyedropper"
                onClick={async () => {
                  if ("EyeDropper" in window) {
                    const eyeDropper = new (
                      window as typeof window & {
                        EyeDropper: new () => { open: () => Promise<{ sRGBHex: string }> };
                      }
                    ).EyeDropper();
                    const result = await eyeDropper.open();
                    const rgbNew = hexToRgb(result.sRGBHex);
                    if (rgbNew) setRgb(rgbNew);
                  } else {
                    alert("Eyedropper not supported in this browser.");
                  }
                }}
              />

              <ActionButton
                icon={Shuffle}
                label="Random"
                onClick={() => {
                  const h = randomHex();
                  const rgbNew = hexToRgb(h);
                  if (rgbNew) setRgb(rgbNew);
                }}
              />

              <CopyButton label="Copy HEX" getText={alpha < 1 ? withAlphaHex(hex, alpha) : hex} />
            </div>

            {/* text inputs */}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <InputField
                  id="hex-text"
                  label="HEX"
                  placeholder="#1e90ff or #AARRGGBB"
                  value={hexInput}
                  onChange={(e) => {
                    const v = (e?.target?.value ?? "") as string;
                    setHexInput(v);
                    const parsed = parseColor(v);
                    if (parsed) {
                      setRgb(parsed.rgb);
                      if (HEX_RX.test(v) && v.replace("#", "").length === 8) setAlpha(parsed.a);
                    }
                  }}
                  inputClassName="font-mono"
                />

                <CopyButton
                  size="sm"
                  getText={() => (alpha < 1 ? withAlphaHex(hex, alpha) : hex)}
                />
              </div>

              <div className="space-y-2">
                <InputField
                  id="rgb-text"
                  label="RGB / RGBA"
                  placeholder="rgb(30,144,255) or rgba(30,144,255,0.6)"
                  value={rgbInput}
                  onChange={(e) => {
                    const v = String(e?.target?.value ?? "");
                    setRgbInput(v);

                    const parsed = parseColor(v);
                    if (parsed) setRgb(parsed.rgb);

                    if (v.toLowerCase().startsWith("rgba")) {
                      const alpha = tryParseAlpha(RGB_CSV_RX, v);
                      if (alpha != null) setAlpha(alpha);
                    }
                  }}
                  inputClassName="font-mono"
                />
                <CopyButton
                  size="sm"
                  getText={() =>
                    alpha < 1
                      ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${round(alpha, 2)})`
                      : `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
                  }
                />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <InputField
                  id="hsl-text"
                  label="HSL / HSLA"
                  placeholder="hsl(210,100%,56%) or hsla(210,100%,56%,0.6)"
                  value={hslInput}
                  onChange={(e) => {
                    const v = String(e?.target?.value ?? "");
                    setHslInput(v);

                    const parsed = parseColor(v);
                    if (parsed) setRgb(parsed.rgb);

                    if (v.toLowerCase().startsWith("hsla")) {
                      const alpha = tryParseAlpha(HSL_CSV_RX, v);
                      if (alpha != null) setAlpha(alpha);
                    }
                  }}
                  inputClassName="font-mono"
                />
                <CopyButton
                  size="sm"
                  getText={() =>
                    alpha < 1
                      ? `hsla(${round(hsl.h)}, ${round(hsl.s)}%, ${round(hsl.l)}%, ${round(alpha, 2)})`
                      : `hsl(${round(hsl.h)}, ${round(hsl.s)}%, ${round(hsl.l)}%)`
                  }
                />
              </div>

              <div className="space-y-2">
                <InputField
                  id="hsv-text"
                  label="HSV"
                  placeholder="hsv(210,88%,100%)"
                  value={hsvInput}
                  onChange={(e) => {
                    const v = (e?.target?.value ?? "") as string;
                    setHsvInput(v);
                    const parsed = parseColor(v);
                    if (parsed) setRgb(parsed.rgb);
                  }}
                  inputClassName="font-mono"
                />
                <CopyButton
                  size="sm"
                  getText={() => `hsv(${round(hsv.h)}, ${round(hsv.s)}%, ${round(hsv.v)}%)`}
                />
              </div>
            </div>

            {/* CMYK */}
            <StatRow
              label="CMYK"
              value={`cmyk(${round(cmyk.c)}%, ${round(cmyk.m)}%, ${round(cmyk.y)}%, ${round(cmyk.k)}%)`}
            />

            {/* Recent */}
            {recent.length > 0 && (
              <div className="space-y-2">
                <Label>Recent</Label>
                <div className="flex flex-wrap gap-2">
                  {recent.map((h) => (
                    <button
                      type="button"
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
          </CardContent>
        </GlassCard>

        {/* RIGHT */}
        <GlassCard>
          <CardContent className="grid gap-4">
            {/* Preview */}
            <div className="rounded-xl border overflow-hidden">
              <div
                className="h-44 w-full"
                style={{
                  backgroundColor: bg,
                  backgroundImage:
                    "linear-gradient(45deg, rgba(0,0,0,.06) 25%, transparent 25%), linear-gradient(-45deg, rgba(0,0,0,.06) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(0,0,0,.06) 75%), linear-gradient(-45deg, transparent 75%, rgba(0,0,0,.06) 75%)",
                  backgroundSize: "20px 20px",
                  backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                }}
              />
              <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2">
                <StatRow label="HEX" value={hex} />
                <StatRow label="HEX with alpha" value={withAlphaHex(hex, alpha)} />
                <StatRow label="RGB" value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} />
                <StatRow
                  label="HSL"
                  value={`hsl(${round(hsl.h)}, ${round(hsl.s)}%, ${round(hsl.l)}%)`}
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
              <div
                className="rounded-lg border p-4 overflow-hidden"
                style={{ background: bgHex, color: fgHex }}
              >
                <div className="truncate text-xl font-semibold">The quick brown fox jumps</div>
                <div className="text-sm opacity-80">Large text preview — target at least AA.</div>
              </div>
            </div>
          </CardContent>
        </GlassCard>

        {/* Gradient builder */}
        <GlassCard>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Gradient className="h-4 w-4" /> Gradient Builder
                </Label>
                <CopyButton
                  size="sm"
                  label="Copy CSS"
                  getText={`background: linear-gradient(${angle}deg, ${hex} 0%, ${gradHex} 100%);`}
                />
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
                    <span className="w-12 text-right text-sm tabular-nums">{angle}°</span>
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
                <CopyButton
                  label="Copy JSON"
                  getText={JSON.stringify(
                    shades.map((s) => s.hex),
                    null,
                    2,
                  )}
                />
                <CopyButton
                  label="Copy CSS vars"
                  getText={`:root{\n${shades.map((s, i) => `  --color-${(i + 1) * 100}: ${s.hex};`).join("\n")}\n}`}
                />
              </div>
            </div>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
              {shades.map(({ hex: h }, i) => (
                <div key={i as number} className="group">
                  <CopyButton
                    getText={() => h}
                    render={({ onClick }) => (
                      <button
                        type="button"
                        onClick={onClick}
                        className="h-10 w-full rounded-md border"
                        style={{ backgroundColor: h }}
                        title={`${h} — click to copy`}
                      />
                    )}
                  />
                  <div className="pointer-events-none mt-1 select-none text-center text-[11px] text-muted-foreground">
                    {(i + 1) * 100}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </GlassCard>

        {/* Harmonies */}
        <GlassCard>
          <CardContent className="space-y-4">
            <Harmonies base={rgb} />
          </CardContent>
        </GlassCard>
      </div>
    </>
  );
}

/* components */

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="flex-1 truncate font-mono text-sm" title={value}>
        {value}
      </div>
      <CopyButton size="sm" getText={() => value} />
    </div>
  );
}

function Harmonies({ base }: { base: RGB }) {
  const baseHsl = rgbToHsl(base);
  const toHex = (h: number, s = baseHsl.s, l = baseHsl.l) =>
    rgbToHex(hslToRgb({ h: ((h % 360) + 360) % 360, s, l }));

  const groups: { title: string; colors: string[] }[] = [
    { title: "Complementary", colors: [toHex(baseHsl.h), toHex(baseHsl.h + 180)] },
    {
      title: "Analogous",
      colors: [toHex(baseHsl.h - 30), toHex(baseHsl.h), toHex(baseHsl.h + 30)],
    },
    {
      title: "Triadic",
      colors: [toHex(baseHsl.h), toHex(baseHsl.h + 120), toHex(baseHsl.h + 240)],
    },
    {
      title: "Tetradic",
      colors: [
        toHex(baseHsl.h),
        toHex(baseHsl.h + 90),
        toHex(baseHsl.h + 180),
        toHex(baseHsl.h + 270),
      ],
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
            {g.colors.map((c, idx) => (
              <CopyButton
                key={idx as number}
                getText={() => c}
                render={(btnProps) => (
                  <button
                    type="button"
                    className="h-8 w-8 rounded-md border"
                    style={{ background: c }}
                    title={c}
                    onClick={btnProps.onClick}
                  />
                )}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
