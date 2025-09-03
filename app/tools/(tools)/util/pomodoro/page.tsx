"use client";

import {
  Bell,
  Check,
  Clock4,
  Coffee,
  History,
  Pause,
  Play,
  RotateCcw,
  Settings2,
  SkipForward,
  Timer,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard, MotionGlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

// ---------------- Types ----------------
type Mode = "work" | "short" | "long";
type HistoryItem = {
  id: string;
  startedAt: number;
  endedAt: number;
  mode: Mode;
  durationMs: number;
};

// ---------------- Helpers ----------------
const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

function msToClock(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${pad(m)}:${pad(s)}`;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function makeBeep(volume = 0.4, durationMs = 220, freq = 880) {
  if (typeof window === "undefined" || !("AudioContext" in window)) return;
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "sine";
  o.frequency.value = freq;
  g.gain.value = volume;
  o.connect(g);
  g.connect(ctx.destination);
  o.start();
  setTimeout(() => {
    o.stop();
    ctx.close().catch(() => {});
  }, durationMs);
}

// ---------------- Component ----------------
export default function PomodoroPage() {
  // Settings
  const [workMin, setWorkMin] = React.useState<number>(25);
  const [shortMin, setShortMin] = React.useState<number>(5);
  const [longMin, setLongMin] = React.useState<number>(15);
  const [sessionsUntilLong, setSessionsUntilLong] = React.useState<number>(4);
  const [autoStartBreaks, setAutoStartBreaks] = React.useState<boolean>(true);
  const [autoStartWork, setAutoStartWork] = React.useState<boolean>(false);
  const [soundOn, setSoundOn] = React.useState<boolean>(true);
  const [volume, setVolume] = React.useState<number>(70);

  // Runtime
  const [mode, setMode] = React.useState<Mode>("work");
  const [running, setRunning] = React.useState<boolean>(false);
  const [remainingMs, setRemainingMs] = React.useState<number>(workMin * 60 * 1000);
  const [cycleCount, setCycleCount] = React.useState<number>(0); // completed work sessions
  const [history, setHistory] = React.useState<HistoryItem[]>([]);
  const [startedAt, setStartedAt] = React.useState<number | null>(null);

  // Derived
  const targetMs = React.useMemo(() => {
    if (mode === "work") return workMin * 60 * 1000;
    if (mode === "short") return shortMin * 60 * 1000;
    return longMin * 60 * 1000;
  }, [mode, workMin, shortMin, longMin]);

  const progress = React.useMemo(
    () => 100 - Math.round((remainingMs / targetMs) * 100),
    [remainingMs, targetMs],
  );

  // Initialize when mode or settings change (if not running)
  React.useEffect(() => {
    if (!running) setRemainingMs(targetMs);
  }, [targetMs, running]);

  // Ticker
  React.useEffect(() => {
    let t: number | undefined;
    if (running) {
      t = window.setInterval(() => {
        setRemainingMs((prev) => {
          const next = prev - 1000;
          if (next <= 0) {
            // complete current session
            onCompleteSession();
            return 0;
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (t) window.clearInterval(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    running,
    mode,
    workMin,
    shortMin,
    longMin,
    sessionsUntilLong,
    autoStartBreaks,
    autoStartWork,
  ]);

  // Visibility: optional pause (kept running for simplicity)
  // Keyboard shortcuts
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        toggle();
      } else if (e.key.toLowerCase() === "r") {
        resetTimer();
      } else if (e.key.toLowerCase() === "n") {
        skip();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, mode, remainingMs]);

  // Notifications permission (ask once after first interaction)
  const askedRef = React.useRef(false);
  React.useEffect(() => {
    const onFirstClick = () => {
      if (!askedRef.current && "Notification" in window && Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }
      askedRef.current = true;
      window.removeEventListener("pointerdown", onFirstClick);
    };
    window.addEventListener("pointerdown", onFirstClick);
    return () => window.removeEventListener("pointerdown", onFirstClick);
  }, []);

  function start() {
    setStartedAt(Date.now());
    setRunning(true);
  }
  function pause() {
    setRunning(false);
  }
  function toggle() {
    running ? pause() : start();
  }
  function resetTimer(nextMode?: Mode) {
    setRunning(false);
    const m = nextMode ?? mode;
    setMode(m);
    setRemainingMs(
      m === "work"
        ? workMin * 60 * 1000
        : m === "short"
          ? shortMin * 60 * 1000
          : longMin * 60 * 1000,
    );
    setStartedAt(null);
  }
  function skip() {
    // record current as ended, then move
    onCompleteSession(true);
  }

  function ping(title: string, body: string) {
    if (soundOn) makeBeep(volume / 100, 220, 920);
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      try {
        new Notification(title, { body });
      } catch {}
    }
  }

  function onCompleteSession(skipped = false) {
    setRunning(false);
    setStartedAt(null);

    // log history
    setHistory((prev) => [
      {
        id: crypto.randomUUID(),
        startedAt:
          prev.length && prev[prev.length - 1].endedAt > (startedAt ?? 0)
            ? Date.now() - (targetMs - remainingMs)
            : (startedAt ?? Date.now()),
        endedAt: Date.now(),
        mode,
        durationMs: targetMs - Math.max(0, remainingMs),
      },
      ...prev,
    ]);

    if (!skipped) {
      if (mode === "work") {
        const newCount = cycleCount + 1;
        setCycleCount(newCount);
        // decide break
        if (newCount % sessionsUntilLong === 0) {
          setMode("long");
          setRemainingMs(longMin * 60 * 1000);
          ping("Long break 🎉", `Great job! Take ${longMin} minutes.`);
          if (autoStartBreaks) setRunning(true);
          return;
        } else {
          setMode("short");
          setRemainingMs(shortMin * 60 * 1000);
          ping("Break time ☕", `Take ${shortMin} minutes.`);
          if (autoStartBreaks) setRunning(true);
          return;
        }
      } else {
        // finished a break -> back to work
        setMode("work");
        setRemainingMs(workMin * 60 * 1000);
        ping("Focus time 🔥", `Back to work for ${workMin} minutes.`);
        if (autoStartWork) setRunning(true);
        return;
      }
    } else {
      // Skip logic: jump immediately to next suggested mode without logging completion toast
      if (mode === "work") {
        const newCount = cycleCount + 1;
        setCycleCount(newCount);
        if (newCount % sessionsUntilLong === 0) {
          setMode("long");
          setRemainingMs(longMin * 60 * 1000);
          if (autoStartBreaks) setRunning(true);
        } else {
          setMode("short");
          setRemainingMs(shortMin * 60 * 1000);
          if (autoStartBreaks) setRunning(true);
        }
      } else {
        setMode("work");
        setRemainingMs(workMin * 60 * 1000);
        if (autoStartWork) setRunning(true);
      }
    }
  }

  function resetAll() {
    setRunning(false);
    setMode("work");
    setRemainingMs(workMin * 60 * 1000);
    setCycleCount(0);
    setHistory([]);
    setStartedAt(null);
  }

  // UI bits
  const modeLabel: Record<Mode, string> = {
    work: "Focus",
    short: "Short Break",
    long: "Long Break",
  };
  const modeIcon: Record<Mode, React.ReactNode> = {
    work: <Zap className="h-5 w-5" />,
    short: <Coffee className="h-5 w-5" />,
    long: <Coffee className="h-5 w-5" />,
  };

  return (
    <MotionGlassCard className="space-y-4">
      {/* Header */}
      <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Timer className="h-6 w-6" /> Pomodoro Focus
          </h1>
          <p className="text-sm text-muted-foreground">
            Work / break cycles with sound, history, and auto-start options.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={resetAll} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Reset All
          </Button>
          <Button variant="outline" onClick={skip} className="gap-2">
            <SkipForward className="h-4 w-4" /> Skip
          </Button>
          <Button onClick={toggle} className="gap-2">
            {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {running ? "Pause" : "Start"}
          </Button>
        </div>
      </GlassCard>

      {/* Timer Card */}
      <GlassCard className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-base">
              {modeIcon[mode]}
              <CardTitle className="text-base">{modeLabel[mode]}</CardTitle>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock4 className="h-4 w-4" />
              Completed: <span className="font-medium">{cycleCount}</span>
            </div>
          </div>
          <CardDescription>
            {mode === "work"
              ? `Focus for ${workMin} minute${workMin > 1 ? "s" : ""}`
              : mode === "short"
                ? `Take a short ${shortMin}-minute break`
                : `Enjoy a long ${longMin}-minute break`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Big Clock */}
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="relative h-48 w-48">
                {/* progress ring (CSS) */}
                <svg viewBox="0 0 100 100" className="h-full w-full">
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    stroke="hsl(var(--muted))"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    stroke="hsl(var(--primary))"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 44}
                    strokeDashoffset={((100 - progress) / 100) * 2 * Math.PI * 44}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl font-semibold tabular-nums">
                    {msToClock(remainingMs)}
                  </div>
                  <div className="text-xs text-muted-foreground">{progress}%</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => resetTimer(mode)}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" /> Reset
                </Button>
                <Button size="sm" onClick={toggle} className="gap-2">
                  {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {running ? "Pause" : "Start"}
                </Button>
              </div>

              <p className="text-[11px] text-muted-foreground">
                Shortcuts: <kbd>Space</kbd> start/pause • <kbd>R</kbd> reset • <kbd>N</kbd> skip
              </p>
            </div>

            {/* Quick Controls */}
            <div className="grid gap-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Work (min)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={180}
                    value={workMin}
                    onChange={(e) => setWorkMin(clamp(parseInt(e.target.value || "0", 10), 1, 180))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Short (min)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={60}
                    value={shortMin}
                    onChange={(e) => setShortMin(clamp(parseInt(e.target.value || "0", 10), 1, 60))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Long (min)</Label>
                  <Input
                    type="number"
                    min={5}
                    max={90}
                    value={longMin}
                    onChange={(e) => setLongMin(clamp(parseInt(e.target.value || "0", 10), 5, 90))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Mode</Label>
                  <Select
                    value={mode}
                    onValueChange={(v: Mode) => {
                      setMode(v);
                      setRunning(false);
                      setRemainingMs(
                        v === "work"
                          ? workMin * 60 * 1000
                          : v === "short"
                            ? shortMin * 60 * 1000
                            : longMin * 60 * 1000,
                      );
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="work">Focus</SelectItem>
                      <SelectItem value="short">Short Break</SelectItem>
                      <SelectItem value="long">Long Break</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Until Long Break</Label>
                  <Input
                    type="number"
                    min={2}
                    max={12}
                    value={sessionsUntilLong}
                    onChange={(e) =>
                      setSessionsUntilLong(clamp(parseInt(e.target.value || "0", 10), 2, 12))
                    }
                  />
                </div>
              </div>

              <div className="grid gap-3">
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <span className="text-sm">Sound on session change</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={volume}
                      onChange={(e) => setVolume(parseInt(e.target.value || "0", 10))}
                      className="w-28"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSoundOn((s) => !s)}
                      aria-label="Toggle sound"
                    >
                      {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Settings2 className="h-4 w-4" />
                      <span className="text-sm">Auto-start options</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <label className="flex items-center gap-2">
                      <Switch checked={autoStartBreaks} onCheckedChange={setAutoStartBreaks} />{" "}
                      Auto-start breaks
                    </label>
                    <label className="flex items-center gap-2">
                      <Switch checked={autoStartWork} onCheckedChange={setAutoStartWork} />{" "}
                      Auto-start work
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </GlassCard>

      <Separator />

      {/* History */}
      <GlassCard className="shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <CardTitle className="text-base">Session History</CardTitle>
          </div>
          <CardDescription>Recent completed or skipped sessions.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No sessions yet. Start your first pomodoro!
            </p>
          ) : (
            <ul className="grid gap-2">
              {history.slice(0, 20).map((h) => (
                <li
                  key={h.id}
                  className={cn(
                    "flex items-center justify-between rounded-md border p-3",
                    h.mode === "work" ? "bg-primary/5" : "bg-muted/50",
                  )}
                >
                  <div className="flex items-center gap-2">
                    {h.mode === "work" ? (
                      <Zap className="h-4 w-4" />
                    ) : (
                      <Coffee className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">
                      {h.mode === "work"
                        ? "Focus"
                        : h.mode === "short"
                          ? "Short Break"
                          : "Long Break"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      • {msToClock(h.durationMs)} • {new Date(h.endedAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <Check className="h-4 w-4 text-primary" />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </GlassCard>
    </MotionGlassCard>
  );
}
