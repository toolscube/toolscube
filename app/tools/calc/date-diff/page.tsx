'use client';

import SectionHeader from '@/components/root/section-header';
import Stat from '@/components/root/stat';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useMemo, useState } from 'react';

function diffYMD(a: Date, b: Date) {
  // Compute calendar diff in years, months, days
  let from = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  let to = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  if (to < from) [from, to] = [to, from];

  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();

  if (days < 0) {
    // borrow from previous month
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

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <SectionHeader title="Date Difference Calculator" desc="Find the exact time between two dates in years, months, days — plus totals in weeks, hours, minutes, and seconds." />

      <Card className="backdrop-blur supports-[backdrop-filter]:bg-background/80 border-muted/40">
        <CardHeader>
          <CardTitle>Pick dates</CardTitle>
          <CardDescription>Uses your local timezone for calculations.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr] md:items-end">
            <div className="grid gap-2">
              <Label>Start date</Label>
              <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="flex items-end justify-center">
              <Button variant="outline" className="mt-2 md:mt-0" onClick={swap}>
                Swap
              </Button>
            </div>
            <div className="grid gap-2">
              <Label>End date</Label>
              <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid gap-4 sm:grid-cols-2">
            <Stat label="Calendar diff" value={out ? `${out.years}y ${out.months}m ${out.days}d` : '—'} />
            <Stat label="Total days" value={out ? String(out.totalDays) : '—'} />
            <Stat label="Total weeks" value={out ? String(out.totalWeeks) : '—'} />
            <Stat label="Total hours" value={out ? String(out.totalHours) : '—'} />
            <Stat label="Total minutes" value={out ? String(out.totalMinutes) : '—'} />
            <Stat label="Total seconds" value={out ? String(out.totalSeconds) : '—'} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Reuse SectionHeader & Stat components from BMI page in this file scope
