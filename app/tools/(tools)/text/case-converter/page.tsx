'use client';

import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard, MotionGlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { ArrowLeftRight, Check, Copy, Download, Eraser, Info, Replace, RotateCcw, Type as TypeIcon, UploadCloud, Wand2 } from 'lucide-react';

/* --------------------------------- Types --------------------------------- */

type CaseMode = 'upper' | 'lower' | 'title' | 'sentence' | 'camel' | 'pascal' | 'snake' | 'kebab' | 'constant' | 'capitalized' | 'alternating' | 'invert';

type PipelineToggle = 'trim' | 'collapseSpaces' | 'removePunctuation' | 'normalizeQuotes' | 'removeDiacritics';

/* ------------------------------- Utilities -------------------------------- */

const SMALL_WORDS = new Set([
  'a',
  'an',
  'and',
  'the',
  'for',
  'to',
  'in',
  'on',
  'at',
  'of',
  'is',
  'are',
  'am',
  'be',
  'was',
  'were',
  'it',
  'its',
  'that',
  'this',
  'with',
  'as',
  'by',
  'from',
  'or',
  'if',
  'then',
  'than',
  'so',
  'but',
  'not',
  'no',
  'we',
  'you',
  'i',
  'your',
  'our',
  'they',
  'he',
  'she',
  'them',
  'his',
  'her',
  'their',
  'my',
  'me',
  'us',
  'been',
  'have',
  'has',
  'had',
  'do',
  'does',
  'did',
  'can',
  'could',
  'should',
  'would',
  'will',
  'just',
  'about',
  'into',
  'over',
  'under',
  'out',
  'up',
  'down',
  'again',
  'more',
  'most',
  'some',
  'such',
  'only',
  'own',
  'same',
  'other',
  'any',
  'each',
  'few',
]);

function normalizeLF(s: string) {
  return s.replace(/\r\n?/g, '\n');
}

function trimAll(s: string) {
  return s.trim();
}
function collapseSpaces(s: string) {
  // collapse internal spaces/tabs, tidy blank lines
  return s
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n');
}
function removePunctuation(s: string) {
  return s.replace(/[^\p{L}\p{N}\s]/gu, '');
}
function normalizeQuotes(s: string) {
  // smart -> straight
  return s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/—/g, '-').replace(/–/g, '-');
}
function removeDiacritics(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// split into words preserving letters/numbers (unicode)
function wordsFrom(s: string) {
  return s.match(/[\p{L}\p{N}]+/gu) || [];
}
function toCamel(words: string[]) {
  return words.map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())).join('');
}
function toPascal(words: string[]) {
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
}
function toSnake(words: string[]) {
  return words.map((w) => w.toLowerCase()).join('_');
}
function toKebab(words: string[]) {
  return words.map((w) => w.toLowerCase()).join('-');
}
function toConstant(words: string[]) {
  return words.map((w) => w.toUpperCase()).join('_');
}
function toCapitalized(s: string) {
  return s.replace(/\b(\p{L})(\p{L}*)/gu, (_, a: string, b: string) => a.toUpperCase() + b.toLowerCase());
}
function toAlternating(s: string) {
  let i = 0;
  return s.replace(/./g, (ch) => {
    if (!/\S/.test(ch)) return ch;
    const out = i % 2 === 0 ? ch.toLowerCase() : ch.toUpperCase();
    i++;
    return out;
  });
}
function toInvert(s: string) {
  return s.replace(/\p{L}/gu, (ch) => (ch === ch.toLowerCase() ? ch.toUpperCase() : ch.toLowerCase()));
}
function toSentenceCase(s: string) {
  const text = s.toLowerCase();
  return text.replace(/(^\s*\p{L})|([.!?]\s+\p{L})/gmu, (m) => m.toUpperCase());
}
function toTitleCase(s: string) {
  // Title Case with small words kept lower unless first/last or after punctuation
  return s.toLowerCase().replace(/\b(\p{L}[\p{L}\p{N}'’]*)\b/gu, (word, grp, offset, full) => {
    const isFirst = offset === 0;
    const isLast = offset + word.length === full.length;
    const prev = full.slice(Math.max(0, offset - 2), offset); // check for punctuation
    const afterPunct = /[\-–—:;.!?]\s?$/.test(prev);
    const lw = word.toLowerCase();
    if (!isFirst && !isLast && !afterPunct && SMALL_WORDS.has(lw)) return lw;
    return lw.charAt(0).toUpperCase() + lw.slice(1);
  });
}

function applyCase(mode: CaseMode, s: string) {
  switch (mode) {
    case 'upper':
      return s.toUpperCase();
    case 'lower':
      return s.toLowerCase();
    case 'title':
      return toTitleCase(s);
    case 'sentence':
      return toSentenceCase(s);
    case 'camel':
      return toCamel(wordsFrom(s));
    case 'pascal':
      return toPascal(wordsFrom(s));
    case 'snake':
      return toSnake(wordsFrom(s));
    case 'kebab':
      return toKebab(wordsFrom(s));
    case 'constant':
      return toConstant(wordsFrom(s));
    case 'capitalized':
      return toCapitalized(s);
    case 'alternating':
      return toAlternating(s);
    case 'invert':
      return toInvert(s);
  }
}

function runPipeline(s: string, toggles: Record<PipelineToggle, boolean>) {
  let out = normalizeLF(s);
  if (toggles.trim) out = trimAll(out);
  if (toggles.collapseSpaces) out = collapseSpaces(out);
  if (toggles.normalizeQuotes) out = normalizeQuotes(out);
  if (toggles.removeDiacritics) out = removeDiacritics(out);
  if (toggles.removePunctuation) out = removePunctuation(out);
  return out;
}

/* -------------------------------- Component -------------------------------- */

export default function CaseConverterPage() {
  const [source, setSource] = React.useState<string>('');
  const [mode, setMode] = React.useState<CaseMode>('title');
  const [live, setLive] = React.useState<boolean>(true);
  const [copied, setCopied] = React.useState<'src' | 'dst' | null>(null);

  const [toggles, setToggles] = React.useState<Record<PipelineToggle, boolean>>({
    trim: true,
    collapseSpaces: true,
    removePunctuation: false,
    normalizeQuotes: false,
    removeDiacritics: false,
  });

  const [customSep, setCustomSep] = React.useState<string>(''); // optional: replace spaces with this (applied after case)

  const processed = React.useMemo(() => runPipeline(source, toggles), [source, toggles]);
  const transformed = React.useMemo(() => {
    const base = applyCase(mode, processed);
    if (!customSep) return base;
    // replace whitespace runs with a custom separator (useful after Title/Sentence etc.)
    return base.replace(/\s+/g, customSep);
  }, [processed, mode, customSep]);

  const resetAll = () => {
    setSource('');
    setMode('title');
    setLive(true);
    setCopied(null);
    setToggles({
      trim: true,
      collapseSpaces: true,
      removePunctuation: false,
      normalizeQuotes: false,
      removeDiacritics: false,
    });
    setCustomSep('');
  };

  const copy = async (which: 'src' | 'dst') => {
    try {
      await navigator.clipboard.writeText(which === 'src' ? source : transformed);
      setCopied(which);
      setTimeout(() => setCopied(null), 900);
    } catch {}
  };

  const paste = async () => {
    try {
      const s = await navigator.clipboard.readText();
      setSource((prev) => (prev ? prev + (prev.endsWith('\n') ? '' : '\n') + s : s));
    } catch {}
  };

  const download = (which: 'src' | 'dst') => {
    const content = which === 'src' ? source : transformed;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = which === 'src' ? 'original.txt' : 'converted.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const upload: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const text = await f.text();
    setSource(text);
    e.currentTarget.value = '';
  };

  // Presets
  const presetSlug = () => {
    setMode('kebab');
    setToggles({ trim: true, collapseSpaces: true, removePunctuation: true, normalizeQuotes: true, removeDiacritics: true });
    setCustomSep(''); // kebab uses wordsFrom; punctuation removed by toggle
  };
  const presetCode = () => {
    setMode('snake');
    setToggles({ trim: true, collapseSpaces: true, removePunctuation: true, normalizeQuotes: true, removeDiacritics: true });
    setCustomSep('');
  };
  const presetSocial = () => {
    setMode('title');
    setToggles({ trim: true, collapseSpaces: true, removePunctuation: false, normalizeQuotes: true, removeDiacritics: false });
    setCustomSep('');
  };

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 md:p-8">
      <MotionGlassCard>
        {/* Header */}
        <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 py-5">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <TypeIcon className="h-6 w-6" /> Case Converter
            </h1>
            <p className="text-sm text-muted-foreground">Convert text to Upper, Lower, Title, Sentence, camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, and more.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" onClick={resetAll} className="gap-2">
                    <RotateCcw className="h-4 w-4" /> Reset
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clear text & settings</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button className="gap-2" onClick={() => copy('dst')}>
                    {copied === 'dst' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied === 'dst' ? 'Copied' : 'Copy converted'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy the converted text</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </GlassCard>

        {/* Settings */}
        <GlassCard className="shadow-sm mt-4">
          <CardHeader>
            <CardTitle className="text-base">Settings</CardTitle>
            <CardDescription>Choose a case style and optional clean-up pipeline.</CardDescription>
          </CardHeader>

          <CardContent className="grid gap-4 lg:grid-cols-3">
            {/* Case modes */}
            <div className="space-y-2">
              <Label className="text-sm">Case Style</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(
                  [
                    ['upper', 'UPPER'],
                    ['lower', 'lower'],
                    ['title', 'Title Case'],
                    ['sentence', 'Sentence case'],
                    ['camel', 'camelCase'],
                    ['pascal', 'PascalCase'],
                    ['snake', 'snake_case'],
                    ['kebab', 'kebab-case'],
                    ['constant', 'CONSTANT_CASE'],
                    ['capitalized', 'Capitalized'],
                    ['alternating', 'aLtErNaTiNg'],
                    ['invert', 'iNVERT cASE'],
                  ] as [CaseMode, string][]
                ).map(([key, label]) => (
                  <Button key={key} type="button" variant={mode === key ? 'default' : 'outline'} size="sm" className="justify-center" onClick={() => setMode(key)}>
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Pipeline toggles */}
            <div className="space-y-2">
              <Label className="text-sm">Clean-up Pipeline</Label>
              <div className="grid grid-cols-2 gap-2">
                <ToggleLine label="Trim ends" checked={toggles.trim} onChange={(v) => setToggles((t) => ({ ...t, trim: v }))} />
                <ToggleLine label="Collapse spaces/lines" checked={toggles.collapseSpaces} onChange={(v) => setToggles((t) => ({ ...t, collapseSpaces: v }))} />
                <ToggleLine label="Remove punctuation" checked={toggles.removePunctuation} onChange={(v) => setToggles((t) => ({ ...t, removePunctuation: v }))} />
                <ToggleLine label="Normalize quotes/dashes" checked={toggles.normalizeQuotes} onChange={(v) => setToggles((t) => ({ ...t, normalizeQuotes: v }))} />
                <ToggleLine label="Remove diacritics" checked={toggles.removeDiacritics} onChange={(v) => setToggles((t) => ({ ...t, removeDiacritics: v }))} />
              </div>
            </div>

            {/* Extras */}
            <div className="space-y-2">
              <Label className="text-sm">Extras</Label>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="mr-3">
                  <p className="text-sm font-medium leading-none">Live mode</p>
                  <p className="text-xs text-muted-foreground">Apply changes as you type.</p>
                </div>
                <Switch checked={live} onCheckedChange={setLive} />
              </div>

              <div className="space-y-1">
                <Label htmlFor="customSep">Replace whitespace with</Label>
                <Input id="customSep" placeholder="(Optional) e.g. _ or -" value={customSep} onChange={(e) => setCustomSep(e.target.value)} />
                <p className="text-xs text-muted-foreground">Useful for custom slugs or tokens after conversion.</p>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <Button size="sm" variant="outline" className="gap-2" onClick={presetSlug}>
                  <Wand2 className="h-4 w-4" /> Preset: Slug
                </Button>
                <Button size="sm" variant="outline" className="gap-2" onClick={presetCode}>
                  <Wand2 className="h-4 w-4" /> Preset: Code
                </Button>
                <Button size="sm" variant="outline" className="gap-2" onClick={presetSocial}>
                  <Wand2 className="h-4 w-4" /> Preset: Social
                </Button>
              </div>
            </div>
          </CardContent>
        </GlassCard>

        <Separator className="my-6" />

        {/* Editor & Preview */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Left: Source */}
          <GlassCard className="p-5">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Original Text</Label>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={paste}>
                  <Copy className="h-4 w-4" /> Paste
                </Button>
                <label className="inline-flex">
                  <input type="file" accept=".txt,text/plain" className="hidden" onChange={upload} />
                  <Button variant="outline" size="sm" className="gap-2">
                    <UploadCloud className="h-4 w-4" /> Import .txt
                  </Button>
                </label>
                <Button size="sm" className="gap-2" onClick={() => download('src')} disabled={!source}>
                  <Download className="h-4 w-4" /> Export .txt
                </Button>
              </div>
            </div>

            <Textarea value={source} onChange={(e) => setSource(e.target.value)} placeholder="Type or paste text here…" className="mt-2 min-h-[260px] font-mono" />

            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <Button variant="outline" className="justify-start gap-2" onClick={() => setSource('')}>
                <Eraser className="h-4 w-4" /> Clear
              </Button>
              <Button variant="outline" className="justify-start gap-2" onClick={() => copy('src')}>
                {copied === 'src' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy original
              </Button>
              {!live && (
                <Button className="justify-start gap-2" onClick={() => setSource(transformed)}>
                  <Replace className="h-4 w-4" /> Replace with converted
                </Button>
              )}
            </div>
          </GlassCard>

          {/* Right: Converted */}
          <GlassCard className="p-5">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Converted Preview</Label>
              <Badge variant="secondary" className="gap-1">
                <Info className="h-3.5 w-3.5" />
                {live ? 'Live' : 'Manual'}
              </Badge>
            </div>

            <Textarea
              readOnly
              value={live ? transformed : applyCase(mode, runPipeline(source, toggles)).replace(/\s+/g, customSep || '$&')}
              className="mt-2 min-h-[260px] font-mono"
              placeholder="Converted text will appear here…"
            />

            <div className="mt-4 flex flex-wrap gap-2">
              <Button className="gap-2" onClick={() => copy('dst')} disabled={!transformed}>
                {copied === 'dst' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied === 'dst' ? 'Copied' : 'Copy converted'}
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => download('dst')} disabled={!transformed}>
                <Download className="h-4 w-4" /> Export .txt
              </Button>
              {!live && (
                <Button className="gap-2" onClick={() => setSource(transformed)}>
                  <ArrowLeftRight className="h-4 w-4" /> Apply to source
                </Button>
              )}
            </div>
          </GlassCard>
        </div>
      </MotionGlassCard>
    </div>
  );
}

/* ------------------------------ Small Pieces ------------------------------ */

function ToggleLine({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="mr-3">
        <p className="text-sm font-medium leading-none">{label}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
