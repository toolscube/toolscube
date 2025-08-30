'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard, MotionGlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Cake, Calendar, Check, Clock, Copy, HeartPulse, Info, RotateCcw, Share2 } from 'lucide-react';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';

// ----------------- Helpers -----------------
const pad = (n: number, w = 2) => n.toString().padStart(w, '0');
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
  // very light sanity to avoid invalid native input complaining
  const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(s);
  if (!m) return s;
  const y = Math.max(1, Math.min(275760, Number(m[1]))); // JS max year
  const mm = Math.max(1, Math.min(12, Number(m[2])));
  const daysInMonth = new Date(y, mm, 0).getDate();
  const dd = Math.max(1, Math.min(daysInMonth, Number(m[3])));
  return `${pad(y, 4)}-${pad(mm)}-${pad(dd)}`;
}

function getLocalTimeZone(): string {
  try {
    // @ts-ignore
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

// Robust calendar-diff in Y/M/D using incremental approach to respect month lengths & leap years
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
  const candidate = new Date(y, fromDob.getMonth(), fromDob.getDate(), fromDob.getHours(), fromDob.getMinutes(), 0, 0);
  if (candidate < now) {
    candidate.setFullYear(y + 1);
  }
  return candidate;
}

function shortDate(d: Date, timeZone?: string) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    weekday: 'short',
  }).format(d);
}

// ----------------- Component -----------------
export default function AgeCalculatorPage() {
  const deviceTz = useMemo(() => getLocalTimeZone(), []);

  // Inputs
  const [hasTime, setHasTime] = useState(false);
  const [dobDate, setDobDate] = useState<string>('');
  const [dobTime, setDobTime] = useState<string>('00:00');

  // Live clock (so "seconds alive" moves)
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);

  // Parse DOB
  const birth: Date | null = useMemo(() => {
    if (!dobDate) return null;
    const safe = clampDateString(dobDate);
    const [y, m, d] = safe.split('-').map((n) => Number(n));
    const [hh, mm] = (hasTime ? dobTime : '00:00').split(':').map((n) => Number(n));
    const dt = new Date(y, m - 1, d, hh, mm, 0, 0);
    return isNaN(dt.getTime()) ? null : dt;
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
      weekday: new Intl.DateTimeFormat('en-GB', { weekday: 'long' }).format(nb),
    };

    // Milestones
    const milestones = [
      { label: '10,000th day', at: new Date(birth.getTime() + 10000 * msIn.day) },
      { label: '20,000th day', at: new Date(birth.getTime() + 20000 * msIn.day) },
      { label: '1 billion seconds', at: new Date(birth.getTime() + 1_000_000_000 * msIn.second) },
    ];

    return { ymd, total, nb, until, milestones };
  }, [birth, now]);

  // Share / Copy
  const [copied, setCopied] = useState<'link' | 'stats' | ''>('');
  const copyStats = async () => {
    if (!birth || !results) return;
    const s = `Age: ${results.ymd.years}y ${results.ymd.months}m ${results.ymd.days}d\nBorn: ${shortDate(birth)}\nTotal: ${results.total.days} days, ${results.total.hours} hours\nNext birthday: ${
      results.until.exact
    } (${results.until.days} days)`;
    await navigator.clipboard.writeText(s);
    setCopied('stats');
    setTimeout(() => setCopied(''), 1400);
  };
  const copyLink = async () => {
    const params = new URLSearchParams();
    if (dobDate) params.set('date', dobDate);
    if (hasTime) params.set('time', dobTime);
    const link = `${window.location.pathname}?${params.toString()}`;
    await navigator.clipboard.writeText(window.location.origin + link);
    setCopied('link');
    setTimeout(() => setCopied(''), 1400);
  };

  const applyToday = () => {
    const d = new Date();
    setDobDate(formatDateInput(d));
    setDobTime(formatTimeInput(d));
  };

  const resetAll = () => {
    setHasTime(false);
    setDobDate('');
    setDobTime('00:00');
  };

  // Hydrate from URL (if any)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const p = new URLSearchParams(window.location.search);
    const date = p.get('date');
    const time = p.get('time');
    if (date) setDobDate(date);
    if (time) {
      setDobTime(time);
      setHasTime(true);
    }
  }, []);

  return (
    <div className="space-y-4">
      <MotionGlassCard>
        {/* HEADER */}
        <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <HeartPulse className="h-6 w-6" /> Age Calculator
            </h1>
            <p className="text-sm text-muted-foreground">Find exact age in years, months, days — plus next birthday and fun milestones.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={resetAll} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
            <Button variant="outline" onClick={applyToday} className="gap-2">
              <Calendar className="h-4 w-4" /> Use today
            </Button>
            <Button onClick={copyLink} className="gap-2">
              {copied === 'link' ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
              {copied === 'link' ? 'Copied' : 'Copy link'}
            </Button>
          </div>
        </GlassCard>

        {/* INPUTS */}
        <GlassCard className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Your Birth Details</CardTitle>
            <CardDescription>
              Enter date (and optionally time) of birth. We use your device zone: <span className="font-medium">{deviceTz}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dob-date">Date of Birth</Label>
              <div className="flex items-center gap-2">
                <Input id="dob-date" type="date" value={dobDate} onChange={(e) => setDobDate(clampDateString(e.target.value))} />
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob-time" className={cn(!hasTime && 'opacity-50')}>
                Time of Birth (optional)
              </Label>
              <div className="flex items-center gap-2">
                <Input id="dob-time" type="time" value={dobTime} onChange={(e) => setDobTime(e.target.value)} disabled={!hasTime} />
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
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
                  <Stat title="Age" value={`${results.ymd.years}y ${results.ymd.months}m ${results.ymd.days}d`} hint={`Born ${shortDate(birth)}`} />
                  <Stat title="Total Days" value={results.total.days.toLocaleString()} hint={`${results.total.hours.toLocaleString()} hours`} />
                  <Stat title="Total Minutes" value={results.total.minutes.toLocaleString()} hint={`${results.total.seconds.toLocaleString()} seconds`} />
                  <Stat title="Next Birthday" value={`${results.until.days} days`} hint={`${results.until.weekday}, ${results.until.exact}`} icon={<Cake className="h-4 w-4" />} />
                </div>

                {/* Timeline-ish summary */}
                <div className="rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <div>
                        <span className="text-muted-foreground">Born:</span> <span className="font-medium">{shortDate(birth)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">As of now:</span> <span className="font-medium">{shortDate(now)}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="gap-2" onClick={copyStats}>
                      {copied === 'stats' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied === 'stats' ? 'Copied' : 'Copy summary'}
                    </Button>
                  </div>
                </div>

                {/* Fun milestones */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Milestones</h3>
                  <div className="grid gap-2 md:grid-cols-2">
                    {results.milestones.map((m) => (
                      <div key={m.label} className="flex items-center justify-between rounded-md border p-3">
                        <div className="space-y-0.5">
                          <div className="font-medium">{m.label}</div>
                          <div className="text-xs text-muted-foreground">{shortDate(m.at)}</div>
                        </div>
                        <Badge variant={m.at < now ? 'secondary' : 'default'}>{m.at < now ? 'Passed' : 'Upcoming'}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </GlassCard>
      </MotionGlassCard>
    </div>
  );
}

function Stat({ title, value, hint, icon }: { title: string; value: React.ReactNode; hint?: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-md border p-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{title}</div>
        {icon ? icon : <HeartPulse className="h-4 w-4 text-muted-foreground" />}
      </div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}
