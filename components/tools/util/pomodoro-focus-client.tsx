"use client";

import {
  Bell,
  Check,
  Clock4,
  Coffee,
  History,
  Pause,
  Play,
  Settings2,
  SkipForward,
  Timer,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import * as React from "react";
import { ActionButton, ResetButton } from "@/components/shared/action-buttons";
import InputField from "@/components/shared/form-fields/input-field";
import SwitchRow from "@/components/shared/form-fields/switch-row";
import ToolPageHeader from "@/components/shared/tool-page-header";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/* Types */
type Mode = "work" | "short" | "long";
type HistoryItem = {
  id: string;
  startedAt: number;
  endedAt: number;
  mode: Mode;
  durationMs: number;
};

/* Helpers */
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
  if (typeof window === "undefined") return;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;

  const ctx = new AudioCtx();
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

/* Component */
export default function PomodoroFocusClient() {
  // Settings
  const [workMin, setWorkMin] = React.useState(25);
  const [shortMin, setShortMin] = React.useState(5);
  const [longMin, setLongMin] = React.useState(15);
  const [sessionsUntilLong, setSessionsUntilLong] = React.useState(4);
  const [autoStartBreaks, setAutoStartBreaks] = React.useState(true);
  const [autoStartWork, setAutoStartWork] = React.useState(false);
  const [soundOn, setSoundOn] = React.useState(true);
  const [volume, setVolume] = React.useState(70);

  // Runtime
  const [mode, setMode] = React.useState<Mode>("work");
  const [running, setRunning] = React.useState(false);
  const [remainingMs, setRemainingMs] = React.useState(workMin * 60 * 1000);
  const [cycleCount, setCycleCount] = React.useState(0);
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

  // Ping with sound + optional notification
  const ping = React.useCallback(
    (title: string, body: string) => {
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
    },
    [soundOn, volume],
  );

  /* Session Complete */
  const onCompleteSession = React.useCallback(
    (skipped = false) => {
      setRunning(false);
      setStartedAt(null);

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
          if (newCount % sessionsUntilLong === 0) {
            setMode("long");
            setRemainingMs(longMin * 60 * 1000);
            ping("Long break 🎉", `Great job! Take ${longMin} minutes.`);
            if (autoStartBreaks) setRunning(true);
          } else {
            setMode("short");
            setRemainingMs(shortMin * 60 * 1000);
            ping("Break time ☕", `Take ${shortMin} minutes.`);
            if (autoStartBreaks) setRunning(true);
          }
        } else {
          setMode("work");
          setRemainingMs(workMin * 60 * 1000);
          ping("Focus time 🔥", `Back to work for ${workMin} minutes.`);
          if (autoStartWork) setRunning(true);
        }
      } else {
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
    },
    [
      startedAt,
      targetMs,
      remainingMs,
      mode,
      cycleCount,
      sessionsUntilLong,
      longMin,
      shortMin,
      workMin,
      autoStartBreaks,
      autoStartWork,
      ping,
    ],
  );

  /* Timer Controls */
  const start = React.useCallback(() => {
    setStartedAt(Date.now());
    setRunning(true);
  }, []);
  const pause = React.useCallback(() => {
    setRunning(false);
  }, []);

  // ✅ Fix: simple toggle (no nested setRunning calls)
  const toggle = React.useCallback(() => {
    if (running) {
      pause();
    } else {
      start();
    }
  }, [running, start, pause]);

  const resetTimer = React.useCallback(
    (nextMode?: Mode) => {
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
    },
    [mode, workMin, shortMin, longMin],
  );

  const skip = React.useCallback(() => onCompleteSession(true), [onCompleteSession]);

  const resetAll = React.useCallback(() => {
    setRunning(false);
    setMode("work");
    setRemainingMs(workMin * 60 * 1000);
    setCycleCount(0);
    setHistory([]);
    setStartedAt(null);
  }, [workMin]);

  /* Effects */
  // Ticker
  React.useEffect(() => {
    let t: number | undefined;
    if (running) {
      t = window.setInterval(() => {
        setRemainingMs((prev) => {
          const next = prev - 1000;
          if (next <= 0) {
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
  }, [running, onCompleteSession]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target && (e.target as HTMLElement).tagName === "INPUT") return;
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
  }, [toggle, resetTimer, skip]);

  // Notifications permission (ask once)
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

  /* UI */
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
    <>
      <ToolPageHeader
        icon={Timer}
        title="Pomodoro Focus"
        description="Work / break cycles with sound, history, and auto-start options."
        actions={
          <>
            <ResetButton onClick={resetAll} label="Reset All" />
            <ActionButton icon={SkipForward} label="Skip" onClick={skip} />
            <ActionButton
              variant="default"
              icon={running ? Pause : Play}
              label={running ? "Pause" : "Start"}
              onClick={toggle}
            />
          </>
        }
      />

      {/* Timer */}
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
            {/* Clock */}
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="relative h-48 w-48">
                <svg
                  viewBox="0 0 100 100"
                  className="h-full w-full"
                  role="img"
                  aria-labelledby="progress-title"
                >
                  <title id="progress-title">Pomodoro progress ring</title>
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
                <ResetButton size="sm" onClick={() => resetTimer(mode)} />
                <ActionButton
                  variant="default"
                  size="sm"
                  icon={running ? Pause : Play}
                  label={running ? "Pause" : "Start"}
                  onClick={toggle}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="grid gap-4">
              <div className="grid grid-cols-3 gap-3">
                <InputField
                  label="Work (min)"
                  type="number"
                  min={1}
                  max={180}
                  value={workMin}
                  onChange={(e) => setWorkMin(clamp(parseInt(e.target.value || "0", 10), 1, 180))}
                />
                <InputField
                  label="Short (min)"
                  type="number"
                  min={1}
                  max={60}
                  value={shortMin}
                  onChange={(e) => setShortMin(clamp(parseInt(e.target.value || "0", 10), 1, 60))}
                />
                <InputField
                  label="Long (min)"
                  type="number"
                  min={5}
                  max={90}
                  value={longMin}
                  onChange={(e) => setLongMin(clamp(parseInt(e.target.value || "0", 10), 5, 90))}
                />
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
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="work">Focus</SelectItem>
                      <SelectItem value="short">Short Break</SelectItem>
                      <SelectItem value="long">Long Break</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <InputField
                  label="Until Long Break"
                  type="number"
                  min={2}
                  max={12}
                  value={sessionsUntilLong}
                  onChange={(e) =>
                    setSessionsUntilLong(clamp(parseInt(e.target.value || "0", 10), 2, 12))
                  }
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4" />
                  <span className="text-sm">Auto-start options</span>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <SwitchRow
                    label="Auto-start breaks"
                    checked={autoStartBreaks}
                    onCheckedChange={setAutoStartBreaks}
                  />
                  <SwitchRow
                    label="Auto-start work"
                    checked={autoStartWork}
                    onCheckedChange={setAutoStartWork}
                  />
                </div>
              </div>
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
                  <ActionButton
                    size="icon"
                    onClick={() => setSoundOn((s) => !s)}
                    aria-label="Toggle sound"
                    icon={soundOn ? Volume2 : VolumeX}
                  />
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
    </>
  );
}
