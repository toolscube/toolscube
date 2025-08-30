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
import { AlarmClock, Calendar, Clock, Pause, Play, Plus, RotateCcw, Trash2, Zap } from 'lucide-react';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';

// ----------------- Types -----------------

type Mode = 'countdown' | 'pomodoro' | 'event';

type Timer = {
  id: string;
  label: string;
  mode: Mode;
  running: boolean;
  createdAt: number;
  // Countdown
  durationMs?: number; // original
  remainingMs?: number; // countdown + pomodoro
  // Event
  targetTs?: number; // event time (ms)
  // Pomodoro
  workMs?: number;
  breakMs?: number;
  cycles?: number;
  phase?: 'work' | 'break' | 'done';
  currentCycle?: number; // 1-based
};

// ----------------- Helpers -----------------
const ms = {
  sec: 1000,
  min: 60 * 1000,
  hr: 60 * 60 * 1000,
};

const pad = (n: number, w = 2) => n.toString().padStart(w, '0');

function fmtHMS(totalMs: number) {
  const sign = totalMs < 0 ? '-' : '';
  const t = Math.max(0, Math.abs(totalMs));
  const h = Math.floor(t / ms.hr);
  const m = Math.floor((t % ms.hr) / ms.min);
  const s = Math.floor((t % ms.min) / ms.sec);
  return `${sign}${pad(h)}:${pad(m)}:${pad(s)}`;
}

function progressRatio(remaining: number, duration: number) {
  if (duration <= 0) return 0;
  const r = 1 - Math.min(Math.max(remaining / duration, 0), 1);
  return r;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

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

function parseDateTimeLocal(dateStr: string, timeStr: string) {
  const [y, mo, da] = dateStr.split('-').map(Number);
  const [hh, mm] = timeStr.split(':').map(Number);
  const dt = new Date(y, mo - 1, da, hh, mm, 0, 0);
  return isNaN(dt.getTime()) ? null : dt;
}

function beep() {
  try {
    // Simple WebAudio beep
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = 880;
    o.connect(g);
    g.connect(ctx.destination);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    o.start();
    o.stop(ctx.currentTime + 0.6);
  } catch {}
}

// ----------------- Main Page -----------------
export default function CountdownPage() {
  const [timers, setTimers] = useState<Timer[]>(() => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('th:timers');
      if (raw) {
        try {
          const parsed: Timer[] = JSON.parse(raw);
          return parsed;
        } catch {}
      }
    }
    return [];
  });

  const [sound, setSound] = useState(true);
  const [titleBlink, setTitleBlink] = useState(true);

  // Persist timers
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('th:timers', JSON.stringify(timers));
    }
  }, [timers]);

  // Global tick (250ms)
  useEffect(() => {
    let raf: number | null = null;
    let last = performance.now();

    const tick = (t: number) => {
      const dt = t - last;
      last = t;
      setTimers((prev) => prev.map((tm) => advanceTimer(tm, dt)));
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Title blink when any finished timer exists and titleBlink is true
  useEffect(() => {
    if (!titleBlink) return;
    let interval: number | undefined;
    const anyDone = timers.some((t) => isFinished(t));
    const base = document.title;
    if (anyDone) {
      interval = window.setInterval(() => {
        document.title = document.title.startsWith('⏰') ? base : `⏰ Timer done!`;
      }, 1000);
    } else {
      document.title = base.replace(/^⏰\s+/, '');
    }
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [timers, titleBlink]);

  const addCountdown = (label: string, minutes: number) => {
    const dur = Math.max(1, Math.round(minutes)) * ms.min;
    setTimers((arr) => [...arr, { id: uid(), label, mode: 'countdown', running: false, createdAt: Date.now(), durationMs: dur, remainingMs: dur }]);
  };

  const addMeeting = (minutes: number) => addCountdown(`Meeting ${minutes}m`, minutes);

  const addPomodoro = (workMin = 25, breakMin = 5, cycles = 4) => {
    const workMs = workMin * ms.min;
    const breakMs = breakMin * ms.min;
    setTimers((arr) => [
      ...arr,
      {
        id: uid(),
        label: `Pomodoro ${workMin}/${breakMin} ×${cycles}`,
        mode: 'pomodoro',
        running: false,
        createdAt: Date.now(),
        workMs,
        breakMs,
        cycles,
        phase: 'work',
        currentCycle: 1,
        remainingMs: workMs,
      },
    ]);
  };

  const addEvent = (label: string, target: Date | null) => {
    if (!target) return;
    setTimers((arr) => [...arr, { id: uid(), label: label || 'Event', mode: 'event', running: true, createdAt: Date.now(), targetTs: target.getTime() }]);
  };

  const onRunToggle = (id: string, run: boolean) => {
    setTimers((arr) => arr.map((t) => (t.id === id ? { ...t, running: run } : t)));
  };
  const onReset = (id: string) => {
    setTimers((arr) => arr.map((t) => (t.id === id ? resetTimer(t) : t)));
  };
  const onDelete = (id: string) => setTimers((arr) => arr.filter((t) => t.id !== id));
  const onDeleteAll = () => setTimers([]);

  return (
    <div className="space-y-4">
      <MotionGlassCard>
        {/* HEADER */}
        <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <AlarmClock className="h-6 w-6" /> Countdown / Timer
            </h1>
            <p className="text-sm text-muted-foreground">Pomodoro cycles, quick meeting timers, or a countdown to any date — all in one place.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={onDeleteAll} className="gap-2">
              <Trash2 className="h-4 w-4" /> Clear all
            </Button>
          </div>
        </GlassCard>

        {/* QUICK ADD */}
        <GlassCard className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Quick Start</CardTitle>
            <CardDescription>Create popular timers with one click or customize below.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" onClick={() => addPomodoro(25, 5, 4)} className="justify-start gap-2">
              <Zap className="h-4 w-4" /> Pomodoro 25/5 ×4
            </Button>
            <Button variant="outline" onClick={() => addMeeting(15)} className="justify-start gap-2">
              <Clock className="h-4 w-4" /> Meeting 15m
            </Button>
            <Button variant="outline" onClick={() => addMeeting(30)} className="justify-start gap-2">
              <Clock className="h-4 w-4" /> Meeting 30m
            </Button>
            <Button variant="outline" onClick={() => addMeeting(60)} className="justify-start gap-2">
              <Clock className="h-4 w-4" /> Meeting 60m
            </Button>
          </CardContent>
        </GlassCard>

        {/* CUSTOM BUILDERS */}
        <GlassCard className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Create Your Timer</CardTitle>
            <CardDescription>Fine-tune a countdown, Pomodoro set, or event date/time.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            {/* Countdown */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="cd-label">Countdown Label</Label>
                <Input id="cd-label" placeholder="e.g., Tea break" defaultValue="Countdown" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cd-min">Minutes</Label>
                <Input id="cd-min" type="number" min={1} defaultValue={10} />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    const label = (document.getElementById('cd-label') as HTMLInputElement)?.value || 'Countdown';
                    const mins = Number((document.getElementById('cd-min') as HTMLInputElement)?.value || '10');
                    addCountdown(label, mins);
                  }}>
                  <Plus className="h-4 w-4" /> Add Countdown
                </Button>
              </div>
            </div>

            <Separator />

            {/* Pomodoro */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-8">
              <div className="space-y-2">
                <Label htmlFor="po-work">Work (min)</Label>
                <Input id="po-work" type="number" min={1} defaultValue={25} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="po-break">Break (min)</Label>
                <Input id="po-break" type="number" min={1} defaultValue={5} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="po-cycles">Cycles</Label>
                <Input id="po-cycles" type="number" min={1} defaultValue={4} />
              </div>
              <div className="flex items-end lg:col-span-2">
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    const w = Number((document.getElementById('po-work') as HTMLInputElement)?.value || '25');
                    const b = Number((document.getElementById('po-break') as HTMLInputElement)?.value || '5');
                    const c = Number((document.getElementById('po-cycles') as HTMLInputElement)?.value || '4');
                    addPomodoro(w, b, c);
                  }}>
                  <Plus className="h-4 w-4" /> Add Pomodoro
                </Button>
              </div>
            </div>

            <Separator />

            {/* Event */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-8">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="ev-label">Event Label</Label>
                <Input id="ev-label" placeholder="e.g., Project demo" defaultValue="Event" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ev-date">Date</Label>
                <Input id="ev-date" type="date" defaultValue={formatDateInput(new Date())} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ev-time">Time</Label>
                <Input id="ev-time" type="time" defaultValue={formatTimeInput(new Date())} />
              </div>
              <div className="flex items-end lg:col-span-2">
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    const label = (document.getElementById('ev-label') as HTMLInputElement)?.value || 'Event';
                    const date = (document.getElementById('ev-date') as HTMLInputElement)?.value;
                    const time = (document.getElementById('ev-time') as HTMLInputElement)?.value;
                    addEvent(label, parseDateTimeLocal(date, time));
                  }}>
                  <Plus className="h-4 w-4" /> Add Event
                </Button>
              </div>
            </div>

            <Separator />

            {/* Preferences */}
            <div className="flex flex-wrap items-center gap-4 rounded-md border p-3">
              <div className="flex items-center gap-2">
                <Switch id="pref-snd" checked={sound} onCheckedChange={setSound} />
                <Label htmlFor="pref-snd" className="cursor-pointer">
                  Sound on finish
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="pref-ttl" checked={titleBlink} onCheckedChange={setTitleBlink} />
                <Label htmlFor="pref-ttl" className="cursor-pointer">
                  Blink page title
                </Label>
              </div>
            </div>
          </CardContent>
        </GlassCard>

        {/* ACTIVE TIMERS */}
        <GlassCard className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Active Timers</CardTitle>
            <CardDescription>Start, pause, reset, or remove timers. Pomodoro auto-advances phases.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {timers.length === 0 && <p className="text-sm text-muted-foreground">No timers yet. Create one above.</p>}
            {timers.map((t) => (
              <TimerCard key={t.id} t={t} sound={sound} onRun={(r) => onRunToggle(t.id, r)} onReset={() => onReset(t.id)} onDelete={() => onDelete(t.id)} />
            ))}
          </CardContent>
        </GlassCard>
      </MotionGlassCard>
    </div>
  );
}

// ----------------- Timer Card -----------------
function TimerCard({ t, onRun, onReset, onDelete, sound }: { t: Timer; onRun: (run: boolean) => void; onReset: () => void; onDelete: () => void; sound: boolean }) {
  const isEvent = t.mode === 'event';
  const isPomo = t.mode === 'pomodoro';

  // Compute remaining & duration for display
  const { remaining, duration, subtitle, phaseBadge } = useMemo(() => {
    if (isEvent) {
      const now = Date.now();
      const rem = (t.targetTs || now) - now;
      const lab = rem <= 0 ? 'Happened' : 'Until event';
      return { remaining: rem, duration: Math.max(rem, 1), subtitle: lab, phaseBadge: null as React.ReactNode };
    }
    if (isPomo) {
      const dur = t.phase === 'work' ? t.workMs || 0 : t.phase === 'break' ? t.breakMs || 0 : t.workMs || 0;
      const rem = t.remainingMs || 0;
      const cyc = t.currentCycle || 1;
      const total = t.cycles || 1;
      const badge = <Badge variant={t.phase === 'work' ? 'default' : t.phase === 'break' ? 'secondary' : 'secondary'}>{t.phase === 'done' ? 'Done' : `${t.phase} • ${cyc}/${total}`}</Badge>;
      return { remaining: rem, duration: dur, subtitle: 'Pomodoro', phaseBadge: badge };
    }
    // countdown
    return { remaining: t.remainingMs || 0, duration: t.durationMs || 1, subtitle: 'Countdown', phaseBadge: null as React.ReactNode };
  }, [t, isEvent, isPomo]);

  const ratio = progressRatio(remaining, duration);

  const [justFinished, setJustFinished] = useState(false);
  useEffect(() => {
    if (remaining <= 0) {
      setJustFinished(true);
      if (sound) beep();
      const to = window.setTimeout(() => setJustFinished(false), 1500);
      return () => window.clearTimeout(to);
    }
  }, [remaining, sound]);

  return (
    <div className={cn('rounded-md border p-3 transition-colors', justFinished && 'border-primary')}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {phaseBadge}
          <div className="font-medium truncate">{t.label}</div>
        </div>
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      </div>

      {/* Progress */}
      <div className="mt-2 h-2 w-full overflow-hidden rounded bg-muted">
        <div className="h-2 bg-primary" style={{ width: `${(ratio * 100).toFixed(1)}%` }} />
      </div>

      {/* Time */}
      <div className="mt-2 text-3xl font-semibold tabular-nums">{fmtHMS(remaining)}</div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {!isEvent && (
          <>
            {t.running ? (
              <Button size="sm" variant="outline" className="gap-2" onClick={() => onRun(false)}>
                <Pause className="h-4 w-4" /> Pause
              </Button>
            ) : (
              <Button size="sm" variant="outline" className="gap-2" onClick={() => onRun(true)}>
                <Play className="h-4 w-4" /> Start
              </Button>
            )}
            <Button size="sm" variant="outline" className="gap-2" onClick={onReset}>
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          </>
        )}
        {isEvent && (
          <Badge variant={remaining <= 0 ? 'secondary' : 'default'} className="gap-1">
            <Calendar className="h-3 w-3" /> {remaining <= 0 ? 'Started/Passed' : 'Scheduled'}
          </Badge>
        )}
        <Button size="sm" variant="outline" className="gap-2 ml-auto" onClick={onDelete}>
          <Trash2 className="h-4 w-4" /> Remove
        </Button>
      </div>
    </div>
  );
}

// ----------------- Timer Logic -----------------
function isFinished(t: Timer) {
  if (t.mode === 'event') return (t.targetTs || 0) - Date.now() <= 0;
  if (t.mode === 'pomodoro') return t.phase === 'done';
  return (t.remainingMs || 0) <= 0;
}

function resetTimer(t: Timer): Timer {
  if (t.mode === 'event') return { ...t, running: true };
  if (t.mode === 'pomodoro')
    return {
      ...t,
      running: false,
      phase: 'work',
      currentCycle: 1,
      remainingMs: t.workMs,
    };
  // countdown
  return { ...t, running: false, remainingMs: t.durationMs };
}

function advanceTimer(t: Timer, dtMs: number): Timer {
  if (t.mode === 'event') {
    // event does not change internal state; derived from targetTs
    return t;
  }
  if (!t.running) return t;

  if (t.mode === 'countdown') {
    const rem = Math.max(0, (t.remainingMs || 0) - dtMs);
    return { ...t, remainingMs: rem, running: rem > 0 && t.running };
  }

  if (t.mode === 'pomodoro') {
    let rem = Math.max(0, (t.remainingMs || 0) - dtMs);
    let phase = t.phase || 'work';
    let cyc = t.currentCycle || 1;
    const total = t.cycles || 1;

    if (rem <= 0) {
      // phase finished
      if (phase === 'work') {
        // move to break OR done if last cycle
        if (cyc >= total) {
          return { ...t, phase: 'done', running: false, remainingMs: 0 };
        } else {
          phase = 'break';
          rem = t.breakMs || 0;
        }
      } else if (phase === 'break') {
        // next cycle work
        cyc = Math.min(cyc + 1, total);
        phase = 'work';
        rem = t.workMs || 0;
      }
    }

    return { ...t, remainingMs: rem, phase, currentCycle: cyc };
  }

  return t;
}
