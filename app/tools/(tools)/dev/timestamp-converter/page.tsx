"use client";

import { CalendarClock, Clock3, Link2, RefreshCw, Timer, TimerReset } from "lucide-react";
import React from "react";
import {
  ActionButton,
  CopyButton,
  ExportCSVButton,
  ExportTextButton,
  LinkButton,
  ResetButton,
} from "@/components/shared/action-buttons";
import { InputField } from "@/components/shared/form-fields/input-field";
import SelectField from "@/components/shared/form-fields/select-field";
import SwitchRow from "@/components/shared/form-fields/switch-row";
import ToolPageHeader from "@/components/shared/tool-page-header";
import { GlassCard, MotionGlassCard } from "@/components/ui/glass-card";
import { Separator } from "@/components/ui/separator";

// --------------------------- small helpers ---------------------------------

type Unit = "seconds" | "milliseconds" | "microseconds" | "nanoseconds";
type Direction = "toDate" | "toEpoch";

const UNITS: { label: string; value: Unit; factor: number }[] = [
  { label: "Seconds (10 digits)", value: "seconds", factor: 1_000 },
  { label: "Milliseconds (13 digits)", value: "milliseconds", factor: 1 },
  { label: "Microseconds (16 digits)", value: "microseconds", factor: 1 / 1_000 },
  { label: "Nanoseconds (19 digits)", value: "nanoseconds", factor: 1 / 1_000_000 },
];

const TZ_PRESETS = [
  "local",
  "UTC",
  "America/New_York",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Dhaka",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Australia/Sydney",
] as const;

function clampIntString(s: string, maxLen = 32) {
  return s.replace(/[^\d-]/g, "").slice(0, maxLen);
}

function detectUnit(raw: string): Unit | null {
  const len = raw.replace(/^-/, "").length;
  if (len === 10) return "seconds";
  if (len === 13) return "milliseconds";
  if (len === 16) return "microseconds";
  if (len === 19) return "nanoseconds";
  return null;
}

function toMsFromEpoch(raw: string, unit: Unit): number | null {
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  const f = UNITS.find((u) => u.value === unit)!.factor;
  return Math.trunc(n * f);
}

function safeDate(d: number | Date | null): Date | null {
  if (d == null) return null;
  const dt = d instanceof Date ? d : new Date(d);
  return isNaN(dt.getTime()) ? null : dt;
}

function fmtInTz(d: Date, timeZone: string) {
  // Fallback to local if unknown tz
  try {
    return new Intl.DateTimeFormat(undefined, {
      timeZone: timeZone === "local" ? undefined : timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(d);
  } catch {
    return d.toString();
  }
}

function shareUrl(params: Record<string, string>) {
  const sp = new URLSearchParams(params);
  return `${location.origin}${location.pathname}?${sp.toString()}`;
}

// CSV helper
function makeCsv(rows: Array<[string, string]>) {
  const head = ["Label", "Value"];
  const lines = [head, ...rows].map((r) => r.map((x) => `"${x.replace(/"/g, '""')}"`).join(","));
  return lines.join("\n");
}

// ------------------------------- page --------------------------------------

export default function TimestampConverterPage() {
  // direction
  const [dir, setDir] = React.useState<Direction>("toDate");

  // inputs
  const [stamp, setStamp] = React.useState(""); // epoch number as string
  const [dateText, setDateText] = React.useState(""); // free-form date string (ISO recommended)
  const [tz, setTz] = React.useState<(typeof TZ_PRESETS)[number]>("local");
  const [customTz, setCustomTz] = React.useState("");
  const [unit, setUnit] = React.useState<Unit>("seconds");
  const [autoDetect, setAutoDetect] = React.useState(true);
  const [autoTick, setAutoTick] = React.useState(false);

  // results
  const [result, setResult] = React.useState<Record<string, string>>({});
  const [error, setError] = React.useState<string | null>(null);

  // hydrate from URL once
  React.useEffect(() => {
    try {
      const sp = new URLSearchParams(location.search);
      const _dir = (sp.get("dir") as Direction) || undefined;
      const _t = sp.get("t") || "";
      const _u = (sp.get("u") as Unit) || undefined;
      const _tz = (sp.get("tz") as any) || undefined;
      if (_dir) setDir(_dir);
      if (_t) {
        if (_dir === "toEpoch") setDateText(_t);
        else setStamp(_t);
      }
      if (_u && UNITS.some((x) => x.value === _u)) setUnit(_u);
      if (_tz) {
        if (TZ_PRESETS.includes(_tz)) setTz(_tz);
        else {
          setTz("local");
          setCustomTz(_tz);
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // auto-tick "Now"
  React.useEffect(() => {
    if (!autoTick) return;
    const id = setInterval(() => {
      const nowMs = Date.now();
      const nowSec = Math.floor(nowMs / 1000);
      setStamp(String(nowSec));
      if (dir === "toDate") run("toDate", String(nowSec), unit, tz, customTz, dateText);
    }, 1000);
    return () => clearInterval(id);
  }, [autoTick, dir, unit, tz, customTz, dateText]);

  function resetAll() {
    setDir("toDate");
    setStamp("");
    setDateText("");
    setTz("local");
    setCustomTz("");
    setUnit("seconds");
    setAutoDetect(true);
    setAutoTick(false);
    setResult({});
    setError(null);
  }

  function copyShare() {
    const url = shareUrl({
      dir,
      t: dir === "toDate" ? stamp : dateText,
      u: unit,
      tz: tz === "local" ? customTz || "local" : tz,
    });
    navigator.clipboard.writeText(url);
  }

  function exportCsv() {
    const rows = Object.entries(result);
    const csv = makeCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "timestamp-conversion.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function run(
    _dir = dir,
    _stamp = stamp,
    _unit = unit,
    _tz = tz,
    _customTz = customTz,
    _dateText = dateText,
  ) {
    setError(null);
    const zone = _tz === "local" ? (_customTz.trim() ? _customTz.trim() : "local") : _tz;

    try {
      if (_dir === "toDate") {
        const chosenUnit = autoDetect ? (detectUnit(_stamp) ?? _unit) : _unit;
        const ms = toMsFromEpoch(_stamp, chosenUnit);
        const dt = safeDate(ms);
        if (!dt) throw new Error("Invalid timestamp.");
        const iso = dt.toISOString();
        const locale = fmtInTz(dt, zone);
        const utc = dt.toUTCString();

        const s = Math.floor(dt.getTime() / 1000);
        const msPrec = dt.getTime();
        const micros = msPrec * 1000;
        const nanos = msPrec * 1_000_000;

        setResult({
          "Detected unit": chosenUnit,
          "Local/Zone": locale,
          UTC: utc,
          "ISO 8601": iso,
          "Epoch (s)": String(s),
          "Epoch (ms)": String(msPrec),
          "Epoch (μs)": String(micros),
          "Epoch (ns)": String(nanos),
        });
      } else {
        // toEpoch: parse the date string; recommend ISO with timezone (Z or ±hh:mm)
        const raw = _dateText.trim();
        if (!raw) throw new Error("Enter a date/time (prefer ISO 8601).");

        // If string already has an offset or Z, use native parse.
        const hasOffset = /[zZ]|[+-]\d{2}:\d{2}$/.test(raw);
        let dt: Date | null = null;
        if (hasOffset) {
          dt = safeDate(new Date(raw));
        } else {
          // No offset provided — treat as local wall time.
          // NOTE: If a non-local time zone is selected, we still render outputs in that zone,
          // but conversion will assume local zone for parsing (to avoid brittle math without a tz lib).
          dt = safeDate(new Date(raw));
        }
        if (!dt) throw new Error("Unrecognized date/time.");

        const ms = dt.getTime();
        setResult({
          "Input (parsed)": dt.toString(),
          "ISO 8601": dt.toISOString(),
          "Epoch (s)": String(Math.floor(ms / 1000)),
          "Epoch (ms)": String(ms),
          "Epoch (μs)": String(ms * 1000),
          "Epoch (ns)": String(ms * 1_000_000),
          "Rendered (zone)": fmtInTz(dt, zone),
        });
      }
    } catch (e: any) {
      setResult({});
      setError(e?.message || "Conversion failed.");
    }
  }

  const unitOptions = UNITS.map((u) => ({ label: u.label, value: u.value }));

  const tzOptions = [
    ...TZ_PRESETS.map((z) => ({ label: z === "local" ? "Local time" : z, value: z })),
  ] as Array<{ label: string; value: string }>;

  return (
    <>
      <ToolPageHeader
        title="Timestamp Converter"
        description="Convert UNIX timestamps to human-readable dates (and back), with unit auto-detect, time zone rendering, and quick share."
        icon={CalendarClock}
        actions={
          <>
            <ResetButton onClick={resetAll} />
            <LinkButton onClick={copyShare} label="Copy share link" icon={Link2} />
            {/* <ExportCSVButton onClick={exportCsv} disabled={!Object.keys(result).length} /> */}
          </>
        }
      />

      <GlassCard className="shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          {/* Left: Inputs */}
          <div className="rounded-xl border p-4 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <SelectField
                id="direction"
                label="Mode"
                value={dir}
                onValueChange={(v) => setDir(v as Direction)}
                options={[
                  { label: "Epoch → Date", value: "toDate" },
                  { label: "Date → Epoch", value: "toEpoch" },
                ]}
                icon={Timer}
              />
              <SelectField
                id="unit"
                label="Unit"
                value={unit}
                onValueChange={(v) => setUnit(v as Unit)}
                options={unitOptions}
                disabled={dir !== "toDate" || autoDetect}
                icon={TimerReset}
                // helpText={
                //   dir === "toDate"
                //     ? autoDetect
                //       ? "Auto-detect on"
                //       : "Pick matching unit"
                //     : "Not used in this mode"
                // }
              />
            </div>

            {dir === "toDate" ? (
              <InputField
                id="epoch"
                label="UNIX Timestamp"
                placeholder="e.g. 1704067200 (seconds), 1704067200000 (ms)…"
                value={stamp}
                onChange={(v) => setStamp(clampIntString(v))}
                // rightSlot={
                //   <div className="flex items-center gap-1">
                //     <ActionButton
                //       label="Now"
                //       onClick={() => setStamp(String(Math.floor(Date.now() / 1000)))}
                //       icon={<Clock3 className="h-4 w-4" />}
                //       variant="secondary"
                //     />
                //     <PasteButton onPaste={setStamp} />
                //     <CopyButton text={stamp} disabled={!stamp} />
                //   </div>
                // }
              />
            ) : (
              <InputField
                id="date"
                label="Date / Time"
                placeholder="ISO preferred (e.g., 2025-09-07T14:10:00Z or 2025-09-07 20:10)"
                value={dateText}
                onChange={setDateText}
                // rightSlot={
                //   <div className="flex items-center gap-1">
                //     <PasteButton onPaste={setDateText} />
                //     <CopyButton text={dateText} disabled={!dateText} />
                //   </div>
                // }
                helpText="If no timezone is included in text, it's parsed as local time."
              />
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <SelectField
                id="tz"
                label="Time Zone (for rendering)"
                value={tz}
                onValueChange={(v) => setTz(v as any)}
                options={tzOptions}
                icon={RefreshCw}
              />
              <InputField
                id="custom-tz"
                label="Custom TZ (optional)"
                placeholder="e.g., Asia/Dhaka"
                value={customTz}
                onChange={setCustomTz}
                disabled={tz !== "local"}
                helpText={
                  tz !== "local" ? "Disabled (using preset)" : "Overrides Local for display"
                }
              />
            </div>

            <Separator />

            <div className="grid gap-3 sm:grid-cols-2">
              <SwitchRow
                label="Auto-detect unit"
                checked={autoDetect}
                onCheckedChange={setAutoDetect}
                hint="10=sec, 13=ms, 16=μs, 19=ns"
                disabled={dir !== "toDate"}
              />
              <SwitchRow
                label="Tick 'Now' every second"
                checked={autoTick}
                onCheckedChange={setAutoTick}
                hint="Fills current epoch seconds"
                disabled={dir !== "toDate"}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <ActionButton label="Convert" onClick={() => run()} icon={CalendarClock} size="lg" />
              <ActionButton
                label="Copy CSV"
                onClick={() => {
                  const csv = makeCsv(Object.entries(result));
                  navigator.clipboard.writeText(csv);
                }}
                icon={Link2}
                variant="secondary"
                disabled={!Object.keys(result).length}
              />
              <ExportTextButton
                filename="timestamp-conversion.txt"
                getText={() =>
                  Object.entries(result)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join("\n")
                }
                disabled={!Object.keys(result).length}
              />
            </div>
          </div>

          {/* Right: Results */}
          <div className="rounded-xl border p-4">
            <h3 className="mb-2 text-sm font-medium tracking-wide uppercase text-muted-foreground">
              Result
            </h3>

            {!error && !Object.keys(result).length ? (
              <div className="rounded-md border p-3 text-sm text-muted-foreground">
                Enter a value and click <b>Convert</b>. Use <b>Now</b> for quick checks.
              </div>
            ) : null}

            {error ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            ) : (
              <div className="grid gap-2">
                {Object.entries(result).map(([k, v]) => (
                  <GlassRow key={k} label={k} value={v} />
                ))}
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </>
  );
}

// Simple display row with per-row copy
function GlassRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
      <div className="min-w-[160px] text-xs text-muted-foreground">{label}</div>
      <div className="flex-1 truncate font-mono text-sm">{value}</div>
      <CopyButton getText={value} />
    </div>
  );
}
