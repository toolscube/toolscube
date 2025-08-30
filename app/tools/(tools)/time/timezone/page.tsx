'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard, MotionGlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Calendar, Check, Clock, Copy, Globe, Link2, MapPin, Plus, Replace, RotateCcw, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

// ----------------- Helpers -----------------
// Curated, readable time zone list. Add/remove as you like.
const ZONES: { value: string; label: string }[] = [
  // Asia
  { value: 'Asia/Dhaka', label: 'Dhaka (Asia/Dhaka)' },
  { value: 'Asia/Kolkata', label: 'Kolkata (Asia/Kolkata)' },
  { value: 'Asia/Karachi', label: 'Karachi (Asia/Karachi)' },
  { value: 'Asia/Singapore', label: 'Singapore (Asia/Singapore)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (Asia/Tokyo)' },
  { value: 'Asia/Dubai', label: 'Dubai (Asia/Dubai)' },
  { value: 'Asia/Bangkok', label: 'Bangkok (Asia/Bangkok)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (Asia/Shanghai)' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (Asia/Hong_Kong)' },
  // Europe
  { value: 'Europe/London', label: 'London (Europe/London)' },
  { value: 'Europe/Paris', label: 'Paris (Europe/Paris)' },
  { value: 'Europe/Berlin', label: 'Berlin (Europe/Berlin)' },
  { value: 'Europe/Madrid', label: 'Madrid (Europe/Madrid)' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam (Europe/Amsterdam)' },
  { value: 'Europe/Rome', label: 'Rome (Europe/Rome)' },
  { value: 'Europe/Stockholm', label: 'Stockholm (Europe/Stockholm)' },
  // Americas
  { value: 'America/New_York', label: 'New York (America/New_York)' },
  { value: 'America/Chicago', label: 'Chicago (America/Chicago)' },
  { value: 'America/Denver', label: 'Denver (America/Denver)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (America/Los_Angeles)' },
  { value: 'America/Toronto', label: 'Toronto (America/Toronto)' },
  { value: 'America/Mexico_City', label: 'Mexico City (America/Mexico_City)' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (America/Sao_Paulo)' },
  // Oceania & Africa
  { value: 'Australia/Sydney', label: 'Sydney (Australia/Sydney)' },
  { value: 'Pacific/Auckland', label: 'Auckland (Pacific/Auckland)' },
  { value: 'Africa/Nairobi', label: 'Nairobi (Africa/Nairobi)' },
  { value: 'Africa/Cairo', label: 'Cairo (Africa/Cairo)' },
];

// Readable date -> number helpers
const pad = (n: number, w = 2) => n.toString().padStart(w, '0');

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

// Convert a desired wall-clock time in a time zone to a UTC timestamp (ms) using Intl and fixed-point iteration.
// Works across DST boundaries without external libraries.
function wallTimeToUTC(
  y: number,
  m: number, // 1-12
  d: number,
  h: number,
  min: number,
  timeZone: string,
): number {
  // First guess: treat provided wall-time as if it were already UTC
  let guess = Date.UTC(y, m - 1, d, h, min, 0, 0);

  for (let i = 0; i < 4; i++) {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(new Date(guess));

    const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value || '00';
    const zy = Number(get('year'));
    const zm = Number(get('month'));
    const zd = Number(get('day'));
    const zh = Number(get('hour'));
    const zmin = Number(get('minute'));

    // This is the wall time that the *current guess* maps to in the target zone.
    const mappedUTC = Date.UTC(zy, zm - 1, zd, zh, zmin, 0, 0);
    const desiredUTC = Date.UTC(y, m - 1, d, h, min, 0, 0);

    // How far off are we?
    const delta = desiredUTC - mappedUTC;
    if (Math.abs(delta) < 60000) {
      // Converged to within a minute
      guess = guess + delta;
      break;
    }
    guess = guess + delta;
  }

  return guess;
}

function formatInZone(ts: number, timeZone: string, opts?: { hour12?: boolean; withTz?: boolean }) {
  const { hour12 = false, withTz = true } = opts || {};
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12,
    timeZoneName: withTz ? 'short' : undefined,
  });
  return formatter.format(new Date(ts));
}

function tzAbbr(ts: number, timeZone: string): string {
  const s = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
    hour12: false,
  }).format(new Date(ts));
  const m = /\b([A-Z]{1,5}|GMT[+−-]\d{1,2})\b/.exec(s);
  return m?.[1] || timeZone;
}

function getLocalTimeZone(): string {
  try {
    // @ts-ignore
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

// ----------------- Component -----------------
export default function TimezoneConverterPage() {
  // Source date/time & zone
  const localTz = useMemo(() => getLocalTimeZone(), []);
  const [sourceTz, setSourceTz] = useState<string>(localTz);
  const [dateStr, setDateStr] = useState<string>(() => formatDateInput(new Date()));
  const [timeStr, setTimeStr] = useState<string>(() => formatTimeInput(new Date()));
  const [is12h, setIs12h] = useState(false);

  // Target zones list
  const [targets, setTargets] = useState<string[]>(() => {
    // hydrate from URL or localStorage
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const qs = params.get('zones');
      if (qs) return qs.split(',').filter(Boolean);
      const saved = localStorage.getItem('tzc:targets');
      if (saved) return JSON.parse(saved);
    }
    // Default selection focuses on popular cities + user's local
    const defaults = ['Asia/Dhaka', 'Europe/London', 'America/New_York', 'America/Los_Angeles', 'Asia/Tokyo'];
    // Ensure the local tz appears first if not included
    const unique = Array.from(new Set([localTz, ...defaults]));
    return unique;
  });

  // Persist targets
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tzc:targets', JSON.stringify(targets));
    }
  }, [targets]);

  // Compute UTC timestamp from source wall time
  const utcTs = useMemo(() => {
    const [yy, mm, dd] = dateStr.split('-').map((n) => Number(n));
    const [hh, min] = timeStr.split(':').map((n) => Number(n));
    return wallTimeToUTC(yy, mm, dd, hh, min, sourceTz);
  }, [dateStr, timeStr, sourceTz]);

  // Share link copy
  const [copied, setCopied] = useState<string>('');
  const copyShare = async () => {
    const params = new URLSearchParams();
    params.set('src', sourceTz);
    params.set('date', dateStr);
    params.set('time', timeStr);
    params.set('zones', targets.join(','));
    const link = `${window.location.pathname}?${params.toString()}`;
    await navigator.clipboard.writeText(window.location.origin + link);
    setCopied('link');
    setTimeout(() => setCopied(''), 1500);
  };

  const applyNow = () => {
    const now = new Date();
    setDateStr(formatDateInput(now));
    setTimeStr(formatTimeInput(now));
    setSourceTz(getLocalTimeZone());
  };

  const resetAll = () => {
    setDateStr(formatDateInput(new Date()));
    setTimeStr(formatTimeInput(new Date()));
    setSourceTz(localTz);
    setTargets(['Asia/Dhaka', 'Europe/London', 'America/New_York', 'America/Los_Angeles', 'Asia/Tokyo']);
  };

  const addTarget = (tz: string) => {
    setTargets((arr) => (arr.includes(tz) ? arr : [...arr, tz]));
  };

  const removeTarget = (tz: string) => setTargets((arr) => arr.filter((z) => z !== tz));

  const swapWithSource = (tz: string) => {
    setSourceTz(tz);
  };

  const sourceCandidates = useMemo(() => ZONES, []);
  const targetCandidates = useMemo(() => ZONES.filter((z) => z.value !== sourceTz), [sourceTz]);

  // --------------- UI ----------------
  return (
    <div className="space-y-4">
      <MotionGlassCard>
        {/* TOP: Title & actions */}
        <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <Globe className="h-6 w-6" /> Time Zone Converter
            </h1>
            <p className="text-sm text-muted-foreground">Convert a time from one city to many others — DST-aware, fast, and shareable.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={resetAll} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
            <Button variant="outline" onClick={applyNow} className="gap-2">
              <Clock className="h-4 w-4" /> Now
            </Button>
            <Button onClick={copyShare} className="gap-2">
              {copied === 'link' ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
              {copied === 'link' ? 'Copied' : 'Copy link'}
            </Button>
          </div>
        </GlassCard>

        {/* SETTINGS */}
        <GlassCard className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Settings</CardTitle>
            <CardDescription>Pick the source city and time. We handle the rest.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Source City / Time Zone</Label>
              <Select value={sourceTz} onValueChange={setSourceTz}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source time zone" />
                </SelectTrigger>
                <SelectContent>
                  {sourceCandidates.map((z) => (
                    <SelectItem key={z.value} value={z.value}>
                      {z.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> Your device zone: <span className="font-medium">{localTz}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <div className="flex items-center gap-2">
                  <Input id="date" type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)} />
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input id="time" type="time" value={timeStr} onChange={(e) => setTimeStr(e.target.value)} />
              </div>
              <div className="col-span-2 flex items-center justify-between rounded-md border p-2">
                <div className="flex items-center gap-2">
                  <Switch checked={is12h} onCheckedChange={setIs12h} id="fmt" />
                  <Label htmlFor="fmt">12‑hour format</Label>
                </div>
                <Badge variant="secondary" className="font-mono">
                  UTC {formatInZone(utcTs, 'UTC', { hour12: false, withTz: true }).split(', ').at(-1)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </GlassCard>

        <Separator />

        {/* ADD TARGETS */}
        <GlassCard className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Add Cities</CardTitle>
            <CardDescription>Choose where you want to see the converted time.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Pick a city</Label>
              <Select onValueChange={(v) => v && addTarget(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Add a time zone" />
                </SelectTrigger>
                <SelectContent>
                  {targetCandidates
                    .filter((z) => !targets.includes(z.value))
                    .map((z) => (
                      <SelectItem key={z.value} value={z.value}>
                        {z.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Tip: Add multiple cities to compare at a glance.</p>
            </div>

            <div className="space-y-2">
              <Label>Quick presets</Label>
              <div className="flex flex-wrap gap-2">
                {['Asia/Dhaka', 'Europe/London', 'America/New_York', 'America/Los_Angeles', 'Asia/Tokyo', 'Australia/Sydney'].map((v) => (
                  <Button key={v} size="sm" variant="outline" onClick={() => addTarget(v)}>
                    <Plus className="h-4 w-4 mr-1" /> {v.split('/').at(-1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </GlassCard>

        {/* RESULTS */}
        <GlassCard className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Converted Times</CardTitle>
            <CardDescription>Times are computed exactly for the above source — daylight saving aware.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {targets.length === 0 && <p className="text-sm text-muted-foreground">No cities yet. Add a city to see results.</p>}

            {targets.map((tz) => (
              <CityRow key={tz} tz={tz} utcTs={utcTs} is12h={is12h} onRemove={() => removeTarget(tz)} onSwap={() => swapWithSource(tz)} />
            ))}
          </CardContent>
        </GlassCard>
      </MotionGlassCard>
    </div>
  );
}

function CityRow({ tz, utcTs, is12h, onRemove, onSwap }: { tz: string; utcTs: number; is12h: boolean; onRemove: () => void; onSwap: () => void }) {
  const text = formatInZone(utcTs, tz, { hour12: is12h, withTz: true });
  const abbr = tzAbbr(utcTs, tz);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`${text} — ${tz}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="flex flex-col gap-2 rounded-md border p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono">
            {abbr}
          </Badge>
          <span className="font-medium">{tz}</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-2" onClick={onSwap}>
            <Replace className="h-4 w-4" /> Set as source
          </Button>
          <Button size="sm" variant="outline" className="gap-2" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button size="sm" variant="outline" className="gap-2" onClick={onRemove}>
            <Trash2 className="h-4 w-4" /> Remove
          </Button>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">{text}</div>
    </div>
  );
}

function BreadcrumbHeader() {
  return (
    <div className="px-1">
      <div className="mb-2 text-sm text-muted-foreground">Tools / Time</div>
      <h2 className="text-lg font-semibold">Time Zone Converter</h2>
    </div>
  );
}
