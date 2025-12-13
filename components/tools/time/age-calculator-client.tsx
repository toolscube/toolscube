"use client";

import {
  ActionButton,
  CopyButton,
  ResetButton,
} from "@/components/shared/action-buttons";
import InputField from "@/components/shared/form-fields/input-field";
import Stat from "@/components/shared/stat";
import ToolPageHeader from "@/components/shared/tool-page-header";
import { Badge } from "@/components/ui/badge";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  cn,
  formatDateInput,
  formatTimeInput,
  getLocalTimeZone,
} from "@/lib/utils";
import {
  clampDateString,
  diffYMD,
  msIn,
  nextBirthday,
  shortDate,
} from "@/lib/utils/time/age-calculator";
import { Cake, Calendar, HeartPulse, Info } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function AgeCalculatorClient() {
  const deviceTz = useMemo(() => getLocalTimeZone(), []);

  const [hasTime, setHasTime] = useState(false);
  const [dobDate, setDobDate] = useState<string>("");
  const [dobTime, setDobTime] = useState<string>("00:00");

  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const birth: Date | null = useMemo(() => {
    if (!dobDate) return null;
    const safe = clampDateString(dobDate);
    const [y, m, d] = safe.split("-").map(Number);
    const [hh, mm] = (hasTime ? dobTime : "00:00").split(":").map(Number);
    const dt = new Date(y, m - 1, d, hh, mm, 0, 0);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }, [dobDate, dobTime, hasTime]);

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

    const milestones = [
      { label: "10,000th day", at: new Date(birth.getTime() + 10000 * msIn.day) },
      { label: "20,000th day", at: new Date(birth.getTime() + 20000 * msIn.day) },
      { label: "1 billion seconds", at: new Date(birth.getTime() + 1_000_000_000 * msIn.second) },
    ];

    return { ymd, total, nb, until, milestones };
  }, [birth, now]);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const date = p.get("date");
    const time = p.get("time");
    if (date) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDobDate(date);
    }
    if (time) {
      setDobTime(time);
      setHasTime(true);
    }
  }, []);

  const shareLink = useMemo(() => {
    if (typeof window === "undefined") return "";
    const url = new URL(window.location.href);
    if (dobDate) url.searchParams.set("date", dobDate);
    else url.searchParams.delete("date");
    if (hasTime) url.searchParams.set("time", dobTime);
    else url.searchParams.delete("time");
    return url.toString();
  }, [dobDate, dobTime, hasTime]);

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
            <CopyButton variant="default" getText={() => shareLink || ""} label="Copy link" />
          </>
        }
      />

      {/* INPUTS */}
      <GlassCard>
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
      <GlassCard>
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
