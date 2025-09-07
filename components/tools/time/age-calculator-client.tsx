"use client";

import { Cake, Calendar, HeartPulse, Info } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ActionButton, CopyButton, ResetButton } from "@/components/shared/action-buttons";
import InputField from "@/components/shared/form-fields/input-field";
import Stat from "@/components/shared/stat";
import ToolPageHeader from "@/components/shared/tool-page-header";
import { Badge } from "@/components/ui/badge";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

// Helpers
const pad = (n: number, w = 2) => n.toString().padStart(w, "0");
const msIn = {
  second: 1000,
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
};

function formatDateInput(d: Date): string {
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  return `${y}-${m}-${day}`;
}

function formatTimeInput(d: Date): string {
  const h = pad(d.getHours());
  const m = pad(d.getMinutes());
  return `${h}:${m}`;
}

function clampDateString(s: string) {
  const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(s);
  if (!m) return s;
  const y = Math.max(1, Math.min(275760, Number(m[1])));
  const mm = Math.max(1, Math.min(12, Number(m[2])));
  const daysInMonth = new Date(y, mm, 0).getDate();
  const dd = Math.max(1, Math.min(daysInMonth, Number(m[3])));
  return `${pad(y, 4)}-${pad(mm)}-${pad(dd)}`;
}

function getLocalTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function diffYMD(from: Date, to: Date) {
  if (to < from) return { years: 0, months: 0, days: 0 };
  const a = new Date(from.getTime());
  let years = 0,
    months = 0,
    days = 0;

  // years
  while (true) {
    const next = new Date(a);
    next.setFullYear(next.getFullYear() + 1);
    if (next <= to) {
      a.setFullYear(a.getFullYear() + 1);
      years++;
    } else break;
  }
  // months
  while (true) {
    const next = new Date(a);
    next.setMonth(next.getMonth() + 1);
    if (next <= to) {
      a.setMonth(a.getMonth() + 1);
      months++;
    } else break;
  }
  // days
  while (true) {
    const next = new Date(a.getTime() + msIn.day);
    if (next <= to) {
      a.setDate(a.getDate() + 1);
      days++;
    } else break;
  }
  return { years, months, days };
}

function nextBirthday(fromDob: Date, now: Date) {
  const y = now.getFullYear();
  const candidate = new Date(
    y,
    fromDob.getMonth(),
    fromDob.getDate(),
    fromDob.getHours(),
    fromDob.getMinutes(),
    0,
    0,
  );
  if (candidate < now) {
    candidate.setFullYear(y + 1);
  }
  return candidate;
}

function shortDate(d: Date, timeZone?: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "short",
    day: "2-digit",
    weekday: "short",
  }).format(d);
}

export default function AgeCalculatorClient() {
  const deviceTz = useMemo(() => getLocalTimeZone(), []);

  // Inputs
  const [hasTime, setHasTime] = useState(false);
  const [dobDate, setDobDate] = useState<string>("");
  const [dobTime, setDobTime] = useState<string>("00:00");

  // Live clock
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);

  // Parse DOB
  const birth: Date | null = useMemo(() => {
    if (!dobDate) return null;
    const safe = clampDateString(dobDate);
    const [y, m, d] = safe.split("-").map(Number);
    const [hh, mm] = (hasTime ? dobTime : "00:00").split(":").map(Number);
    const dt = new Date(y, m - 1, d, hh, mm, 0, 0);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }, [dobDate, dobTime, hasTime]);

  // Calculations
  const results = useMemo(() => {
    if (!birth) return null;
    const to = now;
    const ymd = diffYMD(birth, to);

    const diffMs = to.getTime() - birth.getTime();
    const total = {
      days: Math.floor(diffMs / msIn.day),
      hours: Math.floor(diffMs / msIn.hour),
      minutes: Math.floor(diffMs / msIn.minute),
      seconds: Math.floor(diffMs / msIn.second),
    };

    const nb = nextBirthday(birth, to);
    const untilMs = nb.getTime() - to.getTime();
    const until = {
      days: Math.ceil(untilMs / msIn.day),
      exact: shortDate(nb),
      weekday: new Intl.DateTimeFormat("en-GB", { weekday: "long" }).format(nb),
    };

    // Milestones
    const milestones = [
      { label: "10,000th day", at: new Date(birth.getTime() + 10000 * msIn.day) },
      { label: "20,000th day", at: new Date(birth.getTime() + 20000 * msIn.day) },
      { label: "1 billion seconds", at: new Date(birth.getTime() + 1_000_000_000 * msIn.second) },
    ];

    return { ymd, total, nb, until, milestones };
  }, [birth, now]);

  const applyToday = () => {
    const d = new Date();
    setDobDate(formatDateInput(d));
    setDobTime(formatTimeInput(d));
  };

  const resetAll = () => {
    setHasTime(false);
    setDobDate("");
    setDobTime("00:00");
  };

  // Hydrate from URL
  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search);
    const date = p.get("date");
    const time = p.get("time");
    if (date) setDobDate(date);
    if (time) {
      setDobTime(time);
      setHasTime(true);
    }
  }, []);

  const params = new URLSearchParams();
  if (dobDate) params.set("date", dobDate);
  if (hasTime) params.set("time", dobTime);
  const link = `${window.location.href}?${params.toString()}`;

  const summary =
    birth && results
      ? `Age: ${results?.ymd.years}y ${results?.ymd.months}m ${results?.ymd.days}d
Born: ${shortDate(birth)}
Total: ${results?.total.days} days, ${results?.total.hours} hours
Next birthday: ${results?.until.exact} (${results?.until.days} days)`
      : "";

     const stats = [
      {
        label: "Age",
        value: `${results?.ymd.years}Y ${results?.ymd.months}M ${results?.ymd.days}D`,
        hint: birth ? `Born ${shortDate(birth)}` : "Birth date not set",
      },
      {
        label: "Total Days",
        value: results?.total.days.toLocaleString(),
        hint: `${results?.total.hours.toLocaleString()} Hours`,
      },
      {
        label: "Total Minutes",
        value: results?.total.minutes.toLocaleString(),
        hint: `${results?.total.seconds.toLocaleString()} Seconds`,
      },
      {
        label: "Next Birthday",
        value: `${results?.until.days} Days`,
        hint: `${results?.until.weekday}, ${results?.until.exact}`,
        Icon: Cake,
      },
    ];

  return (
    <>
      {/* HEADER */}
      <ToolPageHeader
        icon={HeartPulse}
        title="Age Calculator"
        description="Find exact age in years, months, days — plus next birthday and fun milestones."
        actions={
          <>
            <ResetButton onClick={resetAll} />
            <ActionButton
              variant="outline"
              icon={Calendar}
              label="Use today"
              onClick={applyToday}
            />
            <CopyButton
              variant="default"
              getText={() => link || ""}
              label="Copy link"
              disabled={!params || !link || !summary}
            />
          </>
        }
      />

      {/* INPUTS */}
      <GlassCard className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Your Birth Details</CardTitle>
          <CardDescription>
            Enter date (and optionally time) of birth. We use your device zone:{" "}
            <span className="font-medium">{deviceTz}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <InputField
            label="Date of Birth"
            id="dob-date"
            type="date"
            value={dobDate}
            onChange={(e) => setDobDate(clampDateString(e.target.value))}
          />

          <div className="space-y-2">
            <InputField
              label="Time of Birth (optional)"
              className={cn(!hasTime && "opacity-50")}
              id="dob-time"
              type="time"
              value={dobTime}
              onChange={(e) => setDobTime(e.target.value)}
              disabled={!hasTime}
            />
            <div className="flex items-center gap-2 mt-1">
              <Switch id="has-time" checked={hasTime} onCheckedChange={setHasTime} />
              <Label htmlFor="has-time">Include time</Label>
            </div>
          </div>
        </CardContent>
      </GlassCard>

      <Separator />

      {/* RESULTS */}
      <GlassCard className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Results</CardTitle>
          <CardDescription>Live as the seconds tick by. Copy a summary to share.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {!birth && (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Info className="h-4 w-4" /> Enter your birth date to see results here.
            </div>
          )}

          {birth && results && (
            <>
              {/* Stats Cards */}
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((s) => (
                  <Stat key={s.label} label={s.label} value={s.value} hint={s.hint} Icon={s.Icon} />
                ))}
              </div>

              {/* Timeline-ish summary */}
              <div className="rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <div>
                      <span className="text-muted-foreground">Born:</span>{" "}
                      <span className="font-medium">{shortDate(birth)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">As of now:</span>{" "}
                      <span className="font-medium">{shortDate(now)}</span>
                    </div>
                  </div>
                  <CopyButton
                    size="sm"
                    variant="outline"
                    getText={() => summary || ""}
                    label="Copy summary"
                  />
                </div>
              </div>

              {/* Fun milestones */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Milestones</h3>
                <div className="grid gap-2 md:grid-cols-2">
                  {results.milestones.map((m) => (
                    <div
                      key={m.label}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div className="space-y-0.5">
                        <div className="font-medium">{m.label}</div>
                        <div className="text-xs text-muted-foreground">{shortDate(m.at)}</div>
                      </div>
                      <Badge variant={m.at < now ? "secondary" : "default"}>
                        {m.at < now ? "Passed" : "Upcoming"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </GlassCard>
    </>
  );
}
