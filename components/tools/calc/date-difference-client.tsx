"use client";

import { Calendar, CalendarDays, CalendarRange, Info, RefreshCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { ActionButton, CopyButton, ResetButton } from "@/components/shared/action-buttons";
import InputField from "@/components/shared/form-fields/input-field";
import SwitchRow from "@/components/shared/form-fields/switch-row";
import Stat from "@/components/shared/stat";
import ToolPageHeader from "@/components/shared/tool-page-header";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Separator } from "@/components/ui/separator";

// Types
type PresetRange = "today" | "yesterday" | "last7" | "last30" | "thisMonth";
type StatItem = { key: string; label: string; value: string; className?: string };

/* Date helpers */

// Calendar-style Y/M/D diff + running totals
function diffYMD(a: Date, b: Date) {
  let from = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  let to = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  if (to < from) [from, to] = [to, from];

  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthDays = new Date(to.getFullYear(), to.getMonth(), 0).getDate();
    days += prevMonthDays;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }

  const ms = Math.abs(b.getTime() - a.getTime());
  const totalDays = Math.floor(ms / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const totalHours = Math.floor(ms / (1000 * 60 * 60));
  const totalMinutes = Math.floor(ms / (1000 * 60));
  const totalSeconds = Math.floor(ms / 1000);
  return { years, months, days, totalDays, totalWeeks, totalHours, totalMinutes, totalSeconds };
}

// Count business days (Mon–Fri).
function businessDaysBetween(a: Date, b: Date, inclusive = false) {
  const [from, to] = a <= b ? [a, b] : [b, a];
  let days = 0;
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  if (inclusive) {
    end.setDate(end.getDate() + 1);
  }
  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    const wd = d.getDay();
    if (wd !== 0 && wd !== 6) days++;
  }
  return days;
}

const fmt = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "2-digit",
});

export default function DateDifferenceClient() {
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [inclusive, setInclusive] = useState<boolean>(false);

  const parsed = useMemo(() => {
    if (!start || !end) return null;
    const a = new Date(start);
    const b = new Date(end);
    const isInvalidDate = (d: Date) => Number.isNaN(d.getTime());
    if (isInvalidDate(a) || isInvalidDate(b)) return null;

    const base = diffYMD(a, b);

    // If inclusive, totals +1 day (calendar Y/M/D stays)
    const totals = inclusive
      ? {
          ...base,
          totalDays: base.totalDays + 1,
          totalWeeks: Math.floor((base.totalDays + 1) / 7),
          totalHours: (base.totalDays + 1) * 24,
          totalMinutes: (base.totalDays + 1) * 24 * 60,
          totalSeconds: (base.totalDays + 1) * 24 * 60 * 60,
        }
      : base;

    const biz = businessDaysBetween(a, b, inclusive);
    const aFmt = fmt.format(a);
    const bFmt = fmt.format(b);

    return { ...totals, a, b, aFmt, bFmt, bizDays: biz };
  }, [start, end, inclusive]);

  const swap = () => {
    setStart((s) => {
      const t = end;
      setEnd(s);
      return t;
    });
  };

  const setTodayStart = () => setStart(new Date().toISOString().split("T")[0]);
  const setTodayEnd = () => setEnd(new Date().toISOString().split("T")[0]);

  // Quick presets
  const preset = (range: "today" | "yesterday" | "last7" | "last30" | "thisMonth") => {
    const now = new Date();
    const to = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (range === "today") {
      setStart(to.toISOString().split("T")[0]);
      setEnd(to.toISOString().split("T")[0]);
      setInclusive(false);
      return;
    }
    if (range === "yesterday") {
      const y = new Date(to);
      y.setDate(y.getDate() - 1);
      setStart(y.toISOString().split("T")[0]);
      setEnd(y.toISOString().split("T")[0]);
      setInclusive(false);
      return;
    }
    if (range === "last7") {
      const from = new Date(to);
      from.setDate(from.getDate() - 6);
      setStart(from.toISOString().split("T")[0]);
      setEnd(to.toISOString().split("T")[0]);
      setInclusive(true);
      return;
    }
    if (range === "last30") {
      const from = new Date(to);
      from.setDate(from.getDate() - 29);
      setStart(from.toISOString().split("T")[0]);
      setEnd(to.toISOString().split("T")[0]);
      setInclusive(true);
      return;
    }
    if (range === "thisMonth") {
      const first = new Date(to.getFullYear(), to.getMonth(), 1);
      setStart(first.toISOString().split("T")[0]);
      setEnd(to.toISOString().split("T")[0]);
      setInclusive(true);
      return;
    }
  };

  const resetAll = () => {
    setStart("");
    setEnd("");
    setInclusive(false);
  };

  const summary = useMemo(() => {
    if (!parsed) return "";
    return [
      `Date difference (${parsed.aFmt} → ${parsed.bFmt})${inclusive ? " [inclusive]" : ""}`,
      `Calendar diff: ${parsed.years}y ${parsed.months}m ${parsed.days}d`,
      `Total days: ${parsed.totalDays}`,
      `Total weeks: ${parsed.totalWeeks}`,
      `Total hours: ${parsed.totalHours}`,
      `Total minutes: ${parsed.totalMinutes}`,
      `Total seconds: ${parsed.totalSeconds}`,
      `Business days (Mon–Fri): ${parsed.bizDays}`,
    ].join("\n");
  }, [parsed, inclusive]);

  const QUICK_PRESETS: ReadonlyArray<{ label: string; value: PresetRange }> = [
    { label: "Today", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "Last 7 days", value: "last7" },
    { label: "Last 30 days", value: "last30" },
    { label: "This month", value: "thisMonth" },
  ] as const;

  const statItems = useMemo<StatItem[]>(() => {
    const dash = "—";
    return [
      {
        key: "cal",
        label: "Calendar diff",
        value: parsed ? `${parsed.years}y ${parsed.months}m ${parsed.days}d` : dash,
      },
      { key: "days", label: "Total days", value: parsed ? String(parsed.totalDays) : dash },
      { key: "weeks", label: "Total weeks", value: parsed ? String(parsed.totalWeeks) : dash },
      { key: "hours", label: "Total hours", value: parsed ? String(parsed.totalHours) : dash },
      {
        key: "minutes",
        label: "Total minutes",
        value: parsed ? String(parsed.totalMinutes) : dash,
      },
      {
        key: "seconds",
        label: "Total seconds",
        value: parsed ? String(parsed.totalSeconds) : dash,
      },
      {
        key: "biz",
        label: "Business days (Mon–Fri)",
        value: parsed ? String(parsed.bizDays) : dash,
        className: "md:col-span-2",
      },
    ];
  }, [parsed]);

  return (
    <>
      {/* Header */}
      <ToolPageHeader
        icon={CalendarRange}
        title="Date Difference"
        description="Uses your local timezone. Toggle inclusive to count both start and end dates."
        actions={
          <>
            <ResetButton onClick={resetAll} />
            <ActionButton variant="outline" icon={RefreshCcw} label="Swap" onClick={swap} />
            <CopyButton
              variant="default"
              label="Copy Summary"
              getText={() => summary}
              disabled={!summary}
            />
          </>
        }
      />

      {/* Inputs */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Pick Dates
          </CardTitle>
          <CardDescription>
            Quick presets or pick any two dates. Local timezone is applied.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Presets */}
          <div className="flex flex-wrap gap-2 pb-4">
            {QUICK_PRESETS.map((p) => (
              <ActionButton
                key={p.value}
                variant="secondary"
                size="sm"
                label={p.label}
                onClick={() => preset(p.value)}
              />
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr] md:items-end">
            <div className="grid gap-2">
              <InputField
                label="Start date"
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
              <ActionButton
                variant="outline"
                size="sm"
                icon={CalendarDays}
                label="Today"
                onClick={setTodayStart}
              />
            </div>

            <div className="flex items-end justify-center">
              <ActionButton variant="outline" icon={RefreshCcw} label="Swap" onClick={swap} />
            </div>

            <div className="grid gap-2">
              <InputField
                label="End date"
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
              <ActionButton
                variant="outline"
                size="sm"
                icon={CalendarDays}
                label="Today"
                onClick={setTodayEnd}
              />
            </div>
          </div>

          {/* Inclusive toggle */}
          <div className="mt-4">
            <SwitchRow
              label="Count both start and end dates (inclusive)"
              checked={inclusive}
              onCheckedChange={setInclusive}
            />
          </div>

          <Separator className="my-6" />

          {/* Results */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {statItems.map((s) => (
              <Stat key={s.key} label={s.label} value={s.value} className={s.className} />
            ))}

            <GlassCard className="p-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Range</div>
                <div className="text-sm font-medium">
                  {parsed
                    ? `${parsed.aFmt} → ${parsed.bFmt}${inclusive ? " (inclusive)" : ""}`
                    : "—"}
                </div>
                <div className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
                  <Info className="mt-0.5 h-3.5 w-3.5" />
                  <span>
                    Calendar diff shows Y/M/D; totals are day-based. Business days exclude weekends;
                    holidays not excluded.
                  </span>
                </div>
              </div>
            </GlassCard>
          </div>
        </CardContent>
      </GlassCard>
    </>
  );
}
