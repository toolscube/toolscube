'use client';

import SectionHeader from '@/components/root/section-header';
import Stat from '@/components/root/stat';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard, MotionGlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calendar, CalendarDays, RefreshCcw } from 'lucide-react';
import { useMemo, useState } from 'react';

function diffYMD(a: Date, b: Date) {
  let from = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  let to = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  if (to < from) [from, to] = [to, from];

  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(to.getFullYear(), to.getMonth(), 0).getDate();
    days += prevMonth;
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

export default function DateDiffPage() {
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');

  const out = useMemo(() => {
    if (!start || !end) return null;
    const a = new Date(start);
    const b = new Date(end);
    if (isNaN(a.getTime()) || isNaN(b.getTime())) return null;
    return diffYMD(a, b);
  }, [start, end]);

  const swap = () => {
    setStart((s) => {
      const t = end;
      setEnd(s);
      return t;
    });
  };

  const setTodayStart = () => setStart(new Date().toISOString().split('T')[0]);
  const setTodayEnd = () => setEnd(new Date().toISOString().split('T')[0]);

  return (
    <div className="py-10 space-y-8">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/tools">Tools</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/tools/calc">Calculators</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Date Difference</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <SectionHeader title="Date Difference Calculator" desc="Find the exact time between two dates in years, months, days — plus totals in weeks, hours, minutes, and seconds." />

      {/* Calculator Card */}
      <MotionGlassCard>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Pick Dates
          </CardTitle>
          <CardDescription>Uses your local timezone for calculations.</CardDescription>
        </CardHeader>
        <CardContent>
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
              <button onClick={swap} className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm hover:bg-primary/10">
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

          <Separator className="my-6" />

          {/* Results */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <GlassCard className="p-4">
              <Stat label="Calendar diff" value={out ? `${out.years}y ${out.months}m ${out.days}d` : '—'} />
            </GlassCard>
            <GlassCard className="p-4">
              <Stat label="Total days" value={out ? String(out.totalDays) : '—'} />
            </GlassCard>
            <GlassCard className="p-4">
              <Stat label="Total weeks" value={out ? String(out.totalWeeks) : '—'} />
            </GlassCard>
            <GlassCard className="p-4">
              <Stat label="Total hours" value={out ? String(out.totalHours) : '—'} />
            </GlassCard>
            <GlassCard className="p-4">
              <Stat label="Total minutes" value={out ? String(out.totalMinutes) : '—'} />
            </GlassCard>
            <GlassCard className="p-4">
              <Stat label="Total seconds" value={out ? String(out.totalSeconds) : '—'} />
            </GlassCard>
          </div>
        </CardContent>
      </MotionGlassCard>
    </div>
  );
}
