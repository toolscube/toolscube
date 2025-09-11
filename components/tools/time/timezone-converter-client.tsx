"use client";

import { Clock, Diff, Globe, MapPin, Plus, Replace, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ActionButton, CopyButton, ResetButton } from "@/components/shared/action-buttons";
import InputField from "@/components/shared/form-fields/input-field";
import ToolPageHeader from "@/components/shared/tool-page-header";
import { Badge } from "@/components/ui/badge";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { formatDateInput, formatTimeInput, getLocalTimeZone, pad } from "@/lib/utils";

// Utils

function wallTimeToUTC(
  y: number,
  m: number, // 1-12
  d: number,
  h: number,
  min: number,
  timeZone: string,
): number {
  let guess = Date.UTC(y, m - 1, d, h, min, 0, 0);

  for (let i = 0; i < 4; i++) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(new Date(guess));

    const get = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((p) => p.type === type)?.value || "00";
    const zy = Number(get("year"));
    const zm = Number(get("month"));
    const zd = Number(get("day"));
    const zh = Number(get("hour"));
    const zmin = Number(get("minute"));

    const mappedUTC = Date.UTC(zy, zm - 1, zd, zh, zmin, 0, 0);
    const desiredUTC = Date.UTC(y, m - 1, d, h, min, 0, 0);

    const delta = desiredUTC - mappedUTC;
    if (Math.abs(delta) < 60000) {
      guess = guess + delta;
      break;
    }
    guess = guess + delta;
  }

  return guess;
}

/** Pretty print a timestamp in a zone */
function formatInZone(ts: number, timeZone: string, opts?: { hour12?: boolean; withTz?: boolean }) {
  const { hour12 = false, withTz = true } = opts || {};
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "short",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12,
    timeZoneName: withTz ? "short" : undefined,
  });
  return formatter.format(new Date(ts));
}

function tzAbbr(ts: number, timeZone: string): string {
  const s = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
    hour12: false,
  }).format(new Date(ts));
  const m = /\b([A-Z]{1,5}|GMT[+−-]\d{1,2})\b/.exec(s);
  return m?.[1] || timeZone;
}

/** Offset in minutes at a UTC timestamp for a given zone */
function getOffsetMinutes(tsUtc: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(tsUtc));

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value || "00";
  const zy = Number(get("year"));
  const zm = Number(get("month"));
  const zd = Number(get("day"));
  const zh = Number(get("hour"));
  const zmin = Number(get("minute"));

  const asUtc = Date.UTC(zy, zm - 1, zd, zh, zmin, 0, 0);

  const diffMs = asUtc - tsUtc;
  return Math.round(diffMs / 60000);
}

function fmtOffset(mins: number) {
  const sign = mins >= 0 ? "+" : "-";
  const abs = Math.abs(mins);
  const hh = Math.floor(abs / 60);
  const mm = abs % 60;
  return `GMT${sign}${pad(hh)}:${pad(mm)}`;
}



function getAllTimeZones(): { value: string; label: string }[] {
  let zones: string[] | undefined;
  try {
    zones = Intl.supportedValuesOf?.("timeZone");
  } catch {
    zones = undefined;
  }

  const curated = [
    // Asia
    "Asia/Dhaka",
    "Asia/Kolkata",
    "Asia/Karachi",
    "Asia/Singapore",
    "Asia/Tokyo",
    "Asia/Dubai",
    "Asia/Bangkok",
    "Asia/Shanghai",
    "Asia/Hong_Kong",
    // Europe
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Europe/Madrid",
    "Europe/Amsterdam",
    "Europe/Rome",
    "Europe/Stockholm",
    // Americas
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/Toronto",
    "America/Mexico_City",
    "America/Sao_Paulo",
    // Oceania & Africa
    "Australia/Sydney",
    "Pacific/Auckland",
    "Africa/Nairobi",
    "Africa/Cairo",
  ];

  const list = (zones?.length ? zones : curated).map((z) => ({
    value: z,
    label: `${z.split("/").at(-1)?.replace("_", " ") || z} (${z})`,
  }));

  // sort alphabetically by label for nicer UX
  return list.sort((a, b) => a.label.localeCompare(b.label));
}

/** A tiny debounce hook for search inputs, etc. */
function useDebounced<T>(value: T, delay = 200) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

// Reuseable UI
function TimeZoneSelect({
  label,
  value,
  onValueChange,
  items,
  placeholder,
}: {
  label?: string;
  value?: string;
  onValueChange: (v: string) => void;
  items: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder || "Select time zone"} />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {items.map((z) => (
            <SelectItem key={z.value} value={z.value}>
              {z.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function CityRow({
  tz,
  utcTs,
  srcTz,
  is12h,
  onRemove,
  onSwap,
}: {
  tz: string;
  utcTs: number;
  srcTz: string;
  is12h: boolean;
  onRemove: () => void;
  onSwap: () => void;
}) {
  const text = formatInZone(utcTs, tz, { hour12: is12h, withTz: true });
  const abbr = tzAbbr(utcTs, tz);
  const offMin = getOffsetMinutes(utcTs, tz);
  const offStr = fmtOffset(offMin);

  const srcOffMin = getOffsetMinutes(utcTs, srcTz);
  const diffMin = offMin - srcOffMin;
  const diffHr = (Math.abs(diffMin) / 60).toFixed(1).replace(/\.0$/, "");
  const diffPretty =
    diffMin === 0 ? "Same as source" : `${diffMin > 0 ? "+" : "−"}${diffHr}h vs source`;

  return (
    <div className="flex flex-col gap-2 rounded-xl border p-3 hover:ring-1 hover:ring-primary/20 transition">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="font-mono">
            {abbr}
          </Badge>
          <div className="flex flex-col">
            <span className="font-medium">{tz}</span>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge className="font-mono">{offStr}</Badge>
              <span className="flex items-center gap-1">
                <Diff className="h-3.5 w-3.5" /> {diffPretty}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">{text}</div>

      <div className="flex flex-wrap gap-2">
        <ActionButton icon={Replace} label="Set as source" size="sm" onClick={onSwap} />
        <CopyButton size="sm" getText={`${text} — ${tz}`} />
        <ActionButton icon={Trash2} label="Remove" size="sm" onClick={onRemove} />
      </div>
    </div>
  );
}

export default function TimezoneConverterClient() {
  const localTz = useMemo(() => getLocalTimeZone(), []);
  const ALL_ZONES = useMemo(() => getAllTimeZones(), []);
  const [search, setSearch] = useState("");
  const debSearch = useDebounced(search, 200);

  // Source
  const [sourceTz, setSourceTz] = useState<string>(localTz);
  const [dateStr, setDateStr] = useState<string>(() => formatDateInput(new Date()));
  const [timeStr, setTimeStr] = useState<string>(() => formatTimeInput(new Date()));
  const [is12h, setIs12h] = useState(false);

  // Targets
  const [targets, setTargets] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const qs = params.get("zones");
      if (qs) return qs.split(",").filter(Boolean);
      const saved = localStorage.getItem("tzc:targets");
      if (saved) return JSON.parse(saved);
    }
    const defaults = [
      "Asia/Dhaka",
      "Europe/London",
      "America/New_York",
      "America/Los_Angeles",
      "Asia/Tokyo",
    ];
    const unique = Array.from(new Set([localTz, ...defaults]));
    return unique;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tzc:targets", JSON.stringify(targets));
    }
  }, [targets]);

  // Compute UTC from source wall time
  const utcTs = useMemo(() => {
    const [yy, mm, dd] = dateStr.split("-").map((n) => Number(n));
    const [hh, min] = timeStr.split(":").map((n) => Number(n));
    return wallTimeToUTC(yy, mm, dd, hh, min, sourceTz);
  }, [dateStr, timeStr, sourceTz]);

  // Share link copy
  const params = new URLSearchParams();
  params.set("src", sourceTz);
  params.set("date", dateStr);
  params.set("time", timeStr);
  params.set("zones", targets.join(","));
  const link = `${window.location.href}?${params.toString()}`;

  const applyNow = () => {
    const now = new Date();
    setDateStr(formatDateInput(now));
    setTimeStr(formatTimeInput(now));
    setSourceTz(getLocalTimeZone());
  };

  const resetAll = () => {
    setDateStr(formatDateInput(new Date()));
    setTimeStr(formatTimeInput(new Date()));
    setSourceTz(localTz);
    setTargets([
      "Asia/Dhaka",
      "Europe/London",
      "America/New_York",
      "America/Los_Angeles",
      "Asia/Tokyo",
    ]);
  };

  const addTarget = (tz: string) => setTargets((arr) => (arr.includes(tz) ? arr : [...arr, tz]));
  const removeTarget = (tz: string) => setTargets((arr) => arr.filter((z) => z !== tz));
  const swapWithSource = (tz: string) => setSourceTz(tz);

  // Parse ?src= & ?date= & ?time= on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const src = params.get("src");
    const date = params.get("date");
    const time = params.get("time");
    if (src) setSourceTz(src);
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) setDateStr(date);
    if (time && /^\d{2}:\d{2}$/.test(time)) setTimeStr(time);
  }, []);

  const sourceCandidates = ALL_ZONES;
  const targetCandidates = useMemo(
    () => ALL_ZONES.filter((z) => z.value !== sourceTz && !targets.includes(z.value)),
    [ALL_ZONES, sourceTz, targets],
  );

  const filteredTargets = useMemo(() => {
    if (!debSearch.trim()) return targetCandidates;
    const q = debSearch.toLowerCase();
    return targetCandidates.filter(
      (z) => z.value.toLowerCase().includes(q) || z.label.toLowerCase().includes(q),
    );
  }, [debSearch, targetCandidates]);

  const utcBadge = useMemo(() => {
    const s = formatInZone(utcTs, "UTC", { hour12: false, withTz: true });
    const tzPart = s.split(", ").at(-1);
    return `UTC ${tzPart?.replace("UTC", "").trim() || ""}`;
  }, [utcTs]);

  return (
    <>
      {/* HEADER */}
      <ToolPageHeader
        icon={Globe}
        title="Time Zone Converter"
        description="Convert a time from one city to many others — DST-aware, precise, and shareable."
        actions={
          <>
            <ResetButton onClick={resetAll} />
            <ActionButton icon={Clock} label="Now" onClick={applyNow} />
            <CopyButton variant="default" label="Copy Link" getText={link} />
          </>
        }
      />

      {/* SETTINGS */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Settings</CardTitle>
          <CardDescription>Pick the source city and time. We handle the rest.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <TimeZoneSelect
              label="Source City / Time Zone"
              value={sourceTz}
              onValueChange={setSourceTz}
              items={sourceCandidates}
              placeholder="Select source time zone"
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> Your device zone:{" "}
              <span className="font-medium">{localTz}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InputField
              id="date"
              label="Date"
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
            />
            <InputField
              id="time"
              label="Time"
              type="time"
              value={timeStr}
              onChange={(e) => setTimeStr(e.target.value)}
            />
            <div className="col-span-2 flex items-center justify-between rounded-md border p-2">
              <div className="flex items-center gap-2">
                <Switch checked={is12h} onCheckedChange={setIs12h} id="fmt" />
                <Label htmlFor="fmt">12-hour format</Label>
              </div>
              <Badge variant="secondary" className="font-mono">
                {utcBadge}
              </Badge>
            </div>
          </div>
        </CardContent>
      </GlassCard>

      <Separator />

      {/* ADD TARGETS */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Add Cities</CardTitle>
          <CardDescription>Choose where you want to see the converted time.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <Label>Pick a city</Label>
            <div className="grid gap-2">
              <InputField
                placeholder="Search or paste IANA zone (e.g., Europe/Paris)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Select onValueChange={(v) => v && addTarget(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Add a time zone" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {filteredTargets.slice(0, 200).map((z) => (
                    <SelectItem key={z.value} value={z.value}>
                      {z.label}
                    </SelectItem>
                  ))}
                  {filteredTargets.length === 0 && (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      No match in list. Paste a valid IANA zone above, then click “Add”.
                    </div>
                  )}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-2">
                <ActionButton
                  size="sm"
                  icon={Plus}
                  label="Add typed zone"
                  onClick={() => {
                    const v = debSearch.trim();
                    if (v && !targets.includes(v)) addTarget(v);
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Tip: Try zones like <span className="font-mono">Asia/Dhaka</span>,{" "}
                <span className="font-mono">Europe/London</span>,{" "}
                <span className="font-mono">America/Los_Angeles</span>.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Quick presets</Label>
            <div className="flex flex-wrap gap-2">
              {[
                "Asia/Dhaka",
                "Europe/London",
                "America/New_York",
                "America/Los_Angeles",
                "Asia/Tokyo",
                "Australia/Sydney",
              ].map((v) => (
                <ActionButton
                  key={v}
                  size="sm"
                  icon={Plus}
                  label={v.split("/").at(-1)}
                  onClick={() => addTarget(v)}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </GlassCard>

      {/* RESULTS */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Converted Times</CardTitle>
          <CardDescription>
            Times are computed exactly for the above source — daylight saving aware.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {targets.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No cities yet. Add a city to see results.
            </p>
          )}
          {targets.map((tz) => (
            <CityRow
              key={tz}
              tz={tz}
              utcTs={utcTs}
              srcTz={sourceTz}
              is12h={is12h}
              onRemove={() => removeTarget(tz)}
              onSwap={() => swapWithSource(tz)}
            />
          ))}
        </CardContent>
      </GlassCard>
    </>
  );
}
