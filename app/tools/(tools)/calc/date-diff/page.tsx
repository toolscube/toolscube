'use client';

import Stat from '@/components/root/stat';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard, MotionGlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calendar, CalendarDays, CalendarRange, Copy, Info, RefreshCcw, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

// Calendar-style Y/M/D diff + running totals (based on local timezone)
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

// Count business days (Mon–Fri). Inclusive toggle supported.
function businessDaysBetween(a: Date, b: Date, inclusive = false) {
  let [from, to] = a <= b ? [a, b] : [b, a];
  let days = 0;
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  if (inclusive) {
    end.setDate(end.getDate() + 1);
  }
  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    const wd = d.getDay(); // 0=Sun,6=Sat
    if (wd !== 0 && wd !== 6) days++;
  }
  return days;
}

const fmt = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
});

export default function DateDiffPage() {
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');
  const [inclusive, setInclusive] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => {
    if (!start || !end) return null;
    const a = new Date(start);
    const b = new Date(end);
    if (isNaN(a.getTime()) || isNaN(b.getTime())) return null;

    const base = diffYMD(a, b);

    // inclusive হলে totals +1 day (calendar Y/M/D নয়)
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

  const setTodayStart = () => setStart(new Date().toISOString().split('T')[0]);
  const setTodayEnd = () => setEnd(new Date().toISOString().split('T')[0]);

  // Quick presets
  const preset = (range: 'today' | 'yesterday' | 'last7' | 'last30' | 'thisMonth') => {
    const now = new Date();
    const to = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (range === 'today') {
      setStart(to.toISOString().split('T')[0]);
      setEnd(to.toISOString().split('T')[0]);
      return;
    }
    if (range === 'yesterday') {
      const y = new Date(to);
      y.setDate(y.getDate() - 1);
      setStart(y.toISOString().split('T')[0]);
      setEnd(y.toISOString().split('T')[0]);
      return;
    }
    if (range === 'last7') {
      const from = new Date(to);
      from.setDate(from.getDate() - 6);
      setStart(from.toISOString().split('T')[0]);
      setEnd(to.toISOString().split('T')[0]);
      setInclusive(true);
      return;
    }
    if (range === 'last30') {
      const from = new Date(to);
      from.setDate(from.getDate() - 29);
      setStart(from.toISOString().split('T')[0]);
      setEnd(to.toISOString().split('T')[0]);
      setInclusive(true);
      return;
    }
    if (range === 'thisMonth') {
      const first = new Date(to.getFullYear(), to.getMonth(), 1);
      setStart(first.toISOString().split('T')[0]);
      setEnd(to.toISOString().split('T')[0]);
      setInclusive(true);
      return;
    }
  };

  const resetAll = () => {
    setStart('');
    setEnd('');
    setInclusive(false);
    setCopied(false);
  };

  const copySummary = async () => {
    if (!parsed) return;
    const lines = [
      `Date difference (${parsed.aFmt} → ${parsed.bFmt})${inclusive ? ' [inclusive]' : ''}`,
      `Calendar diff: ${parsed.years}y ${parsed.months}m ${parsed.days}d`,
      `Total days: ${parsed.totalDays}`,
      `Total weeks: ${parsed.totalWeeks}`,
      `Total hours: ${parsed.totalHours}`,
      `Total minutes: ${parsed.totalMinutes}`,
      `Total seconds: ${parsed.totalSeconds}`,
      `Business days (Mon–Fri): ${parsed.bizDays}`,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(lines);
      setCopied(true);
      toast.success('Summary copied!');
      setTimeout(() => setCopied(false), 1000);
    } catch {
      toast.error('Copy failed');
    }
  };

  return (
    <div className="py-10 space-y-8">
      <MotionGlassCard className="space-y-4">
        {/* Flowing Action Header */}
        <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 py-5">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <CalendarRange className="h-6 w-6" /> Date Difference
            </h1>
            <p className="text-sm text-muted-foreground">Uses your local timezone. Toggle inclusive to count both start and end dates.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={resetAll} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
            <Button variant="outline" onClick={swap} className="gap-2">
              <RefreshCcw className="h-4 w-4" /> Swap
            </Button>
            <Button variant="outline" onClick={copySummary} className="gap-2">
              <Copy className={`h-4 w-4 ${copied ? 'animate-pulse' : ''}`} /> Copy
            </Button>
          </div>
        </GlassCard>

        {/* Inputs */}
        <GlassCard className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" /> Pick Dates
            </CardTitle>
            <CardDescription>Quick presets or pick any two dates. Local timezone is applied.</CardDescription>
          </CardHeader>

          <CardContent>
            {/* Presets */}
            <div className="flex flex-wrap gap-2 pb-4">
              <Button variant="secondary" size="sm" onClick={() => preset('today')}>
                Today
              </Button>
              <Button variant="secondary" size="sm" onClick={() => preset('yesterday')}>
                Yesterday
              </Button>
              <Button variant="secondary" size="sm" onClick={() => preset('last7')}>
                Last 7 days
              </Button>
              <Button variant="secondary" size="sm" onClick={() => preset('last30')}>
                Last 30 days
              </Button>
              <Button variant="secondary" size="sm" onClick={() => preset('thisMonth')}>
                This month
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr] md:items-end">
              <GlassCard className="p-4">
                <div className="grid gap-2">
                  <Label>Start date</Label>
                  <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
                  <Button variant="outline" size="sm" onClick={setTodayStart} className="mt-2 flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" /> Today
                  </Button>
                </div>
              </GlassCard>

              <div className="flex items-end justify-center">
                <button onClick={swap} className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm hover:bg-primary/10" title="Swap start/end">
                  <RefreshCcw className="h-4 w-4" /> Swap
                </button>
              </div>

              <GlassCard className="p-4">
                <div className="grid gap-2">
                  <Label>End date</Label>
                  <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
                  <Button variant="outline" size="sm" onClick={setTodayEnd} className="mt-2 flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" /> Today
                  </Button>
                </div>
              </GlassCard>
            </div>

            {/* Inclusive toggle */}
            <div className="mt-4 flex items-center gap-3 text-sm">
              <input id="inclusive" type="checkbox" checked={inclusive} onChange={(e) => setInclusive(e.target.checked)} className="h-4 w-4 accent-primary" />
              <label htmlFor="inclusive" className="select-none">
                Count both start and end dates (inclusive)
              </label>
            </div>

            <Separator className="my-6" />

            {/* Results */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <GlassCard className="p-4">
                <Stat label="Calendar diff" value={parsed ? `${parsed.years}y ${parsed.months}m ${parsed.days}d` : '—'} />
              </GlassCard>
              <GlassCard className="p-4">
                <Stat label="Total days" value={parsed ? String(parsed.totalDays) : '—'} />
              </GlassCard>
              <GlassCard className="p-4">
                <Stat label="Total weeks" value={parsed ? String(parsed.totalWeeks) : '—'} />
              </GlassCard>
              <GlassCard className="p-4">
                <Stat label="Total hours" value={parsed ? String(parsed.totalHours) : '—'} />
              </GlassCard>
              <GlassCard className="p-4">
                <Stat label="Total minutes" value={parsed ? String(parsed.totalMinutes) : '—'} />
              </GlassCard>
              <GlassCard className="p-4">
                <Stat label="Total seconds" value={parsed ? String(parsed.totalSeconds) : '—'} />
              </GlassCard>
              <GlassCard className="p-4 md:col-span-2">
                <Stat label="Business days (Mon–Fri)" value={parsed ? String(parsed.bizDays) : '—'} />
              </GlassCard>
              <GlassCard className="p-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Range</div>
                  <div className="text-sm font-medium">{parsed ? `${parsed.aFmt} → ${parsed.bFmt}${inclusive ? ' (inclusive)' : ''}` : '—'}</div>
                  <div className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
                    <Info className="mt-0.5 h-3.5 w-3.5" />
                    <span>Calendar diff shows Y/M/D; totals are day-based. Business days exclude weekends; holidays not excluded.</span>
                  </div>
                </div>
              </GlassCard>
            </div>
          </CardContent>
        </GlassCard>
      </MotionGlassCard>
    </div>
  );
}
