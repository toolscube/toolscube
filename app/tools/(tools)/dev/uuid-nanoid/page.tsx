'use client';

import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard, MotionGlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

import { Check, Copy, Download, Fullscreen, Hash, Key, ListChecks, Minimize2, RefreshCw, RotateCcw, Settings2, Shuffle, Type, Upload, Wand2 } from 'lucide-react';

// Deps: uuid + nanoid
import { customAlphabet, nanoid as nanoidFn } from 'nanoid';
import * as uuid from 'uuid';

/* -------------------------------- constants ------------------------------- */

const STORAGE_KEY = 'toolshub.uuid-nanoid.v1';

type Mode = 'uuid' | 'nanoid';
type UuidVersion = 'v1' | 'v4' | 'v5' | 'v7';

const DEFAULT_NANO_ALPHABET = '_-0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const PRESETS: Record<string, string> = {
  'URL-safe (default)': DEFAULT_NANO_ALPHABET,
  Alphanumeric: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  'Hex (lowercase)': '0123456789abcdef',
  'HEX (uppercase)': '0123456789ABCDEF',
  'Numbers only': '0123456789',
};

function clsx(...arr: Array<string | false | undefined>) {
  return arr.filter(Boolean).join(' ');
}
function downloadBlob(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ---------------------------------- page ---------------------------------- */

export default function UuidNanoidPage() {
  const [mode, setMode] = useState<Mode>('uuid');

  // shared
  const [count, setCount] = useState(10);
  const [uniqueOnly, setUniqueOnly] = useState(true);
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [delimiter, setDelimiter] = useState('\n');
  const [fullscreen, setFullscreen] = useState(false);

  // uuid
  const [uuidVersion, setUuidVersion] = useState<UuidVersion>('v4');
  const [uuidUpper, setUuidUpper] = useState(false);
  const [uuidHyphens, setUuidHyphens] = useState(true);
  const [uuidBraces, setUuidBraces] = useState(false);
  const [v5NamespacePreset, setV5NamespacePreset] = useState<'URL' | 'DNS' | 'Custom'>('URL');
  const [v5Namespace, setV5Namespace] = useState<string>(''); // used when Custom
  const [v5Name, setV5Name] = useState<string>('');

  // nanoid
  const [nanoSize, setNanoSize] = useState(21);
  const [nanoAlphabet, setNanoAlphabet] = useState<string>(DEFAULT_NANO_ALPHABET);
  const [nanoPreset, setNanoPreset] = useState<string>('URL-safe (default)');

  // output + state
  const [list, setList] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | 'ALL' | null>(null);
  const [filename, setFilename] = useState('ids.txt');
  const [validationInput, setValidationInput] = useState('');
  const [errors, setErrors] = useState<string | null>(null);

  // restore persisted state
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        setMode(s.mode ?? 'uuid');
        setCount(s.count ?? 10);
        setUniqueOnly(s.uniqueOnly ?? true);
        setPrefix(s.prefix ?? '');
        setSuffix(s.suffix ?? '');
        setDelimiter(s.delimiter ?? '\n');
        setFullscreen(false);

        setUuidVersion(s.uuidVersion ?? 'v4');
        setUuidUpper(s.uuidUpper ?? false);
        setUuidHyphens(s.uuidHyphens ?? true);
        setUuidBraces(s.uuidBraces ?? false);
        setV5NamespacePreset(s.v5NamespacePreset ?? 'URL');
        setV5Namespace(s.v5Namespace ?? '');
        setV5Name(s.v5Name ?? '');

        setNanoSize(s.nanoSize ?? 21);
        setNanoAlphabet(s.nanoAlphabet ?? DEFAULT_NANO_ALPHABET);
        setNanoPreset(s.nanoPreset ?? 'URL-safe (default)');

        setFilename(s.filename ?? 'ids.txt');
      }
    } catch {}
  }, []);

  // persist
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            mode,
            count,
            uniqueOnly,
            prefix,
            suffix,
            delimiter,
            uuidVersion,
            uuidUpper,
            uuidHyphens,
            uuidBraces,
            v5NamespacePreset,
            v5Namespace,
            v5Name,
            nanoSize,
            nanoAlphabet,
            nanoPreset,
            filename,
          }),
        );
      } catch {}
    }, 180);
    return () => clearTimeout(t);
  }, [mode, count, uniqueOnly, prefix, suffix, delimiter, uuidVersion, uuidUpper, uuidHyphens, uuidBraces, v5NamespacePreset, v5Namespace, v5Name, nanoSize, nanoAlphabet, nanoPreset, filename]);

  const entropyBits = useMemo(() => {
    if (mode === 'uuid') {
      if (uuidVersion === 'v5') return 0; // deterministic hash
      return 122; // uuid v1/v4/v7 effective randomness
    }
    const L = Math.max(1, nanoAlphabet.length);
    return Math.round(nanoSize * Math.log2(L));
  }, [mode, uuidVersion, nanoAlphabet, nanoSize]);

  /* ------------------------------- generation ------------------------------ */

  const formatUuid = (id: string) => {
    let s = id;
    if (!uuidHyphens) s = s.replace(/-/g, '');
    if (uuidUpper) s = s.toUpperCase();
    if (uuidBraces) s = `{${s}}`;
    if (prefix) s = `${prefix}${s}`;
    if (suffix) s = `${s}${suffix}`;
    return s;
  };

  const genUuidOnce = (): string => {
    switch (uuidVersion) {
      case 'v1':
        return formatUuid(uuid.v1());
      case 'v5': {
        const ns = v5NamespacePreset === 'URL' ? uuid.v5.URL : v5NamespacePreset === 'DNS' ? uuid.v5.DNS : v5Namespace;
        if (!ns || !uuid.validate(ns)) {
          throw new Error('UUID v5 requires a valid namespace UUID (URL/DNS preset or custom).');
        }
        if (!v5Name) {
          throw new Error('UUID v5 requires a "Name" string.');
        }
        return formatUuid(uuid.v5(v5Name, ns));
      }
      case 'v7': {
        const v7 = (uuid as any).v7 as (() => string) | undefined;
        if (typeof v7 !== 'function') {
          // fallback to v4 if package < 9
          return formatUuid(uuid.v4());
        }
        return formatUuid(v7());
      }
      case 'v4':
      default:
        return formatUuid(uuid.v4());
    }
  };

  const genNanoOnce = (): string => {
    const core = nanoAlphabet === DEFAULT_NANO_ALPHABET ? nanoidFn(nanoSize) : customAlphabet(nanoAlphabet, nanoSize)();
    return `${prefix}${core}${suffix}`;
  };

  const run = () => {
    try {
      setErrors(null);
      const out: string[] = [];
      const seen = new Set<string>();
      const target = Math.max(1, Math.min(1000, count));
      let attempts = 0;
      while (out.length < target && attempts < target * 10) {
        attempts++;
        const next = mode === 'uuid' ? genUuidOnce() : genNanoOnce();
        if (uniqueOnly) {
          if (seen.has(next)) continue;
          seen.add(next);
        }
        out.push(next);
      }
      setList(out);
    } catch (e: any) {
      setErrors(String(e?.message || e));
      setList([]);
    }
  };

  const resetAll = () => {
    setMode('uuid');
    setCount(10);
    setUniqueOnly(true);
    setPrefix('');
    setSuffix('');
    setDelimiter('\n');
    setUuidVersion('v4');
    setUuidUpper(false);
    setUuidHyphens(true);
    setUuidBraces(false);
    setV5NamespacePreset('URL');
    setV5Namespace('');
    setV5Name('');
    setNanoSize(21);
    setNanoAlphabet(DEFAULT_NANO_ALPHABET);
    setNanoPreset('URL-safe (default)');
    setFilename('ids.txt');
    setList([]);
    setErrors(null);
  };

  const copyOne = async (s: string) => {
    try {
      await navigator.clipboard.writeText(s);
      setCopied(s);
      setTimeout(() => setCopied(null), 900);
    } catch {}
  };
  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(list.join(delimiter || '\n'));
      setCopied('ALL');
      setTimeout(() => setCopied(null), 900);
    } catch {}
  };

  const exportTxt = () => {
    const body = list.join(delimiter || '\n');
    downloadBlob(filename || 'ids.txt', body, 'text/plain;charset=utf-8');
  };

  /* -------------------------------- validate ------------------------------- */

  const validation = useMemo(() => {
    const s = validationInput.trim();
    if (!s) return { type: 'empty' as const };
    if (uuid.validate(s.replace(/[{}]/g, ''))) {
      const ver = uuid.version(s.replace(/[{}]/g, ''));
      return { type: 'uuid' as const, valid: true, version: ver };
    }
    // simple nano check: current alphabet + size
    const alpha = nanoAlphabet || DEFAULT_NANO_ALPHABET;
    const rx = new RegExp(`^[${escapeRegExp(alpha)}]+$`);
    return {
      type: 'nanoid' as const,
      valid: rx.test(s),
      length: s.length,
      expected: nanoSize,
    };
  }, [validationInput, nanoAlphabet, nanoSize]);

  /* ---------------------------------- UI ---------------------------------- */

  return (
    <MotionGlassCard>
      {/* Header */}
      <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Hash className="h-6 w-6" /> UUID & NanoID Generator
          </h1>
          <p className="text-sm text-muted-foreground">Secure IDs with custom rules, batch generation, formatting, validation & export.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={resetAll} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          <Button variant="outline" onClick={() => setList([])} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Clear
          </Button>
          <Button onClick={run} className="gap-2">
            <Shuffle className="h-4 w-4" /> Generate
          </Button>
        </div>
      </GlassCard>

      {/* Settings */}
      <GlassCard className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Settings</CardTitle>
          <CardDescription>Choose generator, size/count, formatting & uniqueness.</CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4 lg:grid-cols-3">
          {/* Left: mode & common */}
          <div className="rounded-lg border p-3 space-y-3">
            <Label className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" /> Generator
            </Label>
            <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)} className="w-full">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="uuid" className="gap-2">
                  <Key className="h-4 w-4" /> UUID
                </TabsTrigger>
                <TabsTrigger value="nanoid" className="gap-2">
                  <Type className="h-4 w-4" /> NanoID
                </TabsTrigger>
              </TabsList>

              <TabsContent value="uuid" className="mt-3 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Version</Label>
                    <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={uuidVersion} onChange={(e) => setUuidVersion(e.target.value as UuidVersion)}>
                      <option value="v1">v1 — time-based</option>
                      <option value="v4">v4 — random</option>
                      <option value="v5">v5 — namespace/name</option>
                      <option value="v7">v7 — Unix time + rand</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Count</Label>
                    <Input type="number" min={1} max={1000} value={count} onChange={(e) => setCount(clampInt(e.target.value, 1, 1000))} />
                  </div>

                  {uuidVersion === 'v5' && (
                    <>
                      <div className="space-y-1.5">
                        <Label>v5 Namespace</Label>
                        <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={v5NamespacePreset} onChange={(e) => setV5NamespacePreset(e.target.value as any)}>
                          <option>URL</option>
                          <option>DNS</option>
                          <option>Custom</option>
                        </select>
                      </div>
                      {v5NamespacePreset === 'Custom' && (
                        <div className="space-y-1.5">
                          <Label>Custom Namespace (UUID)</Label>
                          <Input placeholder="e.g. 6ba7b811-9dad-11d1-80b4-00c04fd430c8" value={v5Namespace} onChange={(e) => setV5Namespace(e.target.value)} />
                        </div>
                      )}
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label>Name (string)</Label>
                        <Input placeholder="e.g. https://naturalsefaa.com" value={v5Name} onChange={(e) => setV5Name(e.target.value)} />
                      </div>
                    </>
                  )}

                  <div className="col-span-2 grid grid-cols-2 gap-3">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <span className="text-sm">Uppercase</span>
                      <Switch checked={uuidUpper} onCheckedChange={setUuidUpper} />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <span className="text-sm">Hyphens</span>
                      <Switch checked={uuidHyphens} onCheckedChange={setUuidHyphens} />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <span className="text-sm">Braces</span>
                      <Switch checked={uuidBraces} onCheckedChange={setUuidBraces} />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <span className="text-sm">Unique only</span>
                      <Switch checked={uniqueOnly} onCheckedChange={setUniqueOnly} />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="nanoid" className="mt-3 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Size</Label>
                    <Input type="number" min={3} max={200} value={nanoSize} onChange={(e) => setNanoSize(clampInt(e.target.value, 3, 200))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Count</Label>
                    <Input type="number" min={1} max={1000} value={count} onChange={(e) => setCount(clampInt(e.target.value, 1, 1000))} />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Alphabet Preset</Label>
                    <select
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                      value={nanoPreset}
                      onChange={(e) => {
                        const k = e.target.value;
                        setNanoPreset(k);
                        setNanoAlphabet(PRESETS[k] ?? DEFAULT_NANO_ALPHABET);
                      }}>
                      {Object.keys(PRESETS).map((k) => (
                        <option key={k}>{k}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Custom Alphabet</Label>
                    <Input
                      value={nanoAlphabet}
                      onChange={(e) => {
                        setNanoAlphabet(e.target.value);
                        setNanoPreset('Custom');
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Entropy ≈ <b>{entropyBits}</b> bits • Alphabet length {nanoAlphabet.length}
                    </p>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3 sm:col-span-2">
                    <span className="text-sm">Unique only</span>
                    <Switch checked={uniqueOnly} onCheckedChange={setUniqueOnly} />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Middle: formatting */}
          <div className="rounded-lg border p-3 space-y-3">
            <Label className="flex items-center gap-2">
              <ListChecks className="h-4 w-4" /> Formatting
            </Label>
            <div className="grid gap-3">
              <div className="space-y-1.5">
                <Label>Prefix</Label>
                <Input value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="e.g. id_" />
              </div>
              <div className="space-y-1.5">
                <Label>Suffix</Label>
                <Input value={suffix} onChange={(e) => setSuffix(e.target.value)} placeholder="e.g. _prod" />
              </div>
              <div className="space-y-1.5">
                <Label>Join delimiter (for copy/export)</Label>
                <Input value={delimiter} onChange={(e) => setDelimiter(e.target.value)} placeholder="\\n for newline" />
              </div>
              <div className="space-y-1.5">
                <Label>Filename (export)</Label>
                <Input value={filename} onChange={(e) => setFilename(e.target.value)} placeholder="ids.txt" />
              </div>
              <p className="text-xs text-muted-foreground">
                Entropy ≈ <b>{entropyBits}</b> bits {mode === 'uuid' && uuidVersion !== 'v5' ? '(per ID)' : ''}
              </p>
            </div>
          </div>

          {/* Right: quick tools */}
          <div className="rounded-lg border p-3 space-y-3">
            <Label className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" /> Quick Tools
            </Label>
            <div className="grid gap-2">
              <Button variant="outline" className="gap-2" onClick={() => setList([])}>
                <RefreshCw className="h-4 w-4" /> Clear results
              </Button>
              <Button variant="outline" className="gap-2" onClick={copyAll} disabled={list.length === 0}>
                {copied === 'ALL' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy all
              </Button>
              <Button variant="outline" className="gap-2" onClick={exportTxt} disabled={list.length === 0}>
                <Download className="h-4 w-4" /> Export .txt
              </Button>
              <Button className="gap-2" onClick={() => setFullscreen((v) => !v)}>
                {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Fullscreen className="h-4 w-4" />}
                {fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              </Button>
            </div>
            <Separator className="my-2" />
            <Label className="flex items-center gap-2">
              <Upload className="h-4 w-4" /> Validate
            </Label>
            <Input placeholder="Paste an ID to validate (UUID or NanoID)" value={validationInput} onChange={(e) => setValidationInput(e.target.value)} />
            <ValidationResult validation={validation} />
          </div>
        </CardContent>
      </GlassCard>

      <Separator />

      {/* Results */}
      <div className={clsx(fullscreen ? 'fixed inset-2 z-50' : 'relative', 'rounded-2xl')}>
        <GlassCard className={clsx('shadow-sm h-full', fullscreen && 'ring-1 ring-primary/30')}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Generated IDs</CardTitle>
                <CardDescription>{list.length === 0 ? 'Click Generate to create IDs.' : `Showing ${list.length} ID${list.length > 1 ? 's' : ''}.`}</CardDescription>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                <Hash className="h-4 w-4" />
                {mode === 'uuid' ? `UUID ${uuidVersion.toUpperCase()}` : `NanoID (${nanoSize})`}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {errors && <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">{errors}</div>}

            {list.length === 0 ? (
              <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                Tip: use <b>Prefix/Suffix</b> for environment tags (e.g., <code>id_</code>, <code>_prod</code>). Enable <b>Unique only</b> to dedupe.
              </div>
            ) : (
              <>
                {/* Desktop grid */}
                <div className="hidden md:grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {list.map((id, i) => (
                    <IdCard key={i} idx={i} id={id} onCopy={() => copyOne(id)} copied={copied === id} />
                  ))}
                </div>

                {/* Mobile textarea */}
                <div className="md:hidden">
                  <div className="flex justify-end mb-2">
                    <Button size="sm" variant="outline" className="gap-2" onClick={copyAll}>
                      {copied === 'ALL' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy all
                    </Button>
                  </div>
                  <Textarea readOnly className="min-h-[260px] font-mono text-xs" value={list.join('\n')} />
                </div>
              </>
            )}
          </CardContent>
        </GlassCard>
      </div>
    </MotionGlassCard>
  );
}

/* -------------------------------- sub-views -------------------------------- */

function IdCard({ idx, id, onCopy, copied }: { idx: number; id: string; onCopy: () => void; copied: boolean }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">ID {idx + 1}</span>
        <Button size="sm" variant="outline" className="gap-2" onClick={onCopy}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy
        </Button>
      </div>
      <Textarea readOnly value={id} className="min-h-[60px] font-mono text-xs" />
    </div>
  );
}

function ValidationResult({
  validation,
}: {
  validation: { type: 'empty' } | { type: 'uuid'; valid: boolean; version: number } | { type: 'nanoid'; valid: boolean; length: number; expected: number };
}) {
  if (validation.type === 'empty') {
    return <p className="text-xs text-muted-foreground">Paste an ID above.</p>;
  }
  if (validation.type === 'uuid') {
    return (
      <p className="text-xs">
        UUID: <b className={validation.valid ? 'text-emerald-500' : 'text-destructive'}>{validation.valid ? 'valid' : 'invalid'}</b>
        {validation.valid && (
          <>
            {' '}
            • version <b>{validation.version}</b>
          </>
        )}
      </p>
    );
  }
  return (
    <p className="text-xs">
      NanoID: <b className={validation.valid ? 'text-emerald-500' : 'text-destructive'}>{validation.valid ? 'valid' : 'invalid'}</b> • length <b>{validation.length}</b> (expected ~
      {validation.expected})
    </p>
  );
}

/* --------------------------------- helpers -------------------------------- */

function clampInt(v: string, min: number, max: number) {
  const n = parseInt(v.replace(/[^\d-]/g, ''), 10);
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}
function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
