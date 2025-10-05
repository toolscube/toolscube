"use client";

import {
  CalendarDays,
  CalendarRange,
  CalendarSearch,
  ChevronLeft,
  ChevronRight,
  Download,
  Info,
  type LucideIcon,
} from "lucide-react";
import type * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { ActionButton, CopyButton, ResetButton } from "@/components/shared/action-buttons";
import InputField from "@/components/shared/form-fields/input-field";
import SwitchRow from "@/components/shared/form-fields/switch-row";
import ToolPageHeader from "@/components/shared/tool-page-header";
import { Badge } from "@/components/ui/badge";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn, pad } from "@/lib/utils";

/* Helpers */
const msDay = 24 * 60 * 60 * 1000;

function fmtDateInput(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function fromDateInput(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
}
function fmtShort(d: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(d);
}
function fmtISO(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// ISO weekday: Monday=1 ... Sunday=7
function isoWeekday(d: Date) {
  const wd = d.getDay();
  return wd === 0 ? 7 : wd;
}

/** ISO week info: week-year + week number (1-53) */
function isoWeekInfo(date: Date) {
  // Use UTC math to avoid DST drift
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day); // Thursday of this week
  const isoYear = d.getUTCFullYear();

  const jan4 = new Date(Date.UTC(isoYear, 0, 4));
  const jan4Dow = jan4.getUTCDay() || 7;
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - (jan4Dow - 1));

  const diffDays = Math.floor((d.getTime() - week1Monday.getTime()) / msDay);
  const week = Math.floor(diffDays / 7) + 1;

  return { isoYear, week };
}

function startOfISOWeek(date: Date) {
  const d = new Date(date);
  const diff = isoWeekday(d) - 1;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfISOWeek(date: Date) {
  const d = new Date(date);
  const diff = 7 - isoWeekday(d);
  d.setDate(d.getDate() + diff);
  d.setHours(23, 59, 59, 999);
  return d;
}

/** Convert ISO week-year + week to local Date (Monday) */
function fromISOYearWeek(isoYear: number, week: number) {
  const jan4 = new Date(Date.UTC(isoYear, 0, 4));
  const jan4Dow = jan4.getUTCDay() || 7;
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - (jan4Dow - 1));
  const mondayUTC = new Date(week1Monday.getTime() + (week - 1) * 7 * msDay);
  // Return as local date (preserving calendar day)
  return new Date(mondayUTC.getUTCFullYear(), mondayUTC.getUTCMonth(), mondayUTC.getUTCDate());
}

function downloadFile(filename: string, content: string, type = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toICSAllDayRange({
  title,
  start,
  end,
  description,
}: {
  title: string;
  start: Date;
  end: Date;
  description?: string;
}) {
  const dt = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const dtEndExclusive = new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ToolsCube//WeekNumber//EN",
    "BEGIN:VEVENT",
    `UID:week-${title}-${dt(start)}@toolscube`,
    `DTSTAMP:${dt(new Date())}T000000Z`,
    `DTSTART;VALUE=DATE:${dt(start)}`,
    `DTEND;VALUE=DATE:${dt(dtEndExclusive)}`,
    `SUMMARY:${title}`,
    ...(description ? [`DESCRIPTION:${description.replace(/\n/g, "\\n")}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

export default function WeekNumberClient() {
  const [dateStr, setDateStr] = useState(() => fmtDateInput(new Date()));
  const [showUS, setShowUS] = useState(false);

  // Extra inputs: ISO Year + Week jump
  const [isoYearInput, setIsoYearInput] = useState<number | "">("");
  const [isoWeekInput, setIsoWeekInput] = useState<number | "">("");

  // Derived
  const date = useMemo(() => fromDateInput(dateStr), [dateStr]);
  const iso = useMemo(() => isoWeekInfo(date), [date]);
  const isoRange = useMemo(
    () => ({ start: startOfISOWeek(date), end: endOfISOWeek(date) }),
    [date],
  );

  const usWeek = useMemo(() => {
    if (!showUS) return null as null | { year: number; week: number };
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const startOfYear = new Date(d.getFullYear(), 0, 1);
    const offset = startOfYear.getDay(); // Sun=0..Sat=6
    const daysSince = Math.floor((d.getTime() - startOfYear.getTime()) / msDay) + offset;
    const week = Math.floor(daysSince / 7) + 1;
    return { year: d.getFullYear(), week };
  }, [date, showUS]);

  const gotoDelta = (deltaWeeks: number) =>
    setDateStr(
      fmtDateInput(new Date(date.getFullYear(), date.getMonth(), date.getDate() + deltaWeeks * 7)),
    );
  const setToday = () => setDateStr(fmtDateInput(new Date()));

  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search);
    const d = p.get("date");
    const isoParam = p.get("iso");
    const sys = p.get("sys");

    if (isoParam && /^\d{4}-W\d{1,2}$/.test(isoParam)) {
      const [y, w] = isoParam.split("-W").map(Number);
      const monday = fromISOYearWeek(y, w);
      setDateStr(fmtDateInput(monday));
    } else if (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
      setDateStr(d);
    }
    if (sys) setShowUS(sys.includes("us"));
  }, []);

  // Week strip
  const weekDays = useMemo(() => {
    const list: { d: Date; label: string }[] = [];
    const start = isoRange.start;
    for (let i = 0; i < 7; i++) {
      const di = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      list.push({ d: di, label: fmtShort(di) });
    }
    return list;
  }, [isoRange]);

  // SSR-safe
  if (typeof window === "undefined") return null;

  // Share link (sync iso param)
  const params = new URLSearchParams();
  params.set("iso", `${iso.isoYear}-W${iso.week}`);
  params.set("sys", showUS ? "iso,us" : "iso");
  const link = `${window.location.href}?${params.toString()}`;

  const summaryLines = [
    `ISO: ${iso.isoYear}-W${iso.week}`,
    `Range: ${fmtShort(isoRange.start)} — ${fmtShort(isoRange.end)}`,
    ...(showUS && usWeek ? [`US: ${usWeek.year}-W${usWeek.week}`] : []),
  ];
  const summary = summaryLines.join("\n");

  const jsonSummary = JSON.stringify(
    {
      isoYear: iso.isoYear,
      isoWeek: iso.week,
      range: { start: fmtISO(isoRange.start), end: fmtISO(isoRange.end) },
      usWeek: showUS && usWeek ? { year: usWeek.year, week: usWeek.week } : null,
      link,
    },
    null,
    2,
  );

  const downloadICS = () => {
    const ics = toICSAllDayRange({
      title: `ISO Week ${iso.isoYear}-W${iso.week}`,
      start: isoRange.start,
      end: isoRange.end,
      description: summary,
    });
    downloadFile(`week-${iso.isoYear}-W${iso.week}.ics`, ics, "text/calendar;charset=utf-8");
  };

  return (
    <>
      {/* Header */}
      <ToolPageHeader
        icon={CalendarSearch}
        title="Week Number"
        description="Find ISO week and date range"
        actions={
          <>
            <ResetButton
              label="Week start"
              onClick={() => setDateStr(fmtDateInput(fromISOYearWeek(iso.isoYear, iso.week)))}
            />
            <CopyButton label="Copy summary" copiedLabel="Copied" getText={() => summary} />
            <CopyButton label="Copy link" copiedLabel="Copied" getText={() => link} />
            <ActionButton
              variant="default"
              icon={Download}
              label="Download"
              onClick={downloadICS}
            />
          </>
        }
      />

      {/* Controls */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Pick a Date</CardTitle>
          <CardDescription>
            Weeks start Monday; Week 1 is the week containing Jan 4 (ISO-8601).
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-2">
          {/* Left: Date + quick actions */}
          <div className="space-y-3">
            <InputField
              id="wk-date"
              label="Date"
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
            />

            <div className="flex flex-wrap items-center gap-2">
              <ActionButton
                icon={ChevronLeft}
                label="Prev"
                size="sm"
                onClick={() => gotoDelta(-1)}
              />
              <ActionButton icon={CalendarRange} label="Today" size="sm" onClick={setToday} />
              <ActionButton
                icon={ChevronRight}
                label="Next"
                size="sm"
                onClick={() => gotoDelta(1)}
              />
            </div>
          </div>

          {/* Right: Extras + Jump to ISO grouped nicely */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Extras</Label>
              <SwitchRow
                label="Show US-style week number"
                checked={showUS}
                onCheckedChange={setShowUS}
              />
              <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                <Info className="h-3.5 w-3.5" />
                US week = Sun–Sat; Week 1 starts Jan 1.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="iso-year">Jump to ISO</Label>
              <div className="flex items-end gap-2">
                <InputField
                  className="w-full"
                  id="iso-year"
                  label="Year"
                  type="number"
                  min={1900}
                  max={9999}
                  placeholder={`${iso.isoYear}`}
                  value={isoYearInput}
                  onChange={(e) =>
                    setIsoYearInput(e.target.value === "" ? "" : Number(e.target.value))
                  }
                />
                <InputField
                  className="w-full"
                  id="iso-week"
                  label="Week"
                  type="number"
                  min={1}
                  max={53}
                  placeholder={`${iso.week}`}
                  value={isoWeekInput}
                  onChange={(e) =>
                    setIsoWeekInput(e.target.value === "" ? "" : Number(e.target.value))
                  }
                />
                <div className="flex gap-2">
                  <ActionButton
                    variant="default"
                    label="Go"
                    onClick={() => {
                      if (isoYearInput && isoWeekInput) {
                        const d = fromISOYearWeek(isoYearInput, isoWeekInput);
                        setDateStr(fmtDateInput(d));
                      }
                    }}
                  />
                  <ActionButton
                    label="Clear"
                    onClick={() => {
                      setIsoYearInput("");
                      setIsoWeekInput("");
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </GlassCard>

      <Separator />

      {/* Results */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Results</CardTitle>
          <CardDescription>ISO info and the Monday–Sunday range.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Stat title="ISO Year" value={iso.isoYear} icon={CalendarSearch} />
            <Stat title="ISO Week" value={`W${iso.week}`} icon={CalendarSearch} />
            <Stat title="Start (Mon)" value={fmtShort(isoRange.start)} icon={CalendarDays} />
            <Stat title="End (Sun)" value={fmtShort(isoRange.end)} icon={CalendarDays} />
          </div>

          {showUS && usWeek && (
            <div className="rounded-md border p-3">
              <div className="text-sm">
                <span className="text-muted-foreground">US Week:</span>{" "}
                <span className="font-medium">
                  {usWeek.year}-W{usWeek.week}
                </span>{" "}
                <Badge variant="secondary" className="ml-2">
                  Sun–Sat
                </Badge>
              </div>
            </div>
          )}

          {/* Week strip */}
          <div className="rounded-xl border overflow-hidden">
            <div className="grid grid-cols-7 text-center">
              {weekDays.map(({ d, label }) => {
                const isToday = d.toDateString() === new Date().toDateString();
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                return (
                  <div
                    key={d.toISOString()}
                    className={cn(
                      "relative px-3 py-3 text-sm border-t",
                      "hover:bg-accent/50 transition-colors",
                      isWeekend && "bg-muted/30",
                      isToday && "bg-primary/5",
                    )}
                    title={`${fmtISO(d)} • ${label}`}
                  >
                    <span>{label}</span>
                    {isToday && (
                      <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick copy row */}
          <div className="flex flex-wrap gap-2">
            <CopyButton
              variant="default"
              label="Copy ISO"
              copiedLabel="Copied"
              getText={() => `${iso.isoYear}-W${iso.week}`}
            />
            <CopyButton
              label="Copy date range"
              copiedLabel="Copied"
              getText={() => `${fmtISO(isoRange.start)} — ${fmtISO(isoRange.end)}`}
            />
            <CopyButton label="Copy JSON" copiedLabel="Copied" getText={() => jsonSummary} />
          </div>

          <div className="flex flex-wrap gap-2 justify-end text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-primary/70" /> Today
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded bg-muted/60" /> Weekend
            </div>
          </div>
        </CardContent>
      </GlassCard>
    </>
  );
}

function Stat({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: React.ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <div className="rounded-xl border p-3 hover:ring-1 hover:ring-primary/20 transition-shadow">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          {Icon ? <Icon className="h-6 w-6" /> : null}
          <span>{title}</span>
        </div>
        <Badge variant="secondary">ISO</Badge>
      </div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}
