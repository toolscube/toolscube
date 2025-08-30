'use client';

import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard, MotionGlassCard } from '@/components/ui/glass-card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { AlignLeft, BarChart2, Check, Clock4, Copy, Download, FileText, Info, Mic, RotateCcw, Type as TypeIcon, UploadCloud } from 'lucide-react';

/* ------------------------------ Types & Data ------------------------------ */

type DensityRow = { word: string; count: number; percent: number };

const EN_STOPWORDS = new Set([
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

/* ------------------------------- Utilities -------------------------------- */

function normalizeText(t: string) {
  // Replace CRLF → LF and normalize spaces
  return t.replace(/\r\n?/g, '\n');
}

function countWords(t: string) {
  // Match “words” including unicode letters/numbers and apostrophes within words
  const m = t.match(/[\p{L}\p{N}]+(?:'[^\s]|[’][^\s])?/gu);
  return m ? m.length : 0;
}

function countCharacters(t: string) {
  return t.length;
}

function countCharactersNoSpaces(t: string) {
  return t.replace(/\s+/g, '').length;
}

function countLines(t: string) {
  if (!t) return 0;
  return t.split('\n').length;
}

function countParagraphs(t: string) {
  const blocks = normalizeText(t)
    .split(/\n{2,}/g)
    .map((s) => s.trim())
    .filter(Boolean);
  return blocks.length;
}

function countSentences(t: string) {
  // Rough sentence split on . ! ? followed by space/newline/end
  const s = t.replace(/\s+/g, ' ').trim();
  if (!s) return 0;
  const m = s.match(/[^.!?]+[.!?]+(\s|$)/g);
  return m ? m.length : 1;
}

function formatTimeFromWPM(words: number, wpm: number) {
  if (words === 0) return '0:00';
  const minutes = words / wpm;
  const totalSec = Math.max(1, Math.round(minutes * 60));
  const mm = Math.floor(totalSec / 60);
  const ss = totalSec % 60;
  return `${mm}:${ss.toString().padStart(2, '0')}`;
}

function toTitleCase(t: string) {
  return t.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function slugify(t: string) {
  return t
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function squeezeSpaces(t: string) {
  return t
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function computeDensity(t: string, { excludeStopwords }: { excludeStopwords: boolean }): DensityRow[] {
  const words = (t.toLowerCase().match(/[\p{L}\p{N}]+/gu) || []).filter((w) => (excludeStopwords ? !EN_STOPWORDS.has(w) : true));
  const total = words.length || 1;
  const map = new Map<string, number>();
  for (const w of words) map.set(w, (map.get(w) || 0) + 1);
  const rows: DensityRow[] = [...map.entries()].map(([word, count]) => ({
    word,
    count,
    percent: (count / total) * 100,
  }));
  rows.sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));
  return rows.slice(0, 20);
}

/* -------------------------------- Component -------------------------------- */

export default function WordCounterPage() {
  const [text, setText] = React.useState<string>('');
  const [copied, setCopied] = React.useState<boolean>(false);

  // Settings
  const [liveClean, setLiveClean] = React.useState<boolean>(false);
  const [excludeStopwords, setExcludeStopwords] = React.useState<boolean>(true);

  // Derived text (optional live cleaning)
  const displayText = React.useMemo(() => (liveClean ? squeezeSpaces(normalizeText(text)) : normalizeText(text)), [text, liveClean]);

  // Stats
  const stats = React.useMemo(() => {
    const t = displayText;
    const words = countWords(t);
    return {
      words,
      chars: countCharacters(t),
      charsNoSpaces: countCharactersNoSpaces(t),
      sentences: countSentences(t),
      paragraphs: countParagraphs(t),
      lines: countLines(t),
      readTime: formatTimeFromWPM(words, 200),
      speakTime: formatTimeFromWPM(words, 130),
    };
  }, [displayText]);

  const density = React.useMemo(() => computeDensity(displayText, { excludeStopwords }), [displayText, excludeStopwords]);

  /* -------------------------------- Actions -------------------------------- */

  const resetAll = () => {
    setText('');
    setCopied(false);
    setLiveClean(false);
    setExcludeStopwords(true);
  };

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(displayText);
      setCopied(true);
      setTimeout(() => setCopied(false), 900);
    } catch {
      // ignore
    }
  };

  const downloadTxt = () => {
    const blob = new Blob([displayText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'text.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const uploadTxt: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const content = await f.text();
    setText(content);
    e.currentTarget.value = '';
  };

  const pasteFromClipboard = async () => {
    try {
      const s = await navigator.clipboard.readText();
      setText((prev) => (prev ? prev + (prev.endsWith('\n') ? '' : '\n') + s : s));
    } catch {
      // ignore
    }
  };

  // Transforms
  const toUpper = () => setText(displayText.toUpperCase());
  const toLower = () => setText(displayText.toLowerCase());
  const toTitle = () => setText(toTitleCase(displayText));
  const toSlug = () => setText(slugify(displayText));
  const cleanSpaces = () => setText(squeezeSpaces(displayText));

  /* --------------------------------- UI ---------------------------------- */

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 md:p-8">
      <MotionGlassCard>
        {/* Header */}
        <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6">
          <div className="w-1/2">
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <TypeIcon className="h-6 w-6" /> Word Counter
            </h1>
            <p className="text-sm text-muted-foreground">Count words, characters, sentences, paragraphs, and estimate read/speak time. Clean, transform, and export your text.</p>
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
                  <Button onClick={copyAll} className="gap-2">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? 'Copied' : 'Copy'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy current text</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </GlassCard>

        {/* Settings */}
        <GlassCard className="shadow-sm mt-4">
          <CardHeader>
            <CardTitle className="text-base">Settings</CardTitle>
            <CardDescription>Live cleanup & density options.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="mr-3">
                <p className="text-sm font-medium leading-none">Live clean-up</p>
                <p className="text-xs text-muted-foreground">Collapse extra spaces and blank lines automatically.</p>
              </div>
              <Switch checked={liveClean} onCheckedChange={setLiveClean} />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="mr-3">
                <p className="text-sm font-medium leading-none">Exclude stopwords</p>
                <p className="text-xs text-muted-foreground">Ignore common words in keyword density.</p>
              </div>
              <Switch checked={excludeStopwords} onCheckedChange={setExcludeStopwords} />
            </div>
          </CardContent>
        </GlassCard>

        <Separator className="my-6" />

        {/* Editor & Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <GlassCard className="p-5">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Your Text</Label>
              <div className="flex flex-wrap gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2" onClick={pasteFromClipboard}>
                        <Copy className="h-4 w-4" /> Paste
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Paste from clipboard</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <label className="inline-flex">
                  <input type="file" accept=".txt,text/plain" className="hidden" onChange={uploadTxt} />
                  <Button variant="outline" size="sm" className="gap-2">
                    <UploadCloud className="h-4 w-4" /> Import .txt
                  </Button>
                </label>

                <Button size="sm" className="gap-2" onClick={downloadTxt} disabled={!displayText}>
                  <Download className="h-4 w-4" /> Export .txt
                </Button>
              </div>
            </div>

            <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Start typing or paste your text here…" className="mt-2 min-h-[260px] font-mono" />

            {/* Quick transforms */}
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="justify-start gap-2" onClick={toUpper}>
                <AlignLeft className="h-4 w-4" /> UPPERCASE
              </Button>
              <Button variant="outline" className="justify-start gap-2" onClick={toLower}>
                <AlignLeft className="h-4 w-4" /> lowercase
              </Button>
              <Button variant="outline" className="justify-start gap-2" onClick={toTitle}>
                <AlignLeft className="h-4 w-4" /> Title Case
              </Button>
              <Button variant="outline" className="justify-start gap-2" onClick={toSlug}>
                <AlignLeft className="h-4 w-4" /> slugify
              </Button>
              <Button variant="outline" className="justify-start gap-2 sm:col-span-2" onClick={cleanSpaces}>
                <AlignLeft className="h-4 w-4" /> Remove extra spaces & blank lines
              </Button>
            </div>
          </GlassCard>

          {/* Stats */}
          <GlassCard className="p-5">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Statistics</Label>
              <Badge variant="secondary" className="gap-1">
                <Info className="h-3.5 w-3.5" />
                Live
              </Badge>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <StatItem icon={<FileText className="h-4 w-4" />} label="Words" value={stats.words.toLocaleString()} />
              <StatItem icon={<TypeIcon className="h-4 w-4" />} label="Characters" value={stats.chars.toLocaleString()} />
              <StatItem icon={<TypeIcon className="h-4 w-4" />} label="Chars (no spaces)" value={stats.charsNoSpaces.toLocaleString()} />
              <StatItem icon={<AlignLeft className="h-4 w-4" />} label="Lines" value={stats.lines.toLocaleString()} />
              <StatItem icon={<AlignLeft className="h-4 w-4" />} label="Sentences" value={stats.sentences.toLocaleString()} />
              <StatItem icon={<AlignLeft className="h-4 w-4" />} label="Paragraphs" value={stats.paragraphs.toLocaleString()} />
              <StatItem icon={<Clock4 className="h-4 w-4" />} label="Read time (200 wpm)" value={stats.readTime} />
              <StatItem icon={<Mic className="h-4 w-4" />} label="Speak time (130 wpm)" value={stats.speakTime} />
            </div>

            {/* Density */}
            <div className="mt-6">
              <div className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4" />
                <Label className="text-sm font-medium">Keyword Density (Top 20)</Label>
              </div>
              {density.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">Type some text to see keyword frequency.</p>
              ) : (
                <div className="mt-3 overflow-x-auto rounded-lg border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
                        <th>Word</th>
                        <th>Count</th>
                        <th>Percent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {density.map((row) => (
                        <tr key={row.word} className="border-t">
                          <td className="px-3 py-1.5 font-mono">{row.word}</td>
                          <td className="px-3 py-1.5">{row.count}</td>
                          <td className="px-3 py-1.5">{row.percent.toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </MotionGlassCard>
    </div>
  );
}

/* ------------------------------ Small Pieces ------------------------------ */

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}
