"use client";

import { CalendarClock, Clock3, RefreshCw, Timer, TimerReset } from "lucide-react";
import React from "react";
import {
  ActionButton,
  CopyButton,
  ExportCSVButton,
  ExportTextButton,
  ResetButton,
} from "@/components/shared/action-buttons";
import InputField from "@/components/shared/form-fields/input-field";
import SelectField from "@/components/shared/form-fields/select-field";
import SwitchRow from "@/components/shared/form-fields/switch-row";
import ToolPageHeader from "@/components/shared/tool-page-header";
import { CardContent } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Separator } from "@/components/ui/separator";
import {
  clampIntString,
  detectUnit,
  fmtInTz,
  isPresetTz,
  safeDate,
  shareUrl,
  TZ_PRESETS,
  toMsFromEpoch,
  UNITS,
} from "@/lib/utils/dev/timestamp-converter";

export default function TimestampConverterClient() {
  // direction
  const [dir, setDir] = React.useState<Direction>("toDate");

  // inputs
  const [stamp, setStamp] = React.useState("");
  const [dateText, setDateText] = React.useState("");
  const [tz, setTz] = React.useState<PresetTz>("local");
  const [customTz, setCustomTz] = React.useState("");
  const [unit, setUnit] = React.useState<Unit>("seconds");
  const [autoDetect, setAutoDetect] = React.useState(true);
  const [autoTick, setAutoTick] = React.useState(true);

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
      const _tz = sp.get("tz") || undefined;

      if (_dir) setDir(_dir);
      if (_t) {
        if (_dir === "toEpoch") setDateText(_t);
        else setStamp(_t);
      }
      if (_u && UNITS.some((x) => x.value === _u)) setUnit(_u);

      if (_tz) {
        if (isPresetTz(_tz)) {
          setTz(_tz);
        } else {
          setTz("local");
          setCustomTz(_tz);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const run = React.useCallback(
    (
      _dir = dir,
      _stamp = stamp,
      _unit = unit,
      _tz = tz,
      _customTz = customTz,
      _dateText = dateText,
    ) => {
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
          const raw = _dateText.trim();
          if (!raw) throw new Error("Enter a date/time (prefer ISO 8601).");

          const dt = safeDate(new Date(raw));
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
      } catch (e: unknown) {
        setResult({});
        setError(e instanceof Error ? e.message : "Conversion failed.");
      }
    },
    [dir, stamp, unit, tz, customTz, dateText, autoDetect],
  );

  // auto-tick "Now"
  React.useEffect(() => {
    if (!autoTick) return;
    const id = setInterval(() => {
      const now = new Date();

      if (dir === "toDate") {
        const nowSec = Math.floor(now.getTime() / 1000);
        setStamp(String(nowSec));
        run("toDate", String(nowSec), unit, tz, customTz, dateText);
      } else {
        const iso = now.toISOString();
        setDateText(iso);
        run("toEpoch", stamp, unit, tz, customTz, iso);
      }
    }, 1000);

    return () => clearInterval(id);
  }, [autoTick, dir, unit, tz, customTz, dateText, stamp, run]);

  const unitOptions = UNITS.map((u) => ({ label: u.label, value: u.value }));
  const tzOptions = TZ_PRESETS.map((z) => ({
    label: z === "local" ? "Local time" : z,
    value: z,
  })) as Array<{ label: string; value: string }>;

  function resetAll() {
    setStamp("");
    setDateText("");
    setTz("local");
    setCustomTz("");
    setUnit("seconds");
    setAutoDetect(true);
    setAutoTick(true);
    setResult({});
    setError(null);
    setDir("toDate");
  }

  return (
    <>
      <ToolPageHeader
        title="Timestamp Converter"
        description="Convert UNIX timestamps to human-readable dates"
        icon={CalendarClock}
        actions={
          <>
            <ResetButton onClick={resetAll} />
            <CopyButton
              getText={() =>
                shareUrl({
                  dir,
                  t: dir === "toDate" ? stamp : dateText,
                  u: unit,
                  tz: tz === "local" ? customTz || "local" : tz,
                })
              }
            />
            <ExportCSVButton
              variant="default"
              filename="timestamp-conversion.csv"
              getRows={() => Object.entries(result)}
              disabled={!Object.keys(result).length}
            />
          </>
        }
      />

      <GlassCard>
        <CardContent className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
              />
            </div>

            {dir === "toDate" ? (
              <div className="flex items-end gap-4">
                <InputField
                  className="w-full"
                  id="epoch"
                  label="UNIX Timestamp"
                  placeholder="e.g. 1704067200 (seconds), 1704067200000 (ms)…"
                  value={stamp}
                  onChange={(v) => setStamp(clampIntString(String(v ?? "")))}
                />
                <div className="flex items-center gap-1">
                  <ActionButton
                    label="Now"
                    onClick={() => setStamp(String(Math.floor(Date.now() / 1000)))}
                    icon={Clock3}
                    variant="default"
                  />
                  <CopyButton getText={stamp} disabled={!stamp} />
                </div>
              </div>
            ) : (
              <div className="flex items-end gap-4">
                <InputField
                  id="date"
                  label="Date / Time"
                  placeholder="ISO preferred (e.g., 2025-09-07T14:10:00Z or 2025-09-07 20:10)"
                  value={dateText}
                  onChange={(e) => setDateText(e.target.value)}
                  className="w-full"
                />
                <div className="flex items-center gap-1">
                  <ActionButton
                    label="Now"
                    onClick={() => setDateText(new Date().toISOString())}
                    icon={Clock3}
                    variant="default"
                  />
                  <CopyButton getText={dateText} disabled={!dateText} />
                </div>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <SelectField
                id="tz"
                label="Time Zone (for rendering)"
                value={tz}
                onValueChange={(v) => {
                  const val = String(v);
                  if (isPresetTz(val)) setTz(val);
                }}
                options={tzOptions}
                icon={RefreshCw}
              />
              <InputField
                id="custom-tz"
                label="Custom TZ (optional)"
                placeholder="e.g., Asia/Dhaka"
                value={customTz}
                onChange={(v) => setCustomTz(String(v ?? ""))}
                disabled={tz !== "local"}
                hint={tz !== "local" ? "Disabled (using preset)" : "Overrides Local for display"}
              />
            </div>

            <Separator />

            <div className="grid gap-3 sm:grid-cols-1">
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
                hint={dir === "toDate" ? "Fills current epoch seconds" : "Fills current ISO time"}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <ActionButton
                variant="default"
                label="Convert"
                onClick={() => run()}
                icon={CalendarClock}
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
          <div className="rounded-xl border overflow-auto p-4">
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
                  <div
                    key={k}
                    className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2"
                  >
                    <div className="min-w-[160px] text-xs text-muted-foreground">{k}</div>
                    <div className="flex-1 truncate font-mono text-sm">{v}</div>
                    <CopyButton size="sm" getText={v} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </GlassCard>
    </>
  );
}
