'use client';

import * as React from 'react';

import { CopyButton, ExportTextButton, ImportFileButton, PasteButton, ResetButton } from '@/components/shared/action-buttons';
import SwitchRow from '@/components/shared/form-fields/switch-row';
import TextareaField from '@/components/shared/form-fields/textarea-field';
import ToolPageHeader from '@/components/shared/tool-page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard } from '@/components/ui/glass-card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { AlignLeft, BarChart2, Clock4, FileText, Info, Mic, Type as TypeIcon } from 'lucide-react';

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

/* Utilities */
function normalizeText(t: string) {
  return t.replace(/\r\n?/g, '\n');
}
function countWords(t: string) {
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

/* Quick Actions */
type Action = {
  key: string;
  label: string;
  run: () => void;
  hotkey?: string;
  span2?: boolean;
};

function QuickTransforms({ toUpper, toLower, toTitle, toSlug, cleanSpaces }: { toUpper: () => void; toLower: () => void; toTitle: () => void; toSlug: () => void; cleanSpaces: () => void }) {
  const actions: Action[] = [
    { key: 'upper', label: 'UPPERCASE', run: toUpper },
    { key: 'lower', label: 'lowercase', run: toLower },
    { key: 'title', label: 'Title Case', run: toTitle },
    { key: 'slug', label: 'slugify', run: toSlug },
    { key: 'clean', label: 'Remove extra spaces & blank lines', run: cleanSpaces, span2: true },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {actions.map((a) => (
        <Button key={a.key} variant="outline" className={cn('justify-start gap-2', a.span2 && 'sm:col-span-2')} onClick={a.run}>
          <AlignLeft className="h-4 w-4" />
          {a.label}
        </Button>
      ))}
    </div>
  );
}

export default function WordCounterClient() {
  const [text, setText] = React.useState<string>('');

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

  /* Actions */
  const resetAll = () => {
    setText('');
    setLiveClean(false);
    setExcludeStopwords(true);
  };

  // Transforms
  const toUpper = () => setText(displayText.toUpperCase());
  const toLower = () => setText(displayText.toLowerCase());
  const toTitle = () => setText(toTitleCase(displayText));
  const toSlug = () => setText(slugify(displayText));
  const cleanSpaces = () => setText(squeezeSpaces(displayText));

  return (
    <>
      {/* Header */}
      <ToolPageHeader
        icon={TypeIcon}
        title="Word Counter"
        description="Count words, characters, sentences, paragraphs, and lines. Get reading/speaking time and keyword density."
        actions={
          <>
            <ResetButton onClick={resetAll} />
            <CopyButton variant="default" getText={() => displayText || ''} />
          </>
        }
      />

      {/* Settings */}
      <GlassCard className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Settings</CardTitle>
          <CardDescription>Live cleanup & density options.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <SwitchRow label="Live clean-up" hint="Collapse extra spaces and blank lines automatically." checked={liveClean} onCheckedChange={setLiveClean} />
          <SwitchRow label="Exclude stopwords" hint="Ignore common words in keyword density." checked={excludeStopwords} onCheckedChange={setExcludeStopwords} />
        </CardContent>
      </GlassCard>

      <Separator />

      {/* Editor & Stats */}
      <section className="grid gap-4 md:grid-cols-2">
        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Your Text</Label>
            <div className="flex flex-wrap gap-2">
              <PasteButton variant="outline" size="sm" className="gap-2" label="Paste" pastedLabel="Pasted" smartNewline getExisting={() => text} setValue={setText} />

              <ImportFileButton
                accept=".txt,text/plain"
                variant="outline"
                size="sm"
                className="gap-2"
                label="Import"
                onFiles={async (files) => {
                  const f = files?.[0];
                  if (!f) return;
                  const txt = await f.text();
                  setText(txt);
                }}
              />

              <ExportTextButton filename="text.txt" getText={() => displayText} label="Export" size="sm" disabled={!displayText} />
            </div>
          </div>

          <TextareaField value={text} onValueChange={setText} placeholder="Start typing or paste your text here…" textareaClassName="min-h-[260px]" />

          {/* Quick transforms (grid with hotkeys) */}
          <QuickTransforms toUpper={toUpper} toLower={toLower} toTitle={toTitle} toSlug={toSlug} cleanSpaces={cleanSpaces} />
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
        </GlassCard>
      </section>

      {/* Density table */}
      <section>
        <GlassCard className="p-5">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            <Label className="text-sm font-medium">Keyword Density (Top 20)</Label>
          </div>
          {density.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">Type some text to see keyword frequency.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
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
        </GlassCard>
      </section>
    </>
  );
}

/* Subparts */
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
