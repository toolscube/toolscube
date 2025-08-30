'use client';

import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GlassCard, MotionGlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { Check, Copy, Eraser, Info, List, RefreshCcw, Settings, Type, Wand2 as Wand } from 'lucide-react';
import toast from 'react-hot-toast';

/* ------------------------------ Types ------------------------------ */
type DelimiterChar = '-' | '_' | '';
type DelimiterKey = 'dash' | 'underscore' | 'none';
type Mode = 'single' | 'batch';

type Options = {
  delimiter: DelimiterChar;
  lowercase: boolean;
  trim: boolean;
  transliterate: boolean; // remove diacritics
  collapse: boolean; // collapse repeated delimiters
  preserveUnderscore: boolean;
  keepNumbers: boolean;
  maxLen: number; // 0 = unlimited
  stopwords: string[]; // words to drop before slugifying
  customMap: Record<string, string>; // user replacements before cleanup
};

const delimiterFromKey = (k: DelimiterKey): DelimiterChar => (k === 'dash' ? '-' : k === 'underscore' ? '_' : '');

/* --------------------------- Slugify Core --------------------------- */
function deburr(input: string) {
  // Remove diacritics using NFD + strip combining marks
  return input.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function applyCustomMap(text: string, map: Record<string, string>) {
  // Replace longer keys first to avoid partial overlaps
  const entries = Object.entries(map)
    .filter(([k]) => k.length > 0)
    .sort((a, b) => b[0].length - a[0].length);

  for (const [from, to] of entries) {
    const re = new RegExp(escapeRegExp(from), 'g');
    text = text.replace(re, to);
  }
  return text;
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function tokenize(text: string) {
  // Split by any non letter/number/underscore characters
  return text.split(/[^A-Za-z0-9_]+/).filter(Boolean);
}

function removeStopwords(tokens: string[], stop: string[]) {
  if (!stop.length) return tokens;
  const set = new Set(stop.map((w) => w.toLowerCase().trim()).filter(Boolean));
  return tokens.filter((t) => !set.has(t.toLowerCase()));
}

function toWordsFromCamel(text: string) {
  // insert spaces before capitals/digits transitions (e.g., "HelloWorld99" -> "Hello World 99")
  return text.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/([A-Za-z])(\d+)/g, '$1 $2');
}

function slugify(input: string, o: Options): string {
  let s = input ?? '';

  // Pre process
  s = toWordsFromCamel(s);
  s = applyCustomMap(s, o.customMap);
  if (o.transliterate) s = deburr(s);

  if (o.trim) s = s.trim();

  // Replace everything that's not alnum or underscore by space
  s = s.replace(/[^\p{Letter}\p{Number}_]+/gu, ' ');

  // Tokenize and optionally remove stopwords
  let tokens = tokenize(s);
  tokens = removeStopwords(tokens, o.stopwords);

  // Filter out pure-number tokens only if keepNumbers is false
  if (!o.keepNumbers) tokens = tokens.filter((t) => !/^\d+$/.test(t));

  // Join with delimiter
  let out = tokens.join(o.delimiter || '');

  // Collapse repeats of delimiter
  if (o.collapse && o.delimiter) {
    const re = new RegExp(`${escapeRegExp(o.delimiter)}{2,}`, 'g');
    out = out.replace(re, o.delimiter);
  }

  // Remove leading/trailing delimiter
  if (o.delimiter) out = out.replace(new RegExp(`^${escapeRegExp(o.delimiter)}|${escapeRegExp(o.delimiter)}$`, 'g'), '');

  if (o.lowercase) out = out.toLowerCase();

  // Max length (soft trim at delimiter boundary when possible)
  if (o.maxLen > 0 && out.length > o.maxLen) {
    if (o.delimiter && out.includes(o.delimiter)) {
      const parts = out.split(o.delimiter);
      let keep: string[] = [];
      let len = 0;
      for (const p of parts) {
        if ((len ? len + o.delimiter.length : 0) + p.length > o.maxLen) break;
        keep.push(p);
        len += (len ? o.delimiter.length : 0) + p.length;
      }
      out = keep.length ? keep.join(o.delimiter) : out.slice(0, o.maxLen);
    } else {
      out = out.slice(0, o.maxLen);
    }
  }

  // Underscore handling relative to chosen delimiter
  if (o.preserveUnderscore) {
    if (o.delimiter && o.delimiter !== '_') {
      out = out.replace(/_+/g, o.delimiter);
    }
  } else {
    if (o.delimiter && o.delimiter !== '_') {
      out = out.replace(/_+/g, o.delimiter);
    } else if (!o.delimiter) {
      out = out.replace(/_+/g, '');
    }
  }

  return out;
}

/* ----------------------------- Page UI ----------------------------- */

export default function SlugifyPage() {
  const [mode, setMode] = React.useState<Mode>('single');
  const [input, setInput] = React.useState<string>('');
  const [batchInput, setBatchInput] = React.useState<string>('');
  const [output, setOutput] = React.useState<string>('');
  const [batchOutput, setBatchOutput] = React.useState<string>('');
  const [copied, setCopied] = React.useState<'in' | 'out' | null>(null);

  const [delimiterKey, setDelimiterKey] = React.useState<DelimiterKey>('dash');
  const [lowercase, setLowercase] = React.useState(true);
  const [trim, setTrim] = React.useState(true);
  const [transliterate, setTransliterate] = React.useState(true);
  const [collapse, setCollapse] = React.useState(true);
  const [preserveUnderscore, setPreserveUnderscore] = React.useState(false);
  const [keepNumbers, setKeepNumbers] = React.useState(true);
  const [maxLen, setMaxLen] = React.useState<number>(0);
  const [stopwordText, setStopwordText] = React.useState<string>('a, an, the, and, or, of, for, with');
  const [customMapText, setCustomMapText] = React.useState<string>('™ =>\n& => and\n@ => at');

  const opts: Options = React.useMemo(
    () => ({
      delimiter: delimiterFromKey(delimiterKey),
      lowercase,
      trim,
      transliterate,
      collapse,
      preserveUnderscore,
      keepNumbers,
      maxLen,
      stopwords: parseStopwords(stopwordText),
      customMap: parseCustomMap(customMapText),
    }),
    [delimiterKey, lowercase, trim, transliterate, collapse, preserveUnderscore, keepNumbers, maxLen, stopwordText, customMapText],
  );

  const runSingle = React.useCallback(() => {
    setOutput(slugify(input, opts));
  }, [input, opts]);

  const runBatch = React.useCallback(() => {
    const lines = (batchInput || '').split(/\r?\n/);
    const slugs = lines.map((l) => slugify(l, opts));
    setBatchOutput(slugs.join('\n'));
  }, [batchInput, opts]);

  React.useEffect(() => {
    if (mode === 'single') runSingle();
  }, [mode, runSingle]);

  React.useEffect(() => {
    if (mode === 'batch') runBatch();
  }, [mode, runBatch]);

  const copyValue = async (kind: 'in' | 'out') => {
    const val = kind === 'in' ? (mode === 'single' ? input : batchInput) : mode === 'single' ? output : batchOutput;
    try {
      await navigator.clipboard.writeText(val);
      setCopied(kind);
      setTimeout(() => setCopied(null), 900);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Copy failed');
    }
  };

  const resetAll = () => {
    setInput('');
    setBatchInput('');
    setOutput('');
    setBatchOutput('');
    setDelimiterKey('dash');
    setLowercase(true);
    setTrim(true);
    setTransliterate(true);
    setCollapse(true);
    setPreserveUnderscore(false);
    setKeepNumbers(true);
    setMaxLen(0);
    setStopwordText('a, an, the, and, or, of, for, with');
    setCustomMapText('™ =>\n& => and\n@ => at');
  };

  const applyPreset = (key: 'seo' | 'github' | 'id' | 'raw') => {
    if (key === 'seo') {
      setDelimiterKey('dash');
      setLowercase(true);
      setTransliterate(true);
      setCollapse(true);
      setMaxLen(80);
    } else if (key === 'github') {
      setDelimiterKey('dash');
      setLowercase(true);
      setTransliterate(true);
      setCollapse(true);
      setPreserveUnderscore(false);
      setMaxLen(100);
    } else if (key === 'id') {
      setDelimiterKey('none'); // compact IDs (no delimiter)
      setLowercase(true);
      setTransliterate(true);
      setCollapse(true);
      setKeepNumbers(true);
      setMaxLen(32);
    } else {
      // raw: minimal processing
      setDelimiterKey('dash');
      setLowercase(false);
      setTransliterate(false);
      setCollapse(true);
      setMaxLen(0);
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 md:p-8">
      <MotionGlassCard>
        {/* Header */}
        <GlassCard className="px-6 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
                <Type className="h-6 w-6" />
                Slugify
              </h1>
              <p className="text-sm text-muted-foreground">Convert titles and phrases into clean, URL-safe slugs. Single & batch modes with smart options.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Info className="h-3.5 w-3.5" />
                Client-side only
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Settings className="h-3.5 w-3.5" />
                Presets available
              </Badge>
            </div>
          </div>
        </GlassCard>

        {/* Presets + Controls */}
        <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <GlassCard className="p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Label className="text-sm mr-2">Presets</Label>
              <Button size="sm" variant="outline" onClick={() => applyPreset('seo')}>
                SEO Blog
              </Button>
              <Button size="sm" variant="outline" onClick={() => applyPreset('github')}>
                GitHub Anchor
              </Button>
              <Button size="sm" variant="outline" onClick={() => applyPreset('id')}>
                Compact ID
              </Button>
              <Button size="sm" variant="outline" onClick={() => applyPreset('raw')}>
                Raw
              </Button>
              <div className="ml-auto">
                <Button variant="ghost" size="sm" className="gap-2" onClick={resetAll}>
                  <RefreshCcw className="h-4 w-4" /> Reset
                </Button>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Delimiter</Label>
                <Select value={delimiterKey} onValueChange={(v) => setDelimiterKey(v as DelimiterKey)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dash">Dash (-)</SelectItem>
                    <SelectItem value="underscore">Underscore (_)</SelectItem>
                    <SelectItem value="none">None (concat)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxLen">Max length (0 = off)</Label>
                <Input id="maxLen" type="number" min={0} max={200} value={maxLen || ''} onChange={(e) => setMaxLen(Math.max(0, Number(e.target.value) || 0))} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <SwitchRow label="Lowercase" value={lowercase} onChange={setLowercase} />
                <SwitchRow label="Trim edges" value={trim} onChange={setTrim} />
                <SwitchRow label="Transliterate" hint="Remove accents/diacritics" value={transliterate} onChange={setTransliterate} />
                <SwitchRow label="Collapse repeats" value={collapse} onChange={setCollapse} />
                <SwitchRow label="Keep numbers" value={keepNumbers} onChange={setKeepNumbers} />
                <SwitchRow label="Preserve _" value={preserveUnderscore} onChange={setPreserveUnderscore} />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Stopwords (comma-separated)</Label>
                <Input value={stopwordText} onChange={(e) => setStopwordText(e.target.value)} placeholder="a, an, the, and…" />
              </div>
              <div className="space-y-2">
                <Label>Custom replacements (one per line, “from - to”)</Label>
                <Textarea className="font-mono min-h-[110px]" value={customMapText} onChange={(e) => setCustomMapText(e.target.value)} placeholder={`™ => \n& => and\n@ => at`} />
              </div>
            </div>
          </GlassCard>
        </div>

        <Separator className="my-6" />

        {/* Tabs: Single / Batch */}
        <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single" className="gap-2">
              <Type className="h-4 w-4" /> Single
            </TabsTrigger>
            <TabsTrigger value="batch" className="gap-2">
              <List className="h-4 w-4" /> Batch
            </TabsTrigger>
          </TabsList>

          {/* Single */}
          <TabsContent value="single" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <GlassCard className="p-5">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Input</Label>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="gap-2" onClick={() => setInput('')}>
                      <Eraser className="h-4 w-4" /> Clear
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2" onClick={() => copyValue('in')}>
                      {copied === 'in' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied === 'in' ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyUp={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      setOutput(slugify(input, opts));
                    }
                  }}
                  placeholder="Write a title to slugify…  (Ctrl/Cmd + Enter to run)"
                  className="mt-2 min-h-[160px]"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button className="gap-2" onClick={() => setOutput(slugify(input, opts))}>
                    <Wand className="h-4 w-4" /> Slugify
                  </Button>
                </div>
              </GlassCard>

              <GlassCard className="p-5">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Output</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-2" onClick={() => copyValue('out')}>
                          {copied === 'out' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          {copied === 'out' ? 'Copied' : 'Copy'}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy output</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input readOnly value={output} placeholder="Result will appear here…" className="mt-2 font-mono" />
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>
                    Length: <code className="rounded bg-muted px-1">{output.length}</code>
                  </span>
                  <span>
                    Delimiter:{' '}
                    <code className="rounded bg-muted px-1">
                      {(() => {
                        const d = delimiterFromKey(delimiterKey);
                        return d || '(none)';
                      })()}
                    </code>
                  </span>
                </div>
              </GlassCard>
            </div>
          </TabsContent>

          {/* Batch */}
          <TabsContent value="batch" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <GlassCard className="p-5">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Input (one title per line)</Label>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="gap-2" onClick={() => setBatchInput('')}>
                      <Eraser className="h-4 w-4" /> Clear
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2" onClick={() => copyValue('in')}>
                      {copied === 'in' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied === 'in' ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                </div>
                <Textarea value={batchInput} onChange={(e) => setBatchInput(e.target.value)} placeholder="My First Post\n10 Tips for SEO\nবাংলা শিরোনামও সমর্থিত" className="mt-2 min-h-[220px]" />
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button className="gap-2" onClick={runBatch}>
                    <Wand className="h-4 w-4" /> Slugify List
                  </Button>
                </div>
              </GlassCard>

              <GlassCard className="p-5">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Output (one slug per line)</Label>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="gap-2" onClick={() => copyValue('out')}>
                      {copied === 'out' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied === 'out' ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                </div>
                <Textarea readOnly value={batchOutput} placeholder="result-one\nresult-two\nresult-three" className="mt-2 min-h-[220px] font-mono" />
                <div className="mt-3 text-xs text-muted-foreground">
                  Lines: <code className="rounded bg-muted px-1">{batchOutput ? batchOutput.split('\n').length : 0}</code>
                </div>
              </GlassCard>
            </div>
          </TabsContent>
        </Tabs>
      </MotionGlassCard>
    </div>
  );
}

/* --------------------------- Helper Components -------------------------- */

function SwitchRow({ label, value, onChange, hint }: { label: string; value: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-2">
      <div className="mr-3">
        <p className="text-sm font-medium leading-none">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}

/* ------------------------------ Parsers ------------------------------ */

function parseStopwords(text: string): string[] {
  return text
    .split(',')
    .map((w) => w.trim())
    .filter(Boolean);
}

function parseCustomMap(text: string): Record<string, string> {
  // Lines like: "™ =>" or "& => and"
  const map: Record<string, string> = {};
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^(.*?)(?:\s*=>\s*)(.*)$/);
    if (!m) continue;
    const from = (m[1] ?? '').trim();
    const to = (m[2] ?? '').trim();
    if (from.length) map[from] = to;
  }
  return map;
}
