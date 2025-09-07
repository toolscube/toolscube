"use client";

import {
  AlarmClock,
  CalendarClock,
  Clock,
  Download,
  Pause,
  Play,
  Plus,
  Trash2,
  Zap,
} from "lucide-react";
import type * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { ActionButton, ResetButton } from "@/components/shared/action-buttons";
import InputField from "@/components/shared/form-fields/input-field";
import SwitchRow from "@/components/shared/form-fields/switch-row";
import ToolPageHeader from "@/components/shared/tool-page-header";
import { Badge } from "@/components/ui/badge";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/* Types */
type Mode = "countdown" | "pomodoro" | "event";

type Timer = {
  id: string;
  label: string;
  mode: Mode;
  running: boolean;
  createdAt: number;

  // Countdown & Pomodoro
  durationMs?: number;
  remainingMs?: number;

  // Event
  targetTs?: number;

  // Pomodoro
  workMs?: number;
  breakMs?: number;
  cycles?: number;
  phase?: "work" | "break" | "done";
  currentCycle?: number;
};

/* Helpers */
const ms = {
  sec: 1000,
  min: 60 * 1000,
  hr: 60 * 60 * 1000,
};

const pad = (n: number, w = 2) => n.toString().padStart(w, "0");

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function fmtHMS(totalMs: number) {
  const sign = totalMs < 0 ? "-" : "";
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

function formatDateInput(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatTimeInput(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function parseDateTimeLocal(dateStr?: string, timeStr?: string): Date | null {
  if (!dateStr || !timeStr) return null;

  const [y, mo, da] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);

  const dt = new Date(y, (mo || 1) - 1, da || 1, hh || 0, mm || 0, 0, 0);

  return Number.isNaN(dt.getTime()) ? null : dt;
}

export function beep(): void {
  try {
    const AC = window.AudioContext ?? window.webkitAudioContext;
    if (!AC) return;

    const ctx = new AC();

    if (ctx.state === "suspended") {
      // Fire-and-forget; we don't need to await here.
      void ctx.resume();
    }

    const osc = new OscillatorNode(ctx, { type: "sine", frequency: 880 });
    const gain = new GainNode(ctx, { gain: 0.0001 });

    osc.connect(gain).connect(ctx.destination);

    const t0 = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.22, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.55);

    osc.start(t0);
    osc.stop(t0 + 0.6);
  } catch {
    // no-op: fail silently
  }
}

function isFinished(t: Timer) {
  if (t.mode === "event") return (t.targetTs || 0) - Date.now() <= 0;
  if (t.mode === "pomodoro") return t.phase === "done";
  return (t.remainingMs || 0) <= 0;
}

function resetTimer(t: Timer): Timer {
  if (t.mode === "event") return { ...t, running: true };
  if (t.mode === "pomodoro")
    return {
      ...t,
      running: false,
      phase: "work",
      currentCycle: 1,
      remainingMs: t.workMs,
    };
  // countdown
  return { ...t, running: false, remainingMs: t.durationMs };
}

function advanceTimer(t: Timer, dtMs: number): Timer {
  if (t.mode === "event") return t;
  if (!t.running) return t;

  if (t.mode === "countdown") {
    const rem = Math.max(0, (t.remainingMs || 0) - dtMs);
    return { ...t, remainingMs: rem, running: rem > 0 && t.running };
  }

  // pomodoro
  let rem = Math.max(0, (t.remainingMs || 0) - dtMs);
  let phase = t.phase || "work";
  let cyc = t.currentCycle || 1;
  const total = t.cycles || 1;

  if (rem <= 0) {
    if (phase === "work") {
      if (cyc >= total) {
        return { ...t, phase: "done", running: false, remainingMs: 0 };
      } else {
        phase = "break";
        rem = t.breakMs || 0;
      }
    } else if (phase === "break") {
      cyc = Math.min(cyc + 1, total);
      phase = "work";
      rem = t.workMs || 0;
    }
  }

  return { ...t, remainingMs: rem, phase, currentCycle: cyc };
}

/* ICS export */

function downloadFile(filename: string, content: string, type = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toICSAlarmCountdown(label: string, seconds: number) {
  const now = new Date();
  const start = now;
  const end = new Date(now.getTime() + seconds * 1000);
  const dt = (d: Date) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ToolsHub//Countdown//EN",
    "BEGIN:VEVENT",
    `UID:countdown-${uid()}@toolshub`,
    `DTSTAMP:${dt(new Date())}`,
    `DTSTART:${dt(start)}`,
    `DTEND:${dt(end)}`,
    `SUMMARY:${label}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

export default function CountdownTimerClient() {
  // timers (persisted)
  const [timers, setTimers] = useState<Timer[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("th:timers");
        if (raw) return JSON.parse(raw) as Timer[];
      } catch {}
    }
    return [];
  });

  const [sound, setSound] = useState(true);
  const [titleBlink, setTitleBlink] = useState(true);

  // Builders: controlled inputs
  const [cdLabel, setCdLabel] = useState("Countdown");
  const [cdMin, setCdMin] = useState<number | "">(10);

  const [poWork, setPoWork] = useState<number | "">(25);
  const [poBreak, setPoBreak] = useState<number | "">(5);
  const [poCycles, setPoCycles] = useState<number | "">(4);

  const [evLabel, setEvLabel] = useState("Event");
  const [evDate, setEvDate] = useState(formatDateInput(new Date()));
  const [evTime, setEvTime] = useState(formatTimeInput(new Date()));

  // Persist timers
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("th:timers", JSON.stringify(timers));
    }
  }, [timers]);

  // Global tick (animation frame)
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

  // Title blink when any finished timer exists
  useEffect(() => {
    if (!titleBlink) return;
    let interval: number | undefined;
    const anyDone = timers.some((t) => isFinished(t));
    const base = document.title;

    if (anyDone) {
      interval = window.setInterval(() => {
        document.title = document.title.startsWith("⏰") ? base : `⏰ Timer done!`;
      }, 1000);
    } else {
      document.title = base.replace(/^⏰\s+/, "");
    }

    return () => {
      if (interval !== undefined) {
        clearInterval(interval);
      }
    };
  }, [timers, titleBlink]);

  /* Actions */
  const addCountdown = (label: string, minutes: number) => {
    const dur = Math.max(1, Math.round(minutes)) * ms.min;
    setTimers((arr) => [
      ...arr,
      {
        id: uid(),
        label,
        mode: "countdown",
        running: false,
        createdAt: Date.now(),
        durationMs: dur,
        remainingMs: dur,
      },
    ]);
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
        mode: "pomodoro",
        running: false,
        createdAt: Date.now(),
        workMs,
        breakMs,
        cycles,
        phase: "work",
        currentCycle: 1,
        remainingMs: workMs,
      },
    ]);
  };

  const addEvent = (label: string, target: Date | null) => {
    if (!target) return;
    setTimers((arr) => [
      ...arr,
      {
        id: uid(),
        label: label || "Event",
        mode: "event",
        running: true,
        createdAt: Date.now(),
        targetTs: target.getTime(),
      },
    ]);
  };

  const onRunToggle = (id: string, run: boolean) => {
    setTimers((arr) => arr.map((t) => (t.id === id ? { ...t, running: run } : t)));
  };
  const onReset = (id: string) => {
    setTimers((arr) => arr.map((t) => (t.id === id ? resetTimer(t) : t)));
  };
  const onDelete = (id: string) => setTimers((arr) => arr.filter((t) => t.id !== id));
  const onDeleteAll = () => setTimers([]);


  const actions = [
    {
      icon: Zap,
      label: "Pomodoro 25/5 ×4",
      onClick: () => addPomodoro(25, 5, 4),
    },
    {
      icon: Clock,
      label: "Meeting 15m",
      onClick: () => addMeeting(15),
    },
    {
      icon: Clock,
      label: "Meeting 30m",
      onClick: () => addMeeting(30),
    },
    {
      icon: Clock,
      label: "Meeting 60m",
      onClick: () => addMeeting(60),
    },
  ];

  return (
    <>
      {/* Header */}
      <ToolPageHeader
        icon={AlarmClock}
        title="Countdown / Timer"
        description="Pomodoro cycles, quick meeting timers, or a countdown to any date — all in one place."
        actions={
          <ActionButton
            variant="default"
            icon={Trash2}
            label="Clear all"
            onClick={onDeleteAll}
            disabled={timers.length === 0}
          />
        }
      />

      {/* Quick Add */}
      <GlassCard className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Quick Start</CardTitle>
          <CardDescription>
            Create popular timers with one click or customize below.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((item) => (
            <ActionButton
              key={item.label}
              icon={item.icon}
              label={item.label}
              onClick={item.onClick}
            />
          ))}
        </CardContent>
      </GlassCard>

      {/* Builders */}
      <GlassCard className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Create Your Timer</CardTitle>
          <CardDescription>
            Fine-tune a countdown, Pomodoro set, or event date/time.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {/* Countdown */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <InputField
              className="sm:col-span-2"
              id="cd-label"
              label="Countdown Label"
              placeholder="e.g., Tea break"
              value={cdLabel}
              onChange={(e) => setCdLabel(e.target.value)}
            />
            <InputField
              className="sm:col-span-2"
              id="cd-min"
              label="Minutes"
              type="number"
              min={1}
              value={cdMin}
              onChange={(e) => setCdMin(e.target.value === "" ? "" : Number(e.target.value))}
            />
            <div className="flex items-end">
              <ActionButton
                variant="outline"
                icon={Plus}
                label="Add Countdown"
                onClick={() => {
                  if (cdMin && cdMin > 0) addCountdown(cdLabel || "Countdown", cdMin);
                }}
              />
            </div>
          </div>

          <Separator />

          {/* Pomodoro */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-8">
            <InputField
              className="sm:col-span-2"
              label="Work (min)"
              id="po-work"
              type="number"
              min={1}
              value={poWork}
              onChange={(e) => setPoWork(e.target.value === "" ? "" : Number(e.target.value))}
            />
            <InputField
              className="sm:col-span-2"
              label="Break (min)"
              id="po-break"
              type="number"
              min={1}
              value={poBreak}
              onChange={(e) => setPoBreak(e.target.value === "" ? "" : Number(e.target.value))}
            />
            <InputField
              className="sm:col-span-2"
              label="Cycles"
              id="po-cycles"
              type="number"
              min={1}
              value={poCycles}
              onChange={(e) => setPoCycles(e.target.value === "" ? "" : Number(e.target.value))}
            />
            <div className="flex items-end lg:col-span-2">
              <ActionButton
                className="w-full"
                variant="outline"
                icon={Plus}
                onClick={() => {
                  if (poWork && poBreak && poCycles) addPomodoro(poWork, poBreak, poCycles);
                }}
                label="Add Pomodoro"
              />
            </div>
          </div>

          <Separator />

          {/* Event */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-8">
            <InputField
              className="sm:col-span-2"
              label="Event Label"
              id="ev-label"
              value={evLabel}
              onChange={(e) => setEvLabel(e.target.value)}
            />
            <InputField
              className="sm:col-span-2"
              label="Date"
              id="ev-date"
              type="date"
              value={evDate}
              onChange={(e) => setEvDate(e.target.value)}
            />
            <InputField
              className="sm:col-span-2"
              label="Time"
              id="ev-time"
              type="time"
              value={evTime}
              onChange={(e) => setEvTime(e.target.value)}
            />
            <div className="flex items-end lg:col-span-2">
              <ActionButton
                className="w-full"
                variant="outline"
                icon={Plus}
                onClick={() => addEvent(evLabel, parseDateTimeLocal(evDate, evTime))}
                label="Add Event"
              />
            </div>
          </div>

          <Separator />

          {/* Preferences */}
          <div className="flex flex-wrap items-center gap-4">
            <SwitchRow label="Sound on finish" checked={sound} onCheckedChange={setSound} />
            <SwitchRow
              label="Blink page title"
              checked={titleBlink}
              onCheckedChange={setTitleBlink}
            />
          </div>
        </CardContent>
      </GlassCard>

      {/* Active Timers */}
      <GlassCard className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Active Timers</CardTitle>
          <CardDescription>
            Start, pause, reset, or remove timers. Pomodoro auto-advances phases.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {timers.length === 0 && (
            <p className="text-sm text-muted-foreground">No timers yet. Create one above.</p>
          )}
          {timers.map((t) => (
            <TimerCard
              key={t.id}
              t={t}
              sound={sound}
              onRun={(r) => onRunToggle(t.id, r)}
              onReset={() => onReset(t.id)}
              onDelete={() => onDelete(t.id)}
            />
          ))}
        </CardContent>
      </GlassCard>
    </>
  );
}

/* Timer Card */

function TimerCard({
  t,
  onRun,
  onReset,
  onDelete,
  sound,
}: {
  t: Timer;
  onRun: (run: boolean) => void;
  onReset: () => void;
  onDelete: () => void;
  sound: boolean;
}) {
  const isEvent = t.mode === "event";
  const isPomo = t.mode === "pomodoro";

  const { remaining, duration, subtitle, phaseBadge } = useMemo(() => {
    if (isEvent) {
      const now = Date.now();
      const rem = (t.targetTs || now) - now;
      const lab = rem <= 0 ? "Happened" : "Until event";
      return {
        remaining: rem,
        duration: Math.max(rem, 1),
        subtitle: lab,
        phaseBadge: null as React.ReactNode,
      };
    }
    if (isPomo) {
      const dur =
        t.phase === "work" ? t.workMs || 0 : t.phase === "break" ? t.breakMs || 0 : t.workMs || 0;
      const rem = t.remainingMs || 0;
      const cyc = t.currentCycle || 1;
      const total = t.cycles || 1;
      const badge = (
        <Badge
          variant={t.phase === "work" ? "default" : t.phase === "break" ? "secondary" : "secondary"}
        >
          {t.phase === "done" ? "Done" : `${t.phase} • ${cyc}/${total}`}
        </Badge>
      );
      return { remaining: rem, duration: dur, subtitle: "Pomodoro", phaseBadge: badge };
    }
    return {
      remaining: t.remainingMs || 0,
      duration: t.durationMs || 1,
      subtitle: "Countdown",
      phaseBadge: null as React.ReactNode,
    };
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

  // Bonus: export an ICS for countdown (quick calendar block)
  const exportICS = () => {
    if (t.mode !== "countdown") return;
    const seconds = Math.max(1, Math.floor((t.remainingMs || 0) / 1000));
    const ics = toICSAlarmCountdown(t.label, seconds);
    downloadFile(
      `countdown-${t.label.replace(/\s+/g, "-").toLowerCase()}.ics`,
      ics,
      "text/calendar;charset=utf-8",
    );
  };

  return (
    <div
      className={cn("rounded-md border p-3 transition-colors", justFinished && "border-primary")}
    >
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
              <ActionButton
                size="sm"
                variant="outline"
                icon={Pause}
                label="Pause"
                onClick={() => onRun(false)}
              />
            ) : (
              <ActionButton
                size="sm"
                variant="outline"
                icon={Play}
                label="Start"
                onClick={() => onRun(true)}
              />
            )}

            <ResetButton size="sm" onClick={onReset} />
          </>
        )}

        {isEvent && (
          <Badge variant={remaining <= 0 ? "secondary" : "default"} className="gap-1">
            <CalendarClock className="h-3 w-3" /> {remaining <= 0 ? "Started/Passed" : "Scheduled"}
          </Badge>
        )}

        {t.mode === "countdown" && (
          <ActionButton
            size="sm"
            variant="outline"
            icon={Download}
            label="ICS"
            onClick={exportICS}
          />
        )}

        <ActionButton
          size="sm"
          variant="outline"
          icon={Trash2}
          label="Remove"
          className="ml-auto"
          onClick={onDelete}
        />
      </div>
    </div>
  );
}
